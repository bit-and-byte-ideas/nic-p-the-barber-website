# Architecture

## System Overview

```
Browser
  │
  ▼
Azure Static Web Apps (CDN + global edge)
  │
  ├── /                   → Home component
  ├── /gallery            → Gallery component
  └── /reservations       → Reservations component

GitHub Actions
  ├── deploy-dev.yml      → push to main / PR → Azure SWA dev
  ├── deploy-prod.yml     → release tag → Azure SWA prod
  ├── terraform-dev.yml   → push to main (infra paths) → OpenTofu dev
  └── terraform-prod.yml  → release tag → OpenTofu prod

OpenTofu
  └── azure-static-webapp-cicd-kit module
        → azurerm_resource_group
        → azurerm_static_web_app
```

## Frontend Architecture

### Framework and Rendering

| Property | Choice |
|---|---|
| Framework | Angular 21 |
| Rendering | Client-side (SPA) |
| Build output | `dist/nic-p-the-barber-website/browser/` |
| Change detection | `OnPush` on every component |
| State | Angular signals (`signal`, `computed`) |

### Component Map

```
AppComponent  (app.ts)
├── Header    (shared/ui/header)   — responsive nav, signal-driven mobile toggle
├── RouterOutlet
│   ├── Home         (features/home)         — services list, hero, about
│   ├── Gallery      (features/gallery)      — filterable grid via computed signal
│   └── Reservations (features/reservations) — reactive form, signal submitted state
└── Footer    (shared/ui/footer)
```

### Routing

All routes are lazy-loaded via `loadComponent`. Route params automatically bind to signal inputs via `withComponentInputBinding()`.

| Path | Component | Title |
|---|---|---|
| `/` | `Home` | Nic P The Barber |
| `/gallery` | `Gallery` | Gallery \| Nic P The Barber |
| `/reservations` | `Reservations` | Book a Cut \| Nic P The Barber |
| `/**` | redirect to `/` | — |

### State Management

The app uses Angular's built-in signal primitives — no external state library.

- `signal()` for writable component-local state (e.g. `activeCategory`, `submitted`)
- `computed()` for derived state (e.g. `filteredItems` in Gallery)
- Writable signals are kept private where possible; public state is exposed as readonly

### Styling

- Global design tokens in `src/styles.scss` using CSS custom properties
- Component-scoped SCSS files per feature/shared component
- Dark gold barber theme

| Token | Value |
|---|---|
| `--color-accent` | `#c9a84c` (gold) |
| `--font-heading` | Playfair Display |
| `--font-body` | Inter |
| `--header-height` | 72px |

## Infrastructure Architecture

### Environments

| Environment | Azure SKU | Branch Trigger | Terraform Root |
|---|---|---|---|
| dev | Free | push to `main` | `deploy/terraform/dev/` |
| prod | Standard | GitHub Release published | `deploy/terraform/prod/` |

### IaC Module

Both environments call the same versioned module from the shared kit:

```hcl
module "static_webapp" {
  source = "github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit//modules/azure-static-webapp?ref=main"
  ...
}
```

Resources provisioned per environment:

- `azurerm_resource_group`
- `azurerm_static_web_app`

### Remote State

OpenTofu state is stored in Azure Blob Storage.

| Property | Value |
|---|---|
| Container | `tfstate` |
| Dev state key | `nic-p-barber-dev.tfstate` |
| Prod state key | `nic-p-barber-prod.tfstate` |

### Authentication

GitHub Actions authenticates to Azure using **OIDC Federated Identity** — no client secrets are stored.

```
GitHub Actions runner
  │  requests OIDC token (id-token: write permission)
  ▼
azure/login action
  │  exchanges token with Azure AD
  ▼
ARM_* environment variables set
  │
  ▼
OpenTofu azurerm provider uses ARM_* vars
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Angular signals over NgRx/RxJS | App state is simple and component-local; signals are the Angular-native solution without library overhead |
| `OnPush` everywhere | Prevents unnecessary re-renders; forces explicit state tracking via signals |
| Lazy-loaded routes | Keeps initial bundle small; each page loads its own chunk |
| OpenTofu over Terraform | Open-source fork; same HCL syntax; no licensing concerns |
| Reusable kit module | Infrastructure conventions centralized; consumer repos stay thin |
| OIDC auth (no secrets) | Eliminates secret rotation risk; credentials are short-lived per workflow run |
| Per-env root modules | Isolates dev and prod state; `terraform.tfvars` is auto-loaded, no `-var-file` needed in CI |
| Release tags for prod | Prod deployments are intentional and auditable; decoupled from day-to-day merges to `main` |
