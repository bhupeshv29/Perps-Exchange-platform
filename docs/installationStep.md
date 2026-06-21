# Local Setup

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

# Environment Variables

## Backend

Create:

```bash
apps/backend/.env
```

```env
PORT=3000

JWT_SECRET=secret

DATABASE_URL=postgresql://postgres:"secret"@localhost:5432/perps_exchange

REDIS_URL=redis://localhost:6379
```

---

## DB Worker

Create:

```bash
apps/db-worker/.env
```

```env
DATABASE_URL=postgresql://postgres:secret@localhost:5432/perps_exchange

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

JWT_SECRET=secret

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

# Start Infrastructure

## Redis + PostgreSQL

```bash
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
bunx prisma generate
```

Run migrations:

```bash
bunx prisma migrate dev
```

---

# Start Services

Open separate terminals.

---

## Engine

```bash
cd apps/engine

bun run dev
```

Expected:

```text
snapshot loaded
engine running
```

or

```text
no snapshot found
engine running
```

---

## DB Worker

```bash
cd apps/db-worker

bun run dev
```

Expected:

```text
db worker running
```

---

## WS Gateway

```bash
cd apps/ws-gateway

bun run dev
```

Expected:

```text
ws-gateway running on port 3002
```

---

## Backend

```bash
cd apps/backend

bun run dev
```

Expected:

```text
backend running on port 3000
```

---

## Frontend

```bash
cd apps/frontend

bun run dev
```

Expected:

```text
ready - started server on http://localhost:3001
```

---

# Verify Redis Streams

Open Redis CLI:

```bash
docker exec -it redis redis-cli
```

Check streams:

```redis
XRANGE ENGINE_REQUESTS - +
XRANGE ENGINE_RESPONSES - +
XRANGE DB_EVENTS - +
XRANGE PRICE_UPDATES - +
```

---

# Verify PostgreSQL

```bash
cd packages/db
bunx prisma studio
```

# Service Ports

| Service | Port |
|----------|----------|
| Frontend | 3001 |
| Backend | 3000 |
| WS Gateway | 3002 |
| Redis | 6379 |
| PostgreSQL | 5432 |

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

#docker-compose cmd 
```
mv .env.example .env.prod
```
```
docker compose docker-compose.prod.yml up -d
```
```
cd apps/frontend
bun run dev
```
