# Fudi Lead Lab Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

Start the backend first on `http://127.0.0.1:8000`, then run:

```bash
npm start
```

The frontend runs at `http://127.0.0.1:4200/`. Local API calls use `proxy.conf.json`, so `/api/v1` is proxied to the backend.

Temporary local credentials for PR1:

- Email: `admin@fudi.local`
- Password: `admin`

## PR1-FE-APP-SHELL

Implemented foundation:

- Login page wired to `POST /api/v1/auth/login`
- Bearer token storage and HTTP interceptor
- Auth guard for protected routes
- Main shell with topbar and sidebar
- Placeholder routes for Overview, Discovery, Lead Inspector, Campaigns, Models and Ops

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
