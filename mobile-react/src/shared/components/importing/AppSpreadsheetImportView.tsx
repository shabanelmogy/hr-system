import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import type { NativeSpreadsheetFile } from '@/src/shared/importing';
import { AppAlert, type AppAlertSeverity } from '../feedback/AppAlert';
import { AppButton } from '../controls/AppButton';
import { AppIcon } from '../icons/AppIcon';
import { AppCard } from '../surfaces/AppCard';
import { AppText } from '../typography/AppText';

export type SpreadsheetImportPhase =
  | 'idle'
  | 'parsing'
  | 'preview'
  | 'submitting'
  | 'succeeded'
  | 'failed'
  | 'uncertain';

export interface SpreadsheetImportCounts {
  total: number;
  ready: number;
  invalid: number;
  uploaded: number;
}

export interface AppSpreadsheetImportViewProps {
  children?: ReactNode;
  counts: SpreadsheetImportCounts;
  file: NativeSpreadsheetFile | null;
  feedback?: { severity: AppAlertSeverity; message: string } | null;
  headers: readonly string[];
  maxBytes: number;
  maxRows: number;
  onClear: () => void;
  onPick: () => void;
  onReconcile?: () => void;
  onShareTemplate: () => void;
  onSubmit: () => void;
  phase: SpreadsheetImportPhase;
  pickDisabled?: boolean;
  submitDisabled?: boolean;
}

export function AppSpreadsheetImportView({
  children,
  counts,
  file,
  feedback,
  headers,
  maxBytes,
  maxRows,
  onClear,
  onPick,
  onReconcile,
  onShareTemplate,
  onSubmit,
  phase,
  pickDisabled = false,
  submitDisabled = false,
}: AppSpreadsheetImportViewProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const busy = phase === 'parsing' || phase === 'submitting';
  return (
    <View style={styles.root}>
      <AppCard padding="sm" style={styles.card}>
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
            <AppIcon color={theme.colors.primary} name="document-attach-outline" size={28} />
          </View>
          <View style={styles.headingText}>
            <AppText variant="label">{t('spreadsheetImport.xlsxOnly')}</AppText>
            <AppText color="muted" variant="caption">
              {t('spreadsheetImport.limits', { maxMb: Math.floor(maxBytes / 1024 / 1024), maxRows })}
            </AppText>
          </View>
        </View>
        <AppText color="muted" variant="caption">
          {t('spreadsheetImport.expectedHeaders', { headers: headers.join(', ') })}
        </AppText>
        {file ? (
          <View style={[styles.file, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
            <AppIcon color={theme.colors.primary} name="document-text-outline" size={20} />
            <View style={styles.fileText}>
              <AppText numberOfLines={1} variant="label">{file.name}</AppText>
              <AppText color="muted" variant="caption">{formatBytes(file.size)}</AppText>
            </View>
          </View>
        ) : null}
        <View style={styles.actions}>
          <AppButton disabled={busy || pickDisabled} icon="folder-open-outline" onPress={onPick} style={styles.action} variant="outline">
            {t(file ? 'spreadsheetImport.replaceFile' : 'spreadsheetImport.chooseFile')}
          </AppButton>
          <AppButton disabled={busy} icon="download-outline" onPress={onShareTemplate} style={styles.action} variant="outline">
            {t('spreadsheetImport.template')}
          </AppButton>
          {file ? <AppButton disabled={busy} icon="trash-outline" onPress={onClear} style={styles.action} variant="ghost">{t('common.clear')}</AppButton> : null}
          <AppButton disabled={submitDisabled || counts.ready === 0} icon="cloud-upload-outline" loading={phase === 'submitting'} onPress={onSubmit} style={styles.action}>
            {t('spreadsheetImport.importRows')}
          </AppButton>
        </View>
      </AppCard>

      {counts.total > 0 ? (
        <View style={styles.counts}>
          <Count label={t('spreadsheetImport.total')} value={counts.total} />
          <Count label={t('spreadsheetImport.ready')} value={counts.ready} />
          <Count label={t('spreadsheetImport.invalid')} value={counts.invalid} />
          <Count label={t('spreadsheetImport.uploaded')} value={counts.uploaded} />
        </View>
      ) : null}
      {phase === 'parsing' ? <AppAlert>{t('spreadsheetImport.parsing')}</AppAlert> : null}
      {feedback ? <AppAlert severity={feedback.severity}>{feedback.message}</AppAlert> : null}
      {phase === 'uncertain' && onReconcile ? (
        <AppButton icon="refresh-outline" onPress={onReconcile} variant="warning">
          {t('spreadsheetImport.reconcile')}
        </AppButton>
      ) : null}
      {children}
    </View>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  const { theme } = useAppTheme();
  return <View style={[styles.count, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.sm }]}><AppText align="center" variant="label">{value}</AppText><AppText align="center" color="muted" variant="caption">{label}</AppText></View>;
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: 8 },
  card: { gap: 9 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingText: { flex: 1, minWidth: 0 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  file: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6 },
  fileText: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  action: { flexGrow: 1, flexBasis: '46%', minWidth: 132, paddingHorizontal: 8 },
  counts: { flexDirection: 'row', gap: 5 },
  count: { flex: 1, minWidth: 0, borderWidth: 1, paddingHorizontal: 3, paddingVertical: 6 },
});
