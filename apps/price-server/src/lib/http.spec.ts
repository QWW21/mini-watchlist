import { randomUUID } from 'node:crypto';
import {
  ApiErrorBody,
  ChartPoint,
  FilledOrder,
  InstrumentDetails,
  InstrumentListing,
  Portfolio,
} from '@mw/data/schemas';
import { buildApi } from './http.js';
import { INSTRUMENTS } from './instruments.js';
import { Market } from './market.js';
import { OrderBook } from './orders.js';

async function setUp() {
  const market = new Market(INSTRUMENTS);
  return buildApi(market, new OrderBook(market, 0));
}

const order = (overrides = {}) => ({
  ticker: 'ACME',
  side: 'buy',
  quantity: 1,
  idempotencyKey: randomUUID(),
  ...overrides,
});

const errorCode = (response: { json(): unknown }) =>
  ApiErrorBody.parse(response.json()).error.code;

describe('REST API', () => {
  it('serves responses that match the shared schemas', async () => {
    const api = await setUp();

    const list = await api.inject('/instruments');
    const details = await api.inject('/instruments/ACME');
    const chart = await api.inject('/chart/ACME?range=1W');
    const portfolio = await api.inject('/portfolio');

    expect(InstrumentListing.array().parse(list.json())).toHaveLength(50);
    expect(InstrumentDetails.parse(details.json()).ticker).toBe('ACME');
    expect(ChartPoint.array().parse(chart.json()).length).toBeGreaterThan(0);
    expect(Portfolio.parse(portfolio.json()).positions.length).toBeGreaterThan(
      0,
    );
  });

  it('answers 404 for an unknown ticker and 400 for a bad range', async () => {
    const api = await setUp();

    const details = await api.inject('/instruments/NOPE');
    const chart = await api.inject('/chart/NOPE?range=1D');
    const range = await api.inject('/chart/ACME?range=5Y');

    expect(details.statusCode).toBe(404);
    expect(errorCode(details)).toBe('unknown_instrument');
    expect(chart.statusCode).toBe(404);
    expect(range.statusCode).toBe(400);
  });

  it('fills a buy and updates the portfolio', async () => {
    const api = await setUp();
    const before = Portfolio.parse((await api.inject('/portfolio')).json());

    const response = await api.inject({
      method: 'POST',
      url: '/orders',
      payload: order({ ticker: 'BEAM', quantity: 2 }),
    });

    const filled = FilledOrder.parse(response.json());
    const after = Portfolio.parse((await api.inject('/portfolio')).json());
    expect(filled.total).toBe((Number(filled.price) * 2).toFixed(2));
    expect(after.positions.find((p) => p.ticker === 'BEAM')?.quantity).toBe(2);
    expect(Number(after.cash)).toBeCloseTo(
      Number(before.cash) - Number(filled.total),
      2,
    );
  });

  it('fills an idempotency key once, even for simultaneous repeats', async () => {
    const api = await setUp();
    const payload = order({ ticker: 'BEAM' });
    const send = () => api.inject({ method: 'POST', url: '/orders', payload });

    const [first, second] = await Promise.all([send(), send()]);
    const later = await send();

    const id = FilledOrder.parse(first.json()).id;
    expect(FilledOrder.parse(second.json()).id).toBe(id);
    expect(FilledOrder.parse(later.json()).id).toBe(id);
    const portfolio = Portfolio.parse((await api.inject('/portfolio')).json());
    expect(portfolio.positions.find((p) => p.ticker === 'BEAM')?.quantity).toBe(
      1,
    );
  });

  it('rejects orders it cannot fill', async () => {
    const api = await setUp();
    const send = (payload: object) =>
      api.inject({ method: 'POST', url: '/orders', payload });

    const noFunds = await send(order({ quantity: 1_000_000 }));
    const noShares = await send(order({ ticker: 'BEAM', side: 'sell' }));
    const unknown = await send(order({ ticker: 'NOPE' }));
    const invalid = await send(order({ quantity: 0 }));

    expect(noFunds.statusCode).toBe(422);
    expect(errorCode(noFunds)).toBe('insufficient_funds');
    expect(noShares.statusCode).toBe(422);
    expect(errorCode(noShares)).toBe('insufficient_shares');
    expect(unknown.statusCode).toBe(404);
    expect(invalid.statusCode).toBe(400);
  });

  it('removes a position once it is fully sold', async () => {
    const api = await setUp();

    await api.inject({
      method: 'POST',
      url: '/orders',
      payload: order({ ticker: 'ACME', side: 'sell', quantity: 12 }),
    });

    const portfolio = Portfolio.parse((await api.inject('/portfolio')).json());
    expect(portfolio.positions.some((p) => p.ticker === 'ACME')).toBe(false);
  });
});
