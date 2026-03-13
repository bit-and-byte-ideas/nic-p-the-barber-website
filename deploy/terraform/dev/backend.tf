# Remote state backend — all values are supplied at runtime via -backend-config flags
# passed by the reusable CI/CD workflow (TF_BACKEND_* secrets).
#
# To initialise locally:
#   tofu init \
#     -backend-config="resource_group_name=<rg>" \
#     -backend-config="storage_account_name=<sa>" \
#     -backend-config="container_name=tfstate" \
#     -backend-config="key=nic-p-barber-dev.tfstate"
terraform {
  backend "azurerm" {}
}
