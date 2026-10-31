import { z } from 'zod';

/** Money and prices travel as strings, e.g. "123.45", to avoid float errors. */
const Decimal = z.string().regex(/^\d+\.\d{2}$/);

export const ChartRange = z.enum(['1D', '1W', '1M']);
export type ChartRange = z.infer<typeof ChartRange>;

// REST responses

export const InstrumentListing = z.object({
  ticker: z.string(),
  name: z.string(),
  price: Decimal,
  dailyChangePct: z.number(),
});
export type InstrumentListing = z.infer<typeof InstrumentListing>;

export const InstrumentDetails = InstrumentListing.extend({
  sector: z.string(),
  marketCap: z.number().positive(),
  high52w: Decimal,
  low52w: Decimal,
});
export type InstrumentDetails = z.infer<typeof InstrumentDetails>;

export const ChartPoint = z.object({
  t: z.number().int(),
  price: Decimal,
});
export type ChartPoint = z.infer<typeof ChartPoint>;

export const Position = z.object({
  ticker: z.string(),
  quantity: z.number().positive(),
  averagePrice: Decimal,
});
export type Position = z.infer<typeof Position>;

export const Portfolio = z.object({
  positions: z.array(Position),
  cash: Decimal,
});
export type Portfolio = z.infer<typeof Portfolio>;

export const OrderRequest = z.object({
  ticker: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  idempotencyKey: z.uuid(),
});
export type OrderRequest = z.infer<typeof OrderRequest>;

export const FilledOrder = z.object({
  id: z.uuid(),
  ticker: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: Decimal,
  total: Decimal,
  filledAt: z.number().int(),
});
export type FilledOrder = z.infer<typeof FilledOrder>;

export const ApiErrorBody = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;

// WebSocket messages

export const ClientMessage = z.discriminatedUnion('type', [
  z.object({ type: z.literal('subscribe'), tickers: z.array(z.string()) }),
  z.object({ type: z.literal('unsubscribe'), tickers: z.array(z.string()) }),
  z.object({ type: z.literal('ping') }),
]);
export type ClientMessage = z.infer<typeof ClientMessage>;

export const PriceTick = z.object({
  type: z.literal('price'),
  ticker: z.string(),
  price: Decimal,
  seq: z.number().int(),
  ts: z.number(),
});
export type PriceTick = z.infer<typeof PriceTick>;

export const ServerMessage = z.discriminatedUnion('type', [
  PriceTick,
  z.object({ type: z.literal('pong') }),
]);
export type ServerMessage = z.infer<typeof ServerMessage>;
