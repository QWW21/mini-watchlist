import { z } from 'zod';
import { ApiError, request, setApiBaseUrl, shouldRetry } from './api';

const respondWith = (status: number, body: unknown) => {
  global.fetch = jest.fn(async () =>
    Response.json(body, { status }),
  ) as typeof fetch;
};

const Thing = z.object({ id: z.number() });

describe('shouldRetry', () => {
  it('retries network failures and server errors, up to three times', () => {
    expect(shouldRetry(0, new TypeError('Network request failed'))).toBe(true);
    expect(shouldRetry(2, new ApiError(500, 'http_error', 'Oops'))).toBe(true);
    expect(shouldRetry(3, new ApiError(500, 'http_error', 'Oops'))).toBe(false);
  });

  it('does not retry errors that would only repeat', () => {
    expect(shouldRetry(0, new ApiError(404, 'unknown', 'Nope'))).toBe(false);
    expect(shouldRetry(0, new ApiError(200, 'invalid_response', 'Bad'))).toBe(
      false,
    );
  });
});

describe('request', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('calls the configured base URL and returns validated data', async () => {
    respondWith(200, { id: 1, extra: 'dropped' });
    setApiBaseUrl('http://example.test');

    await expect(request('/thing', Thing)).resolves.toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.test/thing',
      undefined,
    );
  });

  it('rejects a response that does not match the schema', async () => {
    respondWith(200, { id: 'one' });

    await expect(request('/thing', Thing)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'invalid_response',
    });
  });

  it('turns an API error body into an ApiError', async () => {
    respondWith(422, {
      error: { code: 'insufficient_funds', message: 'Not enough cash' },
    });

    const error = await request('/thing', Thing).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'insufficient_funds',
      message: 'Not enough cash',
    });
  });

  it('copes with an error that has no usable body', async () => {
    global.fetch = jest.fn(
      async () => new Response('Bad gateway', { status: 502 }),
    ) as typeof fetch;

    await expect(request('/thing', Thing)).rejects.toMatchObject({
      status: 502,
      code: 'http_error',
    });
  });
});
