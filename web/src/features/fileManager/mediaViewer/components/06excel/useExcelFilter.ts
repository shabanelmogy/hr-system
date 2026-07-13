import { useEffect, useState } from "react";

export function useExcelFilter(sheetData: any[][], currentSheetIndex: number, searchTerm: string) {
  const [filteredData, setFilteredData] = useState<any[][]>([]);

  useEffect(() => {
    if (!sheetData || sheetData.length === 0) return;

    const currentData = sheetData[currentSheetIndex] || [];
    if (!searchTerm.trim()) {
      setFilteredData(currentData);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = currentData.filter((row: any[]) =>
      row.some((cell: unknown) => String(cell ?? "").toLowerCase().includes(searchLower))
    );

    setFilteredData(filtered);
  }, [sheetData, currentSheetIndex, searchTerm]);

  return filteredData;
}
