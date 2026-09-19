import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppDataCard, AppPaginationNavigation, AppScreen, AppSegmentedControl, AppSelectField, AppStateView, AppStatusBadge, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { permissions, useAuthorization } from '@/src/platform/auth';
import { useFiscalYearLookup } from '@/src/modules/accounting';
import { useWorkforceTraceByApplication, useWorkforceTraceByEmployee, useWorkforceTraceByOffer, usePlanCommitmentSummary } from '../queries/use-workforce-trace';
import type { PlanCommitmentPageQuery } from '../../domain/models/workforce-trace';

type RootKind = 'application' | 'offer' | 'employee';

export function WorkforceTraceScreen() {
  const { t, i18n } = useTranslation();
  const { allowed } = useAuthorization({ requiredPermissions: [permissions.ViewWorkforceTrace] });
  const [root, setRoot] = useState<RootKind>('application');
  const [rootId, setRootId] = useState('');
  const [active, setActive] = useState<{ kind: RootKind; id: number } | null>(null);
  const [fiscalYear, setFiscalYear] = useState(0);
  const [commitmentQuery, setCommitmentQuery] = useState<PlanCommitmentPageQuery | null>(null);
  const application = useWorkforceTraceByApplication(active?.kind === 'application' ? active.id : null);
  const offer = useWorkforceTraceByOffer(active?.kind === 'offer' ? active.id : null);
  const employee = useWorkforceTraceByEmployee(active?.kind === 'employee' ? active.id : null);
  const trace = application.data ?? offer.data ?? employee.data;
  const commitment = usePlanCommitmentSummary(commitmentQuery);
  const fiscalYears = useFiscalYearLookup();
  const fiscalYearOptions = useMemo<AppSelectOption<number>[]>(() => [...(fiscalYears.data ?? [])]
    .sort((left, right) => Number(right.status === 2) - Number(left.status === 2) || left.code.localeCompare(right.code))
    .map(year => ({ value: year.id, label: `${year.code} — ${i18n.language.startsWith('ar') ? year.nameAr : year.nameEn}`, icon: 'calendar-outline' })), [fiscalYears.data, i18n.language]);
  const options = useMemo(() => [
    { value: 'application' as const, label: t('workforceTrace.application') },
    { value: 'offer' as const, label: t('workforceTrace.offer') },
    { value: 'employee' as const, label: t('workforceTrace.employee') },
  ], [t]);
  if (!allowed) return <AppScreen><AppStateView state="error" message={t('common.accessDenied')} /></AppScreen>;
  const loadTrace = () => { const id = Number(rootId); if (id > 0) setActive({ kind: root, id }); };
  const loadCommitment = () => { if (fiscalYear > 0) setCommitmentQuery({ fiscalYearId: fiscalYear, pageNumber: 1, pageSize: 10 }); };
  const refreshTrace = () => void (active?.kind === 'application' ? application.refetch() : active?.kind === 'offer' ? offer.refetch() : employee.refetch());
  return <AppScreen contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={application.isRefetching || offer.isRefetching || employee.isRefetching} onRefresh={refreshTrace} />}>
    <AppDataCard padding="md"><AppText variant="titleSmall" weight="800">{t('workforceTrace.title')}</AppText><AppSegmentedControl<RootKind> label={t('workforceTrace.rootType')} value={root} options={options} onChange={setRoot} /><AppTextField name="rootId" label={t('workforceTrace.rootId')} value={rootId} onChangeText={setRootId} keyboardType="numeric" /><AppText color="primary" onPress={loadTrace}>{t('workforceTrace.loadTrace')}</AppText></AppDataCard>
    {application.isLoading || offer.isLoading || employee.isLoading ? <AppStateView state="loading" /> : null}
    {application.error || offer.error || employee.error ? <AppStateView state="error" message={t('workforceTrace.fetchError')} onRetry={loadTrace} /> : null}
    {trace ? <View style={styles.timeline} accessibilityLabel={t('workforceTrace.timelineAriaLabel')}>
      {trace.nodes.map((node, index) => <AppDataCard key={node.key} padding="md"><View style={styles.row}><AppStatusBadge label={node.kind} color="#1976d2" /><AppText weight="800" style={styles.flex}>{node.title}</AppText><AppText color="muted" variant="caption">{index + 1}/{trace.nodes.length}</AppText></View><AppText color="muted" variant="caption">{node.status ?? t('workforceTrace.noStatus')}{node.occurredOn ? ` • ${new Date(node.occurredOn).toLocaleString()}` : ''}</AppText>{node.fiscalCost !== null && node.fiscalCost !== undefined ? <AppText>{node.fiscalCost} {node.currencyCode ?? ''}</AppText> : null}</AppDataCard>)}
      <AppDataCard padding="md"><AppText variant="label" weight="800">{t('workforceTrace.relationships')}</AppText>{trace.edges.length === 0 ? <AppText color="muted">{t('workforceTrace.noRelationships')}</AppText> : trace.edges.map(edge => <AppText key={`${edge.fromKey}-${edge.toKey}-${edge.relation}`} variant="bodySmall">{edge.fromKey} — {edge.relation} → {edge.toKey}</AppText>)}</AppDataCard>
    </View> : active && !application.isLoading && !offer.isLoading && !employee.isLoading ? <AppStateView state="empty" message={t('workforceTrace.empty')} /> : null}
    <AppDataCard padding="md"><AppText variant="titleSmall" weight="800">{t('workforceTrace.commitmentTitle')}</AppText><AppSelectField allowWhenReadOnly label={t('workforceTrace.fiscalYear')} value={fiscalYear} onChange={setFiscalYear} options={fiscalYearOptions} placeholder={t('workforceTrace.selectFiscalYear')} disabled={fiscalYears.isLoading || fiscalYearOptions.length === 0} /><AppText color="primary" onPress={loadCommitment}>{t('workforceTrace.loadCommitment')}</AppText></AppDataCard>
    {commitment.isLoading ? <AppStateView state="loading" /> : null}
    {commitment.error ? <AppStateView state="error" message={t('workforceTrace.fetchError')} onRetry={loadCommitment} /> : null}
    {commitment.data?.items.map(row => <AppDataCard key={row.positionEnvelopeId} padding="md"><AppText weight="800">{row.envelopeCode} • {row.planCode} • {row.budgetCode}</AppText><AppText>{row.availableHeadcount} / {row.authorizedHeadcount} {t('workforceTrace.people')}</AppText><AppText color="muted" variant="caption">{row.staffingRequests} {t('workforceTrace.requests')} • {row.requisitions} {t('workforceTrace.requisitions')} • {row.offers} {t('workforceTrace.offers')} • {row.hires} {t('workforceTrace.hires')}</AppText>{row.availableSalaryCost !== null && row.availableSalaryCost !== undefined ? <AppText>{row.availableSalaryCost} {row.currencyCode ?? ''}</AppText> : null}</AppDataCard>)}
    {commitment.data && commitment.data.metaData.totalPages > 1 ? <AppPaginationNavigation page={(commitment.data.metaData.currentPage ?? 1) - 1} pageCount={commitment.data.metaData.totalPages} onPageChange={page => setCommitmentQuery(previous => previous ? { ...previous, pageNumber: page + 1 } : previous)} /> : null}
  </AppScreen>;
}

const styles = StyleSheet.create({ screen: { gap: 12, paddingVertical: 8 }, timeline: { gap: 8 }, row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, flex: { flex: 1 } });
