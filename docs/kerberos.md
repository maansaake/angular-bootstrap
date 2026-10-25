# Kerberos Authentication

This document provides a comprehensive guide to the Kerberos authentication integration in the Angular Bootstrap template.

## Overview

[Kerberos](https://github.com/trebent/kerberos) is a **batteries-included authentication and authorization server** that provides:

- **Multi-organisation support** with complete user isolation
- **Cookie-based session management** (HttpOnly, secure)
- **Role-based access control** via user groups
- **Comprehensive REST API** for user, group, and organisation management
- **Production-ready** authentication infrastructure

The Angular Bootstrap template integrates seamlessly with Kerberos, providing a complete authentication flow out of the box.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐ │
│  │   Angular   │         │  Kerberos   │         │   Backend    │ │
│  │   Client    │         │   Server    │         │   Service    │ │
│  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘ │
│         │                      │                      │          │
│         │  1. Login POST       │                      │          │
│         │  (username/password) │                      │          │
│         │─────────────────────>│                      │          │
│         │                      │                      │          │
│         │  2. Set-Cookie       │                      │          │
│         │  (session=...)       │                      │          │
│         │<─────────────────────│                      │          │
│         │                      │                      │          │
│         │  3. GetMe GET         │                      │          │
│         │  (with cookie)        │                      │          │
│         │─────────────────────>│                      │          │
│         │                      │                      │          │
│         │  4. User Data        │                      │          │
│         │  (User object)        │                      │          │
│         │<─────────────────────│                      │          │
│         │                      │                      │          │
│         │  5. Authenticated    │                      │          │
│         │  Requests            │                      │          │
│         │────────────────────────────────────────────>│          │
│         │                      │                      │          │
│         │  6. Refresh POST      │                      │          │
│         │  (before expiry)      │                      │          │
│         │─────────────────────>│                      │          │
│         │                      │                      │          │
│         │  7. Set-Cookie       │                      │          │
│         │  (new session)        │                      │          │
│         │<─────────────────────│                      │          │
│         │                      │                      │          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Management

### HttpOnly Cookies

**Security Principle**: Session tokens are **never accessible to JavaScript**.

```
Cookie Properties:
├── HttpOnly: true      # Prevents JavaScript access
├── Secure: true        # HTTPS only (in production)
├── SameSite: Strict    # CSRF protection
└── Path: /            # Available site-wide
```

This means:
- ✅ Safe from XSS attacks
- ✅ Automatic browser management
- ❌ Cannot be read/modified by client-side code
- ❌ Cannot be stored in localStorage/sessionStorage

### Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Session States                               │
├─────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  Logged  │    │  Logging │    │  Logged  │    │  Session │ │
│  │   Out    │───>│   In     │───>│   In     │───>│ Expired  │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │               │               │               │        │
│       └───────────────┴───────────────┴───────────────┘        │
│                           │                                        │
│                           ▼                                        │
│                    ┌──────────────┐                                 │
│                    │  Auto-Refresh │                                 │
│                    │   (Every 5m) │                                 │
│                    └──────┬───────┘                                 │
│                           │                                        │
│                    ┌──────▼───────┐                                 │
│                    │ 401 Retry    │                                 │
│                    │ Interceptor  │                                 │
│                    └──────────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Session Refresh

The template implements **proactive session refresh** to prevent session expiry:

```typescript
// auth.service.ts
private static readonly refreshIntervalMs = 5 * 60 * 1000; // 5 minutes

private startSessionRefresher(): void {
  if (this.refreshTimer !== null) {
    return;
  }

  this.refreshTimer = setInterval(
    () => this.refreshSession().subscribe(),
    AuthService.refreshIntervalMs,
  );
}
```

**Flow**:
1. User logs in successfully
2. Session refresher starts automatically
3. Every 5 minutes, a refresh request is sent
4. If refresh succeeds, session continues
5. If refresh fails, session is cleared

### 401 Retry Interceptor

When a session expires between refresh cycles, the **401 retry interceptor** handles it:

```typescript
// auth-refresh.interceptor.ts
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't retry login/refresh requests themselves
      if (error.status === 401 && !isAuthRequest(req)) {
        return inject(AuthService).refreshSession().pipe(
          switchMap((refreshed) => {
            if (refreshed) {
              // Retry original request with new session
              return next(req.clone());
            }
            // Refresh failed, redirect to login
            inject(Router).navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
```

**Behavior**:
1. Any HTTP request returns 401 (Unauthorized)
2. Interceptor attempts to refresh the session
3. If refresh succeeds, original request is retried
4. If refresh fails, user is redirected to login

---

## Organisation Isolation

### Concept

Kerberos provides **organisation-based isolation**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Organisation Isolation                         │
├─────────────────────────────────────────────────────────────┤
│                                                                  │
│  Organisation A (ID: 1)              Organisation B (ID: 2)     │
│  ┌─────────────────────┐          ┌─────────────────────┐    │
│  │ User 1 (ID: 1)       │          │ User 1 (ID: 1)       │    │
│  │ User 2 (ID: 2)       │          │ User 2 (ID: 2)       │    │
│  │ Group: Admins        │          │ Group: Developers    │    │
│  └─────────────────────┘          └─────────────────────┘    │
│           │                                       │              │
│           ▼                                       ▼              │
│  ┌─────────────────────┐          ┌─────────────────────┐    │
│  │ Can access Org A     │          │ Can access Org B     │    │
│  │ resources only       │          │ resources only       │    │
│  └─────────────────────┘          └─────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

All API requests include the organisation ID:

```typescript
// environment.ts
export const environment = {
  orgID: 1,  // Default organisation
  // ...
};
```

**API Endpoints**:
```
POST /api/auth/basic/organisations/{orgID}/login
GET  /api/auth/basic/organisations/{orgID}/users/me
POST /api/auth/basic/organisations/{orgID}/refresh
```

### Organisation Management

**Creating an Organisation**:
```typescript
// Creates organisation and returns with admin credentials
const response = await firstValueFrom(
  this.organisationsService.createOrganisation({
    name: 'My Organisation',
  })
);

// Response includes:
// - organisation: Organisation
// - adminUserId: number
// - adminUsername: string
// - adminPassword: string
```

**Organisation Schema**:
```typescript
interface Organisation {
  id: number;
  name: string;
}
```

---

## User Management

### User Schema

```typescript
interface User {
  id: number;
  name: string;
  groups: Group[];
}

interface Group {
  id: number;
  name: string;
}

interface UserGroups {
  groups: Group[];
}
```

### User Operations

#### Login

```typescript
// AuthService.login()
async login(username: string, password: string): Promise<boolean> {
  try {
    await firstValueFrom(
      this.usersService.login(environment.orgID, { username, password })
    );
    return await this.hydrate();
  } catch {
    return false;
  }
}
```

**Request**:
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**Response**: 204 No Content + Set-Cookie header

#### Logout

```typescript
async logout(): Promise<void> {
  try {
    await firstValueFrom(this.usersService.logout(environment.orgID));
  } finally {
    this.clearSession();
  }
}
```

**Response**: 204 No Content + Set-Cookie header (clears session)

#### Get Current User (GetMe)

```typescript
async hydrate(): Promise<boolean> {
  try {
    const me = await firstValueFrom(
      this.usersService.getMe(environment.orgID)
    );
    this.user.set(me);
    return true;
  } catch {
    this.user.set(null);
    return false;
  }
}
```

**Response**: User object with current user's data

#### Update User

```typescript
async updateUsername(newUsername: string): Promise<boolean> {
  const current = this.user();
  if (!current) {
    return false;
  }

  try {
    const updated = await firstValueFrom(
      this.usersService.updateUser(environment.orgID, current.id, {
        ...current,
        name: newUsername,
      })
    );
    this.user.set(updated);
    return true;
  } catch {
    return false;
  }
}
```

**Request**: User object with updated fields

**Response**: Updated User object

#### Change Password

```typescript
async updatePassword(oldPassword: string, password: string): Promise<boolean> {
  const current = this.user();
  if (!current) {
    return false;
  }

  try {
    await firstValueFrom(
      this.usersService.changePassword(environment.orgID, current.id, {
        oldPassword,
        password,
      })
    );
    return true;
  } catch {
    return false;
  }
}
```

**Request**:
```typescript
interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
}
```

**Response**: 204 No Content

#### Create User

```typescript
// Admin-only operation
const user = await firstValueFrom(
  this.usersService.createUser(environment.orgID, {
    name: 'newuser',
    password: 'securePassword123',
  })
);
```

**Request**:
```typescript
interface CreateUserRequest {
  name: string;      // minLength: 5
  password: string;  // minLength: 10, maxLength: 40
}
```

**Response**: Created User object

### Group Operations

#### Get User Groups

```typescript
const groups = await firstValueFrom(
  this.usersService.getUserGroups(environment.orgID, userId)
);
```

**Response**: UserGroups object

#### Update User Groups

```typescript
const updatedGroups = await firstValueFrom(
  this.usersService.updateUserGroups(environment.orgID, userId, {
    groups: [{ id: 1, name: 'Admins' }],
  })
);
```

**Request**: UserGroups object

**Response**: Updated UserGroups object

---

## Group Management

### Group Schema

```typescript
interface Group {
  id: number;
  name: string;  // minLength: 1
}
```

### Group Operations

#### Create Group

```typescript
const group = await firstValueFrom(
  this.groupsService.createGroup(environment.orgID, {
    name: 'Developers',
  })
);
```

**Request**:
```typescript
interface CreateGroupRequest {
  name: string;
}
```

**Response**: Created Group object

#### List Groups

```typescript
const groups = await firstValueFrom(
  this.groupsService.listGroups(environment.orgID)
);
```

**Response**: Group[]

#### Get Group

```typescript
const group = await firstValueFrom(
  this.groupsService.getGroup(environment.orgID, groupId)
);
```

**Response**: Group object

#### Update Group

```typescript
const updatedGroup = await firstValueFrom(
  this.groupsService.updateGroup(environment.orgID, groupId, {
    name: 'Senior Developers',
  })
);
```

**Request**: Group object

**Response**: Updated Group object

#### Delete Group

```typescript
await firstValueFrom(
  this.groupsService.deleteGroup(environment.orgID, groupId)
);
```

**Response**: 204 No Content

---

## Authentication Service (AuthService)

The `AuthService` is the central point for all authentication operations in the Angular application.

### Service Overview

```typescript
@Service()
export class AuthService {
  // State
  private readonly user = signal<User | null>(null);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  // Public signals
  readonly username = computed(() => this.user()?.name ?? '');
  readonly loggedIn = computed(() => this.user() !== null);

  // Methods
  async hydrate(): Promise<boolean>
  async login(username: string, password: string): Promise<boolean>
  async logout(): Promise<void>
  refreshSession(): Observable<boolean>
  async updateUsername(newUsername: string): Promise<boolean>
  async updatePassword(oldPassword: string, password: string): Promise<boolean>
}
```

### Usage in Components

#### Check Authentication State

```typescript
@Component({
  // ...
})
export class MyComponent {
  private readonly authService = inject(AuthService);

  isLoggedIn = this.authService.loggedIn;
  username = this.authService.username;
}
```

```html
@if (authService.loggedIn()) {
  <p>Welcome, {{ authService.username() }}!</p>
} @else {
  <p>Please log in.</p>
}
```

#### Login

```typescript
async onLogin(username: string, password: string): Promise<void> {
  if (await this.authService.login(username, password)) {
    this.router.navigate(['/profile']);
  } else {
    this.errorMessage = 'Invalid username or password.';
  }
}
```

#### Logout

```typescript
async onLogout(): Promise<void> {
  await this.authService.logout();
  this.router.navigate(['/']);
}
```

### Route Guard

The template includes an `authGuard` to protect routes:

```typescript
// app.routes.ts
import { authGuard } from './services/auth.service';

export const routes: Route[] = [
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
];
```

**Implementation**:
```typescript
// auth.service.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

---

## Error Handling

### API Error Response

All Kerberos API errors follow a consistent format:

```typescript
interface APIErrorResponse {
  errors: string[];  // Array of error messages
}
```

**Example Error Response** (401 Unauthorized):
```json
{
  "errors": ["Invalid username or password."]
}
```

### Error Status Codes

| Status Code | Description | Typical Cause |
|-------------|-------------|---------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid/missing credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Error | Server error |

### Error Handling in Services

```typescript
try {
  await firstValueFrom(
    this.usersService.login(orgID, { username, password })
  );
} catch (error) {
  if (error instanceof HttpErrorResponse) {
    const apiError = error.error as APIErrorResponse;
    console.error('Login failed:', apiError.errors);
  }
  return false;
}
```

---

## Security Considerations

### ✅ Security Features Implemented

1. **HttpOnly Cookies**: Session tokens never exposed to JavaScript
2. **Secure Cookies**: HTTPS-only in production
3. **SameSite Cookies**: CSRF protection
4. **No Client-Side Storage**: No tokens in localStorage/sessionStorage
5. **Automatic Session Refresh**: Prevents session expiry
6. **401 Retry**: Automatic recovery from expired sessions
7. **Organisation Isolation**: Prevents cross-organisation access

### ⚠️ Security Notes

1. **Development Mock**: The mock backend uses in-memory storage. **Remove before production**.
2. **Session Persistence**: Mock backend sessions are lost on page reload. This is intentional for development.
3. **HTTPS**: Ensure HTTPS is configured in production for secure cookie transmission.
4. **CORS**: Configure CORS properly on the Kerberos server to allow requests from your Angular app.

---

## Configuration

### Environment Configuration

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  krbBaseUrl: 'http://localhost:30001',
  backendBaseUrl: 'http://localhost:30002',
  orgID: 1,
};

// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  krbBaseUrl: 'https://auth.yourdomain.com',
  backendBaseUrl: 'https://api.yourdomain.com',
  orgID: 1,
};
```

### Client Configuration

```typescript
// app.config.ts
import { provideApi } from './services/auth-basic';
import { provideApi as provideBackendApi } from './services/backend';

export const appConfig: ApplicationConfig = {
  providers: [
    provideApi({ 
      basePath: environment.krbBaseUrl, 
      withCredentials: true  // Required for cookies
    }),
    provideBackendApi({
      basePath: environment.backendBaseUrl,
      withCredentials: true
    }),
  ],
};
```

---

## Testing Authentication

### Mock Backend (Development)

The template includes a **complete mock backend** for development:

```typescript
// src/app/mocks/kerberos-mock.ts

// Mocked endpoints:
// - POST /api/auth/basic/organisations/{orgID}/login
// - POST /api/auth/basic/organisations/{orgID}/logout
// - POST /api/auth/basic/organisations/{orgID}/refresh
// - GET /api/auth/basic/organisations/{orgID}/users/me
// - PUT /api/auth/basic/organisations/{orgID}/users/{userID}
// - PUT /api/auth/basic/organisations/{orgID}/users/{userID}/password
// - POST /api/register
```

**Important**: The mock backend warns in the console:
```
[mock backend] The Kerberos mock backend is active. Remove src/app/mocks and its 
interceptor registration in app.config.ts before developing against a real backend.
```

### Testing with Mock Backend

1. **Register a user**:
   - Navigate to `/register`
   - Create an account
   - User is stored in memory

2. **Login**:
   - Navigate to `/login`
   - Enter credentials
   - Session is created

3. **Access protected routes**:
   - Navigate to `/profile`
   - Auth guard allows access

### Removing Mock Backend

Before deploying to production:

1. **Delete the mock directory**:
   ```bash
   rm -rf src/app/mocks/
   ```

2. **Update app.config.ts**:
   ```typescript
   // Remove kerberosMockInterceptor from interceptors
   provideHttpClient(
     withInterceptors([authRefreshInterceptor]),  // Remove kerberosMockInterceptor
   ),
   ```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**: Requests blocked by CORS policy

**Solution**: Configure CORS on Kerberos server:
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

#### 2. Session Lost on Page Reload

**Symptom**: User gets logged out on page refresh

**Causes**:
- Mock backend: Expected behavior (in-memory storage)
- Real backend: Session cookie not being sent/received properly

**Solutions**:
- **Mock backend**: This is expected. Use real Kerberos for persistence.
- **Real backend**: Ensure `withCredentials: true` in API configuration

#### 3. 401 Errors on All Requests

**Symptom**: All requests return 401 Unauthorized

**Causes**:
- Session expired
- Invalid/missing cookies
- Wrong organisation ID

**Solutions**:
- Check if user is logged in
- Verify session cookie is present
- Check organisation ID in environment

#### 4. Login Succeeds but User Not Detected

**Symptom**: Login returns 204 but user state doesn't update

**Cause**: `hydrate()` not called after login

**Solution**: Ensure `hydrate()` is called after successful login:
```typescript
async login(username: string, password: string): Promise<boolean> {
  await this.usersService.login(environment.orgID, { username, password });
  return await this.hydrate();  // This updates the user state
}
```

---

## Best Practices

### 1. Always Use AuthService

✅ **Do**: Use `AuthService` for all authentication operations
```typescript
if (this.authService.loggedIn()) {
  // User is authenticated
}
```

❌ **Don't**: Check cookies or session state directly
```typescript
// Avoid
if (document.cookie.includes('session')) {
  // This is unreliable
}
```

### 2. Use Route Guards

✅ **Do**: Protect routes with `authGuard`
```typescript
{
  path: 'protected',
  component: ProtectedComponent,
  canActivate: [authGuard],
}
```

❌ **Don't**: Manually check authentication in components
```typescript
// Avoid
ngOnInit() {
  if (!this.authService.loggedIn()) {
    this.router.navigate(['/login']);
  }
}
```

### 3. Handle Errors Gracefully

✅ **Do**: Provide user-friendly error messages
```typescript
async onLogin() {
  if (!await this.authService.login(username, password)) {
    this.snackBar.open('Invalid username or password.', 'Close');
  }
}
```

❌ **Don't**: Show raw API errors to users
```typescript
// Avoid
catch (error) {
  this.snackBar.open(error.message, 'Close');  // Raw error message
}
```

### 4. Use Signals for Reactive State

✅ **Do**: Use signals for authentication state
```typescript
readonly loggedIn = computed(() => this.user() !== null);
```

❌ **Don't**: Use BehaviorSubject for simple state
```typescript
// Avoid for simple cases
private loggedIn$ = new BehaviorSubject(false);
```

---

## API Reference

### UsersService

| Method | Description | Endpoint |
|--------|-------------|----------|
| `login` | Authenticate user | POST `/organisations/{orgID}/login` |
| `logout` | End session | POST `/organisations/{orgID}/logout` |
| `refresh` | Refresh session | POST `/organisations/{orgID}/refresh` |
| `getMe` | Get current user | GET `/organisations/{orgID}/users/me` |
| `getUser` | Get user by ID | GET `/organisations/{orgID}/users/{userID}` |
| `createUser` | Create new user | POST `/organisations/{orgID}/users` |
| `updateUser` | Update user | PUT `/organisations/{orgID}/users/{userID}` |
| `deleteUser` | Delete user | DELETE `/organisations/{orgID}/users/{userID}` |
| `getUserGroups` | Get user's groups | GET `/organisations/{orgID}/users/{userID}/groups` |
| `updateUserGroups` | Update user's groups | PUT `/organisations/{orgID}/users/{userID}/groups` |
| `changePassword` | Change password | PUT `/organisations/{orgID}/users/{userID}/password` |

### GroupsService

| Method | Description | Endpoint |
|--------|-------------|----------|
| `createGroup` | Create new group | POST `/organisations/{orgID}/groups` |
| `listGroups` | List all groups | GET `/organisations/{orgID}/groups` |
| `getGroup` | Get group by ID | GET `/organisations/{orgID}/groups/{groupID}` |
| `updateGroup` | Update group | PUT `/organisations/{orgID}/groups/{groupID}` |
| `deleteGroup` | Delete group | DELETE `/organisations/{orgID}/groups/{groupID}` |

### OrganisationsService

| Method | Description | Endpoint |
|--------|-------------|----------|
| `createOrganisation` | Create organisation | POST `/organisations` |
| `listOrganisations` | List all organisations | GET `/organisations` |
| `getOrganisation` | Get organisation by ID | GET `/organisations/{orgID}` |
| `updateOrganisation` | Update organisation | PUT `/organisations/{orgID}` |
| `deleteOrganisation` | Delete organisation | DELETE `/organisations/{orgID}` |

---

## Additional Resources

- [Kerberos GitHub](https://github.com/trebent/kerberos)
- [Kerberos Documentation](https://github.com/trebent/kerberos#readme)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.4.html)
- [Angular HTTP Client](https://angular.dev/guide/http)
- [RxJS Documentation](https://rxjs.dev/guide/overview)

---

## Summary

The Kerberos integration in Angular Bootstrap provides:

- ✅ **Production-ready authentication**
- ✅ **Secure session management** (HttpOnly cookies)
- ✅ **Automatic session refresh**
- ✅ **Organisation isolation**
- ✅ **Comprehensive user/group management**
- ✅ **Easy development** with mock backend
- ✅ **Type-safe API clients** via OpenAPI generation

This implementation follows security best practices and provides a solid foundation for any Angular application requiring authentication.
