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

## PR2-FE-DISCOVERY-QUEUE

Implemented lead workflow:

- `/discovery` consumes `GET /api/v1/leads`
- Search, status, city and district filters
- Priority, fit and confidence score chips
- Loading, empty and error states
- Clickable lead rows
- `/lead-inspector/:id` consumes lead detail, sources and activity endpoints
- Liquid glass panels for identity, contact, location, scores, sources and activity

## PR3-FE-OPS-MONITOR

Implemented discovery operations:

- `/ops` consumes jobs, sources, raw discovery items and ops summary
- KPI cards for jobs, failures, created/updated leads and active sources
- Recent jobs table with retry action
- Source list with enable/disable action
- Manual discovery run with inline seed item
- Quick seed source creation
- Loading, empty and error states

## PR4-FE-LEAD-PROGRESS-TRACKER

Implemented lead lifecycle UI:

- Reusable `lead-progress-tracker` component with `input()` and `computed()`
- Compact tracker in `/discovery`
- Full tracker in `/lead-inspector/:id`
- Status actions for next stage, pause and discard
- Score recompute action
- Score breakdown and explanations in the inspector
- Status history in the inspector

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
