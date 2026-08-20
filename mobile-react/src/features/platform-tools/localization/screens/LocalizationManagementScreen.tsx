import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { LocalizationEditModal } from '@/src/features/platform-tools/localization/components/LocalizationEditModal';
import {
  useLocalizationEntries,
  useUpdateLocalization,
} from '@/src/features/platform-tools/localization/hooks';
import type {
  LocalizationCulture,
  LocalizationEntry,
} from '@/src/features/platform-tools/localization/types';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppAlert,
  AppDataTable,
  type AppDataTableColumn,
  AppFilterButton,
  AppIconButton,
  AppPageHeader,
  AppScreen,
  AppSegmentedControl,
  AppStateView,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';

type LocalizationValueFilter = 'plain' | 'placeholders' | 'empty';

const placeholderPattern = /\{[^{}]+\}/;

export function LocalizationManagementScreen() {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: [permissions.EditLocalizations],
  });
  const [culture, setCulture] = useState<LocalizationCulture>(
    i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US',
  );
  const [search, setSearch] = useState('');
  const [selectedValueFilters, setSelectedValueFilters] = useState<LocalizationValueFilter[]>([]);
  const [editing, setEditing] = useState<LocalizationEntry | null>(null);
  const entriesQuery = useLocalizationEntries(culture);
  const updateMutation = useUpdateLocalization();
  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const valueFilterOptions = useMemo(() => [
    {
      icon: 'text-outline' as const,
      label: t('platformTools.localization.plainValues'),
      value: 'plain' as const,
    },
    {
      icon: 'code-slash-outline' as const,
      label: t('platformTools.localization.placeholderValues'),
      value: 'placeholders' as const,
    },
    {
      icon: 'remove-circle-outline' as const,
      label: t('platformTools.localization.emptyValues'),
      value: 'empty' as const,
    },
  ], [t]);
  const filteredEntries = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(i18n.language);
    return entries.filter((entry) => {
      const trimmedValue = entry.value.trim();
      const hasPlaceholder = placeholderPattern.test(trimmedValue);
      const matchesFilter = selectedValueFilters.length === 0
        || (selectedValueFilters.includes('empty') && !trimmedValue)
        || (selectedValueFilters.includes('placeholders') && Boolean(trimmedValue) && hasPlaceholder)
        || (selectedValueFilters.includes('plain') && Boolean(trimmedValue) && !hasPlaceholder);
      if (!matchesFilter) return false;
      if (!term) return true;

      return [entry.key, entry.value]
        .some((value) => value.toLocaleLowerCase(i18n.language).includes(term));
    });
  }, [entries, i18n.language, search, selectedValueFilters]);

  const save = async (value: string) => {
    if (!editing) return;
    await updateMutation.mutateAsync({ culture, key: editing.key, value: value.trim() });
    setEditing(null);
    showToast.success(t('platformTools.localization.saved'));
  };

  const columns = useMemo<AppDataTableColumn<LocalizationEntry>[]>(() => [
    {
      id: 'key',
      header: t('platformTools.localization.key'),
      width: 270,
      render: (entry) => <AppText variant="bodySmall">{entry.key}</AppText>,
      sortValue: (entry) => entry.key,
    },
    {
      id: 'value',
      header: t('platformTools.localization.value'),
      width: 390,
      render: (entry) => <AppText numberOfLines={4} variant="bodySmall">{entry.value}</AppText>,
      sortValue: (entry) => entry.value,
    },
    ...(canEdit ? [{
      id: 'actions',
      header: t('platformTools.localization.actions'),
      width: 90,
      align: 'center' as const,
      render: (entry: LocalizationEntry) => (
        <AppIconButton
          icon="create-outline"
          label={t('platformTools.localization.edit')}
          onPress={() => setEditing(entry)}
        />
      ),
    }] : []),
  ], [canEdit, t]);

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void entriesQuery.refetch()}
          refreshing={entriesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        subtitle={t('platformTools.localizationApiDescription')}
        title={t('navigation.localizationApi')}
      />
      <View style={styles.filters}>
        <AppSegmentedControl
          label={t('platformTools.localization.culture')}
          onChange={setCulture}
          options={[
            { label: t('platformTools.localization.english'), value: 'en-US' },
            { label: t('platformTools.localization.arabic'), value: 'ar-EG' },
          ]}
          showLabel
          value={culture}
        />
        <View style={[styles.searchRow, { direction }]}>
          <View style={styles.searchField}>
            <AppTextField
              compact
              label={t('platformTools.localization.search')}
              leadingIcon="search-outline"
              onChangeText={setSearch}
              onClear={() => setSearch('')}
              showClearButton
              value={search}
            />
          </View>
          <AppFilterButton
            buttonLabel={selectedValueFilters.length > 0
              ? t('listScreen.filterActive', { count: selectedValueFilters.length })
              : t('listScreen.filter')}
            description={t('platformTools.localization.filterDescription')}
            modalTitle={t('platformTools.localization.filterValues')}
            onChange={setSelectedValueFilters}
            options={valueFilterOptions}
            values={selectedValueFilters}
          />
        </View>
      </View>
      {!canEdit ? (
        <AppAlert severity="info">{t('platformTools.localization.readOnly')}</AppAlert>
      ) : null}
      {entriesQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : entriesQuery.error ? (
        <AppStateView
          message={getPlatformToolErrorMessage(entriesQuery.error, t('states.errorMessage'))}
          onRetry={() => void entriesQuery.refetch()}
          state="error"
        />
      ) : (
        <AppDataTable
          columns={columns}
          defaultPageSize={5}
          emptyMessage={t('platformTools.localization.empty')}
          getRowKey={(entry) => entry.id}
          pageSizeOptions={[5, 10, 25]}
          resetKey={`${culture}:${search}:${selectedValueFilters.join(',')}`}
          rows={filteredEntries}
        />
      )}
      {editing ? (
        <LocalizationEditModal
          entry={editing}
          loading={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 12, marginBottom: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchField: { flex: 1, minWidth: 0 },
});
