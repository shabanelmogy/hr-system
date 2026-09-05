import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppScreenFooterContext } from '@/src/shared/components/layout/AppScreenFooterContext';
import { shouldPinPagination } from '@/src/shared/components/multi-view/paginationPlacement';
import { AppPaginationNavigation } from '@/src/shared/components/pagination';
import { AppText } from '@/src/shared/components/typography/AppText';
import {
  toggleDataTableRowSelection,
  type AppDataTableRowKey,
} from './rowSelection';

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

export interface AppDataTableRowSelection<Row> {
  selectedRowKeys: readonly AppDataTableRowKey[];
  onSelectionChange: (selectedRowKeys: AppDataTableRowKey[]) => void;
  header: string;
  getAccessibilityLabel: (row: Row, selected: boolean) => string;
  /** Optionally prevents selecting rows that cannot participate in a bulk action. */
  isRowSelectable?: (row: Row) => boolean;
  disabled?: boolean;
  columnWidth?: number;
}

export interface AppDataTableFlash {
  /** Key of the row to highlight after a successful update. */
  rowKey: AppDataTableRowKey;
  /** Change this value for every update, including repeated edits to the same row. */
  token: string | number;
  durationMs?: number;
}

export interface AppDataTableProps<Row> {
  rows: readonly Row[];
  columns: readonly AppDataTableColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  /** Automatically highlights the first visible row as the active record. */
  autoActivateFirstRow?: boolean;
  /** Called when a row becomes active by touch. */
  onRowPress?: (row: Row) => void;
  /** Called when a row is double pressed by touch. */
  onRowDoublePress?: (row: Row) => void;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  emptyMessage?: string;
  showPagination?: boolean;
  compactHeader?: boolean;
  resetKey?: string | number;
  /** Optional controlled multi-row selection rendered as the first table column. */
  rowSelection?: AppDataTableRowSelection<Row>;
  /** Optional transient success highlight for a row that was just updated. */
  flash?: AppDataTableFlash;
  /** Controlled list state. Rows are treated as one server page and are not sorted or sliced locally. */
  serverState?: AppDataTableServerState;
}

export function AppDataTable<Row>({
  rows,
  columns,
  getRowKey,
  autoActivateFirstRow = true,
  onRowPress,
  onRowDoublePress,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25],
  emptyMessage,
  showPagination = true,
  compactHeader = true,
  resetKey,
  rowSelection,
  flash,
  serverState,
}: AppDataTableProps<Row>) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const footerHost = useContext(AppScreenFooterContext);
  const footerOwner = useRef(Symbol('AppDataTable pagination'));
  const previousResetKey = useRef(resetKey);
  const previousFlash = useRef<{ rowKey: AppDataTableRowKey; token: string | number } | undefined>(undefined);
  const hasMountedRef = useRef(false);
  const lastRowPressRef = useRef<{ rowKey: AppDataTableRowKey; time: number } | null>(null);
  const [flashProgress] = useState(() => new Animated.Value(0));
  const [activeRowKey, setActiveRowKey] = useState<AppDataTableRowKey | null>(null);
  const [activeFlashRowKey, setActiveFlashRowKey] = useState<AppDataTableRowKey | null>(null);
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
  const selectedRowKeys = rowSelection?.selectedRowKeys;
  const flashRowKey = flash?.rowKey;
  const flashToken = flash?.token;
  const flashDurationMs = flash?.durationMs;
  const selectedRowKeySet = useMemo(
    () => new Set(selectedRowKeys ?? []),
    [selectedRowKeys],
  );

  useEffect(() => {
    // A view can be mounted with an already-existing flash state when the
    // user switches between Grid and Cards. Mark it as seen without replaying
    // the animation; only a later token change represents a new edit.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (flashRowKey !== undefined && flashToken !== undefined) {
        previousFlash.current = { rowKey: flashRowKey, token: flashToken };
      }
      return;
    }
    if (flashRowKey === undefined || flashToken === undefined) return;
    const isSameFlash = previousFlash.current
      && previousFlash.current.rowKey === flashRowKey
      && Object.is(previousFlash.current.token, flashToken);
    if (isSameFlash) return;

    previousFlash.current = { rowKey: flashRowKey, token: flashToken };
    setActiveRowKey(flashRowKey);
    setActiveFlashRowKey(flashRowKey);
    const duration = flashDurationMs ?? 1400;
    const animation = Animated.sequence([
      Animated.timing(flashProgress, { duration: Math.round(duration * 0.28), toValue: 1, useNativeDriver: false }),
      Animated.timing(flashProgress, { duration: Math.round(duration * 0.72), toValue: 0, useNativeDriver: false }),
    ]);
    flashProgress.stopAnimation();
    flashProgress.setValue(0);
    animation.start(({ finished }) => {
      if (finished) setActiveFlashRowKey((current) => current === flashRowKey ? null : current);
    });

    return () => animation.stop();
  }, [flashDurationMs, flashProgress, flashRowKey, flashToken]);

  const resolvedColumns = useMemo<AppDataTableColumn<Row>[]>(() => {
    if (!rowSelection) return [...columns];

    return [
      {
        id: '__rowSelection',
        header: rowSelection.header,
        width: rowSelection.columnWidth ?? 76,
        align: 'center',
        render: (row) => {
          const rowKey = getRowKey(row);
          const selected = selectedRowKeySet.has(rowKey);
          const selectable = rowSelection.isRowSelectable?.(row) ?? true;

          return (
            <AppIconButton
              accessibilityState={{ selected }}
              color={selected ? theme.colors.primary : undefined}
              disabled={rowSelection.disabled || !selectable}
              icon={selected ? 'checkbox' : 'square-outline'}
              label={rowSelection.getAccessibilityLabel(row, selected)}
              onPress={() => {
                if (!selectable) return;
                rowSelection.onSelectionChange(
                  toggleDataTableRowSelection(rowSelection.selectedRowKeys, rowKey),
                );
              }}
            />
          );
        },
      },
      ...columns,
    ];
  }, [columns, getRowKey, rowSelection, selectedRowKeySet, theme.colors.primary]);

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
      return;
    }
    const timer = setTimeout(() => setPage(safePage), 0);
    return () => clearTimeout(timer);
  }, [activePage, onServerPageChange, pageCount, usesServerState]);

  useEffect(() => {
    if (Object.is(previousResetKey.current, resetKey)) return;
    previousResetKey.current = resetKey;
    if (usesServerState) {
      onServerPageChange?.(0);
      return;
    }
    const timer = setTimeout(() => setPage(0), 0);
    return () => clearTimeout(timer);
  }, [onServerPageChange, resetKey, usesServerState]);

  const pageRows = useMemo(
    () => showPagination && !usesServerState
      ? sortedRows.slice(activePage * activePageSize, activePage * activePageSize + activePageSize)
      : sortedRows,
    [activePage, activePageSize, showPagination, sortedRows, usesServerState],
  );

  useEffect(() => {
    let nextActiveRowKey: AppDataTableRowKey | null = null;
    if (!autoActivateFirstRow) {
      nextActiveRowKey = null;
    } else {
      const firstRow = pageRows[0];
      const activeIsVisible = activeRowKey !== null
        && pageRows.some((row) => getRowKey(row) === activeRowKey);
      nextActiveRowKey = activeIsVisible ? activeRowKey : firstRow ? getRowKey(firstRow) : null;
    }
    if (Object.is(nextActiveRowKey, activeRowKey)) return;
    const timer = setTimeout(() => setActiveRowKey(nextActiveRowKey), 0);
    return () => clearTimeout(timer);
  }, [activeRowKey, autoActivateFirstRow, getRowKey, pageRows]);

  const pinPagination = showPagination && shouldPinPagination(
    pageRows.length,
    Boolean(footerHost),
  );
  const tableWidth = resolvedColumns.reduce(
    (total, column) => total + (column.width ?? 150),
    0,
  );
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
            {resolvedColumns.map((column) => {
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

          {pageRows.map((row) => {
            const rowKey = getRowKey(row);
            const isActive = activeRowKey !== null && activeRowKey === rowKey;
            const isSelected = selectedRowKeySet.has(rowKey);
            const isFlashed = activeFlashRowKey !== null && activeFlashRowKey === rowKey;
            const flashBackground = flashProgress.interpolate({
              inputRange: [0, 0.35, 0.7, 1],
              outputRange: [theme.colors.surface, toRgba(theme.colors.success, 0.16), toRgba(theme.colors.success, 0.3), theme.colors.surface],
            });

            return (
            <Animated.View
              key={rowKey}
              style={[
                styles.row,
                {
                  direction,
                  backgroundColor: isFlashed
                    ? flashBackground
                    : isSelected
                      ? toRgba(theme.colors.primary, 0.18)
                      : isActive
                        ? toRgba(theme.colors.primary, 0.1)
                      : theme.colors.surface,
                  borderStartColor: theme.colors.primary,
                  borderStartWidth: isSelected || isActive ? 3 : 0,
                },
              ]}>
              <Pressable
                onPress={() => {
                  const now = Date.now();
                  if (
                    lastRowPressRef.current &&
                    lastRowPressRef.current.rowKey === rowKey &&
                    now - lastRowPressRef.current.time < 350
                  ) {
                    lastRowPressRef.current = null;
                    onRowDoublePress?.(row);
                  } else {
                    lastRowPressRef.current = { rowKey, time: now };
                    setActiveRowKey(rowKey);
                    onRowPress?.(row);
                  }
                }}
                style={styles.rowPressable}>
                {resolvedColumns.map((column) => (
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
              </Pressable>
            </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {!pinPagination ? pagination : null}
    </View>
  );
}

function toRgba(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split('').map((value) => Number.parseInt(`${value}${value}`, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const value = Number.parseInt(hex, 16);
    return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden', borderWidth: 1 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'stretch' },
  rowPressable: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
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
