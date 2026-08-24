import { renderHook } from '@testing-library/react-native';

import { stateApi } from '../api/state-api';
import { stateKeys } from './state-keys';
import {
  useArchiveState,
  useBulkArchiveStates,
  useRestoreState,
  useSaveState,
} from './use-states';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/state-api', () => ({
  stateApi: {
    archive: jest.fn(),
    bulkArchive: jest.fn(),
    create: jest.fn(),
    getLookup: jest.fn(),
    getPage: jest.fn(),
    restore: jest.fn(),
    update: jest.fn(),
  },
}));

type MutationContract<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
};

describe('state mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it.each([
    ['archive', useArchiveState, 11, stateApi.archive],
    ['restore', useRestoreState, 11, stateApi.restore],
    ['bulk archive', useBulkArchiveStates, [11, 12], stateApi.bulkArchive],
  ] as const)('invalidates the States root after %s succeeds', async (_name, useMutationHook, variables, apiMethod) => {
    const hook = await renderHook(() => useMutationHook());
    const mutation = hook.result.current as unknown as MutationContract<typeof variables>;

    await mutation.mutationFn(variables);
    expect(apiMethod).toHaveBeenCalledWith(variables);

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: stateKeys.all });
  });

  it('uses create/update transport and invalidates the States root', async () => {
    const hook = await renderHook(() => useSaveState());
    const mutation = hook.result.current as unknown as MutationContract<{
      id: number | null;
      request: Parameters<typeof stateApi.create>[0];
    }>;
    const request = { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 };

    await mutation.mutationFn({ id: null, request });
    await mutation.mutationFn({ id: 11, request });
    expect(stateApi.create).toHaveBeenCalledWith(request);
    expect(stateApi.update).toHaveBeenCalledWith(11, request);

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: stateKeys.all });
  });
});
