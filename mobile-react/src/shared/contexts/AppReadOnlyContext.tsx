import { createContext, useContext, type PropsWithChildren } from 'react';

interface AppReadOnlyContextValue {
  isReadOnly: boolean;
  notifyBlockedAction: () => void;
}

const defaultValue: AppReadOnlyContextValue = {
  isReadOnly: false,
  notifyBlockedAction: () => undefined,
};

const AppReadOnlyContext = createContext<AppReadOnlyContextValue>(defaultValue);

export function AppReadOnlyProvider({
  children,
  isReadOnly,
  onBlockedAction,
}: PropsWithChildren<{ isReadOnly: boolean; onBlockedAction?: () => void }>) {
  return (
    <AppReadOnlyContext.Provider
      value={{
        isReadOnly,
        notifyBlockedAction: onBlockedAction ?? defaultValue.notifyBlockedAction,
      }}>
      {children}
    </AppReadOnlyContext.Provider>
  );
}

export function useAppReadOnly() {
  return useContext(AppReadOnlyContext);
}
