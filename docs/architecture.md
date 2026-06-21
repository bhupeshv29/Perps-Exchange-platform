Here are safe Mermaid diagrams you can paste directly into README.

## 1. High-level architecture

```mermaid
flowchart LR
    Frontend["Next.js Frontend"]
    Backend["Backend API"]
    RedisStreams["Redis Streams"]
    Engine["Matching Engine"]
    DBWorker["DB Worker"]
    WSGateway["WS Gateway"]
    Postgres["PostgreSQL"]
    Clients["WebSocket Clients"]
    Frontend -->|REST API| Backend
    Backend -->|ENGINE_REQUESTS| RedisStreams
    RedisStreams --> Engine
    Engine -->|ENGINE_RESPONSES| RedisStreams
    Engine -->|DB_EVENTS| RedisStreams
    Engine -->|WS_EVENTS| RedisStreams
    RedisStreams --> DBWorker
    DBWorker --> Postgres
    RedisStreams --> WSGateway
    WSGateway --> Clients
```
---

2. Order creation flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Redis as Redis Streams
    participant Engine
    participant DBWorker as DB Worker
    participant Postgres as PostgreSQL
    participant WSGateway as WS Gateway
    User->>Frontend: Submit order
    Frontend->>Backend: POST /orders
    Backend->>Backend: Authenticate user
    Backend->>Backend: Validate request
    Backend->>Redis: Publish CREATE_ORDER request
    Redis->>Engine: Consume request
    Engine->>Engine: Validate margin and balance
    Engine->>Engine: Match against orderbook
    Engine->>Engine: Update order state
    Engine->>Engine: Update balances and positions
    Engine->>Redis: Publish ENGINE_RESPONSE
    Engine->>Redis: Publish DB_EVENTS
    Engine->>Redis: Publish WS_EVENTS
    Redis->>DBWorker: Consume DB_EVENTS
    DBWorker->>Postgres: Persist orders, fills, balances
    Redis->>WSGateway: Consume WS_EVENTS
    WSGateway->>Frontend: Push realtime updates
    Backend-->>Frontend: Return order response
```
---

3. Engine internal flow
```mermaid
flowchart TD
    Request["Engine Request"]
    Validate["Validate Request"]
    Market["Locate Market"]
    Book["Load Orderbook"]
    Match["Match Order"]
    Trades["Generate Trades"]
    Orders["Update Orders"]
    Balances["Update Balances"]
    Positions["Update Positions"]
    Risk["Run Risk Checks"]
    Events["Publish Events"]
    Response["Return Response"]
    Request --> Validate
    Validate --> Market
    Market --> Book
    Book --> Match
    Match --> Trades
    Trades --> Orders
    Orders --> Balances
    Balances --> Positions
    Positions --> Risk
    Risk --> Events
    Events --> Response
```
---

4. Orderbook matching flow
```mermaid
flowchart TD
    Incoming["Incoming Order"]
    Side{"Order Side?"}
    Incoming --> Side
    Side -->|Buy| BestAsk["Find Best Ask"]
    Side -->|Sell| BestBid["Find Best Bid"]
    BestAsk --> BuyMatch{"Can Match?"}
    BestBid --> SellMatch{"Can Match?"}
    BuyMatch -->|Yes| ExecuteBuy["Execute Trade"]
    BuyMatch -->|No| RestBuy{"Limit Order?"}
    SellMatch -->|Yes| ExecuteSell["Execute Trade"]
    SellMatch -->|No| RestSell{"Limit Order?"}
    ExecuteBuy --> BuyFilled{"Fully Filled?"}
    ExecuteSell --> SellFilled{"Fully Filled?"}
    BuyFilled -->|No| BestAsk
    SellFilled -->|No| BestBid
    BuyFilled -->|Yes| Done["Finish"]
    SellFilled -->|Yes| Done
    RestBuy -->|Yes| AddBid["Add To Bids"]
    RestBuy -->|No| Done
    RestSell -->|Yes| AddAsk["Add To Asks"]
    RestSell -->|No| Done
    AddBid --> Done
    AddAsk --> Done
```
---

5. Position lifecycle
```mermaid
flowchart TD
    Trade["Trade Executed"]
    Existing{"Existing Position?"}
    Open["Open New Position"]
    Direction{"Same Direction?"}
    Increase["Increase Position"]
    Compare{"Close Qty >= Position Qty?"}
    Reduce["Reduce Position"]
    Close["Close Position"]
    Flip["Flip Position"]
    Recalc["Recalculate Entry, Margin, PnL"]
    Publish["Publish Position Event"]
    Trade --> Existing
    Existing -->|No| Open
    Existing -->|Yes| Direction
    Direction -->|Yes| Increase
    Direction -->|No| Compare
    Compare -->|Less| Reduce
    Compare -->|Equal| Close
    Compare -->|Greater| Flip
    Open --> Recalc
    Increase --> Recalc
    Reduce --> Recalc
    Close --> Recalc
    Flip --> Recalc
    Recalc --> Publish
```
---
6. Liquidation flow
```mermaid
flowchart TD
    PriceUpdate["Mark Price Update"]
    Positions["Load Open Positions"]
    PnL["Recalculate Unrealized PnL"]
    Equity["Calculate Equity"]
    Check{"Equity <= Maintenance Margin?"}
    Safe["Position Safe"]
    Liquidate["Liquidate Position"]
    Close["Close Position"]
    Balance["Update Balance"]
    Events["Publish Liquidation Events"]
    PriceUpdate --> Positions
    Positions --> PnL
    PnL --> Equity
    Equity --> Check
    Check -->|No| Safe
    Check -->|Yes| Liquidate
    Liquidate --> Close
    Close --> Balance
    Balance --> Events
```
---

7. Redis streams architecture
```mermaid
flowchart LR
    Backend["Backend API"]
    EngineRequests["ENGINE_REQUESTS Stream"]
    Engine["Matching Engine"]
    EngineResponses["ENGINE_RESPONSES Stream"]
    DBEvents["DB_EVENTS Stream"]
    DBWorker["DB Worker"]
    Postgres["PostgreSQL"]
    Backend --> EngineRequests
    EngineRequests --> Engine
    Engine --> EngineResponses
    EngineResponses --> Backend
    Engine --> DBEvents
    DBEvents --> DBWorker
    DBWorker --> Postgres
```
---
8. WebSocket event architecture
```mermaid
flowchart LR
    Engine["Matching Engine"]
    RedisPubSub["Redis Pub/Sub"]
    WSGateway["WS Gateway"]
    TraderA["Trader A"]
    TraderB["Trader B"]
    TraderC["Trader C"]
    Engine --> RedisPubSub
    RedisPubSub --> WSGateway
    WSGateway --> TraderA
    WSGateway --> TraderB
    WSGateway --> TraderC
```
---
9. Authentication architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextAuth
    participant Backend
    participant Database
    User->>Frontend: Enter email and password
    Frontend->>NextAuth: signIn credentials
    NextAuth->>Backend: POST /auth/signin
    Backend->>Database: Verify user password
    Database-->>Backend: User record
    Backend->>Backend: Generate backend JWT
    Backend-->>NextAuth: User and backend JWT
    NextAuth->>NextAuth: Store session
    NextAuth-->>Frontend: Authenticated session
```
---
10. API authentication flow

```mermaid
flowchart LR
    Component["React Component"]
    Hook["React Query Hook"]
    Service["API Service"]
    Axios["Axios Interceptor"]
    Session["NextAuth Session"]
    Backend["Backend API"]
    Middleware["requireAuth Middleware"]
    Component --> Hook
    Hook --> Service
    Service --> Axios
    Axios --> Session
    Session -->|backendToken| Axios
    Axios -->|Authorization Bearer Token| Backend
    Backend --> Middleware
```
---
11. WebSocket authentication flow
```mermaid
sequenceDiagram
    participant Frontend
    participant NextAuth
    participant WSGateway as WS Gateway
    participant Redis
    participant Engine
    Frontend->>NextAuth: getSession()
    NextAuth-->>Frontend: backendToken
    Frontend->>WSGateway: Connect with token
    WSGateway->>WSGateway: Verify JWT
    WSGateway-->>Frontend: Connection accepted
    Frontend->>WSGateway: Subscribe market
    Engine->>Redis: Publish WS event
    Redis->>WSGateway: Deliver event
    WSGateway->>Frontend: Send realtime update
```
---
12. Frontend data flow
```mermaid
flowchart TD
    UI["React Components"]
    Hooks["Custom Hooks"]
    Services["API Services"]
    Axios["Axios Client"]
    Backend["Backend API"]
    Query["TanStack Query"]
    Zustand["Zustand Stores"]
    WSManager["WebSocket Manager"]
    WSGateway["WS Gateway"]
    UI --> Hooks
    Hooks --> Query
    Query --> Services
    Services --> Axios
    Axios --> Backend
    WSGateway --> WSManager
    WSManager --> Zustand
    Zustand --> UI
    Query --> UI
```
---
13. Deployment architecture
```mermaid
flowchart LR
    Users["Users"]
    Frontend["Frontend"]
    Backend["Backend API"]
    Redis["Redis"]
    Engine["Engine"]
    DBWorker["DB Worker"]
    WSGateway["WS Gateway"]
    PriceWorker["Price Worker"]
    Postgres["PostgreSQL"]
    Users --> Frontend
    Frontend --> Backend
    Frontend --> WSGateway
    Backend --> Redis
    Redis --> Engine
    PriceWorker --> Redis
    Engine --> Redis
    Redis --> DBWorker
    Redis --> WSGateway
    DBWorker --> Postgres
    ```
