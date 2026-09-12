import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HandleApiError from "@/shared/services/apiError";
import {
  canSubmitSpreadsheetImport,
  downloadSpreadsheetImportTemplate,
  isAmbiguousImportSubmissionError,
  toSpreadsheetImportError,
  validateSpreadsheetImportFile,
  type SpreadsheetImportRowStatus,
  type SpreadsheetImportViewState,
} from "@/shared/services/excelService";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import useSnackbar from "@/shared/hooks/useSnackbar";
import { useInvalidateAddressTypes } from "../../hooks/useAddressTypeQueries";
import AddressTypeService from "../../services/addressTypeService";
import getAddressTypeValidationSchema from "../../utils/validation";
import {
  ADDRESS_TYPE_IMPORT_HEADERS,
  ADDRESS_TYPE_IMPORT_MAX_BYTES,
  ADDRESS_TYPE_IMPORT_MAX_ROWS,
  ADDRESS_TYPE_IMPORT_POLICY,
  ADDRESS_TYPE_IMPORT_TEMPLATE_FILE,
  createAddressTypeImportDuplicateTracker,
  parseAddressTypeImportFile,
  registerAddressTypeImportValues,
} from "./addressTypeImport";
import type { AddressTypeImportRow } from "./types";

interface RowStatusUpdate {
  status: SpreadsheetImportRowStatus;
  errorMessage?: string;
}

export const useAddressTypeImport = () => {
  const [rows, setRows] = useState<AddressTypeImportRow[]>([]);
  const [viewState, setViewState] = useState<SpreadsheetImportViewState>("idle");
  const [viewMessage, setViewMessage] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("0s");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const permissions = useModulePermissions("AddressTypes");
  const invalidateAddressTypes = useInvalidateAddressTypes();
  const loading = viewState === "parsing" || viewState === "submitting";
  const canSubmit = canSubmitSpreadsheetImport(isReadOnly, permissions.canCreate);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const getStatusLabel = useCallback(
    (status: SpreadsheetImportRowStatus) => t(`imports.${status}`),
    [t],
  );

  const applyRowUpdates = useCallback(
    (updates: ReadonlyMap<number, RowStatusUpdate>) => {
      setRows((currentRows) =>
        currentRows.map((row) => {
          const update = updates.get(row.rowNumber);
          return update
            ? {
                ...row,
                uploadStatus: update.status,
                importStatus: getStatusLabel(update.status),
                errorMessage: update.errorMessage,
              }
            : row;
        }),
      );
    },
    [getStatusLabel],
  );

  const getFileErrorMessage = useCallback(
    (error: unknown) => {
      const importError = toSpreadsheetImportError(error);
      return t(`imports.errors.${importError.code}`, importError.details);
    },
    [t],
  );

  const validateFile = useCallback(
    (file: File): boolean => {
      const error = validateSpreadsheetImportFile(file, ADDRESS_TYPE_IMPORT_POLICY);
      if (!error) return true;
      const message = getFileErrorMessage(error);
      showSnackbar("error", [message], t("messages.error"));
      return false;
    },
    [getFileErrorMessage, showSnackbar, t],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setRows([]);
      setViewState("parsing");
      setViewMessage("");
      setLoadingText(t("imports.parsing"));
      setUploadProgress(0);

      try {
        const parsed = await parseAddressTypeImportFile(file, getStatusLabel("pending"));
        setRows(parsed);
        setViewState("preview");
        setUploadProgress(100);
        showSnackbar("success", [t("imports.fileParsed")], t("messages.success"));
      } catch (error) {
        const message = getFileErrorMessage(error);
        setViewState("failed");
        setViewMessage(message);
        showSnackbar("error", [message], t("messages.error"));
      } finally {
        setLoadingText("");
        setUploadProgress(0);
      }
    },
    [getFileErrorMessage, getStatusLabel, showSnackbar, t],
  );

  const uploadAddressTypes = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!permissions.canCreate) {
      const message = t("addressTypes.permissionDenied");
      setViewState("failed");
      setViewMessage(message);
      showSnackbar("error", [message], t("messages.error"));
      return;
    }

    const rowsToUpload = rows.filter((row) => row.uploadStatus === "pending");
    if (rowsToUpload.length === 0) return;

    setViewState("submitting");
    setViewMessage("");
    setShowCounter(true);
    startTimeRef.current = Date.now();
    setElapsedTime("0s");
    setLoadingText(t("addressTypes.import.uploading"));
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedTime(`${seconds}s`);
    }, 1000);

    const validationSchema = getAddressTypeValidationSchema(t);
    const duplicateTracker = createAddressTypeImportDuplicateTracker();
    const updates = new Map<number, RowStatusUpdate>();
    const failures: string[] = [];
    const validRows: Array<{ row: AddressTypeImportRow; request: { nameAr: string; nameEn: string } }> = [];

    try {
      rowsToUpload.forEach((row, index) => {
        const validation = validationSchema.safeParse({ nameAr: row.nameAr, nameEn: row.nameEn });
        if (!validation.success) {
          const message = validation.error.issues.map((issue) => issue.message).join(" | ");
          updates.set(row.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${row.rowNumber}: ${message}`);
        } else {
          const request = { nameAr: validation.data.nameAr, nameEn: validation.data.nameEn };
          if (registerAddressTypeImportValues(duplicateTracker, request)) {
            const message = t("addressTypes.import.duplicateInFile");
            updates.set(row.rowNumber, { status: "invalid", errorMessage: message });
            failures.push(`${t("imports.row")} ${row.rowNumber}: ${message}`);
          } else {
            validRows.push({ row, request });
            updates.set(row.rowNumber, { status: "submitted" });
          }
        }
        setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
      });

      applyRowUpdates(updates);

      if (validRows.length === 0) {
        const messages = failures.length > 0 ? failures : [t("imports.noValidRows")];
        setViewState("failed");
        setViewMessage(messages.join(" | "));
        showSnackbar("error", messages, t("messages.error"));
        return;
      }

      try {
        const result = await AddressTypeService.bulkCreate(validRows.map(({ request }) => request));
        await invalidateAddressTypes();
        applyRowUpdates(
          new Map(validRows.map(({ row }) => [row.rowNumber, { status: "uploaded" as const }])),
        );
        setViewState("succeeded");
        setUploadProgress(100);
        showSnackbar(
          "success",
          [t("addressTypes.import.importSuccess", { count: result.createdCount })],
          t("messages.success"),
        );
      } catch (error) {
        let message = t("messages.error");
        HandleApiError(error, (updatedState) => {
          message = updatedState.messages.join(" | ") || updatedState.title || message;
        });
        const uncertain = isAmbiguousImportSubmissionError(error);
        const status: SpreadsheetImportRowStatus = uncertain ? "uncertain" : "failed";
        applyRowUpdates(
          new Map(
            validRows.map(({ row }) => [
              row.rowNumber,
              { status, errorMessage: uncertain ? t("imports.submissionUncertain") : message },
            ]),
          ),
        );
        const feedback = uncertain ? t("imports.submissionUncertain") : message;
        setViewState(uncertain ? "uncertain" : "failed");
        setViewMessage(feedback);
        showSnackbar(
          uncertain ? "warning" : "error",
          [feedback],
          uncertain ? t("imports.submissionUncertainTitle") : t("messages.error"),
        );
      }

      if (failures.length > 0) showSnackbar("error", failures, t("messages.error"));
    } catch (error) {
      let message = t("messages.error");
      HandleApiError(error, (updatedState) => {
        message = updatedState.messages.join(" | ") || updatedState.title || message;
      });
      setViewState("failed");
      setViewMessage(message);
      showSnackbar("error", [message], t("messages.error"));
    } finally {
      stopTimer();
      setShowCounter(false);
      setLoadingText("");
      setUploadProgress(0);
    }
  }, [applyRowUpdates, invalidateAddressTypes, isReadOnly, notifyBlockedAction, permissions.canCreate, rows, showSnackbar, stopTimer, t]);

  const clearData = useCallback(() => {
    stopTimer();
    setRows([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setViewMessage("");
    setViewState("idle");
  }, [stopTimer]);

  const downloadTemplate = useCallback(
    () => downloadSpreadsheetImportTemplate(ADDRESS_TYPE_IMPORT_HEADERS, ADDRESS_TYPE_IMPORT_TEMPLATE_FILE),
    [],
  );

  return {
    rows,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount: rows.filter((row) => row.uploadStatus === "pending").length,
    canSubmit,
    maximumBatchSize: ADDRESS_TYPE_IMPORT_MAX_ROWS,
    maximumFileSizeMb: ADDRESS_TYPE_IMPORT_MAX_BYTES / (1024 * 1024),
    expectedHeaders: ADDRESS_TYPE_IMPORT_HEADERS.join(", "),
    handleFileSelect,
    validateFile,
    uploadAddressTypes,
    clearData,
    downloadTemplate,
    SnackbarComponent,
  };
};
