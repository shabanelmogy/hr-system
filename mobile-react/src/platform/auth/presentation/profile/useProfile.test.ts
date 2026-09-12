import { renderHook } from '@testing-library/react-native';

import { useChangeProfilePassword, useUpdateProfileInfo } from './useProfile';

const mockInvalidateQueries = jest.fn();
const mockRefreshSession = jest.fn();
const mockUseMutation = jest.fn((options: unknown) => options);
const mockUpdateInfo = jest.fn();
const mockChangePassword = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../context/AuthProvider', () => ({
  useAuth: () => ({
    refreshSession: mockRefreshSession,
    session: { userId: 'user-1' },
    status: 'authenticated',
  }),
}));

jest.mock('../../composition/profile-container', () => ({
  profileUseCases: {
    updateInfo: (...args: unknown[]) => mockUpdateInfo(...args),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
  },
}));

type MutationContract<T> = {
  networkMode: string;
  mutationFn: (value: T) => Promise<unknown>;
  onSuccess?: () => Promise<void>;
};

describe('profile mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateInfo.mockResolvedValue(undefined);
    mockChangePassword.mockResolvedValue(undefined);
    mockInvalidateQueries.mockResolvedValue(undefined);
    mockRefreshSession.mockResolvedValue(undefined);
  });

  it('keeps profile updates immediate/server-authoritative and refreshes auth session', async () => {
    const { result } = await renderHook(() => useUpdateProfileInfo());
    const mutation = result.current as unknown as MutationContract<{
      id: string;
      userName: string;
      firstName: string;
      lastName: string;
    }>;
    const request = { id: 'user-1', userName: 'ada', firstName: 'Ada', lastName: 'Lovelace' };

    expect(mutation.networkMode).toBe('always');
    await mutation.mutationFn(request);
    await mutation.onSuccess?.();

    expect(mockUpdateInfo).toHaveBeenCalledWith(request);
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
  });

  it('does not let password changes pause for later implicit replay', async () => {
    const { result } = await renderHook(() => useChangeProfilePassword());
    const mutation = result.current as unknown as MutationContract<{
      currentPassword: string;
      newPassword: string;
    }>;
    const request = { currentPassword: 'Old#1234', newPassword: 'New#1234' };

    expect(mutation.networkMode).toBe('always');
    await mutation.mutationFn(request);
    expect(mockChangePassword).toHaveBeenCalledWith(request);
  });
});
