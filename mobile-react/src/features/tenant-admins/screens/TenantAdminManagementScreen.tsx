import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useTenants } from '@/src/features/tenants';
import { TenantAdminForm } from '@/src/features/tenant-admins/components/TenantAdminForm';
import {
  useDeleteTenantAdmin,
  useSaveTenantAdmin,
  useTenantAdmins,
} from '@/src/features/tenant-admins/hooks/useTenantAdmins';
import type {
  TenantAdmin,
  TenantAdminRequest,
} from '@/src/features/tenant-admins/types/tenant-admin';
import {
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppIcon,
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

type TenantAdminView = 'table' | 'cards';

export function TenantAdminManagementScreen() {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const adminsQuery = useTenantAdmins();
  const tenantsQuery = useTenants();
  const saveMutation = useSaveTenantAdmin();
  const deleteMutation = useDeleteTenantAdmin();
  const [editing, setEditing] = useState<TenantAdmin | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<TenantAdmin | null>(null);

  const admins = useMemo(() => adminsQuery.data ?? [], [adminsQuery.data]);

  const [selectedAdminFilters, setSelectedAdminFilters] = useState<string[]>([]);

  const adminFilterOptions = useMemo(() => [
    { icon: 'checkmark-circle-outline' as const, label: t('tenantAdmins.active'), value: 'active' },
    { icon: 'pause-circle-outline' as const, label: t('tenantAdmins.disabled'), value: 'disabled' },
    { icon: 'lock-closed-outline' as const, label: t('tenantAdmins.locked'), value: 'locked' },
  ], [t]);

  const filteredAdmins = useMemo(() => {
    if (selectedAdminFilters.length === 0) return admins;
    return admins.filter((admin) => {
      if (selectedAdminFilters.includes('disabled') && admin.isDisabled) return true;
      if (selectedAdminFilters.includes('locked') && admin.isLocked) return true;
      if (selectedAdminFilters.includes('active') && !admin.isDisabled && !admin.isLocked) return true;
      return false;
    });
  }, [admins, selectedAdminFilters]);

  const searchAdmins = useCallback(
    (items: readonly TenantAdmin[], searchTerm: string) => {
      const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
      if (!query) return items;

      return items.filter((admin) => [
        admin.firstName,
        admin.lastName,
        `${admin.firstName} ${admin.lastName}`,
        admin.userName,
        admin.email,
        admin.tenants.map((tenant) => `${tenant.name} ${tenant.identifier}`).join(' '),
        t(getStatusKey(admin)),
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query)));
    },
    [i18n.language, t],
  );

  const openCreate = () => {
    saveMutation.reset();
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (admin: TenantAdmin) => {
    saveMutation.reset();
    setEditing(admin);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setFormOpen(false);
    setEditing(null);
    saveMutation.reset();
  };

  const save = async (request: TenantAdminRequest) => {
    try {
      await saveMutation.mutateAsync({ id: editing?.id ?? null, request });
      setFormOpen(false);
      setEditing(null);
      showToast.success(t('tenantAdmins.saved'));
    } catch (error) {
      showToast.error(error, t('tenantAdmins.saveFailed'));
      throw error;
    }
  };

  const remove = async () => {
    if (!deleting) return;

    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
      showToast.success(t('tenantAdmins.deleted'));
    } catch (error) {
      showToast.error(error, t('tenantAdmins.deleteFailed'));
    }
  };

  const columns: AppDataTableColumn<TenantAdmin>[] = [
    {
      id: 'administrator',
      header: t('tenantAdmins.administrator'),
      width: 210,
      sortValue: (admin) => `${admin.firstName} ${admin.lastName}`,
      render: (admin) => (
        <View style={styles.primaryCell}>
          <AppText numberOfLines={1} variant="bodySmall" weight="700">
            {admin.firstName} {admin.lastName}
          </AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            @{admin.userName}
          </AppText>
        </View>
      ),
    },
    {
      id: 'email',
      header: t('tenantAdmins.email'),
      width: 220,
      sortValue: (admin) => admin.email,
      render: (admin) => (
        <AppText numberOfLines={1} variant="bodySmall">{admin.email}</AppText>
      ),
    },
    {
      id: 'defaultTenant',
      header: t('tenantAdmins.defaultTenant'),
      width: 210,
      sortValue: (admin) => getDefaultTenant(admin)?.name,
      render: (admin) => (
        <View style={styles.primaryCell}>
          <AppText numberOfLines={1} variant="bodySmall">
            {getDefaultTenant(admin)?.name ?? t('tenantAdmins.noDefaultTenant')}
          </AppText>
          <AppText color="muted" variant="caption">
            {t('tenantAdmins.assignedCount', { count: admin.tenants.length })}
          </AppText>
        </View>
      ),
    },
    {
      id: 'companies',
      header: t('tenantAdmins.companies'),
      width: 110,
      align: 'center',
      sortValue: (admin) => admin.companyIds.length,
      render: (admin) => <AppText variant="bodySmall">{admin.companyIds.length}</AppText>,
    },
    {
      id: 'status',
      header: t('tenantAdmins.status'),
      width: 130,
      align: 'center',
      sortValue: (admin) => t(getStatusKey(admin)),
      render: (admin) => <AdminStatus admin={admin} />,
    },
    {
      id: 'actions',
      header: t('tenantAdmins.actions'),
      width: 120,
      align: 'center',
      render: (admin) => (
        <View style={[styles.tableActions, { direction }]}>
          <AppIconButton
            color={theme.colors.primary}
            icon="create-outline"
            label={t('tenantAdmins.editAction')}
            onPress={() => openEdit(admin)}
          />
          <AppIconButton
            color={theme.colors.danger}
            icon="trash-outline"
            label={t('tenantAdmins.deleteAction')}
            onPress={() => setDeleting(admin)}
          />
        </View>
      ),
    },
  ];

  const isLoading = adminsQuery.isLoading || tenantsQuery.isLoading;
  const queryError = adminsQuery.error ?? tenantsQuery.error;

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void Promise.all([
            adminsQuery.refetch(),
            tenantsQuery.refetch(),
          ])}
          refreshing={adminsQuery.isRefetching || tenantsQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }>
      <AppPageHeader
        action={(
          <AppIconButton
            color={theme.colors.onPrimary}
            icon="person-add-outline"
            label={t('tenantAdmins.add')}
            onPress={openCreate}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          />
        )}
        subtitle={t('tenantAdmins.subtitle')}
        title={t('tenantAdmins.title')}
      />

      {isLoading ? (
        <AppStateView state="loading" />
      ) : queryError ? (
        <AppStateView
          message={getErrorMessage(queryError, t('states.errorMessage'))}
          onRetry={() => void Promise.all([
            adminsQuery.refetch(),
            tenantsQuery.refetch(),
          ])}
          state="error"
        />
      ) : (
        <AppListScreen<TenantAdmin, TenantAdminView>
          defaultView="cards"
          emptyContent={<AppStateView message={t('tenantAdmins.empty')} state="empty" />}
          items={filteredAdmins}
          filter={{
            options: adminFilterOptions,
            values: selectedAdminFilters,
            onChange: setSelectedAdminFilters,
            modalTitle: t('tenantAdmins.filterByStatus'),
          }}
          onSearch={searchAdmins}
          searchPlaceholder={t('tenantAdmins.search')}
          showViewLabels
          views={[
            {
              value: 'table',
              defaultPageSize: 5,
              label: t('multiView.table'),
              icon: 'grid-outline',
              paginate: false,
              pageSizeOptions: [5, 10, 25],
              render: (admins) => (
                <AppDataTable
                  columns={columns}
                  defaultPageSize={5}
                  emptyMessage={t('tenantAdmins.empty')}
                  getRowKey={(admin) => admin.id}
                  pageSizeOptions={[5, 10, 25]}
                  rows={admins}
                />
              ),
            },
            {
              value: 'cards',
              carousel: true,
              getItemKey: (admin) => admin.id,
              label: t('multiView.cards'),
              icon: 'albums-outline',
              scrollable: true,
              render: (pageAdmins) => (
                <View style={styles.list}>
                  {pageAdmins.map((admin) => (
                    <AdminCard
                      admin={admin}
                      key={admin.id}
                      onDelete={() => setDeleting(admin)}
                      onEdit={() => openEdit(admin)}
                    />
                  ))}
                </View>
              ),
            },
          ]}
        />
      )}

      {formOpen ? (
        <TenantAdminForm
          admin={editing}
          loading={saveMutation.isPending}
          onClose={closeForm}
          onSave={save}
          tenants={tenantsQuery.data ?? []}
        />
      ) : null}

      <ConfirmationDialog
        confirmLabel={t('tenantAdmins.deleteAction')}
        description={t('tenantAdmins.deleteDescription')}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        title={t('tenantAdmins.deleteTitle')}
        tone="danger"
        visible={deleting !== null}>
        <AppText variant="label">
          {deleting ? `${deleting.firstName} ${deleting.lastName}` : ''}
        </AppText>
      </ConfirmationDialog>
    </AppScreen>
  );
}

function AdminCard({
  admin,
  onEdit,
  onDelete,
}: {
  admin: TenantAdmin;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard style={styles.card}>
      <View style={[styles.cardHeader, { direction }]}>
        <View
          style={[
            styles.adminIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
          ]}>
          <AppIcon color={theme.colors.primary} name="shield-checkmark-outline" size={24} />
        </View>
        <View style={styles.adminName}>
          <AppText numberOfLines={1} variant="titleSmall">
            {admin.firstName} {admin.lastName}
          </AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            @{admin.userName} · {admin.email}
          </AppText>
        </View>
        <AdminStatus admin={admin} />
      </View>

      <View style={[styles.metrics, { direction }]}>
        <Metric label={t('tenantAdmins.assignedTenants')} value={admin.tenants.length} />
        <Metric label={t('tenantAdmins.companies')} value={admin.companyIds.length} />
      </View>

      <View style={styles.access}>
        <AppText variant="label">{t('tenantAdmins.assignedTenants')}</AppText>
        <View style={[styles.chips, { direction }]}>
          {admin.tenants.map((tenant) => (
            <AppStatusBadge
              color={tenant.isDefault ? theme.colors.primary : theme.colors.textMuted}
              icon={tenant.isDefault ? 'home-outline' : 'business-outline'}
              key={tenant.id}
              label={tenant.isDefault
                ? `${tenant.name} · ${t('tenantAdmins.default')}`
                : tenant.name}
            />
          ))}
        </View>
      </View>

      <View style={[styles.cardFooter, { direction, borderTopColor: theme.colors.border }]}>
        <AppIconButton
          color={theme.colors.primary}
          icon="create-outline"
          label={t('tenantAdmins.editAction')}
          onPress={onEdit}
        />
        <AppIconButton
          color={theme.colors.danger}
          icon="trash-outline"
          label={t('tenantAdmins.deleteAction')}
          onPress={onDelete}
        />
      </View>
    </AppCard>
  );
}

function AdminStatus({ admin }: { admin: TenantAdmin }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const unavailable = admin.isDisabled || admin.isLocked;

  return (
    <AppStatusBadge
      color={unavailable ? theme.colors.danger : theme.colors.success}
      icon={admin.isLocked
        ? 'lock-closed-outline'
        : admin.isDisabled
          ? 'pause-circle-outline'
          : 'checkmark-circle-outline'}
      label={t(getStatusKey(admin))}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <AppText color="muted" variant="caption">{label}</AppText>
      <AppText variant="titleSmall">{value}</AppText>
    </View>
  );
}

function getStatusKey(admin: TenantAdmin): string {
  if (admin.isDisabled) return 'tenantAdmins.disabled';
  if (admin.isLocked) return 'tenantAdmins.locked';
  return 'tenantAdmins.active';
}

function getDefaultTenant(admin: TenantAdmin) {
  return admin.tenants.find((tenant) => tenant.isDefault || tenant.id === admin.defaultTenantId);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

const styles = StyleSheet.create({
  addButton: { flexShrink: 0 },
  list: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    flexGrow: 1,
    flexBasis: 320,
    gap: 16,
  },
  primaryCell: { width: '100%', gap: 2 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminName: { flex: 1, minWidth: 0, gap: 2 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { flexGrow: 1, flexBasis: 120, gap: 2 },
  access: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  tableActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
