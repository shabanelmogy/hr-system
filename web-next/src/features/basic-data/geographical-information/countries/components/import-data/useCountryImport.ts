import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import getCountryValidationSchema from "../../utils/validation";
import CountryService from "../../services/countryService";
import { useInvalidateCountries } from "../../hooks/useCountryQueries";
import type { ImportCountry } from "./types";
import {
  COUNTRY_IMPORT_HEADERS,
  COUNTRY_IMPORT_MAX_BYTES,
  COUNTRY_IMPORT_MAX_ROWS,
  COUNTRY_IMPORT_POLICY,
  COUNTRY_IMPORT_TEMPLATE_FILE,
  createCountryImportDuplicateTracker,
  parseCountryImportFile,
  registerCountryImportValues,
} from "./countryImport";

interface RowStatusUpdate {
  status: SpreadsheetImportRowStatus;
  errorMessage?: string;
}

export const useCountryImport = () => {
  const [countries, setCountries] = useState<ImportCountry[]>([]);
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
  const invalidateCountries = useInvalidateCountries();
  const loading = viewState === "parsing" || viewState === "submitting";

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
      setCountries((currentRows) =>
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
      const error = validateSpreadsheetImportFile(file, COUNTRY_IMPORT_POLICY);
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
      setCountries([]);
      setViewState("parsing");
      setViewMessage("");
      setLoadingText(t("imports.parsing"));
      setUploadProgress(0);

      try {
        const parsed = await parseCountryImportFile(file, getStatusLabel("pending"));
        setCountries(parsed);
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

  const uploadCountries = useCallback(async () => {
    const rowsToUpload = countries.filter((country) => country.uploadStatus === "pending");
    if (rowsToUpload.length === 0) return;

    setViewState("submitting");
    setViewMessage("");
    setShowCounter(true);
    startTimeRef.current = Date.now();
    setElapsedTime("0s");
    setLoadingText(t("imports.uploading"));
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedTime(`${seconds}s`);
    }, 1000);

    const validationSchema = getCountryValidationSchema(t);
    const duplicateTracker = createCountryImportDuplicateTracker();
    const updates = new Map<number, RowStatusUpdate>();
    const failures: string[] = [];
    const validRows: Array<{
      row: ImportCountry;
      request: Parameters<typeof CountryService.create>[0];
    }> = [];

    try {
      rowsToUpload.forEach((country, index) => {
        const validation = validationSchema.safeParse({
          nameAr: country.nameAr,
          nameEn: country.nameEn,
          alpha2Code: country.alpha2Code,
          alpha3Code: country.alpha3Code,
          phoneCode: country.phoneCode,
          currencyCode: country.currencyCode ?? "",
        });

        if (!validation.success) {
          const message = validation.error.issues.map((issue) => issue.message).join(" | ");
          updates.set(country.rowNumber, { status: "invalid", errorMessage: message });
          failures.push(`${t("imports.row")} ${country.rowNumber}: ${message}`);
        } else {
          const request = {
            nameEn: validation.data.nameEn,
            nameAr: validation.data.nameAr,
            alpha2Code: validation.data.alpha2Code || null,
            alpha3Code: validation.data.alpha3Code || null,
            phoneCode: validation.data.phoneCode || null,
            currencyCode: validation.data.currencyCode || null,
          };

          if (registerCountryImportValues(duplicateTracker, request)) {
            const message = t("countries.import.duplicateInFile");
            updates.set(country.rowNumber, { status: "invalid", errorMessage: message });
            failures.push(`${t("imports.row")} ${country.rowNumber}: ${message}`);
          } else {
            validRows.push({ row: country, request });
            updates.set(country.rowNumber, { status: "submitted" });
          }
        }

        setUploadProgress(Math.round(((index + 1) / rowsToUpload.length) * 100));
      });

      if (validRows.length > COUNTRY_IMPORT_MAX_ROWS) {
        const message = t("imports.errors.rowLimitExceeded", {
          maxRows: COUNTRY_IMPORT_MAX_ROWS,
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
        const result = await CountryService.createBulk(
          validRows.map(({ request }) => request),
        );
        await invalidateCountries();
        applyRowUpdates(
          new Map(
            validRows.map(({ row }) => [row.rowNumber, { status: "uploaded" as const }]),
          ),
        );
        setViewState("succeeded");
        setUploadProgress(100);
        showSnackbar(
          "success",
          [t("countries.import.importSuccess", { count: result.createdCount })],
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
  }, [applyRowUpdates, countries, invalidateCountries, showSnackbar, stopTimer, t]);

  const clearData = useCallback(() => {
    stopTimer();
    setCountries([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setViewMessage("");
    setViewState("idle");
  }, [stopTimer]);

  const downloadTemplate = useCallback(
    () => downloadSpreadsheetImportTemplate(COUNTRY_IMPORT_HEADERS, COUNTRY_IMPORT_TEMPLATE_FILE),
    [],
  );

  const uploadableCount = countries.filter(
    (country) => country.uploadStatus === "pending",
  ).length;

  return {
    countries,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    maximumBatchSize: COUNTRY_IMPORT_MAX_ROWS,
    maximumFileSizeMb: COUNTRY_IMPORT_MAX_BYTES / (1024 * 1024),
    expectedHeaders: COUNTRY_IMPORT_HEADERS.join(", "),
    handleFileSelect,
    validateFile,
    uploadCountries,
    clearData,
    downloadTemplate,
    SnackbarComponent,
  };
};
