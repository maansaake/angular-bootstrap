# Angular bootstrap

[![Main branch protection](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/main.yaml)
[![Code scanning](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml/badge.svg?branch=main)](https://github.com/maansaake/angular-bootstrap/actions/workflows/code-scanning.yaml)

A reference repository, use as a template for new Angular apps.

## Included boilerplate

1. Angular 22
2. Angular material
3. ESLint
4. User management
    * Registration
    * Login/logout
    * User username
    * Update password
5. Header/footer
6. Landing page
7. OpenAPI code generation

    * Uses [Kerberos](https://github.com/trebent/kerberos) OpenAPI specification for basic authentication to generate an Angular client service.

8. GitHub actions layout

The bootstrap app uses a mocked service for user management which can be easily modified to support a real backend (preferably [Kerberos](https://github.com/trebent/kerberos) 😀).
