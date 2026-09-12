import { renderHook } from '@testing-library/react-native';

import { useApproveJobOffer, useHireCandidate } from './use-recruitment';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockHireCandidate = jest.fn();
const mockApproveOffer = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../composition/recruitment-container', () => ({
  recruitmentUseCases: {
    hireCandidate: (...args: unknown[]) => mockHireCandidate(...args),
    approveOffer: (...args: unknown[]) => mockApproveOffer(...args),
  },
}));

type MutationContract<T> = {
  networkMode: string;
  mutationFn: (value: T) => Promise<unknown>;
};

describe('recruitment mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHireCandidate.mockResolvedValue(undefined);
    mockApproveOffer.mockResolvedValue({ id: 9 });
  });

  it('does not let hire mutations pause for later implicit replay', async () => {
    const { result } = await renderHook(() => useHireCandidate());
    const mutation = result.current as unknown as MutationContract<{
      id: number;
      employeeNumber?: string;
      hireDate?: string;
      idempotencyKey?: string;
    }>;
    const input = { id: 7, employeeNumber: 'EMP-7', hireDate: '2026-09-10', idempotencyKey: 'hire-7-stable' };

    expect(mutation.networkMode).toBe('always');
    await mutation.mutationFn(input);
    expect(mockHireCandidate).toHaveBeenCalledWith(7, {
      employeeNumber: 'EMP-7',
      hireDate: '2026-09-10',
      idempotencyKey: 'hire-7-stable',
    });
  });

  it('keeps approval mutations immediate and server-authoritative', async () => {
    const { result } = await renderHook(() => useApproveJobOffer());
    const mutation = result.current as unknown as MutationContract<number>;

    expect(mutation.networkMode).toBe('always');
    await mutation.mutationFn(9);
    expect(mockApproveOffer).toHaveBeenCalledWith(9);
  });
});
