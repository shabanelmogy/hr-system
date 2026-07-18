"use client";

import { Suspense, type ReactNode } from "react";
import { NotificationRealtimeBridge } from "@/features/notifications";
import MainLayout from "@/layouts/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import { RouteAuthorizationGuard } from "@/shared/components/auth";
import { RouteLoading } from "@/shared/components/feedback/routes";

export default function MainShell({ children }: { children: ReactNode }) {
  return (
    <SignalRProvider>
      <NotificationRealtimeBridge />
      <MainLayout>
        <RouteAuthorizationGuard fallback={<RouteLoading />}>
          <Suspense fallback={<RouteLoading />}>{children}</Suspense>
        </RouteAuthorizationGuard>
      </MainLayout>
    </SignalRProvider>
  );
}
