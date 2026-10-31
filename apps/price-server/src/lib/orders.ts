import { randomUUID } from 'node:crypto';
import type { FilledOrder, OrderRequest, Portfolio } from '@mw/data/schemas';
import type { Market } from './market.js';
import { formatCents } from './money.js';

export type RejectionCode =
  'unknown_instrument' | 'insufficient_funds' | 'insufficient_shares';

export type OrderResult =
  | { status: 'filled'; order: FilledOrder }
  | { status: 'rejected'; code: RejectionCode };

type Holding = { quantity: number; averageCents: number };

/** Fractional shares add up in floats; this drops the noise (0.1 + 0.2). */
const roundQuantity = (quantity: number) =>
  Math.round(quantity * 1_000_000) / 1_000_000;

export class OrderBook {
  private cashCents = 2_500_000;
  private readonly holdings = new Map<string, Holding>([
    ['ACME', { quantity: 12, averageCents: 11020 }],
    ['NOVA', { quantity: 3, averageCents: 45110 }],
    ['ORBT', { quantity: 40, averageCents: 9240 }],
    ['VRDE', { quantity: 150, averageCents: 2510 }],
    ['RUNE', { quantity: 1.5, averageCents: 31800 }],
  ]);
  /** Stores the promise, not the result, so a repeat sent mid-fill still can't fill twice. */
  private readonly results = new Map<string, Promise<OrderResult>>();

  constructor(
    private readonly market: Market,
    private readonly fillDelayMs: number,
  ) {}

  portfolio(): Portfolio {
    return {
      cash: formatCents(this.cashCents),
      positions: [...this.holdings].map(([ticker, holding]) => ({
        ticker,
        quantity: holding.quantity,
        averagePrice: formatCents(holding.averageCents),
      })),
    };
  }

  place(request: OrderRequest): Promise<OrderResult> {
    const previous = this.results.get(request.idempotencyKey);
    if (previous) return previous;

    const result = this.fillAfterDelay(request);
    this.results.set(request.idempotencyKey, result);
    return result;
  }

  private async fillAfterDelay(request: OrderRequest): Promise<OrderResult> {
    await new Promise((resolve) => setTimeout(resolve, this.fillDelayMs));

    const priceCents = this.market.priceCents(request.ticker);
    if (priceCents === undefined) {
      return { status: 'rejected', code: 'unknown_instrument' };
    }

    const totalCents = Math.round(request.quantity * priceCents);
    const rejection =
      request.side === 'buy'
        ? this.buy(request, totalCents)
        : this.sell(request, totalCents);
    if (rejection) return { status: 'rejected', code: rejection };

    return {
      status: 'filled',
      order: {
        id: randomUUID(),
        ticker: request.ticker,
        side: request.side,
        quantity: request.quantity,
        price: formatCents(priceCents),
        total: formatCents(totalCents),
        filledAt: Date.now(),
      },
    };
  }

  private buy(
    { ticker, quantity }: OrderRequest,
    totalCents: number,
  ): RejectionCode | undefined {
    if (totalCents > this.cashCents) return 'insufficient_funds';

    const held = this.holdings.get(ticker) ?? { quantity: 0, averageCents: 0 };
    const newQuantity = roundQuantity(held.quantity + quantity);
    this.cashCents -= totalCents;
    this.holdings.set(ticker, {
      quantity: newQuantity,
      averageCents: Math.round(
        (held.quantity * held.averageCents + totalCents) / newQuantity,
      ),
    });
    return undefined;
  }

  private sell(
    { ticker, quantity }: OrderRequest,
    totalCents: number,
  ): RejectionCode | undefined {
    const held = this.holdings.get(ticker);
    if (!held || quantity > held.quantity) return 'insufficient_shares';

    const remaining = roundQuantity(held.quantity - quantity);
    this.cashCents += totalCents;
    if (remaining > 0) {
      this.holdings.set(ticker, { ...held, quantity: remaining });
    } else {
      this.holdings.delete(ticker);
    }
    return undefined;
  }
}
