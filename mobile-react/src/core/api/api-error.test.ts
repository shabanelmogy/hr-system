import { toApiError } from './api-error';

describe('API ProblemDetails normalization', () => {
  it('preserves useful messages from local and domain errors', () => {
    expect(toApiError(new Error('Candidate already exists.')).message).toBe('Candidate already exists.');
    expect(toApiError(new Error('   ')).message).toBe('An unexpected error occurred.');
  });

  it('keeps recognized safe fields, codes, and field errors', () => {
    const error = toApiError({
      isAxiosError: true,
      message: 'ignored transport detail',
      response: {
        status: 422,
        data: {
          title: 'Validation failed',
          detail: 'Please correct the marked fields.',
          status: 422,
          code: 'Validation.Invalid',
          codes: ['Name.Required'],
          traceId: 'trace-123',
          correlationId: 'correlation-456',
          errors: { Name: ['Name is required.'] },
          internal: { connectionString: 'must not escape' },
        },
      },
    });

    expect(error.status).toBe(422);
    expect(error.message).toBe('Please correct the marked fields.');
    expect(error.problem).toEqual({
      title: 'Validation failed',
      detail: 'Please correct the marked fields.',
      status: 422,
      code: 'Validation.Invalid',
      codes: ['Name.Required'],
      traceId: 'trace-123',
      correlationId: 'correlation-456',
      errors: { Name: ['Name is required.'] },
    });
  });

  it('rejects malformed untrusted fields and uses a safe fallback message', () => {
    const error = toApiError({
      isAxiosError: true,
      message: 'private URL https://user:secret@example.com',
      response: {
        status: 400,
        data: {
          title: 42,
          detail: { text: 'not a string' },
          status: '400',
          code: [],
          codes: ['valid', 7],
          errors: { Name: ['valid', null] },
        },
      },
    });

    expect(error.message).toBe('The request failed (400).');
    expect(error.problem).toBeUndefined();
    expect(error.message).not.toContain('secret');
  });
});
