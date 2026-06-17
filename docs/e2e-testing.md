# End-to-End Testing (need to correct the margin/qty scaling)
---



This section walks through the complete flow of the exchange from funding an account to order matching, persistence, realtime updates, and liquidation.

---

# Prerequisites

Before testing, ensure the following services are running:

- Engine
- Backend
- DB Worker
- WS Gateway
- PostgreSQL
- Redis

---

# Step 1 — Create User

Create two users.

```
User A
```

```
POST /signup
```

```json
{
  "email": "user1@test.com",
  "password": "123456"
}
```

---

```
User B
```

```
POST /signup
```

```json
{
  "email": "user2@test.com",
  "password": "123456"
}
```

Expected

```
201 Created
```

---

# Step 2 — Login

```
POST /signin
```

```json
{
  "email": "user1@test.com",
  "password": "123456"
}
```

Repeat for User B.

Expected

```
HTTP 200
```

Cookie

```
token=<jwt>
```

should be stored.

---

# Step 3 — On Ramp

```
POST /balance/onramp
```

```json
{
    "amount":1000000
}
```

Expected

```json
{
    "available":1000000,
    "locked":0
}
```

Verify

```
GET /balance
```

Expected

```json
{
    "available":1000000,
    "locked":0
}
```

---

# Step 4 — Open WebSocket

Connect

```
ws://localhost:3002
```

Header

```
Cookie:
token=<jwt>
```

Subscribe

```json
{
    "type":"SUBSCRIBE_MARKET",
    "marketId":"BTCUSDT"
}
```

Expected

```
Connection successful
```

---

# Step 5 — Create Buy Limit Order

User A

```
POST /orders
```

```json
{
    "marketId":"BTCUSDT",
    "side":"BID",
    "orderType":"LIMIT",
    "price":100000,
    "qty":1,
    "margin":10000,
    "leverage":10
}
```

Expected

```
ORDER_ACCEPTED
```

Balance

```
available ↓
locked ↑
```

Depth

```
100000
BUY 1
```

WebSocket

```
DEPTH_UPDATE
ORDER_UPDATE
BALANCE_UPDATE
```

Database

```
Order inserted
```

---

# Step 6 — Verify Orderbook

```
GET /depth?marketId=BTCUSDT
```

Expected

```text
BUY

100000
```

---

# Step 7 — Create Matching Sell Order

User B

```
POST /orders
```

```json
{
    "marketId":"BTCUSDT",
    "side":"ASK",
    "orderType":"LIMIT",
    "price":100000,
    "qty":1,
    "margin":10000,
    "leverage":10
}
```

Expected

```
Immediate Match
```

---

Engine should

```
Create Fill

Update Orders

Update Positions

Update Balances

Update Depth
```

---

WebSocket

```
TRADE_UPDATE

DEPTH_UPDATE

ORDER_UPDATE

POSITION_UPDATE

BALANCE_UPDATE
```

---

Database

```
Order

Fill

Balance

ClosedPosition (if applicable)
```

---

# Step 8 — Verify Positions

```
GET /positions
```

User A

```text
LONG
```

User B

```text
SHORT
```

---

# Step 9 — Verify Orders

```
GET /orders
```

Expected

```
FILLED
```

---

# Step 10 — Partial Fill Test

User A

```
BUY

5 BTC
```

User B

```
SELL

2 BTC
```

Expected

```
BUY

PARTIALLY_FILLED
```

Remaining

```
3 BTC
```

still in orderbook.

---

# Step 11 — Cancel Remaining Order

```
DELETE /orders/:id
```

Expected

```
ORDER_CANCELLED
```

Balance

```
unused margin returned
```

Depth

```
removed
```

---

# Step 12 — Market Order

Create

```json
{
    "marketId":"BTCUSDT",
    "side":"BID",
    "orderType":"MARKET",
    "qty":1,
    "margin":10000,
    "leverage":10
}
```

Expected

```
Matches immediately
```

No remaining quantity stored.

---

# Step 13 — Market Order Without Liquidity

Empty orderbook.

Create

```
MARKET BUY
```

Expected

```
ORDER_REJECTED
```

Unused margin returned.

---

# Step 14 — Liquidation Test

Publish mark price.

```
PRICE_UPDATES
```

Example

```json
{
    "marketId":"BTCUSDT",
    "price":50000
}
```

Expected

```
Position liquidated
```

Engine

```
Delete Position

Create ClosedPosition

Release Margin
```

WebSocket

```
POSITION_LIQUIDATED

POSITION_UPDATE

BALANCE_UPDATE
```

Database

```
ClosedPosition inserted
```

---

# Step 15 — Snapshot

Wait

```
30 seconds
```

Expected

```
snapshots/engine.json
```

created.

---

# Step 16 — Recovery

Stop Engine.

Restart.

Expected

```
snapshot loaded
```

Verify

```
Balances restored

Orders restored

Positions restored

Orderbook restored
```

---

# Verify PostgreSQL

Run

```sql
SELECT * FROM "Balance";

SELECT * FROM "Order";

SELECT * FROM "Fill";

SELECT * FROM "ClosedPosition";
```

Expected

All data persisted.

---

# Verify Redis Streams

```
XRANGE ENGINE_REQUESTS - +

XRANGE ENGINE_RESPONSES - +

XRANGE DB_EVENTS - +

XRANGE PRICE_UPDATES - +
```

Expected

Events present.

---

# Verify WebSocket

Public events

```
DEPTH_UPDATE

TRADE_UPDATE

MARK_PRICE_UPDATE
```

Private events

```
ORDER_UPDATE

BALANCE_UPDATE

POSITION_UPDATE

POSITION_LIQUIDATED
```

Only authenticated owner should receive private events.

---

# Complete Flow

```text
User
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
 ├── Generate Fill
 ├── Publish DB Events
 ├── Publish WS Events
 │
 ▼
ENGINE_RESPONSES
 │
 ▼
Backend
 │
 ▼
HTTP Response

                 ┌───────────────┐
                 │               │
                 ▼               ▼
          DB_EVENTS         WS_EVENTS
                 │               │
                 ▼               ▼
           DB Worker       WS Gateway
                 │               │
                 ▼               ▼
           PostgreSQL      WebSocket Clients
```

---

# Features Verified

- ✅ User Authentication
- ✅ On Ramp
- ✅ Balance Management
- ✅ Limit Orders
- ✅ Market Orders
- ✅ Partial Fills
- ✅ Full Fills
- ✅ Order Cancellation
- ✅ Orderbook Updates
- ✅ FIFO Matching
- ✅ Position Management
- ✅ Realized PnL
- ✅ Unrealized PnL
- ✅ Liquidation Engine
- ✅ Snapshot Recovery
- ✅ Redis Streams
- ✅ Redis Pub/Sub
- ✅ PostgreSQL Persistence
- ✅ WebSocket Broadcasting
- ✅ Multi-Market Support