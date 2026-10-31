import { z } from 'zod';
import { ApiErrorBody } from './schemas';

let baseUrl = 'http://localhost:4000';

/** The app decides the address, since a phone can't reach "localhost". */
export function setApiBaseUrl(url: string) {
  baseUrl = url;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Network failures and 5xx may recover; a 404 or a bad response never will. */
export function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < 3;
}

/** Fetches JSON and validates it, so bad data fails here and not deep in the UI. */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const failure = ApiErrorBody.safeParse(body);
    throw failure.success
      ? new ApiError(
          response.status,
          failure.data.error.code,
          failure.data.error.message,
        )
      : new ApiError(response.status, 'http_error', response.statusText);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      'invalid_response',
      `Unexpected response from ${path}: ${z.prettifyError(parsed.error)}`,
    );
  }
  return parsed.data;
}
