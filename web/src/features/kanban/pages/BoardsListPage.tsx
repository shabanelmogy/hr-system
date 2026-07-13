import {
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard,
  type KanbanBoard,
} from "@/features/kanban";
import { Add, Archive, DeleteOutlined, Edit, OpenInNew } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Basic validation helpers per guide
const isValidHex = (value: string) => /^#?[0-9A-Fa-f]{6}$/.test(value.trim());
const clampText = (v: string, max: number) => (v.length > max ? v.slice(0, max) : v);

function BoardDialog({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<KanbanBoard> | null;
  onSubmit: (values: { name: string; description?: string; backgroundColor?: string | null; id?: string | number; isArchived?: boolean }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [backgroundColor, setBackgroundColor] = useState<string>(initial?.backgroundColor ?? "");

  const canSubmit = useMemo(() => {
    const n = name.trim();
    if (n.length < 3 || n.length > 100) return false;
    const d = description.trim();
    if (d && d.length < 3) return false;
    if (d.length > 500) return false;
    if (backgroundColor && !isValidHex(backgroundColor)) return false;
    return true;
  }, [name, description, backgroundColor]);

  const submit = () => {
    if (!canSubmit) return;
    const bg = backgroundColor?.trim() || undefined;
    const normalized = bg ? (bg.startsWith("#") ? bg : `#${bg}`) : undefined;
    onSubmit({
      id: initial?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundColor: normalized,
      isArchived: initial?.isArchived,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial?.id ? "Edit Board" : "Create Board"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(clampText(e.target.value, 100))}
            required
            helperText="3..100 characters"
            autoFocus
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(clampText(e.target.value, 500))}
            helperText="Optional, 3..500 characters"
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Background Color"
            placeholder="#RRGGBB"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(clampText(e.target.value, 7))}
            helperText="Optional hex color (e.g., #1976d2)"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={!canSubmit}>
          {initial?.id ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function BoardsListPage() {
  const navigate = useNavigate();
  const { data: boards = [], isLoading } = useBoards();
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const deleteBoard = useDeleteBoard();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<KanbanBoard> | null>(null);
  const [search, setSearch] = useState("");
  const [filterArchived, setFilterArchived] = useState<"all" | "active" | "archived">("active");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return boards
      .filter((x) => !x.isDeleted)
      .filter((x) => {
        if (filterArchived === "active") return !x.isArchived;
        if (filterArchived === "archived") return x.isArchived;
        return true;
      })
      .filter((x) => {
        if (!term) return true;
        return (
          x.name?.toLowerCase().includes(term) ||
          x.description?.toLowerCase().includes(term)
        );
      });
  }, [boards, search, filterArchived]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (b: KanbanBoard) => {
    setEditing(b);
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const handleSubmit = async (values: { id?: string | number; name: string; description?: string; backgroundColor?: string | null; isArchived?: boolean }) => {
    if (values.id) {
      await updateBoard.mutateAsync({
        id: values.id,
        name: values.name,
        description: values.description,
        backgroundColor: values.backgroundColor ?? null,
        isArchived: values.isArchived ?? false,
      } as any);
    } else {
      await createBoard.mutateAsync({
        name: values.name,
        description: values.description,
        backgroundColor: values.backgroundColor ?? null,
      } as any);
    }
    setDialogOpen(false);
  };

  const handleToggleArchive = async (b: KanbanBoard) => {
    await updateBoard.mutateAsync({ id: b.id, name: b.name, description: b.description, backgroundColor: b.backgroundColor ?? null, isArchived: !b.isArchived } as any);
  };

  const handleDelete = async (b: KanbanBoard) => {
    // Soft delete assumed on backend delete
    await deleteBoard.mutateAsync(b.id);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Kanban Boards</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterArchived}
            onChange={(_, v) => v && setFilterArchived(v)}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="archived">Archived</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}>
            New Board
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((b) => (
            <Grid key={String(b.id)} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardHeader
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" noWrap>
                        {b.name}
                      </Typography>
                      {b.isArchived && <Chip size="small" label="Archived" color="default" />}
                    </Stack>
                  }
                  sx={{ bgcolor: b.backgroundColor || "transparent" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {b.description || ""}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Open Board">
                      <IconButton color="primary" onClick={() => navigate(`/kanban/board/${b.id}`)}>
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(b)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={b.isArchived ? "Unarchive" : "Archive"}>
                      <IconButton onClick={() => handleToggleArchive(b)}>
                        <Archive />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(b)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit dialog */}
      <BoardDialog
        open={dialogOpen}
        onClose={closeDialog}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
