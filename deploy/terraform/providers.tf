terraform {
  required_version = ">= 1.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Remote state in Azure Blob Storage.
  # Before first use, create the storage account and container, then run:
  #   terraform init \
  #     -backend-config="resource_group_name=<rg>" \
  #     -backend-config="storage_account_name=<sa>" \
  #     -backend-config="container_name=tfstate" \
  #     -backend-config="key=nic-p-barber-<env>.tfstate"
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
