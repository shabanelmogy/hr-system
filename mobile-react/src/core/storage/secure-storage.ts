import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';

type SecretKey = typeof STORAGE_KEYS.accessToken | typeof STORAGE_KEYS.refreshToken;

const webSessionSecrets = new Map<SecretKey, string>();

async function getSecret(key: SecretKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webSessionSecrets.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setSecret(key: SecretKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSessionSecrets.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
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
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      setSecret(STORAGE_KEYS.accessToken, accessToken),
      setSecret(STORAGE_KEYS.refreshToken, refreshToken),
    ]);
  },
  clear: async () => {
    await Promise.all([
      deleteSecret(STORAGE_KEYS.accessToken),
      deleteSecret(STORAGE_KEYS.refreshToken),
    ]);
  },
};
