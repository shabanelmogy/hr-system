import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useFiscalYearLookup } from '@/src/modules/accounting';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppForm, AppFormSection, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, type AppSelectOption } from '@/src/shared/components';
import { WorkforceBudgetFilterButton, type WorkforceBudgetFilters } from '../components/WorkforceBudgetFilterButton';
import { usePositionEnvelope, usePositionEnvelopes } from '../queries/use-workforce-budgets';
import type { PositionEnvelope, PositionEnvelopePageQuery } from '../../domain/models/workforce-budget';

const initialFilters: WorkforceBudgetFilters = { status: 'all', fiscalYearId: 0 };

export function PositionEnvelopesScreen() {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme();
  const { allowed: viewAllowed } = useAuthorization({ requiredPermissions: [permissions.ViewPositionEnvelopes] });
  const list = useServerListState<PositionEnvelopePageQuery['sortBy'], WorkforceBudgetFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const queryArgs = useMemo<PositionEnvelopePageQuery>(() => ({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, fiscalYearId: list.state.filters.fiscalYearId || undefined, search: list.state.search, sortBy: list.state.sort?.columnId ?? 'createdOn', sortDirection: list.state.sort?.direction === 'ascending' ? 'asc' : 'desc' }), [list.state]);
  const query = usePositionEnvelopes(queryArgs); const fiscalYears = useFiscalYearLookup();
  const [selected, setSelected] = useState<PositionEnvelope | null>(null); const [detailsOpen, setDetailsOpen] = useState(false);
  const details = usePositionEnvelope(selected?.id ?? null, detailsOpen);
  const rows = query.data?.items ?? [];
  const fiscalOptions = useMemo<AppSelectOption<number>[]>(() => (fiscalYears.data ?? []).map(year => ({ value: year.id, label: `${year.code} — ${i18n.language.startsWith('ar') ? year.nameAr : year.nameEn}`, icon: 'calendar-outline' })), [fiscalYears.data, i18n.language]);
  const openDetails = useCallback((item: PositionEnvelope) => { setSelected(item); setDetailsOpen(true); }, []);
  const closeDetails = useCallback(() => { setDetailsOpen(false); setSelected(null); }, []);
  const capacityLabel = useCallback((item: PositionEnvelope) => t('envelopes.capacity.headcount', { available: item.availableHeadcount, total: item.authorizedHeadcount }), [t]);
  const columns = useMemo<AppDataTableColumn<PositionEnvelope>[]>(() => [
    { id: 'envelopeCode', header: t('envelopes.fields.envelopeCode'), width: 160, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.envelopeCode}</AppText> },
    { id: 'currencyCode', header: t('envelopes.fields.currency'), width: 90, render: item => <AppText variant="bodySmall">{item.currencyCode}</AppText> },
    { id: 'availableHeadcount', header: t('envelopes.fields.headcountCapacity'), width: 190, render: item => <AppStatusBadge color={item.availableHeadcount > 0 ? theme.colors.success : theme.colors.textMuted} label={capacityLabel(item)} /> },
    { id: 'availableSalaryBudget', header: t('envelopes.fields.salaryCapacity'), width: 220, render: item => <AppText variant="bodySmall">{t('envelopes.capacity.salary', { available: item.availableSalaryBudget, total: item.authorizedSalaryBudget, currency: item.currencyCode })}</AppText> },
    { id: 'actions', header: t('common.actions'), width: 90, align: 'center', render: item => <AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openDetails(item)} /> },
  ], [capacityLabel, openDetails, t, theme.colors.success, theme.colors.textMuted]);
  const envelope = details.data ?? null;
  if (!viewAllowed) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if (query.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error, t('envelopes.messages.fetchError'))} onRetry={() => void query.refetch()} /></AppScreen>;
  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppListScreen<PositionEnvelope, 'table' | 'cards'> defaultView="table" items={rows} isFetching={query.isFetching} emptyContent={<AppStateView state="empty" message={t('envelopes.empty')} />} fillViewSelector showViewLabels showResultCount={false} searchValue={list.searchInput} searchPlaceholder={t('envelopes.search.placeholder')} onSearchChange={list.setSearchInput}
      filterControl={<WorkforceBudgetFilterButton values={{ status: list.state.filters.status, fiscalYearId: list.state.filters.fiscalYearId }} fiscalYears={fiscalOptions} onApply={values => { list.setFilters({ ...list.state.filters, fiscalYearId: values.fiscalYearId }); list.setPage(0); }} />}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: query.data?.metaData.totalCount ?? 0, pageSizeOptions: [3, 5, 10], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
      views={[{ value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: query.data?.metaData.totalCount ?? 0, sort: list.state.sort, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: sort => list.setSort(sort ? { ...sort, columnId: sort.columnId as PositionEnvelopePageQuery['sortBy'] } : null) }} /> }, { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: items => <View style={styles.cards}>{items.map(item => <AppDataCard key={item.id} padding="md"><View style={styles.cardHeader}><View style={styles.cardTitle}><AppText variant="titleSmall" weight="800">{item.envelopeCode}</AppText><AppText color="muted" variant="caption">{item.currencyCode}</AppText></View><AppStatusBadge color={item.availableHeadcount > 0 ? theme.colors.success : theme.colors.textMuted} label={capacityLabel(item)} /></View><AppText variant="bodySmall">{t('envelopes.capacity.salary', { available: item.availableSalaryBudget, total: item.authorizedSalaryBudget, currency: item.currencyCode })}</AppText><AppText color="muted" variant="caption">{t('envelopes.capacity.reserved', { count: item.reservedHeadcount })} • {t('envelopes.capacity.hired', { count: item.hiredHeadcount })}</AppText><View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openDetails(item)} /></View></AppDataCard>)}</View> }]} />
    {detailsOpen ? <AppForm visible presentation="dialog" title={t('envelopes.details.title')} subtitle={envelope ? `${envelope.envelopeCode} • ${envelope.currencyCode}` : t('envelopes.details.subtitle')} icon="cube-outline" isDirty={false} submitting={false} serverError={details.error ? errorMessage(details.error, t('envelopes.messages.fetchError')) : null} onCancel={closeDetails}>
      {envelope ? <AppFormSection title={t('envelopes.details.capacity')} icon="pie-chart-outline">
        <AppText weight="700">{t('envelopes.capacity.headcount', { available: envelope.availableHeadcount, total: envelope.authorizedHeadcount })}</AppText>
        <AppText>{t('envelopes.capacity.salary', { available: envelope.availableSalaryBudget, total: envelope.authorizedSalaryBudget, currency: envelope.currencyCode })}</AppText>
        <AppText color="muted" variant="caption">{t('envelopes.capacity.reserved', { count: envelope.reservedHeadcount })} • {t('envelopes.capacity.hired', { count: envelope.hiredHeadcount })} • {t('envelopes.lineage.policy', { version: envelope.calculationPolicyVersion })}</AppText>
      </AppFormSection> : null}
      {envelope ? <AppFormSection title={t('envelopes.details.snapshots')} icon="layers-outline">
        <AppText>{t('envelopes.lineage.budget', { id: envelope.workforceBudgetId })} • {t('envelopes.lineage.plan', { id: envelope.workforcePlanId })} • {t('envelopes.lineage.year', { id: envelope.fiscalYearId })}</AppText>
        <AppText color="muted">{t('envelopes.fields.position', { id: envelope.positionId })}{envelope.branchId ? ` • ${t('envelopes.fields.branch', { id: envelope.branchId })}` : ` • ${t('envelopes.companyWide')}`} • {t('envelopes.fields.department', { id: envelope.departmentId })} • {t('envelopes.fields.division', { id: envelope.divisionId })}</AppText>
      </AppFormSection> : null}
    </AppForm> : null}
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }, cards: { gap: 8 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, cardTitle: { flex: 1, gap: 2 } });
