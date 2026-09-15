import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";

type ExcelLoadStatus = {
  sourceUrl: string;
  status: "loading" | "loaded" | "error";
};

export const useExcelViewer = (mediaUrl: string, onError: (message: string) => void) => {
  const { t } = useTranslation();
  const [loadStatus, setLoadStatus] = useState<ExcelLoadStatus>({
    sourceUrl: mediaUrl,
    status: "loading",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sheetData, setSheetData] = useState<unknown[][][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadExcelFile = async () => {
      try {
        const response = await fetch(mediaUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load Excel file (${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const XLSX = await import("xlsx");
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheets = workbook.SheetNames;
        const allSheets: unknown[][][] = [];
        sheets.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
          allSheets.push(data);
        });

        if (!active) return;
        setSheetNames(sheets);
        setSheetData(allSheets);
        setCurrentSheetIndex(0);
        setSearchTerm("");
        setLoadStatus({ sourceUrl: mediaUrl, status: "loaded" });
        onErrorRef.current("");
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        console.error("Error loading Excel file:", error);
        onErrorRef.current(t("media.failedToLoadExcel"));
        setLoadStatus({ sourceUrl: mediaUrl, status: "error" });
      }
    };

    void loadExcelFile();
    return () => {
      active = false;
      controller.abort();
    };
  }, [mediaUrl, t]);

  const isLoading = loadStatus.sourceUrl !== mediaUrl || loadStatus.status === "loading";

  const handlePrevSheet = () => {
    setCurrentSheetIndex((prev) => Math.max(0, prev - 1));
    setSearchTerm("");
  };

  const handleNextSheet = () => {
    setCurrentSheetIndex((prev) => Math.min(sheetNames.length - 1, prev + 1));
    setSearchTerm("");
  };

  const handleSheetSelect = (index: number) => {
    setCurrentSheetIndex(index);
    setSearchTerm("");
  };

  const handleFullscreen = (containerRef: RefObject<HTMLElement | null>) => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = mediaUrl;
    link.download = "spreadsheet.xlsx";
    link.click();
  };

  return {
    isLoading,
    isFullscreen,
    sheetData,
    sheetNames,
    currentSheetIndex,
    searchTerm,
    setSearchTerm,
    handlePrevSheet,
    handleNextSheet,
    handleSheetSelect,
    handleFullscreen,
    handleDownload,
  };
};
