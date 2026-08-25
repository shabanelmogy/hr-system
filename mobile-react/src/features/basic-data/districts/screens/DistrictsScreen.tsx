import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppButton, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import { DistrictCard } from '../components/DistrictCard';
import { DistrictReportView } from '../components/DistrictReportView';
import { DistrictsChartView } from '../components/DistrictsChartView';
import { DistrictForm } from '../components/DistrictForm';
import { DistrictFilterButton } from '../components/DistrictFilterButton';
import { DistrictImportView } from '../components/import-data/DistrictImportView';
import { useArchiveDistrict, useBulkArchiveDistricts, useRestoreDistrict, useSaveDistrict, useDistricts } from '../queries/use-districts';
import type { District, DistrictFilters, DistrictRequest, DistrictSearchField, DistrictSearchOperator, DistrictSortColumn } from '../types/district';

type FormMode = 'create' | 'edit' | 'view';
type PendingAction = { kind: 'archive'; district: District } | { kind: 'bulk' } | null;
const initialFilters: DistrictFilters = { status: 'active' };

export function DistrictsScreen() {
  const { i18n, t } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: isCreateAuthorized } = useAuthorization({ requiredPermissions: [permissions.CreateDistricts] });
  const { allowed: isEditAuthorized } = useAuthorization({ requiredPermissions: [permissions.EditDistricts] });
  const { allowed: isDeleteAuthorized } = useAuthorization({ requiredPermissions: [permissions.DeleteDistricts] });
  const canCreate = isCreateAuthorized && !isReadOnly; const canEdit = isEditAuthorized && !isReadOnly; const canDelete = isDeleteAuthorized && !isReadOnly;
  const list = useServerListState<DistrictSortColumn, DistrictFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const [searchField, setSearchField] = useState<DistrictSearchField>('all'); const [searchOperator, setSearchOperator] = useState<DistrictSearchOperator>('contains');
  const districtsQuery = useDistricts({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, search: list.state.search, searchField, searchOperator, status: list.state.filters.status, sortBy: list.state.sort?.columnId ?? 'createdOn', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc' });
  const saveMutation = useSaveDistrict(); const archiveMutation = useArchiveDistrict(); const restoreMutation = useRestoreDistrict(); const bulkArchiveMutation = useBulkArchiveDistricts();
  const [formMode, setFormMode] = useState<FormMode>('view'); const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null); const [pendingAction, setPendingAction] = useState<PendingAction>(null); const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const rows = districtsQuery.data?.items ?? []; const listFilters = list.state.filters;
  const clearBulkSelection = useCallback(() => { setSelectedIds([]); setPendingAction((current) => current?.kind === 'bulk' ? null : current); }, []);
  const changeSearch = useCallback((value: string) => { clearBulkSelection(); list.setSearchInput(value); }, [clearBulkSelection, list]);
  const changePage = useCallback((page: number) => { clearBulkSelection(); list.setPage(page); }, [clearBulkSelection, list]);
  const changePageSize = useCallback((pageSize: number) => { clearBulkSelection(); list.setPageSize(pageSize); }, [clearBulkSelection, list]);
  const changeSort = useCallback((sort: { columnId: string; direction: 'ascending' | 'descending' } | null) => { clearBulkSelection(); list.setSort(sort ? { columnId: sort.columnId as DistrictSortColumn, direction: sort.direction } : null); }, [clearBulkSelection, list]);
  const applyFilters = useCallback((next: { field: DistrictSearchField; operator: DistrictSearchOperator; status: DistrictFilters['status'] }) => {
    clearBulkSelection();
    setSearchField(next.field);
    setSearchOperator(next.operator);
    list.setFilters({ ...listFilters, status: next.status });
    list.setPage(0);
  }, [clearBulkSelection, list, listFilters]);
  const openForm = useCallback((mode: FormMode, district: District | null) => { if (mode !== 'view' && isReadOnly) { notifyBlockedAction(); return; } setFormMode(mode); setSelectedDistrict(district); }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => { setSelectedDistrict(null); setFormMode('view'); }, []);
  const toggleSelection = useCallback((district: District) => setSelectedIds((ids) => ids.includes(district.id) ? ids.filter((id) => id !== district.id) : [...ids, district.id]), []);
  const save = useCallback(async (request: DistrictRequest) => { if (isReadOnly) return notifyBlockedAction(); if (!(formMode === 'edit' ? isEditAuthorized : isCreateAuthorized)) return; try { await saveMutation.mutateAsync({ id: formMode === 'edit' ? selectedDistrict?.id ?? null : null, request }); closeForm(); showToast.success(t('districts.saved')); } catch (error) { showToast.error(error, t('districts.saveFailed')); } }, [closeForm, formMode, isCreateAuthorized, isEditAuthorized, isReadOnly, notifyBlockedAction, saveMutation, selectedDistrict?.id, t]);
  const restore = useCallback(async (district: District) => { if (isReadOnly) return notifyBlockedAction(); if (!isDeleteAuthorized) return; try { await restoreMutation.mutateAsync(district.id); showToast.success(t('districts.restored')); } catch (error) { showToast.error(error, t('districts.restoreFailed')); } }, [isDeleteAuthorized, isReadOnly, notifyBlockedAction, restoreMutation, t]);
  const confirmAction = useCallback(async () => { if (!pendingAction) return; if (isReadOnly) return notifyBlockedAction(); if (!isDeleteAuthorized) return; try { if (pendingAction.kind === 'bulk') { const result = await bulkArchiveMutation.mutateAsync(selectedIds); setSelectedIds([]); showToast.success(t('districts.bulkArchived', { count: result.archivedCount })); } else { await archiveMutation.mutateAsync(pendingAction.district.id); setSelectedIds((ids) => ids.filter((id) => id !== pendingAction.district.id)); showToast.success(t('districts.archivedSuccess')); } setPendingAction(null); } catch (error) { showToast.error(error, t('districts.archiveFailed')); } }, [archiveMutation, bulkArchiveMutation, isDeleteAuthorized, isReadOnly, notifyBlockedAction, pendingAction, selectedIds, t]);
  const columns = useMemo<AppDataTableColumn<District>[]>(() => [
    { id: 'nameEn', header: t('districts.nameEn'), width: 160, sortable: true, render: (district) => <AppText variant="bodySmall" weight="700">{district.nameEn}</AppText> },
    { id: 'nameAr', header: t('districts.nameAr'), width: 160, sortable: true, render: (district) => <AppText variant="bodySmall">{district.nameAr}</AppText> },
    { id: 'code', header: t('districts.code'), width: 92, sortable: true, align: 'center', render: (district) => <AppText variant="bodySmall">{district.code}</AppText> },
    { id: 'state', header: t('districts.state'), width: 140, sortable: true, render: (district) => <AppText variant="bodySmall">{district.state.nameEn}</AppText> },
    { id: 'addresses', header: t('districts.addresses'), width: 90, align: 'center', render: (district) => <AppText variant="bodySmall">{district.addressesCount}</AppText> },
    { id: 'createdOn', header: t('districts.createdOn'), width: 132, sortable: true, render: (district) => <AppText variant="bodySmall">{formatDate(district.createdOn, i18n.language)}</AppText> },
    { id: 'status', header: t('districts.status'), width: 108, align: 'center', render: (district) => <AppStatusBadge color={district.isDeleted ? theme.colors.warning : theme.colors.success} label={t(district.isDeleted ? 'districts.archived' : 'districts.active')} /> },
    { id: 'actions', header: t('districts.actions'), width: 180, align: 'center', render: (district) => <View style={styles.tableActions}><AppIconButton icon="eye-outline" label={t('districts.viewDistrict')} onPress={() => openForm('view', district)} />{canEdit && !district.isDeleted ? <AppIconButton icon="create-outline" label={t('districts.editDistrict')} onPress={() => openForm('edit', district)} /> : null}{canDelete ? <AppIconButton icon={district.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(district.isDeleted ? 'districts.restore' : 'districts.archive')} onPress={() => district.isDeleted ? void restore(district) : setPendingAction({ kind: 'archive', district })} /> : null}</View> },
  ], [canDelete, canEdit, i18n.language, openForm, restore, t, theme.colors.success, theme.colors.warning]);
  if (districtsQuery.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (districtsQuery.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView message={errorMessage(districtsQuery.error, t('districts.loadFailed'))} onRetry={() => void districtsQuery.refetch()} state="error" /></AppScreen>;
  return <AppScreen contentContainerStyle={styles.screen} edges={['left', 'right', 'bottom']} refreshControl={<RefreshControl colors={[theme.colors.primary]} onRefresh={() => void districtsQuery.refetch()} refreshing={districtsQuery.isRefetching} tintColor={theme.colors.primary} />}>
    <AppListScreen<District, 'table' | 'cards' | 'chart' | 'report' | 'import'> aboveViews={selectedIds.length > 0 && canDelete ? <AppButton icon="archive-outline" onPress={() => setPendingAction({ kind: 'bulk' })} variant="outline">{t('districts.archiveSelected', { count: selectedIds.length })}</AppButton> : null} defaultView="table" emptyContent={<AppStateView message={t('districts.empty')} state="empty" />} fillViewSelector filterControl={<DistrictFilterButton field={searchField} onApply={applyFilters} operator={searchOperator} status={list.state.filters.status} />} isFetching={districtsQuery.isFetching} items={rows} onSearchChange={changeSearch} searchActions={canCreate ? <AppIconButton color={theme.colors.onPrimary} icon="add-outline" label={t('districts.addDistrict')} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null} searchPlaceholder={t('districts.search')} searchValue={list.searchInput} serverPagination={{ onPageChange: changePage, onPageSizeChange: changePageSize, page: list.state.page, pageSize: list.state.pageSize, pageSizeOptions: [3, 5, 10], totalItems: districtsQuery.data?.metaData.totalCount ?? 0 }} showResultCount={false} showViewLabels views={[
      { value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: (items) => <AppDataTable columns={columns} getRowKey={(district) => district.id} rows={items} showPagination={false} serverState={{ onPageChange: changePage, onPageSizeChange: changePageSize, onSortChange: changeSort, page: list.state.page, pageSize: list.state.pageSize, sort: list.state.sort, totalRows: districtsQuery.data?.metaData.totalCount ?? 0 }} /> },
      { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: (items) => <View style={styles.cards}>{items.map((district) => <DistrictCard canDelete={canDelete} canEdit={canEdit} key={district.id} onArchive={(item) => setPendingAction({ kind: 'archive', district: item })} onEdit={(item) => openForm('edit', item)} onRestore={(item) => void restore(item)} onToggleSelection={toggleSelection} onView={(item) => openForm('view', item)} selected={selectedIds.includes(district.id)} district={district} />)}</View> },
      { value: 'chart', icon: 'stats-chart-outline', label: t('districts.chartView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: (items) => <DistrictsChartView districts={items} totalCount={districtsQuery.data?.metaData.totalCount ?? 0} /> },
      { value: 'report', icon: 'document-text-outline', label: t('districts.reportView'), paginate: false, renderWhenEmpty: true, render: () => <DistrictReportView /> },
      ...(canCreate ? [{ value: 'import' as const, icon: 'cloud-upload-outline' as const, label: t('districts.importView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: () => <DistrictImportView /> }] : []),
    ]} />
    {selectedDistrict || formMode === 'create' ? <DistrictForm loading={saveMutation.isPending} mode={formMode} onClose={closeForm} onSave={save} district={selectedDistrict} /> : null}
    <ConfirmationDialog confirmLabel={t('districts.archive')} description={t(pendingAction?.kind === 'bulk' ? 'districts.bulkArchiveDescription' : 'districts.archiveDescription', { count: selectedIds.length, name: pendingAction?.kind === 'archive' ? pendingAction.district.nameEn : '' })} loading={archiveMutation.isPending || bulkArchiveMutation.isPending} onCancel={() => setPendingAction(null)} onConfirm={() => void confirmAction()} title={t(pendingAction?.kind === 'bulk' ? 'districts.bulkArchiveTitle' : 'districts.archiveTitle')} tone="warning" visible={pendingAction !== null} />
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function formatDate(value: string, locale: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date); }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, tableActions: { flexDirection: 'row', justifyContent: 'center', gap: 4 }, cards: { gap: 6 } });
