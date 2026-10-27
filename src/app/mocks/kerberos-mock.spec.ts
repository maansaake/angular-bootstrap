import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { provideMockBackend } from './kerberos-mock';

describe('provideMockBackend', () => {
  let http: HttpClient;

  const org = `${environment.krbBaseUrl}/api/auth/basic/organisations/${environment.orgID}`;
  const backend = environment.backendBaseUrl;

  /** Resolves with the HTTP status the request failed with. */
  async function statusOf(request: Observable<unknown>): Promise<number> {
    try {
      await firstValueFrom(request);
      return 200;
    } catch (error) {
      return (error as HttpErrorResponse).status;
    }
  }

  const register = (username: string) =>
    firstValueFrom(
      http.post<{ id: number }>(`${backend}/api/register`, { username, password: 'correct horse' }),
    );
  const login = (username: string, password = 'correct horse') =>
    firstValueFrom(http.post(`${org}/login`, { username, password }));
  const me = () => http.get<{ id: number; name: string }>(`${org}/users/me`);

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideMockBackend()],
    });
    http = TestBed.inject(HttpClient);
  });

  it('supports the full account lifecycle', async () => {
    const { id } = await register('alice');

    expect(await statusOf(http.post(`${org}/login`, { username: 'alice', password: 'x' }))).toBe(
      401,
    );
    await login('alice');
    expect((await firstValueFrom(me())).name).toBe('alice');

    // The password change requires the current password.
    const changePassword = (oldPassword: string) =>
      http.put(`${org}/users/${id}/password`, { oldPassword, password: 'battery staple' });
    expect(await statusOf(changePassword('wrong'))).toBe(400);
    expect(await statusOf(changePassword('correct horse'))).toBe(200);

    await firstValueFrom(http.put(`${org}/users/${id}`, { id, name: 'alice2' }));
    expect((await firstValueFrom(me())).name).toBe('alice2');

    await firstValueFrom(http.post(`${org}/logout`, {}));
    expect(await statusOf(me())).toBe(401);
  });

  it('rejects taken usernames on registration and rename', async () => {
    await register('alice');
    const { id } = await register('bobby');

    expect(
      await statusOf(http.post(`${backend}/api/register`, { username: 'alice', password: 'p' })),
    ).toBe(409);

    await login('bobby');
    expect(await statusOf(http.put(`${org}/users/${id}`, { id, name: 'alice' }))).toBe(409);
  });

  it('deletes the signed-in account and ends the session', async () => {
    await register('alice');
    await login('alice');

    await firstValueFrom(http.delete(`${backend}/api/me`));

    expect(await statusOf(me())).toBe(401);
    expect(
      await statusOf(http.post(`${org}/login`, { username: 'alice', password: 'correct horse' })),
    ).toBe(401);
  });

  it('persists state across reloads', async () => {
    await register('alice');
    await login('alice');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideMockBackend()] });
    http = TestBed.inject(HttpClient);

    expect((await firstValueFrom(me())).name).toBe('alice');
  });
});
