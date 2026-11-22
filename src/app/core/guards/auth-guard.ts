import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService);
  return a.sesion() && a.sesion()!.expiraEn > Date.now() ? true : inject(Router).parseUrl('/login');
};
