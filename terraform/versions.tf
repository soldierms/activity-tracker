terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # Uncomment and configure once you have an S3 bucket + DynamoDB table for
  # remote state (see terraform/README.md). Local state is fine to start.
  # backend "s3" {
  #   bucket         = "activity-tracker-tfstate"
  #   key            = "activity-tracker/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "activity-tracker-tflock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
