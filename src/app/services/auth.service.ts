import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User, UsersService } from './auth-basic';
import { AccountService, RegistrationService } from './backend';

/** Why an auth call failed, mapped from the HTTP status so the UI can say something useful. */
export type AuthFailure = 'invalid' | 'unauthorized' | 'conflict' | 'rate-limited' | 'unknown';

export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

const success: AuthResult = { ok: true };

function failure(error: unknown): AuthResult {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  const reasons: Record<number, AuthFailure> = {
    400: 'invalid',
    401: 'unauthorized',
    409: 'conflict',
    429: 'rate-limited',
  };
  return { ok: false, reason: reasons[status] ?? 'unknown' };
}

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
  static readonly refreshIntervalMs = 5 * 60 * 1000;

  /** The Kerberos organisation every request is scoped to. */
  readonly orgId = environment.orgID;

  private readonly usersService = inject(UsersService);
  private readonly registrationService = inject(RegistrationService);
  private readonly accountService = inject(AccountService);

  private readonly currentUser = signal<User | null>(null);
  private readonly lastRefresh = signal<Date | null>(null);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly user = this.currentUser.asReadonly();
  readonly username = computed(() => this.currentUser()?.name ?? '');
  readonly loggedIn = computed(() => this.currentUser() !== null);
  /** When the session cookie was last refreshed by this tab, if ever. */
  readonly lastRefreshedAt = this.lastRefresh.asReadonly();

  /** Hydrates the session from the backend. Called by the app initializer on boot. */
  async hydrate(): Promise<boolean> {
    try {
      this.currentUser.set(await firstValueFrom(this.usersService.getMe(this.orgId)));
    } catch {
      this.clearSession();
      return false;
    }

    this.startSessionRefresher();
    return true;
  }

  /**
   * Creates an account through the application backend, which proxies to Kerberos with its
   * hidden admin account (see `openapi/backend.yaml`).
   */
  async register(username: string, password: string): Promise<AuthResult> {
    try {
      await firstValueFrom(this.registrationService.register({ username, password }));
      return success;
    } catch (error) {
      return failure(error);
    }
  }

  async login(username: string, password: string): Promise<AuthResult> {
    try {
      await firstValueFrom(this.usersService.login(this.orgId, { username, password }));
    } catch (error) {
      return failure(error);
    }

    return (await this.hydrate()) ? success : { ok: false, reason: 'unknown' };
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.usersService.logout(this.orgId));
    } catch {
      // The session is gone either way.
    } finally {
      this.clearSession();
    }
  }

  /**
   * Refreshes the session once. Used by the proactive refresher and by the 401-retry
   * interceptor; a failed refresh means the session is gone, so it is cleared.
   */
  refreshSession(): Observable<boolean> {
    return this.usersService.refresh(this.orgId).pipe(
      tap(() => this.lastRefresh.set(new Date())),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  async updateUsername(name: string): Promise<AuthResult> {
    const current = this.currentUser();
    if (!current) {
      return { ok: false, reason: 'unauthorized' };
    }

    try {
      const updated = await firstValueFrom(
        this.usersService.updateUser(this.orgId, current.id, { ...current, name }),
      );
      this.currentUser.set(updated);
      return success;
    } catch (error) {
      return failure(error);
    }
  }

  async updatePassword(oldPassword: string, password: string): Promise<AuthResult> {
    const current = this.currentUser();
    if (!current) {
      return { ok: false, reason: 'unauthorized' };
    }

    try {
      await firstValueFrom(
        this.usersService.changePassword(this.orgId, current.id, { oldPassword, password }),
      );
      return success;
    } catch (error) {
      return failure(error);
    }
  }

  /** Deletes the account through the application backend and ends the session. */
  async deleteAccount(): Promise<AuthResult> {
    try {
      await firstValueFrom(this.accountService.deleteMe());
    } catch (error) {
      return failure(error);
    }

    this.clearSession();
    return success;
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

  private clearSession(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.currentUser.set(null);
    this.lastRefresh.set(null);
  }
}
