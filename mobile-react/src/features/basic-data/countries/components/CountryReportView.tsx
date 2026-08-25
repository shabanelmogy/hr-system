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
  countryReportApi,
  getCountryReportDisplayName,
  type GeneratedCountryReport,
} from '../api/country-report-api';
import { useCountryReportCatalog } from '../queries/use-country-reports';

export function CountryReportView() {
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
        <AppAlert severity="warning">{t('countries.reportPermissionDenied')}</AppAlert>
      </AppCard>
    );
  }

  return <AuthorizedCountryReportView />;
}

function AuthorizedCountryReportView() {
  const { t } = useTranslation();
  const { isRTL } = useLocalization();
  const language = isRTL ? 'ar' : 'en';
  const catalogQuery = useCountryReportCatalog(ENV.isApiConfigured);
  const reports = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [draftNameAr, setDraftNameAr] = useState('');
  const [draftNameEn, setDraftNameEn] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedCountryReport | null>(null);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  useEffect(() => () => generatedReport?.dispose(), [generatedReport]);

  const openReport = useCallback(async (report: GeneratedCountryReport) => {
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
      const report = await countryReportApi.generate({ language, nameAr, nameEn, report: selectedReport });
      setGeneratedReport(report);
      showToast.success(t('countries.reportGenerated'));
      await openReport(report);
    } catch (error) {
      showToast.error(error, t('countries.reportGenerateFailed'));
    } finally {
      setGenerating(false);
    }
  }, [language, nameAr, nameEn, openReport, selectedReport, t]);

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
        throw new Error(t('countries.reportShareUnavailable'));
      }
      await Sharing.shareAsync(generatedReport.uri, {
        dialogTitle: generatedReport.fileName,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      showToast.error(error, t('countries.reportGenerateFailed'));
    }
  }, [generatedReport, t]);

  const activeFilterCount = Number(Boolean(nameAr.trim())) + Number(Boolean(nameEn.trim()));
  const openFilters = useCallback(() => {
    setDraftNameAr(nameAr);
    setDraftNameEn(nameEn);
  }, [nameAr, nameEn]);
  const applyFilters = useCallback(() => {
    setNameAr(draftNameAr.trim());
    setNameEn(draftNameEn.trim());
  }, [draftNameAr, draftNameEn]);
  const clearDraftFilters = useCallback(() => {
    setDraftNameAr('');
    setDraftNameEn('');
  }, []);

  const reportOptions = useMemo(() => reports.map((report) => ({
    value: report.id,
    label: getCountryReportDisplayName(report, language),
    icon: 'document-text-outline' as const,
  })), [language, reports]);

  const catalogUnavailable = !catalogQuery.isLoading && !catalogQuery.isError && reports.length === 0;

  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      {catalogQuery.isError ? (
        <View style={styles.feedback}>
          <AppAlert severity="warning">{t('countries.reportCatalogError')}</AppAlert>
          <AppButton icon="refresh-outline" onPress={() => void catalogQuery.refetch()} variant="outline">
            {t('common.retry')}
          </AppButton>
        </View>
      ) : null}
      {catalogUnavailable ? (
        <AppAlert severity="info">{t('countries.reportUnavailable')}</AppAlert>
      ) : null}

      <AppSelectField
        allowWhenReadOnly
        disabled={!ENV.isApiConfigured || catalogQuery.isLoading || reports.length === 0}
        label={t('countries.reportType')}
        leadingIcon="document-text-outline"
        onChange={(value) => setSelectedReportId(value as string)}
        options={reportOptions}
        value={selectedReport?.id ?? null}
      />
      <AppFilterFormButton
        activeCount={activeFilterCount}
        buttonLabel={t('countries.searchReport')}
        clearDisabled={!draftNameAr && !draftNameEn}
        disabled={!ENV.isApiConfigured || !selectedReport}
        display="button"
        icon="search-outline"
        modalTitle={t('countries.reportFilters')}
        onApply={applyFilters}
        onClear={clearDraftFilters}
        onOpen={openFilters}>
        <AppTextField
          allowWhenReadOnly
          autoCapitalize="words"
          label={t('countries.reportNameEn')}
          leadingIcon="search-outline"
          onChangeText={setDraftNameEn}
          onClear={() => setDraftNameEn('')}
          value={draftNameEn}
        />
        <AppTextField
          allowWhenReadOnly
          autoCapitalize="words"
          label={t('countries.reportNameAr')}
          leadingIcon="search-outline"
          onChangeText={setDraftNameAr}
          onClear={() => setDraftNameAr('')}
          value={draftNameAr}
        />
      </AppFilterFormButton>

      <View style={styles.actions}>
        <AppButton
          disabled={!ENV.isApiConfigured || !selectedReport}
          fullWidth
          icon="search-outline"
          loading={generating}
          onPress={() => void generate()}>
          {generating ? t('countries.generatingReport') : t('countries.generateReport')}
        </AppButton>
      </View>

      {generatedReport ? (
        <View style={styles.generated}>
          <AppAlert severity="success">{t('countries.reportReady')}</AppAlert>
          <View style={styles.actions}>
            <AppButton fullWidth icon="print-outline" onPress={() => void openReport(generatedReport)} variant="outline">
              {t('countries.openReport')}
            </AppButton>
            <AppButton fullWidth icon="share-outline" onPress={() => void share()} variant="outline">
              {t('countries.shareReport')}
            </AppButton>
          </View>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: 12 },
  feedback: { gap: 8 },
  actions: { width: '100%', gap: 8 },
  generated: { gap: 8 },
});
