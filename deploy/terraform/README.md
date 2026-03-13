# Infrastructure — OpenTofu

Provisions Azure Static Web Apps for dev and prod using the
[azure-static-webapp-cicd-kit](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit)
reusable module and GitHub Actions workflow.

## Directory Structure

```
deploy/terraform/
├── dev/                  Root module for the dev environment
│   ├── versions.tf       Provider requirements
│   ├── backend.tf        Remote state backend (azurerm)
│   ├── main.tf           Module call
│   ├── variables.tf      Input variable declarations
│   ├── outputs.tf        Outputs (site URL, api_key, resource group)
│   └── terraform.tfvars  Environment-specific values (auto-loaded)
└── prod/                 Root module for the prod environment
    └── (same structure)
```

Each environment is a self-contained OpenTofu root module. Variable values are supplied
via `terraform.tfvars` (auto-loaded by `tofu plan`), so the reusable workflow requires
no `-var-file` flags.

## CI/CD Pipeline

Two workflows call the kit's reusable `opentofu.yml` workflow:

| Workflow | Branch trigger | Environment gate |
|---|---|---|
| `terraform-dev.yml` | `develop` | `terraform-dev` |
| `terraform-prod.yml` | `main` | `terraform-prod` |

Pipeline stages (from the reusable workflow):

```
validate ──► plan ──► [manual approval] ──► apply
```

- **validate** — `tofu fmt -check`, `tofu init -backend=false`, `tofu validate` (no Azure creds needed)
- **plan** — OIDC login → `tofu init` (remote state) → `tofu plan -detailed-exitcode`; uploads plan artifact; skips apply if no changes
- **apply** — gated by GitHub Environment with required reviewers; applies the exact saved plan artifact

## One-Time Setup

### 1. Bootstrap remote state storage

```bash
RESOURCE_GROUP="nic-p-barber-tfstate-rg"
STORAGE_ACCOUNT="nicpbarbertfstate"   # globally unique, 3-24 lowercase alphanum
LOCATION="westus2"

az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2

az storage container create \
  --name tfstate \
  --account-name "$STORAGE_ACCOUNT"

az storage account blob-service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --enable-versioning true
```

### 2. Create Azure App Registration with OIDC federated credentials

Follow the [OIDC setup steps in the kit README](https://github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit#azure-oidc-setup).
Create one federated credential per branch:

- `repo:bit-and-byte-ideas/nic-p-the-barber-website:ref:refs/heads/develop` (dev)
- `repo:bit-and-byte-ideas/nic-p-the-barber-website:ref:refs/heads/main` (prod)

### 3. Add GitHub repository secrets

| Secret | Value |
|---|---|
| `AZURE_CLIENT_ID` | App Registration client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID_DEV` | Azure subscription ID for dev |
| `AZURE_SUBSCRIPTION_ID_PROD` | Azure subscription ID for prod |
| `TF_BACKEND_RESOURCE_GROUP` | Resource group from step 1 |
| `TF_BACKEND_STORAGE_ACCOUNT` | Storage account name from step 1 |
| `TF_BACKEND_CONTAINER` | `tfstate` |
| `TF_BACKEND_KEY_DEV` | `nic-p-barber-dev.tfstate` |
| `TF_BACKEND_KEY_PROD` | `nic-p-barber-prod.tfstate` |

### 4. Create GitHub Environments with required reviewers

Go to **Settings → Environments** and create:

- `terraform-dev` — add required reviewers; optionally restrict to the `develop` branch
- `terraform-prod` — add required reviewers; restrict to the `main` branch

## Local Development

```bash
cd deploy/terraform/dev   # or prod

tofu init \
  -backend-config="resource_group_name=nic-p-barber-tfstate-rg" \
  -backend-config="storage_account_name=nicpbarbertfstate" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=nic-p-barber-dev.tfstate"

tofu plan    # terraform.tfvars is auto-loaded
tofu apply
```

After the first `tofu apply`, capture the deployment token and store it as a GitHub secret in this repo:

```bash
tofu output -raw api_key
# → store as AZURE_STATIC_WEB_APPS_API_TOKEN_DEV (or _PROD)
```

## Outputs

| Output | Description |
|---|---|
| `site_url` | Public URL of the Static Web App |
| `api_key` | Deployment token (sensitive) — store as `AZURE_STATIC_WEB_APPS_API_TOKEN_*` |
| `resource_group_name` | Name of the Azure resource group |
