import { useMemo } from "react";

export function useExcelFilter(
  sheetData: unknown[][][],
  currentSheetIndex: number,
  searchTerm: string
) {
  return useMemo(() => {
    const currentData = sheetData?.[currentSheetIndex] ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return currentData;

    return currentData.filter((row: unknown[]) =>
      row.some((cell: unknown) => String(cell ?? "").toLowerCase().includes(normalizedSearch)),
    );
  }, [currentSheetIndex, searchTerm, sheetData]);
}
