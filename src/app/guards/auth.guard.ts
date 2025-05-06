import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

// Création du guard avec fonction
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Rediriger l'utilisateur vers la page de login s'il n'est pas authentifié
    return router.createUrlTree(['/login']);
  }
};
