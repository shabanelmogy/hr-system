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
  TenantFormErrors,
  TenantFormState,
  TenantManagementRequest,
  TenantManagementResponse,
} from '@/src/features/tenants/types/tenant';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  type AppIconName,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
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

export function TenantManagementScreen() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const tenantsQuery = useTenants();
  const saveMutation = useSaveTenant();
  const [editing, setEditing] = useState<TenantManagementResponse | null>(null);
  const [form, setForm] = useState<TenantFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TenantFormErrors>({});

  const openCreate = () => {
    saveMutation.reset();
    setEditing(null);
    setForm(createEmptyForm());
    setFormError(null);
    setFieldErrors({});
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    saveMutation.reset();
    setEditing(tenant);
    setForm(toForm(tenant));
    setFormError(null);
    setFieldErrors({});
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setEditing(null);
    setForm(null);
    setFormError(null);
    setFieldErrors({});
    saveMutation.reset();
  };

  const clearFieldError = (field: keyof TenantFormState) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const save = async () => {
    if (!form) return;

    const validationErrors = validateForm(form, {
      required: t('common.required'),
      adminLimit: t('tenantManagement.adminLimitError'),
      userLimit: t('tenantManagement.userLimitError'),
      startDate: t('tenantManagement.invalidStartDate'),
      endDate: t('tenantManagement.invalidEndDate'),
      billingEmail: t('tenantManagement.invalidBillingEmail'),
    });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
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
        errors={fieldErrors}
        form={form}
        isEdit={Boolean(editing)}
        loading={saveMutation.isPending}
        onChange={setForm}
        onClearFieldError={clearFieldError}
        onClose={closeForm}
        onSave={save}
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
    maxAdmins: '0',
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
  messages: {
    required: string;
    adminLimit: string;
    userLimit: string;
    startDate: string;
    endDate: string;
    billingEmail: string;
  },
): TenantFormErrors {
  const errors: TenantFormErrors = {};

  if (!form.identifier.trim()) errors.identifier = messages.required;
  if (!form.name.trim()) errors.name = messages.required;
  if (!form.subscriptionStartedOn) errors.subscriptionStartedOn = messages.required;
  else if (!isDate(form.subscriptionStartedOn)) {
    errors.subscriptionStartedOn = messages.startDate;
  }

  const maxAdmins = Number(form.maxAdmins);
  const maxUsers = Number(form.maxUsers);
  if (!form.maxAdmins.trim() || !Number.isInteger(maxAdmins) || maxAdmins < 0) {
    errors.maxAdmins = messages.adminLimit;
  }
  if (!form.maxUsers.trim() || !Number.isInteger(maxUsers) || maxUsers < 0) {
    errors.maxUsers = messages.userLimit;
  }

  if (
    form.subscriptionEndsOn &&
    (!isDate(form.subscriptionEndsOn) || form.subscriptionEndsOn < form.subscriptionStartedOn)
  ) {
    errors.subscriptionEndsOn = messages.endDate;
  }

  if (form.billingEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.billingEmail.trim())) {
    errors.billingEmail = messages.billingEmail;
  }

  return errors;
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
    marginBottom: 16,
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
