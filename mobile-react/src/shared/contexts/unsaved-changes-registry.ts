type DiscardUnsavedChange = () => void;

const entries = new Map<symbol, DiscardUnsavedChange>();

export function registerUnsavedChange(discard: DiscardUnsavedChange): () => void {
  const id = Symbol('unsaved-change');
  entries.set(id, discard);
  return () => {
    entries.delete(id);
  };
}

export function hasUnsavedChanges(): boolean {
  return entries.size > 0;
}

export function discardUnsavedChanges(): void {
  const callbacks = [...entries.values()];
  entries.clear();
  for (const discard of callbacks) discard();
}

export function clearUnsavedChangesForTests(): void {
  entries.clear();
}
