"use client";

import {
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
import { auditTrailItemKey, type AuditTrailItem } from "../types/auditTrail";
import { AuditActionChip } from "./AuditActionChip";
import { entityLabel, formatAuditDate, moduleLabel } from "./auditTrailFormat";

interface AuditTrailTableProps {
  items: AuditTrailItem[];
  onSelect: (item: AuditTrailItem) => void;
  showRecord?: boolean;
}

/** One row per action; clicking a row opens its field-by-field details. */
export function AuditTrailTable({ items, onSelect, showRecord = true }: AuditTrailTableProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language ?? "en";

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label={t("auditLog.title")}>
        <TableHead>
          <TableRow>
            <TableCell>{t("auditLog.when")}</TableCell>
            <TableCell>{t("auditLog.action")}</TableCell>
            {showRecord ? <TableCell>{t("auditLog.record")}</TableCell> : null}
            {showRecord ? <TableCell>{t("auditLog.module")}</TableCell> : null}
            <TableCell>{t("auditLog.user")}</TableCell>
            <TableCell align="center">{t("auditLog.changes")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              hover
              key={auditTrailItemKey(item)}
              onClick={() => onSelect(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(item);
                }
              }}
              role="button"
              tabIndex={0}
              sx={{ cursor: "pointer" }}
            >
              <TableCell sx={{ whiteSpace: "nowrap" }}>{formatAuditDate(item.occurredOn, language)}</TableCell>
              <TableCell><AuditActionChip action={item.action} /></TableCell>
              {showRecord ? (
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {entityLabel(t, item.entityName)}
                    {item.entityDisplay ? ` — ${item.entityDisplay}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">#{item.entityKey}</Typography>
                </TableCell>
              ) : null}
              {showRecord ? <TableCell>{moduleLabel(t, item.moduleCode)}</TableCell> : null}
              <TableCell>{item.userName ?? item.userId ?? t("auditLog.system")}</TableCell>
              <TableCell align="center">{item.changeCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
