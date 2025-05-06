import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegistrationRequest } from '../models/RegistrationRequest';
import { AuthenticationResponse } from '../models/AuthenticationResponse';
import { AuthenticationRequest } from '../models/AuthenticationRequest';
import { ResetPassword } from '../models/ResetPassword';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:8083/auth';

  constructor(private http: HttpClient) {}

  // Enregistrement de l'utilisateur
  register(request: RegistrationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de l\'enregistrement :', error);

        if (error.status === 400 && typeof error.error === 'string' && error.error.includes('email')) {
          return throwError(() => new Error('L\'email que vous avez entré existe déjà.'));
        }

        return throwError(() => new Error('Une erreur s\'est produite pendant l\'inscription.'));
      })
    );
  }

  // Connexion de l'utilisateur et récupération du token d'authentification
  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur de connexion :', error);
        return throwError(() => new Error('Échec de l\'authentification.'));
      })
    );
  }

  // Activer le compte avec un token
  activateAccount(token: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/activate-account?token=${token}`, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("Erreur brute de l'API :", error);
        console.log('error.error:', error.error);
  
        let errorMessage = 'Une erreur s\'est produite.';
  
        if (error.status === 400 || error.status === 403) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (typeof error.error === 'object' && error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Erreur ${error.status}: accès interdit ou invalide.`;
          }
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  

  // Send Reset Password Email
  sendResetPasswordEmail(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/forgot-password?email=${encodeURIComponent(email)}`, {}, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation :', error);

        if (error.status === 400 && typeof error.error === 'string') {
          return throwError(() => new Error(error.error));
        }

        return throwError(() => new Error('Une erreur est survenue pendant l\'envoi de l\'email.'));
      })
    );
  }
  resetPassword(payload: { token: string, newPassword: string, confirmPassword: string }): Observable<string> {
    // Ensure the token is not empty
    if (!payload.token) {
      throw new Error('Token is required');
    }

    // Prepare the request body
    const body: ResetPassword = {
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
      token: payload.token // Add the token to the request body
    };

    // Call the API endpoint to reset the password
    return this.http.post('http://localhost:8083/auth/reset-password?token=' + payload.token, body, { responseType: 'text' });


}

  
  
  
  
  
  

  // Stocker le token dans le localStorage après la connexion
  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Récupérer le token stocké
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Supprimer le token du localStorage (déconnexion)
  logout(): void {
    localStorage.removeItem('authToken');
  }
}
