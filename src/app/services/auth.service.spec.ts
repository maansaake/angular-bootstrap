import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { provideApi } from './auth-basic';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const meUrl = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}/users/me`;
  const loginUrl = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}/login`;
  const logoutUrl = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}/logout`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi(environment.krbBaseUrl),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hydrates the session from GetMe on boot', async () => {
    const hydrating = service.hydrate();

    const request = httpMock.expectOne(meUrl);
    expect(request.request.method).toBe('GET');
    request.flush({ id: 7, name: 'alice' });

    expect(await hydrating).toBe(true);
    expect(service.loggedIn()).toBe(true);
    expect(service.username()).toBe('alice');
  });

  it('reports no session when GetMe rejects', async () => {
    const hydrating = service.hydrate();

    httpMock
      .expectOne(meUrl)
      .flush({ errors: ['No active session.'] }, { status: 401, statusText: 'Unauthorized' });

    expect(await hydrating).toBe(false);
    expect(service.loggedIn()).toBe(false);
  });

  it('logs in against the Kerberos login endpoint and hydrates the user', async () => {
    const loggingIn = service.login('alice', 'correct horse battery');

    const loginRequest = httpMock.expectOne(loginUrl);
    expect(loginRequest.request.method).toBe('POST');
    expect(loginRequest.request.body).toEqual({
      username: 'alice',
      password: 'correct horse battery',
    });
    loginRequest.flush(null, { status: 204, statusText: 'No Content' });

    // Let login() continue into hydrate() once the login promise resolves.
    await new Promise<void>((resolve) => setTimeout(resolve));

    httpMock.expectOne(meUrl).flush({ id: 7, name: 'alice' });

    expect(await loggingIn).toBe(true);
    expect(service.username()).toBe('alice');
  });

  it('rejects a failed login without hydrating', async () => {
    const loggingIn = service.login('alice', 'wrong password');

    httpMock
      .expectOne(loginUrl)
      .flush({ errors: ['Invalid username or password.'] }, { status: 401, statusText: 'Unauthorized' });

    expect(await loggingIn).toBe(false);
    expect(service.loggedIn()).toBe(false);
    httpMock.verify();
  });

  it('logs out and clears the session', async () => {
    const hydrating = service.hydrate();
    httpMock.expectOne(meUrl).flush({ id: 7, name: 'alice' });
    await hydrating;

    const loggingOut = service.logout();

    const logoutRequest = httpMock.expectOne(logoutUrl);
    expect(logoutRequest.request.method).toBe('POST');
    logoutRequest.flush(null, { status: 204, statusText: 'No Content' });

    await loggingOut;
    expect(service.loggedIn()).toBe(false);
    expect(service.username()).toBe('');
  });
});
