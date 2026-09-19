import { focusManager } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

export function QueryLifecycleCoordinator({ children }: PropsWithChildren) {
  useEffect(() => {
    const updateFocus = (state: string) => focusManager.setFocused(state === 'active');
    updateFocus(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateFocus);
    return () => {
      subscription.remove();
      focusManager.setFocused(undefined);
    };
  }, []);

  return children;
}
