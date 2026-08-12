"use client";

import { createContext, useContext, type ReactNode } from "react";

type AppReadOnlyContextValue = {
  isReadOnly: boolean;
  notifyBlockedAction: () => void;
};

const defaultValue: AppReadOnlyContextValue = {
  isReadOnly: false,
  notifyBlockedAction: () => undefined,
};

const AppReadOnlyContext = createContext<AppReadOnlyContextValue>(defaultValue);

export function AppReadOnlyProvider({
  children,
  isReadOnly,
  onBlockedAction,
}: {
  children: ReactNode;
  isReadOnly: boolean;
  onBlockedAction?: () => void;
}) {
  return (
    <AppReadOnlyContext.Provider
      value={{
        isReadOnly,
        notifyBlockedAction: onBlockedAction ?? defaultValue.notifyBlockedAction,
      }}
    >
      {children}
    </AppReadOnlyContext.Provider>
  );
}

export function useAppReadOnly() {
  return useContext(AppReadOnlyContext);
}
