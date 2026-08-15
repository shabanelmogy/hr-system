import { z } from 'zod';

export interface PageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface PageResponse<T> {
  items: T[];
  metaData: PageMetadata;
}

export interface PageQuery {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  columnName?: string;
  sortDirection?: 'ASC' | 'DESC';
  includeArchived?: boolean;
}

export const pageMetadataSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  pageNumber: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  hasPrev: z.boolean(),
  hasNext: z.boolean(),
});

export function toPageQuery(query: PageQuery): string {
  const parameters = new URLSearchParams();
  if (query.pageNumber != null) parameters.set('pageNumber', String(query.pageNumber));
  if (query.pageSize != null) parameters.set('pageSize', String(query.pageSize));
  if (query.searchValue?.trim()) parameters.set('searchValue', query.searchValue.trim());
  if (query.columnName?.trim()) parameters.set('columnName', query.columnName.trim());
  if (query.sortDirection) parameters.set('sortDirection', query.sortDirection);
  if (query.includeArchived != null) {
    parameters.set('includeArchived', String(query.includeArchived));
  }
  return parameters.toString();
}
