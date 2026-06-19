import type { WsEvent } from "@repo/common";

import { useTradeStore } from "@/stores/trade-store";
import { useWsStore } from "@/stores/ws-store";
import { useAccountStore } from "@/stores/account-store";

export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private currentMarket: string | null = null;

  private constructor() {}

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }

    return WebSocketManager.instance;
  }

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    this.ws.onopen = () => {
      useWsStore.getState().setConnected(true);
      console.log("ws connected");

      if (this.currentMarket) {
        this.send({
          type: "SUBSCRIBE_MARKET",
          marketId: this.currentMarket,
        });
      }
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = () => {
      useWsStore.getState().setConnected(false);
      this.ws = null;
      console.log("ws disconnected");
    };

    this.ws.onerror = () => {
      useWsStore.getState().setConnected(false);
      console.log("ws error");
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    useWsStore.getState().setConnected(false);
  }

  subscribeMarket(marketId: string) {
    this.currentMarket = marketId;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send({
      type: "SUBSCRIBE_MARKET",
      marketId,
    });
  }

  unsubscribeMarket(marketId: string) {
    if (this.currentMarket === marketId) {
      this.currentMarket = null;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.send({
      type: "UNSUBSCRIBE_MARKET",
      marketId,
    });
  }

  private send(message: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(raw: string) {
    try {
      const event = JSON.parse(raw) as WsEvent;

      const tradeStore = useTradeStore.getState();
      const accountStore = useAccountStore.getState();

      switch (event.type) {
        case "DEPTH_UPDATE":
          tradeStore.setDepth(event.payload);
          return;

        case "TRADE_UPDATE":
          tradeStore.addTrade(event.payload);
          accountStore.addFill(event.payload);
          return;

        case "MARK_PRICE_UPDATE":
          tradeStore.setMarkPrice(event.payload.price);
          return;

        case "BALANCE_UPDATE":
          accountStore.setBalance(event.payload);
          return;

        case "ORDER_UPDATE":
          accountStore.updateOrder(event.payload);
          return;

        case "FUNDING_RATE_UPDATE":
          tradeStore.setFundingRate(event.payload.fundingRate);
          return;

        case "POSITION_UPDATE":
          if (event.payload.qty === 0) {
            accountStore.removePosition(
              event.payload.marketId,
              event.payload.side,
            );
            return;
          }

          accountStore.updatePosition(event.payload);
          return;

        case "POSITION_LIQUIDATED":
          accountStore.removePosition(
            event.payload.marketId,
            event.payload.side,
          );
          return;

        default:
          return;
      }
    } catch (error) {
      console.error("failed to handle ws message", error);
    }
  }
}
