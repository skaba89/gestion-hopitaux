# HealthFlow Guinea Deployment Guide

## Stack
- Next.js 16
- Prisma
- PostgreSQL 16
- Redis 7
- Docker Compose

## Local startup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Docker startup

```bash
docker compose build --no-cache
docker compose up -d
```

## Validation

```bash
npm run validate
npm run test:ci
```

## Production recommendations

- Use HTTPS with reverse proxy
- Enable automated PostgreSQL backups
- Use external Redis in production
- Enable monitoring and alerting
- Rotate secrets regularly
