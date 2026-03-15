variable "resource_group_name" {
  description = "Name of the Azure resource group to create."
  type        = string
}

variable "location" {
  description = "Azure region where resources will be deployed."
  type        = string
  default     = "westus2"
}

variable "static_webapp_name" {
  description = "Name of the Azure Static Web App."
  type        = string
}

variable "sku_tier" {
  description = "SKU tier for the Static Web App. Use \"Free\" for dev or \"Standard\" for prod."
  type        = string
  default     = "Free"
}

variable "tags" {
  description = "Azure resource tags applied to all provisioned resources."
  type        = map(string)
  default     = {}
}
