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
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppStateView,
  AppText,
} from '@/src/shared/components';

export function TenantManagementScreen() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const tenantsQuery = useTenants();
  const saveMutation = useSaveTenant();
  const [editing, setEditing] = useState<TenantManagementResponse | null>(null);
  const [form, setForm] = useState<TenantFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    saveMutation.reset();
    setEditing(null);
    setForm(createEmptyForm());
    setFormError(null);
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    saveMutation.reset();
    setEditing(tenant);
    setForm(toForm(tenant));
    setFormError(null);
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setEditing(null);
    setForm(null);
    setFormError(null);
    saveMutation.reset();
  };

  const save = async () => {
    if (!form) return;

    const validationError = validateForm(form, {
      required: t('tenantManagement.requiredFields'),
      limits: t('tenantManagement.invalidLimits'),
      dates: t('tenantManagement.invalidDates'),
    });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    try {
      await saveMutation.mutateAsync({ id: editing?.id ?? null, request: toRequest(form) });
      setEditing(null);
      setForm(null);
    } catch (error) {
      setFormError(getErrorMessage(error, t('tenantManagement.saveFailed')));
    }
  };

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
      <View style={[styles.heading, { direction }]}>
        <View style={styles.headingText}>
          <AppText variant="title">{t('tenantManagement.title')}</AppText>
          <AppText color="muted" variant="bodySmall">
            {t('tenantManagement.subtitle')}
          </AppText>
        </View>
        <AppButton icon="add-outline" onPress={openCreate}>
          {t('tenantManagement.addTenant')}
        </AppButton>
      </View>

      <View
        style={[
          styles.syncHint,
          {
            direction,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.md,
          },
        ]}>
        <AppIcon color={theme.colors.primary} name="sync-outline" size={19} />
        <AppText color="muted" style={styles.syncText} variant="bodySmall">
          {t('tenantManagement.refreshHint')}
        </AppText>
      </View>

      {tenantsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : tenantsQuery.isError ? (
        <AppStateView
          message={getErrorMessage(tenantsQuery.error, t('states.errorMessage'))}
          onRetry={() => void tenantsQuery.refetch()}
          state="error"
        />
      ) : !tenantsQuery.data?.length ? (
        <AppStateView message={t('tenantManagement.emptyMessage')} state="empty" />
      ) : (
        <View style={styles.list}>
          {tenantsQuery.data.map((tenant) => (
            <TenantCard key={tenant.id} onEdit={() => openEdit(tenant)} tenant={tenant} />
          ))}
        </View>
      )}

      <TenantFormModal
        error={formError}
        form={form}
        isEdit={Boolean(editing)}
        loading={saveMutation.isPending}
        onChange={setForm}
        onClose={closeForm}
        onSave={() => void save()}
      />
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
        <View
          style={[
            styles.badge,
            { backgroundColor: `${statusColor}1A`, borderColor: statusColor },
          ]}>
          <AppText style={{ color: statusColor }} variant="caption" weight="700">
            {t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
          </AppText>
        </View>
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
        <View
          style={[
            styles.availability,
            {
              backgroundColor: tenant.isActive
                ? `${theme.colors.success}1A`
                : theme.colors.surfaceMuted,
            },
          ]}>
          <AppIcon
            color={tenant.isActive ? theme.colors.success : theme.colors.textMuted}
            name={tenant.isActive ? 'checkmark-circle-outline' : 'pause-circle-outline'}
            size={17}
          />
          <AppText
            color={tenant.isActive ? 'success' : 'muted'}
            variant="caption"
            weight="600">
            {t(tenant.isActive ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
          </AppText>
        </View>
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
    maxUsers: '5',
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
    subscriptionEndsOn: form.subscriptionEndsOn
      ? new Date(`${form.subscriptionEndsOn}T23:59:59Z`).toISOString()
      : null,
    planName: optional(form.planName),
    maxAdmins: Number.parseInt(form.maxAdmins, 10),
    maxUsers: Number.parseInt(form.maxUsers, 10),
    billingEmail: optional(form.billingEmail),
    contactName: optional(form.contactName),
    contactPhone: optional(form.contactPhone),
    notes: optional(form.notes),
  };
}

function validateForm(
  form: TenantFormState,
  messages: { required: string; limits: string; dates: string },
): string | null {
  if (!form.identifier.trim() || !form.name.trim() || !isDate(form.subscriptionStartedOn)) {
    return messages.required;
  }

  const maxAdmins = Number(form.maxAdmins);
  const maxUsers = Number(form.maxUsers);
  if (!Number.isInteger(maxAdmins) || maxAdmins < 1 || !Number.isInteger(maxUsers) || maxUsers < 0) {
    return messages.limits;
  }

  if (
    form.subscriptionEndsOn &&
    (!isDate(form.subscriptionEndsOn) || form.subscriptionEndsOn < form.subscriptionStartedOn)
  ) {
    return messages.dates;
  }

  return null;
}

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
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
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  headingText: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  syncHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 16,
  },
  syncText: {
    flex: 1,
  },
  list: {
    gap: 14,
  },
  card: {
    gap: 16,
  },
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
  badge: {
    minHeight: 30,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
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
  availability: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
});
