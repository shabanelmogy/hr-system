import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppFilterButton, type AppFilterButtonProps, type AppFilterOption } from '@/src/shared/components/controls/AppFilterButton';
import { AppTextField } from '@/src/shared/components/controls/AppTextField';
import { AppMultiView, type AppMultiViewDefinition } from './AppMultiView';

export interface AppListScreenFilterConfig<FilterValue extends string | number> {
  /** Options shown in the filter modal */
  options: readonly AppFilterOption<FilterValue>[];
  /** Currently selected filter values (controlled) */
  values: FilterValue[];
  /** Called when the user applies new filter selections */
  onChange: (values: FilterValue[]) => void;
  /** Title for the filter modal */
  modalTitle: string;
  /** Optional description shown below modal title */
  description?: string;
  /** Optional label override for the Apply button */
  applyLabel?: string;
  /** Optional label override for the Clear button */
  clearLabel?: string;
  /** Icon override for the filter button */
  icon?: AppFilterButtonProps<FilterValue>['icon'];
}

export interface AppListScreenProps<Item, ViewId extends string, FilterValue extends string | number = string> {
  /** All items to display (after external data fetching) */
  items: readonly Item[];
  /** View definitions passed to AppMultiView */
  views: readonly AppMultiViewDefinition<Item, ViewId>[];
  /** Default view to show on initial render */
  defaultView?: ViewId;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Client-side search function. Receives all items + the current search term. Return filtered items. */
  onSearch?: (items: readonly Item[], searchTerm: string) => readonly Item[];
  /** Filter configuration. Omit to hide the filter button. */
  filter?: AppListScreenFilterConfig<FilterValue>;
  /** Content to show when the item list is empty */
  emptyContent?: ReactNode;
  /** Default page size for pagination */
  defaultPageSize?: number;
  /** Page size options */
  pageSizeOptions?: readonly number[];
  /** Whether to show labels next to view icons */
  showViewLabels?: boolean;
  /** Additional content rendered between search row and views (e.g. stats) */
  aboveViews?: ReactNode;
  /** Additional content rendered below the views */
  belowViews?: ReactNode;
  /** Whether to use compact toolbar style on AppMultiView */
  compactToolbar?: boolean;
}

/**
 * Unified list screen layout for the mobile app.
 *
 * Layout:
 * - Row 1: Search input + optional Filter button
 * - Row 2: Multi-view switcher (table/cards/grouped/etc.) with pagination
 *
 * This component owns the search state internally and applies client-side
 * filtering via the `onSearch` callback. External (server-side) filtering
 * can be done by passing pre-filtered `items` and omitting `onSearch`.
 */
export function AppListScreen<Item, ViewId extends string, FilterValue extends string | number = string>({
  items,
  views,
  defaultView,
  searchPlaceholder,
  onSearch,
  filter,
  emptyContent,
  defaultPageSize,
  pageSizeOptions,
  showViewLabels = false,
  aboveViews,
  belowViews,
  compactToolbar = true,
}: AppListScreenProps<Item, ViewId, FilterValue>) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const [search, setSearch] = useState('');

  const searchedItems = useMemo(() => {
    if (!onSearch || !search.trim()) return items;
    return onSearch(items, search);
  }, [items, onSearch, search]);

  const filteredItems = useMemo(() => {
    if (!filter || filter.values.length === 0) return searchedItems;
    // When filter is active but no custom filter function is provided,
    // we pass through all items — external callers handle filtering
    // by providing pre-filtered `items` or using `onSearch` to include filter logic.
    return searchedItems;
  }, [filter, searchedItems]);

  const resetKey = useMemo(
    () => `${search}|${filter?.values.join(',') ?? ''}`,
    [filter?.values, search],
  );

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const filterButtonLabel = filter
    ? filter.values.length > 0
      ? t('listScreen.filterActive', { count: filter.values.length })
      : t('listScreen.filter')
    : '';

  return (
    <View style={styles.root}>
      {/* Row 1: Search + Filter */}
      <View style={[styles.searchRow, { direction }]}>
        <View style={styles.searchField}>
          <AppTextField
            compact
            label={searchPlaceholder ?? t('listScreen.search')}
            leadingIcon="search-outline"
            onChangeText={setSearch}
            onClear={handleClearSearch}
            showClearButton
            value={search}
          />
        </View>
        {filter ? (
          <AppFilterButton
            applyLabel={filter.applyLabel}
            buttonLabel={filterButtonLabel}
            clearLabel={filter.clearLabel}
            description={filter.description}
            icon={filter.icon}
            modalTitle={filter.modalTitle}
            onChange={filter.onChange}
            options={filter.options}
            values={filter.values}
          />
        ) : null}
      </View>

      {/* Optional content above views (stats, alerts, etc.) */}
      {aboveViews}

      {/* Row 2: Multi-view with view-switcher + pagination */}
      <AppMultiView
        compactToolbar={compactToolbar}
        defaultPageSize={defaultPageSize}
        defaultView={defaultView}
        emptyContent={emptyContent}
        items={filteredItems as Item[]}
        pageSizeOptions={pageSizeOptions}
        resetKey={resetKey}
        showViewLabels={showViewLabels}
        views={views}
      />

      {/* Optional content below views */}
      {belowViews}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
});
