"use client";

import { Suspense, type ReactNode } from "react";
import MainLayout from "@/layouts/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import { MyLoadingIndicator } from "@/shared/components/common/loaders/MyLoadingIndicator";
import { NotificationRealtimeBridge } from "@/shared/notifications";

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
