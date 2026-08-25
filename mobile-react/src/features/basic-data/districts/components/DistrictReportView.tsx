import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ENV } from '@/src/core/config/env';
import { useLocalization } from '@/src/core/localization';
import { permissions, useAuthorization } from '@/src/features/auth';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppFilterFormButton,
  AppSelectField,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import {
  districtReportApi,
  getDistrictReportDisplayName,
  type GeneratedDistrictReport,
} from '../api/district-report-api';
import { useDistrictReportCatalog } from '../queries/use-district-reports';

interface DistrictReportFilters {
  nameAr: string;
  nameEn: string;
  stateAr: string;
  stateEn: string;
}

const emptyFilters: DistrictReportFilters = {
  nameAr: '',
  nameEn: '',
  stateAr: '',
  stateEn: '',
};

export function DistrictReportView() {
  const { t } = useTranslation();
  const { allowed, isLoading } = useAuthorization({
    requiredPermissions: [permissions.ViewCrystalReports],
  });

  if (isLoading) {
    return (
      <AppCard padding="md" style={styles.card} variant="outlined">
        <AppAlert severity="info">{t('feedback.loading')}</AppAlert>
      </AppCard>
    );
  }

  if (!allowed) {
    return (
      <AppCard padding="md" style={styles.card} variant="outlined">
        <AppAlert severity="warning">{t('districts.reportPermissionDenied')}</AppAlert>
      </AppCard>
    );
  }

  return <AuthorizedDistrictReportView />;
}

function AuthorizedDistrictReportView() {
  const { t } = useTranslation();
  const { isRTL } = useLocalization();
  const language = isRTL ? 'ar' : 'en';
  const catalogQuery = useDistrictReportCatalog(ENV.isApiConfigured);
  const reports = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [filters, setFilters] = useState<DistrictReportFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<DistrictReportFilters>(emptyFilters);
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedDistrictReport | null>(null);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  useEffect(() => () => generatedReport?.dispose(), [generatedReport]);

  const openReport = useCallback(async (report: GeneratedDistrictReport) => {
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
      const report = await districtReportApi.generate({
        language,
        ...filters,
        report: selectedReport,
      });
      setGeneratedReport(report);
      showToast.success(t('districts.reportGenerated'));
      await openReport(report);
    } catch (error) {
      showToast.error(error, t('districts.reportGenerateFailed'));
    } finally {
      setGenerating(false);
    }
  }, [filters, language, openReport, selectedReport, t]);

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
        throw new Error(t('districts.reportShareUnavailable'));
      }
      await Sharing.shareAsync(generatedReport.uri, {
        dialogTitle: generatedReport.fileName,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      showToast.error(error, t('districts.reportGenerateFailed'));
    }
  }, [generatedReport, t]);

  const activeFilterCount = Object.values(filters).filter((value) => value.trim()).length;
  const applyFilters = useCallback(() => {
    setFilters({
      nameAr: draftFilters.nameAr.trim(),
      nameEn: draftFilters.nameEn.trim(),
      stateAr: draftFilters.stateAr.trim(),
      stateEn: draftFilters.stateEn.trim(),
    });
  }, [draftFilters]);
  const clearDraftFilters = useCallback(() => setDraftFilters(emptyFilters), []);

  const reportOptions = useMemo(() => reports.map((report) => ({
    value: report.id,
    label: getDistrictReportDisplayName(report, language),
    icon: 'document-text-outline' as const,
  })), [language, reports]);

  const catalogUnavailable = !catalogQuery.isLoading && !catalogQuery.isError && reports.length === 0;

  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      {catalogQuery.isError ? (
        <View style={styles.feedback}>
          <AppAlert severity="warning">{t('districts.reportCatalogError')}</AppAlert>
          <AppButton icon="refresh-outline" onPress={() => void catalogQuery.refetch()} variant="outline">
            {t('common.retry')}
          </AppButton>
        </View>
      ) : null}
      {catalogUnavailable ? <AppAlert severity="info">{t('districts.reportUnavailable')}</AppAlert> : null}

      <AppSelectField
        allowWhenReadOnly
        disabled={!ENV.isApiConfigured || catalogQuery.isLoading || reports.length === 0}
        label={t('districts.reportType')}
        leadingIcon="document-text-outline"
        onChange={(value) => setSelectedReportId(value as string)}
        options={reportOptions}
        value={selectedReport?.id ?? null}
      />
      <AppFilterFormButton
        activeCount={activeFilterCount}
        buttonLabel={t('districts.searchReport')}
        clearDisabled={!Object.values(draftFilters).some(Boolean)}
        disabled={!ENV.isApiConfigured || !selectedReport}
        display="button"
        icon="search-outline"
        modalTitle={t('districts.reportFilters')}
        onApply={applyFilters}
        onClear={clearDraftFilters}
        onOpen={() => setDraftFilters(filters)}>
        <ReportFilterField label={t('districts.reportNameEn')} onChange={(nameEn) => setDraftFilters((current) => ({ ...current, nameEn }))} value={draftFilters.nameEn} />
        <ReportFilterField label={t('districts.reportNameAr')} onChange={(nameAr) => setDraftFilters((current) => ({ ...current, nameAr }))} value={draftFilters.nameAr} />
        <ReportFilterField label={t('districts.reportStateEn')} onChange={(stateEn) => setDraftFilters((current) => ({ ...current, stateEn }))} value={draftFilters.stateEn} />
        <ReportFilterField label={t('districts.reportStateAr')} onChange={(stateAr) => setDraftFilters((current) => ({ ...current, stateAr }))} value={draftFilters.stateAr} />
      </AppFilterFormButton>

      <AppButton
        disabled={!ENV.isApiConfigured || !selectedReport}
        fullWidth
        icon="search-outline"
        loading={generating}
        onPress={() => void generate()}>
        {generating ? t('districts.generatingReport') : t('districts.generateReport')}
      </AppButton>

      {generatedReport ? (
        <View style={styles.generated}>
          <AppAlert severity="success">{t('districts.reportReady')}</AppAlert>
          <AppButton fullWidth icon="print-outline" onPress={() => void openReport(generatedReport)} variant="outline">
            {t('districts.openReport')}
          </AppButton>
          <AppButton fullWidth icon="share-outline" onPress={() => void share()} variant="outline">
            {t('districts.shareReport')}
          </AppButton>
        </View>
      ) : null}
    </AppCard>
  );
}

function ReportFilterField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <AppTextField
      allowWhenReadOnly
      autoCapitalize="words"
      label={label}
      leadingIcon="search-outline"
      onChangeText={onChange}
      onClear={() => onChange('')}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: 12 },
  feedback: { gap: 8 },
  generated: { gap: 8 },
});
