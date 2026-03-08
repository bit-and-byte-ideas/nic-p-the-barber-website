# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular v20+ website for a barber business. Not yet bootstrapped — use `ng new` when initializing.

## Commands

```bash
ng serve                          # Dev server (http://localhost:4200)
ng build                          # Dev build
ng build -c production            # Production build
ng test                           # Run tests (Vitest)
ng test --watch=false             # Single run for CI
ng test --code-coverage           # With coverage
ng test --include=**/*.spec.ts    # Single file
ng lint                           # Lint
ng lint --fix                     # Auto-fix lint issues
```

## Angular Conventions

This project follows Angular v20+ patterns. The `.claude/skills/` directory contains detailed skill files for each area — use the Skill tool to load them when needed.

### Components

- Standalone by default — do NOT set `standalone: true`
- Always use `ChangeDetectionStrategy.OnPush`
- Use signal inputs (`input()`, `input.required()`) and `output()` — not `@Input()`/`@Output()`
- Use `host` object in `@Component` — not `@HostBinding`/`@HostListener` decorators
- Use native control flow (`@if`, `@for`, `@switch`) — not `*ngIf`, `*ngFor`, `*ngSwitch`
- Use direct class/style bindings (`[class.foo]`, `[style.color]`) — not `ngClass` or `ngStyle`
- Use `NgOptimizedImage` for static images

### Services & DI

- Use `inject()` — not constructor injection
- Default to `providedIn: 'root'` for singleton services
- Expose state as readonly signals; keep writable signals private

### State Management

- Use `signal()` for writable state, `computed()` for derived state
- Use `linkedSignal()` when derived state also needs to be user-writable
- Use `effect()` only for side effects (DOM, logging, storage); run in constructor
- Use `toSignal()` / `toObservable()` for RxJS interop

### HTTP

- Prefer `httpResource()` for data fetching with automatic loading/error states
- Use `resource()` for non-HTTP async operations
- Use functional interceptors registered via `withInterceptors()`

### Forms

- Use Signal Forms (`@angular/forms/signals`) for new forms — note these are experimental in v21
- Fall back to Reactive Forms for production-critical stability requirements

### Routing

- Use `loadComponent` / `loadChildren` for lazy loading
- Enable `withComponentInputBinding()` so route params map to signal inputs
- Use functional guards (`CanActivateFn`) and resolvers (`ResolveFn`)

### Testing

- Use Vitest with Angular's native support (`@angular/build:unit-test`)
- Use `vi.fn()` and `vi.clearAllMocks()` for mocking
- Set signal inputs in tests via `fixture.componentRef.setInput()`
- Always call `httpMock.verify()` in `afterEach` for HTTP tests
