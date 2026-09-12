"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import type { UpdateCredentialsRequest } from "../types/attendanceDevices";

type CredentialsFormProps = {
  deviceId: number | null;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (id: number, values: UpdateCredentialsRequest) => void;
};

const CredentialsForm = ({ deviceId, disabled, onClose, onSubmit }: CredentialsFormProps) => {
  const [commKey, setCommKey] = useState("");

  return (
    <>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">
            Existing secret values are never shown. The installed ZKTeco adapter accepts a numeric Comm Key only.
          </Alert>
          <TextField
            label="Comm key"
            type="password"
            value={commKey}
            onChange={(event) => setCommKey(event.target.value)}
            autoComplete="new-password"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={disabled || !deviceId || !commKey.trim()}
          onClick={() => deviceId && onSubmit(deviceId, { commKey: commKey.trim() })}
        >
          Save credentials
        </Button>
      </DialogActions>
    </>
  );
};

export function CredentialsDialog({
  open,
  deviceId,
  disabled,
  onClose,
  onSubmit,
}: {
  open: boolean;
  deviceId: number | null;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (id: number, values: UpdateCredentialsRequest) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update credentials</DialogTitle>
      {open ? (
        <CredentialsForm
          key={deviceId ?? "new"}
          deviceId={deviceId}
          disabled={disabled}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
