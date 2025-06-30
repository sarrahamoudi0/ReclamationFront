import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './service/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('=== INTERCEPTEUR ===');
    console.log('URL interceptée:', req.url);
    console.log('Méthode:', req.method);
    console.log('URL complète:', req.urlWithParams);
    
    // Exclure les requêtes vers /auth/login et /auth/register, mais PAS logout
    const publicUrls = ['/auth/register', '/auth/authenticate', '/auth/activate-account', '/auth/forgot-password', '/auth/reset-password'];
    const isPublic = publicUrls.some(url => req.url.includes(url));

    console.log('Est-ce une URL publique?', isPublic);
    console.log('URLs publiques:', publicUrls);
    console.log('URL contient logout?', req.url.includes('logout'));

    if (isPublic) {
      console.log('URL publique, pas de token ajouté');
      return next.handle(req); // Ne pas ajouter le token
    }

    const token = this.authService.getToken();
    console.log('Token trouvé:', token ? 'OUI' : 'NON');

    if (token) {
      console.log('Ajout du token Bearer à la requête');
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    console.log('Pas de token, requête envoyée sans authentification');
    return next.handle(req);
  }
}
