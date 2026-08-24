import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCountryLookup } from "../../../countries";
import usePermissions from "@/shared/hooks/usePermissions";
import HandleApiError from "@/shared/services/apiError";
import {
  downloadSpreadsheetImportTemplate,
  isAmbiguousImportSubmissionError,
  toSpreadsheetImportError,
  validateSpreadsheetImportFile,
  type SpreadsheetImportRowStatus,
  type SpreadsheetImportViewState,
} from "@/shared/services/excelService";
import useSnackbar from "@/shared/hooks/useSnackbar";
import { getStateValidationSchema } from "../../utils/validation";
import StateService from "../../services/stateService";
import { useInvalidateStates } from "../../hooks/useStateQueries";
import type { CreateStateRequest } from "../../types/State";
import type { ImportState } from "./types";
import {
  createStateImportDuplicateTracker,
  registerStateImportValues,
} from "./stateImportDuplicates";
import {
  STATE_IMPORT_HEADERS,
  STATE_IMPORT_MAX_BYTES,
  STATE_IMPORT_MAX_ROWS,
  STATE_IMPORT_POLICY,
  STATE_IMPORT_TEMPLATE_FILE,
  createCountryLookupIndex,
  getCountryLookupState,
  parseStateImportFile,
  resolveCountryId,
  type CountryLookupState,
} from "./stateImport";

interface RowStatusUpdate {
  status: SpreadsheetImportRowStatus;
  errorMessage?: string;
}

export const useImportStates = () => {
  const [states, setStates] = useState<ImportState[]>([]);
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
  const { hasPermission } = usePermissions();
  const canViewCountries = hasPermission("Countries:View");
  const invalidateStates = useInvalidateStates();
  const countryLookupQuery = useCountryLookup({
    enabled: canViewCountries,
    retry: false,
  });
  const loading = viewState === "parsing" || viewState === "submitting";

  const countryLookupState = getCountryLookupState({
    canViewCountries,
    isPending: countryLookupQuery.isPending,
    isError: countryLookupQuery.isError,
    countryCount: countryLookupQuery.data?.length ?? 0,
  });

  const lookupIndex = useMemo(
    () => createCountryLookupIndex(countryLookupQuery.data ?? []),
    [countryLookupQuery.data],
  );

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
      setStates((currentRows) =>
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

  const getCountryLookupMessage = useCallback(
    (state: CountryLookupState) => t(`states.import.countryLookup.${state}`),
    [t],
  );

  const validateFile = useCallback(
    (file: File): boolean => {
      const error = validateSpreadsheetImportFile(file, STATE_IMPORT_POLICY);
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
      setStates([]);
      setViewState("parsing");
      setViewMessage("");
      setLoadingText(t("imports.parsing"));
      setUploadProgress(0);

      try {
        const parsed = await parseStateImportFile(file, getStatusLabel("pending"));
        setStates(parsed);
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

  const uploadStates = useCallback(async () => {
    const rowsToUpload = states.filter((state) => state.uploadStatus === "pending");
    if (rowsToUpload.length === 0) return;

    if (countryLookupState !== "ready") {
      const message = getCountryLookupMessage(countryLookupState);
      setViewState("failed");
      setViewMessage(message);
      showSnackbar("error", [message], t("messages.error"));
      return;
    }

    setViewState("submitting");
    setViewMessage("");
    setShowCounter(true);
    startTimeRef.current = Date.now();
    setElapsedTime("0s");
    setLoadingText(t("states.import.uploading"));
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedTime(`${seconds}s`);
    }, 1000);

    const validationSchema = getStateValidationSchema(t).pick({
      nameAr: true,
      nameEn: true,
      code: true,
    });
    const duplicateTracker = createStateImportDuplicateTracker();
    const updates = new Map<number, RowStatusUpdate>();
    const failures: string[] = [];
    const validRows: Array<{
      row: ImportState;
      request: CreateStateRequest;
    }> = [];

    try {
      rowsToUpload.forEach((state, index) => {
        const countryId = resolveCountryId(lookupIndex, state.countryName);
        if (!countryId) {
          const message = t("states.import.unknownCountry");
          updates.set(state.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${state.rowNumber}: ${message}`);
          setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
          return;
        }

        const validation = validationSchema.safeParse({
          nameAr: state.nameAr,
          nameEn: state.nameEn,
          code: state.code,
        });
        if (!validation.success) {
          const message = validation.error.issues.map((issue) => issue.message).join(" | ");
          updates.set(state.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${state.rowNumber}: ${message}`);
        } else if (registerStateImportValues(duplicateTracker, countryId, validation.data)) {
          const message = t("states.import.duplicateInFile");
          updates.set(state.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${state.rowNumber}: ${message}`);
        } else {
          validRows.push({
            row: state,
            request: {
              nameEn: validation.data.nameEn,
              nameAr: validation.data.nameAr,
              code: validation.data.code.toUpperCase(),
              countryId,
            },
          });
          updates.set(state.rowNumber, { status: "submitted" });
        }

        setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
      });

      if (validRows.length > STATE_IMPORT_MAX_ROWS) {
        const message = t("imports.errors.rowLimitExceeded", {
          maxRows: STATE_IMPORT_MAX_ROWS,
        });
        validRows.forEach(({ row }) =>
          updates.set(row.rowNumber, { status: "invalid", errorMessage: message }),
        );
        failures.unshift(message);
        validRows.length = 0;
      }

      applyRowUpdates(updates);

      if (validRows.length === 0) {
        const messages = failures.length > 0 ? failures : [t("imports.noValidRows")];
        setViewState("failed");
        setViewMessage(messages.join(" | "));
        showSnackbar("error", messages, t("messages.error"));
        return;
      }

      try {
        const result = await StateService.createBulk(validRows.map(({ request }) => request));
        await invalidateStates();
        applyRowUpdates(
          new Map(
            validRows.map(({ row }) => [row.rowNumber, { status: "uploaded" as const }]),
          ),
        );
        setViewState("succeeded");
        setUploadProgress(100);
        showSnackbar(
          "success",
          [t("states.import.importSuccess", { count: result.createdCount })],
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

      if (failures.length > 0) {
        showSnackbar("error", failures, t("messages.error"));
      }
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
  }, [
    applyRowUpdates,
    countryLookupState,
    getCountryLookupMessage,
    invalidateStates,
    lookupIndex,
    showSnackbar,
    states,
    stopTimer,
    t,
  ]);

  const clearData = useCallback(() => {
    stopTimer();
    setStates([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setViewMessage("");
    setViewState("idle");
  }, [stopTimer]);

  const downloadTemplate = useCallback(
    () => downloadSpreadsheetImportTemplate(STATE_IMPORT_HEADERS, STATE_IMPORT_TEMPLATE_FILE),
    [],
  );

  const retryCountryLookup = useCallback(() => {
    void countryLookupQuery.refetch();
  }, [countryLookupQuery]);

  const uploadableCount = states.filter((state) => state.uploadStatus === "pending").length;

  return {
    states,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    countryLookupState,
    maximumBatchSize: STATE_IMPORT_MAX_ROWS,
    maximumFileSizeMb: STATE_IMPORT_MAX_BYTES / (1024 * 1024),
    expectedHeaders: STATE_IMPORT_HEADERS.join(", "),
    handleFileSelect,
    validateFile,
    uploadStates,
    clearData,
    downloadTemplate,
    retryCountryLookup,
    SnackbarComponent,
  };
};
