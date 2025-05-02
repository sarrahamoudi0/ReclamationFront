import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './service/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclure les requêtes vers /auth/login et /auth/register
    const publicUrls = ['/auth/register', '/auth/authenticate', '/auth/activate-account', '/auth/forgot-password', '/auth/reset-password'];
    const isPublic = publicUrls.some(url => req.url.includes(url));

    if (isPublic) {
      return next.handle(req); // Ne pas ajouter le token
    }

    const token = this.authService.getToken();

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
