"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "@/layouts/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import { RouteAuthorizationGuard } from "@/shared/components/auth";
import { RouteLoading } from "@/shared/components/feedback/routes";
import { createQueryClient } from "@/shared/config/queryClient";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
  { ssr: false },
);

const NotificationRealtimeBridge = dynamic(
  () =>
    import("@/features/notifications/NotificationRealtimeBridge").then(
      (module) => module.NotificationRealtimeBridge,
    ),
  { ssr: false },
);

const RealtimeEntityBridge = dynamic(
  () =>
    import("@/features/realtime/RealtimeEntityBridge").then(
      (module) => module.RealtimeEntityBridge,
    ),
  { ssr: false },
);

export default function MainShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SignalRProvider>
        <NotificationRealtimeBridge />
        <RealtimeEntityBridge />
        <MainLayout>
          <RouteAuthorizationGuard fallback={<RouteLoading />}>
            <Suspense fallback={<RouteLoading />}>{children}</Suspense>
          </RouteAuthorizationGuard>
        </MainLayout>
      </SignalRProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
