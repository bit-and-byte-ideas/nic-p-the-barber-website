# Troubleshooting

## GitHub Actions

### Terraform workflow fails: "Error: No subscription found"

**Symptom:** OpenTofu plan or apply step fails with an Azure auth error.

**Cause:** The `AZURE_SUBSCRIPTION_ID_DEV` or `AZURE_SUBSCRIPTION_ID_PROD` secret is missing or set to the wrong value.

**Fix:**
1. Go to **Settings → Secrets and variables → Actions**
2. Verify `AZURE_SUBSCRIPTION_ID_DEV` and `AZURE_SUBSCRIPTION_ID_PROD` are set
3. Confirm the value matches the output of `az account show --query id -o tsv`

---

### Terraform workflow fails: "OIDC token exchange failed"

**Symptom:** `azure/login` step fails with a 401 or token error.

**Cause:** The federated credential subject does not match the actual workflow trigger.

**Fix:** Confirm the federated credential subject matches the trigger:

| Trigger | Expected subject |
|---|---|
| Push to `main` | `repo:<org>/<repo>:ref:refs/heads/main` |
| `terraform-prod` environment | `repo:<org>/<repo>:environment:terraform-prod` |

Re-create the federated credential with the correct subject via:

```bash
az ad app federated-credential list --id <APP_ID>
az ad app federated-credential delete --id <APP_ID> --federated-credential-id <cred-id>
# Then re-create with correct subject (see First-Time Setup)
```

---

### Terraform workflow fails: "Error initializing backend"

**Symptom:** `tofu init` fails with a storage account or container not found error.

**Cause:** One of the `TF_BACKEND_*` secrets is wrong or the state storage account does not exist yet.

**Fix:**
1. Verify the secrets `TF_BACKEND_RESOURCE_GROUP`, `TF_BACKEND_STORAGE_ACCOUNT`, `TF_BACKEND_CONTAINER` are set correctly
2. Confirm the storage account exists: `az storage account show --name <sa> --resource-group <rg>`
3. Confirm the container exists: `az storage container exists --name tfstate --account-name <sa>`

---

### Apply job is never triggered / stuck waiting

**Symptom:** The plan job completes but the apply job never starts, even after approval.

**Cause A:** No changes were detected (`tofu plan` exited with code 0). The apply job is skipped by design when there is nothing to change. This is expected behavior.

**Cause B:** The `terraform-dev` or `terraform-prod` GitHub Environment has not been created or has no required reviewers assigned.

**Fix for Cause B:**
1. Go to **Settings → Environments**
2. Create the environment if it does not exist
3. Add at least one required reviewer and save

---

### App deploy workflow fails: "Deployment token not found"

**Symptom:** `Azure/static-web-apps-deploy` step fails with an authentication error.

**Cause:** `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` or `_PROD` is missing or expired.

**Fix:** Re-run OpenTofu to retrieve the current token:

```bash
cd deploy/terraform/dev   # or prod
tofu init ...             # (with backend config)
tofu output -raw api_key
```

Update the secret in **Settings → Secrets and variables → Actions**.

---

### PR preview environment not created

**Symptom:** A PR to `main` does not create a preview URL.

**Cause:** The `deploy-dev.yml` workflow did not run, or the `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` secret is missing.

**Fix:**
1. Check the **Actions** tab for the PR — look for `Deploy — Dev` workflow runs
2. If the workflow ran and failed, check the secret exists
3. If the workflow did not run, verify the PR is targeting `main`

---

## OpenTofu (Local)

### `tofu init` fails: "container not found"

The state blob container must be created manually before first use. See [First-Time Setup — Step 2](first-time-setup.md#step-2--bootstrap-the-opentofu-state-backend).

---

### `tofu plan` shows no changes but resources look different in Azure portal

**Cause:** State is out of sync with actual Azure resources.

**Fix:** Refresh state to reconcile:

```bash
tofu refresh -var-file="terraform.tfvars" -var="subscription_id=<sub-id>"
```

If resources were deleted manually outside of Terraform, you may need to `tofu import` or remove them from state.

---

### `tofu apply` fails with a resource lock error

**Cause:** A previous apply was interrupted and the state file is locked.

**Fix:**

```bash
tofu force-unlock <lock-id>
```

The lock ID is shown in the error message. Only do this if you are certain no other apply is in progress.

---

## Angular / Local Dev

### `npm start` fails: "Cannot find module"

Run `npm install` first. The `node_modules` directory may be missing or out of date.

---

### Tests fail with "Cannot find @angular/core"

Run `npm install`. The Angular test runner requires the full set of Angular packages.

---

### Build output missing from `dist/`

Ensure you are running `npm run build` (not just `ng build` if the CLI is not globally installed).

The expected output path is:

```
dist/nic-p-the-barber-website/browser/
```

This path is referenced in both deploy workflows as `output_location`. If it changes (e.g. after an Angular version upgrade), update both `deploy-dev.yml` and `deploy-prod.yml`.

---

### `ng lint` reports errors after generating a component

The Angular CLI generates components with `standalone: true` set explicitly. Remove the property — it defaults to `true` in Angular 21 and the linter flags it as redundant.

---

## Azure Portal

### Static Web App shows "Your web app is waiting for your content"

**Cause:** No deployment has been made yet, or the latest deployment failed.

**Fix:**
1. Check the **Actions** tab for a failed `Deploy — Dev` or `Deploy — Prod` run
2. Verify the `output_location` in the workflow matches the actual build output path
3. Manually trigger the workflow from **Actions → Deploy — Dev → Run workflow**

---

### Custom domain validation is stuck

If you added a custom domain via OpenTofu (`custom_domain` variable), the DNS CNAME must exist before the apply runs. Azure validates the CNAME during the apply step.

**Fix:**
1. Create the CNAME record in your DNS provider pointing to the SWA `default_host_name`
2. Wait for DNS propagation (~5 minutes for most providers)
3. Re-run the OpenTofu apply
