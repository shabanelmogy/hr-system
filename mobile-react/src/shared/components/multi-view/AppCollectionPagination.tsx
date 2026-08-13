import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppText } from '@/src/shared/components/typography/AppText';

interface AppCollectionPaginationProps {
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
  const { direction, isRTL } = useLocalization();
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
        <AppText color="muted" variant="caption">
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

      <View style={[styles.pageNavigation, { direction }]}>
        <AppIconButton
          disabled={page === 0}
          icon={isRTL ? 'chevron-forward' : 'chevron-back'}
          label={t('dataTable.previous')}
          onPress={() => onPageChange(Math.max(0, page - 1))}
        />
        <AppText variant="caption" weight="700">
          {t('dataTable.pageOf', { page: page + 1, count: pageCount })}
        </AppText>
        <AppIconButton
          disabled={page >= pageCount - 1}
          icon={isRTL ? 'chevron-back' : 'chevron-forward'}
          label={t('dataTable.next')}
          onPress={() => onPageChange(Math.min(pageCount - 1, page + 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  attached: {
    marginTop: -1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pageSize: { minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  pageNavigation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
