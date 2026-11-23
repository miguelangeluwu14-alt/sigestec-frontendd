import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.sesion()?.token;
  const r =
    token && req.url.startsWith(environment.apiUrl)
      ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : req;
  return next(r).pipe(
    catchError((e: HttpErrorResponse) => {
      // Un 401 con ruta /error corresponde a un ERROR dispatch del servidor,
      // no necesariamente a un token inválido. No cerrar la sesión en ese caso.
      const errorDispatch = e.error?.ruta === '/error';
      if (e.status === 401 && !errorDispatch && !req.url.endsWith('/auth/login')) auth.salir();
      return throwError(() => e);
    }),
  );
};
