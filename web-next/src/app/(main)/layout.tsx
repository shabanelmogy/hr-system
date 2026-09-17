import { Suspense, type ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/SessionContext";
import { RouteLoading } from "@/shared/components/feedback/routes";
import { MainClientBootstrap } from "@/shell/bootstrap";
import MainShell from "./MainShell";

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <SessionProvider>
        <MainClientBootstrap />
        <MainShell>{children}</MainShell>
      </SessionProvider>
    </Suspense>
  );
}
