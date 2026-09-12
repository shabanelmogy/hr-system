import { renderHook } from '@testing-library/react-native';

import { countryKeys } from './country-keys';
import {
  useArchiveCountry,
  useBulkArchiveCountries,
  useBulkCreateCountries,
  useCountries,
  useCountryLookup,
  useRestoreCountry,
  useSaveCountry,
} from './use-countries';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockUseQuery = jest.fn((options: unknown) => options);
let mockOfflineReadEnabled = false;
let mockOfflinePreferencesLoaded = true;
let mockOfflinePolicyLoaded = true;
let mockCentralOfflineReadAllowed = false;

jest.mock('@/src/core/preferences', () => ({
  useOfflineReadPreferences: () => ({
    loaded: mockOfflinePreferencesLoaded,
    isOfflineReadEnabled: () => mockOfflineReadEnabled,
    setOfflineReadEnabled: jest.fn(),
  }),
}));

jest.mock('@/src/platform/offline-operations', () => ({
  useOfflineOperationsPolicy: () => ({
    loaded: mockOfflinePolicyLoaded,
    canReadOffline: () => mockCentralOfflineReadAllowed,
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: (options: unknown) => mockUseQuery(options),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../composition/use-country-use-cases', () => {
  const mockCountryUseCases = {
    archive: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
    getLookup: jest.fn(),
    getPage: jest.fn(),
    restore: jest.fn(),
    save: jest.fn(),
  };
  return {
    __mockCountryUseCases: mockCountryUseCases,
    useCountryUseCases: () => mockCountryUseCases,
  };
});

const mockCountryUseCases = jest.requireMock('../../composition/use-country-use-cases').__mockCountryUseCases as {
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

describe('country mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOfflineReadEnabled = false;
    mockOfflinePreferencesLoaded = true;
    mockOfflinePolicyLoaded = true;
    mockCentralOfflineReadAllowed = false;
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
    const hook = await renderHook(() => useCountries(query));
    const contract = hook.result.current as unknown as {
      queryFn: () => Promise<unknown>;
      queryKey: readonly unknown[];
    };

    await contract.queryFn();
    expect(mockCountryUseCases.getPage).toHaveBeenCalledWith(query);
    expect(contract.queryKey).toEqual(countryKeys.list(query, 'online-required'));
  });

  it('loads the shared lookup through the repository-backed application facade', async () => {
    const hook = await renderHook(() => useCountryLookup({ enabled: false }));
    const contract = hook.result.current as unknown as {
      enabled: boolean;
      queryFn: () => Promise<unknown>;
      queryKey: readonly unknown[];
      staleTime: number;
    };

    await contract.queryFn();
    expect(mockCountryUseCases.getLookup).toHaveBeenCalledTimes(1);
    expect(contract.enabled).toBe(false);
    expect(contract.queryKey).toEqual(countryKeys.lookup('online-required'));
    expect(contract.staleTime).toBe(5 * 60_000);
  });

  it('separates cached-read query keys from connection-required reads', async () => {
    mockOfflineReadEnabled = true;
    mockCentralOfflineReadAllowed = true;
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

    const hook = await renderHook(() => useCountries(query));
    const contract = hook.result.current as unknown as {
      enabled: boolean;
      queryKey: readonly unknown[];
    };

    expect(contract.enabled).toBe(true);
    expect(contract.queryKey).toEqual(countryKeys.list(query, 'offline-read'));
  });

  it('does not let the device preference expand a company policy that denies offline read', async () => {
    mockOfflineReadEnabled = true;
    mockCentralOfflineReadAllowed = false;
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

    const hook = await renderHook(() => useCountries(query));
    const contract = hook.result.current as unknown as {
      enabled: boolean;
      queryKey: readonly unknown[];
    };

    expect(contract.enabled).toBe(true);
    expect(contract.queryKey).toEqual(countryKeys.list(query, 'online-required'));
  });

  it('waits for both local preference and central policy state to load', async () => {
    mockOfflinePolicyLoaded = false;
    const hook = await renderHook(() => useCountryLookup());
    const contract = hook.result.current as unknown as { enabled: boolean };

    expect(contract.enabled).toBe(false);
  });

  it.each([
    ['archive', useArchiveCountry, 7, mockCountryUseCases.archive],
    ['restore', useRestoreCountry, 7, mockCountryUseCases.restore],
    ['bulk archive', useBulkArchiveCountries, [3, 7], mockCountryUseCases.bulkArchive],
    ['bulk create', useBulkCreateCountries, [{ nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY', phoneCode: '+20', currencyCode: 'EGP' }], mockCountryUseCases.bulkCreate],
  ] as const)('invalidates the Countries root after %s succeeds', async (_name, useMutationHook, variables, apiMethod) => {
    const hook = await renderHook(() => useMutationHook());
    const mutation = hook.result.current as unknown as MutationContract<typeof variables>;

    await mutation.mutationFn(variables);
    expect(apiMethod).toHaveBeenCalledWith(variables);

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: countryKeys.all });
  });

  it('uses create/update transport and invalidates the Countries root', async () => {
    const hook = await renderHook(() => useSaveCountry());
    const mutation = hook.result.current as unknown as MutationContract<{
      id: number | null;
      request: {
        nameAr: string;
        nameEn: string;
        alpha2Code: string | null;
        alpha3Code: string | null;
        phoneCode: string | null;
        currencyCode: string | null;
      };
    }>;
    const request = {
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: 'EG',
      alpha3Code: 'EGY',
      phoneCode: '+20',
      currencyCode: 'EGP',
    };

    await mutation.mutationFn({ id: null, request });
    await mutation.mutationFn({ id: 7, request });
    expect(mockCountryUseCases.save).toHaveBeenNthCalledWith(1, { id: null, request });
    expect(mockCountryUseCases.save).toHaveBeenNthCalledWith(2, { id: 7, request });

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: countryKeys.all });
  });
});
