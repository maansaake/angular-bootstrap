import {
  FetchBackend,
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

/**
 * ⚠️ DEMO-ONLY MOCK BACKEND ⚠️
 *
 * Stands in for Kerberos and the application backend so the app runs end-to-end without a
 * server, both under `make serve` and on the GitHub Pages demo. It replaces Angular's
 * `HttpBackend`, so every interceptor still runs exactly as it would against a real server.
 *
 * Implemented endpoints:
 *
 * - `POST   /api/auth/basic/organisations/{orgID}/login|logout|refresh`
 * - `GET    /api/auth/basic/organisations/{orgID}/users/me`
 * - `PUT    /api/auth/basic/organisations/{orgID}/users/{userID}[/password]`
 * - `POST   /api/register`
 * - `DELETE /api/me`
 *
 * State lives in localStorage, passwords included, in plain text. That is fine for a demo
 * and never acceptable anywhere else.
 *
 * To use a real backend: remove `provideMockBackend()` from `app.config.ts` and delete this
 * directory. Nothing else references it.
 */
export function provideMockBackend(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: HttpBackend, useClass: KerberosMockBackend }]);
}

interface MockUser {
  id: number;
  name: string;
  password: string;
}

interface MockState {
  users: MockUser[];
  nextUserId: number;
  currentUserId: number | null;
}

const STORAGE_KEY = 'angular-bootstrap.mock-backend';
const LATENCY_MS = 300;

const orgPath = '/api/auth/basic/organisations/[^/]+';
const loginPath = new RegExp(`^${orgPath}/login$`);
const logoutPath = new RegExp(`^${orgPath}/logout$`);
const refreshPath = new RegExp(`^${orgPath}/refresh$`);
const mePath = new RegExp(`^${orgPath}/users/me$`);
const userPath = new RegExp(`^${orgPath}/users/(\\d+)$`);
const userPasswordPath = new RegExp(`^${orgPath}/users/(\\d+)/password$`);
const registerPath = /^\/api\/register$/;
const deleteMePath = /^\/api\/me$/;

function loadState(): MockState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as MockState;
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { users: [], nextUserId: 1, currentUserId: null };
}

function respond<T>(status: number, body: T | null = null): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body })).pipe(delay(LATENCY_MS));
}

function fail(req: HttpRequest<unknown>, status: number, error: string): Observable<never> {
  return throwError(
    () => new HttpErrorResponse({ status, url: req.url, error: { errors: [error] } }),
  ).pipe(delay(LATENCY_MS));
}

@Injectable()
export class KerberosMockBackend implements HttpBackend {
  private readonly passthrough = inject(FetchBackend);
  private state = loadState();

  constructor() {
    console.warn(
      '[mock backend] Requests to /api/* are served by the in-browser mock. Remove ' +
        'provideMockBackend() from app.config.ts to use a real backend.',
    );
  }

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const path = new URL(req.url, 'http://mock.invalid').pathname;

    if (!path.startsWith('/api/')) {
      return this.passthrough.handle(req);
    }

    const route = `${req.method} ${path}`;
    const userId = (pattern: RegExp) => Number(pattern.exec(path)?.[1]);

    if (req.method === 'POST' && registerPath.test(path)) {
      return this.register(req);
    }
    if (req.method === 'POST' && loginPath.test(path)) {
      return this.login(req);
    }

    // Everything below requires a session.
    const current = this.currentUser();
    if (!current) {
      return fail(req, 401, 'No active session.');
    }

    if (req.method === 'POST' && logoutPath.test(path)) {
      this.save({ currentUserId: null });
      return respond(204);
    }
    if (req.method === 'POST' && refreshPath.test(path)) {
      return respond(204);
    }
    if (req.method === 'GET' && mePath.test(path)) {
      return respond(200, { id: current.id, name: current.name });
    }
    if (req.method === 'PUT' && userPath.test(path)) {
      return this.updateUser(req, current, userId(userPath));
    }
    if (req.method === 'PUT' && userPasswordPath.test(path)) {
      return this.changePassword(req, current, userId(userPasswordPath));
    }
    if (req.method === 'DELETE' && deleteMePath.test(path)) {
      this.save({
        users: this.state.users.filter((user) => user.id !== current.id),
        currentUserId: null,
      });
      return respond(204);
    }

    return fail(req, 404, `No mock for ${route}.`);
  }

  private register(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return fail(req, 400, 'Username and password are required.');
    }
    if (this.findByName(username)) {
      return fail(req, 409, 'Username is already taken.');
    }

    const user: MockUser = { id: this.state.nextUserId, name: username, password };
    this.save({ users: [...this.state.users, user], nextUserId: user.id + 1 });
    return respond(201, { id: user.id, name: user.name });
  }

  private login(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const { username, password } = req.body as { username: string; password: string };
    const user = this.findByName(username);

    if (!user || user.password !== password) {
      return fail(req, 401, 'Invalid username or password.');
    }

    this.save({ currentUserId: user.id });
    return respond(204);
  }

  private updateUser(
    req: HttpRequest<unknown>,
    current: MockUser,
    targetId: number,
  ): Observable<HttpEvent<unknown>> {
    if (current.id !== targetId) {
      return fail(req, 403, 'Users can only update themselves.');
    }

    const { name } = req.body as { name?: string };
    if (!name) {
      return fail(req, 400, 'A username is required.');
    }
    if (name !== current.name && this.findByName(name)) {
      return fail(req, 409, 'Username is already taken.');
    }

    this.replaceUser({ ...current, name });
    return respond(200, { id: current.id, name });
  }

  private changePassword(
    req: HttpRequest<unknown>,
    current: MockUser,
    targetId: number,
  ): Observable<HttpEvent<unknown>> {
    if (current.id !== targetId) {
      return fail(req, 403, 'Users can only update themselves.');
    }

    const { oldPassword, password } = req.body as { oldPassword?: string; password?: string };
    if (!oldPassword || !password) {
      return fail(req, 400, 'Current and new passwords are required.');
    }
    if (oldPassword !== current.password) {
      return fail(req, 400, 'Current password is incorrect.');
    }

    this.replaceUser({ ...current, password });
    return respond(204);
  }

  private currentUser(): MockUser | undefined {
    return this.state.users.find((user) => user.id === this.state.currentUserId);
  }

  private findByName(name: string): MockUser | undefined {
    return this.state.users.find((user) => user.name === name);
  }

  private replaceUser(updated: MockUser): void {
    this.save({
      users: this.state.users.map((user) => (user.id === updated.id ? updated : user)),
    });
  }

  private save(changes: Partial<MockState>): void {
    this.state = { ...this.state, ...changes };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage unavailable: state still lives for this page load.
    }
  }
}
