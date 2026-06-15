export type Side = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";

export type OrderStatus =
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "REJECTED";

export type PositionSide = "LONG" | "SHORT";

export type Order = {
  id: string;
  userId: string;
  marketId: string;
  side: Side;
  type: OrderType;
  price?: number;
  qty: number;
  filledQty: number;
  margin: number;
  leverage: number;
  status: OrderStatus;
  createdAt: number;
};
export type Fill = {
  id: string;
  marketId: string;
  makerOrderId: string;
  takerOrderId: string;
  makerUserId: string;
  takerUserId: string;
  price: number;
  qty: number;
  createdAt: number;
};
export type Position = {
  userId: string;
  marketId: string;
  side: PositionSide;
  qty: number;
  entryPrice: number;
  margin: number;
  leverage: number;
  realizedPnl: number;
  updatedAt: number;
};

export type UserBalance = {
  userId: string;
  available: number;
  locked: number;
};

export type DepthLevel = [price: number, qty: number];

export type Depth = {
  marketId: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
};

export type EngineRequest =
  | {
      type: "CREATE_ORDER";
      requestId: string;
      payload: {
        userId: string;
        marketId: string;
        side: Side;
        orderType: OrderType;
        price?: number;
        qty: number;
        margin: number;
        leverage: number;
      };
    }
  | {
      type: "CANCEL_ORDER";
      requestId: string;
      payload: {
        userId: string;
        marketId: string;
        orderId: string;
      };
    }
  | {
      type: "GET_DEPTH";
      requestId: string;
      payload: {
        marketId: string;
      };
    }
  | {
      type: "GET_BALANCE";
      requestId: string;
      payload: {
        userId: string;
      };
    }
  | {
      type: "GET_POSITIONS";
      requestId: string;
      payload: {
        userId: string;
      };
    }
  | {
      type: "ON_RAMP";
      requestId: string;
      payload: {
        userId: string;
        amount: number;
      };
    };

export type EngineRequestType = EngineRequest["type"];

export type EngineResponse =
  | {
      type: "ORDER_ACCEPTED";
      requestId: string;
      payload: {
        order: Order;
        fills: Fill[];
      };
    }
  | {
      type: "ORDER_REJECTED";
      requestId: string;
      error: string;
    }
  | {
      type: "ORDER_CANCELLED";
      requestId: string;
      payload: {
        orderId: string;
      };
    }
  | {
      type: "DEPTH";
      requestId: string;
      payload: Depth;
    }
  | {
      type: "BALANCE";
      requestId: string;
      payload: UserBalance;
    }
  | {
      type: "POSITIONS";
      requestId: string;
      payload: Position[];
    }
  | {
      type: "ON_RAMP_SUCCESS";
      requestId: string;
      payload: UserBalance;
    }
  | {
      type: "ERROR";
      requestId: string;
      error: string;
    };

export type EngineResponseType = EngineResponse["type"];

export type DbEvent =
  | {
      type: "ORDER_CREATED";
      payload: Order;
      createdAt: number;
    }
  | {
      type: "ORDER_UPDATED";
      payload: Order;
      createdAt: number;
    }
  | {
      type: "FILL_CREATED";
      payload: Fill;
      createdAt: number;
    }
  | {
      type: "POSITION_UPDATED";
      payload: Position;
      createdAt: number;
    }
  | {
      type: "BALANCE_UPDATED";
      payload: UserBalance;
      createdAt: number;
    };

export type DbEventType = DbEvent["type"];

export type WsEvent =
  | {
      type: "DEPTH_UPDATE";
      marketId: string;
      payload: Depth;
      createdAt: number;
    }
  | {
      type: "TRADE_UPDATE";
      marketId: string;
      payload: Fill;
      createdAt: number;
    }
  | {
      type: "ORDER_UPDATE";
      userId: string;
      payload: Order;
      createdAt: number;
    }
  | {
      type: "POSITION_UPDATE";
      userId: string;
      payload: Position;
      createdAt: number;
    }
  | {
      type: "BALANCE_UPDATE";
      userId: string;
      payload: UserBalance;
      createdAt: number;
    }
  | {
      type: "MARK_PRICE_UPDATE";
      marketId: string;
      payload: {
        price: string;
      };
      createdAt: number;
    };

export type WsEventType = WsEvent["type"];
