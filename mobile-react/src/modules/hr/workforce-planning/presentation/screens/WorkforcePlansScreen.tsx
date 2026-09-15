import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { useConnectivity } from '@/src/core/offline';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useFiscalYearLookup } from '@/src/modules/hr/finance';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, AppTextField, ConfirmationDialog, showToast, type AppSelectOption } from '@/src/shared/components';
import { WorkforcePlanFilterButton, type WorkforcePlanFilters } from '../components/WorkforcePlanFilterButton';
import { WorkforcePlanForm } from '../components/WorkforcePlanForm';
import { useApproveWorkforcePlan, useArchiveWorkforcePlan, useBeginWorkforcePlanReview, useCreateWorkforcePlan, useCreateWorkforcePlanRevision, useDiscardWorkforcePlanLocalDraft, useRejectWorkforcePlan, useRestoreWorkforcePlan, useSubmitWorkforcePlan, useUpdateWorkforcePlan, useWorkforcePlan, useWorkforcePlanLocalDraft, useWorkforcePlanLocalDrafts, useWorkforcePlanRevisions, useWorkforcePlans, useRetryWorkforcePlanLocalDraft } from '../queries/use-workforce-plans';
import type { WorkforcePlan, WorkforcePlanPageQuery, WorkforcePlanRequest } from '../../domain/models/workforce-plan';
import type { WorkforcePlanEditingSnapshot } from '../../domain/models/workforce-plan-draft';

type FormMode = 'create' | 'edit' | 'view';
type PendingKind = 'submit' | 'beginReview' | 'approve' | 'reject' | 'createRevision' | 'archive' | 'restore';
type Pending = { kind: PendingKind; item: WorkforcePlan } | null;
const initialFilters: WorkforcePlanFilters = { status: 'all', recordStatus: 'active', fiscalYearId: 0 };
const statusKeys = ['', 'draft', 'submitted', 'underReview', 'approved', 'rejected', 'superseded'] as const;
const lifecycleKind = (item: WorkforcePlan): PendingKind => item.status === 2 ? 'beginReview' : item.status === 3 ? 'approve' : [4, 6].includes(item.status) ? 'createRevision' : 'submit';

export function WorkforcePlansScreen() {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly(); const { isOnline } = useConnectivity();
  const { allowed: viewAllowed } = useAuthorization({ requiredPermissions: [permissions.ViewWorkforcePlans] });
  const { allowed: createAllowed } = useAuthorization({ requiredPermissions: [permissions.CreateWorkforcePlans] });
  const { allowed: editAllowed } = useAuthorization({ requiredPermissions: [permissions.EditWorkforcePlans] });
  const { allowed: deleteAllowed } = useAuthorization({ requiredPermissions: [permissions.DeleteWorkforcePlans] });
  const { allowed: approveAllowed } = useAuthorization({ requiredPermissions: [permissions.ApproveWorkforcePlans] });
  const canCreate = createAllowed && !isReadOnly; const canEdit = editAllowed && !isReadOnly; const canDelete = deleteAllowed && !isReadOnly; const canApprove = approveAllowed && !isReadOnly;
  const list = useServerListState<WorkforcePlanPageQuery['sortBy'], WorkforcePlanFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const queryArgs = useMemo<WorkforcePlanPageQuery>(() => ({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, fiscalYearId: list.state.filters.fiscalYearId || undefined, status: list.state.filters.status, recordStatus: list.state.filters.recordStatus, search: list.state.search, sortBy: list.state.sort?.columnId ?? 'createdOn', sortDirection: list.state.sort?.direction === 'ascending' ? 'asc' : 'desc' }), [list.state]);
  const query = useWorkforcePlans(queryArgs); const fiscalYears = useFiscalYearLookup();
  const localDrafts = useWorkforcePlanLocalDrafts();
  const [formOpen, setFormOpen] = useState(false); const [formMode, setFormMode] = useState<FormMode>('view'); const [selected, setSelected] = useState<WorkforcePlan | null>(null); const [pending, setPending] = useState<Pending>(null); const [reason, setReason] = useState(''); const [reasonTouched, setReasonTouched] = useState(false);
  const details = useWorkforcePlan(selected?.id ?? null, formOpen && formMode !== 'create'); const revisions = useWorkforcePlanRevisions(selected?.id ?? null, formOpen && formMode === 'view');
  const localDraft = useWorkforcePlanLocalDraft(selected?.id ?? null, formOpen && formMode === 'edit'); const discardLocalDraft = useDiscardWorkforcePlanLocalDraft();
  const create = useCreateWorkforcePlan(); const update = useUpdateWorkforcePlan(); const archive = useArchiveWorkforcePlan(); const restore = useRestoreWorkforcePlan(); const submitPlan = useSubmitWorkforcePlan(); const beginReview = useBeginWorkforcePlanReview(); const approve = useApproveWorkforcePlan(); const reject = useRejectWorkforcePlan(); const createRevision = useCreateWorkforcePlanRevision(); const retryDraft = useRetryWorkforcePlanLocalDraft();
  const localRows = useMemo(() => localDrafts.data?.map((entry) => entry.plan) ?? [], [localDrafts.data]);
  const rows = useMemo(() => {
    const remoteRows = query.data?.items ?? [];
    if (isOnline && !query.error) return remoteRows;
    const known = new Set(remoteRows.map((item) => item.id));
    return [...remoteRows, ...localRows.filter((item) => !known.has(item.id))];
  }, [isOnline, localRows, query.data?.items, query.error]);
  const fiscalOptions = useMemo<AppSelectOption<number>[]>(() => (fiscalYears.data ?? []).map(year => ({ value: year.id, label: `${year.code} — ${i18n.language.startsWith('ar') ? year.nameAr : year.nameEn}`, icon: 'calendar-outline' })), [fiscalYears.data, i18n.language]);
  const openForm = useCallback((mode: FormMode, item: WorkforcePlan | null) => { if (mode !== 'view' && isReadOnly) return notifyBlockedAction(); setSelected(item); setFormMode(mode); setFormOpen(true); }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelected(null); }, []);
  const effectiveDetail = details.data ?? localDraft.data?.draft.baseDetail ?? null;
  const save = useCallback(async (request: WorkforcePlanRequest, snapshot: WorkforcePlanEditingSnapshot, forceLocal = false) => { try { if (formMode === 'create') { await create.mutateAsync(request); showToast.success(t('workforcePlanning.messages.created')); } else { if (!selected || !effectiveDetail) throw new Error(t('workforcePlanning.offline.requiresBase')); const result = await update.mutateAsync({ id: selected.id, baseDetail: effectiveDetail, editingSnapshot: snapshot, keepLocal: forceLocal || Boolean(localDraft.data && localDraft.data.status !== 'succeeded'), request: { titleEn: request.titleEn, titleAr: request.titleAr, description: request.description, lines: request.lines, rowVersion: localDraft.data?.draft.request.rowVersion ?? effectiveDetail.rowVersion } }); showToast.success(t(result.kind === 'queued' ? 'workforcePlanning.offline.queuedMessage' : result.kind === 'draft' ? 'workforcePlanning.offline.draftSavedMessage' : 'workforcePlanning.messages.updated')); } closeForm(); } catch (error) { showToast.error(error, t('workforcePlanning.messages.saveFailed')); } }, [closeForm, create, effectiveDetail, formMode, localDraft.data, selected, t, update]);
  const saveLocally = useCallback((request: WorkforcePlanRequest, snapshot: WorkforcePlanEditingSnapshot) => save(request, snapshot, true), [save]);
  const beginPending = useCallback((item: WorkforcePlan, kind = lifecycleKind(item)) => { if (isReadOnly) return notifyBlockedAction(); setSelected(item); setReason(''); setReasonTouched(false); setPending({ kind, item }); }, [isReadOnly, notifyBlockedAction]);
  const confirm = useCallback(async () => {
    if (!pending) return; if (isReadOnly) return notifyBlockedAction(); const action = { id: pending.item.id, rowVersion: pending.item.rowVersion };
    if (pending.kind === 'reject' && !reason.trim()) { setReasonTouched(true); return; }
    try {
      if (pending.kind === 'submit') await submitPlan.mutateAsync(action);
      else if (pending.kind === 'beginReview') await beginReview.mutateAsync(action);
      else if (pending.kind === 'approve') await approve.mutateAsync(action);
      else if (pending.kind === 'reject') await reject.mutateAsync({ ...action, reason: reason.trim() });
      else if (pending.kind === 'createRevision') await createRevision.mutateAsync(action);
      else if (pending.kind === 'archive') await archive.mutateAsync(action);
      else await restore.mutateAsync(action);
      showToast.success(t(`workforcePlanning.messages.${pending.kind}`)); setPending(null); setSelected(null);
    } catch (error) { showToast.error(error, t('workforcePlanning.messages.actionFailed')); }
  }, [approve, archive, beginReview, createRevision, isReadOnly, notifyBlockedAction, pending, reason, reject, restore, submitPlan, t]);
  const actions = useCallback((item: WorkforcePlan) => <View style={styles.actions}>
    <AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />
    {!item.isDeleted && canEdit && [1, 5].includes(item.status) ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}
    {!item.isDeleted && ((item.status === 2 || item.status === 3) ? canApprove : [4, 6].includes(item.status) ? canCreate : canEdit) ? <AppIconButton icon={item.status === 2 ? 'search-outline' : item.status === 3 ? 'checkmark-circle-outline' : [4, 6].includes(item.status) ? 'copy-outline' : 'send-outline'} label={t(`workforcePlanning.actions.${lifecycleKind(item)}`)} onPress={() => beginPending(item)} /> : null}
    {!item.isDeleted && canApprove && item.status === 3 ? <AppIconButton icon="close-circle-outline" label={t('workforcePlanning.actions.reject')} onPress={() => beginPending(item, 'reject')} /> : null}
    {canDelete && (item.isDeleted || [1, 5].includes(item.status)) ? <AppIconButton icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(`workforcePlanning.actions.${item.isDeleted ? 'restore' : 'archive'}`)} onPress={() => beginPending(item, item.isDeleted ? 'restore' : 'archive')} /> : null}
  </View>, [beginPending, canApprove, canCreate, canDelete, canEdit, openForm, t]);
  const columns = useMemo<AppDataTableColumn<WorkforcePlan>[]>(() => [
    { id: 'planCode', header: t('workforcePlanning.fields.planCode'), width: 140, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.planCode}</AppText> },
    { id: 'titleEn', header: t('workforcePlanning.fields.titleEn'), width: 190, sortable: true, render: item => <AppText variant="bodySmall">{item.titleEn}</AppText> },
    { id: 'revisionNumber', header: t('workforcePlanning.fields.revision'), width: 90, render: item => <AppText variant="bodySmall">{item.revisionNumber}</AppText> },
    { id: 'newHireSlots', header: t('workforcePlanning.fields.newHireSlots'), width: 170, render: item => <AppText variant="bodySmall">{item.newHireSlots}</AppText> },
    { id: 'replacementSlots', header: t('workforcePlanning.fields.replacementSlots'), width: 150, render: item => <AppText variant="bodySmall">{item.replacementSlots}</AppText> },
    { id: 'plannedHiringSlots', header: t('workforcePlanning.fields.plannedHiringSlots'), width: 160, render: item => <AppText variant="bodySmall" weight="700">{item.plannedHiringSlots}</AppText> },
    { id: 'status', header: t('workforcePlanning.fields.status'), width: 170, sortable: true, render: item => <AppStatusBadge color={item.isDeleted ? theme.colors.textMuted : item.status === 4 ? theme.colors.success : item.status === 5 ? theme.colors.danger : theme.colors.primary} label={`${t(`workforcePlanning.status.${statusKeys[item.status]}`)}${item.isDeleted ? ` • ${t('workforcePlanning.recordStatus.archived')}` : ''}`} /> },
    { id: 'actions', header: t('common.actions'), width: 220, align: 'center', render: actions },
  ], [actions, t, theme.colors.danger, theme.colors.primary, theme.colors.success, theme.colors.textMuted]);
  if (!viewAllowed) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if (query.isLoading && rows.length === 0) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error && rows.length === 0) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error, t('workforcePlanning.messages.fetchError'))} onRetry={() => void query.refetch()} /></AppScreen>;
  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppListScreen<WorkforcePlan, 'table' | 'cards'> defaultView="table" items={rows} isFetching={query.isFetching} emptyContent={<AppStateView state="empty" message={t('workforcePlanning.empty')} />} fillViewSelector showViewLabels showResultCount={false} searchValue={list.searchInput} searchPlaceholder={t('workforcePlanning.search.placeholder')} onSearchChange={list.setSearchInput}
      filterControl={<WorkforcePlanFilterButton values={list.state.filters} fiscalYears={fiscalOptions} onApply={values => { list.setFilters(values); list.setPage(0); }} />}
      searchActions={canCreate ? <AppIconButton icon="add-outline" label={t('workforcePlanning.actions.add')} color={theme.colors.onPrimary} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? .75 : 1 })} /> : null}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: query.data?.metaData.totalCount ?? 0, pageSizeOptions: [3, 5, 10], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
      views={[{ value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: query.data?.metaData.totalCount ?? 0, sort: list.state.sort, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: sort => list.setSort(sort ? { ...sort, columnId: sort.columnId as WorkforcePlanPageQuery['sortBy'] } : null) }} /> }, { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: items => <View style={styles.cards}>{items.map(item => <AppDataCard key={item.id} padding="md"><View style={styles.cardHeader}><View style={styles.cardTitle}><AppText variant="titleSmall" weight="800">{item.titleEn}</AppText><AppText color="muted" variant="caption">{item.titleAr} • {item.planCode}</AppText></View><AppStatusBadge color={item.isDeleted ? theme.colors.textMuted : item.status === 4 ? theme.colors.success : item.status === 5 ? theme.colors.danger : theme.colors.primary} label={`${t(`workforcePlanning.status.${statusKeys[item.status]}`)}${item.isDeleted ? ` • ${t('workforcePlanning.recordStatus.archived')}` : ''}`} /></View><AppText variant="bodySmall">{t('workforcePlanning.lines.count', { count: item.linesCount })} • {t('workforcePlanning.slots.count', { count: item.plannedHiringSlots })}</AppText><View style={styles.slotBadges}><AppStatusBadge color={theme.colors.success} label={t('workforcePlanning.slots.new', { count: item.newHireSlots })} /><AppStatusBadge color={theme.colors.primary} label={t('workforcePlanning.slots.replacement', { count: item.replacementSlots })} /></View><AppText color="muted" variant="caption">{t('workforcePlanning.revisions.short', { revision: item.revisionNumber })}</AppText>{actions(item)}</AppDataCard>)}</View> }]} />
    {formOpen ? <WorkforcePlanForm key={`${formMode}-${selected?.id ?? 'new'}-${effectiveDetail?.rowVersion ?? 'pending'}`} item={effectiveDetail} draftRequest={localDraft.data?.draft.request ?? null} draftStatus={localDraft.data?.status ?? null} draftError={localDraft.data?.lastError} editingSnapshot={localDraft.data?.draft.editingSnapshot} revisions={revisions.data ?? []} mode={formMode} loading={create.isPending || update.isPending || discardLocalDraft.isPending || retryDraft.isPending} detailLoading={formMode !== 'create' && !effectiveDetail && !details.error} detailError={!effectiveDetail && formMode === 'edit' && details.error ? t('workforcePlanning.offline.requiresBase') : details.error && !localDraft.data ? errorMessage(details.error, t('workforcePlanning.messages.fetchError')) : null} onDiscardDraft={selected && localDraft.data && ['conflict', 'uncertain', 'dead-letter'].includes(localDraft.data.status ?? '') ? () => { void discardLocalDraft.mutateAsync(selected.id).then(() => details.refetch()); } : undefined} onRetryDraft={selected && localDraft.data?.status === 'dead-letter' ? () => { void retryDraft.mutateAsync(selected.id); } : undefined} onRetryDetail={() => void details.refetch()} onClose={closeForm} onSave={save} onSaveLocally={saveLocally} /> : null}
    <ConfirmationDialog visible={pending !== null} title={t(`workforcePlanning.confirm.${pending?.kind ?? 'submit'}Title`)} description={t(`workforcePlanning.confirm.${pending?.kind ?? 'submit'}Description`)} confirmLabel={t(`workforcePlanning.actions.${pending?.kind ?? 'submit'}`)} tone={pending?.kind === 'reject' || pending?.kind === 'archive' ? 'danger' : 'default'} loading={submitPlan.isPending || beginReview.isPending || approve.isPending || reject.isPending || createRevision.isPending || archive.isPending || restore.isPending} onCancel={() => setPending(null)} onConfirm={confirm}>
      {pending?.kind === 'reject' ? <AppTextField autoFocus multiline required label={t('workforcePlanning.fields.decisionReason')} value={reason} onChangeText={setReason} error={reasonTouched && !reason.trim() ? t('workforcePlanning.validation.reason') : undefined} /> : <AppText weight="700">{pending?.item.planCode}</AppText>}
    </ConfirmationDialog>
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }, cards: { gap: 8 }, slotBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, cardTitle: { flex: 1, gap: 2 } });
