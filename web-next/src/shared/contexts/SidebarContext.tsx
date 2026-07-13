import * as React from "react";

export interface SidebarContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const value = React.useContext(SidebarContext);
  if (!value) {
    throw new Error("useSidebar must be used within SidebarContext.Provider");
  }
  return value;
}

export default SidebarContext;
