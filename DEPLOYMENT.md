# Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Steps

```bash
# 1. Clone repository
git clone https://github.com/tmahak798/BE-6B-NotificationEngine-Mahak.git
cd BE-6B-NotificationEngine-Mahak

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your actual values

# 4. Start infrastructure
docker compose up -d

# 5. Wait for all services to be healthy
docker compose ps

# 6. Run migrations
npx ts-node src/database/migrate.ts

# 7. Seed test data
npx ts-node src/database/seed.ts

# 8. Start server
npx ts-node src/index.ts
```

## Docker Production Build

```bash
# Build production image
docker build -t notification-engine:latest .

# Run container
docker run -p 3000:3000 --env-file .env notification-engine:latest
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | notification_engine |
| DB_USER | Database user | notification_user |
| DB_PASSWORD | Database password | your_password |
| DATABASE_URL | Full connection string | postgresql://... |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | your_password |
| RABBITMQ_USER | RabbitMQ username | admin |
| RABBITMQ_PASSWORD | RabbitMQ password | your_password |
| NODE_ENV | Environment | production |
| APP_PORT | Server port | 3000 |
| JWT_SECRET | JWT signing key | your_secret |

## Health Checks

```bash
# System health
curl http://localhost:3000/health

# Provider circuit breaker status
curl http://localhost:3000/api/v1/health/providers

# Prometheus metrics
curl http://localhost:3000/metrics
```

## Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching, rate limiting, frequency caps |
| Kafka | 9092 | Event streaming |
| RabbitMQ | 5672 | Message routing |
| RabbitMQ UI | 15672 | Management dashboard |

## Stopping Services

```bash
# Stop all containers
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```