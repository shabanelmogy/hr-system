import { useCallback, useState } from 'react';

interface UseDiscardChangesOptions {
  isDirty?: boolean;
  busy?: boolean;
  active?: boolean;
  onDiscard?: () => void;
}

export function useDiscardChanges({
  isDirty = false,
  busy = false,
  active = true,
  onDiscard,
}: UseDiscardChangesOptions) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const requestClose = useCallback(() => {
    if (busy || !onDiscard) return;
    if (isDirty) {
      setDialogVisible(true);
      return;
    }
    onDiscard();
  }, [busy, isDirty, onDiscard]);

  const keepEditing = useCallback(() => {
    if (!busy) setDialogVisible(false);
  }, [busy]);

  const discard = useCallback(() => {
    if (busy) return;
    setDialogVisible(false);
    onDiscard?.();
  }, [busy, onDiscard]);

  return {
    dialogVisible: active && dialogVisible,
    discard,
    keepEditing,
    requestClose,
  };
}
