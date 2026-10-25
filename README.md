# Angular Bootstrap

[![Main branch protection](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml)
[![Code scanning](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml)

A **reference template repository** for starting new Angular applications. This opinionated bootstrap provides production-ready patterns, authentication flows, design system integration, and tooling configurations that every Angular project needs.

---

## \ud83c\udf81 Quick Start

```bash
# Clone the template
git clone https://github.com/maansaake/angular-bootstrap.git
cd angular-bootstrap

# Install dependencies
npm install

# Start development server
npm start

# Run all checks
npm run lint && npm test

# Generate API clients from OpenAPI specs
npm run codegen
```

The app runs at `http://localhost:4200` with a **mock backend** that simulates Kerberos authentication. No external services required for development!

---

## \ud83c\udfa8 Included Boilerplate

### 1. \ud83d\udc64 **Angular 22 (Standalone-First)**
- **No NgModules**: Components import only the standalone directives they use
- **Signals-based state**: Services use `signal()` and `computed()` for reactive state
- **Modern control flow**: Uses `@if`, `@for`, `@switch` template syntax
- **Dependency injection**: Uses `inject()` and `@Service()` decorator
- **ESBuild development server**: Fast, modern build system

### 2. \ud83c\udf08 **Angular Material (Material 3)**
- Complete Material Design v3 theming implementation
- Token-driven styling using `--mat-sys-*` CSS custom properties
- Dark mode support via `color-scheme: light dark`
- Comprehensive form controls with validation
- Overlay components (dialogs, snackbar, tooltips)
- Responsive layout patterns

**Theme Configuration**: See `src/styles.scss` for the central theme definition using `mat.theme()` with magenta primary and violet tertiary palettes.

### 3. \ud83d\udc86 **ESLint Configuration**
- **angular-eslint**: Angular-specific linting rules
- **TypeScript ESLint**: Modern TypeScript linting
- **Prettier integration**: Opinionated code formatting
- **EditorConfig**: Consistent editor settings

**Configuration Files**:
- `eslint.config.js` - Main ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `.editorconfig` - Editor settings

**Key Rules Enforced**:
```typescript
// [32m[1mDO [0m- Use standalone components
@Component({
  imports: [MatButton, ReactiveFormsModule],
  standalone: true, // Default in Angular 22
})

// [31m[1mDON'T [0m- Use NgModules
@NgModule({ ... }) // Avoid

// [32m[1mDO [0m- Use signals for state
const count = signal(0);
const double = computed(() => count() * 2);

// [31m[1mDON'T [0m- Use BehaviorSubject for simple state
private count$ = new BehaviorSubject(0); // Avoid for simple cases
```

### 4. \ud83d\udc10 **User Management System**
- **Registration**: User signup with validation
- **Login/Logout**: Session management
- **Profile Management**: Update username and password
- **Session Persistence**: Automatic token refresh
- **Route Guards**: Protected routes for authenticated users

**Authentication Flow**:
```
Login [34m-->[0m Kerberos Backend [34m-->[0m HttpOnly Cookie [34m-->[0m Session State [34m-->[0m AuthService Signals
```

### 5. \ud83d\udc63 **OpenAPI Code Generation**

Generates **type-safe Angular API clients** from OpenAPI specifications.

**Supported Specifications**:
- `openapi/auth_basic.yaml` - [Kerberos](https://github.com/trebent/kerberos) authentication API
- `openapi/backend.yaml` - Application-specific backend API

**Generated Clients**:
- `src/app/services/auth-basic/` - Kerberos client (login, logout, refresh, user management)
- `src/app/services/backend/` - Backend client (registration, custom endpoints)

**Code Generation Command**:
```bash
npm run codegen
# Or individually
npx @openapitools/openapi-generator-cli generate \
  -g typescript-angular \
  -i openapi/auth_basic.yaml \
  -o src/app/services/auth-basic

npx @openapitools/openapi-generator-cli generate \
  -g typescript-angular \
  -i openapi/backend.yaml \
  -o src/app/services/backend
```

**Generator Configuration**: See `openapitools.json` for version and settings.

### 6. \ud83c\udf03 **Mock Backend for Development**

A complete in-memory implementation of Kerberos and backend endpoints for development without external dependencies.

**Mocked Endpoints**:
- `POST /api/auth/basic/organisations/{orgID}/login`
- `POST /api/auth/basic/organisations/{orgID}/logout`
- `POST /api/auth/basic/organisations/{orgID}/refresh`
- `GET /api/auth/basic/organisations/{orgID}/users/me`
- `PUT /api/auth/basic/organisations/{orgID}/users/{userID}`
- `PUT /api/auth/basic/organisations/{orgID}/users/{userID}/password`
- `POST /api/register`

**Important**: Remove `src/app/mocks/` directory and its interceptor registration in `app.config.ts` before deploying to production.

### 7. \ud83d\udcbb **GitHub Actions CI/CD**

Complete CI/CD pipeline with:
- **Build verification** on PRs and main branch
- **Test execution** with coverage
- **Lint checking**
- **Code scanning** for security vulnerabilities
- **Dependabot** for dependency updates
- **Auto-merge** for approved PRs

**Workflow Files**:
- `.github/workflows/main.yaml` - Main branch protection
- `.github/workflows/pull-request.yaml` - PR validation
- `.github/workflows/code-scanning.yaml` - Security scanning

---

## \ud83c\udf93 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Angular Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Components  │  │   Services    │  │    OpenAPI Clients    │ │
│  │  (Standalone) │  │  (@Service)   │  │   (Generated Code)    │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
│           │                   │                     │             │
│           ▼                   ▼                     ▼             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Angular Material                        │ │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐  │ │
│  │  │  Components │  │   Theming  │  │   Form Controls    │  │ │
│  │  │   (M3)      │  │ (Tokens)    │  │   (Reactive)       │  │ │
│  │  └────────────┘  └────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐      ┌────────────────────────────┐ │
│  │   Auth Interceptor   │      │      Mock Backend (Dev)      │ │
│  │   (Refresh Retry)    │      │   Kerberos + Backend APIs    │ │
│  └─────────────────────┘      └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐           ┌──────────────┐                  │
│  │   Kerberos   │           │  Backend API  │                  │
│  │  (Auth)      │           │  (Business)   │                  │
│  └──────────────┘           └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## \ud83d\udc80 Kerberos Authentication

[Kerberos](https://github.com/trebent/kerberos) is a **batteries-included authentication and authorization server** that provides:

- **Multi-organisation support** with user isolation
- **Cookie-based sessions** (HttpOnly, secure)
- **Role-based access control** via groups
- **Comprehensive REST API** for user management

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │  Kerberos   │     │   Backend    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. Login POST    │                   │
       │  (username/pass)  │                   │
       │──────────────────>│                   │
       │                   │                   │
       │  2. Set-Cookie    │                   │
       │  (session)        │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  3. GetMe GET     │                   │
       │  (with cookie)    │                   │
       │──────────────────>│                   │
       │                   │                   │
       │  4. User Data     │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  5. Authenticated │                   │
       │  Requests         │                   │
       │─────────────────────────────────────>│
       │                   │                   │
```

### Session Management

**Key Features**:
- **HttpOnly Cookies**: Session tokens are never accessible to JavaScript
- **Automatic Refresh**: Background refresh every 5 minutes
- **401 Retry**: Automatic token refresh on unauthorized responses
- **No Client-Side Storage**: Zero credentials stored in localStorage/sessionStorage

**Session Service** (`AuthService`):
```typescript
@Service()
export class AuthService {
  // Reactive state
  readonly user = signal<User | null>(null);
  readonly username = computed(() => this.user()?.name ?? '');
  readonly loggedIn = computed(() => this.user() !== null);

  // Authentication methods
  async login(username: string, password: string): Promise<boolean>
  async logout(): Promise<void>
  async hydrate(): Promise<boolean>  // Called on app boot
  refreshSession(): Observable<boolean>
}
```

### Organisation Isolation

All Kerberos requests are scoped to an organisation:
```typescript
// environment.ts
{
  krbBaseUrl: 'http://localhost:30001',
  orgID: 1  // All requests use this organisation
}
```

**API Endpoints**:
- `POST /api/auth/basic/organisations/{orgID}/login`
- `POST /api/auth/basic/organisations/{orgID}/logout`
- `POST /api/auth/basic/organisations/{orgID}/refresh`
- `GET /api/auth/basic/organisations/{orgID}/users/me`

### User Management

**User Schema**:
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
```

**Available Operations**:
- Create/Read/Update/Delete users
- Manage user groups
- Create/Read/Update/Delete organisations
- Password change with old password verification

---

## \ud83c\udf08 Material Design Implementation

This template implements **Angular Material v22 with Material 3 (M3) design system**.

### Theme Configuration

**Central Theme File**: `src/styles.scss`

```scss
@use '@angular/material' as mat;

// Define the theme
$my-primary: mat.define-palette(mat.$magenta-palette, 500, 100, 900);
$my-accent: mat.define-palette(mat.$violet-palette, 500, 100, 900);
$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    tertiary: $my-accent,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

// Apply the theme
@include mat.theme($my-theme);
@include mat.system-classes($my-theme);

// Enable dark mode support
body {
  color-scheme: light dark;
}
```

### Design Tokens

**Never use hardcoded colors**. Always use Material system tokens:

```scss
// [32m[1mDO [0m- Use system tokens
.my-component {
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  border-color: var(--mat-sys-outline);
}

// [31m[1mDON'T [0m- Use hardcoded colors
.my-component {
  background-color: #ffffff; // Avoid
  color: #333333; // Avoid
}
```

**Available Tokens**:
- `--mat-sys-primary` / `--mat-sys-on-primary`
- `--mat-sys-surface` / `--mat-sys-on-surface`
- `--mat-sys-outline`
- `--mat-sys-error` / `--mat-sys-on-error`
- And many more...

### Component Usage

**Form Controls** (Reactive Forms):
```typescript
@Component({
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatButton,
  ],
})
```

```html
<mat-form-field appearance="outline">
  <mat-label>Username</mat-label>
  <input matInput type="text" formControlName="username" />
  <mat-error *ngIf="username.hasError('required')">
    Username is required
  </mat-error>
</mat-form-field>
```

**Layout Components**:
- `MatToolbar` - Application header
- `MatSidenav` - Navigation drawer
- `MatCard` - Content cards
- `MatDivider` - Visual separators
- `MatList` - Navigation lists

**Overlay Components**:
- `MatDialog` - Modal dialogs
- `MatSnackBar` - Notifications
- `MatTooltip` - Tooltips
- `MatMenu` - Context menus

**Data Display**:
- `MatTable` - Data tables
- `MatPaginator` - Pagination
- `MatSort` - Sorting
- `MatProgressSpinner` - Loading indicators

### Typography

**Font Configuration**:
```scss
@use '@angular/material' as mat;

$typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $headline-1: mat.define-typography-level(32px, 48px, 400),
  $body-1: mat.define-typography-level(16px, 24px, 400),
);
```

**Material Symbols**:
```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />

<!-- Usage -->
<span class="material-symbols-outlined">check_circle</span>
```

---

## \ud83d\udc86 OpenAPI Code Generation

This template uses **[OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)** to create type-safe Angular API clients.

### Configuration

**Generator Version**: `2.41.0` (configured in `openapitools.json`)

**Generator Command**:
```json
{
  "generator-cli": {
    "version": "2.41.0"
  }
}
```

### Available Specifications

#### 1. Kerberos Authentication API (`openapi/auth_basic.yaml`)

**Purpose**: User authentication and management

**Generated Client**: `src/app/services/auth-basic/`

**Key Endpoints**:
```typescript
// UsersService
login(orgID: number, loginRequest: LoginRequest)
logout(orgID: number)
refresh(orgID: number)
getMe(orgID: number)
updateUser(orgID: number, userID: number, user: User)
changePassword(orgID: number, userID: number, changePasswordRequest: ChangePasswordRequest)

// GroupsService
createGroup(orgID: number, createGroupRequest: CreateGroupRequest)
listGroups(orgID: number)

// OrganisationsService
createOrganisation(createOrganisationRequest: CreateOrganisationRequest)
listOrganisations()
```

#### 2. Backend API (`openapi/backend.yaml`)

**Purpose**: Application-specific endpoints

**Generated Client**: `src/app/services/backend/`

**Current Endpoints**:
```typescript
// RegistrationService
register(registerRequest: RegisterRequest)
```

### Code Generation Process

1. **Edit OpenAPI specs** in the `openapi/` directory
2. **Run codegen**:
   ```bash
   npm run codegen
   # Or for individual specs
   npx @openapitools/openapi-generator-cli generate \
     -g typescript-angular \
     -i openapi/auth_basic.yaml \
     -o src/app/services/auth-basic
   ```
3. **Commit generated code** (generated code is tracked in Git)

### Generated Code Structure

```
src/app/services/auth-basic/
├── api/                    # API endpoint services
│   ├── users.service.ts   # User operations
│   ├── groups.service.ts  # Group operations
│   └── organisations.service.ts
├── model/                 # TypeScript interfaces
│   ├── user.ts
│   ├── group.ts
│   └── organisation.ts
├── index.ts              # Barrel export
├── provide-api.ts        # Provider function
└── .openapi-generator-ignore  # Protects integration files
```

### Integration with Angular

**Provider Configuration** (`app.config.ts`):
```typescript
import { provideApi } from './services/auth-basic';
import { provideApi as provideBackendApi } from './services/backend';

export const appConfig: ApplicationConfig = {
  providers: [
    provideApi({ 
      basePath: environment.krbBaseUrl, 
      withCredentials: true 
    }),
    provideBackendApi({
      basePath: environment.backendBaseUrl,
      withCredentials: true
    }),
  ],
};
```

**Usage in Services**:
```typescript
@Service()
export class AuthService {
  private readonly usersService = inject(UsersService);
  
  async login(username: string, password: string): Promise<boolean> {
    await firstValueFrom(
      this.usersService.login(environment.orgID, { username, password })
    );
    // ...
  }
}
```

---

## \ud83d\udcbb Project Structure

```
angular-bootstrap/
├── src/
│   ├── app/
│   │   ├── app.ts              # Root component
│   │   ├── app.config.ts       # Application providers (IMPORTANT)
│   │   ├── app.routes.ts       # Route definitions
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── header/             # App header component
│   │   ├── footer/             # App footer component
│   │   ├── landing/            # Landing page
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── profile/            # User profile page
│   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── auth-refresh.interceptor.ts  # Session refresh
│   │   ├── mocks/              # DEV-ONLY: Mock backend
│   │   │   └── kerberos-mock.ts
│   │   └── services/           # Application services
│   │       ├── auth.service.ts           # Session management
│   │       ├── auth-basic/               # Kerberos client (generated)
│   │       └── backend/                  # Backend client (generated)
│   ├── styles.scss           # Global styles + theme (IMPORTANT)
│   ├── index.html
│   └── environments/
│       ├── environment.ts     # Development configuration
│       └── environment.prod.ts # Production configuration
├── openapi/
│   ├── auth_basic.yaml        # Kerberos API spec
│   └── backend.yaml           # Backend API spec
├── docs/
│   ├── overview.md            # Architecture overview
│   └── structure.md           # File system map
├── .agents/                  # Agent skill library
│   └── skills/
│       ├── angular-developer/
│       ├── angular-new-app/
│       └── angular-material/
├── package.json
├── angular.json
├── tsconfig.json
├── openapitools.json
├── Makefile
└── README.md
```

---

## \ud83c\udf16 Environment Configuration

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  krbBaseUrl: 'http://localhost:30001',
  backendBaseUrl: 'http://localhost:30002',
  orgID: 1,
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  krbBaseUrl: 'https://auth.yourdomain.com',
  backendBaseUrl: 'https://api.yourdomain.com',
  orgID: 1,
};
```

---

## \ud83d\udc81 Scripts & Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Production build |
| `npm run watch` | Build with file watching |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run codegen` | Generate API clients from OpenAPI specs |

**Makefile Shortcuts**:
```bash
make serve      # npm start
make build      # npm run build
make test       # npm test
make lint       # npm run lint
make codegen    # npm run codegen
make check      # lint + build + test
```

---

## \ud83d\udc8b Quality Gates

### ESLint
- **Framework**: angular-eslint + TypeScript ESLint
- **Config**: `eslint.config.js`
- **Run**: `npm run lint`

### Testing
- **Framework**: Jasmine + Karma
- **Test Files**: `*.spec.ts` (colocated with components)
- **Run**: `npm test`

### Code Formatting
- **Tool**: Prettier
- **Config**: `.prettierrc`
- **Integration**: ESLint + EditorConfig

### CI/CD
- **GitHub Actions**: Full pipeline in `.github/workflows/`
- **Code Scanning**: Security vulnerability detection
- **Dependabot**: Automatic dependency updates

---

## \ud83c\udf31 Adding New Features

### 1. Add a New Component

```bash
# Generate component (or create manually)
ng generate component feature/my-feature --standalone
```

**File Structure**:
```
src/app/feature/my-feature/
├── my-feature.ts         # Standalone component
├── my-feature.html
├── my-feature.scss
└── my-feature.spec.ts    # Unit tests
```

**Component Template**:
```typescript
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [MatButton],
  selector: 'app-my-feature',
  standalone: true,
  templateUrl: './my-feature.html',
  styleUrl: './my-feature.scss',
})
export class MyFeature { }
```

### 2. Add a New Route

**app.routes.ts**:
```typescript
import { MyFeature } from './feature/my-feature/my-feature';

export const routes: Route[] = [
  // ... existing routes
  {
    path: 'my-feature',
    component: MyFeature,
    // Optional: Add guards
    canActivate: [authGuard],
  },
];
```

### 3. Add a New API Endpoint

1. **Edit OpenAPI spec** (`openapi/backend.yaml`):
   ```yaml
   paths:
     /api/my-endpoint:
       get:
         operationId: getMyData
         responses:
           '200':
             description: Success
   ```

2. **Run codegen**:
   ```bash
   npm run codegen
   ```

3. **Use in service**:
   ```typescript
   import { MyEndpointService } from './services/backend';
   
   @Service()
   export class MyService {
     private readonly myEndpoint = inject(MyEndpointService);
     
     getData() {
       return this.myEndpoint.getMyData();
     }
   }
   ```

### 4. Add a New Service

```typescript
import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class MyService {
  private readonly http = inject(HttpClient);
  
  getData() {
    return this.http.get('/api/my-data');
  }
}
```

**Register in app.config.ts**:
```typescript
import { MyService } from './my-service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    MyService,
  ],
};
```

---

## \ud83c\udf21 Mock Backend (Development Only)

The mock backend (`src/app/mocks/kerberos-mock.ts`) provides a **complete in-memory implementation** of all endpoints used by the template.

### Features
- **No external dependencies** required for development
- **Persistent across requests** within a session
- **Realistic responses** with proper status codes and errors
- **Console warnings** to remind you it's active

### Mocked Data
- **Users**: Stored in memory, persists across requests
- **Sessions**: Simulated with in-memory state
- **Organisations**: Single organisation (ID: 1) by default

### Important Notes

⚠️ **REMOVE BEFORE PRODUCTION**:
```bash
# Delete the mock directory
rm -rf src/app/mocks/

# Remove interceptor registration from app.config.ts
# Remove: kerberosMockInterceptor from withInterceptors()
```

⚠️ **Session Persistence Limitation**:
The mock backend uses in-memory storage, so **registrations and logins are lost on page reload**. This is intentional for development simplicity. For production, use a real Kerberos backend.

---

## \ud83d\udcda Contributing

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps and expected behavior
- Add relevant labels (bug, enhancement, documentation)

### Pull Requests
- Follow existing code style and patterns
- Include tests for new functionality
- Update documentation for any changes
- Keep commits atomic and well-described

### Development Setup
```bash
git clone https://github.com/maansaake/angular-bootstrap.git
cd angular-bootstrap
npm install
npm start
```

---

## \ud83c\udf01 License

MIT License - see LICENSE file for details.

---

## \ud83d\udc82 Additional Resources

### Angular
- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [Angular CLI](https://angular.dev/tools/cli)

### Kerberos
- [Kerberos GitHub](https://github.com/trebent/kerberos)
- [Kerberos Documentation](https://github.com/trebent/kerberos#readme)

### OpenAPI
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.4.html)
- [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)

### Material Design
- [Material Design Guidelines](https://m3.material.io)
- [Material Design Components](https://m3.material.io/components)

---

## \ud83c\udf89 Changelog

See [GitHub Releases](https://github.com/maansaake/angular-bootstrap/releases) for version history.

---

**Maintained with ❤️ by [maansaake](https://github.com/maansaake)**
