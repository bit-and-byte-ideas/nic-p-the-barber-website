variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastus2"
}

variable "environment" {
  description = "Deployment environment (dev or prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be one of: dev, prod."
  }
}

variable "sku_tier" {
  description = "SKU tier for Azure Static Web App (Free or Standard)"
  type        = string

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "sku_tier must be one of: Free, Standard."
  }
}

variable "sku_size" {
  description = "SKU size for Azure Static Web App (Free or Standard)"
  type        = string

  validation {
    condition     = contains(["Free", "Standard"], var.sku_size)
    error_message = "sku_size must be one of: Free, Standard."
  }
}

variable "tags" {
  description = "Additional resource tags to merge with defaults"
  type        = map(string)
  default     = {}
}
