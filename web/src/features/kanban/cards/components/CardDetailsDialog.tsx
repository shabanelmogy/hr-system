import { KanbanCard } from "@/features/kanban";
import { Close, Delete } from "@mui/icons-material";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import { useMemo, useState } from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`card-tabpanel-${index}`}
            aria-labelledby={`card-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

interface CardDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    card: KanbanCard | null;
    onSave: (card: Partial<KanbanCard>) => void;
    onDelete: (cardId: string | number) => void;
}

export default function CardDetailsDialog({
    open,
    onClose,
    card,
    onSave,
    onDelete,
}: CardDetailsDialogProps) {
    const [tabValue, setTabValue] = useState(0);
    const [title, setTitle] = useState(card?.title || "");
    const [description, setDescription] = useState(card?.description || "");
    const [isArchived, setIsArchived] = useState(card?.isArchived || false);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSave = () => {
        if (card) {
            onSave({
                id: card.id,
                title: title.trim(),
                description: description.trim(),
                isArchived,
            });
        }
    };

    const handleDelete = () => {
        if (card) {
            onDelete(card.id);
            onClose();
        }
    };

    const canSave = useMemo(() => {
        const t = title.trim();
        return t.length >= 3 && t.length <= 200;
    }, [title]);

    if (!card) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Card Details</Typography>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="card tabs">
                        <Tab label="Details" />
                        <Tab label="Comments" />
                        <Tab label="Attachments" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Stack spacing={2}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isArchived}
                                    onChange={(e) => setIsArchived(e.target.checked)}
                                />
                            }
                            label="Archived"
                        />
                        {/* Add labels picker, assignees picker, due date */}
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography>Comments section - TODO</Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography>Attachments section - TODO</Typography>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="error" startIcon={<Delete />}>
                    Delete
                </Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={!canSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}