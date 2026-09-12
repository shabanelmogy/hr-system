export interface UnsavedChangesRegistry {
  register(id: string, busy?: boolean): () => void;
  isBusy(): boolean;
  hasUnsavedChanges(): boolean;
  count(): number;
  subscribe(listener: () => void): () => void;
  getSnapshot(): number;
}

export function createUnsavedChangesRegistry(): UnsavedChangesRegistry {
  const dirtySources = new Set<string>();
  const busySources = new Set<string>();
  const listeners = new Set<() => void>();
  let version = 0;

  const notify = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  return {
    register(id, busy = false) {
      const wasDirty = dirtySources.has(id);
      const wasBusy = busySources.has(id);
      dirtySources.add(id);
      if (busy) busySources.add(id);
      else busySources.delete(id);
      if (!wasDirty || wasBusy !== busy) notify();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        const dirtyChanged = dirtySources.delete(id);
        const busyChanged = busySources.delete(id);
        const changed = dirtyChanged || busyChanged;
        if (changed) notify();
      };
    },
    hasUnsavedChanges: () => dirtySources.size > 0,
    isBusy: () => busySources.size > 0,
    count: () => dirtySources.size,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => version,
  };
}
