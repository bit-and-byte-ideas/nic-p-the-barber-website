resource_group_name = "nic-p-barber-dev-rg"
location            = "westus2"
static_webapp_name  = "nic-p-barber-dev-swa"
sku_tier            = "Free"

tags = {
  owner       = "nic-p-barber"
  environment = "dev"
  managed_by  = "opentofu"
}
