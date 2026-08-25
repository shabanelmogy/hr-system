import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { spacing, useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppIcon,
  AppText,
} from '@/src/shared/components';
import type { CompanyCountryOption } from '../types/company-geographic-scope';

interface CompanyGeographicScopeCardProps {
  country: CompanyCountryOption;
  isDefault: boolean;
}

export function CompanyGeographicScopeCard({
  country,
  isDefault,
}: CompanyGeographicScopeCardProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const codes = [country.alpha2Code, country.alpha3Code].filter(Boolean).join(' · ') || '—';

  return (
    <AppCard padding="sm" style={styles.card}>
      <View style={[styles.header, { direction }]}>
        <View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
          <AppIcon color={theme.colors.primary} name="flag-outline" size={21} />
        </View>
        <View style={styles.names}>
          <AppText numberOfLines={1} variant="label">{country.nameEn}</AppText>
          <AppText color="muted" numberOfLines={1} variant="bodySmall">{country.nameAr}</AppText>
        </View>
      </View>

      <View style={[styles.details, { direction }]}>
        <AppText color="muted" variant="caption">
          {t('companyGeographicScope.codes')}: {codes}
        </AppText>
        {isDefault ? (
          <AppText color="muted" variant="caption">
            {t('companyGeographicScope.defaultColumn')}
          </AppText>
        ) : null}
      </View>

    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  names: { flex: 1, minWidth: 0, gap: spacing.xs },
  details: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
});
