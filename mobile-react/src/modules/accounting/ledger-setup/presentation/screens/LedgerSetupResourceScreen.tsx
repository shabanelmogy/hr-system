import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/platform/auth';
import {
  AppDataCard,
  AppDataTable,
  AppHierarchicalTree,
  AppIconButton,
  AppListScreen,
  AppPageHeader,
  AppScreen,
  AppSegmentedControl,
  AppSelectField,
  AppStateView,
  AppStatusBadge,
  AppText,
  ConfirmationDialog,
  showToast,
  type AppDataTableColumn,
  type AppSelectOption,
  type AppIconName,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { ledgerSetupDefinitions, ledgerSetupResourceEntities } from '../../domain/models/ledger-setup-definitions';
import type { LedgerSetupEntity, LedgerSetupFormValues, LedgerSetupLookupSource, LedgerSetupRecord, LedgerSetupResource } from '../../domain/models/ledger-setup';
import { AccountResolutionPreview } from '../components/AccountResolutionPreview';
import { LedgerSetupForm } from '../components/LedgerSetupForm';
import { getLedgerSetupAccount, useArchiveLedgerSetup, useLedgerSetupAccountTree, useLedgerSetupList, useLedgerSetupLookups, useRestoreLedgerSetup, useSaveLedgerSetup } from '../queries/use-ledger-setup';

type FormMode = 'create' | 'edit' | 'view';
type Pending = { kind: 'archive' | 'restore'; item: LedgerSetupRecord } | null;

function displayValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '—';
}

function recordTitle(item: LedgerSetupRecord): string {
  return [item.code ?? item.currencyCode ?? item.levelNumber, item.nameEn ?? item.nameAr].filter(Boolean).join(' · ') || String(item.id ?? '');
}

function getManagePermission(entity: LedgerSetupEntity) {
  if (entity === 'accounts' || entity === 'hierarchyLevels') return permissions.ManageAccounts;
  if (entity === 'dimensionDefinitions' || entity === 'dimensionValues' || entity === 'dimensionPolicies') return permissions.ManageDimensions;
  return permissions.ManageAccountingSetup;
}

export function LedgerSetupResourceScreen({ resource }: { resource: LedgerSetupResource }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const entities = ledgerSetupResourceEntities[resource];
  const [activeEntity, setActiveEntity] = useState<LedgerSetupEntity>(entities[0]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [scopeSearch, setScopeSearch] = useState('');
  const definition = ledgerSetupDefinitions[activeEntity];
  const viewAccounting = useAuthorization({ requiredPermissions: [permissions.ViewAccountingSetup] });
  const viewAccounts = useAuthorization({ requiredPermissions: [permissions.ViewAccounts] });
  const viewDimensions = useAuthorization({ requiredPermissions: [permissions.ViewDimensions] });
  const manageAccounting = useAuthorization({ requiredPermissions: [permissions.ManageAccountingSetup] });
  const manageAccounts = useAuthorization({ requiredPermissions: [permissions.ManageAccounts] });
  const manageDimensions = useAuthorization({ requiredPermissions: [permissions.ManageDimensions] });
  const canView = activeEntity === 'accounts' || activeEntity === 'hierarchyLevels'
    ? viewAccounts.allowed
    : activeEntity.startsWith('dimension')
      ? viewDimensions.allowed
      : viewAccounting.allowed;
  const managePermission = getManagePermission(activeEntity);
  const canWrite = managePermission === permissions.ManageAccounts
    ? manageAccounts.allowed
    : managePermission === permissions.ManageDimensions
      ? manageDimensions.allowed
      : manageAccounting.allowed;
  const canManage = canWrite && !isReadOnly;
  const requestedLookupSources = useMemo<LedgerSetupLookupSource[]>(() => Array.from(new Set([
    ...definition.fields.flatMap((field) => field.optionSource ? [field.optionSource] : []),
    ...(definition.scope === 'account' ? ['accounts' as const] : definition.scope === 'dimension' ? ['dimensions' as const] : []),
  ])), [definition]);
  const allowedLookupSources = requestedLookupSources.filter((source) => source === 'accounts' || source === 'hierarchyLevels'
    ? viewAccounts.allowed
    : source === 'dimensions'
      ? viewDimensions.allowed
      : viewAccounting.allowed);
  const lookups = useLedgerSetupLookups(allowedLookupSources, allowedLookupSources.length > 0);
  const scopeItems = definition.scope === 'account' ? lookups.data?.accounts : definition.scope === 'dimension' ? lookups.data?.dimensions : undefined;
  const [selectedScopeId, setSelectedScopeId] = useState<number | undefined>();
  const scopeId = scopeItems?.some((item) => item.id === selectedScopeId)
    ? selectedScopeId
    : typeof scopeItems?.[0]?.id === 'number' ? scopeItems[0].id : undefined;
  const paged = ['accounts', 'dimensionDefinitions', 'dimensionValues', 'journals', 'exchangeRates', 'accountMappings', 'postingProfiles'].includes(activeEntity);
  const supportsServerSearch = activeEntity === 'accounts' || activeEntity === 'dimensionDefinitions';
  const query = useLedgerSetupList(activeEntity, scopeId, canView && (!definition.scope || Boolean(scopeId)), page, pageSize, supportsServerSearch ? search.trim() : '');
  const treeQuery = useLedgerSetupAccountTree(activeEntity === 'accounts' && canView);
  const saveMutation = useSaveLedgerSetup();
  const archiveMutation = useArchiveLedgerSetup();
  const restoreMutation = useRestoreLedgerSetup();
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<LedgerSetupRecord | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const rows = query.data ?? [];

  const openForm = useCallback((mode: FormMode, item: LedgerSetupRecord | null) => {
    if (mode !== 'view' && isReadOnly) return notifyBlockedAction();
    setSelected(item);
    setFormMode(mode);
    setFormOpen(true);
  }, [isReadOnly, notifyBlockedAction]);
  const openTreeAccount = useCallback(async (mode: FormMode, item: LedgerSetupRecord) => {
    if (typeof item.id !== 'number') return;
    try { openForm(mode, await getLedgerSetupAccount(item.id)); }
    catch (error) { showToast.error(error, t('ledgerSetup.messages.loadFailed')); }
  }, [openForm, t]);
  const closeForm = useCallback(() => { setFormOpen(false); setSelected(null); }, []);
  const save = useCallback(async (request: LedgerSetupFormValues) => {
    const scopeRequest = definition.scope === 'account'
      ? { ...request, accountId: scopeId }
      : definition.scope === 'dimension'
        ? { ...request, dimensionDefinitionId: scopeId }
        : request;
    await saveMutation.mutateAsync({ entity: activeEntity, id: formMode === 'edit' ? selected?.id ?? null : null, request: scopeRequest });
    showToast.success(t('ledgerSetup.messages.saved'));
    closeForm();
  }, [activeEntity, closeForm, definition.scope, formMode, saveMutation, scopeId, selected?.id, t]);
  const confirmLifecycle = useCallback(async () => {
    if (!pending) return;
    if (isReadOnly) return notifyBlockedAction();
    try {
      if (pending.kind === 'archive') await archiveMutation.mutateAsync({ entity: activeEntity, item: pending.item });
      else await restoreMutation.mutateAsync({ entity: activeEntity, item: pending.item });
      showToast.success(t(pending.kind === 'archive' ? 'ledgerSetup.messages.archived' : 'ledgerSetup.messages.restored'));
      setPending(null);
    } catch (error) {
      showToast.error(error, t('ledgerSetup.messages.actionFailed'));
    }
  }, [activeEntity, archiveMutation, isReadOnly, notifyBlockedAction, pending, restoreMutation, t]);

  const visibleFields = definition.fields.filter((field) => field.name !== 'rowVersion').slice(0, 3);
  const columns = useMemo<AppDataTableColumn<LedgerSetupRecord>[]>(() => [
    ...visibleFields.map((field) => ({ id: field.name, header: t(field.labelKey), width: 150, render: (item: LedgerSetupRecord) => <AppText variant="bodySmall">{displayValue(item[field.name])}</AppText> })),
    ...(definition.supportsArchive ? [{ id: 'status', header: t('ledgerSetup.fields.status'), width: 110, render: (item: LedgerSetupRecord) => <AppStatusBadge color={item.isDeleted ? theme.colors.warning : theme.colors.success} label={t(item.isDeleted ? 'ledgerSetup.status.archived' : 'ledgerSetup.status.active')} /> } satisfies AppDataTableColumn<LedgerSetupRecord>] : []),
    { id: 'actions', header: t('common.actions'), width: 150, align: 'center', render: (item) => <View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />{canManage && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}{canManage && definition.supportsArchive ? <AppIconButton icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(item.isDeleted ? 'common.restore' : 'common.archive')} onPress={() => setPending({ kind: item.isDeleted ? 'restore' : 'archive', item })} /> : null}</View> },
  ], [canManage, definition.supportsArchive, openForm, t, theme.colors.success, theme.colors.warning, visibleFields]);

  if (!canView) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  if ((query.isLoading && (!definition.scope || scopeId)) || lookups.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (query.error || treeQuery.error) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="error" message={errorMessage(query.error ?? treeQuery.error, t('ledgerSetup.messages.loadFailed'))} onRetry={() => { void query.refetch(); if (activeEntity === 'accounts') void treeQuery.refetch(); }} /></AppScreen>;

  const scopeOptions: AppSelectOption<number>[] = (scopeItems ?? []).flatMap((item) => typeof item.id === 'number' ? [{ value: item.id, label: recordTitle(item), icon: definition.scope === 'account' ? 'git-branch-outline' : 'options-outline' }] : []);
  const entityOptions = entities.map((entity) => ({ value: entity, label: t(ledgerSetupDefinitions[entity].titleKey), icon: ledgerSetupDefinitions[entity].icon as AppIconName }));
  const canCreate = canManage && (!definition.scope || Boolean(scopeId)) && (activeEntity !== 'settings' || rows.length === 0);

  return (
    <AppScreen edges={['left', 'right', 'bottom']} contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
      <AppPageHeader title={t(definition.titleKey)} subtitle={t('ledgerSetup.description')} action={canCreate ? <AppIconButton icon="add-outline" label={t('ledgerSetup.actions.add')} color={theme.colors.onPrimary} onPress={() => openForm('create', null)} size={22} style={({ pressed }) => ({ backgroundColor: theme.colors.primary, opacity: pressed ? 0.75 : 1 })} /> : undefined} />
      {entities.length > 1 ? <AppSegmentedControl label={t('ledgerSetup.entitySelector')} value={activeEntity} options={entityOptions} onChange={(value) => { setActiveEntity(value); setPage(0); setSearch(''); setScopeSearch(''); }} layout="wrap" showLabel /> : null}
      {definition.scope ? <AppSelectField label={t(definition.scope === 'account' ? 'ledgerSetup.scope.account' : 'ledgerSetup.scope.dimension')} value={scopeId ?? 0} options={scopeOptions.filter((option) => option.label.toLocaleLowerCase().includes(scopeSearch.toLocaleLowerCase()))} onChange={(value) => { setSelectedScopeId(Number(value)); setPage(0); setScopeSearch(''); }} searchable searchValue={scopeSearch} onSearchChange={setScopeSearch} allowWhenReadOnly /> : null}
      <AppListScreen<LedgerSetupRecord, 'table' | 'cards' | 'tree'>
        items={rows}
        defaultView={activeEntity === 'accounts' ? 'tree' : 'table'}
        searchPlaceholder={t(paged && !supportsServerSearch ? 'ledgerSetup.searchPage' : 'ledgerSetup.search')}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); if (supportsServerSearch) setPage(0); }}
        onSearch={supportsServerSearch ? undefined : (items, term) => items.filter((item) => Object.values(item).some((value) => typeof value === 'string' && value.toLocaleLowerCase().includes(term.toLocaleLowerCase())))}
        serverPagination={paged ? { page, pageSize, totalItems: page * pageSize + rows.length + (rows.length === pageSize ? 1 : 0), pageSizeOptions: [25, 50, 100], onPageChange: setPage, onPageSizeChange: (value) => { setPageSize(value); setPage(0); } } : undefined}
        isFetching={query.isFetching}
        emptyContent={<AppStateView state="empty" message={t(definition.scope && !scopeId ? 'ledgerSetup.emptyScope' : 'ledgerSetup.empty')} />}
        fillViewSelector
        showViewLabels
        views={[
          { value: 'table', icon: 'grid-outline', label: t('multiView.table'), render: (items) => <AppDataTable rows={items} columns={columns} getRowKey={(item) => item.id ?? recordTitle(item)} /> },
          { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), scrollable: true, render: (items) => <View style={styles.cards}>{items.map((item, index) => <AppDataCard key={item.id ?? index} padding="md"><AppText variant="titleSmall" weight="800">{recordTitle(item)}</AppText>{visibleFields.map((field) => <AppText key={field.name} color="muted" variant="bodySmall">{t(field.labelKey)}: {displayValue(item[field.name])}</AppText>)}<View style={styles.actions}><AppIconButton icon="eye-outline" label={t('common.view')} onPress={() => openForm('view', item)} />{canManage && !item.isDeleted ? <AppIconButton icon="create-outline" label={t('common.edit')} onPress={() => openForm('edit', item)} /> : null}{canManage && definition.supportsArchive ? <AppIconButton icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'} label={t(item.isDeleted ? 'common.restore' : 'common.archive')} onPress={() => setPending({ kind: item.isDeleted ? 'restore' : 'archive', item })} /> : null}</View></AppDataCard>)}</View> },
          ...(activeEntity === 'accounts' ? [{ value: 'tree' as const, icon: 'git-branch-outline' as const, label: t('ledgerSetup.accounts.tree'), scrollable: true, renderWhenEmpty: true, render: () => treeQuery.isLoading ? <AppStateView state="loading" /> : <AppHierarchicalTree items={treeQuery.data ?? []} getId={(item) => item.id ?? recordTitle(item)} getParentId={(item) => typeof item.parentAccountId === 'number' ? item.parentAccountId : null} getLabel={recordTitle} getCode={(item) => typeof item.code === 'string' ? item.code : undefined} onView={(item) => { void openTreeAccount('view', item); }} onEdit={canManage ? (item) => { void openTreeAccount('edit', item); } : undefined} canEdit={canManage} canCreate={false} canDelete={false} emptyMessage={t('ledgerSetup.empty')} /> }] : []),
        ]}
      />
      {resource === 'account-determination' ? <AccountResolutionPreview books={lookups.data?.books ?? []} /> : null}
      {formOpen ? <LedgerSetupForm key={`${activeEntity}-${formMode}-${selected?.id ?? 'new'}-${selected?.rowVersion ?? ''}`} definition={definition} item={selected} lookups={lookups.data ?? {}} mode={formMode} loading={saveMutation.isPending} onClose={closeForm} onSave={save} onArchive={formMode === 'view' && canManage && definition.supportsArchive && selected?.rowVersion ? () => { setPending({ kind: selected.isDeleted ? 'restore' : 'archive', item: selected }); closeForm(); } : undefined} /> : null}
      <ConfirmationDialog visible={pending !== null} title={t(`ledgerSetup.confirm.${pending?.kind ?? 'archive'}Title`)} description={t(`ledgerSetup.confirm.${pending?.kind ?? 'archive'}Description`, { record: recordTitle(pending?.item ?? {}) })} confirmLabel={t(pending?.kind === 'restore' ? 'common.restore' : 'common.archive')} tone={pending?.kind === 'archive' ? 'warning' : 'default'} loading={archiveMutation.isPending || restoreMutation.isPending} onCancel={() => setPending(null)} onConfirm={() => void confirmLifecycle()} />
    </AppScreen>
  );
}

function errorMessage(error: unknown, fallback: string) { return error instanceof ApiError || error instanceof Error ? error.message || fallback : fallback; }

const styles = StyleSheet.create({
  screen: { gap: 12, paddingVertical: 8 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' },
  cards: { gap: 8 },
});
