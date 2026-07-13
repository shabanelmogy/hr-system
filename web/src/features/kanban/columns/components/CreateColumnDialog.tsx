import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { useMemo, useState } from "react";

interface CreateColumnDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => void;
    boardName: string;
}

export default function CreateColumnDialog({
    open,
    onClose,
    onSubmit,
    boardName,
}: CreateColumnDialogProps) {
    const [name, setName] = useState("");

    const canSubmit = useMemo(() => {
        const n = name.trim();
        return n.length >= 3 && n.length <= 100;
    }, [name]);

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            name: name.trim(),
        });
        setName("");
        onClose();
    };

    const handleClose = () => {
        setName("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Column to {boardName}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Column Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    autoFocus
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
                    Add Column
                </Button>
            </DialogActions>
        </Dialog>
    );
}