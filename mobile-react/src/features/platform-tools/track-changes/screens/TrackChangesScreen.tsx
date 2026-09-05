import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useTrackChanges } from '@/src/features/platform-tools/track-changes/hooks';
import type { TrackChangeLog } from '@/src/features/platform-tools/track-changes/types';
import {
  formatPlatformDate,
  getPlatformToolErrorMessage,
} from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppDivider,
  AppIcon,
  type AppIconName,
  AppListScreen,
  type AppMultiViewDefinition,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
} from '@/src/shared/components';

type TrackChangesView = 'table' | 'cards';

export function TrackChangesScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const changesQuery = useTrackChanges();
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const changes = useMemo(() => changesQuery.data ?? [], [changesQuery.data]);
  const entityFilterOptions = useMemo(() => Array.from(new Set(
    changes.map((change) => change.entityName.trim()).filter(Boolean),
  ))
    .sort((left, right) => left.localeCompare(right, i18n.language))
    .map((entity) => ({
      icon: 'cube-outline' as const,
      label: entity,
      value: entity,
    })), [changes, i18n.language]);
  const filteredChanges = useMemo(
    () => selectedEntities.length === 0
      ? changes
      : changes.filter((change) => selectedEntities.includes(change.entityName.trim())),
    [changes, selectedEntities],
  );

  const searchChanges = useCallback((items: readonly TrackChangeLog[], searchTerm: string) => {
    const term = searchTerm.trim().toLocaleLowerCase(i18n.language);
    if (!term) return items;

    return items.filter((change) => [
      change.entityName,
      change.key,
      change.oldValue,
      change.newValue,
      change.changedBy,
      change.changedByPc,
    ].some((value) => value.toLocaleLowerCase(i18n.language).includes(term)));
  }, [i18n.language]);

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

  const views = useMemo<readonly AppMultiViewDefinition<TrackChangeLog, TrackChangesView>[]>(
    () => [
      {
        value: 'table',
        defaultPageSize: 5,
        label: t('multiView.table'),
        icon: 'grid-outline',
        paginate: false,
        render: (items) => (
          <AppDataTable
            compactHeader
            columns={columns}
            defaultPageSize={5}
            emptyMessage={t('platformTools.trackChanges.empty')}
            getRowKey={(change) => change.id ?? change.changeLogId}
            pageSizeOptions={[5, 10, 25]}
            rows={items}
          />
        ),
      },
      {
        value: 'cards',
        carousel: true,
        getItemKey: (change) => change.id ?? change.changeLogId,
        label: t('multiView.cards'),
        icon: 'albums-outline',
        render: (items) => (
          <View style={styles.cards}>
            {items.map((change) => (
              <TrackChangeCard change={change} key={change.id ?? change.changeLogId} />
            ))}
          </View>
        ),
      },
    ],
    [columns, t],
  );

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
          message={getPlatformToolErrorMessage(changesQuery.error, t('feedback.unknownError'))}
          onRetry={() => void changesQuery.refetch()}
          state="error"
        />
      ) : (
        <AppListScreen<TrackChangeLog, TrackChangesView>
          defaultView="table"
          emptyContent={(
            <AppStateView message={t('platformTools.trackChanges.empty')} state="empty" />
          )}
          filter={{
            description: t('platformTools.trackChanges.filterDescription'),
            modalTitle: t('platformTools.trackChanges.filterByEntity'),
            onChange: setSelectedEntities,
            options: entityFilterOptions,
            values: selectedEntities,
          }}
          items={filteredChanges}
          onSearch={searchChanges}
          searchPlaceholder={t('platformTools.trackChanges.search')}
          showViewLabels
          views={views}
        />
      )}
    </AppScreen>
  );
}

function TrackChangeCard({ change }: { change: TrackChangeLog }) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard padding="md" style={styles.card} variant="elevated">
      <View style={[styles.cardHeader, { direction }]}>
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md },
          ]}>
          <AppIcon color={theme.colors.primary} name="git-compare-outline" size={28} />
        </View>
        <View style={styles.cardTitle}>
          <AppText numberOfLines={2} variant="titleSmall">
            {change.entityName || '—'}
          </AppText>
          <AppText color="muted" numberOfLines={2} variant="caption">
            {change.key || '—'}
          </AppText>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <TrackChangeDetail icon="person-outline" text={change.changedBy || '—'} />
        <TrackChangeDetail
          icon="time-outline"
          text={formatPlatformDate(change.changedAt, i18n.language)}
        />
        <TrackChangeDetail icon="desktop-outline" text={change.changedByPc || '—'} />
      </View>

      <AppDivider />
      <View style={styles.values}>
        <ValuePanel
          label={t('platformTools.trackChanges.oldValue')}
          value={change.oldValue || '—'}
        />
        <ValuePanel
          label={t('platformTools.trackChanges.newValue')}
          value={change.newValue || '—'}
        />
      </View>
    </AppCard>
  );
}

function TrackChangeDetail({ icon, text }: { icon: AppIconName; text: string }) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.detailRow, { direction }]}>
      <AppIcon color={theme.colors.textMuted} name={icon} size={17} />
      <AppText color="muted" numberOfLines={2} style={styles.detailText} variant="bodySmall">
        {text}
      </AppText>
    </View>
  );
}

function ValuePanel({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.valuePanel,
        { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
      ]}>
      <AppText color="muted" variant="caption" weight="700">{label}</AppText>
      <AppText numberOfLines={5} variant="bodySmall">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { width: '100%' },
  card: { minHeight: 360, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, minWidth: 0, gap: 3 },
  cardDetails: { gap: 9 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailText: { flex: 1, minWidth: 0 },
  values: { gap: 10 },
  valuePanel: { minHeight: 78, gap: 5, padding: 10 },
});
