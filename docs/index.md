# Nic P The Barber — Website

Public-facing website for Nic P The Barber. Built with Angular 21, hosted on Azure Static Web Apps, and fully automated through GitHub Actions and OpenTofu.

## What This Is

A single-page application that gives clients:

- An overview of services and pricing
- A filterable gallery of the barber's work
- A reservation request form

Infrastructure is declared as code and deployed through the shared [azure-static-webapp-cicd-kit](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit).

## Quick Links

| Topic | Page |
|---|---|
| System design and tech decisions | [Architecture](architecture.md) |
| Local dev setup, Angular conventions, testing | [Development Guide](development.md) |
| CI/CD pipelines, secrets, environments | [Operations & CI/CD](operations.md) |
| Bootstrap a brand-new Azure or GitHub account | [First-Time Setup](first-time-setup.md) |
| Something broke? | [Troubleshooting](troubleshooting.md) |

## At a Glance

| Property | Value |
|---|---|
| Framework | Angular 21 |
| Hosting | Azure Static Web Apps |
| IaC tool | OpenTofu ≥ 1.6 |
| IaC module | [azure-static-webapp-cicd-kit](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit) |
| State backend | Azure Blob Storage |
| Auth method | OIDC Federated Identity (no stored secrets) |
| Dev branch | `main` |
| Prod trigger | GitHub Release (published tag) |
| Owner | Bit & Byte Ideas |
