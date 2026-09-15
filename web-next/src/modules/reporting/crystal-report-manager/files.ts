const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function canUseCrystalReportFile(file: File | null): file is File {
  return !!file && file.size > 0 && file.size <= MAX_FILE_BYTES && file.name.toLowerCase().endsWith(".rpt");
}

export function downloadCrystalReportBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatCrystalReportBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
