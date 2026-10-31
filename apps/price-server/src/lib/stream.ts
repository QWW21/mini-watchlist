import type { Server } from 'node:http';
import { ClientMessage, type PriceTick } from '@mw/data/schemas';
import { type RawData, WebSocket, WebSocketServer } from 'ws';
import type { Market } from './market.js';

export type PriceStream = {
  publish(ticks: PriceTick[]): void;
  /** Cuts every connection without a close handshake, like a network failure. */
  dropConnections(): void;
  close(): void;
};

export function attachPriceStream(server: Server, market: Market): PriceStream {
  const sockets = new WebSocketServer({ server, path: '/stream' });
  const subscriptions = new Map<WebSocket, Set<string>>();

  sockets.on('connection', (socket) => {
    const tickers = new Set<string>();
    subscriptions.set(socket, tickers);
    socket.on('close', () => subscriptions.delete(socket));
    socket.on('error', () => socket.terminate());
    socket.on('message', (data) => handleMessage(socket, tickers, data));
  });

  function handleMessage(
    socket: WebSocket,
    tickers: Set<string>,
    data: RawData,
  ) {
    const message = parseMessage(data);
    if (!message) return;

    switch (message.type) {
      case 'ping':
        socket.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        for (const ticker of message.tickers) {
          const snapshot = tickers.has(ticker)
            ? undefined
            : market.snapshot(ticker);
          if (!snapshot) continue;
          tickers.add(ticker);
          socket.send(JSON.stringify(snapshot));
        }
        break;
      case 'unsubscribe':
        for (const ticker of message.tickers) tickers.delete(ticker);
        break;
    }
  }

  return {
    publish(ticks) {
      for (const tick of ticks) {
        const payload = JSON.stringify(tick);
        for (const [socket, tickers] of subscriptions) {
          if (
            tickers.has(tick.ticker) &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(payload);
          }
        }
      }
    },
    dropConnections() {
      for (const socket of subscriptions.keys()) socket.terminate();
    },
    close() {
      for (const socket of subscriptions.keys()) socket.terminate();
      sockets.close();
    },
  };
}

function parseMessage(data: RawData): ClientMessage | undefined {
  try {
    const parsed = ClientMessage.safeParse(JSON.parse(data.toString()));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
