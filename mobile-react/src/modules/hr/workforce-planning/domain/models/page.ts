export interface WorkforcePlanningPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface WorkforcePlanningPage<T> {
  items: T[];
  metaData: WorkforcePlanningPageMetadata;
}
