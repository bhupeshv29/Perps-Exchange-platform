export const STREAMS = {
  ENGINE_REQUESTS: "engine:requests",
  ENGINE_RESPONSES: "engine:responses",
  DB_EVENTS: "db:events",
  PRICE_UPDATES: "price:updates",
} as const;

export const GROUPS = {
  ENGINE: "engine-group",
  BACKEND: "backend-group",
  DB_WORKER: "db-worker-group",
} as const;

export const CHANNELS = {
  WS_EVENTS: "ws:events",
} as const;
