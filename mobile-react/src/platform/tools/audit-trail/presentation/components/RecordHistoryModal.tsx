import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton, AppModal, AppStateView } from '@/src/shared/components';

import { auditTrailItemKey, type AuditTrailItem, type AuditTrailQuery } from '../../domain/models/audit-trail';
import { useAuditTrailList } from '../queries/use-audit-trail';
import { AuditTrailDetailsModal } from './AuditTrailDetailsModal';
import { AuditTrailEntryCard } from './AuditTrailEntryCard';

export interface RecordHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  /** Module code as registered in the API, e.g. "hr" or "reference-data". */
  moduleCode: string;
  /** API entity name, e.g. "Department". */
  entityName: string;
  entityKey: string | number;
  title?: string;
  subtitle?: string;
}

/** Every action recorded for one record, newest first; tap one for details. */
export function RecordHistoryModal({
  visible,
  onClose,
  moduleCode,
  entityName,
  entityKey,
  title,
  subtitle,
}: RecordHistoryModalProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<AuditTrailItem | null>(null);
  const query = useMemo<AuditTrailQuery>(
    () => ({ moduleCode, entityName, entityKey: String(entityKey), pageSize: 25 }),
    [moduleCode, entityName, entityKey],
  );
  const list = useAuditTrailList(query, visible);
  const items = list.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <AppModal
        animationType="slide"
        closeLabel={t('common.close')}
        icon="time-outline"
        onClose={onClose}
        subtitle={subtitle}
        title={title ?? t('auditLog.recordHistory')}
        variant="fullScreen"
        visible={visible && selected === null}>
        {list.isLoading ? (
          <AppStateView message={t('feedback.loading')} state="loading" />
        ) : list.error ? (
          <AppStateView message={t('auditLog.loadError')} onRetry={() => void list.refetch()} state="error" />
        ) : items.length === 0 ? (
          <AppStateView message={t('auditLog.noEntries')} state="empty" />
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <AuditTrailEntryCard item={item} key={auditTrailItemKey(item)} onPress={setSelected} showRecord={false} />
            ))}
            {list.hasNextPage ? (
              <AppButton
                loading={list.isFetchingNextPage}
                onPress={() => void list.fetchNextPage()}
                variant="outline">
                {t('auditLog.loadMore')}
              </AppButton>
            ) : null}
          </View>
        )}
      </AppModal>
      <AuditTrailDetailsModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
