import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BootstrapErrorBoundary } from './BootstrapErrorBoundary';

describe('BootstrapErrorBoundary', () => {
  it('offers a non-destructive retry when a provider bootstrap fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    let shouldFail = true;
    function Probe() {
      if (shouldFail) throw new Error('database unavailable');
      return <Text>ready</Text>;
    }
    await render(<BootstrapErrorBoundary><Probe /></BootstrapErrorBoundary>);

    expect(screen.getByText(/Unable to start the application/)).toBeTruthy();
    shouldFail = false;
    fireEvent.press(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('ready')).toBeTruthy());
    consoleError.mockRestore();
  });
});
