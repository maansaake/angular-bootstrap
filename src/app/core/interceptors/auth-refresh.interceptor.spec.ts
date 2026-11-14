import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let refreshSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    refreshSession = vi.fn(() => of(true));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { refreshSession } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  const unauthorized = { status: 401, statusText: 'Unauthorized' };

  it('refreshes the session once and retries a request that got 401', async () => {
    const response = firstValueFrom(http.get('/api/me'));
    backend.expectOne('/api/me').flush(null, unauthorized);
    backend.expectOne('/api/me').flush({ name: 'alice' });

    expect(await response).toEqual({ name: 'alice' });
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it('passes the 401 on when the refresh fails', async () => {
    refreshSession.mockReturnValue(of(false));
    const response = firstValueFrom(http.get('/api/me'));
    backend.expectOne('/api/me').flush(null, unauthorized);

    await expect(response).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it.each(['/api/org/login', '/api/org/refresh'])('never retries %s', async (url) => {
    const response = firstValueFrom(http.post(url, {}));
    backend.expectOne(url).flush(null, unauthorized);

    await expect(response).rejects.toMatchObject({ status: 401 });
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('passes other errors straight through', async () => {
    const response = firstValueFrom(http.get('/api/me'));
    backend.expectOne('/api/me').flush(null, { status: 500, statusText: 'Server Error' });

    await expect(response).rejects.toMatchObject({ status: 500 });
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
