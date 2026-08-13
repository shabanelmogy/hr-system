import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

export type AppDataTableSortValue = string | number | boolean | Date | null | undefined;

export interface AppDataTableColumn<Row> {
  id: string;
  header: string;
  width?: number;
  align?: 'start' | 'center' | 'end';
  render: (row: Row) => ReactNode;
  sortValue?: (row: Row) => AppDataTableSortValue;
}

type SortDirection = 'ascending' | 'descending';

interface SortState {
  columnId: string;
  direction: SortDirection;
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
}: AppDataTableProps<Row>) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState<SortState | null>(null);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  const collator = useMemo(
    () => new Intl.Collator(i18n.language, { numeric: true, sensitivity: 'base' }),
    [i18n.language],
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    const column = columns.find((candidate) => candidate.id === sort.columnId);
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
        return sort.direction === 'ascending' ? comparison : -comparison;
      })
      .map(({ row }) => row);
  }, [collator, columns, rows, sort]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const pageRows = useMemo(
    () => showPagination
      ? sortedRows.slice(page * pageSize, page * pageSize + pageSize)
      : sortedRows,
    [page, pageSize, showPagination, sortedRows],
  );
  const tableWidth = columns.reduce((total, column) => total + (column.width ?? 150), 0);

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
              const sortable = Boolean(column.sortValue);
              const activeDirection = sort?.columnId === column.id ? sort.direction : null;
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
                        setSort(nextDirection ? { columnId: column.id, direction: nextDirection } : null);
                        setPage(0);
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

      {showPagination ? (
        <View style={[styles.pagination, { direction, borderColor: theme.colors.border }]}>
          <View style={[styles.pageSizes, { direction }]}>
            <AppText color="muted" variant="caption">{t('dataTable.rowsPerPage')}</AppText>
            {pageSizeOptions.map((option) => (
              <Pressable
                accessibilityLabel={t('dataTable.usePageSize', { count: option })}
                accessibilityRole="button"
                accessibilityState={{ selected: option === pageSize }}
                key={option}
                onPress={() => {
                  setPageSize(option);
                  setPage(0);
                }}
                style={[
                  styles.pageSize,
                  {
                    backgroundColor: option === pageSize
                      ? theme.colors.primary
                      : theme.colors.surfaceMuted,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppText
                  style={{ color: option === pageSize ? theme.colors.onPrimary : theme.colors.text }}
                  variant="caption"
                  weight="700">
                  {option}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={[styles.pageNavigation, { direction }]}>
            <AppIconButton
              disabled={page === 0}
              icon={isRTL ? 'chevron-forward' : 'chevron-back'}
              label={t('dataTable.previous')}
              onPress={() => setPage((current) => Math.max(0, current - 1))}
            />
            <AppText variant="caption" weight="700">
              {t('dataTable.pageOf', { page: page + 1, count: pageCount })}
            </AppText>
            <AppIconButton
              disabled={page >= pageCount - 1}
              icon={isRTL ? 'chevron-back' : 'chevron-forward'}
              label={t('dataTable.next')}
              onPress={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            />
          </View>
        </View>
      ) : null}
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
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pageSize: { minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  pageNavigation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
