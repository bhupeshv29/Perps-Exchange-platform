import type { Depth, Fill, Order, Position, UserBalance } from "@repo/common";

export type BalanceResponse = {
  type: "BALANCE";
  requestId: string;
  payload: UserBalance;
};

export type PositionsResponse = {
  type: "POSITIONS";
  requestId: string;
  payload: Position[];
};

export type DepthResponse = {
  type: "DEPTH";
  requestId: string;
  payload: Depth;
};

export type OrdersResponse = {
  orders: Order[];
};

export type FillsResponse = {
  fills: Fill[];
};

export type CreateOrderResponse = {
  type: "ORDER_ACCEPTED" | "ORDER_REJECTED" | "ERROR";
  requestId: string;
  payload?: {
    order: Order;
    fills: Fill[];
  };
  error?: string;
};

export type CancelOrderResponse = {
  type: "ORDER_CANCELLED" | "ERROR";
  requestId: string;
  payload?: {
    orderId: string;
  };
  error?: string;
};

export type DepositResponse = {
  type: "ON_RAMP_SUCCESS";
  requestId: string;
  payload: UserBalance;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type CandlesResponse = {
  marketId: string;
  interval: string;
  candles: Candle[];
};
