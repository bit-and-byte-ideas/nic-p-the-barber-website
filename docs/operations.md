# Operations & CI/CD

## Branch Strategy

| Trigger | Environment | What deploys |
|---|---|---|
| Push to `main` | Dev | App + OpenTofu dev infra |
| PR to `main` | Dev (preview) | App PR preview + OpenTofu plan comment |
| Release published (tag) | Prod | App + OpenTofu prod infra (approval-gated) |

## Workflows

### App Deployment

#### `deploy-dev.yml`

Triggers on push or PR to `main`.

- **Push to `main`** → builds and deploys to the dev Azure Static Web App
- **PR to `main`** → builds and deploys a PR preview environment; Azure SWA auto-generates a preview URL
- **PR closed** → closes the preview environment

#### `deploy-prod.yml`

Triggers on `release: published`.

- Builds and deploys to the prod Azure Static Web App

### Infrastructure (OpenTofu)

Both terraform workflows call the reusable workflow from the [azure-static-webapp-cicd-kit](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit):

```
validate → plan → [manual approval] → apply
```

#### `terraform-dev.yml`

Triggers on push or PR to `main` when files under `deploy/terraform/dev/**` change.

- **validate** — format check, `tofu init -backend=false`, `tofu validate`
- **plan** — authenticates via OIDC, inits with remote state, runs `tofu plan -detailed-exitcode`
- **apply** — gated by the `terraform-dev` GitHub Environment; only applies when changes are detected

#### `terraform-prod.yml`

Triggers on `release: published`.

- Same three stages as dev
- Gated by the `terraform-prod` GitHub Environment

#### Change Detection

The plan job uses `-detailed-exitcode`:

- **Exit 0** — no changes; apply job is skipped entirely
- **Exit 2** — changes detected; plan artifact uploaded; apply job queued for approval
- **Exit 1** — plan error; workflow fails

## GitHub Environments

Two environments gate the OpenTofu `apply` job. Configure them at **Settings → Environments**.

| Environment | Used by | Required configuration |
|---|---|---|
| `terraform-dev` | `terraform-dev.yml` | Add required reviewers; optionally restrict to `main` branch |
| `terraform-prod` | `terraform-prod.yml` | Add required reviewers; restrict to release events |

When an apply is pending approval, GitHub sends a notification to reviewers. The workflow pauses until someone approves or rejects in the GitHub Actions UI.

## Secrets

Configure these in **Settings → Secrets and variables → Actions**.

### Azure OIDC

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | App Registration client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID_DEV` | Azure subscription ID for dev environment |
| `AZURE_SUBSCRIPTION_ID_PROD` | Azure subscription ID for prod environment |

### OpenTofu State Backend

| Secret | Description |
|---|---|
| `TF_BACKEND_RESOURCE_GROUP` | Resource group containing the state storage account |
| `TF_BACKEND_STORAGE_ACCOUNT` | Storage account name |
| `TF_BACKEND_CONTAINER` | Blob container name (`tfstate`) |
| `TF_BACKEND_KEY_DEV` | State file path for dev (`nic-p-barber-dev.tfstate`) |
| `TF_BACKEND_KEY_PROD` | State file path for prod (`nic-p-barber-prod.tfstate`) |

### App Deployment Tokens

These come from the OpenTofu output `api_key` after first apply.

| Secret | Description |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` | SWA deployment token — dev |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` | SWA deployment token — prod |

To retrieve a token after apply:

```bash
cd deploy/terraform/dev
tofu output -raw api_key
```

## Infrastructure

### OpenTofu Root Modules

| Module | Path | SKU | State key |
|---|---|---|---|
| Dev | `deploy/terraform/dev/` | Free | `nic-p-barber-dev.tfstate` |
| Prod | `deploy/terraform/prod/` | Standard | `nic-p-barber-prod.tfstate` |

Both call:

```
github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit//modules/azure-static-webapp?ref=main
```

### Module Version Pinning

The module source currently references `?ref=main`. Once a release tag is cut on the kit:

1. Update `source` in `deploy/terraform/dev/main.tf` and `deploy/terraform/prod/main.tf` to `?ref=v<version>`
2. Update the `uses:` line in `terraform-dev.yml` and `terraform-prod.yml` to `@v<version>`

### Azure Resources per Environment

| Resource | Dev name | Prod name |
|---|---|---|
| Resource Group | `nic-p-barber-dev-rg` | `nic-p-barber-prod-rg` |
| Static Web App | `nic-p-barber-dev-swa` | `nic-p-barber-prod-swa` |

### Local OpenTofu Commands

```bash
cd deploy/terraform/dev   # or prod

tofu init \
  -backend-config="resource_group_name=<rg>" \
  -backend-config="storage_account_name=<sa>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=nic-p-barber-dev.tfstate"

tofu plan     # terraform.tfvars is auto-loaded — no -var-file needed
tofu apply
```

## Releasing to Production

1. Merge your changes to `main` and verify the dev deployment is healthy
2. Go to **Releases → Draft a new release** in GitHub
3. Create a new tag (e.g. `v1.2.0`), set the release title and notes
4. Click **Publish release**
5. Both `deploy-prod.yml` and `terraform-prod.yml` trigger
6. The `terraform-prod` apply job pauses for reviewer approval — review the plan and approve
7. Verify the prod deployment at the prod Static Web App URL

## Build Output

```
dist/nic-p-the-barber-website/browser/
```

This path is referenced in both deploy workflows as `output_location`.

## Monitoring

Azure Static Web Apps provides basic request metrics in the Azure portal under the SWA resource. No Application Insights is currently provisioned — it can be enabled via the `enable_application_insights = true` module flag if needed.
