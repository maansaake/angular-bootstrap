import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { createAuthStub, provideAuthStub } from '../../testing/auth-stub';
import { authGuard, guestGuard } from './auth.guards';

describe('auth guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/profile' } as RouterStateSnapshot;
  const alice = { id: 1, name: 'alice' };

  function run(guard: typeof authGuard, loggedIn: boolean) {
    TestBed.configureTestingModule({
      providers: [provideAuthStub(createAuthStub(loggedIn ? alice : null))],
    });
    return TestBed.runInInjectionContext(() => guard(route, state));
  }

  function serialize(result: unknown): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('authGuard lets signed-in users through', () => {
    expect(run(authGuard, true)).toBe(true);
  });

  it('authGuard sends guests to log in and remembers where they were going', () => {
    expect(serialize(run(authGuard, false))).toBe('/login?returnUrl=%2Fprofile');
  });

  it('guestGuard lets guests through', () => {
    expect(run(guestGuard, false)).toBe(true);
  });

  it('guestGuard sends signed-in users to their profile', () => {
    expect(serialize(run(guestGuard, true))).toBe('/profile');
  });
});
