import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { TenantFormModal } from '@/src/features/tenants/components/TenantFormModal';
import { useSaveTenant, useTenants } from '@/src/features/tenants/hooks/useTenants';
import type {
  SubscriptionStatus,
  TenantFormState,
  TenantManagementRequest,
  TenantManagementResponse,
} from '@/src/features/tenants/types/tenant';
import {
  AppButton,
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppIcon,
  AppIconButton,
  type AppIconName,
  AppListScreen,
  type AppMultiViewDefinition,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
  showToast,
} from '@/src/shared/components';

const statusIcons = {
  free: 'gift-outline',
  trial: 'flask-outline',
  active: 'checkmark-circle-outline',
  pastDue: 'time-outline',
  suspended: 'pause-circle-outline',
  expired: 'hourglass-outline',
  cancelled: 'close-circle-outline',
} as const satisfies Record<SubscriptionStatus, AppIconName>;

type TenantView = 'table' | 'cards';

export function TenantManagementScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const tenantsQuery = useTenants();
  const saveMutation = useSaveTenant();
  const [editing, setEditing] = useState<TenantManagementResponse | null>(null);
  const [form, setForm] = useState<TenantFormState | null>(null);

  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);

  const [selectedStatuses, setSelectedStatuses] = useState<SubscriptionStatus[]>([]);

  const statusFilterOptions = useMemo(() => {
    const statuses: SubscriptionStatus[] = ['free', 'trial', 'active', 'pastDue', 'suspended', 'expired', 'cancelled'];
    return statuses.map((status) => ({
      icon: statusIcons[status],
      label: t(`tenantManagement.statuses.${status}`),
      value: status,
    }));
  }, [t]);

  const filteredTenants = useMemo(() => {
    if (selectedStatuses.length === 0) return tenants;
    return tenants.filter((tenant) => selectedStatuses.includes(tenant.subscriptionStatus));
  }, [tenants, selectedStatuses]);

  const searchTenants = useCallback(
    (items: readonly TenantManagementResponse[], searchTerm: string) => {
      const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
      if (!query) return items;
      return items.filter((tenant) => [
        tenant.name,
        tenant.identifier,
        tenant.planName ?? '',
        tenant.billingEmail ?? '',
        tenant.contactName ?? '',
        t(`tenantManagement.statuses.${tenant.subscriptionStatus}`),
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query)));
    },
    [i18n.language, t],
  );

  const openCreate = () => {
    saveMutation.reset();
    setEditing(null);
    setForm(createEmptyForm());
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    saveMutation.reset();
    setEditing(tenant);
    setForm(toForm(tenant));
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setEditing(null);
    setForm(null);
    saveMutation.reset();
  };

  const save = async (values: TenantFormState) => {
    try {
      await saveMutation.mutateAsync({
        id: editing?.id ?? null,
        request: toRequest(values, editing?.rowVersion),
      });
      setEditing(null);
      setForm(null);
      showToast.success(t('tenantManagement.savedSuccessfully'));
    } catch (error) {
      showToast.error(error, t('tenantManagement.saveFailed'));
    }
  };

  const columns: AppDataTableColumn<TenantManagementResponse>[] = [
    {
      id: 'tenant',
      header: t('tenantManagement.name'),
      width: 210,
      sortValue: (tenant) => tenant.name,
      render: (tenant) => (
        <View style={styles.primaryCell}>
          <AppText numberOfLines={1} variant="bodySmall" weight="700">{tenant.name}</AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            {tenant.identifier}
          </AppText>
        </View>
      ),
    },
    {
      id: 'plan',
      header: t('tenantManagement.plan'),
      width: 130,
      sortValue: (tenant) => tenant.planName,
      render: (tenant) => (
        <AppText numberOfLines={1} variant="bodySmall">
          {tenant.planName || t('tenantManagement.noPlan')}
        </AppText>
      ),
    },
    {
      id: 'subscription',
      header: t('tenantManagement.status'),
      width: 145,
      align: 'center',
      sortValue: (tenant) => t(`tenantManagement.statuses.${tenant.subscriptionStatus}`),
      render: (tenant) => (
        <AppStatusBadge
          color={getStatusColor(tenant.subscriptionStatus, theme.colors)}
          icon={statusIcons[tenant.subscriptionStatus]}
          label={t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
        />
      ),
    },
    {
      id: 'accounts',
      header: t('tenantManagement.totalAccounts'),
      width: 120,
      align: 'center',
      sortValue: (tenant) => tenant.totalUserCount,
      render: (tenant) => <AppText variant="bodySmall">{tenant.totalUserCount}</AppText>,
    },
    {
      id: 'endsOn',
      header: t('tenantManagement.endsOn'),
      width: 150,
      align: 'center',
      sortValue: (tenant) => tenant.subscriptionEndsOn
        ? new Date(tenant.subscriptionEndsOn)
        : null,
      render: (tenant) => (
        <AppText variant="bodySmall">
          {tenant.subscriptionEndsOn
            ? formatDate(tenant.subscriptionEndsOn, i18n.language)
            : t('tenantManagement.noEndDate')}
        </AppText>
      ),
    },
    {
      id: 'status',
      header: t('tenantManagement.tenantEnabled'),
      width: 115,
      align: 'center',
      sortValue: (tenant) => tenant.isActive,
      render: (tenant) => (
        <AppStatusBadge
          color={tenant.isActive ? theme.colors.success : theme.colors.textMuted}
          icon={tenant.isActive ? 'checkmark-circle-outline' : 'pause-circle-outline'}
          label={t(tenant.isActive ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
        />
      ),
    },
    {
      id: 'actions',
      header: t('tenantManagement.actions'),
      width: 90,
      align: 'center',
      render: (tenant) => (
        <AppIconButton
          color={theme.colors.primary}
          icon="create-outline"
          label={t('tenantManagement.edit')}
          onPress={() => openEdit(tenant)}
        />
      ),
    },
  ];

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void tenantsQuery.refetch()}
          refreshing={tenantsQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }>
      <AppPageHeader
        action={(
          <AppIconButton
            color={theme.colors.onPrimary}
            icon="add-outline"
            label={t('tenantManagement.addTenant')}
            onPress={openCreate}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          />
        )}
        subtitle={t('tenantManagement.subtitle')}
        title={t('tenantManagement.title')}
      />

      {tenantsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : tenantsQuery.isError ? (
        <AppStateView
          message={getErrorMessage(tenantsQuery.error, t('states.errorMessage'))}
          onRetry={() => void tenantsQuery.refetch()}
          state="error"
        />
      ) : (
        <AppListScreen<TenantManagementResponse, TenantView, SubscriptionStatus>
          defaultView="cards"
          emptyContent={(
            <AppStateView message={t('tenantManagement.emptyMessage')} state="empty" />
          )}
          filter={{
            options: statusFilterOptions,
            values: selectedStatuses,
            onChange: setSelectedStatuses,
            modalTitle: t('tenantManagement.filterByStatus'),
          }}
          items={filteredTenants}
          onSearch={searchTenants}
          searchPlaceholder={t('tenantManagement.search')}
          showViewLabels
          views={[
            {
              value: 'table',
              defaultPageSize: 5,
              label: t('multiView.table'),
              icon: 'grid-outline',
              paginate: false,
              pageSizeOptions: [5, 10, 25],
              render: (tenants) => (
                <AppDataTable
                  columns={columns}
                  defaultPageSize={5}
                  emptyMessage={t('tenantManagement.emptyMessage')}
                  getRowKey={(tenant) => tenant.id}
                  pageSizeOptions={[5, 10, 25]}
                  rows={tenants}
                />
              ),
            },
            {
              value: 'cards',
              carousel: true,
              getItemKey: (tenant) => tenant.id,
              label: t('multiView.cards'),
              icon: 'albums-outline',
              scrollable: true,
              render: (pageTenants) => (
                <View style={styles.list}>
                  {pageTenants.map((tenant) => (
                    <TenantCard
                      key={tenant.id}
                      onEdit={() => openEdit(tenant)}
                      tenant={tenant}
                    />
                  ))}
                </View>
              ),
            },
          ]}
        />
      )}

      {form ? (
        <TenantFormModal
          form={form}
          isEdit={Boolean(editing)}
          loading={saveMutation.isPending}
          onClose={closeForm}
          onSave={save}
        />
      ) : null}
    </AppScreen>
  );
}

function TenantCard({
  tenant,
  onEdit,
}: {
  tenant: TenantManagementResponse;
  onEdit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const statusColor = getStatusColor(tenant.subscriptionStatus, theme.colors);

  return (
    <AppCard style={styles.card}>
      <View style={[styles.cardHeader, { direction }]}>
        <View
          style={[
            styles.tenantIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
          ]}>
          <AppIcon color={theme.colors.primary} name="business-outline" size={24} />
        </View>
        <View style={styles.tenantName}>
          <AppText numberOfLines={1} variant="titleSmall">
            {tenant.name}
          </AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            {tenant.identifier}
          </AppText>
        </View>
        <AppStatusBadge
          color={statusColor}
          icon={statusIcons[tenant.subscriptionStatus]}
          label={t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
        />
      </View>

      <View style={[styles.metrics, { direction }]}>
        <Metric
          label={t('tenantManagement.admins')}
          value={`${tenant.adminCount}/${tenant.maxAdmins}`}
        />
        <Metric
          label={t('tenantManagement.users')}
          value={`${tenant.userCount}/${tenant.maxUsers}`}
        />
        <Metric label={t('tenantManagement.companies')} value={tenant.companyCount} />
        <Metric label={t('tenantManagement.totalAccounts')} value={tenant.totalUserCount} />
      </View>

      <View style={styles.details}>
        <AppText variant="bodySmall">
          {t('tenantManagement.plan')}: {tenant.planName || t('tenantManagement.noPlan')}
        </AppText>
        <AppText color="muted" variant="caption">
          {formatDate(tenant.subscriptionStartedOn, i18n.language)} -{' '}
          {tenant.subscriptionEndsOn
            ? formatDate(tenant.subscriptionEndsOn, i18n.language)
            : t('tenantManagement.noEndDate')}
        </AppText>
      </View>

      <View style={[styles.cardFooter, { direction, borderTopColor: theme.colors.border }]}>
        <AppStatusBadge
          color={tenant.isActive ? theme.colors.success : theme.colors.textMuted}
          icon={tenant.isActive ? 'checkmark-circle-outline' : 'pause-circle-outline'}
          label={t(tenant.isActive ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
        />
        <AppButton icon="create-outline" onPress={onEdit} variant="ghost">
          {t('tenantManagement.edit')}
        </AppButton>
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metric}>
      <AppText color="muted" variant="caption">
        {label}
      </AppText>
      <AppText variant="titleSmall">{value}</AppText>
    </View>
  );
}

function createEmptyForm(): TenantFormState {
  return {
    identifier: '',
    name: '',
    isActive: true,
    subscriptionStatus: 'free',
    subscriptionStartedOn: new Date().toISOString().slice(0, 10),
    subscriptionEndsOn: '',
    planName: 'Free',
    maxAdmins: '1',
    maxUsers: '0',
    billingEmail: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  };
}

function toForm(tenant: TenantManagementResponse): TenantFormState {
  return {
    identifier: tenant.identifier,
    name: tenant.name,
    isActive: tenant.isActive,
    subscriptionStatus: tenant.subscriptionStatus,
    subscriptionStartedOn: tenant.subscriptionStartedOn.slice(0, 10),
    subscriptionEndsOn: tenant.subscriptionEndsOn?.slice(0, 10) ?? '',
    planName: tenant.planName ?? '',
    maxAdmins: String(tenant.maxAdmins),
    maxUsers: String(tenant.maxUsers),
    billingEmail: tenant.billingEmail ?? '',
    contactName: tenant.contactName ?? '',
    contactPhone: tenant.contactPhone ?? '',
    notes: tenant.notes ?? '',
  };
}

function toRequest(form: TenantFormState, rowVersion?: string): TenantManagementRequest {
  const optional = (value: string) => value.trim() || null;
  return {
    identifier: form.identifier.trim(),
    name: form.name.trim(),
    isActive: form.isActive,
    subscriptionStatus: form.subscriptionStatus,
    subscriptionStartedOn: new Date(`${form.subscriptionStartedOn}T00:00:00Z`).toISOString(),
    subscriptionEndsOn: new Date(`${form.subscriptionEndsOn}T23:59:59Z`).toISOString(),
    planName: optional(form.planName),
    maxAdmins: Number.parseInt(form.maxAdmins, 10),
    maxUsers: Number.parseInt(form.maxUsers, 10),
    billingEmail: optional(form.billingEmail),
    contactName: optional(form.contactName),
    contactPhone: optional(form.contactPhone),
    notes: optional(form.notes),
    rowVersion: rowVersion ?? null,
  };
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function getStatusColor(
  status: SubscriptionStatus,
  colors: {
    textMuted: string;
    success: string;
    secondary: string;
    warning: string;
    danger: string;
  },
): string {
  if (status === 'active') return colors.success;
  if (status === 'trial') return colors.secondary;
  if (status === 'pastDue') return colors.warning;
  if (status === 'suspended' || status === 'expired' || status === 'cancelled') {
    return colors.danger;
  }
  return colors.textMuted;
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
  tenantIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantName: {
    flex: 1,
    minWidth: 0,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 120,
    gap: 2,
  },
  details: {
    gap: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
});
