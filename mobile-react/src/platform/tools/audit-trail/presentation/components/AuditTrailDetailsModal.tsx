import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { formatPlatformDate } from '@/src/platform/tools/utils/platform-tool-utils';
import { AppModal, AppStateView, AppText } from '@/src/shared/components';

import type { AuditTrailItem } from '../../domain/models/audit-trail';
import { useAuditTrailEntry } from '../queries/use-audit-trail';
import { AuditActionBadge } from './AuditActionBadge';
import { entityLabel, fieldLabel, moduleLabel } from './audit-trail-format';

interface AuditTrailDetailsModalProps {
  item: AuditTrailItem | null;
  onClose: () => void;
}

/** Before/after of every field touched by one action. */
export function AuditTrailDetailsModal({ item, onClose }: AuditTrailDetailsModalProps) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const query = useAuditTrailEntry(item?.moduleCode ?? null, item?.id ?? null);
  const changes = query.data?.changes ?? [];
  const empty = t('auditLog.empty');

  return (
    <AppModal
      animationType="slide"
      closeLabel={t('common.close')}
      icon="time-outline"
      onClose={onClose}
      subtitle={item ? `${moduleLabel(t, item.moduleCode)} · #${item.entityKey}` : undefined}
      title={item ? `${entityLabel(t, item.entityName)}${item.entityDisplay ? ` — ${item.entityDisplay}` : ''}` : t('auditLog.title')}
      variant="fullScreen"
      visible={item !== null}>
      {item ? (
        <View style={styles.content}>
          <View style={[styles.summary, { direction }]}>
            <AuditActionBadge action={item.action} />
            <AppText color="muted" variant="bodySmall">
              {`${item.userName ?? item.userId ?? t('auditLog.system')} · ${formatPlatformDate(item.occurredOn, i18n.language)}`}
            </AppText>
          </View>
          {query.isLoading ? (
            <AppStateView message={t('feedback.loading')} state="loading" />
          ) : query.error ? (
            <AppStateView message={t('auditLog.loadError')} onRetry={() => void query.refetch()} state="error" />
          ) : changes.length === 0 ? (
            <AppStateView message={t('auditLog.noFieldChanges')} state="empty" />
          ) : (
            changes.map((change) => (
              <View
                key={change.field}
                style={[
                  styles.change,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, borderRadius: theme.radius.md },
                ]}>
                <AppText color="primary" variant="caption" weight="700">{fieldLabel(t, change.field)}</AppText>
                <View style={[styles.values, { direction }]}>
                  <View style={styles.value}>
                    <AppText color="muted" variant="caption">{t('auditLog.oldValue')}</AppText>
                    <AppText style={{ color: theme.colors.danger }} variant="bodySmall">{change.oldValue ?? empty}</AppText>
                  </View>
                  <View style={styles.value}>
                    <AppText color="muted" variant="caption">{t('auditLog.newValue')}</AppText>
                    <AppText style={{ color: theme.colors.success }} variant="bodySmall">{change.newValue ?? empty}</AppText>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  summary: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  change: { borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 8 },
  values: { flexDirection: 'row', gap: 12 },
  value: { flex: 1, minWidth: 0, gap: 3 },
});
