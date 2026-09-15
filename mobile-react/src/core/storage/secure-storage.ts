import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';

type SecretKey = typeof STORAGE_KEYS.accessToken | typeof STORAGE_KEYS.refreshToken
  | typeof STORAGE_KEYS.offlineDatabaseKey | typeof STORAGE_KEYS.offlineSessionPointer;

const secretOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const webSessionSecrets = new Map<SecretKey, string>();

async function getSecret(key: SecretKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webSessionSecrets.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setSecret(key: SecretKey, value: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
  if (Platform.OS === 'web') {
    webSessionSecrets.set(key, value);
    return;
  }

  if (options) {
    await SecureStore.setItemAsync(key, value, options);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function deleteSecret(key: SecretKey): Promise<void> {
  if (Platform.OS === 'web') {
    webSessionSecrets.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const secureSession = {
  getAccessToken: () => getSecret(STORAGE_KEYS.accessToken),
  getRefreshToken: () => getSecret(STORAGE_KEYS.refreshToken),
  getOfflineSessionPointer: () => getSecret(STORAGE_KEYS.offlineSessionPointer),
  setOfflineSessionPointer: (value: string) => setSecret(STORAGE_KEYS.offlineSessionPointer, value, secretOptions),
  clearOfflineSessionPointer: () => deleteSecret(STORAGE_KEYS.offlineSessionPointer),
  getOrCreateOfflineDatabaseKey: async (): Promise<string> => {
    const existing = await getSecret(STORAGE_KEYS.offlineDatabaseKey);
    if (existing && /^[0-9a-f]{64}$/i.test(existing)) return existing.toLowerCase();
    const { getRandomBytesAsync } = await import('expo-crypto');
    const generated = Array.from(await getRandomBytesAsync(32))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    await setSecret(STORAGE_KEYS.offlineDatabaseKey, generated, secretOptions);
    return generated;
  },
  setTokens: async (accessToken: string, refreshToken: string) => {
    const writes = await Promise.allSettled([
      setSecret(STORAGE_KEYS.accessToken, accessToken),
      setSecret(STORAGE_KEYS.refreshToken, refreshToken),
    ]);
    // Preserve token write order as the deterministic rejection priority.
    const failedWrite = writes.find((result) => result.status === 'rejected');

    if (failedWrite?.status === 'rejected') {
      await Promise.allSettled([
        deleteSecret(STORAGE_KEYS.accessToken),
        deleteSecret(STORAGE_KEYS.refreshToken),
      ]);
      throw failedWrite.reason;
    }
  },
  clear: async () => {
    const deletions = await Promise.allSettled([
      deleteSecret(STORAGE_KEYS.accessToken),
      deleteSecret(STORAGE_KEYS.refreshToken),
    ]);
    const failedDeletion = deletions.find((result) => result.status === 'rejected');

    if (failedDeletion?.status === 'rejected') {
      throw failedDeletion.reason;
    }
  },
};
