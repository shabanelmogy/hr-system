import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { useTrackChanges } from '@/src/features/platform-tools/hooks/usePlatformTools';
import type { TrackChangeLog } from '@/src/features/platform-tools/types/platform-tools';
import {
  formatPlatformDate,
  getPlatformToolErrorMessage,
} from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
  AppTextField,
} from '@/src/shared/components';

export function TrackChangesScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const changesQuery = useTrackChanges();
  const [search, setSearch] = useState('');
  const changes = useMemo(() => changesQuery.data ?? [], [changesQuery.data]);
  const filteredChanges = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(i18n.language);
    if (!term) return changes;
    return changes.filter((change) => [
      change.entityName,
      change.key,
      change.oldValue,
      change.newValue,
      change.changedBy,
      change.changedByPc,
    ].some((value) => value.toLocaleLowerCase(i18n.language).includes(term)));
  }, [changes, i18n.language, search]);

  const columns = useMemo<AppDataTableColumn<TrackChangeLog>[]>(() => [
    {
      id: 'entity',
      header: t('platformTools.trackChanges.entity'),
      width: 170,
      render: (change) => <AppText variant="bodySmall">{change.entityName || '—'}</AppText>,
      sortValue: (change) => change.entityName,
    },
    {
      id: 'key',
      header: t('platformTools.trackChanges.key'),
      width: 155,
      render: (change) => <AppText color="muted" variant="bodySmall">{change.key || '—'}</AppText>,
      sortValue: (change) => change.key,
    },
    {
      id: 'oldValue',
      header: t('platformTools.trackChanges.oldValue'),
      width: 220,
      render: (change) => <AppText numberOfLines={3} variant="bodySmall">{change.oldValue || '—'}</AppText>,
      sortValue: (change) => change.oldValue,
    },
    {
      id: 'newValue',
      header: t('platformTools.trackChanges.newValue'),
      width: 220,
      render: (change) => <AppText numberOfLines={3} variant="bodySmall">{change.newValue || '—'}</AppText>,
      sortValue: (change) => change.newValue,
    },
    {
      id: 'changedBy',
      header: t('platformTools.trackChanges.changedBy'),
      width: 180,
      render: (change) => <AppText variant="bodySmall">{change.changedBy || '—'}</AppText>,
      sortValue: (change) => change.changedBy,
    },
    {
      id: 'changedAt',
      header: t('platformTools.trackChanges.changedAt'),
      width: 195,
      render: (change) => <AppText variant="bodySmall">{formatPlatformDate(change.changedAt, i18n.language)}</AppText>,
      sortValue: (change) => new Date(change.changedAt),
    },
    {
      id: 'device',
      header: t('platformTools.trackChanges.device'),
      width: 160,
      render: (change) => <AppText color="muted" variant="bodySmall">{change.changedByPc || '—'}</AppText>,
      sortValue: (change) => change.changedByPc,
    },
  ], [i18n.language, t]);

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void changesQuery.refetch()}
          refreshing={changesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        subtitle={t('platformTools.trackChangesDescription')}
        title={t('navigation.trackChanges')}
      />
      {changesQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : changesQuery.error ? (
        <AppStateView
          message={getPlatformToolErrorMessage(changesQuery.error, t('states.errorMessage'))}
          onRetry={() => void changesQuery.refetch()}
          state="error"
        />
      ) : (
        <View style={styles.content}>
          <AppTextField
            compact
            label={t('platformTools.trackChanges.search')}
            leadingIcon="search-outline"
            onChangeText={setSearch}
            value={search}
          />
          <AppDataTable
            columns={columns}
            emptyMessage={t('platformTools.trackChanges.empty')}
            getRowKey={(change) => change.id}
            resetKey={search}
            rows={filteredChanges}
          />
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({ content: { gap: 14 } });
