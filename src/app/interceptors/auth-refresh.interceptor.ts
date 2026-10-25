import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, exhaustMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Fallback for requests that hit an expired session despite the proactive refresher
 * (e.g. after a long sleep or tab suspension): refresh the session once, then retry.
 * The auth endpoints themselves are never retried.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (req.url.endsWith('/login') || req.url.endsWith('/refresh')) {
        return throwError(() => error);
      }

      const authService = inject(AuthService);

      return authService.refreshSession().pipe(
        exhaustMap((refreshed) =>
          refreshed ? next(req) : throwError(() => error),
        ),
      );
    }),
  );
};
