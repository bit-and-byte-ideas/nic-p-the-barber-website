module "static_webapp" {
  # Pin to a release tag once one is cut on the kit repo (e.g. ?ref=v0.1.0).
  source = "github.com/bit-and-byte-ideas/azure-static-webapp-cicd-kit//modules/azure-static-webapp?ref=main"

  resource_group_name = var.resource_group_name
  location            = var.location
  static_webapp_name  = var.static_webapp_name
  sku_tier            = var.sku_tier
  tags                = var.tags
}
