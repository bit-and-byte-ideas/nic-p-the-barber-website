locals {
  prefix = "nic-p-barber-${var.environment}"

  default_tags = {
    project     = "nic-p-the-barber-website"
    environment = var.environment
    managed_by  = "terraform"
  }

  tags = merge(local.default_tags, var.tags)
}

# ─── Resource Group ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "rg" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# ─── Azure Static Web App ─────────────────────────────────────────────────────

resource "azurerm_static_web_app" "app" {
  name                = "${local.prefix}-swa"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  # dev  → Free   ($0/month, no SLA)
  # prod → Standard ($9/month, SLA, custom domains)
  sku_tier = var.sku_tier
  sku_size = var.sku_size

  tags = local.tags
}
