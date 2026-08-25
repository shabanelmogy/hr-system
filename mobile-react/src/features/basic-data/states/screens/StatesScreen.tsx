import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppButton, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import { StateCard } from '../components/StateCard';
import { StatesChartView } from '../components/StatesChartView';
import { StateForm } from '../components/StateForm';
import { StateReportView } from '../components/StateReportView';
import { StateFilterButton } from '../components/StateFilterButton';
import { StateImportView } from '../components/import-data/StateImportView';
import { useArchiveState, useBulkArchiveStates, useRestoreState, useSaveState, useStates } from '../queries/use-states';
import type { State, StateFilters, StateRequest, StateSearchField, StateSearchOperator, StateSortColumn } from '../types/state';

type FormMode = 'create' | 'edit' | 'view';
type PendingAction = { kind: 'archive'; state: State } | { kind: 'bulk' } | null;
const initialFilters: StateFilters = { status: 'active' };

export function StatesScreen() {
  const { i18n, t } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: isCreateAuthorized } = useAuthorization({ allowSuperAdmin: true, requiredPermissions: [permissions.CreateStates] });
  const { allowed: isEditAuthorized } = useAuthorization({ allowSuperAdmin: true, requiredPermissions: [permissions.EditStates] });
  const { allowed: isDeleteAuthorized } = useAuthorization({ allowSuperAdmin: true, requiredPermissions: [permissions.DeleteStates] });
  const canCreate = isCreateAuthorized && !isReadOnly; const canEdit = isEditAuthorized && !isReadOnly; const canDelete = isDeleteAuthorized && !isReadOnly;
  const list = useServerListState<StateSortColumn, StateFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const [searchField, setSearchField] = useState<StateSearchField>('all'); const [searchOperator, setSearchOperator] = useState<StateSearchOperator>('contains');
  const statesQuery = useStates({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, search: list.state.search, searchField, searchOperator, status: list.state.filters.status, sortBy: list.state.sort?.columnId ?? 'createdOn', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc' });
  const saveMutation = useSaveState(); const archiveMutation = useArchiveState(); const restoreMutation = useRestoreState(); const bulkArchiveMutation = useBulkArchiveStates();
  const [formMode, setFormMode] = useState<FormMode>('view'); const [selectedState, setSelectedState] = useState<State | null>(null); const [pendingAction, setPendingAction] = useState<PendingAction>(null); const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const rows = statesQuery.data?.items ?? []; const listFilters = list.state.filters;
  const clearBulkSelection = useCallback(() => { setSelectedIds([]); setPendingAction((current) => current?.kind === 'bulk' ? null : current); }, []);
  const changeSearch = useCallback((value: string) => { clearBulkSelection(); list.setSearchInput(value); }, [clearBulkSelection, list]);
  const changePage = useCallback((page: number) => { clearBulkSelection(); list.setPage(page); }, [clearBulkSelection, list]);
  const changePageSize = useCallback((pageSize: number) => { clearBulkSelection(); list.setPageSize(pageSize); }, [clearBulkSelection, list]);
  const changeSort = useCallback((sort: { columnId: string; direction: 'ascending' | 'descending' } | null) => { clearBulkSelection(); list.setSort(sort ? { columnId: sort.columnId as StateSortColumn, direction: sort.direction } : null); }, [clearBulkSelection, list]);
  const applyFilters = useCallback((next: { field: StateSearchField; operator: StateSearchOperator; status: StateFilters['status'] }) => {
    clearBulkSelection();
    setSearchField(next.field);
    setSearchOperator(next.operator);
    list.setFilters({ ...listFilters, status: next.status });
    list.setPage(0);
  }, [clearBulkSelection, list, listFilters]);
  const openForm = useCallback((mode: FormMode, state: State | null) => { if (mode !== 'view' && isReadOnly) { notifyBlockedAction(); return; } setFormMode(mode); setSelectedState(state); }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => { setSelectedState(null); setFormMode('view'); }, []);
  const toggleSelection = useCallback((state: State) => setSelectedIds((ids) => ids.includes(state.id) ? ids.filter((id) => id !== state.id) : [...ids, state.id]), []);
  const save = useCallback(async (request: StateRequest) => { if (isReadOnly) return notifyBlockedAction(); if (!(formMode === 'edit' ? isEditAuthorized : isCreateAuthorized)) return; try { await saveMutation.mutateAsync({ id: formMode === 'edit' ? selectedState?.id ?? null : null, request }); closeForm(); showToast.success(t('states.saved')); } catch (error) { showToast.error(error, t('states.saveFailed')); } }, [closeForm, formMode, isCreateAuthorized, isEditAuthorized, isReadOnly, notifyBlockedAction, saveMutation, selectedState?.id, t]);
  const restore = useCallback(async (state: State) => { if (isReadOnly) return notifyBlockedAction(); if (!isDeleteAuthorized) return; try { await restoreMutation.mutateAsync(state.id); showToast.success(t('states.restored')); } catch (error) { showToast.error(error, t('states.restoreFailed')); } }, [isDeleteAuthorized, isReadOnly, notifyBlockedAction, restoreMutation, t]);
  const confirmAction = useCallback(async () => { if (!pendingAction) return; if (isReadOnly) return notifyBlockedAction(); if (!isDeleteAuthorized) return; try { if (pendingAction.kind === 'bulk') { const result = await bulkArchiveMutation.mutateAsync(selectedIds); setSelectedIds([]); showToast.success(t('states.bulkArchived', { count: result.archivedCount })); } else { await archiveMutation.mutateAsync(pendingAction.state.id); setSelectedIds((ids) => ids.filter((id) => id !== pendingAction.state.id)); showToast.success(t('states.archivedSuccess')); } setPendingAction(null); } catch (error) { showToast.error(error, t('states.archiveFailed')); } }, [archiveMutation, bulkArchiveMutation, isDeleteAuthorized, isReadOnly, notifyBlockedAction, pendingAction, selectedIds, t]);
  const columns = useMemo<AppDataTableColumn<State>[]>(() => [
    { id: 'nameEn', header: t('states.nameEn'), width: 160, sortable: true, render: (state) => <AppText variant="bodySmall" weight="700">{state.nameEn}</AppText> },
    { id: 'nameAr', header: t('states.nameAr'), width: 160, sortable: true, render: (state) => <AppText variant="bodySmall">{state.nameAr}</AppText> },
    { id: 'code', header: t('states.code'), width: 92, sortable: true, align: 'center', render: (state) => <AppText variant="bodySmall">{state.code}</AppText> },
    { id: 'country', header: t('states.country'), width: 140, sortable: true, render: (state) => <AppText variant="bodySmall">{state.country.nameEn}</AppText> },
    { id: 'districts', header: t('states.districts'), width: 90, align: 'center', render: (state) => <AppText variant="bodySmall">{state.districtsCount}</AppText> },
    { id: 'createdOn', header: t('states.createdOn'), width: 132, sortable: true, render: (state) => <AppText variant="bodySmall">{formatDate(state.createdOn, i18n.language)}</AppText> },
    { id: 'status', header: t('states.status'), width: 108, align: 'center', render: (state) => <AppStatusBadge color={state.isDeleted ? theme.colors.warning : theme.colors.success} label={t(state.isDeleted ? 'states.archived' : 'states.active')} /> },
    { id: 'actions', header: t('states.actions'), width: 180, align: 'center', render: (state) => <View style={styles.tableActions}><AppIconButton icon="eye-outline" label={t('states.viewState')} onPress={() => openForm('view', state)} />{canEdit && !state.isDeleted ? <AppIconButton icon="create-outline" label={t('states.editState')} onPress={() => openForm('edit', state)} /> : null}{canDelete ? <AppIconButton icon={state.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(state.isDeleted ? 'states.restore' : 'states.archive')} onPress={() => state.isDeleted ? void restore(state) : setPendingAction({ kind: 'archive', state })} /> : null}</View> },
  ], [canDelete, canEdit, i18n.language, openForm, restore, t, theme.colors.success, theme.colors.warning]);
  if (statesQuery.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (statesQuery.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView message={errorMessage(statesQuery.error, t('states.loadFailed'))} onRetry={() => void statesQuery.refetch()} state="error" /></AppScreen>;
  return <AppScreen contentContainerStyle={styles.screen} edges={['left', 'right', 'bottom']} refreshControl={<RefreshControl colors={[theme.colors.primary]} onRefresh={() => void statesQuery.refetch()} refreshing={statesQuery.isRefetching} tintColor={theme.colors.primary} />}>
    <AppListScreen<State, 'table' | 'cards' | 'chart' | 'report' | 'import'> aboveViews={selectedIds.length > 0 && canDelete ? <AppButton icon="archive-outline" onPress={() => setPendingAction({ kind: 'bulk' })} variant="outline">{t('states.archiveSelected', { count: selectedIds.length })}</AppButton> : null} defaultView="table" emptyContent={<AppStateView message={t('states.empty')} state="empty" />} fillViewSelector filterControl={<StateFilterButton field={searchField} onApply={applyFilters} operator={searchOperator} status={list.state.filters.status} />} isFetching={statesQuery.isFetching} items={rows} onSearchChange={changeSearch} searchActions={canCreate ? <AppIconButton color={theme.colors.onPrimary} icon="add-outline" label={t('states.addState')} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null} searchPlaceholder={t('states.search')} searchValue={list.searchInput} serverPagination={{ onPageChange: changePage, onPageSizeChange: changePageSize, page: list.state.page, pageSize: list.state.pageSize, pageSizeOptions: [3, 5, 10], totalItems: statesQuery.data?.metaData.totalCount ?? 0 }} showResultCount={false} showViewLabels views={[
      { value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: (items) => <AppDataTable columns={columns} getRowKey={(state) => state.id} rows={items} showPagination={false} serverState={{ onPageChange: changePage, onPageSizeChange: changePageSize, onSortChange: changeSort, page: list.state.page, pageSize: list.state.pageSize, sort: list.state.sort, totalRows: statesQuery.data?.metaData.totalCount ?? 0 }} /> },
      { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: (items) => <View style={styles.cards}>{items.map((state) => <StateCard canDelete={canDelete} canEdit={canEdit} key={state.id} onArchive={(item) => setPendingAction({ kind: 'archive', state: item })} onEdit={(item) => openForm('edit', item)} onRestore={(item) => void restore(item)} onToggleSelection={toggleSelection} onView={(item) => openForm('view', item)} selected={selectedIds.includes(state.id)} state={state} />)}</View> },
      { value: 'chart', icon: 'stats-chart-outline', label: t('states.chartView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: (items) => <StatesChartView states={items} totalCount={statesQuery.data?.metaData.totalCount ?? 0} /> },
      { value: 'report', icon: 'document-text-outline', label: t('states.reportView'), paginate: false, renderWhenEmpty: true, render: (items) => <StateReportView states={items} totalCount={statesQuery.data?.metaData.totalCount ?? 0} /> },
      ...(canCreate ? [{ value: 'import' as const, icon: 'cloud-upload-outline' as const, label: t('states.importView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: () => <StateImportView /> }] : []),
    ]} />
    {selectedState || formMode === 'create' ? <StateForm loading={saveMutation.isPending} mode={formMode} onClose={closeForm} onSave={save} state={selectedState} /> : null}
    <ConfirmationDialog confirmLabel={t('states.archive')} description={t(pendingAction?.kind === 'bulk' ? 'states.bulkArchiveDescription' : 'states.archiveDescription', { count: selectedIds.length, name: pendingAction?.kind === 'archive' ? pendingAction.state.nameEn : '' })} loading={archiveMutation.isPending || bulkArchiveMutation.isPending} onCancel={() => setPendingAction(null)} onConfirm={() => void confirmAction()} title={t(pendingAction?.kind === 'bulk' ? 'states.bulkArchiveTitle' : 'states.archiveTitle')} tone="warning" visible={pendingAction !== null} />
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function formatDate(value: string, locale: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date); }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, tableActions: { flexDirection: 'row', justifyContent: 'center', gap: 4 }, cards: { gap: 6 } });
