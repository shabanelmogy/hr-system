import Toast from 'react-native-toast-message';

import { showErrorDialog } from './errorDialogStore';
import type { AppToastOptions } from './types';

const defaultDuration = 4_500;

function show(
  type: 'success' | 'info' | 'warning' | 'loading',
  message: string,
  options?: AppToastOptions,
): void {
  Toast.show({
    type,
    text1: options?.title,
    text2: message,
    position: options?.position ?? 'top',
    visibilityTime: options?.duration ?? defaultDuration,
    autoHide: type !== 'loading',
    onPress: options?.onPress,
  });
}

export const showToast = {
  success: (message: string, options?: AppToastOptions) =>
    show('success', message, options),

  info: (message: string, options?: AppToastOptions) =>
    show('info', message, options),

  warning: (message: string, options?: AppToastOptions) =>
    show('warning', message, options),

  loading: (message: string, options?: AppToastOptions) =>
    show('loading', message, options),

  error: (error: unknown, fallbackTitle?: string) => {
    Toast.hide();
    showErrorDialog(error, fallbackTitle);
  },

  hide: () => Toast.hide(),
};
