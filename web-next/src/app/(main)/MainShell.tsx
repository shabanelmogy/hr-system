"use client";

import "./moduleRegistration";

import dynamic from "next/dynamic";
import { Suspense, useLayoutEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import { useRoleStore, useUserStore } from "@/platform/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "@/shell/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import RouteAuthorizationGuard from "@/shell/auth/RouteAuthorizationGuard";
import { RouteLoading } from "@/shared/components/feedback/routes";
import { createQueryClient } from "@/shared/config/queryClient";
import { TenantAccessBoundary } from "@/platform/tenant-access";
import { UnsavedChangesProvider } from "@/shared/contexts/UnsavedChangesContext";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
  { ssr: false },
);

const NotificationRealtimeBridge = dynamic(
  () =>
    import("@/platform/notifications").then(
      (module) => module.NotificationRealtimeBridge,
    ),
  { ssr: false },
);

const RealtimeEntityBridge = dynamic(
  () =>
    import("@/platform/realtime").then(
      (module) => module.RealtimeEntityBridge,
    ),
  { ssr: false },
);

export default function MainShell({ children }: { children: ReactNode }) {
  const { user, isSwitchingCompany, isLoggingOut } = useSession();
  const contextKey = JSON.stringify([user?.userId, user?.tenantId, user?.companyId]);
  if (isSwitchingCompany || isLoggingOut) return <RouteLoading />;
  return <ContextShell key={contextKey}>{children}</ContextShell>;
}

function ContextShell({ children }: { children: ReactNode }) {
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
        <SignalRProvider>
          <TenantAccessBoundary>
            <Suspense fallback={null}>
              <NotificationRealtimeBridge />
              <RealtimeEntityBridge />
            </Suspense>
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
