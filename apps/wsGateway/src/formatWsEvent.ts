import type { WsEvent } from "@repo/common";
import {
  unscaleBalanceResponse,
  unscaleDepth,
  unscaleFill,
  unscaleOrder,
  unscalePosition,
  unscalePrice,
  unscaleQty,
} from "@repo/common";

export function formatWsEvent(event: WsEvent): WsEvent {
  switch (event.type) {
    case "DEPTH_UPDATE":
      return {
        ...event,
        payload: unscaleDepth(event.payload),
      };

    case "TRADE_UPDATE":
      return {
        ...event,
        payload: unscaleFill(event.payload),
      };

    case "ORDER_UPDATE":
      return {
        ...event,
        payload: unscaleOrder(event.payload),
      };

    case "POSITION_UPDATE":
      return {
        ...event,
        payload: unscalePosition(event.payload),
      };

    case "BALANCE_UPDATE":
      return {
        ...event,
        payload: unscaleBalanceResponse(event.payload),
      };

    case "MARK_PRICE_UPDATE":
      return {
        ...event,
        payload: {
          price: unscalePrice(event.marketId, event.payload.price),
        },
      };

    case "POSITION_LIQUIDATED":
      return {
        ...event,
        payload: {
          ...event.payload,
          qty: unscaleQty(event.payload.marketId, event.payload.qty),
          price: unscalePrice(event.payload.marketId, event.payload.price),
        },
      };
  }
}
