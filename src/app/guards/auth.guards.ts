import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Lets signed-in users through; sends everyone else to log in, then back here. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).loggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps signed-in users off the log in and register pages. */
export const guestGuard: CanActivateFn = () => {
  if (!inject(AuthService).loggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/profile']);
};
