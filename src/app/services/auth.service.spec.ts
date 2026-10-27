import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { provideApi } from './auth-basic';
import { AuthService } from './auth.service';
import { provideApi as provideBackendApi } from './backend';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const org = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}`;
  const meUrl = `${org}/users/me`;
  const alice = { id: 7, name: 'alice' };

  /** Lets an awaited call continue to its next request. */
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

  async function signIn(): Promise<void> {
    const hydrating = service.hydrate();
    httpMock.expectOne(meUrl).flush(alice);
    await hydrating;
  }

  function flushError(url: string, status: number): void {
    httpMock.expectOne(url).flush({ errors: ['nope'] }, { status, statusText: 'Error' });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi(environment.krbBaseUrl),
        provideBackendApi(environment.backendBaseUrl),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    httpMock.verify();
    // Stop the session refresher.
    const loggingOut = service.logout();
    httpMock.match(`${org}/logout`).forEach((request) => request.flush(null));
    await loggingOut;
  });

  it('hydrates the session from GetMe', async () => {
    await signIn();

    expect(service.loggedIn()).toBe(true);
    expect(service.username()).toBe('alice');
  });

  it('reports no session when GetMe rejects', async () => {
    const hydrating = service.hydrate();
    flushError(meUrl, 401);

    expect(await hydrating).toBe(false);
    expect(service.loggedIn()).toBe(false);
  });

  it('logs in against Kerberos and hydrates the user', async () => {
    const loggingIn = service.login('alice', 'correct horse battery');

    const login = httpMock.expectOne(`${org}/login`);
    expect(login.request.body).toEqual({ username: 'alice', password: 'correct horse battery' });
    login.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    httpMock.expectOne(meUrl).flush(alice);

    expect(await loggingIn).toEqual({ ok: true });
    expect(service.username()).toBe('alice');
  });

  it('maps a rejected login to "unauthorized"', async () => {
    const loggingIn = service.login('alice', 'wrong');
    flushError(`${org}/login`, 401);

    expect(await loggingIn).toEqual({ ok: false, reason: 'unauthorized' });
    expect(service.loggedIn()).toBe(false);
  });

  it.each([
    [409, 'conflict'],
    [429, 'rate-limited'],
    [500, 'unknown'],
  ])('maps a %i registration response to "%s"', async (status, reason) => {
    const registering = service.register('alice', 'correct horse battery');
    flushError(`${environment.backendBaseUrl}/api/register`, status);

    expect(await registering).toEqual({ ok: false, reason });
  });

  it('registers through the app backend', async () => {
    const registering = service.register('alice', 'correct horse battery');

    const request = httpMock.expectOne(`${environment.backendBaseUrl}/api/register`);
    expect(request.request.method).toBe('POST');
    request.flush(alice, { status: 201, statusText: 'Created' });

    expect(await registering).toEqual({ ok: true });
  });

  it('updates the username and the signals derived from it', async () => {
    await signIn();

    const updating = service.updateUsername('alice2');
    const request = httpMock.expectOne(`${org}/users/7`);
    expect(request.request.body).toEqual({ id: 7, name: 'alice2' });
    request.flush({ id: 7, name: 'alice2' });

    expect(await updating).toEqual({ ok: true });
    expect(service.username()).toBe('alice2');
  });

  it('maps a wrong current password to "invalid"', async () => {
    await signIn();

    const updating = service.updatePassword('wrong', 'battery staple horse');
    flushError(`${org}/users/7/password`, 400);

    expect(await updating).toEqual({ ok: false, reason: 'invalid' });
  });

  it('records when the session was refreshed', async () => {
    await signIn();
    const refreshed = new Promise((resolve) => service.refreshSession().subscribe(resolve));
    httpMock.expectOne(`${org}/refresh`).flush(null);

    expect(await refreshed).toBe(true);
    expect(service.lastRefreshedAt()).toBeInstanceOf(Date);
  });

  it('clears the session when a refresh fails', async () => {
    await signIn();
    const refreshed = new Promise((resolve) => service.refreshSession().subscribe(resolve));
    flushError(`${org}/refresh`, 401);

    expect(await refreshed).toBe(false);
    expect(service.loggedIn()).toBe(false);
  });

  it('deletes the account through the app backend and ends the session', async () => {
    await signIn();

    const deleting = service.deleteAccount();
    const request = httpMock.expectOne(`${environment.backendBaseUrl}/api/me`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(await deleting).toEqual({ ok: true });
    expect(service.loggedIn()).toBe(false);
  });

  it('logs out and clears the session even if the request fails', async () => {
    await signIn();

    const loggingOut = service.logout();
    flushError(`${org}/logout`, 500);
    await loggingOut;

    expect(service.loggedIn()).toBe(false);
    expect(service.username()).toBe('');
  });
});
