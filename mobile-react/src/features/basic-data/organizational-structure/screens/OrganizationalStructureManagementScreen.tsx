import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppButton, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import { OrganizationalStructureCard } from '../components/OrganizationalStructureCard';
import { OrganizationalStructureChart } from '../components/OrganizationalStructureChart';
import { OrganizationalStructureReportView } from '../components/OrganizationalStructureReportView';
import { OrganizationalStructureImportView } from '../components/import-data/OrganizationalStructureImportView';
import { OrganizationalStructureTreeDiagram } from '../components/OrganizationalStructureTreeDiagram';
import { OrganizationalStructureFilterButton } from '../components/OrganizationalStructureFilterButton';
import { JobDescriptionDecisionForm } from '../components/JobDescriptionDecisionForm';
import { OrganizationalStructureForm } from '../components/OrganizationalStructureForm';
import { JobDescriptionDetailsModal } from '../components/JobDescriptionDetailsModal';
import { useApproveJobDescription, useArchiveOrganizationalItem, useOrganizationalStructure, useRejectJobDescription, useRestoreOrganizationalItem, useSaveOrganizationalItem } from '../queries/use-organizational-structure';
import { type OrganizationalResource, type OrganizationalSearchField, type OrganizationalSearchOperator, type OrganizationalSortColumn, type OrganizationalStatus, type OrganizationalStructureItem, type OrganizationalStructureRequest } from '../types/organizational-structure';
import { canDecideJobDescription, getJobDescriptionStatusKey } from '../utils/job-description-status';

type FormMode = 'create' | 'edit' | 'view';
export function OrganizationalStructureManagementScreen({ resource }: { resource: OrganizationalResource }) {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const isAr = i18n.language?.startsWith('ar');
  const { allowed: viewAllowed } = useAuthorization({ requiredPermissions: [permissions.ViewOrganizationalStructure] });
  const { allowed: createAllowed } = useAuthorization({ requiredPermissions: [permissions.CreateOrganizationalStructure] });
  const { allowed: editAllowed } = useAuthorization({ requiredPermissions: [permissions.EditOrganizationalStructure] });
  const { allowed: deleteAllowed } = useAuthorization({ requiredPermissions: [permissions.DeleteOrganizationalStructure] });
  const { allowed: approveAllowed } = useAuthorization({ requiredPermissions: [permissions.ApproveJobDescriptions] });
  const canCreate = createAllowed && !isReadOnly; const canEdit = editAllowed && !isReadOnly; const canDelete = deleteAllowed && !isReadOnly;
  const [status, setStatus] = useState<OrganizationalStatus>('active'); const [searchField, setSearchField] = useState<OrganizationalSearchField>('all'); const [searchOperator, setSearchOperator] = useState<OrganizationalSearchOperator>('contains');
  const list = useServerListState<OrganizationalSortColumn, { status: OrganizationalStatus }>({ initialFilters: { status: 'active' }, initialPageSize: 5, initialSort: { columnId: 'nameEn', direction: 'ascending' } });
  const query = useOrganizationalStructure({ resource, pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, search: list.state.search, searchField, searchOperator, status, sortBy: list.state.sort?.columnId ?? 'nameEn', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc' });
  const isTreeSupported = resource === 'departments' || resource === 'cost-centers';
  const treeQuery = useOrganizationalStructure({ resource, pageNumber: 1, pageSize: isTreeSupported ? 100 : 5, search: '', searchField: 'all', searchOperator: 'contains', status, sortBy: 'code', sortDirection: 'asc' });
  const saveMutation = useSaveOrganizationalItem(); const archiveMutation = useArchiveOrganizationalItem(); const restoreMutation = useRestoreOrganizationalItem(); const approveMutation = useApproveJobDescription(); const rejectMutation = useRejectJobDescription();
  const [mode, setMode] = useState<FormMode>('view'); const [selected, setSelected] = useState<OrganizationalStructureItem | null>(null); const [pendingArchive, setPendingArchive] = useState<OrganizationalStructureItem | null>(null);
  const [decisionMode, setDecisionMode] = useState<'approve' | 'reject' | null>(null); const [decisionItem, setDecisionItem] = useState<OrganizationalStructureItem | null>(null);
  const rows = query.data?.items ?? [];
  const open = useCallback((nextMode: FormMode, item: OrganizationalStructureItem | null) => { if (nextMode !== 'view' && isReadOnly) return notifyBlockedAction(); setMode(nextMode); setSelected(item); }, [isReadOnly, notifyBlockedAction]);
  const close = useCallback(() => { setSelected(null); setMode('view'); }, []);
  const save = useCallback(async (request: OrganizationalStructureRequest) => { try { await saveMutation.mutateAsync({ resource, id: mode === 'edit' ? selected?.id ?? null : null, request }); close(); showToast.success(t('organizationalStructure.saved')); } catch (error) { showToast.error(error, t('organizationalStructure.saveFailed')); } }, [close, mode, resource, saveMutation, selected?.id, t]);
  const reparent = useCallback(async (item: OrganizationalStructureItem, newParentId: number | null) => {
    if (isReadOnly) return notifyBlockedAction();
    try {
      const request: OrganizationalStructureRequest = {
        code: item.code,
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        descriptionEn: item.descriptionEn,
        descriptionAr: item.descriptionAr,
        branchId: item.branchId ?? 0,
        parentDepartmentId: resource === 'departments' ? (newParentId ?? 0) : (item.parentDepartmentId ?? 0),
        parentCostCenterId: resource === 'cost-centers' ? (newParentId ?? 0) : (item.parentCostCenterId ?? 0),
        departmentId: item.departmentId,
        divisionId: item.divisionId,
        jobTitleId: item.jobTitleId,
        jobLevelId: item.jobLevelId,
        positionId: item.positionId,
        costCenterCode: item.costCenterCode,
        timeZoneId: item.timeZoneId,
        openedOn: item.openedOn,
        email: item.email,
        phone: item.phone,
        isHeadquarters: item.isHeadquarters,
        levelOrder: item.levelOrder,
        minSalary: item.minSalary,
        maxSalary: item.maxSalary,
        currencyCode: item.currencyCode,
        canManageOthers: item.canManageOthers,
        isManagementLevel: item.isManagementLevel,
        targetHeadcount: item.targetHeadcount,
        version: item.version,
        symbol: item.symbol,
        exchangeRateToDefault: item.exchangeRateToDefault,
        isDefault: item.isDefault,
        dutySections: item.dutySections,
        skills: item.skills,
        educationRequirements: item.educationRequirements,
      };
      await saveMutation.mutateAsync({ resource, id: item.id, request });
      showToast.success(isAr ? 'تم نقل العنصر بنجاح' : 'Item moved successfully');
    } catch (error) {
      showToast.error(error, isAr ? 'فشل نقل العنصر' : 'Failed to move item');
    }
  }, [isAr, isReadOnly, notifyBlockedAction, resource, saveMutation]);
  const restore = useCallback(async (item: OrganizationalStructureItem) => { try { await restoreMutation.mutateAsync({ resource, id: item.id }); showToast.success(t('organizationalStructure.restored')); } catch (error) { showToast.error(error, t('organizationalStructure.restoreFailed')); } }, [resource, restoreMutation, t]);
  const archive = useCallback(async () => { if (!pendingArchive) return; try { await archiveMutation.mutateAsync({ resource, id: pendingArchive.id }); setPendingArchive(null); showToast.success(t('organizationalStructure.archived')); } catch (error) { showToast.error(error, t('organizationalStructure.archiveFailed')); } }, [archiveMutation, pendingArchive, resource, t]);
  const decide = useCallback(async (values: { effectiveDate: string; expiryDate: string; reason: string }) => { if (!decisionItem || !decisionMode) return; try { if (decisionMode === 'approve') await approveMutation.mutateAsync({ id: decisionItem.id, effectiveDate: values.effectiveDate, expiryDate: values.expiryDate || undefined }); else await rejectMutation.mutateAsync({ id: decisionItem.id, reason: values.reason }); showToast.success(t(`organizationalStructure.decision.${decisionMode === 'approve' ? 'approved' : 'rejected'}`)); setDecisionMode(null); setDecisionItem(null); } catch (error) { showToast.error(error, t('organizationalStructure.decision.failed')); } }, [approveMutation, decisionItem, decisionMode, rejectMutation, t]);
  const openDecision = useCallback((nextMode: 'approve' | 'reject', item: OrganizationalStructureItem) => { if (isReadOnly) return notifyBlockedAction(); setDecisionMode(nextMode); setDecisionItem(item); }, [isReadOnly, notifyBlockedAction]);
  const columns = useMemo<AppDataTableColumn<OrganizationalStructureItem>[]>(() => {
    const cols: AppDataTableColumn<OrganizationalStructureItem>[] = [
      { id: 'code', header: t('organizationalStructure.fields.code'), width: 110, sortable: true, render: (item) => <AppText variant="bodySmall">{item.code}</AppText> },
      { id: 'nameEn', header: t('organizationalStructure.fields.nameEn'), width: 160, sortable: true, render: (item) => <AppText variant="bodySmall" weight="700">{item.nameEn}</AppText> },
      { id: 'nameAr', header: t('organizationalStructure.fields.nameAr'), width: 160, sortable: true, render: (item) => <AppText variant="bodySmall">{item.nameAr}</AppText> },
    ];

    if (resource === 'branches') {
      cols.push(
        { id: 'isHeadquarters', header: t('organizationalStructure.fields.headquarters'), width: 120, render: (item) => <AppStatusBadge color={item.isHeadquarters ? theme.colors.success : theme.colors.textMuted} label={item.isHeadquarters ? t('organizationalStructure.yes') : t('organizationalStructure.no')} /> },
        { id: 'timeZone', header: t('organizationalStructure.fields.timeZone'), width: 130, render: (item) => <AppText variant="bodySmall">{item.timeZoneId ?? '-'}</AppText> },
      );
    } else if (resource === 'departments') {
      cols.push(
        { id: 'isCentralized', header: t('organizationalStructure.fields.isCentralized'), width: 130, render: (item) => <AppStatusBadge color={item.isCentralized || !item.branchId ? theme.colors.secondary : theme.colors.primary} label={item.isCentralized || !item.branchId ? (isAr ? 'مركزية (عامة)' : 'Centralized') : (isAr ? 'فرعية' : 'Branch-scoped')} /> },
        { id: 'branchName', header: t('organizationalStructure.fields.branch'), width: 140, render: (item) => <AppText variant="bodySmall">{isAr ? item.branchNameAr || (item.isCentralized ? 'كافة الفروع' : '-') : item.branchNameEn || (item.isCentralized ? 'All branches' : '-')}</AppText> },
        { id: 'parentDept', header: t('organizationalStructure.fields.parentDepartment'), width: 150, render: (item) => <AppText variant="bodySmall">{(isAr ? item.parentNameAr : item.parentNameEn) ?? (isAr ? 'إدارة رئيسية' : 'Top-level')}</AppText> },
        { id: 'costCenter', header: t('organizationalStructure.fields.costCenter'), width: 120, render: (item) => <AppText variant="bodySmall">{item.costCenterCode ?? '-'}</AppText> },
      );
    } else if (resource === 'divisions') {
      cols.push(
        { id: 'departmentName', header: t('organizationalStructure.fields.department'), width: 140, render: (item) => <AppText variant="bodySmall">{(isAr ? item.departmentNameAr : item.departmentNameEn) ?? '-'}</AppText> },
        { id: 'branchName', header: t('organizationalStructure.fields.branch'), width: 130, render: (item) => <AppText variant="bodySmall">{(isAr ? item.branchNameAr : item.branchNameEn) ?? (isAr ? 'مركزي' : 'Central')}</AppText> },
        { id: 'costCenter', header: t('organizationalStructure.fields.costCenter'), width: 120, render: (item) => <AppText variant="bodySmall">{item.costCenterCode ?? '-'}</AppText> },
      );
    } else if (resource === 'job-levels') {
      cols.push(
        { id: 'levelOrder', header: t('organizationalStructure.fields.levelOrder'), width: 110, render: (item) => <AppText variant="bodySmall">{String(item.levelOrder ?? '-')}</AppText> },
        { id: 'salaryRange', header: t('organizationalStructure.fields.salaryRange'), width: 160, render: (item) => <AppText variant="bodySmall">{item.minSalary != null && item.maxSalary != null ? `${item.minSalary.toLocaleString()} - ${item.maxSalary.toLocaleString()} ${item.currencyCode ?? ''}` : '-'}</AppText> },
        { id: 'mgmtLevel', header: t('organizationalStructure.fields.managementLevel'), width: 120, render: (item) => <AppStatusBadge color={item.isManagementLevel ? theme.colors.primary : theme.colors.textMuted} label={item.isManagementLevel ? t('organizationalStructure.yes') : t('organizationalStructure.no')} /> },
        { id: 'canManage', header: t('organizationalStructure.fields.canManageOthers'), width: 130, render: (item) => <AppStatusBadge color={item.canManageOthers ? theme.colors.success : theme.colors.textMuted} label={item.canManageOthers ? t('organizationalStructure.yes') : t('organizationalStructure.no')} /> },
      );
    } else if (resource === 'positions') {
      cols.push(
        { id: 'jobTitle', header: t('organizationalStructure.fields.jobTitle'), width: 140, render: (item) => <AppText variant="bodySmall">{(isAr ? item.jobTitleNameAr : item.jobTitleNameEn) ?? '-'}</AppText> },
        { id: 'jobLevel', header: t('organizationalStructure.fields.jobLevel'), width: 120, render: (item) => <AppText variant="bodySmall">{(isAr ? item.jobLevelNameAr : item.jobLevelNameEn) ?? '-'}</AppText> },
        { id: 'division', header: t('organizationalStructure.fields.division'), width: 130, render: (item) => <AppText variant="bodySmall">{(isAr ? item.divisionNameAr : item.divisionNameEn) ?? '-'}</AppText> },
        { id: 'department', header: t('organizationalStructure.fields.department'), width: 130, render: (item) => <AppText variant="bodySmall">{(isAr ? item.departmentNameAr : item.departmentNameEn) ?? '-'}</AppText> },
        { id: 'headcount', header: t('organizationalStructure.fields.targetHeadcount'), width: 110, render: (item) => <AppText variant="bodySmall">{String(item.targetHeadcount ?? 0)}</AppText> },
      );
    } else if (resource === 'job-descriptions') {
      cols.push(
        { id: 'version', header: t('organizationalStructure.fields.version'), width: 100, render: (item) => <AppText variant="bodySmall">{item.version ?? '-'}</AppText> },
        { id: 'positionCode', header: t('organizationalStructure.fields.code'), width: 110, render: (item) => <AppText variant="bodySmall">{item.positionCode ?? '-'}</AppText> },
        { id: 'experience', header: t('organizationalStructure.fields.experienceYears'), width: 120, render: (item) => <AppText variant="bodySmall">{item.minExperienceYears != null ? `${item.minExperienceYears} ${isAr ? 'سنوات' : 'yrs'}` : '-'}</AppText> },
        { id: 'effectiveDate', header: t('organizationalStructure.fields.effectiveDate'), width: 130, render: (item) => <AppText variant="bodySmall">{item.effectiveDate ? item.effectiveDate.slice(0, 10) : '-'}</AppText> },
      );
    }

    cols.push(
      { id: 'status', header: t('organizationalStructure.fields.status'), width: 170, align: 'center', render: (item) => { const decisionStatus = getJobDescriptionStatusKey(item); return <View style={styles.statuses}><AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'organizationalStructure.status.archived' : 'organizationalStructure.status.active')} />{decisionStatus ? <AppStatusBadge color={theme.colors.primary} label={t(`organizationalStructure.jobDescriptionStatus.${decisionStatus}`)} /> : null}</View>; } },
      { id: 'actions', header: t('organizationalStructure.actions'), width: resource === 'job-descriptions' ? 290 : 240, align: 'center', render: (item) => <View style={styles.actions}>{resource === 'job-descriptions' ? <AppButton icon="eye-outline" onPress={() => open('view', item)} size="sm" style={styles.viewProfileButton} variant="primary">{t('organizationalStructure.view')}</AppButton> : <AppIconButton icon="eye-outline" label={t('organizationalStructure.view')} onPress={() => open('view', item)} />}{canEdit && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('organizationalStructure.edit')} onPress={() => open('edit', item)} /> : null}{canDelete ? <AppIconButton icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(item.isDeleted ? 'organizationalStructure.restore' : 'organizationalStructure.archive')} onPress={() => item.isDeleted ? void restore(item) : setPendingArchive(item)} /> : null}{approveAllowed && resource === 'job-descriptions' && canDecideJobDescription(item) ? <><AppIconButton icon="checkmark-circle-outline" label={t('organizationalStructure.decision.approve')} onPress={() => openDecision('approve', item)} /><AppIconButton icon="close-circle-outline" label={t('organizationalStructure.decision.reject')} onPress={() => openDecision('reject', item)} /></> : null}</View> },
    );

    return cols;
  }, [approveAllowed, canDelete, canEdit, isAr, open, openDecision, resource, restore, t, theme.colors.textMuted, theme.colors.primary, theme.colors.secondary, theme.colors.success, theme.colors.warning]);
  if (!viewAllowed) return <AppScreen><AppStateView message={t('organizationalStructure.permissionDenied')} state="error" /></AppScreen>;
  if (query.isLoading) return <AppScreen><AppStateView state="loading" /></AppScreen>;
  if (query.error) return <AppScreen><AppStateView message={errorMessage(query.error, t('organizationalStructure.loadFailed'))} onRetry={() => void query.refetch()} state="error" /></AppScreen>;
  return <AppScreen contentContainerStyle={styles.screen} edges={['left', 'right', 'bottom']} refreshControl={<RefreshControl colors={[theme.colors.primary]} onRefresh={() => void query.refetch()} refreshing={query.isRefetching} tintColor={theme.colors.primary} />}>
    <AppListScreen<OrganizationalStructureItem, 'table' | 'cards' | 'tree' | 'chart' | 'report' | 'import'> defaultView={resource === 'cost-centers' ? 'tree' : 'table'} emptyContent={<AppStateView message={t('organizationalStructure.empty')} state="empty" />} fillViewSelector filterControl={<OrganizationalStructureFilterButton field={searchField} onApply={(values) => { setSearchField(values.field); setSearchOperator(values.operator); setStatus(values.status); list.setPage(0); }} operator={searchOperator} resource={resource} status={status} />} isFetching={query.isFetching} items={rows} onSearchChange={(value) => list.setSearchInput(value)} searchActions={canCreate ? <AppIconButton color={theme.colors.onPrimary} icon="add-outline" label={t('organizationalStructure.add')} onPress={() => open('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null} searchPlaceholder={t(`organizationalStructure.resources.${resource}`)} searchValue={list.searchInput} serverPagination={{ onPageChange: list.setPage, onPageSizeChange: list.setPageSize, page: list.state.page, pageSize: list.state.pageSize, pageSizeOptions: [3, 5, 10], totalItems: query.data?.metaData.totalCount ?? 0 }} showResultCount={false} showViewLabels views={[
        { value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: (items) => <AppDataTable columns={columns} getRowKey={(item) => item.id} onRowDoublePress={(item) => open('view', item)} rows={items} showPagination={false} serverState={{ onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: (sort) => list.setSort(sort ? { columnId: sort.columnId as OrganizationalSortColumn, direction: sort.direction } : null), page: list.state.page, pageSize: list.state.pageSize, sort: list.state.sort, totalRows: query.data?.metaData.totalCount ?? 0 }} /> },
        { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: (items) => <View style={styles.cards}>{items.map((item, index) => <OrganizationalStructureCard active={index === 0} canApprove={approveAllowed && resource === 'job-descriptions'} canDelete={canDelete} canEdit={canEdit} item={item} key={item.id} onApprove={(value) => openDecision('approve', value)} onArchive={setPendingArchive} onEdit={(value) => open('edit', value)} onReject={(value) => openDecision('reject', value)} onRestore={(value) => void restore(value)} onView={(value) => open('view', value)} />)}</View> },
        ...((resource === 'departments' || resource === 'cost-centers')
          ? [
              {
                value: 'tree' as const,
                icon: 'git-network-outline' as const,
                label: t('multiView.tree'),
                paginate: false,
                renderWhenEmpty: true,
                scrollable: true,
                render: (items: readonly OrganizationalStructureItem[]) => (
                  <OrganizationalStructureTreeDiagram
                    canCreate={canCreate}
                    canDelete={canDelete}
                    canEdit={canEdit}
                    items={treeQuery.data?.items ?? items}
                    onAddChild={(item) =>
                      open(
                        'create',
                        resource === 'departments'
                          ? ({ parentDepartmentId: item.id } as OrganizationalStructureItem)
                          : ({ parentCostCenterId: item.id } as OrganizationalStructureItem)
                      )
                    }
                    onDelete={(item: OrganizationalStructureItem) =>
                      item.isDeleted ? void restore(item) : setPendingArchive(item)
                    }
                    onEdit={(item: OrganizationalStructureItem) => open('edit', item)}
                    onView={(item: OrganizationalStructureItem) => open('view', item)}
                    onReparent={reparent}
                    resource={resource}
                  />
                ),
              },
            ]
          : []),
        { value: 'chart', icon: 'stats-chart-outline', label: t('multiView.chart'), paginate: false, renderWhenEmpty: true, scrollable: true, render: (items) => <OrganizationalStructureChart canEdit={canEdit} items={items} onEdit={(item) => open('edit', item)} onView={(item) => open('view', item)} resource={resource} totalCount={query.data?.metaData.totalCount ?? 0} /> },
        { value: 'report', icon: 'document-text-outline', label: t('organizationalStructure.reportView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: (items) => <OrganizationalStructureReportView items={items} resource={resource} totalCount={query.data?.metaData.totalCount ?? 0} /> },
        ...(canCreate ? [{ value: 'import' as const, icon: 'cloud-upload-outline' as const, label: t('organizationalStructure.importView'), paginate: false, renderWhenEmpty: true, scrollable: true, render: () => <OrganizationalStructureImportView resource={resource} /> }] : []),
      ]} />
    {mode === 'create' || (selected && (mode !== 'view' || resource !== 'job-descriptions')) ? (
      <OrganizationalStructureForm item={selected} loading={saveMutation.isPending} mode={mode} onClose={close} onSave={save} resource={resource} />
    ) : null}
    {selected && mode === 'view' && resource === 'job-descriptions' ? (
      <JobDescriptionDetailsModal
        canApprove={approveAllowed}
        canEdit={canEdit}
        item={selected}
        onApprove={(val) => openDecision('approve', val)}
        onClose={close}
        onEdit={(val) => open('edit', val)}
        onReject={(val) => openDecision('reject', val)}
        visible
      />
    ) : null}
    {decisionMode && decisionItem ? <JobDescriptionDecisionForm loading={approveMutation.isPending || rejectMutation.isPending} mode={decisionMode} onClose={() => { setDecisionMode(null); setDecisionItem(null); }} onSubmit={decide} /> : null}
    <ConfirmationDialog confirmLabel={t('organizationalStructure.archive')} description={t('organizationalStructure.archiveDescription', { name: pendingArchive?.nameEn ?? '' })} loading={archiveMutation.isPending} onCancel={() => setPendingArchive(null)} onConfirm={() => void archive()} title={t('organizationalStructure.archiveTitle')} tone="warning" visible={pendingArchive !== null} />
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, statuses: { gap: 4, alignItems: 'center' }, cards: { gap: 7 }, viewProfileButton: { paddingVertical: 4, paddingHorizontal: 8 } });
