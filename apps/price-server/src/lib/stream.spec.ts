import type { AddressInfo } from 'node:net';
import { ServerMessage } from '@mw/data/schemas';
import type { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { buildApi } from './http.js';
import { INSTRUMENTS } from './instruments.js';
import { Market } from './market.js';
import { OrderBook } from './orders.js';
import { attachPriceStream, type PriceStream } from './stream.js';

describe('price stream', () => {
  let api: FastifyInstance;
  let market: Market;
  let stream: PriceStream;
  let url: string;

  beforeEach(async () => {
    market = new Market(INSTRUMENTS);
    api = await buildApi(market, new OrderBook(market, 0));
    stream = attachPriceStream(api.server, market);
    await api.listen({ port: 0, host: '127.0.0.1' });
    url = `ws://127.0.0.1:${(api.server.address() as AddressInfo).port}/stream`;
  });

  afterEach(async () => {
    stream.close();
    await api.close();
  });

  /** Connects and collects every message, validated by the shared schema. */
  async function connect() {
    const client = new WebSocket(url);
    const received: ServerMessage[] = [];
    client.on('message', (data) => {
      received.push(ServerMessage.parse(JSON.parse(data.toString())));
    });
    await new Promise((resolve) => client.once('open', resolve));
    const send = (message: object) => client.send(JSON.stringify(message));
    return { client, received, send };
  }

  async function waitFor(condition: () => boolean) {
    for (let i = 0; i < 100 && !condition(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(condition()).toBe(true);
  }

  it('answers ping with pong', async () => {
    const { received, send } = await connect();

    send({ type: 'ping' });

    await waitFor(() => received.some((m) => m.type === 'pong'));
  });

  it('sends a snapshot on subscribe, then only subscribed tickers', async () => {
    const { received, send } = await connect();

    send({ type: 'subscribe', tickers: ['ACME', 'NOPE'] });
    await waitFor(() => received.length === 1);
    stream.publish(market.step());
    await waitFor(() => received.length === 2);

    const tickers = received.map((m) => (m.type === 'price' ? m.ticker : ''));
    expect(tickers).toEqual(['ACME', 'ACME']);
  });

  it('stops sending a ticker after unsubscribe', async () => {
    const { received, send } = await connect();
    send({ type: 'subscribe', tickers: ['ACME', 'NOVA'] });
    await waitFor(() => received.length === 2);

    send({ type: 'unsubscribe', tickers: ['ACME'] });
    send({ type: 'ping' });
    await waitFor(() => received.some((m) => m.type === 'pong'));
    received.length = 0;
    stream.publish(market.step());
    await waitFor(() => received.length === 1);

    expect(received[0]).toMatchObject({ type: 'price', ticker: 'NOVA' });
  });

  it('ignores malformed messages and stays connected', async () => {
    const { client, received, send } = await connect();

    client.send('not json');
    send({ type: 'nope' });
    send({ type: 'ping' });

    await waitFor(() => received.some((m) => m.type === 'pong'));
    expect(client.readyState).toBe(WebSocket.OPEN);
  });

  it('can drop connections to simulate a bad network', async () => {
    const { client } = await connect();
    const closed = new Promise((resolve) => client.once('close', resolve));

    stream.dropConnections();

    await closed;
    expect(client.readyState).toBe(WebSocket.CLOSED);
  });
});
