import type { ChartRange } from './schemas';

export const keys = {
  instruments: () => ['instruments'] as const,
  instrument: (ticker: string) => ['instrument', ticker] as const,
  chart: (ticker: string, range: ChartRange) =>
    ['chart', ticker, range] as const,
  portfolio: () => ['portfolio'] as const,
};
