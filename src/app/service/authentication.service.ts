import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegistrationRequest } from '../models/RegistrationRequest';
import { AuthenticationResponse } from '../models/AuthenticationResponse';
import { AuthenticationRequest } from '../models/AuthenticationRequest';
import { ResetPassword } from '../models/ResetPassword';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../models/role'; 
import { User } from '../models/User';
import { AdminCreateUserRequest } from '../models/AdminCreateUser';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:8083/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // Enregistrement de l'utilisateur
// Updated register method to support optional image upload
register(request: RegistrationRequest, imageFile?: File): Observable<void> {
  const formData = new FormData();

  formData.append('user', new Blob([JSON.stringify(request)], { type: 'application/json' }));

  if (imageFile) {
    formData.append('image', imageFile);
  }

  return this.http.post<void>(`${this.apiUrl}/register`, formData).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur lors de l\'enregistrement :', error);

      if (error.status === 400 && typeof error.error === 'string' && error.error.includes('email')) {
        return throwError(() => new Error('L\'email que vous avez entré existe déjà.'));
      }

      return throwError(() => new Error('Une erreur s\'est produite pendant l\'inscription.'));
    })
  );
}



  updateUserRole(userId: string, newRole: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/update-user-role/${userId}`, { role: newRole }, {
    responseType: 'text' as 'json'
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error updating role:', error);
      return throwError(() => new Error('Error occurred while updating the role.'));
    })
  );
}

banOrUnbanUser(userId: string): Observable<any> {
  console.log('Toggle ban pour userId:', userId);
  return this.http.put(`${this.apiUrl}/ban-user/${userId}`, {}, { responseType: 'text' as 'json' });
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

        // Check if the error message is a string from the backend
        if (error.status === 400 && typeof error.error === 'string') {
          return throwError(() => new Error(error.error));
        }

        // Generic error message
        return throwError(() => new Error('Une erreur est survenue pendant l\'envoi de l\'email.'));
      })
    );
  }

  // Reset Password
  resetPassword(payload: { token: string, newPassword: string, confirmPassword: string }): Observable<string> {
    // Ensure the token is not empty
    if (!payload.token) {
      return throwError(() => new Error('Token is required'));
    }

    // Ensure the passwords match
    if (payload.newPassword !== payload.confirmPassword) {
      return throwError(() => new Error('Les mots de passe ne correspondent pas.'));
    }

    // Prepare the request body for resetting password
    const body: ResetPassword = {
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
      token: payload.token
    };

    // Send request to reset password API endpoint
    return this.http.post(`${this.apiUrl}/reset-password?token=${payload.token}`, body, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);

        // Check for different HTTP error codes
        if (error.status === 400 && typeof error.error === 'string') {
          return throwError(() => new Error(error.error));
        }

        // Generic error message
        return throwError(() => new Error('Une erreur est survenue lors de la réinitialisation du mot de passe.'));
      })
    );
  }

  // Store the token in localStorage and extract roles
  storeToken(token: string): void {
    localStorage.setItem('authToken', token);

    // Decode token to extract roles
    const roles = this.extractRolesFromToken(token);
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  // Extract roles from JWT token
  private extractRolesFromToken(token: string): string[] {
    try {
      const decoded: any = jwtDecode(token); // Decode JWT token
      return decoded.authorities || []; // Assuming 'authorities' is where roles are stored
    } catch (error) {
      console.warn('Failed to decode token', error);
      return [];
    }
  }
  

  // Get the token from localStorage
  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    return token && !this.isTokenExpired(token) ? token : null;
  }

  // Check if the token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.exp * 1000) < Date.now(); // Expiration time in milliseconds
    } catch {
      return true;
    }
  }

  // Check if the user has a specific role
  hasRole(role: UserRole): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  // Get roles from localStorage
  getRoles(): UserRole[] {
    const token = this.getToken();
    console.log('Token:', token); // Log the token to verify it's present
  
    if (!token) return [];
  
    const decodedToken = jwtDecode<any>(token);
    console.log('Decoded token:', decodedToken); 
  
    const authorities = decodedToken?.authorities || []; 
    console.log('Authorities:', authorities); 
  
    return authorities.map((authority: string) => authority.replace('ROLE_', '') as UserRole);
  }
  

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('roles'); 
    this.router.navigate(['/login']);
  }
 createUser(request: AdminCreateUserRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/create-user`, request, {
    responseType: 'text' as 'json' 
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      return throwError(() => new Error('Une erreur s\'est produite pendant la création de l\'utilisateur.'));
    })
  );
}


  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        return throwError(() => new Error('Impossible de récupérer la liste des utilisateurs.'));
      })
    );
  
}

updateUser(id: string, userData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/update-user/${id}`, userData);
}

deleteUser(userId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/delete-user/${userId}`, {
    responseType: 'text' as 'json'  // 👈 This prevents JSON parsing error
  });
}







}
