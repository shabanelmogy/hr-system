"use client";

import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { Alert, Box, Chip } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SpreadsheetImportCard,
  SpreadsheetImportFeedback,
} from "@/shared/components/file-upload";
import {
  validateSpreadsheetImportFile,
  toSpreadsheetImportError,
  downloadSpreadsheetImportTemplate,
  canSubmitSpreadsheetImport,
  isAmbiguousImportSubmissionError,
  type SpreadsheetImportViewState,
} from "@/shared/services/excelService";
import { MyDataTable, type MyDataTableColumn } from "@/shared/components/data-grid";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useOrganizationalLookup, useBulkCreateOrganizationalItems } from "../../hooks/useOrganizationalStructure";
import { getOrganizationalStructureSchema } from "../../validation/organizationalStructureSchema";
import type { OrganizationalResource } from "../../types/OrganizationalStructure";
import {
  getOrganizationalImportHeaders,
  getOrganizationalImportPolicy,
  getOrganizationalImportTemplateFile,
  getOrganizationalParentResource,
  parseOrganizationalImportFile,
  toOrganizationalImportRequest,
  ORGANIZATIONAL_IMPORT_MAX_BYTES,
  ORGANIZATIONAL_IMPORT_MAX_ROWS,
  type OrganizationalImportRow,
} from "./import-utils";

interface Props { resource: OrganizationalResource; }

export default function OrganizationalStructureImport({ resource }: Props) {
  const { t } = useTranslation();
  const { isReadOnly } = useAppReadOnly();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(permissions.CreateOrganizationalStructure);
  const parentResource = getOrganizationalParentResource(resource);
  const parentLookup = useOrganizationalLookup(parentResource ?? "branches", undefined, Boolean(parentResource));
  const jobTitleLookup = useOrganizationalLookup("job-titles", undefined, resource === "positions");
  const jobLevelLookup = useOrganizationalLookup("job-levels", undefined, resource === "positions");
  const bulkMutation = useBulkCreateOrganizationalItems();
  const headers = getOrganizationalImportHeaders(resource);
  const policy = getOrganizationalImportPolicy(resource);
  const [rows, setRows] = useState<OrganizationalImportRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewState, setViewState] = useState<SpreadsheetImportViewState>("idle");
  const [viewMessage, setViewMessage] = useState("");

  const updateRows = useCallback((updates: ReadonlyMap<number, Partial<OrganizationalImportRow>>) => {
    setRows((current) => current.map((row) => {
      const update = updates.get(row.rowNumber);
      return update ? { ...row, ...update } : row;
    }));
  }, []);
  const validateFile = useCallback((file: File) => {
    const error = validateSpreadsheetImportFile(file, policy);
    if (!error) return true;
    setViewState("failed");
    setViewMessage(t(`imports.errors.${error.code}`, error.details));
    return false;
  }, [policy, t]);
  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file); setViewState("parsing"); setViewMessage("");
    try {
      setRows(await parseOrganizationalImportFile(file, resource));
      setViewState("preview");
    } catch (error) {
      const parsed = toSpreadsheetImportError(error);
      setViewState("failed"); setViewMessage(t(`imports.errors.${parsed.code}`, parsed.details));
    }
  }, [resource, t, validateFile]);
  const submit = useCallback(async () => {
    if (!canSubmitSpreadsheetImport(isReadOnly, canCreate)) return;
    const updates = new Map<number, Partial<OrganizationalImportRow>>();
    const submittedRows = new Set<number>();
    const failures: string[] = [];
    const requests = rows.flatMap((row) => {
      const request = toOrganizationalImportRequest(resource, row, parentLookup.data ?? [], jobTitleLookup.data ?? [], jobLevelLookup.data ?? []);
      const validation = request ? getOrganizationalStructureSchema(resource, t).safeParse(request) : { success: false as const, error: { issues: [{ message: t("organizationalStructure.import.parentNotFound") }] } };
      if (!validation.success) {
        const message = validation.error.issues.map((issue) => issue.message).join(" | ");
        updates.set(row.rowNumber, { status: "invalid", errorMessage: message }); failures.push(`${t("imports.row")} ${row.rowNumber}: ${message}`); return [];
      }
      updates.set(row.rowNumber, { status: "pending", errorMessage: undefined });
      submittedRows.add(row.rowNumber);
      return [validation.data];
    });
    updateRows(updates);
    if (!requests.length) { setViewState("failed"); setViewMessage(failures.join(" | ") || t("imports.noValidRows")); return; }
    setViewState("submitting"); setViewMessage("");
    try {
      const result = await bulkMutation.mutateAsync({ resource, requests });
      updateRows(new Map(rows.filter((row) => submittedRows.has(row.rowNumber)).map((row) => [row.rowNumber, { status: "uploaded" as const }])));
      setViewState("succeeded"); setViewMessage(t("organizationalStructure.import.success", { count: result.createdCount }));
    } catch (error) {
      const uncertain = isAmbiguousImportSubmissionError(error);
      const message = uncertain ? t("imports.submissionUncertain") : extractErrorMessage(error) || t("messages.error");
      updateRows(new Map(rows.filter((row) => submittedRows.has(row.rowNumber)).map((row) => [row.rowNumber, { status: uncertain ? "uncertain" as const : "failed" as const, errorMessage: message }])));
      setViewState(uncertain ? "uncertain" : "failed"); setViewMessage(message);
    }
  }, [bulkMutation, canCreate, isReadOnly, jobLevelLookup.data, jobTitleLookup.data, parentLookup.data, resource, rows, t, updateRows]);
  const clear = () => { setRows([]); setSelectedFile(null); setViewState("idle"); setViewMessage(""); };
  const columns = useMemo<MyDataTableColumn<OrganizationalImportRow>[]>(() => [
    { field: "rowNumber", headerName: t("imports.row") },
    { field: "code", headerName: t("organizationalStructure.fields.code") },
    { field: "nameEn", headerName: t("organizationalStructure.fields.nameEn") },
    { field: "nameAr", headerName: t("organizationalStructure.fields.nameAr") },
    { field: "status", headerName: t("imports.status"), type: "custom", renderCell: (value) => <Chip size="small" label={t(`imports.${String(value)}`)} color={value === "uploaded" ? "success" : value === "invalid" || value === "failed" ? "error" : "default"} /> },
    { field: "errorMessage", headerName: t("imports.errorDetails"), renderCell: (value) => String(value ?? "—") },
  ], [t]);
  const uploadableCount = rows.filter((row) => row.status === "pending").length;
  return <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
    {parentResource && (parentLookup.isError || parentLookup.isLoading) ? <Alert severity={parentLookup.isError ? "error" : "info"}>{parentLookup.isError ? t("organizationalStructure.import.lookupError") : t("organizationalStructure.import.lookupLoading")}</Alert> : null}
    <SpreadsheetImportCard selectedFile={selectedFile} busy={viewState === "parsing" || viewState === "submitting"} progress={viewState === "submitting" ? 50 : 0} maxSizeMb={ORGANIZATIONAL_IMPORT_MAX_BYTES / (1024 * 1024)} maxRows={ORGANIZATIONAL_IMPORT_MAX_ROWS} rowCount={rows.length} rowCountLabel={t("organizationalStructure.import.rows", { count: rows.length })} hint={t("imports.expectedHeaders", { headers: headers.join(", ") })} icon={<UploadFileOutlined />} uploadableCount={uploadableCount} canSubmit={canCreate && !isReadOnly} onFileSelect={(file) => void handleFileSelect(file)} validateFile={validateFile} onSubmit={() => void submit()} onClear={clear} onDownloadTemplate={() => downloadSpreadsheetImportTemplate(headers, getOrganizationalImportTemplateFile(resource))} />
    <SpreadsheetImportFeedback viewState={viewState} message={viewMessage} />
    {rows.length ? <MyDataTable data={rows} columns={columns} countLabel={t("organizationalStructure.import.rows", { count: rows.length })} getRowId={(row) => row.rowNumber} /> : null}
  </Box>;
}
