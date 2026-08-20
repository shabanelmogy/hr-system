import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import type { Country } from '../types/country';
import { AppCard, AppIcon, AppIconButton, AppStatusBadge, AppText } from '@/src/shared/components';

interface CountryCardProps {
  country: Country;
  canEdit: boolean;
  canDelete: boolean;
  selected: boolean;
  onEdit: (country: Country) => void;
  onArchive: (country: Country) => void;
  onRestore: (country: Country) => void;
  onView: (country: Country) => void;
  onToggleSelection: (country: Country) => void;
}

export function CountryCard({ country, canEdit, canDelete, selected, onEdit, onArchive, onRestore, onView, onToggleSelection }: CountryCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const archived = country.isDeleted;
  return (
    <AppCard padding="sm" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
          <AppIcon color={theme.colors.primary} name="flag-outline" size={21} />
        </View>
        <View style={styles.name}>
          <AppText numberOfLines={1} variant="label">{country.nameEn}</AppText>
          <AppText color="muted" numberOfLines={1} variant="bodySmall">{country.nameAr}</AppText>
        </View>
        <AppStatusBadge color={archived ? theme.colors.warning : theme.colors.success} label={t(archived ? 'countries.archived' : 'countries.active')} />
      </View>
      <View style={styles.details}>
        <AppText color="muted" variant="caption">{t('countries.codesValue', { alpha2: country.alpha2Code ?? '—', alpha3: country.alpha3Code ?? '—' })}</AppText>
        <AppText color="muted" variant="caption">{t('countries.statesCount', { count: country.statesCount })}</AppText>
      </View>
      <View style={styles.actions}>
        {canDelete && !archived ? <AppIconButton icon={selected ? 'checkbox' : 'square-outline'} label={t('countries.selectCountry', { name: country.nameEn })} onPress={() => onToggleSelection(country)} /> : null}
        <AppIconButton icon="eye-outline" label={t('countries.viewCountry')} onPress={() => onView(country)} />
        {canEdit && !archived ? <AppIconButton icon="create-outline" label={t('countries.editCountry')} onPress={() => onEdit(country)} /> : null}
        {canDelete ? <AppIconButton icon={archived ? 'refresh-outline' : 'archive-outline'} label={t(archived ? 'countries.restore' : 'countries.archive')} onPress={() => archived ? onRestore(country) : onArchive(country)} /> : null}
      </View>
    </AppCard>
  );
}
const styles = StyleSheet.create({
  card: { gap: 5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, minWidth: 0, gap: 1 },
  details: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});
