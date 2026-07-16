export interface CardPaginationState {
  pageCount: number;
  page: number;
  start: number;
  end: number;
}

export function getCardPaginationState(
  requestedPage: number,
  rowsPerPage: number,
  totalItems: number,
): CardPaginationState {
  const safeRowsPerPage = Math.max(1, rowsPerPage);
  const safeTotalItems = Math.max(0, totalItems);
  const pageCount = Math.max(1, Math.ceil(safeTotalItems / safeRowsPerPage));
  const page = Math.min(Math.max(0, requestedPage), pageCount - 1);

  return {
    pageCount,
    page,
    start: safeTotalItems === 0 ? 0 : page * safeRowsPerPage + 1,
    end: Math.min((page + 1) * safeRowsPerPage, safeTotalItems),
  };
}
