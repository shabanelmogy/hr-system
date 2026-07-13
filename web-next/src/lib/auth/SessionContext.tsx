"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isSessionClaims, type SessionClaims } from "./session";
import { hasPermission as checkPermission } from "./permissions";
import type { PermissionString } from "./permissions";
import apiClient from "@/lib/api/client";

type SessionContextValue = {
  user: SessionClaims | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Returns true if `roles` is empty (no restriction) or the user has at least one of the given roles (OR semantics). */
  hasRole: (roles: readonly string[]) => boolean;
  /** Returns true if `permissions` is empty (no restriction) or the user has at least one of the given permissions (OR semantics). */
  hasPermission: (permissions: readonly PermissionString[]) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initialUser }: { children: ReactNode; initialUser: SessionClaims | null }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionClaims | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    // Reuse in-flight request to prevent race conditions
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    setIsLoading(true);
    const promise = (async () => {
      setError(null);
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store"
        });
        
        // 401 = not authenticated (expected, not an error)
        if (response.status === 401) {
          setUser(null);
          setError(null);
          return;
        }
        
        // Server errors - don't clear user, they might still be authenticated
        if (!response.ok) {
          setError(`Server error: ${response.status}`);
          return;
        }
        
        const payload = (await response.json()) as { user?: unknown };
        if (isSessionClaims(payload.user)) {
          setUser(payload.user);
          setError(null);
        } else {
          setError("Invalid session data");
          setUser(null);
        }
      } catch (err) {
        // Network errors - don't clear user
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsLoading(false);
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  const logout = useCallback(async () => {
    // 1. Delete cookies server-side first — proxy will see no cookies on next request
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Network failure — still proceed with local cleanup
    }

    // 2. Navigate before clearing React state so the (main) layout is already
    //    unmounting when the re-render cascade from setUser(null) fires.
    //    router.replace keeps the history stack clean (back button won’t return to protected page).
    router.replace("/login");

    // 3. Clear local state after navigation has started
    setUser(null);
    setError(null);

    // 4. Reset the apiClient guard so future 401s can trigger logout again
    apiClient.resetLogoutGuard();
  }, [router]);

  // Handle logout events dispatched by apiClient (e.g. on 401 interceptor)
  useEffect(() => {
    const handler = () => { void logout(); };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  const value = useMemo<SessionContextValue>(() => ({
    user,
    isLoading,
    error,
    refresh,
    logout,
    hasRole: (roles) => {
      if (roles.length === 0) return true;
      if (!user) return false;
      return roles.some((role) =>
        user.roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase())
      );
    },
    hasPermission: (permissions) => {
      if (permissions.length === 0) return true;
      if (!user) return false;
      return permissions.some((permission) => checkPermission(user.permissions, permission));
    }
  }), [isLoading, error, refresh, logout, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
