import { FileUpload, Save } from "@mui/icons-material";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { canUseCrystalReportFile } from "./files";
import type { CreateCrystalReportRequest } from "./types";

interface Props {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (request: CreateCrystalReportRequest) => Promise<void>;
}

export function CrystalReportCreateDialog({ open, busy, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [entityKey, setEntityKey] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const invalid = file !== null && !canUseCrystalReportFile(file);

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("crystalReports.create")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            required
            label={t("crystalReports.entityKey")}
            value={entityKey}
            onChange={(event) => setEntityKey(event.target.value)}
            helperText={t("crystalReports.entityKeyHint")}
          />
          <TextField
            label={t("crystalReports.description")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={2}
          />
          <Button component="label" variant="outlined" startIcon={<FileUpload />}>
            {file?.name ?? t("crystalReports.selectFile")}
            <input
              hidden
              type="file"
              accept=".rpt,application/octet-stream"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </Button>
          {invalid && <Alert severity="error">{t("crystalReports.fileHint")}</Alert>}
          <Typography variant="caption" color="text.secondary">
            {t("crystalReports.summaryInfoHint")}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>{t("actions.cancel")}</Button>
        <Button
          variant="contained"
          startIcon={busy ? <CircularProgress size={16} /> : <Save />}
          disabled={busy || !entityKey.trim() || !canUseCrystalReportFile(file)}
          onClick={() => file && void onSubmit({
            entityKey: entityKey.trim(),
            description: description.trim() || undefined,
            file,
          })}
        >
          {t("actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
