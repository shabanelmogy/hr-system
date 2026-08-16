import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { LocalizationEditModal } from '@/src/features/platform-tools/components/LocalizationEditModal';
import {
  useLocalizationEntries,
  useUpdateLocalization,
} from '@/src/features/platform-tools/hooks/usePlatformTools';
import type {
  LocalizationCulture,
  LocalizationEntry,
} from '@/src/features/platform-tools/types/platform-tools';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppAlert,
  AppDataTable,
  type AppDataTableColumn,
  AppIconButton,
  AppPageHeader,
  AppScreen,
  AppSegmentedControl,
  AppStateView,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';

export function LocalizationManagementScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: [permissions.EditLocalizations],
  });
  const [culture, setCulture] = useState<LocalizationCulture>(
    i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US',
  );
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<LocalizationEntry | null>(null);
  const entriesQuery = useLocalizationEntries(culture);
  const updateMutation = useUpdateLocalization();
  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const filteredEntries = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(i18n.language);
    if (!term) return entries;
    return entries.filter((entry) => [entry.key, entry.value]
      .some((value) => value.toLocaleLowerCase(i18n.language).includes(term)));
  }, [entries, i18n.language, search]);

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
        <AppTextField
          compact
          label={t('platformTools.localization.search')}
          leadingIcon="search-outline"
          onChangeText={setSearch}
          value={search}
        />
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
          emptyMessage={t('platformTools.localization.empty')}
          getRowKey={(entry) => entry.id}
          resetKey={`${culture}:${search}`}
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

const styles = StyleSheet.create({ filters: { gap: 12, marginBottom: 14 } });
