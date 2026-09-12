"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { DiscardChangesDialog } from "@/shared/components/dialogs/discard-changes/DiscardChangesDialog";
import {
  createUnsavedChangesRegistry,
  type UnsavedChangesRegistry,
} from "./unsavedChangesRegistry";
import {
  installHistoryTraversalGuard,
  type NavigationTraversalController,
} from "./historyTraversalGuard";

type UnsavedChangesContextValue = UnsavedChangesRegistry & { requestDiscard(): Promise<boolean> };
const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(createUnsavedChangesRegistry);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pendingRef = useRef<((accepted: boolean) => void) | null>(null);

  const settle = useCallback((accepted: boolean) => {
    pendingRef.current?.(accepted && !registry.isBusy());
    pendingRef.current = null;
    setOpen(false);
  }, [registry]);

  const requestDiscard = useCallback(() => {
    if (registry.isBusy()) return Promise.resolve(false);
    if (!registry.hasUnsavedChanges()) return Promise.resolve(true);
    pendingRef.current?.(false);
    setOpen(true);
    return new Promise<boolean>((resolve) => { pendingRef.current = resolve; });
  }, [registry]);

  const value = useMemo(() => ({ ...registry, requestDiscard }), [registry, requestDiscard]);

  useEffect(() => () => {
    pendingRef.current?.(false);
    pendingRef.current = null;
  }, []);

  useLayoutEffect(() => {
    const navigation = ('navigation' in window ? window.navigation : undefined) as unknown as NavigationTraversalController | undefined;
    return installHistoryTraversalGuard({
      navigation,
      hasUnsavedChanges: registry.hasUnsavedChanges,
      requestDiscard,
    });
  }, [registry, requestDiscard]);

  useEffect(() => {
    const handleLink = (event: MouseEvent) => {
      if (!registry.hasUnsavedChanges() || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      void requestDiscard().then((accepted) => {
        if (accepted) router.push(`${destination.pathname}${destination.search}${destination.hash}` as Route);
      });
    };
    document.addEventListener("click", handleLink, true);
    return () => document.removeEventListener("click", handleLink, true);
  }, [registry, requestDiscard, router]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!registry.hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [registry]);

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <DiscardChangesDialog open={open} onClose={() => settle(false)} onDiscard={() => settle(true)} />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const registry = useContext(UnsavedChangesContext);
  if (!registry) {
    throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  }
  return registry;
}

export function useUnsavedChangesRegistration(active: boolean, busy = false) {
  const registry = useUnsavedChanges();
  const id = useId();

  useEffect(() => {
    if (!active) return;
    return registry.register(id, busy);
  }, [active, busy, id, registry]);
}
