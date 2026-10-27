import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, useAppTheme } from '@/src/core/theme';
import { useAuth, useAuthorization, permissions } from '@/src/platform/auth';
import { useServerListState } from '@/src/shared/listing';
import { AppDataCard, AppDataTable, type AppDataTableColumn, AppFilterFormButton, AppIconButton, AppListScreen,
  AppModal, AppScreen, AppSelectField, AppStateView, AppStatusBadge, AppText } from '@/src/shared/components';
import { AppHtmlPreview } from '@/src/shared/components/preview';
import type { EmailTemplate, EmailTemplateCriteria } from '../../domain/email-template';
import { useEmailTemplates } from '../queries/use-email-templates';

type Filters = Pick<EmailTemplateCriteria, 'language' | 'status'>;
type ViewId = 'table' | 'cards';
export function EmailTemplatesScreen() {
  const { session } = useAuth();
  return <EmailTemplatesWorkspace key={`${session?.tenantId}:${session?.companyId}:${session?.userId}`} />;
}
function EmailTemplatesWorkspace() {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme();
  const { allowed: canView } = useAuthorization({ requiredPermissions: [permissions.ViewCompanyEmailTemplates] });
  const list = useServerListState<'id', Filters>({ initialPageSize: 10, initialFilters: { language: 'en', status: 'all' } });
  const [draft, setDraft] = useState<Filters>(list.state.filters);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const api = useEmailTemplates({ ...list.state.filters, search: list.state.search, page: list.state.page + 1, pageSize: list.state.pageSize }, canView, selected?.id ?? null);
  const columns = useMemo<AppDataTableColumn<EmailTemplate>[]>(() => [
    { id: 'name', header: t('emailTemplates.template'), width: 220, render: item => <AppText variant="bodySmall" weight="700">{i18n.resolvedLanguage?.startsWith('ar') ? item.nameAr : item.nameEn}</AppText> },
    { id: 'subject', header: t('emailTemplates.subject'), width: 240, render: item => <AppText variant="bodySmall">{item.subject}</AppText> },
    { id: 'status', header: t('emailTemplates.status'), width: 160, render: item => <AppStatusBadge color={item.isCustomized ? theme.colors.success : theme.colors.textMuted} label={t(item.isCustomized ? 'emailTemplates.customized' : 'emailTemplates.default')} variant="soft" /> },
    { id: 'preview', header: '', width: 60, render: item => <AppIconButton icon="eye-outline" label={t('emailTemplates.preview')} onPress={() => { if (canView) setSelected(item); }} /> },
  ], [t, i18n.resolvedLanguage, theme.colors.success, theme.colors.textMuted, canView]);
  if (!canView) return <AppScreen><AppStateView state="error" message={t('emailTemplates.forbidden')} /></AppScreen>;
  if (api.list.isPending) return <AppScreen><AppStateView state="loading" /></AppScreen>;
  if (api.list.isError) return <AppScreen><AppStateView state="error" message={t('emailTemplates.loadFailed')} onRetry={() => void api.list.refetch()} /></AppScreen>;
  return <AppScreen edges={['left', 'right', 'bottom']}>
    <AppListScreen<EmailTemplate, ViewId> items={api.list.data?.items ?? []} defaultView="table" showViewLabels
      isFetching={api.list.isFetching} searchValue={list.searchInput} onSearchChange={list.setSearchInput} searchPlaceholder={t('emailTemplates.search')}
      filterControl={<AppFilterFormButton buttonLabel={t('emailTemplates.filters')} modalTitle={t('emailTemplates.filters')}
        activeCount={Number(list.state.filters.language !== 'en') + Number(list.state.filters.status !== 'all')}
        onOpen={() => setDraft(list.state.filters)} onApply={() => { list.setFilters(draft); setSelected(null); }}
        onClear={() => setDraft({ language: 'en', status: 'all' })}>
        <AppSelectField allowWhenReadOnly label={t('emailTemplates.language')} value={draft.language} onChange={value => setDraft({ ...draft, language: value })}
          options={[{ value: 'en', label: t('emailTemplates.english'), icon: 'language-outline' }, { value: 'ar', label: t('emailTemplates.arabic'), icon: 'language-outline' }]} />
        <AppSelectField allowWhenReadOnly label={t('emailTemplates.status')} value={draft.status} onChange={value => setDraft({ ...draft, status: value })}
          options={(['all', 'default', 'customized'] as const).map(value => ({ value, label: t(`emailTemplates.${value}`), icon: 'mail-outline' as const }))} />
      </AppFilterFormButton>}
      aboveViews={<AppText color="muted" variant="bodySmall">{t('emailTemplates.readOnlyHint')}</AppText>}
      emptyContent={<AppStateView state="empty" message={t('emailTemplates.empty')} />}
      serverPagination={{ page: list.state.page, pageSize: list.state.pageSize, totalItems: api.list.data?.totalCount ?? 0,
        pageSizeOptions: [10, 25, 50], onPageChange: list.setPage, onPageSizeChange: list.setPageSize }} views={[
        { value: 'table', icon: 'grid-outline', label: t('multiView.table'), paginate: false,
          render: items => <AppDataTable columns={columns} getRowKey={item => item.id} rows={items} showPagination={false} /> },
        { value: 'cards', icon: 'albums-outline', label: t('multiView.cards'), getItemKey: item => item.id,
          render: items => <View style={styles.cards}>{items.map((item, index) => <AppDataCard key={item.id} active={index === 0} padding="md">
            <View style={styles.card}>
              <AppText variant="titleSmall">{i18n.resolvedLanguage?.startsWith('ar') ? item.nameAr : item.nameEn}</AppText>
              <AppText>{item.subject}</AppText>
              <AppStatusBadge color={item.isCustomized ? theme.colors.success : theme.colors.textMuted} label={t(item.isCustomized ? 'emailTemplates.customized' : 'emailTemplates.default')} variant="soft" />
              <AppIconButton icon="eye-outline" label={t('emailTemplates.preview')} onPress={() => { if (canView) setSelected(item); }} />
            </View>
          </AppDataCard>)}</View> },
      ]} />
    <AppModal visible={selected !== null} title={t('emailTemplates.preview')} subtitle={selected ? (i18n.resolvedLanguage?.startsWith('ar') ? selected.nameAr : selected.nameEn) : undefined}
      icon="mail-outline" closeLabel={t('common.close')} onClose={() => setSelected(null)} variant="fullScreen">
      {api.preview.isPending ? <AppStateView state="loading" /> : api.preview.isError ? <AppStateView state="error" message={t('emailTemplates.previewFailed')} onRetry={() => void api.preview.refetch()} />
        : api.preview.data && <View style={styles.preview}>
          <AppText variant="titleSmall">{api.preview.data.subject}</AppText>
          <AppText color="muted" variant="caption">{t('emailTemplates.previewHint')}</AppText>
          <AppText variant="bodySmall" weight="700">{t('emailTemplates.variables')}</AppText>
          {selected?.variables.map(variable => <AppText key={variable.token} variant="caption" selectable>
            {variable.token} · {i18n.resolvedLanguage?.startsWith('ar') ? variable.nameAr : variable.nameEn} · {variable.sample}
          </AppText>)}
          <AppHtmlPreview key={api.preview.data.html} html={api.preview.data.html} title={t('emailTemplates.preview')} />
        </View>}
    </AppModal>
  </AppScreen>;
}
const styles = StyleSheet.create({ cards: { gap: spacing.md }, card: { gap: spacing.sm }, preview: { flex: 1, gap: spacing.md } });
