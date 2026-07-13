import { useBoard, useCards, useColumns, useCreateCard, useCreateColumn, useDeleteCard, useUpdateCard, type KanbanCard, type KanbanColumn } from "@/features/kanban";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Add, Label, People } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CardDetailsDialog from "../cards/components/CardDetailsDialog";
import CreateCardDialog from "../cards/components/CreateCardDialog";
import Column from "../columns/components/Column";
import CreateColumnDialog from "../columns/components/CreateColumnDialog";
import { columnKeys } from "../columns/hooks/useColumnQueries";

export default function BoardViewPage() {
  const { id } = useParams();
  const boardId = id as string | number | undefined;
  const queryClient = useQueryClient();
  const { data: board, isLoading: boardLoading } = useBoard(boardId);
  const { data: columns = [], isLoading: colsLoading, refetch: refetchColumns } = useColumns();
  const { data: cards = [], isLoading: cardsLoading } = useCards();
  const updateCard = useUpdateCard();
  const createCard = useCreateCard();
  const deleteCard = useDeleteCard();
  const createColumn = useCreateColumn();

  const [dialogCard, setDialogCard] = useState<KanbanCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createCardDialog, setCreateCardDialog] = useState<{ open: boolean; columnId: string | number | null; columnName: string }>({ open: false, columnId: null, columnName: "" });
  const [createColumnDialog, setCreateColumnDialog] = useState(false);

  const boardColumns = useMemo(() => columns.filter(c => String(c.kanbanBoardId) === String(boardId) && !c.isDeleted && !c.isArchived).sort((a, b) => a.order - b.order), [columns, boardId]);
  const groupedCards = useMemo(() => {
    const map = new Map<string | number, KanbanCard[]>();
    cards.filter(c => !c.isDeleted && !c.isArchived).forEach(c => {
      const arr = map.get(c.kanbanColumnId) ?? [];
      arr.push(c);
      map.set(c.kanbanColumnId, arr);
    });
    for (const [, arr] of map) arr.sort((a, b) => a.order - b.order);
    return map;
  }, [cards]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceColId = source.droppableId.replace("column-", "");
    const destColId = destination.droppableId.replace("column-", "");
    const cardId = draggableId.replace("card-", "");

    if (sourceColId === destColId && source.index === destination.index) return;

    // Optimistic update: reorder cards
    const sourceCards = groupedCards.get(Number(sourceColId)) || [];
    const destCards = sourceColId === destColId ? sourceCards : groupedCards.get(Number(destColId)) || [];

    const [movedCard] = sourceCards.splice(source.index, 1);
    if (sourceColId === destColId) {
      sourceCards.splice(destination.index, 0, movedCard);
      // Update orders
      sourceCards.forEach((c, i) => {
        updateCard.mutate({ id: c.id, order: i });
      });
    } else {
      movedCard.kanbanColumnId = Number(destColId);
      destCards.splice(destination.index, 0, movedCard);
      // Update orders for both columns
      sourceCards.forEach((c, i) => {
        updateCard.mutate({ id: c.id, order: i });
      });
      destCards.forEach((c, i) => {
        updateCard.mutate({ id: c.id, order: i });
      });
    }
  };

  const handleAddCard = (columnId: string | number) => {
    const column = boardColumns.find(c => c.id === columnId);
    setCreateCardDialog({ open: true, columnId, columnName: column?.name || "" });
  };

  const handleCreateCard = async (data: { title: string; description?: string }) => {
    if (createCardDialog.columnId) {
      const maxOrder = (groupedCards.get(createCardDialog.columnId) || []).length;
      await createCard.mutateAsync({
        title: data.title,
        description: data.description,
        kanbanColumnId: createCardDialog.columnId,
        order: maxOrder,
      });
    }
  };

  const handleCreateColumn = async (data: { name: string }) => {
    if (boardId) {
      const maxOrder = boardColumns.length;
      const tempId = `temp-${Date.now()}`;
      const optimisticColumn: KanbanColumn = {
        id: tempId,
        kanbanBoardId: boardId,
        name: data.name,
        order: maxOrder,
        isArchived: false,
        isDeleted: false,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
      };

      // Optimistically add to local state
      queryClient.setQueryData(columnKeys.list(), (old: KanbanColumn[] | undefined) => [
        ...(old || []),
        optimisticColumn,
      ]);

      try {
        await createColumn.mutateAsync({
          name: data.name,
          kanbanBoardId: boardId,
          order: maxOrder,
        }, {
          onSuccess: () => {
            // Don't invalidate, keep the optimistic column
          }
        });
        // Keep the optimistic column
      } catch (error) {
        // Remove optimistic column on error
        queryClient.setQueryData(columnKeys.list(), (old: KanbanColumn[] | undefined) =>
          (old || []).filter(c => c.id !== tempId)
        );
      }
    }
  };

  const handleEditCard = (card: KanbanCard) => {
    setDialogCard(card);
    setDialogOpen(true);
  };

  const handleSaveCard = (updatedCard: Partial<KanbanCard>) => {
    updateCard.mutate(updatedCard as any);
    setDialogOpen(false);
  };

  const handleDeleteCard = async (cardId: string | number) => {
    await deleteCard.mutateAsync(cardId);
  };

  const handleEditColumn = (column: KanbanColumn) => {
    // TODO: Edit column
    console.log("Edit column", column);
  };

  const handleDeleteColumn = (columnId: string | number) => {
    // TODO: Delete column
    console.log("Delete column", columnId);
  };

  const handleArchiveColumn = (columnId: string | number) => {
    // TODO: Archive column
    console.log("Archive column", columnId);
  };

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">
          {boardLoading ? <Skeleton width={240} /> : board?.name || "Board"}
        </Typography>
        <Stack direction="row">
          <IconButton color="primary">
            <Label />
          </IconButton>
          <IconButton color="primary">
            <People />
          </IconButton>
          <IconButton color="primary" onClick={() => setCreateColumnDialog(true)}>
            <Add />
          </IconButton>
        </Stack>
      </Stack>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
          {(colsLoading || cardsLoading) && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ minWidth: 320, p: 2 }}>
                  <Skeleton variant="text" width={200} />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 2 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                </Box>
              ))}
            </>
          )}

          {!colsLoading && boardColumns.map((col: KanbanColumn) => (
            <Column
              key={String(col.id)}
              column={col}
              cards={groupedCards.get(col.id) ?? []}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
              onArchiveColumn={handleArchiveColumn}
            />
          ))}
        </Box>
      </DragDropContext>

      <CardDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        card={dialogCard}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <CreateCardDialog
        open={createCardDialog.open}
        onClose={() => setCreateCardDialog({ open: false, columnId: null, columnName: "" })}
        onSubmit={handleCreateCard}
        columnName={createCardDialog.columnName}
      />

      <CreateColumnDialog
        open={createColumnDialog}
        onClose={() => setCreateColumnDialog(false)}
        onSubmit={handleCreateColumn}
        boardName={board?.name || ""}
      />
    </Box>
  );
}
