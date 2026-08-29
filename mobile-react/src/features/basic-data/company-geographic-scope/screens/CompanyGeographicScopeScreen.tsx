import { useCallback, useEffect, useMemo, useState } from 'react';
import { useController } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { useLocalization } from '@/src/core/localization';
import { spacing } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import {
  AppButton,
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppForm,
  AppMultiView,
  AppScreen,
  AppMultiSelectField,
  AppSelectField,
  AppStateView,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import {
  useCompanyGeographicScope,
  useUpdateCompanyGeographicScope,
} from '../queries/use-company-geographic-scope';
import type {
  CompanyCountryOption,
  CompanyGeographicScopeFormValues,
} from '../types/company-geographic-scope';
import { createCompanyGeographicScopeFormSchema } from '../validation/company-geographic-scope-schema';
import {
  clearUnselectedOperatingCountry,
  filterCompanyCountries,
  normalizeCompanyCountryIds,
} from '../components/company-geographic-scope-grid';
import { CompanyGeographicScopeCard } from '../components/CompanyGeographicScopeCard';

const emptyValues: CompanyGeographicScopeFormValues = {
  countryIds: [],
  registrationCountryId: 0,
  defaultCountryId: 0,
};

export function CompanyGeographicScopeScreen() {
  const { i18n, t } = useTranslation();
  const { direction } = useLocalization();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canView } = useAuthorization({
    requiredPermissions: [permissions.ViewCompanyGeographicScope],
  });
  const { allowed: canManage } = useAuthorization({
    requiredPermissions: [permissions.ManageCompanyGeographicScope],
  });
  const schema = useMemo(() => createCompanyGeographicScopeFormSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useZodForm<CompanyGeographicScopeFormValues>(schema, { defaultValues: emptyValues });
  const { field: countryIdsField } = useController({ control, name: 'countryIds' });
  const { field: registrationCountryIdField } = useController({ control, name: 'registrationCountryId' });
  const { field: defaultCountryIdField } = useController({ control, name: 'defaultCountryId' });
  const query = useCompanyGeographicScope(canView);
  const mutation = useUpdateCompanyGeographicScope();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCountryIds = useMemo(
    () => countryIdsField.value ?? [],
    [countryIdsField.value],
  );
  const defaultCountryId = defaultCountryIdField.value ?? 0;
  const registrationCountryId = registrationCountryIdField.value ?? 0;
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);
  const language = i18n.resolvedLanguage?.startsWith('ar') ? 'ar' : 'en';
  const selectedCountries = useMemo(
    () => (query.data?.countries ?? []).filter((country) => selectedCountryIds.includes(country.id)),
    [query.data?.countries, selectedCountryIds],
  );
  const filteredCountries = useMemo(
    () => filterCompanyCountries(selectedCountries, searchTerm),
    [searchTerm, selectedCountries],
  );
  const busy = mutation.isPending || isSubmitting;
  const interactionDisabled = !canManage || isReadOnly || busy;

  useEffect(() => {
    if (!query.data) return;
    reset({
      countryIds: query.data.countries
        .filter((country) => country.isSelected)
        .map((country) => country.id),
      registrationCountryId: query.data.registrationCountryId ?? 0,
      defaultCountryId: query.data.defaultCountryId ?? 0,
    });
  }, [query.data, reset]);

  const changeSelectedCountries = useCallback((values: number[]) => {
    const countryIds = normalizeCompanyCountryIds(values);
    setValue('countryIds', countryIds, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    const nextRegistrationCountryId = clearUnselectedOperatingCountry(countryIds, registrationCountryId);
    if (nextRegistrationCountryId !== registrationCountryId) {
      setValue('registrationCountryId', nextRegistrationCountryId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    const nextDefaultCountryId = clearUnselectedOperatingCountry(countryIds, defaultCountryId);
    if (nextDefaultCountryId !== defaultCountryId) {
      setValue('defaultCountryId', nextDefaultCountryId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [defaultCountryId, registrationCountryId, setValue]);

  const changeRegistrationCountry = useCallback((countryId: number) => {
    setValue('registrationCountryId', countryId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [setValue]);

  const changeDefaultCountry = useCallback((countryId: number) => {
    setValue('defaultCountryId', countryId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [setValue]);

  const countryOptions = useMemo(
    () => (query.data?.countries ?? []).map((country) => ({
      value: country.id,
      label: language === 'ar' ? country.nameAr : country.nameEn,
      description: [country.alpha2Code, country.alpha3Code].filter(Boolean).join(' · ') || undefined,
      icon: 'flag-outline' as const,
    })),
    [language, query.data?.countries],
  );
  const defaultCountryOptions = useMemo(
    () => countryOptions.filter((country) => selectedCountryIds.includes(country.value)),
    [countryOptions, selectedCountryIds],
  );

  const columns = useMemo<AppDataTableColumn<CompanyCountryOption>[]>(() => [
    {
      id: 'registration',
      header: t('companyGeographicScope.registrationColumn'),
      width: 132,
      align: 'center',
      render: (country) => <AppText align="center" color={country.id === registrationCountryId ? 'primary' : 'muted'} variant="bodySmall">{country.id === registrationCountryId ? t('companyGeographicScope.registrationCountry') : '—'}</AppText>,
    },
    {
      id: 'nameEn',
      header: t('countries.nameEn'),
      width: 170,
      sortValue: (country) => country.nameEn,
      render: (country) => (
        <AppText variant="bodySmall" weight="700">{country.nameEn}</AppText>
      ),
    },
    {
      id: 'nameAr',
      header: t('countries.nameAr'),
      width: 160,
      sortValue: (country) => country.nameAr,
      render: (country) => <AppText variant="bodySmall">{country.nameAr}</AppText>,
    },
    {
      id: 'codes',
      header: t('companyGeographicScope.codes'),
      width: 110,
      align: 'center',
      sortValue: (country) => country.alpha2Code ?? country.alpha3Code,
      render: (country) => (
        <AppText align="center" variant="bodySmall">
          {[country.alpha2Code, country.alpha3Code].filter(Boolean).join(' · ') || '—'}
        </AppText>
      ),
    },
    {
      id: 'default',
      header: t('companyGeographicScope.defaultColumn'),
      width: 104,
      align: 'center',
      render: (country) => <AppText align="center" color={country.id === defaultCountryId ? 'primary' : 'muted'} variant="bodySmall">{country.id === defaultCountryId ? t('companyGeographicScope.defaultColumn') : '—'}</AppText>,
    },
  ], [
    defaultCountryId,
    registrationCountryId,
    t,
  ]);

  const submit = handleSubmit(async (values) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!canManage) {
      showToast.warning(t('companyGeographicScope.permissionDenied'));
      return;
    }

    try {
      const saved = await mutation.mutateAsync(values);
      reset({
        countryIds: saved.countries
          .filter((country) => country.isSelected)
          .map((country) => country.id),
        registrationCountryId: saved.registrationCountryId ?? 0,
        defaultCountryId: saved.defaultCountryId ?? 0,
      });
      showToast.success(t('companyGeographicScope.saved'));
    } catch (error) {
      showToast.error(error, t('companyGeographicScope.saveFailed'));
    }
  });

  if (!canView) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppStateView
          message={t('companyGeographicScope.permissionDenied')}
          state="error"
          title={t('feedback.errorTitle')}
        />
      </AppScreen>
    );
  }

  if (query.isLoading) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppStateView message={t('companyGeographicScope.loading')} state="loading" />
      </AppScreen>
    );
  }

  if (query.isError) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppStateView
          message={t('companyGeographicScope.loadFailed')}
          onRetry={() => query.refetch()}
          state="error"
        />
      </AppScreen>
    );
  }

  if ((query.data?.countries.length ?? 0) === 0) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppStateView
          message={t('companyGeographicScope.noCountries')}
          onRetry={() => query.refetch()}
          state="empty"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <AppCard padding="sm">
        <AppForm
          autoFocusFirstInput={false}
          errors={fieldErrors}
          footer={(
            <View style={[styles.actions, { direction }]}>
              <AppButton
                disabled={busy || query.isFetching}
                icon="refresh-outline"
                onPress={() => query.refetch()}
                style={styles.action}
                variant="outline">
                {t('common.refresh')}
              </AppButton>
              {canManage ? (
                <AppButton
                  disabled={!isDirty || isReadOnly}
                  icon="save-outline"
                  loading={busy}
                  onPress={submit}
                  style={styles.action}>
                  {t('companyGeographicScope.save')}
                </AppButton>
              ) : null}
            </View>
          )}
          isDirty={isDirty}
          onSubmit={submit}
          presentation="inline"
          submitting={busy}>
          <View style={styles.fields}>
            <AppText variant="titleSmall" weight="700">
              {t('companyGeographicScope.selectionSectionTitle')}
            </AppText>
            <AppMultiSelectField
              disabled={interactionDisabled}
              error={fieldErrors.countryIds}
              label={t('companyGeographicScope.operatingCountries')}
              leadingIcon="flag-outline"
              name="countryIds"
              onChange={changeSelectedCountries}
              options={countryOptions}
              placeholder={t('companyGeographicScope.selectCountries')}
              required
              values={selectedCountryIds}
            />
            <AppSelectField
              disabled={interactionDisabled || defaultCountryOptions.length === 0}
              error={fieldErrors.registrationCountryId}
              helperText={t('companyGeographicScope.registrationCountryHelp')}
              label={t('companyGeographicScope.registrationCountry')}
              leadingIcon="business-outline"
              name="registrationCountryId"
              onChange={changeRegistrationCountry}
              options={defaultCountryOptions}
              placeholder={t('companyGeographicScope.selectRegistrationCountry')}
              required
              value={registrationCountryId}
            />
            <AppSelectField
              disabled={interactionDisabled || defaultCountryOptions.length === 0}
              error={fieldErrors.defaultCountryId}
              label={t('companyGeographicScope.defaultOperatingCountry')}
              leadingIcon="radio-button-on"
              name="defaultCountryId"
              onChange={changeDefaultCountry}
              options={defaultCountryOptions}
              placeholder={t('companyGeographicScope.selectDefaultCountry')}
              required
              value={defaultCountryId}
            />
            <AppTextField
              allowWhenReadOnly
              compact
              label={t('companyGeographicScope.search')}
              leadingIcon="search-outline"
              onChangeText={setSearchTerm}
              onClear={() => setSearchTerm('')}
              value={searchTerm}
            />

            <AppMultiView<CompanyCountryOption, 'table' | 'cards'>
              defaultView="table"
              emptyContent={<AppStateView message={t(
                selectedCountryIds.length === 0
                  ? 'companyGeographicScope.selectOperatingCountriesFirst'
                  : 'companyGeographicScope.noSearchResults',
              )} state="empty" />}
              fillViewSelector
              items={filteredCountries}
              pageSizeOptions={[3, 5, 10]}
              resetKey={searchTerm}
              showResultCount={false}
              showViewLabels
              views={[
                {
                  value: 'table',
                  icon: 'grid-outline',
                  label: t('multiView.table'),
                  defaultPageSize: 5,
                  render: (items) => (
                    <AppDataTable
                      columns={columns}
                      emptyMessage={t('companyGeographicScope.noSearchResults')}
                      getRowKey={(country) => country.id}
                      rows={items}
                      showPagination={false}
                    />
                  ),
                },
                {
                  value: 'cards',
                  icon: 'albums-outline',
                  label: t('multiView.cards'),
                  defaultPageSize: 3,
                  scrollable: true,
                  render: (items) => (
                    <View style={styles.cards}>
                      {items.map((country) => (
                        <CompanyGeographicScopeCard
                          country={country}
                          isDefault={country.id === defaultCountryId}
                          isRegistrationCountry={country.id === registrationCountryId}
                          key={country.id}
                        />
                      ))}
                    </View>
                  ),
                },
              ]}
            />

          </View>
        </AppForm>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
    minWidth: 0,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  action: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  cards: { gap: spacing.sm },
});
