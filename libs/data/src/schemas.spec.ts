import {
  ClientMessage,
  OrderRequest,
  PriceTick,
  ServerMessage,
} from './schemas';

const tick = {
  type: 'price',
  ticker: 'ACME',
  price: '123.45',
  seq: 1042,
  ts: 1793300000000,
};

describe('PriceTick', () => {
  it('accepts a well-formed tick', () => {
    expect(PriceTick.parse(tick)).toEqual(tick);
  });

  it.each([
    ['a numeric price', { price: 123.45 }],
    ['a price with no decimals', { price: '123' }],
    ['a non-integer seq', { seq: 1.5 }],
    ['a wrong type', { type: 'quote' }],
  ])('rejects %s', (_name, change) => {
    expect(PriceTick.safeParse({ ...tick, ...change }).success).toBe(false);
  });
});

describe('socket messages', () => {
  it('tells server messages apart by type', () => {
    expect(ServerMessage.parse({ type: 'pong' })).toEqual({ type: 'pong' });
    expect(ServerMessage.parse(tick)).toEqual(tick);
    expect(ServerMessage.safeParse({ type: 'nope' }).success).toBe(false);
  });

  it('requires tickers on subscribe', () => {
    expect(ClientMessage.safeParse({ type: 'subscribe' }).success).toBe(false);
  });
});

describe('OrderRequest', () => {
  const order = {
    ticker: 'ACME',
    side: 'buy',
    quantity: 1,
    idempotencyKey: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
  };

  it('accepts a valid order', () => {
    expect(OrderRequest.safeParse(order).success).toBe(true);
  });

  it.each([
    ['a zero quantity', { quantity: 0 }],
    ['a negative quantity', { quantity: -1 }],
    ['an unknown side', { side: 'hold' }],
    ['a key that is not a UUID', { idempotencyKey: 'abc' }],
  ])('rejects %s', (_name, change) => {
    expect(OrderRequest.safeParse({ ...order, ...change }).success).toBe(false);
  });
});
