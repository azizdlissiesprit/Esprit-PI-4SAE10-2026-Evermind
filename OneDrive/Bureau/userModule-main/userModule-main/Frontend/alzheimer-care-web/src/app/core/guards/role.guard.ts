import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppRole, getRoleHomeRoute, normalizeRole } from '../utils/role-routing';

export function roleGuard(allowedRoles: AppRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = normalizeRole(authService.getRole());

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree([getRoleHomeRoute(role)]);
  };
}

export const roleHomeRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  return router.createUrlTree([getRoleHomeRoute(authService.getRole())]);
};
