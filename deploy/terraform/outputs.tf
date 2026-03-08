output "static_web_app_url" {
  description = "Default hostname of the Azure Static Web App"
  value       = "https://${azurerm_static_web_app.app.default_host_name}"
}

output "static_web_app_api_key" {
  description = "Deployment API key — store this as a GitHub Actions secret"
  value       = azurerm_static_web_app.app.api_key
  sensitive   = true
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.rg.name
}
