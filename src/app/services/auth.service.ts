import { computed, inject, Service, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { User, UsersService } from './auth-basic';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * Session state on top of the generated Kerberos client.
 *
 * All authentication is delegated to the backend: the session lives in an HttpOnly cookie
 * set by Kerberos, and this service only derives its signals from the API (`GetMe`).
 * It never stores credentials or session state client-side.
 */
@Service()
export class AuthService {
  /** How often the session is refreshed to keep its cookie from expiring. */
  private static readonly refreshIntervalMs = 5 * 60 * 1000;

  private readonly usersService = inject(UsersService);

  private readonly user = signal<User | null>(null);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly username = computed(() => this.user()?.name ?? '');
  readonly loggedIn = computed(() => this.user() !== null);

  /** Hydrates the session from the backend. Called by the app initializer on boot. */
  async hydrate(): Promise<boolean> {
    try {
      const me = await firstValueFrom(
        this.usersService.getMe(environment.orgID),
      );
      this.user.set(me);
    } catch {
      this.user.set(null);
      return false;
    }

    this.startSessionRefresher();

    return true;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.usersService.login(environment.orgID, { username, password }),
      );
    } catch {
      return false;
    }

    if (!(await this.hydrate())) {
      return false;
    }

    this.startSessionRefresher();

    return true;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.usersService.logout(environment.orgID));
    } finally {
      this.clearSession();
    }
  }

  /**
   * Refreshes the session once. Used by the proactive refresher and by the 401-retry
   * interceptor; a failed refresh means the session is gone, so it is cleared.
   */
  refreshSession(): Observable<boolean> {
    return this.usersService.refresh(environment.orgID).pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  async updateUsername(newUsername: string): Promise<boolean> {
    const current = this.user();
    if (!current) {
      return false;
    }

    try {
      const updated = await firstValueFrom(
        this.usersService.updateUser(environment.orgID, current.id, {
          ...current,
          name: newUsername,
        }),
      );
      this.user.set(updated);
      return true;
    } catch {
      return false;
    }
  }

  async updatePassword(oldPassword: string, password: string): Promise<boolean> {
    const current = this.user();
    if (!current) {
      return false;
    }

    try {
      await firstValueFrom(
        this.usersService.changePassword(environment.orgID, current.id, {
          oldPassword,
          password,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  private startSessionRefresher(): void {
    if (this.refreshTimer !== null) {
      return;
    }

    this.refreshTimer = setInterval(
      () => this.refreshSession().subscribe(),
      AuthService.refreshIntervalMs,
    );
  }

  private stopSessionRefresher(): void {
    if (this.refreshTimer === null) {
      return;
    }

    clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  private clearSession(): void {
    this.stopSessionRefresher();
    this.user.set(null);
  }
}
