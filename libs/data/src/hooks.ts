import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { request } from './api';
import { keys } from './keys';
import {
  ChartPoint,
  type ChartRange,
  InstrumentDetails,
  InstrumentListing,
  Portfolio,
} from './schemas';

const tickerPath = (ticker: string) => encodeURIComponent(ticker);

export function useInstruments() {
  return useQuery({
    queryKey: keys.instruments(),
    queryFn: ({ signal }) =>
      request('/instruments', InstrumentListing.array(), { signal }),
  });
}

export function useInstrument(ticker: string) {
  return useQuery({
    queryKey: keys.instrument(ticker),
    queryFn: ({ signal }) =>
      request(`/instruments/${tickerPath(ticker)}`, InstrumentDetails, {
        signal,
      }),
  });
}

export function useChart(ticker: string, range: ChartRange) {
  return useQuery({
    queryKey: keys.chart(ticker, range),
    queryFn: ({ signal }) =>
      request(
        `/chart/${tickerPath(ticker)}?range=${range}`,
        ChartPoint.array(),
        {
          signal,
        },
      ),
    placeholderData: keepPreviousData,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: keys.portfolio(),
    queryFn: ({ signal }) => request('/portfolio', Portfolio, { signal }),
  });
}
