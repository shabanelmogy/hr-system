import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { AppModal, AppStateView, AppText } from '@/src/shared/components';

import type { ErrorLogRow, ErrorLogScope } from '../../domain/models/error-log';
import { useErrorLogDetail } from '../queries/use-error-logs';

export function ErrorLogDetailModal({ scope, item, canView, onClose }: {
  scope: ErrorLogScope; item: ErrorLogRow | null; canView: boolean; onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const query = useErrorLogDetail(scope, item?.id ?? null, canView);
  const entry = query.data?.entry;
  const fields = entry ? [
    ['occurredOnUtc', new Date(entry.occurredOnUtc).toLocaleString(i18n.language)],
    ['source', t(`errorLogs.source.${entry.source}`)], ['severity', t(`errorLogs.severity.${entry.severity}`)],
    ['userName', entry.userName], ['service', entry.service], ['action', entry.action],
    ['statusCode', entry.statusCode], ['durationMs', entry.durationMs],
    ['correlationId', entry.correlationId], ['client', entry.client], ['browser', entry.browser],
    ...(scope === 'system' ? [['ipAddress', entry.ipAddress] as const] : []),
  ] as const : [];
  return <AppModal visible={item !== null && canView} variant="fullScreen" title={t('errorLogs.detail')} subtitle={item?.summary} icon="alert-circle-outline" closeLabel={t('common.close')} onClose={onClose}>
    {query.isLoading ? <AppStateView state="loading" /> : query.error ? <AppStateView state="error" message={t('errorLogs.loadFailed')} onRetry={() => void query.refetch()} /> : entry ? <View style={styles.content}>
      <AppText weight="700">{entry.summary}</AppText>
      {fields.map(([key, value]) => value === null ? null : <View key={key} style={[styles.field, { direction }]}><AppText color="muted" variant="caption">{t(`errorLogs.fields.${key}`)}</AppText><AppText variant="bodySmall" selectable>{String(value)}</AppText></View>)}
      {scope === 'system' && query.data?.diagnostics.length ? <View style={styles.field}><AppText weight="700">{t('systemErrorLogs.diagnostics')}</AppText>{query.data.diagnostics.map((frame, index) => <AppText key={`${index}-${frame}`} variant="bodySmall" selectable>{frame}</AppText>)}</View> : null}
    </View> : null}
  </AppModal>;
}
const styles = StyleSheet.create({ content: { gap: 12 }, field: { gap: 3 } });
