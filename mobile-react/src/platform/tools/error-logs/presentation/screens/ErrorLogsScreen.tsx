import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { appRoles, permissions, useAuth, useAuthorization } from '@/src/platform/auth';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, AppDateTimeField, AppIconButton, AppListScreen, AppPageHeader, AppScreen, AppSelectField, AppStateView, AppText, AppTextField, showToast, type AppDataTableColumn } from '@/src/shared/components';

import type { ErrorLogCriteria, ErrorLogRow, ErrorLogScope, ErrorLogSource } from '../../domain/models/error-log';
import { ErrorLogDetailModal } from '../components/ErrorLogDetailModal';
import { useErrorLogs, useExportErrorLogs } from '../queries/use-error-logs';

interface Filters { source: ErrorLogSource | ''; fromUtc: string; toUtc: string; userName: string; statusCode: string }
const initialFilters: Filters = { source: '', fromUtc: '', toUtc: '', userName: '', statusCode: '' };

export function ErrorLogsScreen({ scope }: { scope: ErrorLogScope }) {
  const { t, i18n } = useTranslation();
  const { isServerAuthenticated, isSwitchingCompany } = useAuth();
  const onlineAuthority = isServerAuthenticated && !isSwitchingCompany;
  const { theme } = useAppTheme();
  const roles = scope === 'system' ? [appRoles.superAdmin] : undefined;
  const { allowed: canView } = useAuthorization({ allowedRoles: roles, requiredPermissions: [scope === 'system' ? permissions.ViewSystemErrorLogs : permissions.ViewErrorLogs] });
  const { allowed: canDetail } = useAuthorization({ allowedRoles: roles, requiredPermissions: [scope === 'system' ? permissions.ViewSystemErrorLogDetails : permissions.ViewErrorLogDetails] });
  const { allowed: canExport } = useAuthorization({ allowedRoles: roles, requiredPermissions: [scope === 'system' ? permissions.ExportSystemErrorLogs : permissions.ExportErrorLogs] });
  const list = useServerListState<'occurredOnUtc', Filters>({ initialFilters, initialPageSize: 10, initialSort: { columnId: 'occurredOnUtc', direction: 'descending' } });
  const [selected, setSelected] = useState<ErrorLogRow | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const criteria = useMemo<ErrorLogCriteria>(() => ({
    page: toApiPageNumber(list.state.page), pageSize: list.state.pageSize,
    search: list.state.search || undefined, source: list.state.filters.source || undefined,
    fromUtc: list.state.filters.fromUtc ? `${list.state.filters.fromUtc}T00:00:00.000Z` : undefined,
    toUtc: list.state.filters.toUtc ? `${list.state.filters.toUtc}T23:59:59.999Z` : undefined,
    userName: list.state.filters.userName || undefined,
    statusCode: /^\d+$/.test(list.state.filters.statusCode) ? Number(list.state.filters.statusCode) : undefined,
  }), [list.state]);
  const invalidRange = Boolean(list.state.filters.fromUtc && list.state.filters.toUtc && list.state.filters.fromUtc > list.state.filters.toUtc);
  const query = useErrorLogs(scope, criteria, canView && onlineAuthority && !invalidRange);
  const exportMutation = useExportErrorLogs();
  const rows = query.data?.items ?? [];
  const changeFilter = (key: keyof Filters, value: string) => list.setFilters({ ...list.state.filters, [key]: value });
  const exportCurrent = async () => {
    if (!canExport || !onlineAuthority || invalidRange || exportMutation.isPending) return;
    try { await exportMutation.mutateAsync({ scope, criteria }); }
    catch (error) { showToast.error(error, t('errorLogs.exportFailed')); }
  };
  const columns = useMemo<AppDataTableColumn<ErrorLogRow>[]>(() => [
    { id: 'occurredOnUtc', header: t('errorLogs.fields.occurredOnUtc'), width: 170, render: (row) => <AppText variant="bodySmall">{new Date(row.occurredOnUtc).toLocaleString(i18n.language)}</AppText> },
    { id: 'summary', header: t('errorLogs.fields.summary'), width: 260, render: (row) => <AppText variant="bodySmall">{row.summary}</AppText> },
    { id: 'source', header: t('errorLogs.fields.source'), width: 90, render: (row) => <AppText variant="bodySmall">{t(`errorLogs.source.${row.source}`)}</AppText> },
    { id: 'severity', header: t('errorLogs.fields.severity'), width: 95, render: (row) => <AppText variant="bodySmall">{t(`errorLogs.severity.${row.severity}`)}</AppText> },
    { id: 'userName', header: t('errorLogs.fields.userName'), width: 130, render: (row) => <AppText variant="bodySmall">{row.userName ?? '—'}</AppText> },
    { id: 'statusCode', header: t('errorLogs.fields.statusCode'), width: 90, render: (row) => <AppText variant="bodySmall">{row.statusCode ?? '—'}</AppText> },
    ...(['service', 'action', 'durationMs', 'client', 'browser'] as const).map((field) => ({ id: field, header: t(`errorLogs.fields.${field}`), width: 130, render: (row: ErrorLogRow) => <AppText variant="bodySmall">{row[field] ?? '—'}</AppText> })),
    ...(scope === 'system' ? [{ id: 'ipAddress', header: t('errorLogs.fields.ipAddress'), width: 150, render: (row: ErrorLogRow) => <AppText variant="bodySmall">{row.ipAddress ?? '—'}</AppText> }] : []),
    ...(canDetail ? [{ id: 'actions', header: t('errorLogs.detail'), width: 72, render: (row: ErrorLogRow) => <AppIconButton icon="eye-outline" label={t('errorLogs.detail')} onPress={() => setSelected(row)} /> }] : []),
  ], [canDetail, i18n.language, scope, t]);
  if (!canView || !onlineAuthority) return <AppScreen><AppStateView state="error" message={t('errorLogs.forbidden')} /></AppScreen>;
  return <AppScreen contentContainerStyle={styles.screen} edges={['left', 'right', 'bottom']} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} />}>
    <AppPageHeader title={t(scope === 'system' ? 'systemErrorLogs.title' : 'errorLogs.title')} subtitle={t('errorLogs.description')} />
    {showFilters ? <View style={styles.filters}>
      <AppSelectField allowWhenReadOnly label={t('errorLogs.fields.source')} value={list.state.filters.source} onChange={(value) => changeFilter('source', value)} options={[
        { value: '', label: t('errorLogs.all'), icon: 'apps-outline' },
        ...(['api', 'job', 'web', 'mobile'] as const).map((source) => ({ value: source, label: t(`errorLogs.source.${source}`), icon: 'cube-outline' as const })),
      ]} />
      <AppDateTimeField allowWhenReadOnly label={t('errorLogs.from')} value={list.state.filters.fromUtc} onChangeValue={(value) => changeFilter('fromUtc', value)} />
      <AppDateTimeField allowWhenReadOnly label={t('errorLogs.to')} value={list.state.filters.toUtc} onChangeValue={(value) => changeFilter('toUtc', value)} error={invalidRange ? t('errorLogs.invalidRange') : undefined} />
      <AppTextField label={t('errorLogs.fields.userName')} value={list.state.filters.userName} maxLength={100} onChangeText={(value) => changeFilter('userName', value)} allowWhenReadOnly />
      <AppSelectField allowWhenReadOnly label={t('errorLogs.fields.statusCode')} value={list.state.filters.statusCode} onChange={(value) => changeFilter('statusCode', value)} options={[{ value: '', label: t('errorLogs.all'), icon: 'apps-outline' }, ...[400, 401, 403, 404, 409, 413, 422, 429, 500, 502, 503, 504].map((value) => ({ value: String(value), label: String(value), icon: 'alert-circle-outline' as const }))]} />
      <AppIconButton icon="close-outline" label={t('errorLogs.clearFilters')} onPress={() => list.setFilters(initialFilters)} />
    </View> : null}
    {invalidRange ? <AppStateView state="error" message={t('errorLogs.invalidRange')} /> : query.isLoading ? <AppStateView state="loading" /> : query.error ? <AppStateView state="error" message={t('errorLogs.loadFailed')} onRetry={() => void query.refetch()} /> : <AppListScreen<ErrorLogRow, 'table' | 'cards'> items={rows} defaultView="table" searchValue={list.searchInput} onSearchChange={(value) => list.setSearchInput(value.slice(0, 120))} searchPlaceholder={t('errorLogs.search')} searchActions={<View style={styles.actions}><AppIconButton icon="filter-outline" label={t('errorLogs.filters')} onPress={() => setShowFilters(!showFilters)} />{canExport ? <AppIconButton icon="download-outline" label={t('errorLogs.export')} onPress={() => void exportCurrent()} disabled={exportMutation.isPending || invalidRange} /> : null}</View>} emptyContent={<AppStateView state="empty" message={t('errorLogs.empty')} />} serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: query.data?.totalCount ?? 0, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, pageSizeOptions: [10, 20, 50] }} views={[
      { value: 'table', icon: 'grid-outline', label: t('multiView.table'), render: (items) => <AppDataTable rows={items} columns={columns} getRowKey={(row) => row.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: query.data?.totalCount ?? 0, sort: null, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: () => undefined }} /> },
      { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), render: (items) => <View style={styles.cards}>{items.map((row) => <AppDataCard key={row.id}><AppText weight="700">{row.summary}</AppText><AppText variant="bodySmall">{new Date(row.occurredOnUtc).toLocaleString(i18n.language)} · {t(`errorLogs.source.${row.source}`)} · {t(`errorLogs.severity.${row.severity}`)}</AppText><AppText variant="bodySmall">{row.userName ?? '—'} · {row.statusCode ?? '—'}</AppText>{(['service', 'action', 'durationMs', 'client', 'browser'] as const).map((field) => <AppText key={field} variant="bodySmall">{t(`errorLogs.fields.${field}`)}: {row[field] ?? '—'}</AppText>)}{canDetail ? <AppIconButton icon="eye-outline" label={t('errorLogs.detail')} onPress={() => setSelected(row)} /> : null}</AppDataCard>)}</View> },
    ]} />}
    <ErrorLogDetailModal scope={scope} item={selected} canView={canDetail && onlineAuthority} onClose={() => setSelected(null)} />
  </AppScreen>;
}
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, filters: { gap: 10 }, cards: { gap: 8 }, actions: { flexDirection: 'row' } });
