type DiscardUnsavedChange = () => void;

const entries = new Map<symbol, { discard: DiscardUnsavedChange; busy: boolean }>();

export function registerUnsavedChange(discard: DiscardUnsavedChange, busy = false): () => void {
  const id = Symbol('unsaved-change');
  entries.set(id, { discard, busy });
  return () => {
    entries.delete(id);
  };
}

export function hasUnsavedChanges(): boolean {
  return entries.size > 0;
}

export function hasBusyUnsavedChanges(): boolean {
  return [...entries.values()].some((entry) => entry.busy);
}

export function discardUnsavedChanges(): boolean {
  if (hasBusyUnsavedChanges()) return false;
  const callbacks = [...entries.values()];
  entries.clear();
  for (const entry of callbacks) entry.discard();
  return true;
}

export function clearUnsavedChangesForTests(): void {
  entries.clear();
}
