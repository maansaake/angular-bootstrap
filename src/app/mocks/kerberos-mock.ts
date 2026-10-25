import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

/**
 * ⚠️ DEV-ONLY MOCK BACKEND — REMOVE BEFORE DEVELOPING AGAINST A REAL BACKEND ⚠️
 *
 * This interceptor stands in for the Kerberos backend and the application backend so the
 * app runs end-to-end without a server. It implements exactly the endpoints the sample
 * uses, in memory:
 *
 * - `POST /api/auth/basic/organisations/{orgID}/login|logout|refresh`
 * - `GET  /api/auth/basic/organisations/{orgID}/users/me`
 * - `PUT  /api/auth/basic/organisations/{orgID}/users/{userID}[/password]`
 * - `POST /api/register`
 *
 * To move to a real backend: delete this directory and remove the `kerberosMockInterceptor`
 * registration from `app.config.ts`. Nothing else in the app references the mock — app code
 * only ever talks to the OpenAPI-generated clients.
 */
console.warn(
  '[mock backend] The Kerberos mock backend is active. Remove src/app/mocks and its ' +
    'interceptor registration in app.config.ts before developing against a real backend.',
);

interface MockUser {
  id: number;
  name: string;
  password: string;
}

const users = new Map<string, MockUser>();
let nextUserId = 1;

// Stands in for the HttpOnly `session` cookie the real Kerberos backend sets; a page
// reload therefore logs the mock's user out.
let currentUser: MockUser | null = null;

const orgPath = '/api/auth/basic/organisations/[^/]+';
const loginPath = new RegExp(`^${orgPath}/login$`);
const logoutPath = new RegExp(`^${orgPath}/logout$`);
const refreshPath = new RegExp(`^${orgPath}/refresh$`);
const mePath = new RegExp(`^${orgPath}/users/me$`);
const userPath = new RegExp(`^${orgPath}/users/(\\d+)$`);
const userPasswordPath = new RegExp(`^${orgPath}/users/(\\d+)/password$`);
const registerPath = /^\/api\/register$/;

const respond = <T>(status: number, body?: T) =>
  of(new HttpResponse<T>({ status, body })).pipe(delay(300));

const fail = (status: number, ...errors: string[]) =>
  throwError(
    () => new HttpErrorResponse({ status, error: { errors: errors } }),
  );

export const kerberosMockInterceptor: HttpInterceptorFn = (req, next) => {
  const path = new URL(req.url, 'http://mock.invalid').pathname;

  if (!path.startsWith('/api/')) {
    return next(req);
  }

  console.warn(
    `[mock backend] ${req.method} ${path} — served by the mock; remove it before ` +
      'using a real backend.',
  );

  if (req.method === 'POST' && loginPath.test(path)) {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    const user = users.get(username);

    if (!user || user.password !== password) {
      return fail(401, 'Invalid username or password.');
    }

    currentUser = user;
    return respond(204);
  }

  if (req.method === 'POST' && logoutPath.test(path)) {
    if (!currentUser) {
      return fail(401, 'No active session.');
    }

    currentUser = null;
    return respond(204);
  }

  if (req.method === 'POST' && refreshPath.test(path)) {
    if (!currentUser) {
      return fail(401, 'No active session.');
    }

    return respond(204);
  }

  if (req.method === 'GET' && mePath.test(path)) {
    if (!currentUser) {
      return fail(401, 'No active session.');
    }

    return respond(200, { id: currentUser.id, name: currentUser.name });
  }

  let match: RegExpMatchArray | null;

  if (req.method === 'PUT' && (match = userPath.exec(path))) {
    if (!currentUser) {
      return fail(401, 'No active session.');
    }
    if (currentUser.id !== Number(match[1])) {
      return fail(403, 'Users can only update themselves.');
    }

    const { name } = req.body as { name?: string };
    if (!name) {
      return fail(400, 'A username is required.');
    }

    users.delete(currentUser.name);
    currentUser = { ...currentUser, name };
    users.set(name, currentUser);
    return respond(200, { id: currentUser.id, name: currentUser.name });
  }

  if (req.method === 'PUT' && (match = userPasswordPath.exec(path))) {
    if (!currentUser) {
      return fail(401, 'No active session.');
    }
    if (currentUser.id !== Number(match[1])) {
      return fail(403, 'Users can only update themselves.');
    }

    const { oldPassword, password } = req.body as {
      oldPassword?: string;
      password?: string;
    };
    if (!oldPassword || !password) {
      return fail(400, 'Current and new passwords are required.');
    }
    if (oldPassword !== currentUser.password) {
      return fail(400, 'Current password is incorrect.');
    }

    currentUser = { ...currentUser, password };
    return respond(204);
  }

  if (req.method === 'POST' && registerPath.test(path)) {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return fail(400, 'Username and password are required.');
    }
    if (users.has(username)) {
      return fail(409, 'Username is already taken.');
    }

    const user: MockUser = { id: nextUserId++, name: username, password };
    users.set(username, user);
    return respond(201, { id: user.id, name: user.name });
  }

  return next(req);
};
