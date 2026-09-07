output "alb_dns_name" {
  description = "Public URL for the app (frontend + backend behind path routing)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "db_endpoint" {
  value     = aws_db_instance.main.address
  sensitive = true
}
