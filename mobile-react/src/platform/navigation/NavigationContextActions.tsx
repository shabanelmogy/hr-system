import { createContext, useContext, type ReactNode } from 'react';

interface NavigationContextActionsValue {
  primary: ReactNode;
}

const NavigationContextActionsContext = createContext<NavigationContextActionsValue>({
  primary: null,
});

export function NavigationContextActionsProvider({
  children,
  primary = null,
}: {
  children: ReactNode;
  primary?: ReactNode;
}) {
  return (
    <NavigationContextActionsContext.Provider value={{ primary }}>
      {children}
    </NavigationContextActionsContext.Provider>
  );
}

export function useNavigationContextActions() {
  return useContext(NavigationContextActionsContext);
}
