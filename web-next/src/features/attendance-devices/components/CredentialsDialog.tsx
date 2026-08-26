"use client";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { UpdateCredentialsRequest } from "../types/attendanceDevices";
export function CredentialsDialog({ open, deviceId, disabled, onClose, onSubmit }: { open: boolean; deviceId: number | null; disabled: boolean; onClose: () => void; onSubmit: (id: number, values: UpdateCredentialsRequest) => void; }) {
 const [values, setValues] = useState({ password: "", commKey: "", token: "" });
 useEffect(() => { if (open) setValues({ password: "", commKey: "", token: "" }); }, [open, deviceId]);
 return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle>Update credentials</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Alert severity="info">Existing secret values are never shown. The installed ZKTeco adapter accepts a numeric Comm Key only.</Alert><TextField label="Comm key" type="password" value={values.commKey} onChange={(e) => setValues({ ...values, commKey: e.target.value })} autoComplete="new-password" /></Stack></DialogContent><DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" disabled={disabled || !deviceId || !values.commKey.trim()} onClick={() => deviceId && onSubmit(deviceId, { commKey: values.commKey.trim() })}>Save credentials</Button></DialogActions></Dialog>;
}
