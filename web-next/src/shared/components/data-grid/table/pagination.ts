export function clampPage(page: number, rowsPerPage: number, rowCount: number) {
  if (rowCount <= 0) return 0;
  const lastPage = Math.max(0, Math.ceil(rowCount / Math.max(1, rowsPerPage)) - 1);
  return Math.min(Math.max(0, page), lastPage);
}
