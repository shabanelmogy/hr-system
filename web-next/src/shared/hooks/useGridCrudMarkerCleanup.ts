import { useEffect } from "react";
import type { CrudItemId } from "./useGridCrudController";

interface UseGridCrudMarkerCleanupOptions {
  lastAddedId: CrudItemId | null;
  lastEditedId: CrudItemId | null;
  lastDeletedIndex: number | null;
  clearLastAdded: () => void;
  clearLastEdited: () => void;
  clearLastDeleted: () => void;
  durationMs?: number;
}

export function useGridCrudMarkerCleanup({
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  clearLastAdded,
  clearLastEdited,
  clearLastDeleted,
  durationMs = 4_000,
}: UseGridCrudMarkerCleanupOptions) {
  useEffect(() => {
    if (lastAddedId == null) return;
    const timer = window.setTimeout(clearLastAdded, durationMs);
    return () => window.clearTimeout(timer);
  }, [clearLastAdded, durationMs, lastAddedId]);

  useEffect(() => {
    if (lastEditedId == null) return;
    const timer = window.setTimeout(clearLastEdited, durationMs);
    return () => window.clearTimeout(timer);
  }, [clearLastEdited, durationMs, lastEditedId]);

  useEffect(() => {
    if (lastDeletedIndex == null) return;
    const timer = window.setTimeout(clearLastDeleted, durationMs);
    return () => window.clearTimeout(timer);
  }, [clearLastDeleted, durationMs, lastDeletedIndex]);
}
