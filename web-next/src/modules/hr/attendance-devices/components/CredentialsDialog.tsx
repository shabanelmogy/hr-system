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
import { useTranslation } from "react-i18next";
import type { UpdateCredentialsRequest } from "../types/attendanceDevices";

type CredentialsFormProps = {
  deviceId: number | null;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (id: number, values: UpdateCredentialsRequest) => void;
};

const CredentialsForm = ({ deviceId, disabled, onClose, onSubmit }: CredentialsFormProps) => {
  const [commKey, setCommKey] = useState("");
  const { t } = useTranslation();

  return (
    <>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">
            {t("attendanceDevices.credentialsDescription")}
          </Alert>
          <TextField
            label={t("attendanceDevices.commKey")}
            type="password"
            value={commKey}
            onChange={(event) => setCommKey(event.target.value)}
            autoComplete="new-password"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("actions.cancel")}</Button>
        <Button
          variant="contained"
          disabled={disabled || !deviceId || !commKey.trim()}
          onClick={() => deviceId && onSubmit(deviceId, { commKey: commKey.trim() })}
        >
          {t("attendanceDevices.saveCredentials")}
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("attendanceDevices.updateCredentials")}</DialogTitle>
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
