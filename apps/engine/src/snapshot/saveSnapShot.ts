import { mkdir, writeFile } from "fs/promises";

import {
  balances,
  positions,
  orders,
  orderbooks,
  markPrices,
} from "../state/state";

import type { EngineSnapshot } from "./types";

const SNAPSHOT_DIR = "./snapshots";
const SNAPSHOT_FILE = `${SNAPSHOT_DIR}/engine.json`;

export async function saveSnapshot(): Promise<void> {
  const snapshot: EngineSnapshot = {
    version: 1,

    balances,
    positions,
    orders,
    orderbooks,
    markPrices,

    createdAt: Date.now(),
  };

  await mkdir(SNAPSHOT_DIR, {
    recursive: true,
  });

  await writeFile(SNAPSHOT_FILE, JSON.stringify(snapshot), "utf8");

  console.log("snapshot saved");
}
