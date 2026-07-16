"use client";

import { Suspense, type ReactNode } from "react";
import AuthLayout from "@/layouts/auth-layout/AuthLayout";
import RouteLoading from "@/shared/components/feedback/RouteLoading";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <AuthLayout>
      <Suspense fallback={<RouteLoading />}>{children}</Suspense>
    </AuthLayout>
  );
}

