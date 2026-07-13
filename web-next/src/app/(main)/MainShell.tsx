"use client";

import { Suspense, type ReactNode } from "react";
import MainLayout from "@/layouts/main-layout/MainLayout";
import { SignalRProvider } from "@/lib/signalr/SignalRProvider";
import { MyLoadingIndicator } from "@/shared/components/common/loaders/MyLoadingIndicator";

export default function MainShell({ children }: { children: ReactNode }) {
  return (
    <SignalRProvider>
      <MainLayout>
        <Suspense fallback={<MyLoadingIndicator />}>{children}</Suspense>
      </MainLayout>
    </SignalRProvider>
  );
}
