"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";

export function useCompanyContextTransition() {
  const { user, switchCompany, isSwitchingCompany } = useSession();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const pendingRef = useRef(false);

  const transitionToCompany = useCallback(async (companyId: number) => {
    if (!user || companyId === user.companyId || pendingRef.current || isSwitchingCompany) return false;
    pendingRef.current = true;
    try {
      if (!(await requestDiscard())) return false;
      // SessionProvider cancels requests; MainShell resets caches and feature state.
      await switchCompany(companyId);
      router.refresh();
      return true;
    } finally {
      pendingRef.current = false;
    }
  }, [isSwitchingCompany, requestDiscard, router, switchCompany, user]);

  return { user, isSwitchingCompany, transitionToCompany };
}
