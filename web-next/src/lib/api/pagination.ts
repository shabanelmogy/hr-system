export interface ManagementPageQuery {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  columnName?: string;
  sortDirection?: "ASC" | "DESC";
  includeArchived?: boolean;
}

export interface ManagementPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface ManagementPageResponse<T> {
  items: T[];
  metaData: ManagementPageMetadata;
}
