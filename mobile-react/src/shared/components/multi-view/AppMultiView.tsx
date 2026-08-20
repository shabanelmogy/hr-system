import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppCarousel } from '@/src/shared/components/carousel/AppCarousel';
import { AppSegmentedControl } from '@/src/shared/components/controls/AppSegmentedControl';
import type { AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppScreenFooterContext } from '@/src/shared/components/layout/AppScreenFooterContext';
import { AppText } from '@/src/shared/components/typography/AppText';
import { AppCollectionPagination } from './AppCollectionPagination';
import { shouldPinPagination } from './paginationPlacement';

export interface AppMultiViewDefinition<Item, ViewId extends string> {
  carousel?: boolean;
  defaultPageSize?: number;
  getItemKey?: (item: Item, index: number) => string | number;
  icon: AppIconName;
  label: string;
  paginate?: boolean;
  pageSizeOptions?: readonly number[];
  render: (items: readonly Item[]) => ReactNode;
  scrollable?: boolean;
  value: ViewId;
}

export interface AppMultiViewProps<Item, ViewId extends string> {
  items: readonly Item[];
  views: readonly AppMultiViewDefinition<Item, ViewId>[];
  defaultPageSize?: number;
  defaultView?: ViewId;
  emptyContent?: ReactNode;
  pageSizeOptions?: readonly number[];
  resetKey?: string | number;
  toolbarContent?: ReactNode;
  compactToolbar?: boolean;
  showViewLabels?: boolean;
  isFetching?: boolean;
  serverPagination?: AppMultiViewServerPagination;
}

export interface AppMultiViewServerPagination {
  /** Zero-based page used by the UI. */
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const carouselPageSizeOptions = [1] as const;

export function AppMultiView<Item, ViewId extends string>({
  items,
  views,
  defaultPageSize = 5,
  defaultView,
  emptyContent,
  pageSizeOptions = [5, 10, 25],
  resetKey,
  toolbarContent,
  compactToolbar = true,
  showViewLabels = false,
  isFetching = false,
  serverPagination,
}: AppMultiViewProps<Item, ViewId>) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const footerHost = useContext(AppScreenFooterContext);
  const footerOwner = useRef(Symbol('AppMultiView pagination'));
  const previousResetKey = useRef(resetKey);
  const initialView = defaultView ?? views[0]?.value;
  const initialDefinition = views.find((candidate) => candidate.value === initialView) ?? views[0];
  const [view, setView] = useState<ViewId | undefined>(initialView);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(
    initialDefinition?.carousel ? 1 : initialDefinition?.defaultPageSize ?? defaultPageSize,
  );
  const activeView = views.find((candidate) => candidate.value === view) ?? views[0];
  const serverPage = serverPagination?.page ?? 0;
  const serverPageSize = serverPagination?.pageSize ?? pageSize;
  const serverTotalItems = serverPagination?.totalItems ?? 0;
  const onServerPageChange = serverPagination?.onPageChange;
  const onServerPageSizeChange = serverPagination?.onPageSizeChange;
  const usesCollectionPagination = activeView?.carousel || activeView?.paginate !== false;
  const usesServerPagination = Boolean(serverPagination) && !activeView?.carousel;
  const activePage = usesServerPagination ? serverPage : page;
  const activePageSize = activeView?.carousel
    ? 1
    : usesServerPagination
      ? serverPageSize
      : pageSize;
  const totalItems = usesServerPagination ? serverTotalItems : items.length;
  const pageCount = usesCollectionPagination
    ? Math.max(1, Math.ceil(totalItems / activePageSize))
    : 1;
  const safePage = Math.min(activePage, pageCount - 1);
  const activePageSizeOptions = activeView?.carousel
    ? carouselPageSizeOptions
    : serverPagination?.pageSizeOptions ?? activeView?.pageSizeOptions ?? pageSizeOptions;
  const pageSizeOptionsKey = activePageSizeOptions.join(',');
  const stablePageSizeOptions = useMemo(
    () => pageSizeOptionsKey.split(',').filter(Boolean).map(Number),
    [pageSizeOptionsKey],
  );
  const pageItems = useMemo(
    () => usesCollectionPagination && !usesServerPagination
      ? items.slice(
        safePage * activePageSize,
        safePage * activePageSize + activePageSize,
      )
      : items,
    [activePageSize, items, safePage, usesCollectionPagination, usesServerPagination],
  );
  const paginationItemCount = pageItems.length;
  const pinPagination = !activeView?.carousel
    && Boolean(usesCollectionPagination)
    && shouldPinPagination(
      paginationItemCount,
      Boolean(footerHost),
    );

  useEffect(() => {
    if (activePage === safePage) return;
    if (usesServerPagination) {
      onServerPageChange?.(safePage);
    } else {
      setPage(safePage);
    }
  }, [activePage, onServerPageChange, safePage, usesServerPagination]);

  useEffect(() => {
    if (Object.is(previousResetKey.current, resetKey)) return;
    previousResetKey.current = resetKey;
    if (usesServerPagination) {
      onServerPageChange?.(0);
    } else {
      setPage(0);
    }
  }, [onServerPageChange, resetKey, usesServerPagination]);

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    if (usesServerPagination) {
      onServerPageSizeChange?.(nextPageSize);
      return;
    }
    setPageSize(nextPageSize);
    setPage(0);
  }, [onServerPageSizeChange, usesServerPagination]);

  const handlePageChange = useCallback((nextPage: number) => {
    if (usesServerPagination) {
      onServerPageChange?.(nextPage);
      return;
    }
    setPage(nextPage);
  }, [onServerPageChange, usesServerPagination]);

  const pagination = useMemo(
    () => usesCollectionPagination && totalItems > 0 ? (
      <AppCollectionPagination
        attached={Boolean(activeView?.carousel) && !pinPagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        page={safePage}
        pageSize={activePageSize}
        pageSizeOptions={stablePageSizeOptions}
        totalItems={totalItems}
      />
    ) : null,
    [
      activePageSize,
      activeView?.carousel,
      handlePageSizeChange,
      handlePageChange,
      pinPagination,
      safePage,
      stablePageSizeOptions,
      totalItems,
      usesCollectionPagination,
    ],
  );

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

  if (!activeView) return emptyContent ?? null;

  const content = items.length === 0
    ? emptyContent
    : activeView.carousel
      ? (
        <AppCarousel
          items={items}
          keyExtractor={(item, index) => String(activeView.getItemKey?.(item, index) ?? index)}
          onIndexChange={setPage}
          renderItem={(item) => activeView.render([item])}
          selectedIndex={safePage}
        />
      )
      : activeView.render(pageItems);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.toolbar,
          compactToolbar && styles.compactToolbar,
          {
            direction,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}>
        {toolbarContent ? (
          <View style={styles.toolbarContent}>{toolbarContent}</View>
        ) : (
          <View style={styles.resultCount}>
            <AppText variant="label" weight="800">{totalItems}</AppText>
            <AppText color="muted" variant="caption">
              {t('multiView.results')}
            </AppText>
          </View>
        )}
        <AppSegmentedControl
          containerStyle={[
            styles.viewOptions,
            compactToolbar && styles.compactViewOptions,
          ]}
          label={t('multiView.chooseView')}
          layout="wrap"
          onChange={(nextView) => {
            const nextDefinition = views.find((candidate) => candidate.value === nextView);
            setView(nextView);
            if (onServerPageChange && !nextDefinition?.carousel) {
              onServerPageChange(0);
            } else {
              setPage(0);
            }
            setPageSize(
              nextDefinition?.carousel ? 1 : nextDefinition?.defaultPageSize ?? defaultPageSize,
            );
          }}
          options={views}
          showOptionLabels={showViewLabels}
          style={[styles.viewSelector, compactToolbar && styles.compactViewSelector]}
          value={activeView.value}
        />
      </View>

      <View
        style={[
          styles.collection,
          activeView.carousel && !pinPagination && styles.attachedCollection,
        ]}>
        {activeView.scrollable && !activeView.carousel && items.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            directionalLockEnabled
            nestedScrollEnabled
            showsVerticalScrollIndicator
            style={{ maxHeight: Math.max(360, Math.min(viewportHeight * 0.68, 680)) }}>
            {content}
          </ScrollView>
        ) : content}

        {!pinPagination ? pagination : null}

        {isFetching ? (
          <View
            accessibilityLabel={t('common.loading')}
            accessibilityLiveRegion="polite"
            pointerEvents="none"
            style={styles.fetchingIndicator}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: 10 },
  collection: { width: '100%', gap: 4, position: 'relative' },
  attachedCollection: { gap: 0 },
  toolbar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    padding: 8,
  },
  compactToolbar: {
    minHeight: 58,
    padding: 4,
  },
  toolbarContent: { flex: 1, minWidth: 0 },
  resultCount: { flexDirection: 'row', alignItems: 'baseline', gap: 5, paddingHorizontal: 6 },
  viewSelector: { width: 'auto', flexGrow: 0, paddingTop: 7 },
  viewOptions: { width: 'auto', height: 54 },
  compactViewSelector: { paddingTop: 6 },
  compactViewOptions: { height: 50 },
  scrollContent: { width: '100%', paddingBottom: 2 },
  fetchingIndicator: {
    position: 'absolute',
    top: 8,
    end: 8,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
