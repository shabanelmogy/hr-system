import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import {
  MockDataPreferencesProvider,
  useMockDataPreferences,
} from './MockDataPreferencesProvider';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

function PreferenceConsumer() {
  const { isMockDataEnabled, setMockDataEnabled } = useMockDataPreferences();

  return (
    <Pressable onPress={() => setMockDataEnabled(!isMockDataEnabled)} testID="toggle-mock-data">
      <Text testID="mock-data-enabled">{String(isMockDataEnabled)}</Text>
    </Pressable>
  );
}

describe('MockDataPreferencesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restores the locally saved visibility preference', async () => {
    mockedStorage.getItem.mockResolvedValue('false');

    await render(
      <MockDataPreferencesProvider>
        <PreferenceConsumer />
      </MockDataPreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-data-enabled').props.children).toBe('false');
    });
  });

  it('updates and persists the visibility preference', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    await render(
      <MockDataPreferencesProvider>
        <PreferenceConsumer />
      </MockDataPreferencesProvider>,
    );

    await fireEvent.press(screen.getByTestId('toggle-mock-data'));

    expect(screen.getByTestId('mock-data-enabled').props.children).toBe('false');
    expect(mockedStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.mockDataEnabled, 'false');
  });
});
