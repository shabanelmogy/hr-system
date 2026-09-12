export type NavigationNavigateEventLike = {
  navigationType: string;
  cancelable: boolean;
  destination: { sameDocument: boolean; key: string };
  preventDefault(): void;
};
export type NavigationTraversalController = {
  currentEntry?: { key: string };
  addEventListener(type: "navigate", listener: (event: NavigationNavigateEventLike) => void): void;
  removeEventListener(type: "navigate", listener: (event: NavigationNavigateEventLike) => void): void;
  traverseTo(key: string): { committed: Promise<unknown>; finished: Promise<unknown> };
};
/** Cancel before commit without changing the history stack. */
export function installHistoryTraversalGuard({ navigation, hasUnsavedChanges, requestDiscard }: {
  navigation?: NavigationTraversalController;
  hasUnsavedChanges(): boolean;
  requestDiscard(): Promise<boolean>;
}): () => void {
  if (!navigation) return () => undefined;
  let disposed = false;
  let pending: { origin: string | undefined; target: string } | null = null;
  let replay: string | null = null;
  const handle = (event: NavigationNavigateEventLike) => {
    if (event.navigationType !== "traverse" || !event.destination.sameDocument || !event.cancelable) return;
    const key = event.destination.key;
    if (replay === key) { replay = null; return; }
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    if (pending) return;
    const decision = { origin: navigation.currentEntry?.key, target: key };
    pending = decision;
    void requestDiscard().then(async (accepted) => {
      if (disposed || pending !== decision) return;
      pending = null;
      if (!accepted || navigation.currentEntry?.key !== decision.origin) return;
      replay = decision.target;
      try {
        const result = navigation.traverseTo(decision.target);
        await Promise.all([result.committed, result.finished]);
      } catch {
        // Destination removed or superseded: do not navigate elsewhere.
      } finally { replay = null; }
    }).catch(() => { if (pending === decision) pending = null; });
  };
  navigation.addEventListener("navigate", handle);
  return () => {
    disposed = true;
    pending = null;
    replay = null;
    navigation.removeEventListener("navigate", handle);
  };
}