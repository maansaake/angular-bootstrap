import { computed, Provider, signal } from '@angular/core';
import { of } from 'rxjs';

import { User } from '../app/services/auth-basic';
import { AuthResult, AuthService } from '../app/services/auth.service';

const ok: AuthResult = { ok: true };

/** A controllable stand-in for AuthService, so page specs don't need HTTP. */
export function createAuthStub(initialUser: User | null = null) {
  const user = signal(initialUser);

  return {
    orgId: 1,
    user: user.asReadonly(),
    username: computed(() => user()?.name ?? ''),
    loggedIn: computed(() => user() !== null),
    lastRefreshedAt: signal<Date | null>(null).asReadonly(),
    setUser: (next: User | null) => user.set(next),
    login: vi.fn(async (): Promise<AuthResult> => ok),
    register: vi.fn(async (): Promise<AuthResult> => ok),
    logout: vi.fn(async () => user.set(null)),
    updateUsername: vi.fn(async (): Promise<AuthResult> => ok),
    updatePassword: vi.fn(async (): Promise<AuthResult> => ok),
    deleteAccount: vi.fn(async (): Promise<AuthResult> => ok),
    refreshSession: vi.fn(() => of(true)),
  };
}

export type AuthStub = ReturnType<typeof createAuthStub>;

export function provideAuthStub(stub: AuthStub): Provider {
  return { provide: AuthService, useValue: stub };
}
