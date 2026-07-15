"use client";

import { Suspense, type ReactNode } from "react";
import { NotificationRealtimeBridge } from "@/features/notifications";
import MainLayout from "@/layouts/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import { MyLoadingIndicator } from "@/shared/components/common/loaders/MyLoadingIndicator";

export default function MainShell({ children }: { children: ReactNode }) {
  return (
    <SignalRProvider>
      <NotificationRealtimeBridge />
      <MainLayout>
        <Suspense fallback={<MyLoadingIndicator />}>{children}</Suspense>
      </MainLayout>
    </SignalRProvider>
  );
}
