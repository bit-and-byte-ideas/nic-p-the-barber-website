terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Subscription and OIDC credentials are supplied at runtime via ARM_* environment
# variables set by the azure/login action in the reusable CI/CD workflow.
provider "azurerm" {
  features {}
}
