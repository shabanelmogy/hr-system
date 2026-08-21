import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppCard, AppText } from '@/src/shared/components';
import type { State } from '../types/state';

export function StateReportView({ states, totalCount }: { states: readonly State[]; totalCount: number }) {
  const { t } = useTranslation();
  return <View style={styles.root}><AppText variant="label">{t('states.reportTitle')}</AppText><AppText color="muted" variant="caption">{t('states.reportScope', { count: states.length, total: totalCount })}</AppText>{states.map((state) => <AppCard key={state.id} padding="sm" style={styles.row}><AppText variant="bodySmall" weight="700">{state.nameEn} · {state.code}</AppText><AppText color="muted" variant="caption">{state.country.nameEn} · {t('states.districtsCount', { count: state.districtsCount })}</AppText></AppCard>)}</View>;
}
const styles = StyleSheet.create({ root: { gap: 10 }, row: { gap: 3 } });
