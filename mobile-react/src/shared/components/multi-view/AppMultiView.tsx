import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppCarousel } from '@/src/shared/components/carousel/AppCarousel';
import { AppSegmentedControl } from '@/src/shared/components/controls/AppSegmentedControl';
import type { AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppScreenFooterContext } from '@/src/shared/components/layout/AppScreenFooterContext';
import { AppText } from '@/src/shared/components/typography/AppText';
import { AppCollectionPagination } from './AppCollectionPagination';

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
}: AppMultiViewProps<Item, ViewId>) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const footerHost = useContext(AppScreenFooterContext);
  const footerOwner = useRef(Symbol('AppMultiView pagination'));
  const initialView = defaultView ?? views[0]?.value;
  const initialDefinition = views.find((candidate) => candidate.value === initialView) ?? views[0];
  const [view, setView] = useState<ViewId | undefined>(initialView);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(
    initialDefinition?.carousel ? 1 : initialDefinition?.defaultPageSize ?? defaultPageSize,
  );
  const activeView = views.find((candidate) => candidate.value === view) ?? views[0];
  const usesCollectionPagination = activeView?.carousel || activeView?.paginate !== false;
  const activePageSize = activeView?.carousel ? 1 : pageSize;
  const pageCount = usesCollectionPagination
    ? Math.max(1, Math.ceil(items.length / activePageSize))
    : 1;
  const safePage = Math.min(page, pageCount - 1);
  const activePageSizeOptions = activeView?.carousel
    ? carouselPageSizeOptions
    : activeView?.pageSizeOptions ?? pageSizeOptions;
  const pageSizeOptionsKey = activePageSizeOptions.join(',');
  const stablePageSizeOptions = useMemo(
    () => pageSizeOptionsKey.split(',').filter(Boolean).map(Number),
    [pageSizeOptionsKey],
  );
  const pageItems = useMemo(
    () => usesCollectionPagination
      ? items.slice(
        safePage * activePageSize,
        safePage * activePageSize + activePageSize,
      )
      : items,
    [activePageSize, items, safePage, usesCollectionPagination],
  );

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(0);
  }, []);

  const pagination = useMemo(
    () => usesCollectionPagination && items.length > 0 ? (
      <AppCollectionPagination
        attached={!footerHost && Boolean(activeView?.carousel)}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        page={safePage}
        pageSize={activePageSize}
        pageSizeOptions={stablePageSizeOptions}
        totalItems={items.length}
      />
    ) : null,
    [
      activePageSize,
      activeView?.carousel,
      footerHost,
      handlePageSizeChange,
      items.length,
      safePage,
      stablePageSizeOptions,
      usesCollectionPagination,
    ],
  );

  useEffect(() => {
    if (!footerHost) return;

    const owner = footerOwner.current;
    if (!activeView?.carousel) {
      footerHost.unregisterFooter(owner);
      return;
    }

    footerHost.registerFooter(owner, pagination);
    return () => footerHost.unregisterFooter(owner);
  }, [activeView?.carousel, footerHost, pagination]);

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
            <AppText variant="label" weight="800">{items.length}</AppText>
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
            setPage(0);
            setPageSize(
              nextDefinition?.carousel ? 1 : nextDefinition?.defaultPageSize ?? defaultPageSize,
            );
          }}
          options={views}
          showOptionLabels={false}
          style={[styles.viewSelector, compactToolbar && styles.compactViewSelector]}
          value={activeView.value}
        />
      </View>

      <View
        style={[
          styles.collection,
          activeView.carousel && !footerHost && styles.attachedCollection,
        ]}>
        {activeView.scrollable && items.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            directionalLockEnabled
            nestedScrollEnabled
            showsVerticalScrollIndicator
            style={{ maxHeight: Math.max(360, Math.min(viewportHeight * 0.68, 680)) }}>
            {content}
          </ScrollView>
        ) : content}

        {!footerHost || !activeView.carousel ? pagination : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: 10 },
  collection: { width: '100%', gap: 4 },
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
});
