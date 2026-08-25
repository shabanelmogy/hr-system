import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import { stateApi, stateKeys } from '@/src/features/basic-data/states';
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
import { districtKeys } from '../../queries/district-keys';
import { useBulkCreateDistricts } from '../../queries/use-districts';
import {
  DISTRICT_IMPORT_HEADERS,
  DISTRICT_IMPORT_MAX_BYTES,
  DISTRICT_IMPORT_MAX_ROWS,
  DISTRICT_IMPORT_TEMPLATE_FILE,
  parseDistrictImport,
  type DistrictImportRow,
} from './district-import';

type LookupState = 'loading' | 'ready' | 'empty' | 'forbidden' | 'error';

export function DistrictImportView() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { allowed: canCreate } = useAuthorization({ allowSuperAdmin: true, requiredPermissions: [permissions.CreateDistricts] });
  const { allowed: canViewStates } = useAuthorization({ allowSuperAdmin: true, requiredPermissions: [permissions.ViewStates] });
  const states = useQuery({
    queryKey: stateKeys.lookup(),
    queryFn: () => stateApi.getLookup(),
    enabled: canViewStates,
    staleTime: 5 * 60_000,
  });
  const lookupState: LookupState = !canViewStates
    ? 'forbidden'
    : states.isLoading
      ? 'loading'
      : states.isError
        ? 'error'
        : (states.data?.length ?? 0) === 0
          ? 'empty'
          : 'ready';
  const mutation = useBulkCreateDistricts();
  const [file, setFile] = useState<NativeSpreadsheetFile | null>(null);
  const [rows, setRows] = useState<DistrictImportRow[]>([]);
  const [phase, setPhase] = useState<SpreadsheetImportPhase>('idle');
  const [feedback, setFeedback] = useState<{ severity: AppAlertSeverity; message: string } | null>(null);
  const counts = useMemo(() => ({
    total: rows.length,
    ready: rows.filter((row) => row.status === 'ready').length,
    invalid: rows.filter((row) => row.status === 'invalid').length,
    uploaded: rows.filter((row) => row.status === 'uploaded').length,
  }), [rows]);

  const guard = () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return false;
    }
    if (!canCreate) {
      setFeedback({ severity: 'error', message: t('spreadsheetImport.permissionDenied') });
      return false;
    }
    return true;
  };
  const pick = async () => {
    if (!guard() || lookupState !== 'ready') return;
    try {
      const selected = await pickNativeSpreadsheet();
      if (!selected) return;
      setPhase('parsing');
      setFeedback(null);
      const parsed = await parseDistrictImport(selected, states.data ?? [], t);
      setFile(selected);
      setRows(parsed);
      setPhase('preview');
      const invalid = parsed.filter((row) => row.status === 'invalid').length;
      setFeedback({
        severity: invalid ? 'warning' : 'success',
        message: t(invalid ? 'spreadsheetImport.previewWithErrors' : 'spreadsheetImport.previewReady', { count: parsed.length, invalid }),
      });
    } catch (error) {
      setPhase('failed');
      setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) });
    }
  };
  const submit = async () => {
    if (!guard() || lookupState !== 'ready') return;
    const pending = rows.filter((row): row is DistrictImportRow & { request: NonNullable<DistrictImportRow['request']> } => row.status === 'ready' && row.request !== null);
    if (!pending.length) return;
    setPhase('submitting');
    setFeedback(null);
    try {
      const result = await mutation.mutateAsync(pending.map((row) => row.request));
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: 'uploaded', error: undefined } : row));
      setPhase('succeeded');
      setFeedback({ severity: 'success', message: t('districts.import.succeeded', { count: result.createdCount }) });
    } catch (error) {
      const uncertain = isAmbiguousImportError(error);
      const submitted = new Set(pending.map((row) => row.rowNumber));
      setRows((current) => current.map((row) => submitted.has(row.rowNumber) ? { ...row, status: uncertain ? 'uncertain' : 'failed' } : row));
      setPhase(uncertain ? 'uncertain' : 'failed');
      setFeedback({ severity: uncertain ? 'warning' : 'error', message: uncertain ? t('spreadsheetImport.uncertain') : spreadsheetErrorMessage(error, t) });
    }
  };
  const clear = () => {
    setFile(null);
    setRows([]);
    setPhase('idle');
    setFeedback(null);
  };
  const shareTemplate = async () => {
    try {
      await shareSpreadsheetTemplate(DISTRICT_IMPORT_HEADERS, DISTRICT_IMPORT_TEMPLATE_FILE);
    } catch (error) {
      setFeedback({ severity: 'error', message: spreadsheetErrorMessage(error, t) });
    }
  };
  const reconcile = async () => {
    await queryClient.invalidateQueries({ queryKey: districtKeys.all });
    setFeedback({ severity: 'info', message: t('spreadsheetImport.reconciled') });
  };

  return (
    <View style={styles.root}>
      {lookupState !== 'ready' ? (
        <AppAlert severity={lookupState === 'error' || lookupState === 'forbidden' ? 'error' : 'warning'}>
          {t(`districts.import.stateLookup.${lookupState}`)}
        </AppAlert>
      ) : null}
      {lookupState === 'error' ? (
        <AppButton icon="refresh-outline" onPress={() => void states.refetch()} variant="outline">
          {t('common.retry')}
        </AppButton>
      ) : null}
      <AppSpreadsheetImportView
        counts={counts}
        feedback={feedback}
        file={file}
        headers={DISTRICT_IMPORT_HEADERS}
        maxBytes={DISTRICT_IMPORT_MAX_BYTES}
        maxRows={DISTRICT_IMPORT_MAX_ROWS}
        onClear={clear}
        onPick={() => void pick()}
        onReconcile={() => void reconcile()}
        onShareTemplate={() => void shareTemplate()}
        onSubmit={() => void submit()}
        phase={phase}
        pickDisabled={lookupState !== 'ready'}
        submitDisabled={!canCreate || isReadOnly || lookupState !== 'ready'}>
        {rows.length ? (
          <View style={styles.rows}>
            {rows.map((row) => (
              <AppCard key={row.rowNumber} padding="sm" style={styles.row}>
                <View style={styles.rowHeader}>
                  <AppText variant="label">{t('spreadsheetImport.row', { number: row.rowNumber })}</AppText>
                  <AppStatusBadge color={statusColor(row.status, theme.colors)} label={t(`spreadsheetImport.status.${row.status}`)} />
                </View>
                <AppText numberOfLines={1} variant="bodySmall">{row.values.nameEn} · {row.values.nameAr}</AppText>
                <AppText color="muted" numberOfLines={1} variant="caption">{row.values.code || '—'} · {row.values.stateName || '—'}</AppText>
                {row.error ? <AppText color="danger" variant="caption">{row.error}</AppText> : null}
              </AppCard>
            ))}
          </View>
        ) : null}
      </AppSpreadsheetImportView>
    </View>
  );
}

function statusColor(status: DistrictImportRow['status'], colors: { success: string; danger: string; warning: string; primary: string }) {
  return status === 'uploaded'
    ? colors.success
    : status === 'invalid' || status === 'failed'
      ? colors.danger
      : status === 'uncertain'
        ? colors.warning
        : colors.primary;
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  rows: { gap: 6 },
  row: { gap: 3 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
