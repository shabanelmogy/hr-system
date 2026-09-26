import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { useCurrencyLookup } from '@/src/modules/accounting/currencies';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataTable, type AppDataTableColumn, AppHierarchicalTree, AppIconButton, AppListScreen, AppScreen, AppSegmentedControl, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import type { Account, AccountPageQuery, AccountRecordStatus, AccountRequest, AccountSearchField, AccountSearchOperator, AccountSortColumn, AccountTreeNode } from '../../domain/models/coa-hierarchy';
import { AccountFilterButton } from '../components/AccountFilterButton';
import { AccountForm } from '../components/AccountForm';
import { useAccountCodeProposal, useAccountDetail, useAccountLookup, useAccountPage, useAccountTree, useArchiveAccount, useFreshAccountDetail, useHierarchyLevels, useRestoreAccount, useSaveAccount } from '../queries/use-coa-hierarchy';

type WorkspaceView = 'tree' | 'records';
type FormMode = 'create' | 'edit' | 'view';
type Pending = { kind: 'archive' | 'restore'; item: Account } | null;
interface AccountFilters { recordStatus: AccountRecordStatus }
const initialFilters: AccountFilters = { recordStatus: 'active' };

export function AccountsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canView } = useAuthorization({ requiredPermissions: [permissions.ViewAccounts] });
  const { allowed: createAllowed } = useAuthorization({ requiredPermissions: [permissions.CreateAccounts] });
  const { allowed: editAllowed } = useAuthorization({ requiredPermissions: [permissions.EditAccounts] });
  const { allowed: archiveAllowed } = useAuthorization({ requiredPermissions: [permissions.ArchiveAccounts] });
  const { allowed: restoreAllowed } = useAuthorization({ requiredPermissions: [permissions.RestoreAccounts] });
  const canCreate = createAllowed && !isReadOnly;
  const canEdit = editAllowed && !isReadOnly;
  const canArchive = archiveAllowed && !isReadOnly;
  const canRestore = restoreAllowed && !isReadOnly;
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('tree');
  const list = useServerListState<AccountSortColumn, AccountFilters>({ initialFilters, initialPageSize: 10, initialSort: { columnId: 'code', direction: 'ascending' } });
  const [searchField, setSearchField] = useState<AccountSearchField>('all');
  const [searchOperator, setSearchOperator] = useState<AccountSearchOperator>('contains');
  const pageRequest: AccountPageQuery = { pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, search: list.state.search, searchField, searchOperator, recordStatus: list.state.filters.recordStatus, sortBy: list.state.sort?.columnId ?? 'code', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc' };
  const pageQuery = useAccountPage(pageRequest, canView && workspaceView === 'records');
  const treeQuery = useAccountTree(canView && workspaceView === 'tree');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [initialParentId, setInitialParentId] = useState<number | null>(null);
  const [proposalSession, setProposalSession] = useState(0);
  const [pending, setPending] = useState<Pending>(null);
  const details = useAccountDetail(selectedId, formOpen && formMode !== 'create');
  const accountLookup = useAccountLookup(formOpen);
  const levelLookup = useHierarchyLevels('active', formOpen);
  const currencyLookup = useCurrencyLookup(formOpen);
  const proposal = useAccountCodeProposal(formOpen && formMode === 'create', proposalSession);
  const fetchFreshDetail = useFreshAccountDetail();
  const saveMutation = useSaveAccount();
  const archiveMutation = useArchiveAccount();
  const restoreMutation = useRestoreAccount();

  const openForm = useCallback(async (mode: FormMode, id: number | null = null, parentId: number | null = null) => {
    if (mode !== 'view' && isReadOnly) return notifyBlockedAction();
    if (mode === 'create') setProposalSession(current => current + 1);
    if (mode !== 'create' && id !== null) {
      try { await fetchFreshDetail(id); }
      catch (error) { showToast.error(error, t('coaHierarchy.messages.detailFailed')); return; }
    }
    setSelectedId(id); setInitialParentId(parentId); setFormMode(mode); setFormOpen(true);
  }, [fetchFreshDetail, isReadOnly, notifyBlockedAction, t]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelectedId(null); setInitialParentId(null); setPending(null); }, []);

  const save = useCallback(async (request: AccountRequest) => {
    try {
      await saveMutation.mutateAsync({ id: formMode === 'edit' ? selectedId : null, request, rowVersion: formMode === 'edit' ? details.data?.rowVersion : undefined });
      showToast.success(t(formMode === 'edit' ? 'coaHierarchy.messages.accountUpdated' : 'coaHierarchy.messages.accountCreated'));
      closeForm();
    } catch (error) {
      if (formMode === 'create' && error instanceof ApiError && error.status === 409) await proposal.refetch();
      if (isConcurrencyConflict(error)) {
        await details.refetch(); closeForm(); showToast.warning(t('coaHierarchy.messages.conflictReloaded')); return;
      }
      throw error;
    }
  }, [closeForm, details, formMode, proposal, saveMutation, selectedId, t]);

  const confirmLifecycle = useCallback(async () => {
    if (!pending) return;
    if (isReadOnly) return notifyBlockedAction();
    try {
      const latest = await fetchFreshDetail(pending.item.id);
      if (pending.kind === 'archive') await archiveMutation.mutateAsync({ id: latest.id, rowVersion: latest.rowVersion });
      else await restoreMutation.mutateAsync({ id: latest.id, rowVersion: latest.rowVersion });
      showToast.success(t(pending.kind === 'archive' ? 'coaHierarchy.messages.accountArchived' : 'coaHierarchy.messages.accountRestored'));
      closeForm();
    } catch (error) {
      if (isConcurrencyConflict(error) || isUncertainFailure(error)) {
        await details.refetch(); setPending(null); showToast.warning(t('coaHierarchy.messages.conflictReloaded')); return;
      }
      showToast.error(error, t('coaHierarchy.messages.actionFailed'));
    }
  }, [archiveMutation, closeForm, details, fetchFreshDetail, isReadOnly, notifyBlockedAction, pending, restoreMutation, t]);

  const beginEdit = useCallback(async () => {
    if (selectedId === null) return;
    try { await fetchFreshDetail(selectedId); setFormMode('edit'); }
    catch (error) { showToast.error(error, t('coaHierarchy.messages.detailFailed')); }
  }, [fetchFreshDetail, selectedId, t]);

  const beginLifecycle = useCallback(async () => {
    if (selectedId === null) return;
    try {
      const latest = await fetchFreshDetail(selectedId);
      setPending({ kind: latest.isDeleted ? 'restore' : 'archive', item: latest });
    } catch (error) { showToast.error(error, t('coaHierarchy.messages.detailFailed')); }
  }, [fetchFreshDetail, selectedId, t]);

  const columns = useMemo<AppDataTableColumn<Account>[]>(() => [
    { id: 'code', header: t('coaHierarchy.fields.code'), width: 130, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.code}</AppText> },
    { id: 'nameEn', header: t('coaHierarchy.fields.nameEn'), width: 190, sortable: true, render: item => <AppText variant="bodySmall">{item.nameEn}</AppText> },
    { id: 'nameAr', header: t('coaHierarchy.fields.nameAr'), width: 190, sortable: true, render: item => <AppText variant="bodySmall">{item.nameAr}</AppText> },
    { id: 'allowPosting', header: t('coaHierarchy.fields.allowPosting'), width: 120, render: item => <AppText variant="bodySmall">{t(item.allowPosting ? 'coaHierarchy.common.yes' : 'coaHierarchy.common.no')}</AppText> },
    { id: 'status', header: t('coaHierarchy.fields.status'), width: 110, render: item => <AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'coaHierarchy.status.archived' : 'coaHierarchy.status.active')} /> },
    { id: 'actions', header: t('common.actions'), width: 110, align: 'center', render: item => <View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => void openForm('view', item.id)} />{canEdit && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => void openForm('edit', item.id)} /> : null}</View> },
  ], [canEdit, openForm, t, theme.colors.success, theme.colors.warning]);

  if (!canView) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  const activeQuery = workspaceView === 'tree' ? treeQuery : pageQuery;
  if (activeQuery.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (activeQuery.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(activeQuery.error, t('coaHierarchy.messages.loadFailed'))} onRetry={() => void activeQuery.refetch()} /></AppScreen>;

  const lookupError = accountLookup.error ?? levelLookup.error ?? currencyLookup.error;
  const filterValues = { recordStatus: list.state.filters.recordStatus, searchField, searchOperator };
  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={activeQuery.isRefetching} onRefresh={() => void activeQuery.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppSegmentedControl label={t('coaHierarchy.accounts.workspace')} value={workspaceView} onChange={setWorkspaceView} options={[{ value: 'tree', label: t('coaHierarchy.accounts.views.tree'), icon: 'git-branch-outline' }, { value: 'records', label: t('coaHierarchy.accounts.views.records'), icon: 'grid-outline' }]} />
    {workspaceView === 'tree' ? <>
      <View style={styles.treeActions}>{canCreate ? <AppIconButton icon="add-outline" label={t('coaHierarchy.accounts.actions.add')} color={theme.colors.onPrimary} onPress={() => void openForm('create')} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null}</View>
      <AppHierarchicalTree<AccountTreeNode> items={treeQuery.data ?? []} getId={item => item.id} getParentId={item => item.parentAccountId} getLabel={item => `${item.nameEn} / ${item.nameAr}`} getCode={item => item.code} onView={item => { void openForm('view', item.id); }} onAddChild={canCreate ? item => { void openForm('create', null, item.id); } : undefined} canAddChild={item => !item.allowPosting} canCreate={canCreate} canEdit={false} canDelete={false} rootLabel={t('coaHierarchy.accounts.root')} emptyMessage={t('coaHierarchy.accounts.emptyTree')} />
    </> : <AppListScreen<Account, 'table'> defaultView="table" items={pageQuery.data?.items ?? []} isFetching={pageQuery.isFetching} emptyContent={<AppStateView state="empty" message={t('coaHierarchy.accounts.empty')} />} showResultCount={false} searchValue={list.searchInput} searchPlaceholder={t('coaHierarchy.search.placeholder')} onSearchChange={list.setSearchInput}
      filterControl={<AccountFilterButton values={filterValues} onApply={values => { setSearchField(values.searchField); setSearchOperator(values.searchOperator); list.setFilters({ recordStatus: values.recordStatus }); list.setPage(0); }} />}
      searchActions={canCreate ? <AppIconButton icon="add-outline" label={t('coaHierarchy.accounts.actions.add')} color={theme.colors.onPrimary} onPress={() => void openForm('create')} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: pageQuery.data?.metaData.totalCount ?? 0, pageSizeOptions: [10, 25, 50], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
      views={[{ value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 10, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: pageQuery.data?.metaData.totalCount ?? 0, sort: list.state.sort, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: sort => list.setSort(sort ? { ...sort, columnId: sort.columnId as AccountSortColumn } : null) }} /> }]} />}
    {formOpen && (formMode === 'create' || details.data) ? <AccountForm key={`${formMode}-${selectedId ?? 'new'}-${initialParentId ?? 0}`} item={formMode === 'create' ? null : details.data ?? null} mode={formMode} proposal={proposal.data?.code} proposalLoading={proposal.isFetching} proposalError={proposal.error ? errorMessage(proposal.error, t('coaHierarchy.messages.proposalFailed')) : null} onRetryProposal={() => void proposal.refetch()} hierarchyLevels={levelLookup.data ?? []} accounts={accountLookup.data ?? []} currencies={currencyLookup.data ?? []} lookupsLoading={levelLookup.isFetching || accountLookup.isFetching || currencyLookup.isFetching} lookupsError={lookupError ? errorMessage(lookupError, t('coaHierarchy.messages.lookupFailed')) : null} onRetryLookups={() => { void levelLookup.refetch(); void accountLookup.refetch(); void currencyLookup.refetch(); }} loading={saveMutation.isPending} initialParentId={initialParentId} canManage={formMode === 'create' ? canCreate : formMode === 'edit' ? canEdit : canEdit || canArchive || canRestore} onClose={closeForm} onSave={save} onEdit={details.data && !details.data.isDeleted && canEdit ? () => { void beginEdit(); } : undefined} onLifecycle={details.data && (details.data.isDeleted ? canRestore : canArchive) ? () => { void beginLifecycle(); } : undefined} /> : null}
    {formOpen && formMode !== 'create' && details.isFetching && !details.data ? <AppStateView state="loading" /> : null}
    {formOpen && formMode !== 'create' && details.error && !details.data ? <AppStateView state="error" message={errorMessage(details.error, t('coaHierarchy.messages.detailFailed'))} onRetry={() => void details.refetch()} /> : null}
    <ConfirmationDialog visible={pending !== null} title={t(`coaHierarchy.confirm.${pending?.kind ?? 'archive'}Title`)} description={t(`coaHierarchy.confirm.${pending?.kind ?? 'archive'}Description`, { code: pending?.item.code ?? '' })} confirmLabel={t(pending?.kind === 'restore' ? 'common.restore' : 'common.archive')} tone={pending?.kind === 'archive' ? 'warning' : 'default'} loading={archiveMutation.isPending || restoreMutation.isPending} onCancel={() => setPending(null)} onConfirm={() => void confirmLifecycle()} />
  </AppScreen>;
}

function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function isConcurrencyConflict(error: unknown) { return error instanceof ApiError && error.status === 409 && error.problem?.code === 'Accounting.ConcurrencyConflict'; }
function isUncertainFailure(error: unknown) { return error instanceof ApiError && error.status === 0; }

const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4 }, treeActions: { minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' } });
