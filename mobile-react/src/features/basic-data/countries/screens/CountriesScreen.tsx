import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppIconButton,
  AppListScreen,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import { CountryCard } from '../components/CountryCard';
import { CountryFilterButton } from '../components/CountryFilterButton';
import { CountryForm } from '../components/CountryForm';
import { CountryReportView } from '../components/CountryReportView';
import {
  useArchiveCountry,
  useBulkArchiveCountries,
  useCountries,
  useRestoreCountry,
  useSaveCountry,
} from '../queries/use-countries';
import type { Country, CountryFilters, CountryRequest, CountrySearchField, CountrySearchOperator, CountrySortColumn } from '../types/country';

type FormMode = 'create' | 'edit' | 'view';
type PendingAction = { kind: 'archive'; country: Country } | { kind: 'bulk' } | null;

const initialFilters: CountryFilters = { status: 'active', currencyCode: '', hasStates: 'all' };

export function CountriesScreen() {
  const { i18n, t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: isCreateAuthorized } = useAuthorization({ requiredPermissions: [permissions.CreateCountries] });
  const { allowed: isEditAuthorized } = useAuthorization({ requiredPermissions: [permissions.EditCountries] });
  const { allowed: isDeleteAuthorized } = useAuthorization({ requiredPermissions: [permissions.DeleteCountries] });
  const canCreate = isCreateAuthorized && !isReadOnly;
  const canEdit = isEditAuthorized && !isReadOnly;
  const canDelete = isDeleteAuthorized && !isReadOnly;
  const list = useServerListState<CountrySortColumn, CountryFilters>({ initialFilters, initialPageSize: 5, initialSort: { columnId: 'createdOn', direction: 'descending' } });
  const [searchField, setSearchField] = useState<CountrySearchField>('all');
  const [searchOperator, setSearchOperator] = useState<CountrySearchOperator>('contains');
  const countriesQuery = useCountries({
    pageNumber: toApiPageNumber(list.state.page), pageSize: list.state.pageSize,
    search: list.state.search, searchField, searchOperator, status: list.state.filters.status,
    currencyCode: list.state.filters.currencyCode, hasStates: list.state.filters.hasStates,
    sortBy: list.state.sort?.columnId ?? 'nameEn', sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc',
  });
  const saveMutation = useSaveCountry();
  const archiveMutation = useArchiveCountry();
  const restoreMutation = useRestoreCountry();
  const bulkArchiveMutation = useBulkArchiveCountries();
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const rows = countriesQuery.data?.items ?? [];
  const setListSearchInput = list.setSearchInput;
  const setListPage = list.setPage;
  const setListPageSize = list.setPageSize;
  const setListFilters = list.setFilters;
  const setListSort = list.setSort;
  const listFilters = list.state.filters;

  const clearBulkSelection = useCallback(() => {
    setSelectedIds([]);
    setPendingAction((current) => current?.kind === 'bulk' ? null : current);
  }, []);
  const changeSearch = useCallback((value: string) => {
    clearBulkSelection();
    setListSearchInput(value);
  }, [clearBulkSelection, setListSearchInput]);
  const changePage = useCallback((page: number) => {
    clearBulkSelection();
    setListPage(page);
  }, [clearBulkSelection, setListPage]);
  const changePageSize = useCallback((pageSize: number) => {
    clearBulkSelection();
    setListPageSize(pageSize);
  }, [clearBulkSelection, setListPageSize]);
  const applyFilters = useCallback((next: { field: CountrySearchField; operator: CountrySearchOperator; status: CountryFilters['status'] }) => {
    clearBulkSelection();
    setSearchField(next.field);
    setSearchOperator(next.operator);
    setListFilters({
      ...listFilters,
      status: next.status,
    });
    setListPage(0);
  }, [clearBulkSelection, listFilters, setListFilters, setListPage]);
  const changeSort = useCallback((sort: { columnId: string; direction: 'ascending' | 'descending' } | null) => {
    clearBulkSelection();
    setListSort(sort ? {
      columnId: sort.columnId as CountrySortColumn,
      direction: sort.direction,
    } : null);
  }, [clearBulkSelection, setListSort]);

  const openForm = useCallback((mode: FormMode, country: Country | null) => {
    if (mode !== 'view' && isReadOnly) {
      notifyBlockedAction();
      return;
    }
    setFormMode(mode); setSelectedCountry(country);
  }, [isReadOnly, notifyBlockedAction]);
  const closeForm = useCallback(() => {
    setSelectedCountry(null);
    setFormMode('view');
  }, []);
  const toggleSelection = useCallback((country: Country) => {
    setSelectedIds((ids) => ids.includes(country.id) ? ids.filter((id) => id !== country.id) : [...ids, country.id]);
  }, []);
  const save = useCallback(async (request: CountryRequest) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    const authorized = formMode === 'edit' ? isEditAuthorized : isCreateAuthorized;
    if (!authorized) return;
    try {
      await saveMutation.mutateAsync({ id: formMode === 'edit' ? selectedCountry?.id ?? null : null, request });
      closeForm();
      showToast.success(t('countries.saved'));
    } catch (error) {
      showToast.error(error, t('countries.saveFailed'));
    }
  }, [closeForm, formMode, isCreateAuthorized, isEditAuthorized, isReadOnly, notifyBlockedAction, saveMutation, selectedCountry?.id, t]);
  const restore = useCallback(async (country: Country) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!isDeleteAuthorized) return;
    try { await restoreMutation.mutateAsync(country.id); showToast.success(t('countries.restored')); }
    catch (error) { showToast.error(error, t('countries.restoreFailed')); }
  }, [isDeleteAuthorized, isReadOnly, notifyBlockedAction, restoreMutation, t]);
  const confirmAction = useCallback(async () => {
    if (!pendingAction) return;
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!isDeleteAuthorized) return;
    try {
      if (pendingAction.kind === 'bulk') {
        const result = await bulkArchiveMutation.mutateAsync(selectedIds);
        setSelectedIds([]);
        showToast.success(t('countries.bulkArchived', { count: result.archivedCount }));
      } else {
        await archiveMutation.mutateAsync(pendingAction.country.id);
        setSelectedIds((ids) => ids.filter((id) => id !== pendingAction.country.id));
        showToast.success(t('countries.archivedSuccess'));
      }
      setPendingAction(null);
    } catch (error) { showToast.error(error, t('countries.archiveFailed')); }
  }, [archiveMutation, bulkArchiveMutation, isDeleteAuthorized, isReadOnly, notifyBlockedAction, pendingAction, selectedIds, t]);

  const columns = useMemo<AppDataTableColumn<Country>[]>(() => [
    { id: 'nameEn', header: t('countries.nameEn'), width: 170, sortable: true, render: (country) => <AppText variant="bodySmall" weight="700">{country.nameEn}</AppText> },
    { id: 'nameAr', header: t('countries.nameAr'), width: 160, sortable: true, render: (country) => <AppText variant="bodySmall">{country.nameAr}</AppText> },
    { id: 'alpha2Code', header: t('countries.alpha2Code'), width: 90, sortable: true, align: 'center', render: (country) => <AppText variant="bodySmall">{country.alpha2Code ?? '—'}</AppText> },
    { id: 'currencyCode', header: t('countries.currencyCode'), width: 110, sortable: true, align: 'center', render: (country) => <AppText variant="bodySmall">{country.currencyCode ?? '—'}</AppText> },
    { id: 'states', header: t('countries.states'), width: 92, align: 'center', render: (country) => <AppText variant="bodySmall">{country.statesCount}</AppText> },
    { id: 'createdOn', header: t('countries.createdOn'), width: 135, sortable: true, render: (country) => <AppText variant="bodySmall">{formatDate(country.createdOn, i18n.language)}</AppText> },
    { id: 'status', header: t('countries.status'), width: 110, align: 'center', render: (country) => <AppStatusBadge color={country.isDeleted ? theme.colors.warning : theme.colors.success} label={t(country.isDeleted ? 'countries.archived' : 'countries.active')} /> },
    { id: 'actions', header: t('countries.actions'), width: 190, align: 'center', render: (country) => <View style={styles.tableActions}>
      <AppIconButton icon="eye-outline" label={t('countries.viewCountry')} onPress={() => openForm('view', country)} />
      {canEdit && !country.isDeleted ? <AppIconButton icon="create-outline" label={t('countries.editCountry')} onPress={() => openForm('edit', country)} /> : null}
      {canDelete ? <AppIconButton icon={country.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(country.isDeleted ? 'countries.restore' : 'countries.archive')} onPress={() => country.isDeleted ? void restore(country) : setPendingAction({ kind: 'archive', country })} /> : null}
    </View> },
  ], [canDelete, canEdit, i18n.language, openForm, restore, t, theme.colors.success, theme.colors.warning]);
  if (countriesQuery.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (countriesQuery.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView message={errorMessage(countriesQuery.error, t('countries.loadFailed'))} onRetry={() => void countriesQuery.refetch()} state="error" /></AppScreen>;

  return <AppScreen contentContainerStyle={styles.screen} edges={['left', 'right', 'bottom']} refreshControl={<RefreshControl colors={[theme.colors.primary]} onRefresh={() => void countriesQuery.refetch()} refreshing={countriesQuery.isRefetching} tintColor={theme.colors.primary} />}>
    <AppPageHeader action={<View style={[styles.headerActions, { direction }]}>{selectedIds.length > 0 && canDelete ? <AppButton icon="archive-outline" onPress={() => setPendingAction({ kind: 'bulk' })} variant="outline">{t('countries.archiveSelected', { count: selectedIds.length })}</AppButton> : null}{canCreate ? <AppIconButton color={theme.colors.onPrimary} icon="add-outline" label={t('countries.addCountry')} onPress={() => openForm('create', null)} style={[styles.add, { backgroundColor: theme.colors.primary }]} /> : null}</View>} compact subtitle={t('countries.formSubtitle')} title={t('countries.title')} />
    <AppListScreen<Country, 'table' | 'cards' | 'report'>
      defaultView="table" emptyContent={<AppStateView message={t('countries.empty')} state="empty" />}
      filterControl={<CountryFilterButton field={searchField} onApply={applyFilters} operator={searchOperator} status={list.state.filters.status} />}
      isFetching={countriesQuery.isFetching}
      items={rows}
      onSearchChange={changeSearch}
      searchPlaceholder={t('countries.search')}
      searchValue={list.searchInput}
      serverPagination={{ onPageChange: changePage, onPageSizeChange: changePageSize, page: list.state.page, pageSize: list.state.pageSize, pageSizeOptions: [3, 5, 10], totalItems: countriesQuery.data?.metaData.totalCount ?? 0 }}
      showResultCount={false}
      showViewLabels
      views={[
        { value: 'table', icon: 'grid-outline', label: t('multiView.table'), defaultPageSize: 5, render: (items) => <AppDataTable columns={columns} getRowKey={(country) => country.id} rows={items} showPagination={false} serverState={{ onPageChange: changePage, onPageSizeChange: changePageSize, onSortChange: changeSort, page: list.state.page, pageSize: list.state.pageSize, sort: list.state.sort, totalRows: countriesQuery.data?.metaData.totalCount ?? 0 }} /> },
        { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), defaultPageSize: 3, scrollable: true, render: (items) => <View style={styles.cards}>{items.map((country) => <CountryCard canDelete={canDelete} canEdit={canEdit} country={country} key={country.id} onArchive={(item) => setPendingAction({ kind: 'archive', country: item })} onEdit={(item) => openForm('edit', item)} onRestore={(item) => void restore(item)} onToggleSelection={toggleSelection} onView={(item) => openForm('view', item)} selected={selectedIds.includes(country.id)} />)}</View> },
        { value: 'report', icon: 'document-text-outline', label: t('countries.reportView'), paginate: false, renderWhenEmpty: true, render: () => <CountryReportView /> },
      ]}
    />
    {selectedCountry || formMode === 'create' ? <CountryForm country={selectedCountry} loading={saveMutation.isPending} mode={formMode} onClose={closeForm} onSave={save} /> : null}
    <ConfirmationDialog confirmLabel={t('countries.archive')} description={t(pendingAction?.kind === 'bulk' ? 'countries.bulkArchiveDescription' : 'countries.archiveDescription', { count: selectedIds.length, name: pendingAction?.kind === 'archive' ? pendingAction.country.nameEn : '' })} loading={archiveMutation.isPending || bulkArchiveMutation.isPending} onCancel={() => setPendingAction(null)} onConfirm={() => void confirmAction()} title={t(pendingAction?.kind === 'bulk' ? 'countries.bulkArchiveTitle' : 'countries.archiveTitle')} tone="warning" visible={pendingAction !== null} />
  </AppScreen>;
}
function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }
function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}
const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 }, add: { backgroundColor: 'transparent', height: 38, width: 38 }, tableActions: { flexDirection: 'row', justifyContent: 'center', gap: 4 }, cards: { gap: 6 } });
