// SidebarContext.js
import * as React from "react";

// Create a context for sidebar state
const SidebarContext = React.createContext({
  open: false,
  setOpen: () => {},
});

// Custom hook to access sidebar context
export const useSidebar = () => React.useContext(SidebarContext);

export default SidebarContext;
