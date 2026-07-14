import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiService, HandleApiError } from "@/shared/services";
import { useSnackbar } from "@/shared/hooks";
import { readExcelFile } from "@/shared/services/excelService";
import { apiRoutes } from "@/config";
import getCountryValidationSchema from "../../utils/validation";
import { Country } from "./types";

type UploadStatus = "pending" | "uploaded" | "failed";

type ImportCountry = Country & {
  rowNumber: number;
  uploadStatus: UploadStatus;
  importStatus: string;
  errorMessage?: string;
};

export const useCountryImport = () => {
  const [countries, setCountries] = useState<ImportCountry[]>([]);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("0s");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getStatusLabel = (status: UploadStatus) => {
    const labels: Record<UploadStatus, string> = {
      pending: t("imports.pending") || "Pending",
      uploaded: t("imports.uploaded") || "Uploaded",
      failed: t("imports.failed") || "Failed",
    };
    return labels[status];
  };

  const updateRowStatus = (
    rowNumber: number,
    uploadStatus: UploadStatus,
    errorMessage?: string,
  ) => {
    setCountries((currentRows) =>
      currentRows.map((row) =>
        row.rowNumber === rowNumber
          ? {
              ...row,
              uploadStatus,
              importStatus: getStatusLabel(uploadStatus),
              errorMessage,
            }
          : row,
      ),
    );
  };

  const parseCountriesFromExcel = async (file: File): Promise<ImportCountry[]> => {
    const jsonData = await readExcelFile(file);

    // Skip the header row and map to country structure
    return jsonData
      .slice(1)
      .filter((row: any) => Array.isArray(row) && row.length > 0)
      .map((row: any, index: number) => ({
        nameAr: String(row[0] ?? "").trim(),
        nameEn: String(row[1] ?? "").trim(),
        alpha2Code: String(row[2] ?? "").trim(),
        alpha3Code: String(row[3] ?? "").trim(),
        phoneCode: String(row[4] ?? "").trim(),
        currencyCode: String(row[5] ?? "").trim(),
        rowNumber: index + 2,
        uploadStatus: "pending" as const,
        importStatus: getStatusLabel("pending"),
      }));
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setLoading(true);
    setLoadingText(t("downloading") || "Parsing file...");
    setUploadProgress(0);

    try {
      const parsed = await parseCountriesFromExcel(file);
      setCountries(parsed);
      setUploadProgress(100);
      showSnackbar(
        "success",
        [t("messages.fileParsed") || "File parsed successfully"],
        t("messages.success") || "Success"
      );
    } catch (error) {
      showSnackbar(
        "error",
        [(error as Error).message || t("messages.error") || "Error"],
        t("messages.error") || "Error"
      );
      setSelectedFile(null);
    } finally {
      setLoading(false);
      setLoadingText("");
      setUploadProgress(0);
    }
  };

  const validateFile = (file: File): boolean => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx") {
      showSnackbar(
        "error",
        [t("fileTypeNotSupported") || "Only .xlsx files are supported"],
        t("error") || "Error"
      );
      return false;
    }
    return true;
  };

  const uploadCountries = async () => {
    const rowsToUpload = countries.filter((country) => country.uploadStatus !== "uploaded");
    if (rowsToUpload.length === 0) return;

    try {
      setShowCounter(true);
      startTimeRef.current = Date.now();
      setElapsedTime("0s");
      setLoading(true);
      setLoadingText(t("uploading") || "Uploading...");

      timerRef.current = setInterval(() => {
        const seconds = Math.floor(
          (Date.now() - (startTimeRef.current || 0)) / 1000
        );
        setElapsedTime(`${seconds}s`);
      }, 1000);

      const validationSchema = getCountryValidationSchema(t);
      let success = 0;
      const failures: string[] = [];

      // Validate and upload each row independently so failed rows remain retryable.
      for (let i = 0; i < rowsToUpload.length; i++) {
        const c = rowsToUpload[i];
        const validation = validationSchema.safeParse({
          nameAr: c.nameAr,
          nameEn: c.nameEn,
          alpha2Code: c.alpha2Code,
          alpha3Code: c.alpha3Code,
          phoneCode: c.phoneCode,
          currencyCode: c.currencyCode ?? "",
        });

        if (!validation.success) {
          const message = validation.error.issues
            .map((issue) => issue.message)
            .join(" | ");
          updateRowStatus(c.rowNumber, "failed", message);
          failures.push(`${t("imports.row") || "Row"} ${c.rowNumber}: ${message}`);
          setUploadProgress(Math.round(((i + 1) / rowsToUpload.length) * 100));
          continue;
        }

        try {
          await apiService.post(apiRoutes.countries.add, {
            nameEn: validation.data.nameEn,
            nameAr: validation.data.nameAr,
            alpha2Code: validation.data.alpha2Code || null,
            alpha3Code: validation.data.alpha3Code || null,
            phoneCode: validation.data.phoneCode || null,
            currencyCode: validation.data.currencyCode || null,
          });
          success++;
          updateRowStatus(c.rowNumber, "uploaded");
        } catch (err) {
          let message = err instanceof Error ? err.message : t("messages.error") || "Upload error";
          HandleApiError(err, (updatedState) => {
            message = updatedState.messages.join(" | ") || updatedState.title || message;
          });
          updateRowStatus(c.rowNumber, "failed", message);
          failures.push(`${t("imports.row") || "Row"} ${c.rowNumber}: ${message}`);
        }

        setUploadProgress(Math.round(((i + 1) / rowsToUpload.length) * 100));
      }

      if (success > 0) {
        showSnackbar(
          "success",
          [`${success} ${t("countries.uploaded") || "countries uploaded"}`],
          t("messages.success") || "Success",
        );
      }
      if (failures.length > 0) {
        showSnackbar("error", failures, t("messages.error") || "Error");
      }
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        showSnackbar(
          "error",
          updatedState.messages,
          updatedState.title || t("messages.error") || "Error"
        );
      });
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
      setShowCounter(false);
      setLoadingText("");
      setUploadProgress(0);
    }
  };

  const clearData = () => {
    setCountries([]);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const failedCount = countries.filter((country) => country.uploadStatus === "failed").length;
  const uploadableCount = countries.filter((country) => country.uploadStatus !== "uploaded").length;

  return {
    countries,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    failedCount,
    uploadableCount,
    handleFileSelect,
    validateFile,
    uploadCountries,
    clearData,
    SnackbarComponent,
  };
};
