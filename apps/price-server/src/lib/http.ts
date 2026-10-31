import cors from '@fastify/cors';
import { type ApiErrorBody, ChartRange, OrderRequest } from '@mw/data/schemas';
import Fastify from 'fastify';
import type { Market } from './market.js';
import type { OrderBook } from './orders.js';

const errorBody = (code: string, message: string): ApiErrorBody => ({
  error: { code, message },
});
const notFound = (ticker: string) =>
  errorBody('unknown_instrument', `No instrument called ${ticker}`);

export async function buildApi(market: Market, orders: OrderBook) {
  const app = Fastify();
  await app.register(cors);

  app.get('/instruments', () => market.listings());

  app.get<{ Params: { ticker: string } }>(
    '/instruments/:ticker',
    (request, reply) => {
      const { ticker } = request.params;
      return market.details(ticker) ?? reply.code(404).send(notFound(ticker));
    },
  );

  app.get<{ Params: { ticker: string }; Querystring: { range?: string } }>(
    '/chart/:ticker',
    (request, reply) => {
      const { ticker } = request.params;
      const range = ChartRange.safeParse(request.query.range);
      if (!range.success) {
        return reply
          .code(400)
          .send(errorBody('invalid_range', 'range must be 1D, 1W or 1M'));
      }
      return (
        market.chart(ticker, range.data) ??
        reply.code(404).send(notFound(ticker))
      );
    },
  );

  app.get('/portfolio', () => orders.portfolio());

  app.post('/orders', async (request, reply) => {
    const body = OrderRequest.safeParse(request.body);
    if (!body.success) {
      return reply
        .code(400)
        .send(errorBody('invalid_order', 'The order is not valid'));
    }

    const result = await orders.place(body.data);
    if (result.status === 'filled') return result.order;

    return reply
      .code(result.code === 'unknown_instrument' ? 404 : 422)
      .send(errorBody(result.code, 'The order was rejected'));
  });

  return app;
}
