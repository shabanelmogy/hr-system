import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppScreen, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import type { Currency, CurrencyFilters, CurrencyRequest, CurrencySearchField, CurrencySearchOperator, CurrencySortColumn } from '../../domain/models/currency';
import { CurrencyFilterButton } from '../components/CurrencyFilterButton';
import { CurrencyForm } from '../components/CurrencyForm';
import { useArchiveCurrency, useCurrencies, useCurrency, useRestoreCurrency, useSaveCurrency } from '../queries/use-currencies';

type FormMode = 'create' | 'edit' | 'view';
type Pending = { kind: 'archive' | 'restore'; item: Currency } | null;
const initialFilters: CurrencyFilters = { recordStatus: 'active' };

export function CurrenciesScreen() {
  const { t } = useTranslation(); const { theme } = useAppTheme(); const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canView } = useAuthorization({ requiredPermissions: [permissions.ViewCurrencies] });
  const { allowed: createAllowed } = useAuthorization({ requiredPermissions: [permissions.CreateCurrencies] });
  const { allowed: editAllowed } = useAuthorization({ requiredPermissions: [permissions.EditCurrencies] });
  const { allowed: archiveAllowed } = useAuthorization({ requiredPermissions: [permissions.ArchiveCurrencies] });
  const { allowed: restoreAllowed } = useAuthorization({ requiredPermissions: [permissions.RestoreCurrencies] });
  const canCreate = createAllowed && !isReadOnly; const canEdit = editAllowed && !isReadOnly; const canArchive = archiveAllowed && !isReadOnly; const canRestore = restoreAllowed && !isReadOnly;
  const list = useServerListState<CurrencySortColumn, CurrencyFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'currencyCode', direction: 'ascending' } });
  const [searchField, setSearchField] = useState<CurrencySearchField>('all'); const [searchOperator, setSearchOperator] = useState<CurrencySearchOperator>('contains');
  const query = useCurrencies({ pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize, search: list.state.search, searchField, searchOperator, recordStatus: list.state.filters.recordStatus, sortBy: list.state.sort?.columnId ?? 'currencyCode', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc' });
  const [formOpen, setFormOpen] = useState(false); const [formMode, setFormMode] = useState<FormMode>('view'); const [selected, setSelected] = useState<Currency | null>(null); const [pending, setPending] = useState<Pending>(null);
  const details = useCurrency(selected?.id ?? null, formOpen && formMode !== 'create');
  const saveMutation = useSaveCurrency(); const archiveMutation = useArchiveCurrency(); const restoreMutation = useRestoreCurrency();
  const rows = query.data?.items ?? [];
  const openForm = useCallback((mode: FormMode, item: Currency | null) => { if (mode !== 'view' && isReadOnly) return notifyBlockedAction(); setSelected(item); setFormMode(mode); setFormOpen(true); }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelected(null); }, []);
  const save = useCallback(async (request: CurrencyRequest) => { try { await saveMutation.mutateAsync({ id: formMode === 'edit' ? selected?.id ?? null : null, request, rowVersion: details.data?.rowVersion ?? selected?.rowVersion }); showToast.success(t(formMode === 'edit' ? 'currencies.messages.updated' : 'currencies.messages.created')); closeForm(); } catch (error) { if (isConcurrencyConflict(error)) { await query.refetch(); if (selected?.id) await details.refetch(); closeForm(); showToast.warning(t('currencies.messages.conflictReloaded')); return; } showToast.error(error, t('currencies.messages.saveFailed')); } }, [closeForm, details, formMode, query, saveMutation, selected, t]);
  const confirm = useCallback(async () => { if (!pending) return; if (isReadOnly) return notifyBlockedAction(); try { if (pending.kind === 'archive') await archiveMutation.mutateAsync({ id: pending.item.id, rowVersion: pending.item.rowVersion }); else await restoreMutation.mutateAsync({ id: pending.item.id, rowVersion: pending.item.rowVersion }); showToast.success(t(`currencies.messages.${pending.kind}`)); setPending(null); } catch (error) { if (isConcurrencyConflict(error)) { await query.refetch(); setPending(null); showToast.warning(t('currencies.messages.conflictReloaded')); return; } showToast.error(error, t('currencies.messages.actionFailed')); } }, [archiveMutation, isReadOnly, notifyBlockedAction, pending, query, restoreMutation, t]);
  const columns = useMemo<AppDataTableColumn<Currency>[]>(() => [
    { id: 'currencyCode', header: t('currencies.fields.currencyCode'), width: 110, sortable: true, render: item => <AppText variant="bodySmall" weight="700">{item.currencyCode}</AppText> },
    { id: 'nameEn', header: t('currencies.fields.nameEn'), width: 180, sortable: true, render: item => <AppText variant="bodySmall">{item.nameEn}</AppText> },
    { id: 'nameAr', header: t('currencies.fields.nameAr'), width: 180, sortable: true, render: item => <AppText variant="bodySmall">{item.nameAr}</AppText> },
    { id: 'symbol', header: t('currencies.fields.symbol'), width: 100, sortable: true, render: item => <AppText variant="bodySmall">{item.symbol}</AppText> },
    { id: 'recordStatus', header: t('currencies.fields.status'), width: 110, render: item => <AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'currencies.recordStatus.archived' : 'currencies.recordStatus.active')} /> },
    { id: 'actions', header: t('common.actions'), width: 150, align: 'center', render: item => <View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />{canEdit && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}{item.isDeleted ? (canRestore ? <AppIconButton icon="refresh-outline" label={t('common.restore')} onPress={() => setPending({ kind: 'restore', item })} /> : null) : (canArchive ? <AppIconButton icon="archive-outline" label={t('common.archive')} onPress={() => setPending({ kind: 'archive', item })} /> : null)}</View> },
  ], [canArchive, canEdit, canRestore, openForm, t, theme.colors.success, theme.colors.warning]);
  if (!canView) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if (query.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error, t('currencies.messages.loadFailed'))} onRetry={() => void query.refetch()} /></AppScreen>;
  const filterValues = { field: searchField, operator: searchOperator, ...list.state.filters };
  return <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
    <AppListScreen<Currency, 'table' | 'cards'> defaultView="table" items={rows} isFetching={query.isFetching} emptyContent={<AppStateView state="empty" message={t('currencies.empty')} />} fillViewSelector showViewLabels showResultCount={false} searchValue={list.searchInput} searchPlaceholder={t('currencies.search.placeholder')} onSearchChange={list.setSearchInput}
      filterControl={<CurrencyFilterButton values={filterValues} onApply={values => { setSearchField(values.field); setSearchOperator(values.operator); list.setFilters({ recordStatus: values.recordStatus }); list.setPage(0); }} />}
      searchActions={canCreate ? <AppIconButton icon="add-outline" label={t('currencies.actions.add')} color={theme.colors.onPrimary} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? .75 : 1 })} /> : null}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: query.data?.metaData.totalCount ?? 0, pageSizeOptions: [3, 5, 10], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
      views={[
        { value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: items => <AppDataTable rows={items} columns={columns} getRowKey={item => item.id} showPagination={false} serverState={{ page: list.state.page, pageSize: list.state.pageSize, totalRows: query.data?.metaData.totalCount ?? 0, sort: list.state.sort, onPageChange: list.setPage, onPageSizeChange: list.setPageSize, onSortChange: sort => list.setSort(sort ? { ...sort, columnId: sort.columnId as CurrencySortColumn } : null) }} /> },
        { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: items => <View style={styles.cards}>{items.map((item, index) => <AppDataCard key={item.id} active={index === 0} padding="md"><View style={styles.cardHeader}><View style={styles.cardTitle}><AppText variant="titleSmall" weight="800">{item.currencyCode} · {item.symbol}</AppText><AppText color="muted" variant="caption">{item.nameEn} / {item.nameAr}</AppText></View><AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'currencies.recordStatus.archived' : 'currencies.recordStatus.active')} /></View><View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />{canEdit && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}{item.isDeleted ? (canRestore ? <AppIconButton icon="refresh-outline" label={t('common.restore')} onPress={() => setPending({ kind: 'restore', item })} /> : null) : (canArchive ? <AppIconButton icon="archive-outline" label={t('common.archive')} onPress={() => setPending({ kind: 'archive', item })} /> : null)}</View></AppDataCard>)}</View> },
      ]} />
    {formOpen ? <CurrencyForm key={`${formMode}-${selected?.id ?? 'new'}-${details.data?.rowVersion ?? 'pending'}`} item={details.data ?? selected} mode={formMode} loading={saveMutation.isPending} detailLoading={formMode !== 'create' && details.isFetching} detailError={details.error ? errorMessage(details.error, t('currencies.messages.loadFailed')) : null} onRetryDetail={() => void details.refetch()} onClose={closeForm} onSave={save} /> : null}
    <ConfirmationDialog visible={pending !== null} title={t(`currencies.confirm.${pending?.kind ?? 'archive'}Title`)} description={t(`currencies.confirm.${pending?.kind ?? 'archive'}Description`, { code: pending?.item.currencyCode ?? '' })} confirmLabel={t(pending?.kind === 'restore' ? 'common.restore' : 'common.archive')} tone={pending?.kind === 'archive' ? 'warning' : 'default'} loading={archiveMutation.isPending || restoreMutation.isPending} onCancel={() => setPending(null)} onConfirm={() => void confirm()} />
  </AppScreen>;
}

function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function isConcurrencyConflict(error: unknown) { return error instanceof ApiError && error.status === 409 && error.problem?.code === 'ConcurrencyConflict'; }
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, actions: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }, cards: { gap: 8 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, cardTitle: { flex: 1, gap: 2 } });
