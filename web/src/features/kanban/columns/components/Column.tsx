import { KanbanCard, KanbanColumn } from "@/features/kanban";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Add, Archive, Delete, Edit, MoreVert } from "@mui/icons-material";
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import { useState } from "react";

interface ColumnProps {
    column: KanbanColumn;
    cards: KanbanCard[];
    onAddCard: (columnId: string | number) => void;
    onEditCard: (card: KanbanCard) => void;
    onEditColumn: (column: KanbanColumn) => void;
    onDeleteColumn: (columnId: string | number) => void;
    onArchiveColumn: (columnId: string | number) => void;
}

export default function Column({
    column,
    cards,
    onAddCard,
    onEditCard,
    onEditColumn,
    onDeleteColumn,
    onArchiveColumn,
}: ColumnProps) {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEditColumn(column);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDeleteColumn(column.id);
    };

    const handleArchive = () => {
        handleMenuClose();
        onArchiveColumn(column.id);
    };

    return (
        <Paper sx={{ minWidth: 320, p: 2, bgcolor: "background.paper" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">{column.name}</Typography>
                <Stack direction="row">
                    <IconButton size="small" onClick={() => onAddCard(column.id)}>
                        <Add fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreVert fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Droppable droppableId={`column-${column.id}`}>
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: 100 }}
                    >
                        <Stack spacing={1}>
                            {cards.map((card, index) => (
                                <Draggable key={String(card.id)} draggableId={`card-${card.id}`} index={index}>
                                    {(provided) => (
                                        <Paper
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            variant="outlined"
                                            sx={{ p: 1.5, cursor: "pointer", minHeight: 60 }}
                                            onClick={() => onEditCard(card)}
                                        >
                                            <Typography variant="subtitle2" noWrap>
                                                {card.title}
                                            </Typography>
                                            {card.description && (
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                                                    {card.description}
                                                </Typography>
                                            )}
                                        </Paper>
                                    )}
                                </Draggable>
                            ))}
                        </Stack>
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem onClick={handleEdit}>
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Rename
                </MenuItem>
                <MenuItem onClick={handleArchive}>
                    <Archive fontSize="small" sx={{ mr: 1 }} />
                    Archive
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Paper>
    );
}