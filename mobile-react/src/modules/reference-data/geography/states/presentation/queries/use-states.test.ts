import { renderHook } from '@testing-library/react-native';

import { stateKeys } from './state-keys';
import {
  useArchiveState,
  useBulkArchiveStates,
  useBulkCreateStates,
  useRestoreState,
  useSaveState,
  useStateLookup,
  useStates,
} from './use-states';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockUseQuery = jest.fn((options: unknown) => options);

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: (options: unknown) => mockUseQuery(options),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../composition/state-container', () => {
  const mockStateUseCases = {
    archive: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
    getLookup: jest.fn(),
    getPage: jest.fn(),
    restore: jest.fn(),
    save: jest.fn(),
  };
  return {
    __mockStateUseCases: mockStateUseCases,
    stateUseCases: mockStateUseCases,
  };
});

const mockStateUseCases = jest.requireMock('../../composition/state-container').__mockStateUseCases as {
  archive: jest.Mock;
  bulkArchive: jest.Mock;
  bulkCreate: jest.Mock;
  getLookup: jest.Mock;
  getPage: jest.Mock;
  restore: jest.Mock;
  save: jest.Mock;
};

type MutationContract<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
};

describe('state presentation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it('loads the page through the application use-case facade', async () => {
    const query = {
      pageNumber: 1,
      pageSize: 5,
      search: '',
      searchField: 'all' as const,
      searchOperator: 'contains' as const,
      status: 'active' as const,
      sortBy: 'createdOn' as const,
      sortDirection: 'desc' as const,
    };
    const hook = await renderHook(() => useStates(query));
    const contract = hook.result.current as unknown as {
      queryFn: () => Promise<unknown>;
      queryKey: readonly unknown[];
    };

    await contract.queryFn();
    expect(mockStateUseCases.getPage).toHaveBeenCalledWith(query);
    expect(contract.queryKey).toEqual(stateKeys.list(query));
  });

  it('exposes a repository-backed lookup contract for cross-feature consumers', async () => {
    const hook = await renderHook(() => useStateLookup(7, { enabled: false }));
    const contract = hook.result.current as unknown as {
      enabled: boolean;
      queryFn: () => Promise<unknown>;
      queryKey: readonly unknown[];
    };

    expect(contract.enabled).toBe(false);
    expect(contract.queryKey).toEqual(stateKeys.lookup(7));
    await contract.queryFn();
    expect(mockStateUseCases.getLookup).toHaveBeenCalledWith(7);
  });

  it.each([
    ['archive', useArchiveState, 11, mockStateUseCases.archive],
    ['restore', useRestoreState, 11, mockStateUseCases.restore],
    ['bulk archive', useBulkArchiveStates, [11, 12], mockStateUseCases.bulkArchive],
    ['bulk create', useBulkCreateStates, [{ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }], mockStateUseCases.bulkCreate],
  ] as const)('invalidates the States root after %s succeeds', async (_name, useMutationHook, variables, applicationMethod) => {
    const hook = await renderHook(() => useMutationHook());
    const mutation = hook.result.current as unknown as MutationContract<typeof variables>;

    await mutation.mutationFn(variables);
    expect(applicationMethod).toHaveBeenCalledWith(variables);
    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: stateKeys.all });
  });

  it('saves through the application use case and invalidates the States root', async () => {
    const hook = await renderHook(() => useSaveState());
    const mutation = hook.result.current as unknown as MutationContract<{
      id: number | null;
      request: { nameAr: string; nameEn: string; code: string; countryId: number };
    }>;
    const request = { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 };

    await mutation.mutationFn({ id: null, request });
    await mutation.mutationFn({ id: 11, request });
    expect(mockStateUseCases.save).toHaveBeenNthCalledWith(1, { id: null, request });
    expect(mockStateUseCases.save).toHaveBeenNthCalledWith(2, { id: 11, request });

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: stateKeys.all });
  });
});
