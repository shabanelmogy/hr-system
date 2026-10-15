"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuditTrailList } from "../hooks/useAuditTrail";
import type { AuditTrailItem, AuditTrailQuery } from "../types/auditTrail";
import { AuditTrailDetailsDialog } from "./AuditTrailDetailsDialog";
import { AuditTrailTable } from "./AuditTrailTable";

export interface RecordHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  /** Module code as registered in the API, e.g. "hr" or "reference-data". */
  moduleCode: string;
  /** CLR entity name, e.g. "Department". */
  entityName: string;
  entityKey: string | number;
  title?: string;
}

/** Every action recorded for one record, newest first; click a row for details. */
export function RecordHistoryDialog({
  open,
  onClose,
  moduleCode,
  entityName,
  entityKey,
  title,
}: RecordHistoryDialogProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<AuditTrailItem | null>(null);
  const query = useMemo<AuditTrailQuery>(
    () => ({ moduleCode, entityName, entityKey: String(entityKey), pageSize: 25 }),
    [moduleCode, entityName, entityKey],
  );
  const list = useAuditTrailList(query, open);
  const items = list.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title ?? t("auditLog.recordHistory")}</DialogTitle>
        <DialogContent dividers>
          {list.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress aria-label={t("auditLog.loading")} />
            </Box>
          ) : list.error ? (
            <Alert
              severity="error"
              action={<Button color="inherit" size="small" onClick={() => void list.refetch()}>{t("auditLog.retry")}</Button>}
            >
              {t("auditLog.loadError")}
            </Alert>
          ) : items.length === 0 ? (
            <Typography color="text.secondary">{t("auditLog.noEntries")}</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <AuditTrailTable items={items} onSelect={setSelected} showRecord={false} />
              {list.hasNextPage ? (
                <Button
                  disabled={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                  sx={{ justifySelf: "center" }}
                >
                  {t("auditLog.loadMore")}
                </Button>
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("auditLog.close")}</Button>
        </DialogActions>
      </Dialog>
      <AuditTrailDetailsDialog item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
