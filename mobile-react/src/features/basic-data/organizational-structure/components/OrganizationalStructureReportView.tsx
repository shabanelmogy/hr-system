import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppCard, AppText } from '@/src/shared/components';
import type { OrganizationalResource, OrganizationalStructureItem } from '../types/organizational-structure';

export function OrganizationalStructureReportView({ resource, items, totalCount }: { resource: OrganizationalResource; items: readonly OrganizationalStructureItem[]; totalCount: number }) {
  const { t } = useTranslation();
  return <View style={styles.root}><AppText variant="label">{t('organizationalStructure.report.title', { resource: t(`organizationalStructure.resources.${resource}`) })}</AppText><AppText color="muted" variant="caption">{t('organizationalStructure.report.scope', { count: items.length, total: totalCount })}</AppText>{items.map((item) => <AppCard key={item.id} padding="sm" style={styles.row}><AppText variant="bodySmall" weight="700">{item.nameEn} · {item.code}</AppText><AppText color="muted" variant="caption">{item.nameAr} · {item.parentNameEn ?? item.divisionNameEn ?? item.departmentNameEn ?? item.branchNameEn ?? t('organizationalStructure.currentCompany')}</AppText></AppCard>)}</View>;
}
const styles = StyleSheet.create({ root: { gap: 10 }, row: { gap: 3 } });
