import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { formatPlatformDate } from '@/src/platform/tools/utils/platform-tool-utils';
import { AppCard, AppIcon, AppText } from '@/src/shared/components';

import type { AuditTrailItem } from '../../domain/models/audit-trail';
import { AuditActionBadge } from './AuditActionBadge';
import { entityLabel, moduleLabel } from './audit-trail-format';

interface AuditTrailEntryCardProps {
  item: AuditTrailItem;
  onPress: (item: AuditTrailItem) => void;
  showRecord?: boolean;
}

/** One action; pressing it opens the field-by-field details. */
export function AuditTrailEntryCard({ item, onPress, showRecord = true }: AuditTrailEntryCardProps) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard
      accessibilityRole="button"
      onPress={() => onPress(item)}
      padding="md"
      style={styles.card}
      variant="elevated">
      <View style={[styles.header, { direction }]}>
        <AuditActionBadge action={item.action} />
        <AppText color="muted" variant="caption">{formatPlatformDate(item.occurredOn, i18n.language)}</AppText>
      </View>
      {showRecord ? (
        <View style={styles.record}>
          <AppText numberOfLines={2} variant="titleSmall">
            {entityLabel(t, item.entityName)}
            {item.entityDisplay ? ` — ${item.entityDisplay}` : ''}
          </AppText>
          <AppText color="muted" variant="caption">
            {`${moduleLabel(t, item.moduleCode)} · #${item.entityKey}`}
          </AppText>
        </View>
      ) : null}
      <View style={[styles.footer, { direction }]}>
        <View style={[styles.meta, { direction }]}>
          <AppIcon color={theme.colors.textMuted} name="person-outline" size={16} />
          <AppText color="muted" numberOfLines={1} variant="bodySmall">
            {item.userName ?? item.userId ?? t('auditLog.system')}
          </AppText>
        </View>
        <AppText color="muted" variant="caption">{t('auditLog.fieldCount', { count: item.changeCount })}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  record: { gap: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
});
