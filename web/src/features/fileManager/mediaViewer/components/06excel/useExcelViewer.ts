import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useExcelViewer = (mediaUrl: string, onError: (message: string) => void) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadExcelFile();
  }, [mediaUrl]);

  const loadExcelFile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(mediaUrl);
      const arrayBuffer = await response.arrayBuffer();

      const XLSX = await import("xlsx");
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);

      const allSheets: any[][] = [];
      sheets.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        allSheets.push(data as any[]);
      });

      setSheetData(allSheets);
      setIsLoading(false);
      onError("");
    } catch (error) {
      console.error("Error loading Excel file:", error);
      onError(t("media.failedToLoadExcel") || "Failed to load Excel file");
      setIsLoading(false);
    }
  };

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

  const handleFullscreen = (containerRef: React.RefObject<HTMLElement>) => {
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