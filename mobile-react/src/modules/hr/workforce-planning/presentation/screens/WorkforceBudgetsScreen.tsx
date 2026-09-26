import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { appRoles, permissions, useAuthorization } from '@/src/platform/auth';
import { useFiscalYearLookup } from '@/src/modules/accounting';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, AppTextField, ConfirmationDialog, showToast, type AppSelectOption } from '@/src/shared/components';
import { WorkforceBudgetFilterButton, type WorkforceBudgetFilters } from '../components/WorkforceBudgetFilterButton';
import { WorkforceBudgetForm } from '../components/WorkforceBudgetForm';
import { useApproveWorkforceBudget, useCreateWorkforceBudget, useRejectWorkforceBudget, useSubmitWorkforceBudget, useUpdateWorkforceBudget, useWorkforceBudget, useWorkforceBudgets } from '../queries/use-workforce-budgets';
import type { WorkforceBudget, WorkforceBudgetPageQuery, WorkforceBudgetRequest } from '../../domain/models/workforce-budget';

type FormMode = 'create' | 'edit' | 'view';
type PendingKind = 'submit' | 'approve' | 'reject';
type Pending = { kind: PendingKind; item: WorkforceBudget } | null;
const initialFilters: WorkforceBudgetFilters = { status: 'all', fiscalYearId: 0 };
const statusKeys = ['', 'draft', 'submitted', 'approved', 'rejected', 'superseded', 'closed'] as const;
const lifecycleKind = (item: WorkforceBudget): PendingKind => item.status === 2 ? 'approve' : 'submit';

export function WorkforceBudgetsScreen() {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: viewAllowed } = useAuthorization({ requiredPermissions: [permissions.ViewWorkforceBudgets] });
  const { allowed: manageAllowed } = useAuthorization({ requiredPermissions: [permissions.EditWorkforceBudgets] });
  const { allowed: approveAllowed } = useAuthorization({ allowedRoles: [appRoles.admin] });
  const canManage = manageAllowed && !isReadOnly; const canApprove = approveAllowed && !isReadOnly;
  const list = useServerListState<WorkforceBudgetPageQuery['sortBy'], WorkforceBudgetFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const queryArgs = useMemo<WorkforceBudgetPageQuery>(() => ({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, fiscalYearId: list.state.filters.fiscalYearId || undefined, status: list.state.filters.status, search: list.state.search, sortBy: list.state.sort?.columnId ?? 'createdOn', sortDirection: list.state.sort?.direction === 'ascending' ? 'asc' : 'desc' }), [list.state]);
  const query = useWorkforceBudgets(queryArgs); const fiscalYears = useFiscalYearLookup();
  const [formOpen, setFormOpen] = useState(false); const [formMode, setFormMode] = useState<FormMode>('view'); const [selected, setSelected] = useState<WorkforceBudget | null>(null); const [pending, setPending] = useState<Pending>(null); const [reason, setReason] = useState(''); const [reasonTouched, setReasonTouched] = useState(false);
  const details = useWorkforceBudget(selected?.id ?? null, formOpen && formMode !== 'create');
  const create = useCreateWorkforceBudget(); const update = useUpdateWorkforceBudget(); const submitBudget = useSubmitWorkforceBudget(); const approve = useApproveWorkforceBudget(); const reject = useRejectWorkforceBudget();
  const rows = query.data?.items ?? [];
  const fiscalOptions = useMemo<AppSelectOption<number>[]>(() => (fiscalYears.data ?? []).map(year => ({ value: year.id, label: `${year.code} — ${i18n.language.startsWith('ar') ? year.nameAr : year.nameEn}`, icon: 'calendar-outline' })), [fiscalYears.data, i18n.language]);
  const openForm = useCallback((mode: FormMode, item: WorkforceBudget | null) => { if (mode !== 'view' && isReadOnly) return notifyBlockedAction(); setSelected(item); setFormMode(mode); setFormOpen(true); }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelected(null); }, []);
  const save = useCallback(async (request: WorkforceBudgetRequest) => { try { if (formMode === 'create') await create.mutateAsync(request); else if (selected && details.data) await update.mutateAsync({ id: selected.id, request: { currencyCode: request.currencyCode, lines: request.lines, rowVersion: details.data.rowVersion } }); showToast.success(t(formMode === 'create' ? 'workforceBudget.messages.created' : 'workforceBudget.messages.updated')); closeForm(); } catch (error) { showToast.error(error, t('workforceBudget.messages.saveFailed')); throw error; } }, [closeForm, create, details.data, formMode, selected, t, update]);
  const beginPending = useCallback((item: WorkforceBudget, kind = lifecycleKind(item)) => { if (isReadOnly) return notifyBlockedAction(); setSelected(item); setReason(''); setReasonTouched(false); setPending({ kind, item }); }, [isReadOnly, notifyBlockedAction]);
  const confirm = useCallback(async () => {
    if (!pending) return; if (isReadOnly) return notifyBlockedAction(); const action = { id: pending.item.id, rowVersion: pending.item.rowVersion };
    if (pending.kind === 'reject' && !reason.trim()) { setReasonTouched(true); return; }
    try {
      if (pending.kind === 'submit') await submitBudget.mutateAsync(action);
      else if (pending.kind === 'approve') await approve.mutateAsync(action);
      else await reject.mutateAsync({ ...action, reason: reason.trim() });
      showToast.success(t(`workforceBudget.messages.${pending.kind}`)); setPending(null); setSelected(null);
    } catch (error) { showToast.error(error, t('workforceBudget.messages.actionFailed')); }
  }, [approve, isReadOnly, notifyBlockedAction, pending, reason, reject, submitBudget, t]);
  const actions = useCallback((item: WorkforceBudget) => <View style={styles.actions}>
    <AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />
    {canManage && [1, 4].includes(item.status) ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}
    {[1, 4].includes(item.status) && canManage ? <AppIconButton icon="send-outline" label={t('workforceBudget.actions.submit')} onPress={() => beginPending(item, 'submit')} /> : null}
    {item.status === 2 && canApprove ? <AppIconButton icon="checkmark-circle-outline" label={t('workforceBudget.actions.approve')} onPress={() => beginPending(item, 'approve')} /> : null}
    {item.status === 2 && canManage ? <AppIconButton icon="close-circle-outline" label={t('workforceBudget.actions.reject')} onPress={() => beginPending(item, 'reject')} /> : null}
  </View>, [beginPending, canApprove, canManage, openForm, t]);
  const columns = useMemo<AppDataTableColumn<WorkforceBudget>[]>(() => [
    { id: 'budgetCode', header: t('workforceBudget.fields.budgetCode'), width: 140, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.budgetCode}</AppText> },
    { id: 'currencyCode', header: t('workforceBudget.fields.currency'), width: 90, render: item => <AppText variant="bodySmall">{item.currencyCode}</AppText> },
    { id: 'totalAuthorizedHeadcount', header: t('workforceBudget.fields.headcount'), width: 130, render: item => <AppText variant="bodySmall">{item.totalAuthorizedHeadcount}</AppText> },
    { id: 'grandTotalBudget', header: t('workforceBudget.fields.grandTotal'), width: 170, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.grandTotalBudget} {item.currencyCode}</AppText> },
    { id: 'status', header: t('workforceBudget.fields.status'), width: 170, sortable: true, render: item => <AppStatusBadge color={item.status === 3 ? theme.colors.success : item.status === 4 ? theme.colors.danger : theme.colors.primary} label={t(`workforceBudget.status.${statusKeys[item.status]}`)} /> },
    { id: 'actions', header: t('common.actions'), width: 220, align: 'center', render: actions },
  ], [actions, t, theme.colors.danger, theme.colors.primary, theme.colors.success]);
  if (!viewAllowed) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if (query.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error, t('workforceBudget.messages.fetchError'))} onRetry={() => void query.refetch()} /></AppScreen>;
  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppListScreen<WorkforceBudget, 'table' | 'cards'> defaultView="table" items={rows} isFetching={query.isFetching} emptyContent={<AppStateView state="empty" message={t('workforceBudget.empty')} />} fillViewSelector showViewLabels showResultCount={false} searchValue={list.searchInput} searchPlaceholder={t('workforceBudget.search.placeholder')} onSearchChange={list.setSearchInput}
      filterControl={<WorkforceBudgetFilterButton values={list.state.filters} fiscalYears={fiscalOptions} onApply={values => { list.setFilters(values); list.setPage(0); }} />}
      searchActions={canManage ? <AppIconButton icon="add-outline" label={t('workforceBudget.actions.add')} color={theme.colors.onPrimary} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? .75 : 1 })} /> : null}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: query.data?.metaData.totalCount ?? 0, pageSizeOptions: [3, 5, 10], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
      views={[{ value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: query.data?.metaData.totalCount ?? 0, sort: list.state.sort, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: sort => list.setSort(sort ? { ...sort, columnId: sort.columnId as WorkforceBudgetPageQuery['sortBy'] } : null) }} /> }, { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: items => <View style={styles.cards}>{items.map(item => <AppDataCard key={item.id} padding="md"><View style={styles.cardHeader}><View style={styles.cardTitle}><AppText variant="titleSmall" weight="800">{item.budgetCode}</AppText><AppText color="muted" variant="caption">{item.currencyCode} • {t('workforceBudget.revision.short', { revision: item.revisionNumber })}</AppText></View><AppStatusBadge color={item.status === 3 ? theme.colors.success : item.status === 4 ? theme.colors.danger : theme.colors.primary} label={t(`workforceBudget.status.${statusKeys[item.status]}`)} /></View><AppText variant="bodySmall">{t('workforceBudget.summary.headcount', { count: item.totalAuthorizedHeadcount })} • {t('workforceBudget.summary.grandTotal', { amount: item.grandTotalBudget, currency: item.currencyCode })}</AppText>{item.isEffective ? <AppStatusBadge color={theme.colors.success} label={t('workforceBudget.effective')} /> : null}{actions(item)}</AppDataCard>)}</View> }]} />
    {formOpen ? <WorkforceBudgetForm key={`${formMode}-${selected?.id ?? 'new'}-${details.data?.rowVersion ?? 'pending'}`} item={details.data ?? null} mode={formMode} loading={create.isPending || update.isPending} detailLoading={formMode !== 'create' && details.isFetching} detailError={details.error ? errorMessage(details.error, t('workforceBudget.messages.fetchError')) : null} onRetryDetail={() => void details.refetch()} onClose={closeForm} onSave={save} /> : null}
    <ConfirmationDialog visible={pending !== null} title={t(`workforceBudget.confirm.${pending?.kind ?? 'submit'}Title`)} description={t(`workforceBudget.confirm.${pending?.kind ?? 'submit'}Description`)} confirmLabel={t(`workforceBudget.actions.${pending?.kind ?? 'submit'}`)} tone={pending?.kind === 'reject' ? 'danger' : 'default'} loading={submitBudget.isPending || approve.isPending || reject.isPending} onCancel={() => setPending(null)} onConfirm={confirm}>
      {pending?.kind === 'reject' ? <AppTextField autoFocus multiline required label={t('workforceBudget.fields.decisionReason')} value={reason} onChangeText={setReason} error={reasonTouched && !reason.trim() ? t('workforceBudget.validation.reason') : undefined} /> : <AppText weight="700">{pending?.item.budgetCode}</AppText>}
    </ConfirmationDialog>
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }, cards: { gap: 8 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, cardTitle: { flex: 1, gap: 2 } });
