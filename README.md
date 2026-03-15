# Nic P The Barber — Website

Public-facing website for Nic P The Barber. Built with Angular 21, deployed to Azure Static Web Apps via GitHub Actions and OpenTofu.

## Overview

A single-page application that lets clients browse services, view a work gallery, and submit reservation requests. Infrastructure is provisioned and version-controlled as code using the shared [azure-static-webapp-cicd-kit](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit).

## Features

- **Home** — hero section, about blurb, and services menu with pricing
- **Gallery** — filterable work grid (fades, beards, styles) powered by Angular signals
- **Reservations** — booking form with client-side validation

## Repository Structure

```
src/app/
├── features/
│   ├── home/           Hero, about, and services sections
│   ├── gallery/        Signal-driven filterable photo grid
│   └── reservations/   Booking form with reactive validation
└── shared/ui/
    ├── header/         Responsive navigation with mobile menu
    └── footer/

deploy/terraform/
├── dev/                OpenTofu root module — dev environment (Free tier)
└── prod/               OpenTofu root module — prod environment (Standard tier)

.github/workflows/
├── deploy-dev.yml      App deploy → dev  (push to main / PR previews)
├── deploy-prod.yml     App deploy → prod (release tags)
├── terraform-dev.yml   Infra deploy → dev  (push to main)
└── terraform-prod.yml  Infra deploy → prod (release tags)
```

## Getting Started

**Prerequisites:** Node.js 22, npm

```bash
npm install
npm start          # http://localhost:4200
```

## Local Development

```bash
npm start                                        # dev server with live reload
npm run build                                    # dev build
npm run build -- --configuration=production      # production build
npm test                                         # run unit tests (Vitest)
npm test -- --watch=false                        # single-run for CI
```

See the [Development Guide](./docs/development.md) for Angular conventions, code generation, and testing patterns.

## Documentation

| Page | Description |
|---|---|
| [Architecture](./docs/architecture.md) | Component map, design decisions, tech stack |
| [Development Guide](./docs/development.md) | Local setup, conventions, testing |
| [Operations & CI/CD](./docs/operations.md) | Pipelines, environments, secrets, deployments |
| [First-Time Setup](./docs/first-time-setup.md) | Bootstrap a new Azure/GitHub account from scratch |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and fixes |

## Ownership

**Organization:** Bit & Byte Ideas
**Repo:** [bit-and-byte-ideas/nic-p-the-barber-website](https://github.com/bit-and-byte-ideas/nic-p-the-barber-website)
