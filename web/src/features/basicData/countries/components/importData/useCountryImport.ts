import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiService, HandleApiError } from "@/shared/services";
import { useSnackbar } from "@/shared/hooks";
import { readExcelFile } from "@/shared/services/excelService";
import { apiRoutes } from "@/routes";
import { Country } from "./types";

export const useCountryImport = () => {
  const [countries, setCountries] = useState<Country[]>([]);
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

  const parseCountriesFromExcel = async (file: File): Promise<Country[]> => {
    const jsonData = await readExcelFile(file);

    // Skip the header row and map to country structure
    return jsonData
      .slice(1)
      .filter((row: any) => Array.isArray(row) && row.length > 0)
      .map((row: any) => ({
        nameAr: row[0] || "",
        nameEn: row[1] || "",
        alpha2Code: row[2] || "",
        alpha3Code: row[3] || "",
        phoneCode: row[4] ? String(row[4]) : "",
        currencyCode: row[5] || null,
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
    if (countries.length === 0) return;

    try {
      setShowCounter(true);
      startTimeRef.current = Date.now();
      setLoading(true);
      setLoadingText(t("uploading") || "Uploading...");

      timerRef.current = setInterval(() => {
        const seconds = Math.floor(
          (Date.now() - (startTimeRef.current || 0)) / 1000
        );
        setElapsedTime(`${seconds}s`);
      }, 1000);

      // Sequential upload using existing add endpoint
      let success = 0;
      for (let i = 0; i < countries.length; i++) {
        const c = countries[i];
        try {
          await apiService.post(apiRoutes.countries.add, {
            nameEn: c.nameEn,
            nameAr: c.nameAr,
            alpha2Code: c.alpha2Code || null,
            alpha3Code: c.alpha3Code || null,
            phoneCode: c.phoneCode || null,
            currencyCode: c.currencyCode || null,
          });
          success++;
          // update progress
          setUploadProgress(Math.round(((i + 1) / countries.length) * 100));
          showSnackbar(
            "success",
            [
              `${success}/${countries.length} ${
                t("countries.uploaded") || "countries uploaded"
              }`,
            ],
            t("messages.success") || "Success"
          );

          setCountries([]);
          setSelectedFile(null);
        } catch (err) {
          // Continue uploading remaining items; collect errors via snackbar
          HandleApiError(err, (updatedState: any) => {
            showSnackbar(
              "error",
              updatedState?.messages || [
                (err as any)?.message || "Upload error",
              ],
              (err as any)?.title || t("messages.error") || "Error"
            );
            return;
          });
        }
      }
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showSnackbar(
          "error",
          updatedState?.messages,
          (error as any)?.title || t("messages.error") || "Error"
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
  };

  return {
    countries,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    handleFileSelect,
    validateFile,
    uploadCountries,
    clearData,
    SnackbarComponent,
  };
};
