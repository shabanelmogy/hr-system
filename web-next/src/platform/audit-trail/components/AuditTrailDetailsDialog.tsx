"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuditTrailEntry } from "../hooks/useAuditTrail";
import type { AuditTrailItem } from "../types/auditTrail";
import { AuditActionChip } from "./AuditActionChip";
import { entityLabel, fieldLabel, formatAuditDate, moduleLabel } from "./auditTrailFormat";

interface AuditTrailDetailsDialogProps {
  item: AuditTrailItem | null;
  onClose: () => void;
}

/** Field-by-field before/after view of one audit-trail action. */
export function AuditTrailDetailsDialog({ item, onClose }: AuditTrailDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const query = useAuditTrailEntry(item?.moduleCode ?? null, item?.id ?? null);
  const changes = query.data?.changes ?? [];
  const empty = t("auditLog.empty");

  return (
    <Dialog open={Boolean(item)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        {item ? <AuditActionChip action={item.action} /> : null}
        <span>
          {item ? entityLabel(t, item.entityName) : ""}
          {item?.entityDisplay ? ` — ${item.entityDisplay}` : ""}
        </span>
      </DialogTitle>
      <DialogContent dividers>
        {item ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, mb: 2 }}>
            <Info label={t("auditLog.module")} value={moduleLabel(t, item.moduleCode)} />
            <Info label={t("auditLog.recordKey")} value={`#${item.entityKey}`} />
            <Info label={t("auditLog.user")} value={item.userName ?? item.userId ?? t("auditLog.system")} />
            <Info label={t("auditLog.when")} value={formatAuditDate(item.occurredOn, language)} />
          </Box>
        ) : null}

        {query.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress aria-label={t("auditLog.loading")} />
          </Box>
        ) : query.error ? (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => void query.refetch()}>{t("auditLog.retry")}</Button>}
          >
            {t("auditLog.loadError")}
          </Alert>
        ) : changes.length === 0 ? (
          <Typography color="text.secondary">{t("auditLog.noFieldChanges")}</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("auditLog.field")}</TableCell>
                  <TableCell>{t("auditLog.oldValue")}</TableCell>
                  <TableCell>{t("auditLog.newValue")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map((change) => (
                  <TableRow key={change.field}>
                    <TableCell sx={{ fontWeight: 600 }}>{fieldLabel(t, change.field)}</TableCell>
                    <TableCell sx={{ color: "error.main", wordBreak: "break-word" }}>{change.oldValue ?? empty}</TableCell>
                    <TableCell sx={{ color: "success.main", wordBreak: "break-word" }}>{change.newValue ?? empty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("auditLog.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{value}</Typography>
    </Box>
  );
}
