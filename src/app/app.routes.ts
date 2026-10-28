import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Angular Bootstrap',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    title: 'Log in · Angular Bootstrap',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Register · Angular Bootstrap',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'profile',
    title: 'Profile · Angular Bootstrap',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  { path: '**', redirectTo: '' },
];
