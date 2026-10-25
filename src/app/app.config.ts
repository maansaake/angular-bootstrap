import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { kerberosMockInterceptor } from './mocks/kerberos-mock';
import { provideApi } from './services/auth-basic';
import { provideApi as provideBackendApi } from './services/backend';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      // The mock backend must stay innermost: it terminates the request chain, and the
      // refresh interceptor treats its responses exactly like real backend responses.
      withInterceptors([authRefreshInterceptor, kerberosMockInterceptor]),
    ),
    provideApi({ basePath: environment.krbBaseUrl, withCredentials: true }),
    provideBackendApi({
      basePath: environment.backendBaseUrl,
      withCredentials: true,
    }),
    // Hydrate the session from the backend (its cookie) on boot.
    provideAppInitializer(() => inject(AuthService).hydrate()),
  ],
};
