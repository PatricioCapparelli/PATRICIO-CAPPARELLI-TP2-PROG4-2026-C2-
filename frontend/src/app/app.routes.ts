import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'publicaciones' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/listado/listado').then((m) => m.Listado),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  { path: '**', redirectTo: 'publicaciones' },
];
