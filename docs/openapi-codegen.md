# OpenAPI Code Generation

This document provides a comprehensive guide to the OpenAPI code generation implementation in the Angular Bootstrap template.

## Overview

The Angular Bootstrap template uses **[OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)** to automatically generate **type-safe Angular API clients** from OpenAPI specifications.

This approach provides:

- ✅ **Type Safety**: Compile-time checking of API requests and responses
- ✅ **Auto-completion**: IDE support for API endpoints and models
- ✅ **Consistency**: Generated code matches the API specification exactly
- ✅ **Maintainability**: Update API by editing specs, not code
- ✅ **Documentation**: API documentation built into the generated code

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAPI Code Generation Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐ │
│  │  OpenAPI    │         │   OpenAPI    │         │   Angular    │ │
│  │   Spec      │         │  Generator   │         │   Client    │ │
│  │  (YAML)     │────────>│   (CLI)      │────────>│ (Generated) │ │
│  └─────────────┘         └─────────────┘         └──────┬──────┘ │
│                                                          │          │
│                          ┌───────────────────────────────▼───────┐ │
│                          │            Angular Application             │ │
│                          │  ┌─────────────┐  ┌───────────────────┐ │ │
│                          │  │  Services    │  │    Components      │ │ │
│                          │  │  (inject)    │  │    (use clients)   │ │ │
│                          │  └──────┬──────┘  └──────────┬────────┘ │ │
│                          │         │                   │           │ │
│                          └─────────┼───────────────────┼───────────┘ │
│                                    │                   │             │
│                                    ▼                   ▼             │
│                          ┌─────────────────────────────────────┐ │
│                          │           HTTP Requests                 │ │
│                          └─────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Generator Version

The template uses OpenAPI Generator **v2.41.0**, configured in `openapitools.json`:

```json
{
  "generator-cli": {
    "version": "2.41.0"
  }
}
```

### Generator Command

The `package.json` defines the code generation script:

```json
{
  "scripts": {
    "codegen": "npx @openapitools/openapi-generator-cli generate -g typescript-angular -i openapi/auth_basic.yaml -o src/app/services/auth-basic && npx @openapitools/openapi-generator-cli generate -g typescript-angular -i openapi/backend.yaml -o src/app/services/backend"
  }
}
```

**Run code generation**:
```bash
# Generate all clients
npm run codegen

# Or use Makefile
make codegen

# Or run individually
npx @openapitools/openapi-generator-cli generate \
  -g typescript-angular \
  -i openapi/auth_basic.yaml \
  -o src/app/services/auth-basic
```

---

## Available Specifications

The template includes **two OpenAPI specifications**:

### 1. Kerberos Authentication API

**File**: `openapi/auth_basic.yaml`

**Purpose**: User authentication and management via [Kerberos](https://github.com/trebent/kerberos)

**Generated Client**: `src/app/services/auth-basic/`

**Base URL**: Configured in `environment.krbBaseUrl`

**Key Features**:
- User authentication (login, logout, refresh)
- User management (CRUD operations)
- Group management
- Organisation management
- Session management via HttpOnly cookies

### 2. Backend API

**File**: `openapi/backend.yaml`

**Purpose**: Application-specific endpoints

**Generated Client**: `src/app/services/backend/`

**Base URL**: Configured in `environment.backendBaseUrl`

**Current Features**:
- User registration (proxied to Kerberos)
- Future: Custom business logic endpoints

---

## Generated Code Structure

When you run `npm run codegen`, the generator creates the following structure:

```
src/app/services/auth-basic/
├── api/                          # API endpoint services
│   ├── users.service.ts         # User operations
│   ├── groups.service.ts        # Group operations
│   ├── organisations.service.ts # Organisation operations
│   └── api.ts                  # Barrel export for API services
├── model/                       # TypeScript interfaces
│   ├── user.ts                 # User model
│   ├── group.ts                # Group model
│   ├── organisation.ts         # Organisation model
│   ├── login-request.ts        # Login request model
│   ├── create-user-request.ts  # User creation request
│   └── ...
├── index.ts                    # Main barrel export
├── provide-api.ts              # Angular provider function
├── configuration.ts            # API configuration
├── api.base.service.ts        # Base service class
├── api.module.ts              # NgModule (for compatibility)
├── encoder.ts                 # Parameter encoding
├── param.ts                   # Parameter types
├── query.params.ts            # Query parameter handling
├── variables.ts               # API variables
└── .openapi-generator-ignore   # Protects custom files
```

---

## Generated Code Details

### Service Classes

Each API endpoint group generates a service class:

```typescript
// src/app/services/auth-basic/api/users.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { LoginRequest } from '../model/login-request';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private basePath = 'http://localhost:30001';
  private defaultHeaders = new HttpHeaders();
  private configuration = new Configuration();

  constructor(private httpClient: HttpClient) {}

  /**
   * Logs a user in.
   * @param orgID Organisation ID
   * @param loginRequest Login credentials
   * @returns Observable<void>
   */
  login(
    orgID: number,
    loginRequest: LoginRequest,
    observe: 'body' = 'body',
    reportProgress: boolean = false
  ): Observable<void> {
    const url = `${this.basePath}/api/auth/basic/organisations/${orgID}/login`;
    const headers = this.defaultHeaders;
    const body = loginRequest;
    
    return this.httpClient.post<void>(url, body, { headers, observe, reportProgress });
  }

  /**
   * Gets the current user.
   * @param orgID Organisation ID
   * @returns Observable<User>
   */
  getMe(
    orgID: number,
    observe: 'body' = 'body',
    reportProgress: boolean = false
  ): Observable<User> {
    const url = `${this.basePath}/api/auth/basic/organisations/${orgID}/users/me`;
    return this.httpClient.get<User>(url, { observe, reportProgress });
  }

  // ... more methods
}
```

### Model Interfaces

Each schema in the OpenAPI spec generates a TypeScript interface:

```typescript
// src/app/services/auth-basic/model/user.ts

export interface User {
  id: number;
  name: string;
  groups?: Group[];
}

// src/app/services/auth-basic/model/group.ts

export interface Group {
  id: number;
  name: string;
}

// src/app/services/auth-basic/model/login-request.ts

export interface LoginRequest {
  username: string;
  password: string;
}
```

### Provider Function

The generator creates a provider function for easy integration:

```typescript
// src/app/services/auth-basic/provide-api.ts

import { Provider } from '@angular/core';
import { Configuration } from './configuration';
import { UsersService } from './api/users.service';
import { GroupsService } from './api/groups.service';
import { OrganisationsService } from './api/organisations.service';

export function provideApi(configuration: Configuration): Provider[] {
  return [
    { provide: Configuration, useValue: configuration },
    UsersService,
    GroupsService,
    OrganisationsService,
  ];
}
```

---

## Integration with Angular

### Step 1: Configure Providers

In `app.config.ts`, configure the API clients:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideApi } from './services/auth-basic';
import { provideApi as provideBackendApi } from './services/backend';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    
    // Kerberos API client
    provideApi({ 
      basePath: environment.krbBaseUrl, 
      withCredentials: true  // Required for cookies
    }),
    
    // Backend API client
    provideBackendApi({
      basePath: environment.backendBaseUrl,
      withCredentials: true
    }),
    
    // ... other providers
  ],
};
```

### Step 2: Use in Services

Inject and use the generated services in your application services:

```typescript
import { Injectable, inject } from '@angular/core';
import { UsersService, User } from './services/auth-basic';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersService = inject(UsersService);

  async login(username: string, password: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.usersService.login(environment.orgID, { username, password })
      );
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.usersService.getMe(environment.orgID)
      );
    } catch {
      return null;
    }
  }
}
```

### Step 3: Use in Components

Use the services in your components:

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    @if (authService.loggedIn()) {
      <p>Welcome, {{ authService.username() }}!</p>
    }
  `,
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
}
```

---

## Adding New API Endpoints

### Step 1: Edit OpenAPI Specification

Add new endpoints to the appropriate YAML file:

```yaml
# openapi/backend.yaml

paths:
  /api/users:
    get:
      operationId: listUsers
      tags:
        - users
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
  
  /api/users/{id}:
    get:
      operationId: getUser
      tags:
        - users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

### Step 2: Define Models

Add model definitions if needed:

```yaml
# openapi/backend.yaml

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        email:
          type: string
      required:
        - id
        - name
```

### Step 3: Run Code Generation

```bash
npm run codegen
```

This will:
1. Generate new service methods
2. Generate new model interfaces
3. Update barrel exports

### Step 4: Use New Endpoints

```typescript
import { UsersService } from './services/backend';

// In your service
const users = await firstValueFrom(
  this.usersService.listUsers()
);

const user = await firstValueFrom(
  this.usersService.getUser(userId)
);
```

---

## Customizing Generated Code

### Protected Files

The `.openapi-generator-ignore` file protects certain files from being overwritten:

```
# .openapi-generator-ignore
src/app/services/auth-basic/index.ts
src/app/services/auth-basic/provide-api.ts
src/app/services/auth-basic/api.ts
```

You can safely edit these files to:
- Add custom barrel exports
- Modify provider configuration
- Add custom types

### Configuration Options

The `Configuration` class allows runtime configuration:

```typescript
// configuration.ts

export class Configuration {
  basePath?: string;
  withCredentials?: boolean;
  headers?: { [key: string]: string };
  // ...
}
```

**Usage**:
```typescript
provideApi({
  basePath: environment.krbBaseUrl,
  withCredentials: true,
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

### Interceptors

You can add custom interceptors to the generated clients:

```typescript
// Custom interceptor
import { HttpInterceptorFn } from '@angular/common/http';

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  // Add custom logic
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Custom': 'header',
    },
  });
  return next(modifiedReq);
};

// In app.config.ts
provideHttpClient(
  withInterceptors([customInterceptor])
)
```

---

## OpenAPI Specification Guide

### Specification Structure

A complete OpenAPI specification includes:

```yaml
openapi: "3.0.4"
info:
  version: 1.0.0
  title: My API
  description: API description

servers:
  - url: http://localhost:3000
    description: Development server

paths:
  /api/endpoint:
    get:
      operationId: getEndpoint
      summary: Get endpoint data
      description: Detailed description
      tags:
        - endpoint
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EndpointData'

components:
  schemas:
    EndpointData:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
      required:
        - id
        - name
```

### Best Practices

1. **Use operationId**: This determines the generated method name
   ```yaml
   operationId: getUsers  # Generates getUsers() method
   ```

2. **Use tags**: Organizes endpoints into service classes
   ```yaml
   tags:
     - users  # All endpoints with 'users' tag go to UsersService
   ```

3. **Use components/schemas**: Define reusable models
   ```yaml
   components:
     schemas:
       User:
         type: object
         properties:
           id:
             type: integer
           name:
             type: string
   ```

4. **Use requestBodies**: Define reusable request models
   ```yaml
   components:
     requestBodies:
       CreateUserRequest:
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/User'
   ```

5. **Use parameters**: Define reusable parameters
   ```yaml
   components:
     parameters:
       userId:
         name: userID
         in: path
         required: true
         schema:
           type: integer
   ```

---

## TypeScript-Angular Generator Options

The `typescript-angular` generator supports various options:

| Option | Description | Default |
|--------|-------------|---------|
| `--additional-properties` | Additional properties to include | `false` |
| `--api-module-prefix` | Prefix for API module | `''` |
| `--configuration-files` | Configuration files | `false` |
| `--npm-name` | NPM package name | `''` |
| `--npm-scope` | NPM package scope | `''` |
| `--npm-version` | NPM package version | `''` |
| `--prefix` | Prefix for generated files | `''` |
| `--use-interface` | Use interfaces instead of classes | `true` |
| `--with-cache` | Enable caching | `false` |

**Example with options**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -g typescript-angular \
  -i openapi/auth_basic.yaml \
  -o src/app/services/auth-basic \
  --additional-properties=modelPackage=models,apiPackage=api \
  --use-interface=true
```

---

## Validation

### Validate OpenAPI Specifications

Use tools to validate your specifications before generation:

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate spec
swagger-cli validate openapi/auth_basic.yaml
```

### Common Validation Errors

1. **Missing required fields**:
   ```
   Error: Instance is missing required property "operationId"
   ```

2. **Invalid references**:
   ```
   Error: Can't resolve reference #/components/schemas/NonExistent
   ```

3. **Invalid types**:
   ```
   Error: Instance type "strng" is not allowed
   ```

---

## Troubleshooting

### Common Issues

#### 1. Generation Fails

**Symptom**: `npm run codegen` fails with errors

**Causes**:
- Invalid OpenAPI specification
- Missing required fields
- Syntax errors in YAML

**Solutions**:
- Validate the specification: `swagger-cli validate openapi/auth_basic.yaml`
- Check YAML syntax: Use a YAML validator
- Ensure all required fields are present

#### 2. Generated Code Has Errors

**Symptom**: Generated TypeScript code has compilation errors

**Causes**:
- Generator version mismatch
- Invalid type definitions in spec
- Reserved TypeScript keywords in model names

**Solutions**:
- Update generator version in `openapitools.json`
- Use `x-type` or `x-model-name` to customize generated names
- Check for reserved words (class, interface, etc.)

#### 3. API Calls Fail

**Symptom**: API calls fail at runtime

**Causes**:
- Wrong base URL
- Missing credentials
- CORS issues

**Solutions**:
- Check `environment.krbBaseUrl` and `environment.backendBaseUrl`
- Ensure `withCredentials: true` for cookie-based auth
- Verify CORS configuration on the server

#### 4. Types Don't Match API

**Symptom**: Generated types don't match actual API responses

**Causes**:
- Outdated specification
- Incorrect schema definitions

**Solutions**:
- Update the OpenAPI specification to match the API
- Run `npm run codegen` to regenerate
- Use `any` type temporarily for debugging

---

## Best Practices

### 1. Keep Specifications Up to Date

✅ **Do**: Update specs when API changes
```bash
# After API changes
git pull  # Get latest API changes
git checkout openapi/auth_basic.yaml  # Update spec
npm run codegen  # Regenerate
```

❌ **Don't**: Manually edit generated code
```typescript
// Avoid: Manual changes will be overwritten
// src/app/services/auth-basic/api/users.service.ts
```

### 2. Use Meaningful Operation IDs

✅ **Do**: Use descriptive operation IDs
```yaml
operationId: getUserById  # Good
```

❌ **Don't**: Use generic names
```yaml
operationId: get123  # Bad
```

### 3. Organize with Tags

✅ **Do**: Use tags to group related endpoints
```yaml
tags:
  - users
  - authentication
  - organisations
```

❌ **Don't**: Use too many or too few tags
```yaml
tags:
  - everything  # Too broad
  
tags:
  - users
  - user
  - user-management  # Redundant
```

### 4. Define Reusable Models

✅ **Do**: Define models in components/schemas
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
```

❌ **Don't**: Define models inline
```yaml
responses:
  '200':
    content:
      application/json:
        schema:
          type: object  # Bad: No reuse
          properties:
            id:
              type: integer
```

### 5. Document Your API

✅ **Do**: Add descriptions
```yaml
info:
  description: |
    The Kerberos basic authentication API provides support for managing
    user accounts, groups, and organisations.

paths:
  /api/users:
    get:
      summary: List all users
      description: Returns a list of all users in the organisation
```

❌ **Don't**: Leave descriptions empty
```yaml
info:
  description: ''  # Bad
```

---

## Examples

### Example 1: Adding a New Endpoint

**Scenario**: Add a `/api/health` endpoint to check API health

**Step 1**: Edit `openapi/backend.yaml`
```yaml
paths:
  /api/health:
    get:
      operationId: getHealth
      tags:
        - health
      summary: Health check endpoint
      description: Returns the health status of the API
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'

components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, unhealthy]
        timestamp:
          type: string
          format: date-time
      required:
        - status
        - timestamp
```

**Step 2**: Run code generation
```bash
npm run codegen
```

**Step 3**: Use the new endpoint
```typescript
import { HealthService } from './services/backend';

// In your service
const health = await firstValueFrom(
  this.healthService.getHealth()
);

if (health.status === 'healthy') {
  console.log('API is healthy');
}
```

### Example 2: Adding Request Validation

**Scenario**: Add validation for user creation

**Step 1**: Update the CreateUserRequest schema
```yaml
components:
  requestBodies:
    CreateUserRequest:
      description: A request to create a new user
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              username:
                type: string
                minLength: 5
                maxLength: 32
                pattern: '^[a-zA-Z0-9_]+$'
              password:
                type: string
                minLength: 10
                maxLength: 40
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
            required:
              - username
              - password
```

**Step 2**: Regenerate
```bash
npm run codegen
```

**Step 3**: The generated interface will include validation
```typescript
export interface CreateUserRequest {
  username: string;  // Pattern: ^[a-zA-Z0-9_]+$
  password: string;  // Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\[0-9]).+$
}
```

---

## Additional Resources

### Tools
- [OpenAPI Generator CLI](https://github.com/OpenAPITools/openapi-generator-cli)
- [Swagger Editor](https://editor.swagger.io/) - Online OpenAPI editor
- [Swagger CLI](https://github.com/APIDevTools/swagger-cli) - Validate OpenAPI specs
- [Stoplight Prism](https://stoplight.io/prism/) - Mock server from OpenAPI specs

### Documentation
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.4.html)
- [OpenAPI Generator Documentation](https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-angular.md)
- [TypeScript-Angular Generator Docs](https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-angular.md)

### Tutorials
- [OpenAPI Tutorial](https://openapi.tutorials.apiary.io/)
- [Writing OpenAPI Specs](https://swagger.io/docs/specification/basic-structure/)
- [OpenAPI Best Practices](https://github.com/Redocly/redocly-cli)

---

## Summary

The OpenAPI code generation in Angular Bootstrap provides:

- ✅ **Automatic generation** of type-safe API clients
- ✅ **Seamless integration** with Angular's dependency injection
- ✅ **Consistency** between API and client code
- ✅ **Easy maintenance** through specification-driven development
- ✅ **Production-ready** code with proper error handling

By following the patterns and best practices outlined in this document, you can efficiently extend and maintain your API clients as your application grows.
