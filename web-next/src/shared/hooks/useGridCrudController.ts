import { useCallback, useState } from "react";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

export type CrudDialogType = "add" | "edit" | "view" | "delete" | null;
export type CrudItemId = string | number;

type IdentifiedItem = { id: CrudItemId };

type UseGridCrudControllerOptions<TItem extends IdentifiedItem, TForm> = {
  items: TItem[];
  create: (form: TForm) => Promise<TItem>;
  update: (id: CrudItemId, form: TForm) => Promise<TItem>;
  remove: (id: CrudItemId) => Promise<unknown>;
  refresh: () => void | Promise<unknown>;
};

export function useGridCrudController<TItem extends IdentifiedItem, TForm>({
  items,
  create,
  update,
  remove,
  refresh,
}: UseGridCrudControllerOptions<TItem, TForm>) {
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const [dialogType, setDialogType] = useState<CrudDialogType>(null);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);
  const [lastAddedId, setLastAddedId] = useState<CrudItemId | null>(null);
  const [lastEditedId, setLastEditedId] = useState<CrudItemId | null>(null);
  const [lastDeletedIndex, setLastDeletedIndex] = useState<number | null>(null);

  const openDialog = useCallback((type: CrudDialogType, item: TItem | null = null) => {
    setDialogType(type);
    setSelectedItem(item);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedItem(null);
  }, []);

  const handleFormSubmit = useCallback(async (form: TForm) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (dialogType === "add") {
      const created = await create(form);
      setLastAddedId(created.id);
      closeDialog();
      return;
    }

    if (dialogType === "edit" && selectedItem) {
      const updated = await update(selectedItem.id, form);
      setLastEditedId(updated.id);
      closeDialog();
    }
  }, [closeDialog, create, dialogType, isReadOnly, notifyBlockedAction, selectedItem, update]);

  const handleDelete = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!selectedItem) return;
    const deletedIndex = items.findIndex(
      (item) => String(item.id) === String(selectedItem.id),
    );

    try {
      await remove(selectedItem.id);
      setLastDeletedIndex(deletedIndex);
      closeDialog();
    } catch {
      // Feature mutation callbacks own user-facing API errors.
    }
  }, [closeDialog, isReadOnly, items, notifyBlockedAction, remove, selectedItem]);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);
  const onAdd = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else openDialog("add");
  }, [isReadOnly, notifyBlockedAction, openDialog]);
  const onDelete = useCallback((item: TItem) => {
    if (isReadOnly) notifyBlockedAction();
    else openDialog("delete", item);
  }, [isReadOnly, notifyBlockedAction, openDialog]);
  const onEdit = useCallback((item: TItem) => {
    if (isReadOnly) notifyBlockedAction();
    else openDialog("edit", item);
  }, [isReadOnly, notifyBlockedAction, openDialog]);
  const onView = useCallback((item: TItem) => openDialog("view", item), [openDialog]);
  const clearLastAdded = useCallback(() => setLastAddedId(null), []);
  const clearLastEdited = useCallback(() => setLastEditedId(null), []);
  const clearLastDeleted = useCallback(() => setLastDeletedIndex(null), []);

  return {
    closeDialog,
    dialogType,
    handleDelete,
    handleFormSubmit,
    handleRefresh,
    lastAddedId,
    lastDeletedIndex,
    lastEditedId,
    onAdd,
    onDelete,
    onEdit,
    onView,
    openDialog,
    selectedItem,
    clearLastAdded,
    clearLastEdited,
    clearLastDeleted,
  };
}
