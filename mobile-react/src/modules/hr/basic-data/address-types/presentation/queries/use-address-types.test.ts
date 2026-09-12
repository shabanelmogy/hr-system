import { renderHook } from '@testing-library/react-native';
import { addressTypeKeys } from './address-type-keys';
import {
  useArchiveAddressType,
  useBulkArchiveAddressTypes,
  useBulkCreateAddressTypes,
  useRestoreAddressType,
  useSaveAddressType,
} from './use-address-types';

const mockInvalidate = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockUseCases = {
  archive: jest.fn(),
  bulkArchive: jest.fn(),
  bulkCreate: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  getPage: jest.fn(),
  restore: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));
jest.mock('../../composition/use-address-type-use-cases', () => ({
  useAddressTypeUseCases: () => mockUseCases,
}));

type Contract<T> = {
  mutationFn: (variables: T) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
};

describe('Address Type mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidate.mockResolvedValue(undefined);
  });

  it.each([
    ['archive', useArchiveAddressType, 7, mockUseCases.archive],
    ['restore', useRestoreAddressType, 7, mockUseCases.restore],
    ['bulk archive', useBulkArchiveAddressTypes, [3, 7], mockUseCases.bulkArchive],
    ['bulk create', useBulkCreateAddressTypes, [{ nameAr: 'منزل', nameEn: 'Home' }], mockUseCases.bulkCreate],
  ] as const)('invalidates Address Types after %s', async (_name, hookFactory, variables, useCaseMethod) => {
    const hook = await renderHook(() => hookFactory());
    const mutation = hook.result.current as unknown as Contract<typeof variables>;
    await mutation.mutationFn(variables);
    expect(useCaseMethod).toHaveBeenCalledWith(variables);
    await mutation.onSuccess();
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: addressTypeKeys.all });
  });

  it('routes save through the application use case', async () => {
    const hook = await renderHook(() => useSaveAddressType());
    const mutation = hook.result.current as unknown as Contract<{
      id: number | null;
      request: { nameAr: string; nameEn: string };
    }>;
    const input = { id: 7, request: { nameAr: 'منزل', nameEn: 'Home' } };
    await mutation.mutationFn(input);
    expect(mockUseCases.save).toHaveBeenCalledWith(input);
  });
});
