# installation steps

## Prerequisites

Install:

- Bun
- Docker
- Docker Compose
- PostgreSQL (optional if using Docker)
- Redis (optional if using Docker)

Check versions:

```bash
bun --version
docker --version
docker compose version
```

---

# Clone Repository

```bash
git clone <repo-url>

cd perps-exchange-platform
```

---

# Install Dependencies

```bash
bun install
```

---

# Option 1

## Running locally using docker-compose

```
mv .env.example .env.prod
```

```
docker compose docker-compose.prod.yml up -d
```

```
cd apps/frontend
```

Create:

```bash
apps/backend/.env
```

```env
NEXT_PUBLIC_API_URL = http://localhost:3001
NEXT_PUBLIC_WS_URL = ws://localhost:3002

AUTH_SECRET = secret
NEXTAUTH_SECRET = secret

```

```bash
bun run dev
```

---

# option 2

## run locally using manual setup

Environment Variables

## Backend

Create:

```bash
apps/backend/.env
```

```env
PORT=3001
DATABASE_URL=postgresql://postgres:perps@localhost:5432/perps_exchange
JWT_SECRET=super-secret-change-this
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

---

## DB Worker

Create:

```bash
apps/db-worker/.env
```

```env

DATABASE_URL=postgresql://postgres:perps@localhost:5432/perps_exchange
REDIS_URL=redis://localhost:6379

```

---

## WS Gateway

Create:

```bash
apps/ws-gateway/.env
```

```env
WS_PORT=3002
JWT_SECRET=super-secret-change-this
REDIS_URL=redis://localhost:6379

```

---

## Engine

Create:

```bash
apps/engine/.env
```

```env
REDIS_URL=redis://localhost:6379
```

---

## PriceWorker

Create:

```bash
apps/priceWorker/.env
```

```env
REDIS_URL=redis://localhost:6379
```

## Frontend

Create:

```bash
apps/frontend/.env
```

```env
NEXT_PUBLIC_API_URL = http://localhost:3001
NEXT_PUBLIC_WS_URL = ws://localhost:3002

AUTH_SECRET = secret
NEXTAUTH_SECRET = secret

```

---

# Start Infrastructure

## Redis + PostgreSQL

```bash
cd docker
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected:

```text
redis
postgres
```

---

# Prisma

Generate client:

```bash
cd packages/db
```

```bash
bunx prisma generate
```

Run migrations:

```bash
bunx prisma migrate dev
```

---

# Start Services

Open separate terminals.

```bash
bun run dev
```

---

# Development Startup Order

```text
1. Docker
2. Prisma Migration
3. Engine
4. DB Worker
5. WS Gateway
6. Backend
7. Frontend
```

---

# Shutdown

Stop all services:

```bash
Ctrl + C
```

Stop infrastructure:

```bash
docker compose down
```

Remove volumes:

```bash
docker compose down -v
```

---

# Reset Everything

Delete Redis + Postgres data:

```bash
docker compose down -v

docker compose up -d
```

Reset database:

```bash
bunx prisma migrate reset
```

Restart:

```bash
bun run dev
```

---
