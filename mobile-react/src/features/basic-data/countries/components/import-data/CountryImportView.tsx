import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { permissions, useAuthorization } from '@/src/features/auth';
import {
  AppCard,
  AppSpreadsheetImportView,
  AppStatusBadge,
  AppText,
  type AppAlertSeverity,
  type SpreadsheetImportPhase,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { useAppTheme } from '@/src/core/theme';
import {
  isAmbiguousImportError,
  pickNativeSpreadsheet,
  shareSpreadsheetTemplate,
  spreadsheetErrorMessage,
  type NativeSpreadsheetFile,
} from '@/src/shared/importing';
import { countryKeys } from '../../queries/country-keys';
import { useBulkCreateCountries } from '../../queries/use-countries';
import {
  COUNTRY_IMPORT_HEADERS,
  COUNTRY_IMPORT_MAX_BYTES,
  COUNTRY_IMPORT_MAX_ROWS,
  COUNTRY_IMPORT_TEMPLATE_FILE,
  parseCountryImport,
  type CountryImportRow,
} from './country-import';

export function CountryImportView() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed } = useAuthorization({ requiredPermissions: [permissions.CreateCountries] });
  const mutation = useBulkCreateCountries();
  const [file, setFile] = useState<NativeSpreadsheetFile | null>(null);
  const [rows, setRows] = useState<CountryImportRow[]>([]);
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
    if (!allowed) { setFeedback({ severity: 'error', message: t('spreadsheetImport.permissionDenied') }); return false; }
    return true;
  };
  const pick = async () => {
    if (!guard()) return;
    try {
      const selected = await pickNativeSpreadsheet();
      if (!selected) return;
      setPhase('parsing'); setFeedback(null);
      const parsed = await parseCountryImport(selected, t);
      setFile(selected); setRows(parsed); setPhase('preview');
      const invalid = parsed.filter((row) => row.status === 'invalid').length;
      setFeedback({ severity: invalid ? 'warning' : 'success', message: t(invalid ? 'spreadsheetImport.previewWithErrors' : 'spreadsheetImport.previewReady', { count: parsed.length, invalid }) });
    } catch (error) {
      setPhase('failed'); setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) });
    }
  };
  const submit = async () => {
    if (!guard()) return;
    const pending = rows.filter((row): row is CountryImportRow & { request: NonNullable<CountryImportRow['request']> } => row.status === 'ready' && row.request !== null);
    if (!pending.length) return;
    setPhase('submitting'); setFeedback(null);
    try {
      const result = await mutation.mutateAsync(pending.map((row) => row.request));
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: 'uploaded', error: undefined } : row));
      setPhase('succeeded'); setFeedback({ severity: 'success', message: t('countries.import.succeeded', { count: result.createdCount }) });
    } catch (error) {
      const uncertain = isAmbiguousImportError(error);
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: uncertain ? 'uncertain' : 'failed' } : row));
      setPhase(uncertain ? 'uncertain' : 'failed');
      setFeedback({ severity: uncertain ? 'warning' : 'error', message: uncertain ? t('spreadsheetImport.uncertain') : spreadsheetErrorMessage(error, t) });
    }
  };
  const clear = () => { setFile(null); setRows([]); setPhase('idle'); setFeedback(null); };
  const shareTemplate = async () => { try { await shareSpreadsheetTemplate(COUNTRY_IMPORT_HEADERS, COUNTRY_IMPORT_TEMPLATE_FILE); } catch (error) { setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) }); } };
  const reconcile = async () => { await queryClient.invalidateQueries({ queryKey: countryKeys.all }); setFeedback({ severity: 'info', message: t('spreadsheetImport.reconciled') }); };

  return <AppSpreadsheetImportView counts={counts} feedback={feedback} file={file} headers={COUNTRY_IMPORT_HEADERS} maxBytes={COUNTRY_IMPORT_MAX_BYTES} maxRows={COUNTRY_IMPORT_MAX_ROWS} onClear={clear} onPick={() => void pick()} onReconcile={() => void reconcile()} onShareTemplate={() => void shareTemplate()} onSubmit={() => void submit()} phase={phase} submitDisabled={!allowed || isReadOnly}>
    {rows.length ? <View style={styles.rows}>{rows.map((row) => <AppCard key={row.rowNumber} padding="sm" style={styles.row}><View style={styles.rowHeader}><AppText variant="label">{t('spreadsheetImport.row', { number: row.rowNumber })}</AppText><AppStatusBadge color={statusColor(row.status, theme.colors)} label={t(`spreadsheetImport.status.${row.status}`)} /></View><AppText numberOfLines={1} variant="bodySmall">{row.values.nameEn} · {row.values.nameAr}</AppText><AppText color="muted" numberOfLines={1} variant="caption">{[row.values.alpha2Code, row.values.alpha3Code, row.values.currencyCode].filter(Boolean).join(' · ') || '—'}</AppText>{row.error ? <AppText color="danger" variant="caption">{row.error}</AppText> : null}</AppCard>)}</View> : null}
  </AppSpreadsheetImportView>;
}

function statusColor(status: CountryImportRow['status'], colors: { success: string; danger: string; warning: string; primary: string }) {
  return status === 'uploaded' ? colors.success : status === 'invalid' || status === 'failed' ? colors.danger : status === 'uncertain' ? colors.warning : colors.primary;
}
const styles = StyleSheet.create({ rows: { gap: 6 }, row: { gap: 3 }, rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 } });
