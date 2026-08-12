import { useState } from 'react';
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
  AppAlert,
  AppButton,
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppIcon,
  AppIconButton,
  type AppIconName,
  AppMultiView,
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
  const tenants = tenantsQuery.data ?? [];

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
      await saveMutation.mutateAsync({ id: editing?.id ?? null, request: toRequest(values) });
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
      render: (tenant) => <AppText variant="bodySmall">{tenant.totalUserCount}</AppText>,
    },
    {
      id: 'endsOn',
      header: t('tenantManagement.endsOn'),
      width: 150,
      align: 'center',
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

      <AppAlert icon="sync-outline" severity="info" style={styles.syncHint}>
        {t('tenantManagement.refreshHint')}
      </AppAlert>

      {tenantsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : tenantsQuery.isError ? (
        <AppStateView
          message={getErrorMessage(tenantsQuery.error, t('states.errorMessage'))}
          onRetry={() => void tenantsQuery.refetch()}
          state="error"
        />
      ) : (
        <AppMultiView<TenantManagementResponse, TenantView>
          defaultView="cards"
          emptyContent={(
            <AppStateView message={t('tenantManagement.emptyMessage')} state="empty" />
          )}
          items={tenants}
          views={[
            {
              value: 'table',
              defaultPageSize: 5,
              label: t('multiView.table'),
              icon: 'grid-outline',
              pageSizeOptions: [5, 10, 25],
              render: (pageTenants) => (
                <AppDataTable
                  columns={columns}
                  emptyMessage={t('tenantManagement.emptyMessage')}
                  getRowKey={(tenant) => tenant.id}
                  rows={pageTenants}
                  showPagination={false}
                />
              ),
            },
            {
              value: 'cards',
              carousel: true,
              getItemKey: (tenant) => tenant.id,
              label: t('multiView.cards'),
              icon: 'albums-outline',
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

function toRequest(form: TenantFormState): TenantManagementRequest {
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
  syncHint: {
    marginBottom: 16,
  },
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
