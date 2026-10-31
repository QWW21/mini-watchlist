import { ChartPoint, InstrumentDetails, PriceTick } from '@mw/data/schemas';
import { INSTRUMENTS } from './instruments.js';
import { Market } from './market.js';

const cents = (price: string) => Math.round(Number(price) * 100);
const instrument = (startCents: number) => ({
  ticker: 'TEST',
  name: 'Test',
  sector: 'Test',
  startCents,
});

describe('instruments', () => {
  it('has 50 unique tickers', () => {
    const tickers = new Set(INSTRUMENTS.map((i) => i.ticker));

    expect(INSTRUMENTS).toHaveLength(50);
    expect(tickers.size).toBe(50);
  });
});

describe('Market', () => {
  it('moves every price each step, with seq always increasing', () => {
    const market = new Market(INSTRUMENTS);

    const first = market.step();
    const second = market.step();

    expect(first).toHaveLength(50);
    for (const tick of [...first, ...second]) {
      expect(PriceTick.safeParse(tick).success).toBe(true);
    }
    const seqs = [...first, ...second].map((tick) => tick.seq);
    expect(seqs).toEqual([...seqs].sort((a, b) => a - b));
    expect(new Set(seqs).size).toBe(seqs.length);
    expect(first[0]?.price).not.toBe(second[0]?.price);
  });

  it('never lets a price reach zero', () => {
    const market = new Market([instrument(1)], () => 0);

    for (let i = 0; i < 50; i++) market.step();

    expect(market.priceCents('TEST')).toBe(1);
  });

  it('keeps the live price inside the 52-week range', () => {
    const market = new Market([instrument(10000)], () => 0.99);

    for (let i = 0; i < 2000; i++) market.step();

    const details = InstrumentDetails.parse(market.details('TEST'));
    expect(cents(details.high52w)).toBe(cents(details.price));
    expect(cents(details.low52w)).toBeLessThan(cents(details.price));
  });

  it.each(['1D', '1W', '1M'] as const)(
    'draws a stable %s chart that ends on the live price',
    (range) => {
      const market = new Market(INSTRUMENTS);

      const first = ChartPoint.array().parse(market.chart('ACME', range));
      const second = ChartPoint.array().parse(market.chart('ACME', range));

      expect(first.at(-1)?.price).toBe(market.snapshot('ACME')?.price);
      expect(first.map((p) => p.price)).toEqual(second.map((p) => p.price));
      const times = first.map((p) => p.t);
      expect(times).toEqual([...times].sort((a, b) => a - b));
    },
  );

  it('returns nothing for an unknown ticker', () => {
    const market = new Market(INSTRUMENTS);

    expect(market.details('NOPE')).toBeUndefined();
    expect(market.chart('NOPE', '1D')).toBeUndefined();
    expect(market.snapshot('NOPE')).toBeUndefined();
  });
});
