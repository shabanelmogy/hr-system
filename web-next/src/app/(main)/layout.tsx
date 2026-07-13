import type { ReactNode } from "react";
import MainShell from "./MainShell";

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  return <MainShell>{children}</MainShell>;
}
