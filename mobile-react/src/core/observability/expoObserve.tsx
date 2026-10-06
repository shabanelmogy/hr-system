import Constants, { AppOwnership, ExecutionEnvironment } from 'expo-constants';
import React, { type ReactNode } from 'react';

import type { ObserveConfig } from 'expo-observe';

type ObserveFallbackProps = {
  error: unknown;
  resetError: () => void;
};

type ObserveErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: ObserveFallbackProps) => ReactNode;
};

type ObserveModule = typeof import('expo-observe');

/**
 * Expo Go does not ship the native ExpoAppMetrics/ExpoObserve modules. Keep the
 * import behind a runtime guard so the application can still be opened there;
 * development and release builds continue to use the real Observe package.
 */
const isExpoGo =
  Constants.appOwnership === AppOwnership.Expo ||
  (Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.expoVersion !== null);
const observeModule = loadObserveModule();

function loadObserveModule(): ObserveModule | null {
  if (isExpoGo && process.env.NODE_ENV !== 'test') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-observe') as ObserveModule;
  } catch {
    // A native module can be absent from a local/bare build as well. Observability
    // must never prevent the ERP shell from starting in that case.
    return null;
  }
}

export function configureObserve(config: ObserveConfig): void {
  observeModule?.Observe.configure(config);
}

export function ObserveRoot({ children }: { children: ReactNode }) {
  const Root = observeModule?.ObserveRoot;
  return Root ? <Root>{children}</Root> : <>{children}</>;
}

export function ObserveErrorBoundary({ children, fallback }: ObserveErrorBoundaryProps) {
  const Boundary = observeModule?.ObserveErrorBoundary;
  return Boundary ? (
    <Boundary fallback={fallback}>{children}</Boundary>
  ) : (
    <FallbackErrorBoundary fallback={fallback}>{children}</FallbackErrorBoundary>
  );
}

type FallbackErrorBoundaryState = {
  error: unknown;
  hasError: boolean;
};

/** A small JS-only boundary used when Expo Go cannot load native metrics. */
class FallbackErrorBoundary extends React.Component<
  ObserveErrorBoundaryProps,
  FallbackErrorBoundaryState
> {
  state: FallbackErrorBoundaryState = { error: null, hasError: false };

  static getDerivedStateFromError(error: unknown): FallbackErrorBoundaryState {
    return { error, hasError: true };
  }

  private resetError = () => {
    this.setState({ error: null, hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error, resetError: this.resetError });
    }

    return this.props.children;
  }
}
