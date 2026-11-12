import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  let peticion = req.clone({ withCredentials: true });
  if (token) {
    peticion = peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !req.url.includes('/auth/')) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
