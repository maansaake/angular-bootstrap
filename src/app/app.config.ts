import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { provideMockBackend } from './mocks/kerberos-mock';
import { provideApi } from './services/auth-basic';
import { AuthService } from './services/auth.service';
import { provideApi as provideBackendApi } from './services/backend';
import { ThemeService } from './services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([authRefreshInterceptor])),
    provideApi({ basePath: environment.krbBaseUrl, withCredentials: true }),
    provideBackendApi({ basePath: environment.backendBaseUrl, withCredentials: true }),
    provideAppInitializer(() => {
      // index.html loads Material Symbols rather than the legacy Material Icons font.
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
      // Apply the saved light/dark preference before the first render.
      inject(ThemeService);
    }),
    // Hydrate the session from the backend (its cookie) on boot.
    provideAppInitializer(() => inject(AuthService).hydrate()),
    // DEMO ONLY: serves /api/* from the browser. Delete this line and src/app/mocks/ to talk
    // to a real Kerberos and backend.
    provideMockBackend(),
  ],
};
