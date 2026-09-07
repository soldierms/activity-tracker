variable "project_name" {
  description = "Short name used to prefix/tag all resources"
  type        = string
  default     = "activity-tracker"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to spread subnets across"
  type        = number
  default     = 2
}

variable "backend_image_tag" {
  description = "Docker image tag to deploy for the backend (set by CI)"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Docker image tag to deploy for the frontend (set by CI)"
  type        = string
  default     = "latest"
}

variable "backend_cpu" {
  description = "Fargate CPU units for the backend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Fargate memory (MB) for the backend task"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Fargate CPU units for the frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Fargate memory (MB) for the frontend task"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Number of backend tasks to run"
  type        = number
  default     = 1
}

variable "frontend_desired_count" {
  description = "Number of frontend tasks to run"
  type        = number
  default     = 1
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "tracker"
}

variable "db_username" {
  description = "Postgres master username"
  type        = string
  default     = "tracker"
}

variable "github_repository" {
  description = "GitHub \"owner/repo\" slug allowed to assume the CI deploy role via OIDC"
  type        = string
  default     = "soldierms/activity-tracker"
}

variable "anthropic_api_key" {
  description = "Anthropic API key for AI features. Leave empty to deploy with AI features disabled."
  type        = string
  default     = ""
  sensitive   = true
}
