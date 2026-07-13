import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
import { useMemo, useState } from "react";

interface CreateCardDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description?: string }) => void;
    columnName: string;
}

export default function CreateCardDialog({
    open,
    onClose,
    onSubmit,
    columnName,
}: CreateCardDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const canSubmit = useMemo(() => {
        const t = title.trim();
        return t.length >= 3 && t.length <= 200;
    }, [title]);

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
        });
        setTitle("");
        setDescription("");
        onClose();
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Card to {columnName}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
                    Add Card
                </Button>
            </DialogActions>
        </Dialog>
    );
}