import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

export const rolesGuard: CanActivateFn = (route) => {
  const a = inject(AuthService);
  return a.puede(route.data['roles'] || []) ? true : inject(Router).parseUrl('/acceso-denegado');
};
