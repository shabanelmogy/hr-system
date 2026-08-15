import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppText } from '@/src/shared/components/typography/AppText';

interface AppPaginationNavigationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function AppPaginationNavigation({
  page,
  pageCount,
  onPageChange,
}: AppPaginationNavigationProps) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const lastPage = Math.max(0, pageCount - 1);
  const safePage = Math.min(Math.max(0, page), lastPage);
  const isFirstPage = safePage === 0;
  const isLastPage = safePage === lastPage;

  return (
    <View style={[styles.root, { direction }]}>
      <AppIconButton
        disabled={isFirstPage}
        icon={isRTL ? 'play-skip-forward-outline' : 'play-skip-back-outline'}
        label={t('dataTable.first')}
        onPress={() => onPageChange(0)}
        size={19}
        style={styles.button}
      />
      <AppIconButton
        disabled={isFirstPage}
        icon={isRTL ? 'chevron-forward' : 'chevron-back'}
        label={t('dataTable.previous')}
        onPress={() => onPageChange(Math.max(0, safePage - 1))}
        size={19}
        style={styles.button}
      />
      <AppText
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        style={styles.pageLabel}
        variant="caption"
        weight="700">
        {t('dataTable.pageOf', { page: safePage + 1, count: Math.max(1, pageCount) })}
      </AppText>
      <AppIconButton
        disabled={isLastPage}
        icon={isRTL ? 'chevron-back' : 'chevron-forward'}
        label={t('dataTable.next')}
        onPress={() => onPageChange(Math.min(lastPage, safePage + 1))}
        size={19}
        style={styles.button}
      />
      <AppIconButton
        disabled={isLastPage}
        icon={isRTL ? 'play-skip-back-outline' : 'play-skip-forward-outline'}
        label={t('dataTable.last')}
        onPress={() => onPageChange(lastPage)}
        size={19}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  button: { width: 28, height: 32 },
  pageLabel: { width: 76, paddingHorizontal: 2, textAlign: 'center' },
});
