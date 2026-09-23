import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { asHref, ROUTES, type AppRoute } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { canAccessRoute, useAuth } from '@/src/platform/auth';
import { AppCard, AppIcon, AppScreen, AppText, type AppIconName } from '@/src/shared/components';

const sections: readonly { titleKey: string; descriptionKey: string; icon: AppIconName; route: AppRoute }[] = [
  { titleKey: 'fiscalYears.title', descriptionKey: 'ledgerSetup.overview.fiscalYears', icon: 'calendar-outline', route: ROUTES.finance.ledgerSetup.fiscalYears },
  { titleKey: 'currencies.title', descriptionKey: 'ledgerSetup.overview.currencies', icon: 'cash-outline', route: ROUTES.finance.ledgerSetup.currencies },
  { titleKey: 'ledgerSetup.companySettings.title', descriptionKey: 'ledgerSetup.overview.companySettings', icon: 'settings-outline', route: ROUTES.finance.ledgerSetup.accountingSettings },
  { titleKey: 'ledgerSetup.hierarchyLevels.title', descriptionKey: 'ledgerSetup.overview.hierarchyLevels', icon: 'layers-outline', route: ROUTES.finance.ledgerSetup.hierarchyLevels },
  { titleKey: 'ledgerSetup.accounts.title', descriptionKey: 'ledgerSetup.overview.accounts', icon: 'git-branch-outline', route: ROUTES.finance.ledgerSetup.accounts },
  { titleKey: 'ledgerSetup.dimensions.title', descriptionKey: 'ledgerSetup.overview.dimensions', icon: 'options-outline', route: ROUTES.finance.ledgerSetup.dimensions },
  { titleKey: 'ledgerSetup.books.title', descriptionKey: 'ledgerSetup.overview.books', icon: 'book-outline', route: ROUTES.finance.ledgerSetup.books },
  { titleKey: 'ledgerSetup.journals.title', descriptionKey: 'ledgerSetup.overview.journals', icon: 'journal-outline', route: ROUTES.finance.ledgerSetup.journals },
  { titleKey: 'ledgerSetup.exchangeRates.title', descriptionKey: 'ledgerSetup.overview.exchangeRates', icon: 'swap-horizontal-outline', route: ROUTES.finance.ledgerSetup.exchangeRates },
  { titleKey: 'ledgerSetup.accountDetermination.title', descriptionKey: 'ledgerSetup.overview.accountDetermination', icon: 'map-outline', route: ROUTES.finance.ledgerSetup.accountDetermination },
];

export function LedgerSetupOverviewScreen() {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const visibleSections = sections.filter((section) => canAccessRoute(section.route, session));

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <View style={styles.heading}>
        <AppText variant="title">{t('ledgerSetup.title')}</AppText>
        <AppText color="muted" variant="bodySmall">{t('ledgerSetup.description')}</AppText>
      </View>
      <View style={styles.sections}>
        {visibleSections.map((section) => (
          <AppCard accessibilityLabel={t(section.titleKey)} key={section.route} onPress={() => router.push(asHref(section.route))} style={styles.sectionCard}>
            <View style={[styles.sectionRow, { direction }]}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
                <AppIcon color={theme.colors.primary} name={section.icon} size={25} />
              </View>
              <View style={styles.sectionText}>
                <AppText variant="label">{t(section.titleKey)}</AppText>
                <AppText color="muted" variant="bodySmall">{t(section.descriptionKey)}</AppText>
              </View>
              <AppIcon color={theme.colors.textMuted} name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} />
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 4, marginBottom: 24 },
  sections: { gap: 12 },
  sectionCard: { minHeight: 96, justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  sectionText: { flex: 1, gap: 3 },
});
