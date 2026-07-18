import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";

interface UseFormDialogStateOptions {
  isDirty?: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit?: (event?: FormEvent) => void | Promise<void>;
}

export function useFormDialogState({
  isDirty,
  isSubmitting,
  onClose,
  onSubmit,
}: UseFormDialogStateOptions) {
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const submissionPending = isSubmitting || internalSubmitting;

  const requestClose = useCallback(() => {
    if (isSubmitting || submittingRef.current) return;
    if (isDirty) {
      setDiscardDialogOpen(true);
      return;
    }
    onClose();
  }, [isDirty, isSubmitting, onClose]);

  const cancelDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
    onClose();
  }, [onClose]);

  const resetDiscardDialog = useCallback(() => {
    setDiscardDialogOpen(false);
  }, []);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!onSubmit || isSubmitting || submittingRef.current) return;

      submittingRef.current = true;
      setInternalSubmitting(true);
      try {
        await onSubmit(event);
      } finally {
        submittingRef.current = false;
        setInternalSubmitting(false);
      }
    },
    [isSubmitting, onSubmit],
  );

  return {
    cancelDiscard,
    confirmDiscard,
    discardDialogOpen,
    requestClose,
    resetDiscardDialog,
    submissionPending,
    submit,
  };
}
