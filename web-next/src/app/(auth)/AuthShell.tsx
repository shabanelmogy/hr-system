"use client";

import { Suspense, type ReactNode } from "react";
import AuthLayout from "@/layouts/auth-layout/AuthLayout";
import { MyLoadingIndicator } from "@/shared/components/common/loaders/MyLoadingIndicator";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <AuthLayout>
      <Suspense fallback={<MyLoadingIndicator />}>{children}</Suspense>
    </AuthLayout>
  );
}

