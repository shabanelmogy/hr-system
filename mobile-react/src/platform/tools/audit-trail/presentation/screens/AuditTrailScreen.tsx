import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import {
  AppButton,
  AppPageHeader,
  AppScreen,
  AppSelectField,
  type AppSelectOption,
  AppStateView,
} from '@/src/shared/components';

import {
  auditActions,
  auditTrailItemKey,
  type AuditAction,
  type AuditTrailItem,
  type AuditTrailQuery,
} from '../../domain/models/audit-trail';
import { AuditTrailDetailsModal } from '../components/AuditTrailDetailsModal';
import { AuditTrailEntryCard } from '../components/AuditTrailEntryCard';
import { actionLabel, entityLabel, moduleLabel } from '../components/audit-trail-format';
import { useAuditTrailFilters, useAuditTrailList } from '../queries/use-audit-trail';

const ALL = '';

/** Every create, change, delete and restore in the system, newest first. */
export function AuditTrailScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [moduleCode, setModuleCode] = useState(ALL);
  const [entityName, setEntityName] = useState(ALL);
  const [action, setAction] = useState<AuditAction | typeof ALL>(ALL);
  const [selected, setSelected] = useState<AuditTrailItem | null>(null);
  const filters = useAuditTrailFilters();
  const modules = useMemo(() => filters.data ?? [], [filters.data]);

  const moduleOptions = useMemo<AppSelectOption<string>[]>(() => [
    { value: ALL, label: t('auditLog.all'), icon: 'apps-outline' },
    ...modules.map((module) => ({
      value: module.moduleCode,
      label: moduleLabel(t, module.moduleCode),
      icon: 'cube-outline' as const,
    })),
  ], [modules, t]);
  const entityOptions = useMemo<AppSelectOption<string>[]>(() => {
    const source = moduleCode ? modules.filter((module) => module.moduleCode === moduleCode) : modules;
    const names = [...new Set(source.flatMap((module) => module.entityNames))].sort();
    return [
      { value: ALL, label: t('auditLog.all'), icon: 'list-outline' },
      ...names.map((name) => ({ value: name, label: entityLabel(t, name), icon: 'document-text-outline' as const })),
    ];
  }, [moduleCode, modules, t]);
  const actionOptions = useMemo<AppSelectOption<string>[]>(() => [
    { value: ALL, label: t('auditLog.all'), icon: 'layers-outline' },
    ...auditActions.map((value) => ({ value, label: actionLabel(t, value), icon: 'flash-outline' as const })),
  ], [t]);

  const query = useMemo<AuditTrailQuery>(() => ({
    moduleCode: moduleCode || undefined,
    entityName: entityName || undefined,
    action: action || undefined,
    pageSize: 30,
  }), [action, entityName, moduleCode]);
  const list = useAuditTrailList(query);
  const items = list.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void list.refetch()}
          refreshing={list.isRefetching && !list.isFetchingNextPage}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader subtitle={t('platformTools.auditTrailDescription')} title={t('navigation.auditTrail')} />
      <View style={styles.filters}>
        <AppSelectField
          label={t('auditLog.module')}
          onChange={(value) => { setModuleCode(value); setEntityName(ALL); }}
          options={moduleOptions}
          value={moduleCode}
        />
        <AppSelectField
          label={t('auditLog.recordType')}
          onChange={setEntityName}
          options={entityOptions}
          searchable
          value={entityName}
        />
        <AppSelectField
          label={t('auditLog.action')}
          onChange={(value) => setAction(value as AuditAction | typeof ALL)}
          options={actionOptions}
          value={action}
        />
      </View>
      {list.isLoading ? (
        <AppStateView message={t('feedback.loading')} state="loading" />
      ) : list.error ? (
        <AppStateView message={t('auditLog.loadError')} onRetry={() => void list.refetch()} state="error" />
      ) : items.length === 0 ? (
        <AppStateView message={t('auditLog.noEntries')} state="empty" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <AuditTrailEntryCard item={item} key={auditTrailItemKey(item)} onPress={setSelected} />
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
      <AuditTrailDetailsModal item={selected} onClose={() => setSelected(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 10 },
  list: { gap: 12 },
});
