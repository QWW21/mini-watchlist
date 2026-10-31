import type {
  ChartPoint,
  ChartRange,
  InstrumentDetails,
  InstrumentListing,
  PriceTick,
} from '@mw/data/schemas';
import type { Instrument } from './instruments.js';
import { formatCents } from './money.js';
import { type Random, seededRandom } from './random.js';

type State = {
  instrument: Instrument;
  cents: number;
  openCents: number;
  high52wCents: number;
  low52wCents: number;
  shares: number;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const CHARTS: Record<ChartRange, { points: number; stepMs: number }> = {
  '1D': { points: 96, stepMs: 15 * MINUTE },
  '1W': { points: 84, stepMs: 2 * HOUR },
  '1M': { points: 120, stepMs: 6 * HOUR },
};
/** Largest move per tick, as a fraction of the price. */
const MAX_TICK_MOVE = 0.001;

export class Market {
  private readonly states = new Map<string, State>();
  private seq = 0;

  constructor(
    instruments: readonly Instrument[],
    private readonly random: Random = Math.random,
    private readonly now: () => number = Date.now,
  ) {
    for (const instrument of instruments) {
      const seeded = seededRandom(instrument.ticker);
      const cents = instrument.startCents;
      this.states.set(instrument.ticker, {
        instrument,
        cents,
        openCents: Math.round(cents * (0.97 + seeded() * 0.06)),
        high52wCents: Math.round(cents * (1.05 + seeded() * 0.5)),
        low52wCents: Math.round(cents * (0.5 + seeded() * 0.45)),
        shares: Math.round(10_000_000 + seeded() * 500_000_000),
      });
    }
  }

  priceCents(ticker: string): number | undefined {
    return this.states.get(ticker)?.cents;
  }

  /** Moves every instrument one random-walk step and returns the new prices. */
  step(): PriceTick[] {
    return [...this.states.values()].map((state) => {
      const move = Math.round(
        state.cents * MAX_TICK_MOVE * (this.random() * 2 - 1),
      );
      const minimumMove = this.random() < 0.5 ? -1 : 1;
      state.cents = Math.max(1, state.cents + (move || minimumMove));
      state.high52wCents = Math.max(state.high52wCents, state.cents);
      state.low52wCents = Math.min(state.low52wCents, state.cents);
      return this.toTick(state);
    });
  }

  /** The current price as a tick, for a client that has just subscribed. */
  snapshot(ticker: string): PriceTick | undefined {
    const state = this.states.get(ticker);
    return state && this.toTick(state);
  }

  listings(): InstrumentListing[] {
    return [...this.states.values()].map((state) => this.toListing(state));
  }

  details(ticker: string): InstrumentDetails | undefined {
    const state = this.states.get(ticker);
    if (!state) return undefined;
    return {
      ...this.toListing(state),
      sector: state.instrument.sector,
      marketCap: Math.round((state.cents / 100) * state.shares),
      high52w: formatCents(state.high52wCents),
      low52w: formatCents(state.low52wCents),
    };
  }

  /**
   * History is invented on request: the same seeded walk each time, bent so it
   * ends on the live price (and, for 1D, starts on the day's open).
   */
  chart(ticker: string, range: ChartRange): ChartPoint[] | undefined {
    const state = this.states.get(ticker);
    if (!state) return undefined;

    const { points, stepMs } = CHARTS[range];
    const seeded = seededRandom(`${ticker}:${range}`);
    const walk = [0];
    for (let i = 1; i < points; i++) {
      walk.push((walk[i - 1] ?? 0) + (seeded() * 2 - 1) * state.cents * 0.004);
    }
    const startCents =
      range === '1D'
        ? state.openCents
        : Math.round(state.cents * (0.9 + seeded() * 0.2));
    const walkEnd = walk[points - 1] ?? 0;
    const end = this.now();

    return walk.map((offset, i) => {
      const progress = i / (points - 1);
      const line = startCents + (state.cents - startCents) * progress;
      const cents = Math.round(line + offset - walkEnd * progress);
      return {
        t: end - (points - 1 - i) * stepMs,
        price: formatCents(Math.max(1, cents)),
      };
    });
  }

  private toTick(state: State): PriceTick {
    return {
      type: 'price',
      ticker: state.instrument.ticker,
      price: formatCents(state.cents),
      seq: ++this.seq,
      ts: this.now(),
    };
  }

  private toListing(state: State): InstrumentListing {
    const change = (state.cents - state.openCents) / state.openCents;
    return {
      ticker: state.instrument.ticker,
      name: state.instrument.name,
      price: formatCents(state.cents),
      dailyChangePct: Math.round(change * 10_000) / 100,
    };
  }
}
