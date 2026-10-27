import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuth, useAuthorization } from '@/src/platform/auth';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppIconButton, AppListScreen, AppPageHeader, AppScreen, AppSelectField, AppStateView, AppStatusBadge, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import type { CompanyLocalizationLanguage, CompanyLocalizationSource, CompanyLocalizationStatus, CompanyLocalizationText, CompanyLocalizationTextQuery } from '../../domain/models/company-localization';
import { useCompanyLocalization } from '../queries/use-company-localization';
import { CompanyLocalizationDefaultForm } from '../components/CompanyLocalizationDefaultForm';
import { CompanyLocalizationTextForm } from '../components/CompanyLocalizationTextForm';

type ViewId = 'table' | 'cards';
interface TextSnapshot { item: CompanyLocalizationText; revision: number; source: string; baseLanguage: CompanyLocalizationLanguage; targetLanguage: CompanyLocalizationLanguage; status: CompanyLocalizationStatus; }

export function CompanyLocalizationsScreen({system=false}:{system?:boolean}) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canView } = useAuthorization({ requiredPermissions: [(system?permissions.ViewSystemUiTexts:permissions.ViewCompanyLocalizations)] });
  const { allowed: canEdit } = useAuthorization({ requiredPermissions: [(system?permissions.EditSystemUiTexts:permissions.EditCompanyLocalizations)] });
  const { allowed: canReset } = useAuthorization({ requiredPermissions: [(system?permissions.ResetSystemUiTexts:permissions.ResetCompanyLocalizations)] });
  const { allowed: canSetDefault } = useAuthorization({ requiredPermissions: [permissions.SetCompanyLocalizationDefault] });
  const { settings, texts, query, setQuery, settingsQuery, textsQuery, setDefault, setText, resetText } = useCompanyLocalization(system);
  const [defaultVisible, setDefaultVisible] = useState(false);
  const [textSnapshot, setTextSnapshot] = useState<TextSnapshot | null>(null);
  const [resetSnapshot, setResetSnapshot] = useState<TextSnapshot | null>(null);
  const rows = texts?.items ?? [];
  const textsRevision = texts?.revision ?? 0;
  const editable = canEdit && !isReadOnly;

  const patchQuery = useCallback((patch: Partial<CompanyLocalizationTextQuery>) => {
    setQuery((current: CompanyLocalizationTextQuery) => ({
      ...current,
      ...patch,
      page: 'page' in patch || 'pageSize' in patch ? patch.page ?? 1 : 1,
    }));
  }, [setQuery]);
  const reload = useCallback(async () => { await Promise.all([settingsQuery.refetch(), textsQuery.refetch()]); }, [settingsQuery, textsQuery]);
  const openText = useCallback((item: CompanyLocalizationText) => setTextSnapshot({ item, revision: textsRevision, source: query.source, baseLanguage: query.baseLanguage, targetLanguage: query.targetLanguage, status: query.status }), [query.baseLanguage, query.source, query.status, query.targetLanguage, textsRevision]);
  const requestReset = useCallback((item: CompanyLocalizationText) => setResetSnapshot({ item, revision: textsRevision, source: query.source, baseLanguage: query.baseLanguage, targetLanguage: query.targetLanguage, status: query.status }), [query.baseLanguage, query.source, query.status, query.targetLanguage, textsRevision]);
  const companyName = i18n.resolvedLanguage?.startsWith('ar')
    ? session?.companyNameAr || session?.companyNameEn
    : session?.companyNameEn || session?.companyNameAr;

  const columns = useMemo<AppDataTableColumn<CompanyLocalizationText>[]>(() => [
    { id: 'key', header: t('companyLocalizations.key'), width: 220, render: (item) => <AppText variant="bodySmall" weight="700">{item.key}</AppText> },
    { id: 'base', header: t('companyLocalizations.baseValue'), width: 220, render: (item) => <AppText numberOfLines={2} variant="bodySmall">{item.baseValue}</AppText> },
    { id: 'target', header: t(system?'systemUiTexts.targetValue':'companyLocalizations.targetValue'), width: 240, render: (item) => <AppText numberOfLines={2} variant="bodySmall">{item.targetValue}</AppText> },
    { id: 'status', header: t('companyLocalizations.status'), width: 130, render: (item) => <AppStatusBadge color={item.isCustomized ? theme.colors.success : theme.colors.textMuted} label={t(item.isCustomized ? 'companyLocalizations.customized' : 'companyLocalizations.missing')} variant="soft" /> },
    { id: 'actions', header: '', width: 104, align: 'end', render: (item) => <View style={styles.rowActions}>
      <AppIconButton disabled={!editable} icon="create-outline" label={t('companyLocalizations.edit')} onPress={() => { if (isReadOnly) notifyBlockedAction(); else openText(item); }} />
      <AppIconButton disabled={!canReset || !item.isCustomized || isReadOnly} icon="refresh-outline" label={t('companyLocalizations.reset')} onPress={() => { if (isReadOnly) notifyBlockedAction(); else requestReset(item); }} />
    </View> },
  ], [canReset, editable, isReadOnly, notifyBlockedAction, openText, requestReset, t, theme.colors.success, theme.colors.textMuted, system]);

  if (!canView) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView message={t('authorization.forbiddenMessage')} state="error" /></AppScreen>;
  if (settingsQuery.isLoading) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView state="loading" /></AppScreen>;
  if (settingsQuery.isError) return <AppScreen edges={['left', 'right', 'bottom']}><AppStateView message={t(system?'systemUiTexts.loadFailed':'companyLocalizations.loadFailed')} onRetry={() => void reload()} state="error" /></AppScreen>;

  return <AppScreen edges={['left', 'right', 'bottom']}>
    <AppPageHeader action={system?undefined:<AppIconButton disabled={!canSetDefault || isReadOnly} icon="language-outline" label={t('companyLocalizations.setDefault')} onPress={() => { if (isReadOnly) notifyBlockedAction(); else if (!canSetDefault) showToast.warning(t('authorization.forbiddenMessage')); else setDefaultVisible(true); }} />} subtitle={system?t('systemUiTexts.scope'):`${t('companyLocalizations.description')} · ${t('companyLocalizations.scope', { company: companyName ?? (settings&&'companyId' in settings?settings.companyId:'') })}`} title={t(system?'systemUiTexts.title':'companyLocalizations.title')} />
    {textsQuery.isError ? <AppStateView message={t(system?'systemUiTexts.loadFailed':'companyLocalizations.loadFailed')} onRetry={() => void textsQuery.refetch()} state="error" /> : (
      <AppListScreen<CompanyLocalizationText, ViewId>
        aboveViews={<View style={styles.filters}>
          <AppSelectField allowWhenReadOnly label={t('companyLocalizations.source')} onChange={(value) => patchQuery({ source: String(value) })} options={(settings?.sources ?? []).map((source: CompanyLocalizationSource) => ({ value: source.id, label: source.namespace, icon: source.client === 'mobile' ? 'phone-portrait-outline' as const : 'desktop-outline' as const }))} value={query.source} />
          <AppSelectField allowWhenReadOnly label={t('companyLocalizations.baseLanguage')} onChange={(value) => patchQuery({ baseLanguage: value as CompanyLocalizationLanguage })} options={languageOptions(t)} value={query.baseLanguage} />
          <AppSelectField allowWhenReadOnly label={t('companyLocalizations.targetLanguage')} onChange={(value) => patchQuery({ targetLanguage: value as CompanyLocalizationLanguage })} options={languageOptions(t)} value={query.targetLanguage} />
          <AppSelectField allowWhenReadOnly label={t('companyLocalizations.status')} onChange={(value) => patchQuery({ status: value as CompanyLocalizationStatus })} options={statusOptions(t)} value={query.status} />
        </View>}
        defaultView="table" emptyContent={<AppStateView state={textsQuery.isLoading ? "loading" : "empty"} />} isFetching={textsQuery.isFetching} items={rows} onSearchChange={(search) => patchQuery({ search })} pageSizeOptions={[10, 25, 50, 100]} searchPlaceholder={t('companyLocalizations.search')} searchValue={query.search} serverPagination={{ page: query.page - 1, pageSize: query.pageSize, totalItems: texts?.totalCount ?? 0, pageSizeOptions: [10, 25, 50, 100], onPageChange: (page) => patchQuery({ page: page + 1 }), onPageSizeChange: (pageSize) => patchQuery({ pageSize }) }} showViewLabels views={[
          { value: 'table', icon: 'grid-outline', label: t('multiView.table'), paginate: false, render: (items) => <AppDataTable columns={columns} getRowKey={(item) => item.key} rows={items} showPagination={false} /> },
          { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), getItemKey: (item) => item.key, render: (items) => <View style={styles.cards}>{items.map((item) => <LocalizationCard canEdit={editable} canReset={canReset && !isReadOnly} item={item} key={item.key} onEdit={() => openText(item)} onReset={() => requestReset(item)} />)}</View> },
        ]} />
    )}
    {!system && defaultVisible && settings && 'defaultLanguage' in settings ? <CompanyLocalizationDefaultForm canEdit={canSetDefault} onClose={() => setDefaultVisible(false)} onReload={reload} onSave={async (language, expectedRevision) => { await setDefault.mutateAsync({ language, expectedRevision }); await reload(); }} settings={settings} /> : null}
    <CompanyLocalizationTextForm mockDataEnabled={!system} baseLanguage={textSnapshot?.baseLanguage ?? query.baseLanguage} canEdit={canEdit} item={textSnapshot?.item ?? null} onClose={() => setTextSnapshot(null)} onReload={reload} onSave={async (value, expectedRevision) => { const selected = textSnapshot; if (!selected) return; await setText.mutateAsync({ source: selected.source, language: selected.targetLanguage, key: selected.item.key, value, expectedRevision }); await reload(); }} revision={textSnapshot?.revision ?? 0} source={textSnapshot?.source ?? query.source} status={textSnapshot?.status ?? query.status} targetLanguage={textSnapshot?.targetLanguage ?? query.targetLanguage} visible={textSnapshot !== null} />
    <ConfirmationDialog confirmLabel={t('companyLocalizations.reset')} description={t(system?'systemUiTexts.resetDescription':'companyLocalizations.resetDescription')} loading={resetText.isPending} onCancel={() => setResetSnapshot(null)} onConfirm={async () => { const selected = resetSnapshot; if (!selected || !canReset || isReadOnly) return; try { await resetText.mutateAsync({ source: selected.source, language: selected.targetLanguage, key: selected.item.key, expectedRevision: selected.revision }); showToast.success(t('companyLocalizations.saved')); setResetSnapshot(null); await reload(); } catch (error) { showToast.error(error, t('companyLocalizations.saveFailed')); } }} title={t(system?'systemUiTexts.resetTitle':'companyLocalizations.resetTitle')} tone="warning" visible={resetSnapshot !== null} />
  </AppScreen>;
}

function LocalizationCard({ canEdit, canReset, item, onEdit, onReset }: { canEdit: boolean; canReset: boolean; item: CompanyLocalizationText; onEdit: () => void; onReset: () => void; }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  return <AppDataCard padding="md"><View style={styles.card}><View style={styles.cardHeader}><AppText style={styles.key} variant="label" weight="700">{item.key}</AppText><AppStatusBadge color={item.isCustomized ? theme.colors.success : theme.colors.textMuted} label={t(item.isCustomized ? 'companyLocalizations.customized' : 'companyLocalizations.missing')} variant="soft" /></View><AppText color="muted" variant="caption">{t('companyLocalizations.baseValue')}</AppText><AppText numberOfLines={2} variant="bodySmall">{item.baseValue}</AppText><AppText color="muted" variant="caption">{t('companyLocalizations.targetValue')}</AppText><AppText numberOfLines={3} variant="bodySmall">{item.targetValue}</AppText><View style={styles.rowActions}><AppIconButton disabled={!canEdit} icon="create-outline" label={t('companyLocalizations.edit')} onPress={onEdit} /><AppIconButton disabled={!canReset || !item.isCustomized} icon="refresh-outline" label={t('companyLocalizations.reset')} onPress={onReset} /></View></View></AppDataCard>;
}
function languageOptions(t: (key: string) => string) { return [{ value: 'en', label: t('companyLocalizations.english'), icon: 'language-outline' as const }, { value: 'ar', label: t('companyLocalizations.arabic'), icon: 'language-outline' as const }]; }
function statusOptions(t: (key: string) => string) { return [{ value: 'all', label: t('companyLocalizations.all'), icon: 'apps-outline' as const }, { value: 'missing', label: t('companyLocalizations.missing'), icon: 'remove-circle-outline' as const }, { value: 'customized', label: t('companyLocalizations.customized'), icon: 'checkmark-circle-outline' as const }]; }
const styles = StyleSheet.create({ filters: { gap: 10 }, rowActions: { flexDirection: 'row', justifyContent: 'flex-end' }, cards: { gap: 10 }, card: { gap: 6 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, key: { flex: 1 } });
