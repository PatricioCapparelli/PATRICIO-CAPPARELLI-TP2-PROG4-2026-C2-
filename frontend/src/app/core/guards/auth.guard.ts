import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Rutas privadas: si todavía no se validó la sesión con el backend, primero va a /cargando
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.verificada()) {
    return router.createUrlTree(['/cargando'], { queryParams: { destino: state.url } });
  }
  return auth.logueado() ? true : router.createUrlTree(['/login']);
};

// Login y registro: si ya hay una sesión válida, se va directo a publicaciones
export const publicoGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.verificada()) {
    return router.createUrlTree(['/cargando'], { queryParams: { destino: state.url } });
  }
  return auth.logueado() ? router.createUrlTree(['/publicaciones']) : true;
};
