import { ApiError } from '@/src/core/api';
import { applyApiFieldErrors } from './useZodForm';

describe('applyApiFieldErrors', () => {
  it('maps ASP.NET nested collection paths to React Hook Form fields', () => {
    const setError = jest.fn();
    const error = new ApiError(400, 'Validation failed', {
      status: 400,
      errors: {
        'lines[2].periodAllocations[1].allocatedSalaryCost': ['Amount exceeds the period ceiling.'],
      },
    });

    expect(applyApiFieldErrors({ setError } as never, error)).toBe(true);
    expect(setError).toHaveBeenCalledWith(
      'lines.2.periodAllocations.1.allocatedSalaryCost',
      { type: 'server', message: 'Amount exceeds the period ceiling.' },
    );
  });
});
