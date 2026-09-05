import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppText, ConfirmationDialog, showToast } from '@/src/shared/components';
import { useHireCandidate } from '../queries/use-recruitment';
import {
  ApplicationStatus,
  EmploymentApplicationDto,
} from '../types';
import { useRecruitmentPermissions } from '../hooks/use-recruitment-permissions';

interface CandidateDetailModalProps {
  application: EmploymentApplicationDto | null;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CandidateDetailModal({
  application,
  visible,
  onClose,
  onSuccess,
}: CandidateDetailModalProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const perms = useRecruitmentPermissions();
  const isArabic = i18n.language.startsWith('ar');
  const hireMutation = useHireCandidate();

  const [confirmHireVisible, setConfirmHireVisible] = useState(false);

  if (!application) return null;

  const positionTitle = isArabic
    ? application.positionTitleAr
    : application.positionTitleEn;

  const initials = application.candidateName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleConfirmHire = async () => {
    try {
      await hireMutation.mutateAsync({
        id: application.id,
        hireDate: new Date().toISOString().split('T')[0],
        notes: 'Hired directly through Mobile Recruitment Portal',
      });

      showToast.success(t('recruitment.candidate.hiredSuccess', 'تم تعيين المرشح بنجاح كموظف رسمي!'));
      setConfirmHireVisible(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء التعيين'));
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.candidateHeader}>
                <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <AppText variant="titleSmall" weight="800" style={{ color: theme.colors.primary }}>
                    {initials}
                  </AppText>
                </View>
                <View style={styles.nameBlock}>
                  <AppText variant="titleSmall" weight="800">
                    {application.candidateName}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                    {positionTitle} • {application.openingNumber}
                  </AppText>
                </View>
              </View>

              <Pressable onPress={onClose} style={styles.closeBtn}>
                <AppIcon name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            {/* Scrollable details */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              {/* Contact Information */}
              <View style={[styles.section, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
                <AppText variant="label" weight="800" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                  {t('recruitment.candidate.contactInfo', 'معلومات الاتصال / Contact Info')}
                </AppText>

                <View style={styles.infoRow}>
                  <AppIcon name="mail-outline" size={16} color={theme.colors.textMuted} />
                  <AppText variant="bodySmall">{application.candidateEmail}</AppText>
                </View>

                {application.candidatePhone && (
                  <View style={styles.infoRow}>
                    <AppIcon name="call-outline" size={16} color={theme.colors.textMuted} />
                    <AppText variant="bodySmall">{application.candidatePhone}</AppText>
                  </View>
                )}

                {application.expectedSalary && (
                  <View style={styles.infoRow}>
                    <AppIcon name="cash-outline" size={16} color={theme.colors.textMuted} />
                    <AppText variant="bodySmall">
                      {t('recruitment.candidate.salary', 'الراتب المتوقع')}: {application.expectedSalary}{' '}
                      {application.expectedSalaryCurrencyCode}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Cover Letter */}
              {application.coverLetter && (
                <View style={[styles.section, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
                  <AppText variant="label" weight="800" style={{ color: theme.colors.primary, marginBottom: 6 }}>
                    {t('recruitment.candidate.coverLetter', 'خطاب التقديم / Cover Letter')}
                  </AppText>
                  <AppText variant="bodySmall" style={{ color: theme.colors.text }}>
                    {application.coverLetter}
                  </AppText>
                </View>
              )}

              {/* Scorecard / Evaluation summary */}
              <View style={[styles.section, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
                <AppText variant="label" weight="800" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                  {t('recruitment.candidate.evaluations', 'تقييم المقابلات / Scorecard')}
                </AppText>

                {application.averageEvaluationScore ? (
                  <View style={styles.scoreRow}>
                    <AppIcon name="star" size={20} color="#D97706" />
                    <AppText variant="titleSmall" weight="800" style={{ color: "#D97706" }}>
                      {application.averageEvaluationScore} / 5.0
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                    {t('recruitment.candidate.noEvaluations', 'لم يتم تسجيل تقييمات بعد')}
                  </AppText>
                )}
              </View>

              {/* Stage Timeline */}
              {application.timeline && application.timeline.length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
                  <AppText variant="label" weight="800" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    {t('recruitment.candidate.statusTimeline', 'سجل المراحل / Timeline')}
                  </AppText>

                  {application.timeline.map((item, idx) => (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
                      <View style={styles.timelineContent}>
                        <AppText variant="caption" weight="700">
                          {ApplicationStatus[item.fromStatus]} → {ApplicationStatus[item.toStatus]}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.colors.textMuted }}>
                          {new Date(item.changedOn).toLocaleString(i18n.language)}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer Action: One-Click Hire Candidate */}
            <View style={styles.footer}>
              <AppButton variant="outline" onPress={onClose}>
                {t('common.close', 'إغلاق / Close')}
              </AppButton>

              {application.status !== ApplicationStatus.Hired && perms.canHire && (
                <AppButton
                  variant="primary"
                  icon="checkmark-circle-outline"
                  onPress={() => setConfirmHireVisible(true)}
                >
                  {t('recruitment.actions.hireCandidate', 'تعيين كموظف / Hire Candidate')}
                </AppButton>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog for Hiring */}
      <ConfirmationDialog
        visible={confirmHireVisible}
        title={t('recruitment.candidate.confirmHireTitle', 'تأكيد التعيين')}
        description={t(
          'recruitment.candidate.confirmHire',
          'هل أنت متأكد من تعيين هذا المرشح كموظف رسمي في المنشأة؟'
        )}
        confirmLabel={t('recruitment.actions.hireCandidate', 'تعيين الآن')}
        loading={hireMutation.isPending}
        tone="default"
        onConfirm={handleConfirmHire}
        onCancel={() => setConfirmHireVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000015',
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 12,
    paddingVertical: 8,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000015',
  },
});
