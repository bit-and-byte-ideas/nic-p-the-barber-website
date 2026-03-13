resource_group_name = "nic-p-barber-prod-rg"
location            = "westus2"
static_webapp_name  = "nic-p-barber-prod-swa"
sku_tier            = "Standard"

tags = {
  owner       = "nic-p-barber"
  environment = "prod"
  managed_by  = "opentofu"
}
