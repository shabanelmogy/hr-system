import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppChartCard, AppChartSummary, AppHorizontalBarChart, AppStateView, AppText } from '@/src/shared/components';
import type { OrganizationalResource, OrganizationalStructureItem } from '../types/organizational-structure';

export function OrganizationalStructureChart({ items, totalCount, resource }: { items: readonly OrganizationalStructureItem[]; totalCount: number; resource: OrganizationalResource }) {
  const { i18n, t } = useTranslation(); const ar = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');
  if (!items.length) return <AppStateView message={t('organizationalStructure.empty')} state="empty" />;
  const data = items.map((item) => ({ key: String(item.id), label: ar ? item.nameAr : item.nameEn, value: resource === 'positions' ? item.targetHeadcount ?? 0 : 1 }));
  return <View style={styles.root}><AppChartSummary items={[{ key: 'matching', label: t('organizationalStructure.chart.totalMatching'), value: totalCount }, { key: 'loaded', label: t('organizationalStructure.chart.visible'), value: items.length }]} /><AppChartCard title={t('organizationalStructure.chart.title')}><AppHorizontalBarChart data={data} emptyLabel={t('organizationalStructure.empty')} /></AppChartCard><AppText align="center" color="muted" variant="caption">{t('organizationalStructure.chart.pageScope')}</AppText></View>;
}
const styles = StyleSheet.create({ root: { gap: 8, paddingHorizontal: 2 } });
