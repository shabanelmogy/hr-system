import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStateLookup } from "../../../states";
import { useGlobalGeographyPermissions } from "@/shared/hooks/usePermissions";
import HandleApiError from "@/shared/services/apiError";
import {
  downloadSpreadsheetImportTemplate,
  canSubmitSpreadsheetImport,
  isAmbiguousImportSubmissionError,
  toSpreadsheetImportError,
  validateSpreadsheetImportFile,
  type SpreadsheetImportRowStatus,
  type SpreadsheetImportViewState,
} from "@/shared/services/excelService";
import useSnackbar from "@/shared/hooks/useSnackbar";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { getDistrictValidationSchema } from "../../utils/validation";
import DistrictService from "../../services/districtService";
import { useInvalidateDistricts } from "../../hooks/useDistrictQueries";
import type { CreateDistrictRequest } from "../../types/District";
import type { ImportDistrict } from "./types";
import {
  createDistrictImportDuplicateTracker,
  registerDistrictImportValues,
} from "./districtImportDuplicates";
import {
  DISTRICT_IMPORT_HEADERS,
  DISTRICT_IMPORT_MAX_BYTES,
  DISTRICT_IMPORT_MAX_ROWS,
  DISTRICT_IMPORT_POLICY,
  DISTRICT_IMPORT_TEMPLATE_FILE,
  createStateLookupIndex,
  getStateLookupState,
  parseDistrictImportFile,
  resolveStateId,
  type StateLookupState,
} from "./districtImport";

interface RowStatusUpdate {
  status: SpreadsheetImportRowStatus;
  errorMessage?: string;
}

export const useImportDistricts = () => {
  const [districts, setDistricts] = useState<ImportDistrict[]>([]);
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
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const canViewStates = hasGlobalGeographyPermission("States:View");
  const canCreateDistricts = hasGlobalGeographyPermission("Districts:Create");
  const invalidateDistricts = useInvalidateDistricts();
  const stateLookupQuery = useStateLookup(undefined, {
    enabled: canViewStates,
    retry: false,
  });
  const loading = viewState === "parsing" || viewState === "submitting";

  const stateLookupState = getStateLookupState({
    canViewStates,
    isPending: stateLookupQuery.isPending,
    isError: stateLookupQuery.isError,
    stateCount: stateLookupQuery.data?.length ?? 0,
  });
  const canSubmit = canSubmitSpreadsheetImport(isReadOnly, canCreateDistricts)
    && stateLookupState === "ready";

  const lookupIndex = useMemo(
    () => createStateLookupIndex(stateLookupQuery.data ?? []),
    [stateLookupQuery.data],
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
      setDistricts((currentRows) =>
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

  const getStateLookupMessage = useCallback(
    (state: StateLookupState) => t(`districts.import.stateLookup.${state}`),
    [t],
  );

  const validateFile = useCallback(
    (file: File): boolean => {
      const error = validateSpreadsheetImportFile(file, DISTRICT_IMPORT_POLICY);
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
      setDistricts([]);
      setViewState("parsing");
      setViewMessage("");
      setLoadingText(t("imports.parsing"));
      setUploadProgress(0);

      try {
        const parsed = await parseDistrictImportFile(file, getStatusLabel("pending"));
        setDistricts(parsed);
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

  const uploadDistricts = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!canCreateDistricts) {
      const message = t("districts.permissionDenied");
      setViewState("failed");
      setViewMessage(message);
      showSnackbar("error", [message], t("messages.error"));
      return;
    }

    const rowsToUpload = districts.filter((district) => district.uploadStatus === "pending");
    if (rowsToUpload.length === 0) return;

    if (stateLookupState !== "ready") {
      const message = getStateLookupMessage(stateLookupState);
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
    setLoadingText(t("districts.import.uploading"));
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedTime(`${seconds}s`);
    }, 1000);

    const validationSchema = getDistrictValidationSchema(t).pick({
      nameAr: true,
      nameEn: true,
      code: true,
    });
    const duplicateTracker = createDistrictImportDuplicateTracker();
    const updates = new Map<number, RowStatusUpdate>();
    const failures: string[] = [];
    const validRows: Array<{
      row: ImportDistrict;
      request: CreateDistrictRequest;
    }> = [];

    try {
      rowsToUpload.forEach((district, index) => {
        const stateId = resolveStateId(lookupIndex, district.stateName);
        if (!stateId) {
          const message = t("districts.import.unknownState");
          updates.set(district.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${district.rowNumber}: ${message}`);
          setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
          return;
        }

        const validation = validationSchema.safeParse({
          nameAr: district.nameAr,
          nameEn: district.nameEn,
          code: district.code,
        });
        if (!validation.success) {
          const message = validation.error.issues.map((issue) => issue.message).join(" | ");
          updates.set(district.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${district.rowNumber}: ${message}`);
        } else if (registerDistrictImportValues(duplicateTracker, stateId, {
          nameAr: validation.data.nameAr ?? "",
          nameEn: validation.data.nameEn ?? "",
          code: validation.data.code,
        })) {
          const message = t("districts.import.duplicateInFile");
          updates.set(district.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${district.rowNumber}: ${message}`);
        } else {
          validRows.push({
            row: district,
            request: {
              nameEn: validation.data.nameEn,
              nameAr: validation.data.nameAr,
              code: validation.data.code.toUpperCase(),
              stateId,
            },
          });
          updates.set(district.rowNumber, { status: "submitted" });
        }

        setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
      });

      if (validRows.length > DISTRICT_IMPORT_MAX_ROWS) {
        const message = t("imports.errors.rowLimitExceeded", {
          maxRows: DISTRICT_IMPORT_MAX_ROWS,
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
        const result = await DistrictService.createBulk(validRows.map(({ request }) => request));
        await invalidateDistricts();
        applyRowUpdates(
          new Map(
            validRows.map(({ row }) => [row.rowNumber, { status: "uploaded" as const }]),
          ),
        );
        setViewState("succeeded");
        setUploadProgress(100);
        showSnackbar(
          "success",
          [t("districts.import.importSuccess", { count: result.createdCount })],
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
    canCreateDistricts,
    districts,
    getStateLookupMessage,
    invalidateDistricts,
    isReadOnly,
    lookupIndex,
    notifyBlockedAction,
    showSnackbar,
    stateLookupState,
    stopTimer,
    t,
  ]);

  const clearData = useCallback(() => {
    stopTimer();
    setDistricts([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setViewMessage("");
    setViewState("idle");
  }, [stopTimer]);

  const downloadTemplate = useCallback(
    () => downloadSpreadsheetImportTemplate(DISTRICT_IMPORT_HEADERS, DISTRICT_IMPORT_TEMPLATE_FILE),
    [],
  );

  const retryStateLookup = useCallback(() => {
    void stateLookupQuery.refetch();
  }, [stateLookupQuery]);

  const uploadableCount = districts.filter((district) => district.uploadStatus === "pending").length;

  return {
    districts,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    canSubmit,
    stateLookupState,
    maximumBatchSize: DISTRICT_IMPORT_MAX_ROWS,
    maximumFileSizeMb: DISTRICT_IMPORT_MAX_BYTES / (1024 * 1024),
    expectedHeaders: DISTRICT_IMPORT_HEADERS.join(", "),
    handleFileSelect,
    validateFile,
    uploadDistricts,
    clearData,
    downloadTemplate,
    retryStateLookup,
    SnackbarComponent,
  };
};
