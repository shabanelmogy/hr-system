import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ENV } from '@/src/core/config/env';
import { useLocalization } from '@/src/core/localization';
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
  defaultCountryReport,
  type GeneratedCountryReport,
} from '../api/country-report-api';
import { useCountryReportCatalog } from '../queries/use-country-reports';

export function CountryReportView() {
  const { t } = useTranslation();
  const { isRTL } = useLocalization();
  const language = isRTL ? 'ar' : 'en';
  const catalogQuery = useCountryReportCatalog(language, ENV.isReportApiConfigured);
  const reports = useMemo(
    () => catalogQuery.data?.length ? catalogQuery.data : [defaultCountryReport],
    [catalogQuery.data],
  );
  const [selectedReportId, setSelectedReportId] = useState(defaultCountryReport.Id);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [draftNameAr, setDraftNameAr] = useState('');
  const [draftNameEn, setDraftNameEn] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedCountryReport | null>(null);
  const selectedReport = reports.find((report) => report.Id === selectedReportId) ?? reports[0];

  useEffect(() => () => generatedReport?.dispose(), [generatedReport]);

  const openReport = useCallback(async (report: GeneratedCountryReport) => {
    if (Platform.OS === 'web') {
      window.open(report.uri, '_blank', 'noopener,noreferrer');
      return;
    }
    await Print.printAsync({ uri: report.uri });
  }, []);

  const generate = useCallback(async () => {
    if (!ENV.isReportApiConfigured || !selectedReport) return;
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
    value: report.Id,
    label: language === 'ar' ? report.Title : report.Subject,
    icon: 'document-text-outline' as const,
  })), [language, reports]);

  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      {!ENV.isReportApiConfigured ? (
        <AppAlert severity="warning">{t('countries.reportApiNotConfigured')}</AppAlert>
      ) : null}
      {catalogQuery.isError ? (
        <View style={styles.feedback}>
          <AppAlert severity="warning">{t('countries.reportCatalogError')}</AppAlert>
          <AppButton icon="refresh-outline" onPress={() => void catalogQuery.refetch()} variant="outline">
            {t('common.retry')}
          </AppButton>
        </View>
      ) : null}

      <AppSelectField
        allowWhenReadOnly
        disabled={!ENV.isReportApiConfigured || catalogQuery.isLoading}
        label={t('countries.reportType')}
        leadingIcon="document-text-outline"
        onChange={setSelectedReportId}
        options={reportOptions}
        value={selectedReport?.Id ?? defaultCountryReport.Id}
      />
      <AppFilterFormButton
        activeCount={activeFilterCount}
        buttonLabel={t('countries.searchReport')}
        clearDisabled={!draftNameAr && !draftNameEn}
        disabled={!ENV.isReportApiConfigured}
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
          disabled={!ENV.isReportApiConfigured || !selectedReport}
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
