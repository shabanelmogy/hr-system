import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import {
  OfflineReadPreferencesProvider,
  useOfflineReadPreferences,
} from './OfflineReadPreferencesProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

function PreferenceConsumer() {
  const preferences = useOfflineReadPreferences();
  const enabled = preferences.isOfflineReadEnabled('countries');

  return (
    <Pressable
      onPress={() => preferences.setOfflineReadEnabled('countries', !enabled)}
      testID="toggle-offline-read">
      <Text testID="offline-read-loaded">{String(preferences.loaded)}</Text>
      <Text testID="offline-read-enabled">{String(enabled)}</Text>
    </Pressable>
  );
}

describe('OfflineReadPreferencesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restores the Countries cached-read preference after application restart', async () => {
    mockedStorage.getItem.mockResolvedValue('{"countries":true}');

    await render(
      <OfflineReadPreferencesProvider>
        <PreferenceConsumer />
      </OfflineReadPreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('offline-read-loaded').props.children).toBe('true');
      expect(screen.getByTestId('offline-read-enabled').props.children).toBe('true');
    });
  });

  it('defaults to connection-required and persists an explicit opt-in', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    await render(
      <OfflineReadPreferencesProvider>
        <PreferenceConsumer />
      </OfflineReadPreferencesProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('offline-read-loaded').props.children).toBe('true'));

    expect(screen.getByTestId('offline-read-enabled').props.children).toBe('false');
    await fireEvent.press(screen.getByTestId('toggle-offline-read'));

    expect(screen.getByTestId('offline-read-enabled').props.children).toBe('true');
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.offlineReadPreferences,
      '{"countries":true}',
    );
  });
});
