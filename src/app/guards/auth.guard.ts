import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { UserRole } from '../models/role';  

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // If route has role restrictions
  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = authService.getRoles();
    console.log('User roles:', userRoles);
    
    // Normalize the roles (strip "ROLE_" prefix)
    const normalizedUserRoles = userRoles.map(role => role.replace('ROLE_', ''));

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some(role => normalizedUserRoles.includes(role));
    if (!hasRequiredRole) {
      return router.createUrlTree(['/access-denied']);
    }
  }

  // No role restrictions or user has correct role
  return true;
};
