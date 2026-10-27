import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Angular Bootstrap',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    title: 'Log in · Angular Bootstrap',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Register · Angular Bootstrap',
    canActivate: [guestGuard],
    loadComponent: () => import('./register/register').then((m) => m.Register),
  },
  {
    path: 'profile',
    title: 'Profile · Angular Bootstrap',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile').then((m) => m.Profile),
  },
  { path: '**', redirectTo: '' },
];
