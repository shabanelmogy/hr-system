export type NavigationNavigateEventLike = {
  navigationType: string;
  cancelable: boolean;
  canIntercept: boolean;
  destination: { sameDocument: boolean; key: string };
  intercept(options: {
    precommitHandler(): Promise<void> | void;
  }): void;
};
export type NavigationTraversalController = {
  addEventListener(type: "navigate", listener: (event: NavigationNavigateEventLike) => void): void;
  removeEventListener(type: "navigate", listener: (event: NavigationNavigateEventLike) => void): void;
};

export function asNavigationTraversalController(
  value: unknown,
): NavigationTraversalController | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (!("addEventListener" in value) || typeof value.addEventListener !== "function") return undefined;
  if (!("removeEventListener" in value) || typeof value.removeEventListener !== "function") return undefined;

  const addEventListener = value.addEventListener;
  const removeEventListener = value.removeEventListener;
  return {
    addEventListener(type, listener) {
      addEventListener.call(value, type, listener);
    },
    removeEventListener(type, listener) {
      removeEventListener.call(value, type, listener);
    },
  };
}

/** Cancel before commit without changing the history stack. */
export function installHistoryTraversalGuard({ navigation, hasUnsavedChanges, requestDiscard }: {
  navigation?: NavigationTraversalController;
  hasUnsavedChanges(): boolean;
  requestDiscard(): Promise<boolean>;
}): () => void {
  if (!navigation) return () => undefined;
  let disposed = false;
  let pendingDecision: Promise<boolean> | null = null;
  const handle = (event: NavigationNavigateEventLike) => {
    if (
      event.navigationType !== "traverse" ||
      !event.destination.sameDocument ||
      !event.cancelable ||
      !event.canIntercept
    ) return;
    if (!hasUnsavedChanges()) return;

    event.intercept({
      precommitHandler: async () => {
        if (disposed) throw navigationBlockedError();

        // Only the first traversal owns the confirmation. A second Back/Forward
        // action while that decision is pending must not silently queue another
        // destination behind the user's single confirmation.
        if (pendingDecision) throw navigationBlockedError();

        const decision = requestDiscard();
        pendingDecision = decision;
        try {
          const accepted = await decision;
          if (disposed || !accepted) throw navigationBlockedError();
        } finally {
          if (pendingDecision === decision) pendingDecision = null;
        }
      },
    });
  };
  navigation.addEventListener("navigate", handle);
  return () => {
    disposed = true;
    pendingDecision = null;
    navigation.removeEventListener("navigate", handle);
  };
}

function navigationBlockedError() {
  return new DOMException("Navigation blocked by unsaved changes", "AbortError");
}
