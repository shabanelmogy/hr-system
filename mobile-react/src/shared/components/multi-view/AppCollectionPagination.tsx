import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppPaginationNavigation } from '@/src/shared/components/pagination';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppCollectionPaginationProps {
  attached?: boolean;
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function AppCollectionPagination({
  attached = false,
  page,
  pageSize,
  pageSizeOptions = [5, 10, 25],
  totalItems,
  onPageChange,
  onPageSizeChange,
}: AppCollectionPaginationProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <View
      style={[
        styles.root,
        {
          direction,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        attached ? styles.attached : null,
      ]}>
      <View style={[styles.pageSizes, { direction }]}>
        <AppText
          color="muted"
          numberOfLines={1}
          style={styles.pageSizeLabel}
          variant="caption">
          {t('multiView.itemsPerPage')}
        </AppText>
        {pageSizeOptions.map((option) => (
          <Pressable
            accessibilityLabel={t('multiView.usePageSize', { count: option })}
            accessibilityRole="button"
            accessibilityState={{ selected: option === pageSize }}
            key={option}
            onPress={() => onPageSizeChange(option)}
            style={({ pressed }) => [
              styles.pageSize,
              {
                backgroundColor: option === pageSize
                  ? theme.colors.primary
                  : theme.colors.surfaceMuted,
                borderRadius: theme.radius.sm,
                opacity: pressed ? 0.75 : 1,
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

      <AppPaginationNavigation
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    gap: 2,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  attached: {
    marginTop: -1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  pageSizes: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 3 },
  pageSizeLabel: { flexShrink: 1 },
  pageSize: { minWidth: 26, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
});
