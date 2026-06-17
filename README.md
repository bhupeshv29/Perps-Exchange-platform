# Perps V2

A simplified perpetual futures exchange built from scratch using:

- Next.js Frontend
- Express Backend
- Matching Engine
- Redis Streams
- Redis Pub/Sub
- PostgreSQL
- Prisma
- WebSocket Gateway
- Snapshot Recovery

---

# Architecture

```text
                    ┌─────────────┐
                    │  Frontend   │
                    └──────┬──────┘
                           │
                    HTTP / WS
                           │
                           ▼
                    ┌─────────────┐
                    │   Backend   │
                    └──────┬──────┘
                           │
                EngineRequest Stream
                           │
                           ▼
                    ┌─────────────┐
                    │   Engine    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  EngineResponse     DbEvent Stream     WsEvent PubSub
         │                 │                 │
         ▼                 ▼                 ▼
      Backend         DB Worker        WS Gateway
                           │                 │
                           ▼                 ▼
                      PostgreSQL        WebSocket
```

---

# Services

## Backend

Responsibilities:

- Authentication
- Validation
- HTTP APIs
- Send Engine Requests
- Wait for Engine Response
- Return Response

Backend never modifies:

- balances
- orders
- positions
- orderbooks

Only Engine owns state.

---

## Engine

The Engine is the source of truth.

Responsible for:

- Balance management
- Order creation
- Order cancellation
- Matching
- Position tracking
- Liquidation
- Depth generation
- Snapshot recovery

State lives entirely in memory.

```ts
balances
positions
orders
orderbooks
markPrices
```

---

## DB Worker

Responsible for persistence only.

Consumes:

```text
STREAMS.DB_EVENTS
```

Writes:

```text
PostgreSQL
```

DB Worker never contains business logic.

---

## WS Gateway

Responsible for realtime updates.

Consumes:

```text
CHANNELS.WS_EVENTS
```

Broadcasts:

```text
WebSocket Clients
```

---

# Request Flow

## Create Order

```text
Frontend
   │
   ▼
Backend
   │
   ▼
ENGINE_REQUESTS
   │
   ▼
Engine
   │
   ├── Match Orders
   ├── Update Balances
   ├── Update Positions
   ├── Generate Fills
   │
   ▼
ENGINE_RESPONSES
   │
   ▼
Backend
   │
   ▼
Frontend
```

---

# Persistence Flow

Whenever Engine changes state:

```text
Engine
   │
   ▼
publishDbEvent()
   │
   ▼
DB_EVENTS
   │
   ▼
DB Worker
   │
   ▼
Postgres
```

Examples:

```text
ORDER_CREATED
ORDER_UPDATED
FILL_CREATED
BALANCE_UPDATED
CLOSED_POSITION_CREATED
```

---

# Realtime Flow

Whenever Engine changes state:

```text
Engine
   │
   ▼
publishWsEvent()
   │
   ▼
Redis PubSub
   │
   ▼
WS Gateway
   │
   ▼
Clients
```

Examples:

```text
DEPTH_UPDATE
TRADE_UPDATE
ORDER_UPDATE
BALANCE_UPDATE
POSITION_UPDATE
MARK_PRICE_UPDATE
POSITION_LIQUIDATED
```

---

# Engine State

```ts
balances: Record<string, UserBalance>

positions: Record<string, Position>

orders: Record<string, Order>

orderbooks: Record<string, Orderbook>

markPrices: Record<string, number>
```

---

# Orderbook

Each market owns one orderbook.

```ts
type Orderbook = {
  marketId: string;

  bids: Record<number, Order[]>;

  asks: Record<number, Order[]>;
};
```

Example:

```ts
bids = {
  100000: [order1, order2],
  99900: [order3]
};

asks = {
  100100: [order4],
  100200: [order5]
};
```

---

# Matching Engine

Price-Time Priority (FIFO)

### Buy Order

```text
Match Lowest Ask First
```

### Sell Order

```text
Match Highest Bid First
```

Example:

```text
Bid 100
Bid 99

Ask 101
Ask 102
```

Incoming:

```text
BUY LIMIT 101
```

Matches:

```text
Ask 101
```

first.

---

# Position Logic

### BID

Creates:

```text
LONG
```

### ASK

Creates:

```text
SHORT
```

---

## Position Increase

Existing:

```text
LONG 1 BTC @ 100
```

New Fill:

```text
LONG 1 BTC @ 110
```

Result:

```text
LONG 2 BTC @ 105
```

Weighted average entry.

---

## Position Close

Existing:

```text
LONG 2 BTC @ 100
```

Sell:

```text
1 BTC @ 120
```

Realized:

```text
+20
```

Position:

```text
LONG 1 BTC @ 100
```

---

# PnL

## Unrealized

LONG

```text
(markPrice - entryPrice) * qty
```

SHORT

```text
(entryPrice - markPrice) * qty
```

---

## Equity

```text
margin + unrealizedPnL
```

---

## Maintenance Margin

```text
margin * 10%
```

---

# Liquidation

Triggered by:

```text
Price Worker
```

Flow:

```text
Price Update
      │
      ▼
Update Mark Price
      │
      ▼
Check Equity
      │
      ▼
Equity <= Maintenance Margin
      │
      ▼
Liquidate
```

Engine:

```text
Delete Position
Release Margin
Create ClosedPosition
Publish Events
```

---

# Market Orders

Market order:

```text
Match Immediately
```

Unfilled quantity:

```text
Margin Returned
```

No liquidity:

```text
ORDER_REJECTED
```

---

# Limit Orders

Limit order:

```text
Try Match
```

Remaining quantity:

```text
Added To Orderbook
```

---

# Snapshot System

Every 30 seconds:

```text
Engine State
      │
      ▼
engine.json
```

Saved:

```ts
balances
positions
orders
orderbooks
markPrices
```

---

## Startup Recovery

```text
Engine Start
      │
      ▼
Load Snapshot
      │
      ▼
Restore State
```

---

# Redis Usage

## Streams

Used for reliable processing.

```text
ENGINE_REQUESTS
ENGINE_RESPONSES
DB_EVENTS
PRICE_UPDATES
```

---

## PubSub

Used for realtime delivery.

```text
WS_EVENTS
```

---

# Database Models

Implemented:

```text
User
Balance
Order
Fill
ClosedPosition
```

Removed:

```text
Position
```

Positions only exist inside Engine memory.

Historical closed positions are persisted.

---

# WebSocket Authentication

Client connects:

```text
ws://localhost:3002
```

Cookie:

```text
token=<jwt>
```

Gateway:

```text
verifyToken()
```

Stores:

```ts
client.userId
```

---

# Market Subscription

Subscribe:

```json
{
  "type": "SUBSCRIBE_MARKET",
  "marketId": "BTCUSDT"
}
```

Unsubscribe:

```json
{
  "type": "UNSUBSCRIBE_MARKET",
  "marketId": "BTCUSDT"
}
```

---

# Event Visibility

## Public

Everyone subscribed to market:

```text
DEPTH_UPDATE
TRADE_UPDATE
MARK_PRICE_UPDATE
```

---

## Private

Only owner receives:

```text
ORDER_UPDATE
BALANCE_UPDATE
POSITION_UPDATE
POSITION_LIQUIDATED
```

---

# Current Features

- On Ramp

- Create Order

- Cancel Order

- Orderbook

- Matching Engine

- Fill Generation

- Position Tracking

- Realized PnL

- Unrealized PnL

- Liquidation

- Depth Generation

- Redis Streams

- Redis PubSub

- Snapshot Recovery

- PostgreSQL Persistence

- WebSocket Updates

- Multi Market Support

---

# Future Improvements

- Take Profit
- Funding Rate
- Isolated Margin
- Mark Price Formula
- Multi Engine Sharding
- Multi Market Workers
- Risk Engine
- Admin Panel
- KYC
- Deposits
- Withdrawals
- Rate Limiting
- Horizontal Scaling

## Mermaid Architecture Diagrams

### 1. High-Level System Architecture

```mermaid
flowchart TD
    FE[Frontend / Trading UI] -->|HTTP REST| BE[Backend API]
    FE -->|WebSocket| WS[WS Gateway]

    BE -->|EngineRequest| ER[(Redis Stream: ENGINE_REQUESTS)]
    ER --> ENG[Matching Engine]

    ENG -->|EngineResponse| ERES[(Redis Stream: ENGINE_RESPONSES)]
    ERES --> BE

    ENG -->|DbEvent| DBE[(Redis Stream: DB_EVENTS)]
    DBE --> DBW[DB Worker]
    DBW --> PG[(PostgreSQL)]

    ENG -->|WsEvent| WSE[(Redis PubSub: WS_EVENTS)]
    WSE --> WS
    WS --> FE

    PW[Price Worker] -->|Mark Price Update| PU[(Redis Stream: PRICE_UPDATES)]
    PU --> ENG

    ENG --> SNAP[(Local Snapshot File)]
```

---

### 2. Create Order Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant RedisReq as Redis ENGINE_REQUESTS
    participant ENG as Engine
    participant RedisRes as Redis ENGINE_RESPONSES
    participant DBE as Redis DB_EVENTS
    participant WSE as Redis WS_EVENTS
    participant DBW as DB Worker
    participant WS as WS Gateway

    FE->>BE: POST /orders
    BE->>RedisReq: publish CREATE_ORDER
    RedisReq->>ENG: consume request

    ENG->>ENG: validate market, balance, leverage
    ENG->>ENG: lock margin
    ENG->>ENG: match orderbook
    ENG->>ENG: update order, fills, positions, balance

    ENG-->>DBE: publish ORDER_CREATED / ORDER_UPDATED / FILL_CREATED
    ENG-->>WSE: publish ORDER_UPDATE / DEPTH_UPDATE / TRADE_UPDATE
    ENG->>RedisRes: publish ORDER_ACCEPTED

    RedisRes->>BE: consume response
    BE->>FE: HTTP response

    DBE->>DBW: consume db events
    DBW->>DBW: persist with Prisma

    WSE->>WS: consume ws event
    WS->>FE: realtime websocket update
```

---

### 3. Matching Engine Flow

```mermaid
flowchart TD
    A[Incoming Order] --> B{Side?}

    B -->|BID| C[Match Against Best Ask]
    B -->|ASK| D[Match Against Best Bid]

    C --> E{Can Match?}
    D --> E

    E -->|Yes| F[Create Fill]
    F --> G[Update Taker Filled Qty]
    G --> H[Update Maker Filled Qty]
    H --> I[Update Order Status]
    I --> J[Remove Filled Maker Orders]
    J --> E

    E -->|No| K{Remaining Qty?}

    K -->|No| L[Order Fully Filled]
    K -->|Yes + LIMIT| M[Add Remaining Order To Book]
    K -->|Yes + MARKET| N[Reject / Release Unused Margin]

    L --> O[Publish Events]
    M --> O
    N --> O
```

---

### 4. Position Engine Flow

```mermaid
flowchart TD
    A[Fill Created] --> B[Apply Fill To Maker Order]
    A --> C[Apply Fill To Taker Order]

    B --> D[Resolve Order Side]
    C --> D

    D --> E{Order Side}

    E -->|BID| F[Incoming Position Side = LONG]
    E -->|ASK| G[Incoming Position Side = SHORT]

    F --> H{Opposite Position Exists?}
    G --> H

    H -->|Yes| I[Close Opposite Position]
    I --> J[Calculate Realized PnL]
    J --> K[Release Margin]
    K --> L{Remaining Fill Qty?}

    H -->|No| L

    L -->|Yes| M[Increase / Create New Position]
    L -->|No| N[Position Update Complete]

    M --> N
```

---

### 5. Liquidation Flow

```mermaid
flowchart TD
    A[Price Worker Publishes Price] --> B[Redis PRICE_UPDATES]
    B --> C[Engine Price Consumer]
    C --> D[Update Mark Price]
    D --> E[Check All Positions For Market]

    E --> F[Calculate Unrealized PnL]
    F --> G[Calculate Equity]
    G --> H[Calculate Maintenance Margin]

    H --> I{Equity <= Maintenance Margin?}

    I -->|No| J[Keep Position Open]
    I -->|Yes| K[Liquidate Position]

    K --> L[Create ClosedPosition Event]
    L --> M[Delete Position From Engine State]
    M --> N[Update Balance]
    N --> O[Publish POSITION_LIQUIDATED]
    O --> P[Publish POSITION_UPDATE]
```

---

### 6. Snapshot Recovery Flow

```mermaid
flowchart TD
    A[Engine Running] --> B[Every 30 Seconds]
    B --> C[Save Engine State]
    C --> D[snapshots/engine.json]

    E[Engine Restart] --> F[Connect Redis]
    F --> G[Create Consumer Groups]
    G --> H[Load Snapshot File]
    H --> I[Restore Balances]
    H --> J[Restore Positions]
    H --> K[Restore Orders]
    H --> L[Restore Orderbooks]
    H --> M[Restore Mark Prices]
    I --> N[Engine Ready]
    J --> N
    K --> N
    L --> N
    M --> N
```

---

### 7. Redis Streams and PubSub

```mermaid
flowchart LR
    BE[Backend] -->|XADD| ER[ENGINE_REQUESTS]
    ER -->|XREADGROUP| ENG[Engine]

    ENG -->|XADD| ERES[ENGINE_RESPONSES]
    ERES -->|XREADGROUP| BE

    ENG -->|XADD| DBE[DB_EVENTS]
    DBE -->|XREADGROUP| DBW[DB Worker]

    PW[Price Worker] -->|XADD| PU[PRICE_UPDATES]
    PU -->|XREADGROUP| ENG

    ENG -->|PUBLISH| WSE[WS_EVENTS]
    WSE -->|SUBSCRIBE| WS[WS Gateway]
```

---

### 8. WebSocket Broadcast Logic

```mermaid
flowchart TD
    A[Client Connects WS] --> B[Read Cookie From Handshake]
    B --> C{Valid JWT?}

    C -->|Yes| D[Attach userId To Client]
    C -->|No| E[Unauthenticated Client]

    D --> F[Client Sends SUBSCRIBE_MARKET]
    E --> F

    F --> G[Add marketId To Client Subscriptions]

    H[WsEvent Received From Redis] --> I{Private Event?}

    I -->|Yes| J{client.userId == event.userId?}
    J -->|Yes| K[Send Event To Client]
    J -->|No| L[Skip Client]

    I -->|No| M{Client Subscribed To Market?}
    M -->|Yes| K
    M -->|No| L
```