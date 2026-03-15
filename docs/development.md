# Development Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 22 | [nodejs.org](https://nodejs.org) |
| npm | bundled with Node | — |
| Angular CLI | via project | `npx ng` or `npm run ng` |

## Local Setup

```bash
git clone https://github.com/bit-and-byte-ideas/nic-p-the-barber-website.git
cd nic-p-the-barber-website
npm install
npm start
```

Open `http://localhost:4200`. The dev server reloads automatically on file changes.

## Common Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server at `localhost:4200` |
| `npm run build` | Dev build |
| `npm run build -- --configuration=production` | Production build |
| `npm test` | Run unit tests (Vitest, watch mode) |
| `npm test -- --watch=false` | Single test run (CI mode) |
| `npm test -- --code-coverage` | Test run with coverage report |
| `npx ng lint` | Lint the project |
| `npx ng lint --fix` | Auto-fix lint issues |
| `npx ng generate component path/name` | Generate a new component |

## Angular Conventions

This project follows Angular 21+ patterns. Key rules enforced throughout the codebase:

### Components

- **Standalone by default** — do not set `standalone: true` (it is the default in v21)
- **Always use `ChangeDetectionStrategy.OnPush`**
- Use **signal inputs** (`input()`, `input.required()`) and `output()` — not `@Input()`/`@Output()` decorators
- Use `host` object in `@Component` for host bindings — not `@HostBinding`/`@HostListener`
- Use **native control flow** (`@if`, `@for`, `@switch`) — not `*ngIf`, `*ngFor`, `*ngSwitch`
- Use direct class/style bindings (`[class.foo]`, `[style.color]`) — not `ngClass` or `ngStyle`
- Use `NgOptimizedImage` for static images

### Services & DI

- Use `inject()` — not constructor injection
- Default to `providedIn: 'root'` for singleton services
- Expose state as **readonly signals**; keep writable signals private

### State Management

- `signal()` for writable state
- `computed()` for derived state
- `linkedSignal()` when derived state also needs to be user-writable
- `effect()` only for side effects (DOM, logging, storage) — run in constructor
- `toSignal()` / `toObservable()` for RxJS interop

### HTTP

- Prefer `httpResource()` for data fetching with automatic loading/error states
- Use `resource()` for non-HTTP async operations
- Use functional interceptors registered via `withInterceptors()`

### Forms

- Use Signal Forms (`@angular/forms/signals`) for new forms — experimental in v21
- Fall back to Reactive Forms for production-critical stability requirements

### Routing

- Use `loadComponent` / `loadChildren` for lazy loading
- `withComponentInputBinding()` is enabled — route params map to signal inputs
- Use functional guards (`CanActivateFn`) and resolvers (`ResolveFn`)

## File Naming

Angular v21 convention used in this project:

| File type | Naming |
|---|---|
| Root component | `app.ts`, `app.html`, `app.scss` |
| Feature components | `home.ts`, `gallery.ts`, etc. (no `.component` suffix) |
| Shared UI | `header.ts`, `footer.ts`, etc. |

## Generating New Components

```bash
# Feature page
npx ng generate component features/my-feature --change-detection=OnPush

# Shared UI component
npx ng generate component shared/ui/my-widget --change-detection=OnPush
```

After generating, rename files to drop the `.component` suffix to match project conventions.

## Testing

Tests use **Vitest** with Angular's native test runner (`@angular/build:unit-test`).

```bash
npm test                                    # watch mode
npm test -- --watch=false                   # single run
npm test -- --code-coverage                 # with coverage
npm test -- --include=src/app/path/foo.spec.ts  # single file
```

### Testing Conventions

- Use `vi.fn()` and `vi.clearAllMocks()` for mocking
- Set signal inputs in tests via `fixture.componentRef.setInput()`
- Always call `httpMock.verify()` in `afterEach` for HTTP tests
- Do **not** mock the router or `HttpClient` at the module level unless necessary

### Example: Testing a Signal Component

```typescript
it('should filter gallery items by category', () => {
  const fixture = TestBed.createComponent(Gallery);
  const component = fixture.componentInstance;

  component.setCategory('fades');
  fixture.detectChanges();

  expect(component.filteredItems().every(i => i.category === 'fades')).toBe(true);
});
```

## Project Structure

```
src/
├── app/
│   ├── app.ts              Root component
│   ├── app.html
│   ├── app.scss
│   ├── app.config.ts       Application providers (router, HTTP)
│   ├── app.routes.ts       Lazy-loaded route definitions
│   ├── features/
│   │   ├── home/           Home page (hero, about, services)
│   │   ├── gallery/        Filterable work gallery
│   │   └── reservations/   Booking form
│   └── shared/
│       └── ui/
│           ├── header/     Responsive navigation
│           └── footer/
├── styles.scss             Global CSS custom properties (design tokens)
├── main.ts                 Application bootstrap
└── index.html
```
