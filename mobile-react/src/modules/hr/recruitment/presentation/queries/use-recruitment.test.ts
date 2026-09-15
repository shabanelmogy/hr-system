import { renderHook } from '@testing-library/react-native';

import { useApproveJobOffer, useHireCandidate, useInterviews } from './use-recruitment';
import { recruitmentKeys } from './recruitment-keys';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockUseQuery = jest.fn();
const mockHireCandidate = jest.fn();
const mockApproveOffer = jest.fn();
const mockGetInterviews = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: (options: unknown) => mockUseQuery(options),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../composition/recruitment-container', () => ({
  recruitmentUseCases: {
    hireCandidate: (...args: unknown[]) => mockHireCandidate(...args),
    approveOffer: (...args: unknown[]) => mockApproveOffer(...args),
    getInterviews: (...args: unknown[]) => mockGetInterviews(...args),
  },
}));

type MutationContract<T> = {
  networkMode: string;
  mutationFn: (value: T) => Promise<unknown>;
};

describe('recruitment mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockImplementation((options: unknown) => options);
    mockHireCandidate.mockResolvedValue({ id: 7 });
    mockApproveOffer.mockResolvedValue({ id: 9 });
  });

  it('keys interview pages by the application filter and forwards it as a query only', async () => {
    const query = { pageNumber: 1, pageSize: 10, applicationId: 3 };
    const page = { items: [{ id: 81, employmentApplicationId: 3 }], metaData: { pageNumber: 1 } };
    mockGetInterviews.mockResolvedValue(page);

    await renderHook(() => useInterviews(query));

    const options = mockUseQuery.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
    };
    expect(options.queryKey).toEqual(recruitmentKeys.interviews(query));
    expect(options.enabled).toBe(true);
    await expect(options.queryFn()).resolves.toBe(page);
    expect(mockGetInterviews).toHaveBeenCalledWith(query);
    expect(mockGetInterviews).not.toHaveBeenCalledWith(81);
  });

  it('does not let hire mutations pause for later implicit replay', async () => {
    const { result } = await renderHook(() => useHireCandidate());
    const mutation = result.current as unknown as MutationContract<{
      id: number;
      employeeNumber: string;
      hireDate: string;
      idempotencyKey?: string;
    }>;
    const input = { id: 7, employeeNumber: 'EMP-7', hireDate: '2026-09-10', idempotencyKey: 'hire-7-stable' };

    expect(mutation.networkMode).toBe('always');
    await expect(mutation.mutationFn(input)).resolves.toEqual({ id: 7 });
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
