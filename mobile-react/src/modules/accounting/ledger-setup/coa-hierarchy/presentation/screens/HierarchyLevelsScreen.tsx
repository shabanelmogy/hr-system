import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import type { AccountHierarchyLevel, AccountHierarchyLevelRequest, AccountRecordStatus } from '../../domain/models/coa-hierarchy';
import { HierarchyLevelFilterButton } from '../components/HierarchyLevelFilterButton';
import { HierarchyLevelForm } from '../components/HierarchyLevelForm';
import { useArchiveHierarchyLevel, useHierarchyLevels, useRestoreHierarchyLevel, useSaveHierarchyLevel } from '../queries/use-coa-hierarchy';

type FormMode = 'create' | 'edit' | 'view';
type Pending = { kind: 'archive' | 'restore'; item: AccountHierarchyLevel } | null;

export function HierarchyLevelsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canView } = useAuthorization({ requiredPermissions: [permissions.ViewAccounts] });
  const { allowed: canWrite } = useAuthorization({ requiredPermissions: [permissions.ManageAccounts] });
  const canManage = canWrite && !isReadOnly;
  const [recordStatus, setRecordStatus] = useState<AccountRecordStatus>('active');
  const query = useHierarchyLevels(recordStatus, canView);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [selected, setSelected] = useState<AccountHierarchyLevel | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const saveMutation = useSaveHierarchyLevel();
  const archiveMutation = useArchiveHierarchyLevel();
  const restoreMutation = useRestoreHierarchyLevel();
  const mockLevels = useHierarchyLevels('all', formOpen && formMode !== 'view');

  const openForm = useCallback(async (mode: FormMode, item: AccountHierarchyLevel | null = null) => {
    if (mode !== 'view' && isReadOnly) return notifyBlockedAction();
    if (mode === 'create') { setSelected(null); setFormMode(mode); setFormOpen(true); return; }
    if (!item) return;
    const refreshed = await query.refetch();
    const latest = refreshed.data?.find(candidate => candidate.id === item.id);
    if (!latest) { showToast.error(refreshed.error, t('coaHierarchy.messages.detailFailed')); return; }
    setSelected(latest); setFormMode(mode); setFormOpen(true);
  }, [isReadOnly, notifyBlockedAction, query, t]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelected(null); setPending(null); }, []);

  const save = useCallback(async (request: AccountHierarchyLevelRequest) => {
    try {
      await saveMutation.mutateAsync({ id: formMode === 'edit' ? selected?.id ?? null : null, request, rowVersion: formMode === 'edit' ? selected?.rowVersion : undefined });
      showToast.success(t(formMode === 'edit' ? 'coaHierarchy.messages.levelUpdated' : 'coaHierarchy.messages.levelCreated')); closeForm();
    } catch (error) {
      if (isConcurrencyConflict(error)) { await query.refetch(); closeForm(); showToast.warning(t('coaHierarchy.messages.conflictReloaded')); return; }
      throw error;
    }
  }, [closeForm, formMode, query, saveMutation, selected, t]);

  const confirmLifecycle = useCallback(async () => {
    if (!pending) return;
    if (isReadOnly) return notifyBlockedAction();
    try {
      if (pending.kind === 'archive') await archiveMutation.mutateAsync({ id: pending.item.id, rowVersion: pending.item.rowVersion });
      else await restoreMutation.mutateAsync({ id: pending.item.id, rowVersion: pending.item.rowVersion });
      showToast.success(t(pending.kind === 'archive' ? 'coaHierarchy.messages.levelArchived' : 'coaHierarchy.messages.levelRestored')); closeForm();
    } catch (error) {
      if (isConcurrencyConflict(error) || isUncertainFailure(error)) { await query.refetch(); closeForm(); showToast.warning(t('coaHierarchy.messages.conflictReloaded')); return; }
      showToast.error(error, t('coaHierarchy.messages.actionFailed'));
    }
  }, [archiveMutation, closeForm, isReadOnly, notifyBlockedAction, pending, query, restoreMutation, t]);

  const columns = useMemo<AppDataTableColumn<AccountHierarchyLevel>[]>(() => [
    { id: 'levelNumber', header: t('coaHierarchy.fields.levelNumber'), width: 120, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.levelNumber}</AppText> },
    { id: 'nameEn', header: t('coaHierarchy.fields.nameEn'), width: 190, render: item => <AppText variant="bodySmall">{item.nameEn}</AppText> },
    { id: 'nameAr', header: t('coaHierarchy.fields.nameAr'), width: 190, render: item => <AppText variant="bodySmall">{item.nameAr}</AppText> },
    { id: 'canPost', header: t('coaHierarchy.fields.canPost'), width: 110, render: item => <AppText variant="bodySmall">{t(item.canPost ? 'coaHierarchy.common.yes' : 'coaHierarchy.common.no')}</AppText> },
    { id: 'status', header: t('coaHierarchy.fields.status'), width: 110, render: item => <AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'coaHierarchy.status.archived' : 'coaHierarchy.status.active')} /> },
    { id: 'actions', header: t('common.actions'), width: 110, align: 'center', render: item => <View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => void openForm('view', item)} />{canManage && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => void openForm('edit', item)} /> : null}</View> },
  ], [canManage, openForm, t, theme.colors.success, theme.colors.warning]);

  if (!canView) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if (query.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error, t('coaHierarchy.messages.loadFailed'))} onRetry={() => void query.refetch()} /></AppScreen>;

  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppListScreen<AccountHierarchyLevel, 'table'> defaultView="table" items={query.data ?? []} emptyContent={<AppStateView state="empty" message={t('coaHierarchy.levels.empty')} />} searchPlaceholder={t('coaHierarchy.levels.search')} onSearch={(items, term) => { const needle = term.trim().toLocaleLowerCase(); return items.filter(item => String(item.levelNumber).includes(needle) || item.nameEn.toLocaleLowerCase().includes(needle) || item.nameAr.toLocaleLowerCase().includes(needle)); }}
      filterControl={<HierarchyLevelFilterButton value={recordStatus} onApply={value => setRecordStatus(value)} />}
      searchActions={canManage ? <AppIconButton icon="add-outline" label={t('coaHierarchy.levels.actions.add')} color={theme.colors.onPrimary} onPress={() => void openForm('create')} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : null}
      views={[{ value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 10, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} /> }]} />
    {formOpen ? <HierarchyLevelForm key={`${formMode}-${selected?.id ?? 'new'}-${selected?.rowVersion ?? ''}`} item={selected} mode={formMode} levels={mockLevels.data ?? []} levelsLoading={mockLevels.isLoading} levelsError={Boolean(mockLevels.error)} loading={saveMutation.isPending} canManage={canManage} onClose={closeForm} onSave={save} onEdit={selected && !selected.isDeleted ? () => setFormMode('edit') : undefined} onLifecycle={selected ? () => setPending({ kind: selected.isDeleted ? 'restore' : 'archive', item: selected }) : undefined} /> : null}
    <ConfirmationDialog visible={pending !== null} title={t(`coaHierarchy.confirm.${pending?.kind ?? 'archive'}LevelTitle`)} description={t(`coaHierarchy.confirm.${pending?.kind ?? 'archive'}LevelDescription`, { level: pending?.item.levelNumber ?? '' })} confirmLabel={t(pending?.kind === 'restore' ? 'common.restore' : 'common.archive')} tone={pending?.kind === 'archive' ? 'warning' : 'default'} loading={archiveMutation.isPending || restoreMutation.isPending} onCancel={() => setPending(null)} onConfirm={() => void confirmLifecycle()} />
  </AppScreen>;
}

function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function isConcurrencyConflict(error: unknown) { return error instanceof ApiError && error.status === 409 && error.problem?.code === 'Accounting.ConcurrencyConflict'; }
function isUncertainFailure(error: unknown) { return error instanceof ApiError && error.status === 0; }

const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4 } });
