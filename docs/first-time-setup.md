# First-Time Setup

Use this guide when deploying to a brand-new Azure subscription or GitHub organization/account. Follow the steps in order — each step is a prerequisite for the next.

## Prerequisites

Install the following tools locally before starting:

| Tool | Install |
|---|---|
| Azure CLI | `brew install azure-cli` or [docs](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) |
| OpenTofu ≥ 1.6 | `brew install opentofu` or [docs](https://opentofu.org/docs/intro/install/) |
| Node.js 22 | [nodejs.org](https://nodejs.org) |
| Git | pre-installed on most systems |

---

## Step 1 — Log in to Azure

```bash
az login
az account show   # confirm the correct subscription is active

# If you have multiple subscriptions, set the right one:
az account set --subscription "<subscription-id-or-name>"
```

---

## Step 2 — Bootstrap the OpenTofu State Backend

This creates the Azure Storage Account that holds remote OpenTofu state. This must exist before running `tofu init`. Do this once per Azure account — both dev and prod share the same storage account (different state keys).

```bash
RESOURCE_GROUP="nic-p-barber-tfstate-rg"
STORAGE_ACCOUNT="nicpbarbertfstate"   # must be globally unique, 3-24 lowercase alphanumeric
CONTAINER="tfstate"
LOCATION="westus2"

# Create resource group
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"

# Create storage account with secure defaults
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2

# Create the state container
az storage container create \
  --name "$CONTAINER" \
  --account-name "$STORAGE_ACCOUNT"

# Enable blob versioning for state recovery
az storage account blob-service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --enable-versioning true
```

Note the storage account name — you will need it for GitHub secrets later.

---

## Step 3 — Create an Azure App Registration for OIDC

GitHub Actions authenticates to Azure using OpenID Connect (OIDC). This means no stored client secrets — credentials are short-lived and tied to specific repository branches/events.

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
APP_NAME="nic-p-barber-github-actions"

# Create the App Registration
APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)

# Create the service principal
az ad sp create --id "$APP_ID"

# Assign Contributor on the subscription
# (You can scope this down to a specific resource group after initial setup)
az role assignment create \
  --assignee "$APP_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID"
```

### Add Federated Credentials

One credential is needed per trigger type. Replace `<org>` and `<repo>` with your GitHub org and repo name (e.g. `bit-and-byte-ideas` and `nic-p-the-barber-website`).

**For push to `main` (dev infra + dev app):**

```bash
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<org>/<repo>:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**For release tags (prod infra + prod app):**

```bash
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters '{
    "name": "github-release",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<org>/<repo>:environment:terraform-prod",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

> **Note:** The `terraform-prod` apply job runs in the `terraform-prod` GitHub Environment. Federated credentials for environments use `environment:<name>` as the subject, not a branch ref. The deploy-prod workflow uses `workflow_ref`, which is covered by the release trigger credential above for the deploy action.

Save the following values — you'll need them for GitHub secrets:

```bash
echo "AZURE_CLIENT_ID: $APP_ID"
echo "AZURE_TENANT_ID: $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
```

---

## Step 4 — Run OpenTofu for Dev

```bash
cd deploy/terraform/dev

tofu init \
  -backend-config="resource_group_name=nic-p-barber-tfstate-rg" \
  -backend-config="storage_account_name=<your-storage-account>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=nic-p-barber-dev.tfstate"

tofu plan    # review what will be created
tofu apply   # type 'yes' to confirm
```

After apply, capture the deployment API key:

```bash
tofu output -raw api_key
# Save this value — it becomes AZURE_STATIC_WEB_APPS_API_TOKEN_DEV
```

---

## Step 5 — Run OpenTofu for Prod

```bash
cd ../prod

tofu init \
  -backend-config="resource_group_name=nic-p-barber-tfstate-rg" \
  -backend-config="storage_account_name=<your-storage-account>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=nic-p-barber-prod.tfstate"

tofu plan
tofu apply
```

```bash
tofu output -raw api_key
# Save this value — it becomes AZURE_STATIC_WEB_APPS_API_TOKEN_PROD
```

---

## Step 6 — Configure the GitHub Repository

### Fork or Create the Repository

If starting from scratch, create the repository under your GitHub organization and push the code.

### Add Repository Secrets

Navigate to **Settings → Secrets and variables → Actions → New repository secret** and add each of the following:

| Secret | Value | Where to find it |
|---|---|---|
| `AZURE_CLIENT_ID` | App Registration client ID | Step 3 output |
| `AZURE_TENANT_ID` | Azure AD tenant ID | Step 3 output |
| `AZURE_SUBSCRIPTION_ID_DEV` | Azure subscription ID | `az account show --query id -o tsv` |
| `AZURE_SUBSCRIPTION_ID_PROD` | Azure subscription ID | same (or different if separate subscriptions) |
| `TF_BACKEND_RESOURCE_GROUP` | `nic-p-barber-tfstate-rg` | Step 2 |
| `TF_BACKEND_STORAGE_ACCOUNT` | your storage account name | Step 2 |
| `TF_BACKEND_CONTAINER` | `tfstate` | Step 2 |
| `TF_BACKEND_KEY_DEV` | `nic-p-barber-dev.tfstate` | hardcoded |
| `TF_BACKEND_KEY_PROD` | `nic-p-barber-prod.tfstate` | hardcoded |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` | dev SWA api_key | Step 4 output |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` | prod SWA api_key | Step 5 output |

### Create GitHub Environments

Navigate to **Settings → Environments → New environment** and create two environments:

**`terraform-dev`**

- Add yourself (or a team) as a required reviewer
- Optionally restrict deployments to the `main` branch

**`terraform-prod`**

- Add yourself (or a team) as a required reviewer
- Restrict deployments to tags or release events
- Optional: add a wait timer (5 minutes) as an extra safety buffer before apply can proceed

---

## Step 7 — Verify the First Deployment

Push a change to `main` (or trigger the workflow manually from **Actions → Terraform — Dev → Run workflow**).

Checklist:

- [ ] `terraform-dev` workflow completes validate → plan → (approve) → apply
- [ ] `deploy-dev` workflow builds and deploys the app
- [ ] The dev SWA URL loads the website

Then publish a GitHub release to verify prod:

- [ ] `terraform-prod` workflow queues; reviewer approves apply
- [ ] `deploy-prod` workflow deploys the app
- [ ] The prod SWA URL loads the website

---

## Reference: All Azure Resources Created

| Resource | Type | Environment | Purpose |
|---|---|---|---|
| `nic-p-barber-tfstate-rg` | Resource Group | shared | Holds the state storage account |
| `nicpbarbertfstate` | Storage Account | shared | OpenTofu remote state |
| `nic-p-barber-dev-rg` | Resource Group | dev | Provisioned by OpenTofu |
| `nic-p-barber-dev-swa` | Static Web App (Free) | dev | Hosts the dev website |
| `nic-p-barber-prod-rg` | Resource Group | prod | Provisioned by OpenTofu |
| `nic-p-barber-prod-swa` | Static Web App (Standard) | prod | Hosts the prod website |
| App Registration | Azure AD | shared | OIDC identity for GitHub Actions |

---

## Cleanup

To tear down an environment completely:

```bash
cd deploy/terraform/dev   # or prod

tofu destroy
```

This removes the resource group and Static Web App. The state storage account and App Registration are managed outside Terraform and must be deleted manually if no longer needed.
