import { useQuery } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ENV } from '@/src/core/config/env';
import { useLocalization } from '@/src/core/localization';
import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppFilterFormButton,
  AppSelectField,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import { crystalReportsApi } from '../composition/crystal-reports';
import type { CrystalReportListItem } from '../domain/models/crystal-report';
import { useManagedReportAvailability } from './useManagedReportAvailability';

export interface ManagedCrystalReportFilter {
  key: string;
  label: string;
}

export interface ManagedCrystalReportViewProps {
  entityKey: string;
  scope?: 'tenant' | 'global';
  fallbackFileName: string;
  filters: readonly ManagedCrystalReportFilter[];
  translationPrefix: string;
}

interface GeneratedReport {
  fileName: string;
  uri: string;
  dispose: () => void;
}

/** Shared managed-report experience used by feature multi-view screens. */
export function ManagedCrystalReportView({
  entityKey,
  scope = 'tenant',
  fallbackFileName,
  filters,
  translationPrefix,
}: ManagedCrystalReportViewProps) {
  const { t } = useTranslation();
  const availability = useManagedReportAvailability(scope);
  const { isRTL } = useLocalization();
  const language = isRTL ? 'ar' : 'en';
  const catalogQuery = useQuery({
    enabled: ENV.isApiConfigured && availability.allowed,
    queryKey: ['crystal-reports', scope, entityKey],
    queryFn: () => scope === 'global'
      ? crystalReportsApi.listGlobal(entityKey)
      : crystalReportsApi.listPublished(entityKey),
    staleTime: 5 * 60_000,
  });
  const reports = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  useEffect(() => () => generatedReport?.dispose(), [generatedReport]);

  const openReport = useCallback(async (report: GeneratedReport) => {
    if (Platform.OS === 'web') {
      window.open(report.uri, '_blank', 'noopener,noreferrer');
      return;
    }
    await Print.printAsync({ uri: report.uri });
  }, []);

  const generate = useCallback(async () => {
    if (!ENV.isApiConfigured || !selectedReport) return;
    setGenerating(true);
    try {
      const request = {
        language,
        filters: Object.fromEntries(
          Object.entries(appliedFilters)
            .map(([key, value]) => [key, value.trim()])
            .filter(([, value]) => value.length > 0),
        ),
      } as const;
      const pdf = scope === 'global'
        ? await crystalReportsApi.renderGlobal(selectedReport.id, {
          entityKey,
          expectedSha256: selectedReport.rowVersion,
          ...request,
        })
        : await crystalReportsApi.render(selectedReport.id, request);
      const nextReport = createGeneratedReport(pdf, selectedReport, fallbackFileName);
      setGeneratedReport(nextReport);
      showToast.success(t(`${translationPrefix}.reportGenerated`));
      await openReport(nextReport);
    } catch (error) {
      showToast.error(error, t(`${translationPrefix}.reportGenerateFailed`));
    } finally {
      setGenerating(false);
    }
  }, [appliedFilters, entityKey, fallbackFileName, language, openReport, scope, selectedReport, t, translationPrefix]);

  const share = useCallback(async () => {
    if (!generatedReport) return;
    try {
      if (Platform.OS === 'web') {
        const anchor = document.createElement('a');
        anchor.href = generatedReport.uri;
        anchor.download = generatedReport.fileName;
        anchor.click();
        return;
      }
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(t(`${translationPrefix}.reportShareUnavailable`));
      }
      await Sharing.shareAsync(generatedReport.uri, {
        dialogTitle: generatedReport.fileName,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      showToast.error(error, t(`${translationPrefix}.reportGenerateFailed`));
    }
  }, [generatedReport, t, translationPrefix]);

  const reportOptions = useMemo(() => reports.map((report) => ({
    value: report.id,
    label: getReportDisplayName(report, language),
    icon: 'document-text-outline' as const,
  })), [language, reports]);
  const activeFilterCount = Object.values(appliedFilters).filter((value) => value.trim()).length;

  if (availability.isLoading) {
    return <FeedbackCard severity="info" message={t('feedback.loading')} />;
  }

  if (!availability.allowed) {
    return <FeedbackCard severity="warning" message={t(`${translationPrefix}.reportPermissionDenied`)} />;
  }

  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      {catalogQuery.isError ? (
        <View style={styles.feedback}>
          <AppAlert severity="warning">{t(`${translationPrefix}.reportCatalogError`)}</AppAlert>
          <AppButton icon="refresh-outline" onPress={() => void catalogQuery.refetch()} variant="outline">
            {t('common.retry')}
          </AppButton>
        </View>
      ) : null}
      {!catalogQuery.isLoading && !catalogQuery.isError && reports.length === 0 ? (
        <AppAlert severity="info">{t(`${translationPrefix}.reportUnavailable`)}</AppAlert>
      ) : null}

      <AppSelectField
        allowWhenReadOnly
        disabled={!ENV.isApiConfigured || catalogQuery.isLoading || reports.length === 0}
        label={t(`${translationPrefix}.reportType`)}
        leadingIcon="document-text-outline"
        onChange={(value) => setSelectedReportId(value as string)}
        options={reportOptions}
        value={selectedReport?.id ?? null}
      />
      <AppFilterFormButton
        activeCount={activeFilterCount}
        buttonLabel={t(`${translationPrefix}.searchReport`)}
        clearDisabled={!Object.values(draftFilters).some(Boolean)}
        disabled={!ENV.isApiConfigured || !selectedReport}
        display="button"
        icon="search-outline"
        modalTitle={t(`${translationPrefix}.reportFilters`)}
        onApply={() => setAppliedFilters(normalizeFilters(draftFilters))}
        onClear={() => setDraftFilters({})}
        onOpen={() => setDraftFilters(appliedFilters)}
      >
        {filters.map((filter) => (
          <AppTextField
            key={filter.key}
            allowWhenReadOnly
            autoCapitalize="words"
            label={filter.label}
            leadingIcon="search-outline"
            onChangeText={(value) => setDraftFilters((current) => ({ ...current, [filter.key]: value }))}
            onClear={() => setDraftFilters((current) => ({ ...current, [filter.key]: '' }))}
            value={draftFilters[filter.key] ?? ''}
          />
        ))}
      </AppFilterFormButton>

      <AppButton
        disabled={!ENV.isApiConfigured || !selectedReport}
        fullWidth
        icon="document-text-outline"
        loading={generating}
        onPress={() => void generate()}
      >
        {t(`${translationPrefix}.${generating ? 'generatingReport' : 'generateReport'}`)}
      </AppButton>

      {generatedReport ? (
        <View style={styles.generated}>
          <AppAlert severity="success">{t(`${translationPrefix}.reportReady`)}</AppAlert>
          <AppButton fullWidth icon="print-outline" onPress={() => void openReport(generatedReport)} variant="outline">
            {t(`${translationPrefix}.openReport`)}
          </AppButton>
          <AppButton fullWidth icon="share-outline" onPress={() => void share()} variant="outline">
            {t(`${translationPrefix}.shareReport`)}
          </AppButton>
        </View>
      ) : null}
    </AppCard>
  );
}

function FeedbackCard({ message, severity }: { message: string; severity: 'info' | 'warning' }) {
  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      <AppAlert severity={severity}>{message}</AppAlert>
    </AppCard>
  );
}

function normalizeFilters(filters: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );
}

function getReportDisplayName(report: CrystalReportListItem, language: 'ar' | 'en'): string {
  return (language === 'ar' ? report.summaryTitle : report.summarySubject) || report.displayName;
}

function createGeneratedReport(
  pdf: ArrayBuffer,
  report: CrystalReportListItem,
  fallbackFileName: string,
): GeneratedReport {
  const bytes = new Uint8Array(pdf);
  if (!isValidPdf(bytes)) throw new Error('Invalid PDF response.');
  const fileName = `${sanitizeFileName(report.displayName, fallbackFileName)}.pdf`;

  if (Platform.OS === 'web') {
    const uri = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    return { fileName, uri, dispose: () => URL.revokeObjectURL(uri) };
  }

  const file = createSensitiveCacheFile('preview', fileName);
  file.create({ intermediates: true, overwrite: true });
  file.write(bytes);
  return {
    fileName,
    uri: file.uri,
    dispose: () => {
      try {
        if (file.exists) file.delete();
      } catch {
        // Sensitive report cache cleanup is best-effort after the report action succeeds.
      }
    },
  };
}

function sanitizeFileName(value: string, fallback: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || fallback;
}

function isValidPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 100
    && bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: 12 },
  feedback: { gap: 8 },
  generated: { gap: 8 },
});
