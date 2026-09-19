import { ApiError } from '@/src/core/api';
import { shouldRetryQuery } from './query-client';

describe('query retry policy', () => {
  it('retries bounded transient failures only', () => {
    expect(shouldRetryQuery(0, new ApiError(0, 'offline'))).toBe(true);
    expect(shouldRetryQuery(1, new ApiError(503, 'unavailable'))).toBe(true);
    expect(shouldRetryQuery(0, new ApiError(429, 'limited'))).toBe(true);
    expect(shouldRetryQuery(0, new ApiError(400, 'invalid'))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError(403, 'forbidden'))).toBe(false);
    expect(shouldRetryQuery(2, new ApiError(503, 'unavailable'))).toBe(false);
  });
});
