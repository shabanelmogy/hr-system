import { renderHook } from '@testing-library/react-native';

import { countryApi } from '../api/country-api';
import { countryKeys } from './country-keys';
import {
  useArchiveCountry,
  useBulkArchiveCountries,
  useBulkCreateCountries,
  useRestoreCountry,
  useSaveCountry,
} from './use-countries';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../api/country-api', () => ({
  countryApi: {
    archive: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
    create: jest.fn(),
    getPage: jest.fn(),
    restore: jest.fn(),
    update: jest.fn(),
  },
}));

type MutationContract<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
};

describe('country mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it.each([
    ['archive', useArchiveCountry, 7, countryApi.archive],
    ['restore', useRestoreCountry, 7, countryApi.restore],
    ['bulk archive', useBulkArchiveCountries, [3, 7], countryApi.bulkArchive],
    ['bulk create', useBulkCreateCountries, [{ nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY', phoneCode: '+20', currencyCode: 'EGP' }], countryApi.bulkCreate],
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
      request: Parameters<typeof countryApi.create>[0];
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
    expect(countryApi.create).toHaveBeenCalledWith(request);
    expect(countryApi.update).toHaveBeenCalledWith(7, request);

    await mutation.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: countryKeys.all });
  });
});
