"use client";

import { SessionProvider, useSession } from "@/lib/auth/SessionContext";
import { UnsavedChangesProvider } from "@/shared/contexts/UnsavedChangesContext";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";
import ChangePassword from "../profile-tabs/change-password/ChangePassword";

export default function ProtectedChangePasswordPage() {
  return (
    <SessionProvider>
      <AuthenticatedChangePassword />
    </SessionProvider>
  );
}

function AuthenticatedChangePassword() {
  const { user, isLoading, isLoggingOut } = useSession();

  if (isLoading || isLoggingOut || !user) return <RouteLoading />;

  return (
    <UnsavedChangesProvider>
      <ChangePassword />
    </UnsavedChangesProvider>
  );
}
