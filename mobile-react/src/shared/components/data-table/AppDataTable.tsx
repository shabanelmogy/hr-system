import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppScreenFooterContext } from '@/src/shared/components/layout/AppScreenFooterContext';
import { shouldPinPagination } from '@/src/shared/components/multi-view/paginationPlacement';
import { AppPaginationNavigation } from '@/src/shared/components/pagination';
import { AppText } from '@/src/shared/components/typography/AppText';

export type AppDataTableSortValue = string | number | boolean | Date | null | undefined;

export interface AppDataTableColumn<Row> {
  id: string;
  header: string;
  width?: number;
  align?: 'start' | 'center' | 'end';
  render: (row: Row) => ReactNode;
  /** Marks a server-managed column sortable when no local sortValue is needed. */
  sortable?: boolean;
  sortValue?: (row: Row) => AppDataTableSortValue;
}

export type AppDataTableSortDirection = 'ascending' | 'descending';

export interface AppDataTableSortState {
  columnId: string;
  direction: AppDataTableSortDirection;
}

export interface AppDataTableServerState {
  /** Zero-based page used by the UI. */
  page: number;
  pageSize: number;
  totalRows: number;
  sort: AppDataTableSortState | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: AppDataTableSortState | null) => void;
}

export interface AppDataTableProps<Row> {
  rows: readonly Row[];
  columns: readonly AppDataTableColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  emptyMessage?: string;
  showPagination?: boolean;
  compactHeader?: boolean;
  resetKey?: string | number;
  /** Controlled list state. Rows are treated as one server page and are not sorted or sliced locally. */
  serverState?: AppDataTableServerState;
}

export function AppDataTable<Row>({
  rows,
  columns,
  getRowKey,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25],
  emptyMessage,
  showPagination = true,
  compactHeader = true,
  resetKey,
  serverState,
}: AppDataTableProps<Row>) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const footerHost = useContext(AppScreenFooterContext);
  const footerOwner = useRef(Symbol('AppDataTable pagination'));
  const previousResetKey = useRef(resetKey);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState<AppDataTableSortState | null>(null);
  const usesServerState = Boolean(serverState);
  const activePage = serverState?.page ?? page;
  const activePageSize = serverState?.pageSize ?? pageSize;
  const activeSort = serverState?.sort ?? sort;
  const totalRows = serverState?.totalRows ?? rows.length;
  const onServerPageChange = serverState?.onPageChange;
  const onServerPageSizeChange = serverState?.onPageSizeChange;
  const onServerSortChange = serverState?.onSortChange;
  const pageCount = Math.max(1, Math.ceil(totalRows / activePageSize));
  const pageSizeOptionsKey = pageSizeOptions.join(',');
  const stablePageSizeOptions = useMemo(
    () => pageSizeOptionsKey.split(',').filter(Boolean).map(Number),
    [pageSizeOptionsKey],
  );

  const collator = useMemo(
    () => new Intl.Collator(i18n.language, { numeric: true, sensitivity: 'base' }),
    [i18n.language],
  );

  const sortedRows = useMemo(() => {
    if (usesServerState || !activeSort) return rows;

    const column = columns.find((candidate) => candidate.id === activeSort.columnId);
    if (!column?.sortValue) return rows;

    return rows
      .map((row, naturalIndex) => ({ row, naturalIndex }))
      .sort((left, right) => {
        const comparison = compareSortValues(
          column.sortValue?.(left.row),
          column.sortValue?.(right.row),
          collator,
        );

        if (comparison === 0) return left.naturalIndex - right.naturalIndex;
        return activeSort.direction === 'ascending' ? comparison : -comparison;
      })
      .map(({ row }) => row);
  }, [activeSort, collator, columns, rows, usesServerState]);

  useEffect(() => {
    const safePage = Math.min(activePage, pageCount - 1);
    if (activePage === safePage) return;
    if (usesServerState) {
      onServerPageChange?.(safePage);
    } else {
      setPage(safePage);
    }
  }, [activePage, onServerPageChange, pageCount, usesServerState]);

  useEffect(() => {
    if (Object.is(previousResetKey.current, resetKey)) return;
    previousResetKey.current = resetKey;
    if (usesServerState) {
      onServerPageChange?.(0);
    } else {
      setPage(0);
    }
  }, [onServerPageChange, resetKey, usesServerState]);

  const pageRows = useMemo(
    () => showPagination && !usesServerState
      ? sortedRows.slice(activePage * activePageSize, activePage * activePageSize + activePageSize)
      : sortedRows,
    [activePage, activePageSize, showPagination, sortedRows, usesServerState],
  );
  const pinPagination = showPagination && shouldPinPagination(
    pageRows.length,
    Boolean(footerHost),
  );
  const tableWidth = columns.reduce((total, column) => total + (column.width ?? 150), 0);
  const pagination = useMemo(() => showPagination && totalRows > 0 ? (
    <View
      style={[
        styles.pagination,
        pinPagination && styles.pinnedPagination,
        {
          direction,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: pinPagination ? theme.radius.md : 0,
        },
      ]}>
      <View style={[styles.pageSizes, { direction }]}>
        <AppText
          color="muted"
          numberOfLines={1}
          style={styles.pageSizeLabel}
          variant="caption">
          {t('dataTable.rowsPerPage')}
        </AppText>
        {stablePageSizeOptions.map((option) => (
          <Pressable
            accessibilityLabel={t('dataTable.usePageSize', { count: option })}
            accessibilityRole="button"
            accessibilityState={{ selected: option === activePageSize }}
            key={option}
            onPress={() => {
              if (usesServerState) {
                onServerPageSizeChange?.(option);
              } else {
                setPageSize(option);
                setPage(0);
              }
            }}
            style={[
              styles.pageSize,
              {
                backgroundColor: option === activePageSize
                  ? theme.colors.primary
                  : theme.colors.surfaceMuted,
                borderRadius: theme.radius.sm,
              },
            ]}>
            <AppText
              style={{ color: option === activePageSize ? theme.colors.onPrimary : theme.colors.text }}
              variant="caption"
              weight="700">
              {option}
            </AppText>
          </Pressable>
        ))}
      </View>

      <AppPaginationNavigation
        page={activePage}
        pageCount={pageCount}
        onPageChange={(nextPage) => {
          if (usesServerState) {
            onServerPageChange?.(nextPage);
          } else {
            setPage(nextPage);
          }
        }}
      />
    </View>
  ) : null, [
    direction,
    activePage,
    activePageSize,
    pageCount,
    pinPagination,
    totalRows,
    usesServerState,
    onServerPageChange,
    onServerPageSizeChange,
    showPagination,
    stablePageSizeOptions,
    t,
    theme.colors.border,
    theme.colors.onPrimary,
    theme.colors.primary,
    theme.colors.surface,
    theme.colors.surfaceMuted,
    theme.colors.text,
    theme.radius.md,
    theme.radius.sm,
  ]);

  useEffect(() => {
    if (!footerHost) return;

    const owner = footerOwner.current;
    if (!pinPagination) {
      footerHost.unregisterFooter(owner);
      return;
    }

    footerHost.registerFooter(owner, pagination);
    return () => footerHost.unregisterFooter(owner);
  }, [footerHost, pagination, pinPagination]);

  if (rows.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: theme.colors.border }]}>
        <AppText color="muted" align="center" variant="bodySmall">
          {emptyMessage ?? t('dataTable.empty')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: tableWidth }}>
          <View
            accessibilityRole="header"
            style={[
              styles.row,
              compactHeader && styles.compactHeaderRow,
              { direction, backgroundColor: theme.colors.surfaceMuted },
            ]}>
            {columns.map((column) => {
              const sortable = column.sortable ?? Boolean(column.sortValue);
              const activeDirection = activeSort?.columnId === column.id
                ? activeSort.direction
                : null;
              const nextDirection = activeDirection === 'ascending'
                ? 'descending'
                : activeDirection === 'descending'
                  ? null
                  : 'ascending';
              const sortLabel = nextDirection === 'ascending'
                ? t('dataTable.sortAscending', { column: column.header })
                : nextDirection === 'descending'
                  ? t('dataTable.sortDescending', { column: column.header })
                  : t('dataTable.clearSort', { column: column.header });

              return (
                <View
                  key={column.id}
                  style={[
                    styles.cell,
                    compactHeader && styles.compactHeaderCell,
                    {
                      width: column.width ?? 150,
                      borderColor: theme.colors.border,
                      alignItems: getCellAlignment(column.align, isRTL),
                    },
                  ]}>
                  {sortable ? (
                    <Pressable
                      accessibilityLabel={sortLabel}
                      accessibilityRole="button"
                      accessibilityState={{ selected: Boolean(activeDirection) }}
                      hitSlop={4}
                      onPress={() => {
                        const nextSort: AppDataTableSortState | null = nextDirection
                          ? { columnId: column.id, direction: nextDirection }
                          : null;
                        if (usesServerState) {
                          onServerSortChange?.(nextSort);
                        } else {
                          setSort(nextSort);
                          setPage(0);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.sortHeader,
                        {
                          justifyContent: getCellAlignment(column.align, isRTL),
                          opacity: pressed ? 0.65 : 1,
                        },
                      ]}>
                      <AppText
                        align={getTextAlignment(column.align, isRTL)}
                        variant="caption"
                        weight="800">
                        {column.header}
                      </AppText>
                      <AppIcon
                        color={activeDirection ? theme.colors.primary : theme.colors.textMuted}
                        name={activeDirection === 'ascending'
                          ? 'arrow-up-outline'
                          : activeDirection === 'descending'
                            ? 'arrow-down-outline'
                            : 'swap-vertical-outline'}
                        size={15}
                      />
                    </Pressable>
                  ) : (
                    <AppText
                      align={getTextAlignment(column.align, isRTL)}
                      variant="caption"
                      weight="800">
                      {column.header}
                    </AppText>
                  )}
                </View>
              );
            })}
          </View>

          {pageRows.map((row) => (
            <View
              key={getRowKey(row)}
              style={[styles.row, { direction, backgroundColor: theme.colors.surface }]}>
              {columns.map((column) => (
                <View
                  key={column.id}
                  style={[
                    styles.cell,
                    {
                      width: column.width ?? 150,
                      borderColor: theme.colors.border,
                      alignItems: getCellAlignment(column.align, isRTL),
                    },
                  ]}>
                  {column.render(row)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {!pinPagination ? pagination : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden', borderWidth: 1 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'stretch' },
  cell: {
    minHeight: 52,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactHeaderRow: { minHeight: 36 },
  compactHeaderCell: {
    minHeight: 36,
    paddingVertical: 4,
  },
  sortHeader: {
    width: '100%',
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  empty: { minHeight: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pagination: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    gap: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  pinnedPagination: { borderWidth: 1 },
  pageSizes: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 3 },
  pageSizeLabel: { flexShrink: 1 },
  pageSize: { minWidth: 26, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
});

function getTextAlignment(
  align: AppDataTableColumn<unknown>['align'],
  isRTL: boolean,
): 'left' | 'center' | 'right' {
  if (align === 'center') return 'center';
  if (align === 'end') return isRTL ? 'left' : 'right';
  return isRTL ? 'right' : 'left';
}

function getCellAlignment(
  align: AppDataTableColumn<unknown>['align'],
  isRTL: boolean,
): 'flex-start' | 'center' | 'flex-end' {
  if (align === 'center') return 'center';
  if (align === 'end') return isRTL ? 'flex-start' : 'flex-end';
  return isRTL ? 'flex-end' : 'flex-start';
}

function compareSortValues(
  left: AppDataTableSortValue,
  right: AppDataTableSortValue,
  collator: Intl.Collator,
): number {
  const leftEmpty = left === null || left === undefined;
  const rightEmpty = right === null || right === undefined;

  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  const leftValue = left instanceof Date ? left.getTime() : left;
  const rightValue = right instanceof Date ? right.getTime() : right;

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue;
  }

  if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
    return Number(leftValue) - Number(rightValue);
  }

  return collator.compare(String(leftValue), String(rightValue));
}
