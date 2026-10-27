import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { kerberosMockInterceptor } from './kerberos-mock';

/** True when the call rejects — the mock's failure paths complete the flow under test. */
async function rejects(call: () => Promise<unknown>): Promise<boolean> {
  try {
    await call();
    return false;
  } catch {
    return true;
  }
}

describe('kerberosMockInterceptor', () => {
  let http: HttpClient;

  const orgBase = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}`;
  const backendBase = environment.backendBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([kerberosMockInterceptor]))],
    });

    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('supports the full registration and authentication flow', async () => {
    // Registration is backend-owned.
    const registered = await firstValueFrom(
      http.post<{ id: number; name: string }>(`${backendBase}/api/register`, {
        username: 'alice',
        password: 'correct horse',
      }),
    );
    expect(registered.name).toBe('alice');

    // Wrong password fails like Kerberos would.
    expect(
      await rejects(() =>
        firstValueFrom(
          http.post(`${orgBase}/login`, {
            username: 'alice',
            password: 'wrong',
          }),
        ),
      ),
    ).toBe(true);

    // A successful login opens the in-memory session...
    await firstValueFrom(
      http.post(`${orgBase}/login`, {
        username: 'alice',
        password: 'correct horse',
      }),
    );

    // ...which GetMe reports back.
    const me = await firstValueFrom(http.get<{ id: number; name: string }>(`${orgBase}/users/me`));
    expect(me.name).toBe('alice');

    // Password change requires the current one.
    expect(
      await rejects(() =>
        firstValueFrom(
          http.put(`${orgBase}/users/${me.id}/password`, {
            oldPassword: 'incorrect',
            password: 'battery staple',
          }),
        ),
      ),
    ).toBe(true);
    await firstValueFrom(
      http.put(`${orgBase}/users/${me.id}/password`, {
        oldPassword: 'correct horse',
        password: 'battery staple',
      }),
    );

    // Log out closes the session.
    await firstValueFrom(http.post(`${orgBase}/logout`, {}));
    expect(await rejects(() => firstValueFrom(http.get(`${orgBase}/users/me`)))).toBe(true);
  });

  it('rejects a second registration of the same username', async () => {
    await firstValueFrom(
      http.post(`${backendBase}/api/register`, {
        username: 'bob',
        password: 'correct horse',
      }),
    );

    expect(
      await rejects(() =>
        firstValueFrom(
          http.post(`${backendBase}/api/register`, {
            username: 'bob',
            password: 'correct horse',
          }),
        ),
      ),
    ).toBe(true);
  });
});
