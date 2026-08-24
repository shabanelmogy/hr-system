import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { countryApi, countryKeys } from '@/src/features/basic-data/countries';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppSpreadsheetImportView,
  AppStatusBadge,
  AppText,
  type AppAlertSeverity,
  type SpreadsheetImportPhase,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import {
  isAmbiguousImportError,
  pickNativeSpreadsheet,
  shareSpreadsheetTemplate,
  spreadsheetErrorMessage,
  type NativeSpreadsheetFile,
} from '@/src/shared/importing';
import { stateKeys } from '../../queries/state-keys';
import { useBulkCreateStates } from '../../queries/use-states';
import {
  parseStateImport,
  STATE_IMPORT_HEADERS,
  STATE_IMPORT_MAX_BYTES,
  STATE_IMPORT_MAX_ROWS,
  STATE_IMPORT_TEMPLATE_FILE,
  type StateImportRow,
} from './state-import';

type LookupState = 'loading' | 'ready' | 'empty' | 'forbidden' | 'error';

export function StateImportView() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canCreate } = useAuthorization({ requiredPermissions: [permissions.CreateStates] });
  const { allowed: canViewCountries } = useAuthorization({ requiredPermissions: [permissions.ViewCountries] });
  const countries = useQuery({ queryKey: countryKeys.lookup(), queryFn: countryApi.getLookup, enabled: canViewCountries, staleTime: 5 * 60_000 });
  const lookupState: LookupState = !canViewCountries ? 'forbidden' : countries.isLoading ? 'loading' : countries.isError ? 'error' : (countries.data?.length ?? 0) === 0 ? 'empty' : 'ready';
  const mutation = useBulkCreateStates();
  const [file, setFile] = useState<NativeSpreadsheetFile | null>(null);
  const [rows, setRows] = useState<StateImportRow[]>([]);
  const [phase, setPhase] = useState<SpreadsheetImportPhase>('idle');
  const [feedback, setFeedback] = useState<{ severity: AppAlertSeverity; message: string } | null>(null);
  const counts = useMemo(() => ({
    total: rows.length,
    ready: rows.filter((row) => row.status === 'ready').length,
    invalid: rows.filter((row) => row.status === 'invalid').length,
    uploaded: rows.filter((row) => row.status === 'uploaded').length,
  }), [rows]);

  const guard = () => {
    if (isReadOnly) { notifyBlockedAction(); return false; }
    if (!canCreate) { setFeedback({ severity: 'error', message: t('spreadsheetImport.permissionDenied') }); return false; }
    return true;
  };
  const pick = async () => {
    if (!guard() || lookupState !== 'ready') return;
    try {
      const selected = await pickNativeSpreadsheet();
      if (!selected) return;
      setPhase('parsing'); setFeedback(null);
      const parsed = await parseStateImport(selected, countries.data ?? [], t);
      setFile(selected); setRows(parsed); setPhase('preview');
      const invalid = parsed.filter((row) => row.status === 'invalid').length;
      setFeedback({ severity: invalid ? 'warning' : 'success', message: t(invalid ? 'spreadsheetImport.previewWithErrors' : 'spreadsheetImport.previewReady', { count: parsed.length, invalid }) });
    } catch (error) {
      setPhase('failed'); setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) });
    }
  };
  const submit = async () => {
    if (!guard() || lookupState !== 'ready') return;
    const pending = rows.filter((row): row is StateImportRow & { request: NonNullable<StateImportRow['request']> } => row.status === 'ready' && row.request !== null);
    if (!pending.length) return;
    setPhase('submitting'); setFeedback(null);
    try {
      const result = await mutation.mutateAsync(pending.map((row) => row.request));
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: 'uploaded', error: undefined } : row));
      setPhase('succeeded'); setFeedback({ severity: 'success', message: t('states.import.succeeded', { count: result.createdCount }) });
    } catch (error) {
      const uncertain = isAmbiguousImportError(error);
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: uncertain ? 'uncertain' : 'failed' } : row));
      setPhase(uncertain ? 'uncertain' : 'failed');
      setFeedback({ severity: uncertain ? 'warning' : 'error', message: uncertain ? t('spreadsheetImport.uncertain') : spreadsheetErrorMessage(error, t) });
    }
  };
  const clear = () => { setFile(null); setRows([]); setPhase('idle'); setFeedback(null); };
  const shareTemplate = async () => { try { await shareSpreadsheetTemplate(STATE_IMPORT_HEADERS, STATE_IMPORT_TEMPLATE_FILE); } catch (error) { setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) }); } };
  const reconcile = async () => { await queryClient.invalidateQueries({ queryKey: stateKeys.all }); setFeedback({ severity: 'info', message: t('spreadsheetImport.reconciled') }); };

  return <View style={styles.root}>
    {lookupState !== 'ready' ? <AppAlert severity={lookupState === 'error' || lookupState === 'forbidden' ? 'error' : 'warning'}>{t(`states.import.countryLookup.${lookupState}`)}</AppAlert> : null}
    {lookupState === 'error' ? <AppButton icon="refresh-outline" onPress={() => void countries.refetch()} variant="outline">{t('common.retry')}</AppButton> : null}
    <AppSpreadsheetImportView counts={counts} feedback={feedback} file={file} headers={STATE_IMPORT_HEADERS} maxBytes={STATE_IMPORT_MAX_BYTES} maxRows={STATE_IMPORT_MAX_ROWS} onClear={clear} onPick={() => void pick()} onReconcile={() => void reconcile()} onShareTemplate={() => void shareTemplate()} onSubmit={() => void submit()} phase={phase} pickDisabled={lookupState !== 'ready'} submitDisabled={!canCreate || isReadOnly || lookupState !== 'ready'}>
      {rows.length ? <View style={styles.rows}>{rows.map((row) => <AppCard key={row.rowNumber} padding="sm" style={styles.row}><View style={styles.rowHeader}><AppText variant="label">{t('spreadsheetImport.row', { number: row.rowNumber })}</AppText><AppStatusBadge color={statusColor(row.status, theme.colors)} label={t(`spreadsheetImport.status.${row.status}`)} /></View><AppText numberOfLines={1} variant="bodySmall">{row.values.nameEn} · {row.values.nameAr}</AppText><AppText color="muted" numberOfLines={1} variant="caption">{row.values.code || '—'} · {row.values.countryName || '—'}</AppText>{row.error ? <AppText color="danger" variant="caption">{row.error}</AppText> : null}</AppCard>)}</View> : null}
    </AppSpreadsheetImportView>
  </View>;
}

function statusColor(status: StateImportRow['status'], colors: { success: string; danger: string; warning: string; primary: string }) {
  return status === 'uploaded' ? colors.success : status === 'invalid' || status === 'failed' ? colors.danger : status === 'uncertain' ? colors.warning : colors.primary;
}
const styles = StyleSheet.create({ root: { gap: 8 }, rows: { gap: 6 }, row: { gap: 3 }, rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 } });
