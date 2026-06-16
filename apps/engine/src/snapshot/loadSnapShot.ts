import { readFile } from "fs/promises";

import {
  balances,
  positions,
  orders,
  orderbooks,
  markPrices,
} from "../state/state";

import type { EngineSnapshot } from "./types";

const SNAPSHOT_FILE = "./snapshots/engine.json";

export async function loadSnapshot(): Promise<void> {
  try {
    const raw = await readFile(
      SNAPSHOT_FILE,
      "utf8",
    );

    const snapshot = JSON.parse(raw) as EngineSnapshot;

    if (snapshot.version !== 1) {
      throw new Error(
        `unsupported snapshot version: ${snapshot.version}`,
      );
    }

    Object.assign(
      balances,
      snapshot.balances,
    );

    Object.assign(
      positions,
      snapshot.positions,
    );

    Object.assign(
      orders,
      snapshot.orders,
    );

    Object.assign(
      orderbooks,
      snapshot.orderbooks,
    );

    Object.assign(
      markPrices,
      snapshot.markPrices,
    );

    console.log(
      "snapshot loaded",
      new Date(snapshot.createdAt),
    );
  } catch (error) {
    console.log(
      "no snapshot found or failed to load snapshot",
      error,
    );
  }
}