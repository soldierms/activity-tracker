# Terraform — AWS infrastructure

Provisions everything needed to run the app on AWS: VPC, ECR repos, RDS
Postgres, an ECS Fargate cluster running the backend and frontend as
separate services, and a single Application Load Balancer routing between
them by path.

## Architecture

```
Internet
   │
   ▼
   ALB (port 80)
   ├── /auth/* /categories/* /activities/* /tasks/* /goals/*
   │   /dashboard* /reports/* /ai/* /health   → backend target group (:8000)
   └── everything else                        → frontend target group (:3000)
         │                    │
         ▼                    ▼
   ECS Fargate: backend   ECS Fargate: frontend
   (public subnets)       (public subnets)
         │
         ▼
   RDS Postgres (private subnets, no internet route)
```

## Deliberate simplifications (read before deploying)

- **No NAT gateway.** ECS tasks run in public subnets with public IPs
  instead of routing outbound traffic through a NAT gateway, saving
  ~$32/month. Fine for a personal project; a stricter setup would put tasks
  in private subnets behind a NAT.
- **No domain / HTTPS.** The ALB only listens on port 80. Adding a real
  domain means: buy/point a domain at Route53, request an ACM certificate,
  add an HTTPS (443) listener with that cert, and redirect 80 → 443.
- **No Multi-AZ RDS, no deletion protection, `skip_final_snapshot = true`.**
  Cheap and easy to tear down — not what you'd want for real user data.
- **Path-based routing, not a shared `/api` prefix.** The backend's FastAPI
  routers are mounted directly (see `backend/app/main.py`); the ALB listener
  rule in `alb.tf` lists each router's path prefix explicitly. If you add a
  new top-level router, add its prefix to that rule too.

## One-time setup

1. Install Terraform (>= 1.5) and configure AWS credentials (`aws configure`
   or environment variables) for an account/IAM user with permission to
   create VPC, RDS, ECS, ECR, ALB, IAM, and Secrets Manager resources.
2. `cp terraform.tfvars.example terraform.tfvars` and edit as needed.
3. `terraform init`
4. `terraform plan` — review what it will create.
5. `terraform apply` — this creates real, billable AWS resources. Nothing in
   this repo runs `apply` for you.

The first apply builds the VPC/RDS/ECR/ALB/ECS *scaffolding*, but the ECS
services will fail to start healthy tasks until real Docker images exist in
ECR — that's what the CI/CD pipeline in `.github/workflows/deploy.yml` does
on every push to `main` (build, push to ECR, force a new ECS deployment).

## Cost estimate (rough, us-east-1)

- RDS db.t4g.micro: ~$12/month
- ECS Fargate (2 tasks, 0.25 vCPU / 512MB each, always on): ~$18/month
- ALB: ~$16/month
- ECR, Secrets Manager, CloudWatch logs: a few dollars/month

Roughly **$45-55/month** kept running continuously. `terraform destroy` when
you're done experimenting.

## Tearing down

```bash
terraform destroy
```
