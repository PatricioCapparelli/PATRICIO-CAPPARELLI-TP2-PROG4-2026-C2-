import { Routes } from '@angular/router';
import { adminGuard, authGuard, publicoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cargando' },
  {
    path: 'cargando',
    loadComponent: () => import('./features/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    canActivate: [publicoGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [publicoGuard],
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/listado/listado').then((m) => m.Listado),
  },
  {
    path: 'publicaciones/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/detalle/detalle').then((m) => m.Detalle),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  {
    path: 'dashboard/usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/dashboard/usuarios/usuarios').then((m) => m.Usuarios),
  },
  {
    path: 'dashboard/estadisticas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/dashboard/estadisticas/estadisticas').then((m) => m.Estadisticas),
  },
  { path: '**', redirectTo: 'cargando' },
];
