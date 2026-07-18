import type { MouseEvent } from "react";
import { useCallback, useSyncExternalStore } from "react";

export type ViewLayoutChangeHandler = (
  event: MouseEvent<HTMLElement> | null,
  newLayout: string | null,
) => void;

type LayoutStorage = Pick<Storage, "getItem" | "setItem">;

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredViewLayout(
  storage: Pick<Storage, "getItem"> | null,
  storageKey: string,
  defaultLayout: string,
  validLayouts: readonly string[],
): string {
  if (!storage) return defaultLayout;

  try {
    const savedView = storage.getItem(storageKey);
    return savedView && validLayouts.includes(savedView)
      ? savedView
      : defaultLayout;
  } catch {
    return defaultLayout;
  }
}

function writeStoredViewLayout(
  storage: LayoutStorage,
  storageKey: string,
  layout: string,
): void {
  try {
    storage.setItem(storageKey, layout);
  } catch {
    // View persistence is optional and must not block view changes.
  }
}

function viewLayoutEventName(storageKey: string): string {
  return `view-layout:${storageKey}`;
}

const useViewLayout = (
  storageKey: string,
  defaultLayout = "grid",
  validLayouts: readonly string[] = ["grid", "list", "smallList"],
): [string, ViewLayoutChangeHandler] => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => undefined;

      const eventName = viewLayoutEventName(storageKey);
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(eventName, onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(eventName, onStoreChange);
      };
    },
    [storageKey],
  );

  const getSnapshot = useCallback(
    () =>
      readStoredViewLayout(
        getBrowserStorage(),
        storageKey,
        defaultLayout,
        validLayouts,
      ),
    [defaultLayout, storageKey, validLayouts],
  );

  const getServerSnapshot = useCallback(() => defaultLayout, [defaultLayout]);
  const viewLayout = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleViewLayoutChange = useCallback<ViewLayoutChangeHandler>(
    (_event, newLayout) => {
      if (newLayout === null || !validLayouts.includes(newLayout)) return;

      if (typeof window !== "undefined") {
        const storage = getBrowserStorage();
        if (!storage) return;

        writeStoredViewLayout(storage, storageKey, newLayout);
        window.dispatchEvent(new Event(viewLayoutEventName(storageKey)));
      }
    },
    [storageKey, validLayouts],
  );

  return [viewLayout, handleViewLayoutChange];
};

export default useViewLayout;
