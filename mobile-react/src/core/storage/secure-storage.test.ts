import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import { secureSession } from './secure-storage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

describe('secureSession.setTokens', () => {
  beforeEach(() => jest.clearAllMocks());

  it('waits for both writes to settle before cleanup after one write rejects', async () => {
    const storageFailure = new Error('secure storage unavailable');
    const persistedTokens = new Map<string, string>();
    let releaseAccessWrite: (() => void) | undefined;
    let accessWriteSettled = false;
    let cleanupStartedBeforeAccessSettled = false;

    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.refreshToken) throw storageFailure;

      return new Promise<void>((resolve) => {
        releaseAccessWrite = () => {
          persistedTokens.set(key, 'access');
          accessWriteSettled = true;
          resolve();
        };
      });
    });
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      if (!accessWriteSettled) cleanupStartedBeforeAccessSettled = true;
      persistedTokens.delete(key);
    });

    const setTokens = secureSession.setTokens('access', 'refresh');
    const writeFailure = expect(setTokens).rejects.toBe(storageFailure);
    await Promise.resolve();
    await Promise.resolve();

    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    expect(releaseAccessWrite).toBeDefined();
    releaseAccessWrite?.();

    await writeFailure;
    expect(cleanupStartedBeforeAccessSettled).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.accessToken);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken);
    expect(persistedTokens.size).toBe(0);
  });

  it('stores both credentials when both writes succeed', async () => {
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);

    await secureSession.setTokens('access', 'refresh');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.accessToken, 'access');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken, 'refresh');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('rethrows the first write failure when both writes reject', async () => {
    const accessFailure = new Error('access-token write failed');
    const refreshFailure = new Error('refresh-token write failed');
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key) => {
      throw key === STORAGE_KEYS.accessToken ? accessFailure : refreshFailure;
    });
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);

    await expect(secureSession.setTokens('access', 'refresh')).rejects.toBe(accessFailure);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });
});

describe('secureSession.clear', () => {
  beforeEach(() => jest.clearAllMocks());

  it('waits for both credential deletions before resolving', async () => {
    const storedTokens = new Map<string, string>([
      [STORAGE_KEYS.accessToken, 'access'],
      [STORAGE_KEYS.refreshToken, 'refresh'],
    ]);
    let finishAccessDeletion: (() => void) | undefined;
    let clearSettled = false;

    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.accessToken) {
        await new Promise<void>((resolve) => {
          finishAccessDeletion = () => {
            storedTokens.delete(key);
            resolve();
          };
        });
        return;
      }

      storedTokens.delete(key);
    });

    const clear = secureSession.clear().then(() => { clearSettled = true; });
    await Promise.resolve();
    await Promise.resolve();

    expect(clearSettled).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(finishAccessDeletion).toBeDefined();
    finishAccessDeletion?.();

    await clear;
    expect(clearSettled).toBe(true);
    expect(storedTokens.size).toBe(0);
  });

  it('waits for both deletions and rethrows the first deletion failure deterministically', async () => {
    const accessFailure = new Error('access-token delete failed');
    const refreshFailure = new Error('refresh-token delete failed');
    let finishRefreshDeletion: (() => void) | undefined;

    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      if (key === STORAGE_KEYS.accessToken) throw accessFailure;

      await new Promise<void>((resolve) => {
        finishRefreshDeletion = () => resolve();
      });
      throw refreshFailure;
    });

    let clearSettled = false;
    const clear = secureSession.clear().finally(() => { clearSettled = true; });
    const deletionFailure = expect(clear).rejects.toBe(accessFailure);
    await Promise.resolve();
    await Promise.resolve();

    expect(clearSettled).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    finishRefreshDeletion?.();

    await deletionFailure;
    expect(clearSettled).toBe(true);
  });
});
