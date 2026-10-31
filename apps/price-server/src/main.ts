#!/usr/bin/env tsx
// @nx-target-name: serve
import { buildApi } from './lib/http.js';
import { INSTRUMENTS } from './lib/instruments.js';
import { Market } from './lib/market.js';
import { OrderBook } from './lib/orders.js';
import { attachPriceStream } from './lib/stream.js';

const port = Number(process.env.PORT ?? 4000);
const tickMs = Number(process.env.TICK_MS ?? 250);
const fillDelayMs = Number(process.env.FILL_DELAY_MS ?? 400);
// 0 keeps connections up; N simulates a bad connection every N seconds.
const dropEverySeconds = Number(process.env.DROP_EVERY_S ?? 0);

const market = new Market(INSTRUMENTS);
const api = await buildApi(market, new OrderBook(market, fillDelayMs));
const stream = attachPriceStream(api.server, market);

setInterval(() => stream.publish(market.step()), tickMs);
if (dropEverySeconds > 0) {
  setInterval(() => stream.dropConnections(), dropEverySeconds * 1000);
}

await api.listen({ port, host: '0.0.0.0' });
console.log(`price-server on port ${port}, a tick every ${tickMs} ms`);
