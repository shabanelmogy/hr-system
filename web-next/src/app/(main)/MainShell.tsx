"use client";

import "./moduleRegistration";

import dynamic from "next/dynamic";
import { Suspense, useLayoutEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import { useRoleStore, useUserStore } from "@/platform/auth/context-stores";
import { QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "@/shell/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import RouteAuthorizationGuard from "@/shell/auth/RouteAuthorizationGuard";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";
import { createQueryClient } from "@/shared/config/queryClient";
import { TenantAccessBoundary } from "@/platform/tenant-access/runtime";
import { UnsavedChangesProvider } from "@/shared/contexts/UnsavedChangesContext";
import { MainClientBootstrap } from "@/shell/bootstrap";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
  { ssr: false },
);

const NotificationRealtimeBridge = dynamic(
  () =>
    import("@/platform/notifications/realtime").then(
      (module) => module.NotificationRealtimeBridge,
    ),
  { ssr: false },
);

const RealtimeEntityBridge = dynamic(
  () =>
    import("@/platform/realtime/runtime").then(
      (module) => module.RealtimeEntityBridge,
    ),
  { ssr: false },
);

export default function MainShell({ children }: { children: ReactNode }) {
  const { user, isSwitchingCompany, isLoggingOut } = useSession();
  const realtimeEnabled = Boolean(
    user?.userId &&
    user.tenantId &&
    user.companyId > 0 &&
    !user.roles.some((role) => role.trim().toLowerCase() === "super_admin"),
  );

  // Company switching and logout explicitly unmount the context shell. Keeping
  // the initial null -> authenticated bootstrap on the same shell avoids
  // discarding the first QueryClient and replaying every page query.
  if (isSwitchingCompany || isLoggingOut) return <RouteLoading />;
  return <ContextShell realtimeEnabled={realtimeEnabled}>{children}</ContextShell>;
}

function ContextShell({
  children,
  realtimeEnabled,
}: {
  children: ReactNode;
  realtimeEnabled: boolean;
}) {
  const [queryClient] = useState(() => createQueryClient());
  useLayoutEffect(() => {
    useUserStore.getState().resetUserData();
    useRoleStore.getState().resetRoleData();
    return () => {
      void queryClient.cancelQueries();
      queryClient.clear();
      useUserStore.getState().resetUserData();
      useRoleStore.getState().resetRoleData();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <UnsavedChangesProvider>
        <MainClientBootstrap />
        <SignalRProvider>
          <TenantAccessBoundary>
            {realtimeEnabled ? (
              <Suspense fallback={null}>
                <NotificationRealtimeBridge />
                <RealtimeEntityBridge />
              </Suspense>
            ) : null}
            <MainLayout>
              <RouteAuthorizationGuard fallback={<RouteLoading />}>
                <Suspense fallback={<RouteLoading />}>{children}</Suspense>
              </RouteAuthorizationGuard>
            </MainLayout>
          </TenantAccessBoundary>
        </SignalRProvider>
      </UnsavedChangesProvider>
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
