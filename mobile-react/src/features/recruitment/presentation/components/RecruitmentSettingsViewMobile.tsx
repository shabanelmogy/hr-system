import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppStatusBadge, AppText, showToast } from '@/src/shared/components';
import {
  useRecruitmentSettings,
  useUpdateRecruitmentSettings,
} from '../queries/use-recruitment';
import {
  DEFAULT_STAGES,
  DEFAULT_REASONS,
  DEFAULT_SOURCES,
  DEFAULT_CRITERIA,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_RECRUITMENT_SETTINGS,
} from '../constants/recruitmentDefaults';
import type {
  RecruitmentSettingsDto,
  RecruitmentStageConfig,
  RejectionReasonConfig,
  RecruitmentSourceConfig,
  EvaluationCriterionConfig,
} from '../types';

export function RecruitmentSettingsViewMobile() {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const isArabic = i18n.language.startsWith('ar');

  const [activeSection, setActiveSection] = useState<'stages' | 'reasons' | 'sources' | 'criteria' | 'general'>('stages');

  const { data: settings, isLoading, refetch } = useRecruitmentSettings();
  const updateSettingsMutation = useUpdateRecruitmentSettings();

  const stages = (settings?.stages && settings.stages.length > 0) ? settings.stages : DEFAULT_STAGES;
  const reasons = (settings?.rejectionReasons && settings.rejectionReasons.length > 0) ? settings.rejectionReasons : DEFAULT_REASONS;
  const sources = (settings?.sources && settings.sources.length > 0) ? settings.sources : DEFAULT_SOURCES;
  const criteria = (settings?.evaluationCriteria && settings.evaluationCriteria.length > 0) ? settings.evaluationCriteria : DEFAULT_CRITERIA;
  const general = settings?.general ?? DEFAULT_GENERAL_SETTINGS;

  const handleResetDefaults = async () => {
    try {
      await updateSettingsMutation.mutateAsync(DEFAULT_RECRUITMENT_SETTINGS);
      showToast.success(t('recruitment.settings.resetSuccess', 'تمت استعادة الإعدادات الافتراضية بنجاح'));
    } catch (e) {
      showToast.error(e, t('common.error', 'حدث خطأ'));
    }
  };

  const sections: { id: typeof activeSection; label: string; icon: string; count?: number }[] = [
    { id: 'stages', label: t('recruitment.settings.tabStages', 'مراحل الكانبان'), icon: 'layers-outline', count: stages.length },
    { id: 'reasons', label: t('recruitment.settings.tabReasons', 'أسباب الرفض'), icon: 'close-circle-outline', count: reasons.length },
    { id: 'sources', label: t('recruitment.settings.tabSources', 'قنوات الاستقطاب'), icon: 'globe-outline', count: sources.length },
    { id: 'criteria', label: t('recruitment.settings.tabCriteria', 'معايير التقييم'), icon: 'checkbox-outline', count: criteria.length },
    { id: 'general', label: t('recruitment.settings.tabGeneral', 'الإعدادات العامة'), icon: 'settings-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="titleSmall" weight="800">
          {t('recruitment.settings.title', 'إعدادات وتهيئة التوظيف')}
        </AppText>
        <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
          {t('recruitment.settings.subtitle', 'تخصيص مراحل التعيين وأسباب الرفض والمعايير مثل أودو')}
        </AppText>
      </View>

      {/* Section Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
        <View style={styles.sectionChipsRow}>
          {sections.map((sec) => {
            const isSelected = activeSection === sec.id;
            return (
              <Pressable
                key={sec.id}
                onPress={() => setActiveSection(sec.id)}
                style={[
                  styles.sectionChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <AppIcon
                  name={sec.icon as any}
                  size={14}
                  color={isSelected ? '#fff' : theme.colors.textMuted}
                />
                <AppText
                  variant="caption"
                  weight={isSelected ? '700' : '500'}
                  style={{ color: isSelected ? '#fff' : theme.colors.text }}
                >
                  {sec.label} {sec.count !== undefined ? `(${sec.count})` : ''}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Section 1: Stages */}
      {activeSection === 'stages' && (
        <View style={styles.listContainer}>
          {stages.map((stg, idx) => (
            <View
              key={stg.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRightColor: isArabic ? stg.color : theme.colors.border,
                  borderLeftColor: !isArabic ? stg.color : theme.colors.border,
                  borderRightWidth: isArabic ? 4 : 1,
                  borderLeftWidth: !isArabic ? 4 : 1,
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.row}>
                  <View style={[styles.seqBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <AppText variant="caption" weight="800" style={{ color: theme.colors.primary }}>
                      #{idx + 1}
                    </AppText>
                  </View>
                  <AppText variant="body" weight="700">
                    {isArabic ? stg.nameAr : stg.nameEn}
                  </AppText>
                </View>

                {stg.isDefault && (
                  <AppStatusBadge label={t('recruitment.settings.defaultStage', 'افتراضية')} color={theme.colors.primary} />
                )}
              </View>

              <View style={styles.tagRow}>
                {stg.sendEmailNotification && (
                  <View style={[styles.miniTag, { backgroundColor: `${theme.colors.secondary}15` }]}>
                    <AppIcon name="mail-outline" size={12} color={theme.colors.secondary} />
                    <AppText variant="caption" style={{ color: theme.colors.secondary, fontSize: 11 }}>
                      {t('recruitment.settings.autoEmailChip', 'إيميل تلقائي')}
                    </AppText>
                  </View>
                )}
                {stg.foldedInKanban && (
                  <View style={[styles.miniTag, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <AppText variant="caption" style={{ color: theme.colors.textMuted, fontSize: 11 }}>
                      {t('recruitment.settings.foldedChip', 'مطوية')}
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Section 2: Rejection Reasons */}
      {activeSection === 'reasons' && (
        <View style={styles.listContainer}>
          {reasons.map((r) => (
            <View
              key={r.id}
              style={[
                styles.itemCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.itemHeader}>
                <AppText variant="body" weight="700" style={{ flex: 1 }}>
                  {isArabic ? r.reasonAr : r.reasonEn}
                </AppText>
              </View>
              {r.sendAutoEmail && (
                <View style={[styles.miniTag, { backgroundColor: `${theme.colors.success}15`, marginTop: 6, alignSelf: 'flex-start' }]}>
                  <AppIcon name="checkmark-circle-outline" size={12} color={theme.colors.success} />
                  <AppText variant="caption" style={{ color: theme.colors.success, fontSize: 11 }}>
                    {t('recruitment.settings.autoEmailActive', 'اعتذار آلي مهني')}
                  </AppText>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Section 3: Sources */}
      {activeSection === 'sources' && (
        <View style={styles.listContainer}>
          {sources.map((src) => {
            const rate = src.applicationsCount > 0 ? Math.round((src.hiredCount / src.applicationsCount) * 100) : 0;
            return (
              <View
                key={src.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.itemHeader}>
                  <AppText variant="body" weight="700">
                    {isArabic ? src.nameAr : src.nameEn}
                  </AppText>
                  <AppStatusBadge
                    label={src.isActive ? t('common.active', 'نشطة') : t('common.inactive', 'معطلة')}
                    color={src.isActive ? theme.colors.success : theme.colors.textMuted}
                  />
                </View>
                <View style={[styles.metricsRow, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                    {t('recruitment.settings.metricApps', 'المتقدمين')}: <AppText variant="caption" weight="700">{src.applicationsCount}</AppText>
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                    {t('recruitment.settings.metricHired', 'المعينين')}: <AppText variant="caption" weight="700" style={{ color: theme.colors.success }}>{src.hiredCount}</AppText>
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                    {t('recruitment.settings.metricConversion', 'النجاح')}: <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>{rate}%</AppText>
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Section 4: Criteria */}
      {activeSection === 'criteria' && (
        <View style={styles.listContainer}>
          {criteria.map((c) => (
            <View
              key={c.id}
              style={[
                styles.itemCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.itemHeader}>
                <AppText variant="body" weight="700" style={{ flex: 1 }}>
                  {isArabic ? c.titleAr : c.titleEn}
                </AppText>
                <View style={[styles.weightBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <AppText variant="caption" weight="800" style={{ color: theme.colors.primary }}>
                    {c.weight}%
                  </AppText>
                </View>
              </View>
              {c.isMandatory && (
                <AppText variant="caption" weight="700" style={{ color: theme.colors.danger, marginTop: 4 }}>
                  • {t('recruitment.settings.mandatoryChip', 'إلزامي للتقييم')}
                </AppText>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Section 5: General */}
      {activeSection === 'general' && (
        <View style={styles.listContainer}>
          <View style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.policyRow}>
              <AppText variant="body" weight="700">
                {t('recruitment.settings.defaultCurrency', 'العملة الافتراضية')}
              </AppText>
              <AppText variant="body" weight="800" style={{ color: theme.colors.primary }}>
                {general?.defaultCurrency || 'EGP'}
              </AppText>
            </View>

            <View style={styles.policyRow}>
              <AppText variant="body" weight="700">
                {t('recruitment.settings.offerExpiryDays', 'صلاحية العرض (أيام)')}
              </AppText>
              <AppText variant="body" weight="800" style={{ color: theme.colors.primary }}>
                {general?.offerExpiryDays || 7} {t('common.days', 'أيام')}
              </AppText>
            </View>

            <View style={styles.policyRow}>
              <AppText variant="body" weight="700">
                {t('recruitment.settings.probationMonths', 'فترة التجربة')}
              </AppText>
              <AppText variant="body" weight="800" style={{ color: theme.colors.primary }}>
                {general?.defaultProbationMonths || 3} {t('common.months', 'أشهر')}
              </AppText>
            </View>

            <View style={styles.policyRow}>
              <AppText variant="body" weight="700">
                {t('recruitment.settings.autoPublishLabel', 'النشر التلقائي للشاغر')}
              </AppText>
              <AppText variant="body" weight="800" style={{ color: theme.colors.success }}>
                {t('common.enabled', 'مفعل')}
              </AppText>
            </View>

            <View style={{ marginTop: 14 }}>
              <AppButton
                variant="outline"
                icon="refresh-outline"
                loading={updateSettingsMutation.isPending}
                onPress={handleResetDefaults}
              >
                {t('recruitment.settings.resetToDefaults', 'استعادة الإعدادات الافتراضية')}
              </AppButton>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  sectionScroll: {
    marginBottom: 14,
  },
  sectionChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContainer: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seqBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  miniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
});
