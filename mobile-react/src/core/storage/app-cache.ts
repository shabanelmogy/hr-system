import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import { queryClient } from '@/src/core/query/query-client';

const cachedPreferenceKeys = [
  STORAGE_KEYS.language,
  STORAGE_KEYS.themeMode,
  STORAGE_KEYS.themePalette,
  STORAGE_KEYS.mockDataEnabled,
  STORAGE_KEYS.onboardingCompleted,
] as const;

export async function clearApplicationCache(): Promise<void> {
  queryClient.clear();
  await AsyncStorage.multiRemove([...cachedPreferenceKeys]);
}
