/** Consistent file-size presentation across upload fields, catalogs and version history. */
export function formatByteSize(bytes: number, language: string): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index =
    bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const position = Math.max(0, index);
  return (
    new Intl.NumberFormat(language, { maximumFractionDigits: position === 0 ? 0 : 1 }).format(
      bytes / 1024 ** position,
    ) +
    ' ' +
    units[position]
  );
}
