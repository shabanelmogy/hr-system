import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppStatusBadge, AppText } from '@/src/shared/components';
import {
  ApplicationStage,
  ApplicationStatus,
  EmploymentApplicationDto,
} from '../types';

interface CandidatePipelineCardProps {
  application: EmploymentApplicationDto;
  onPress?: (app: EmploymentApplicationDto) => void;
  onScheduleInterview?: (appId: number) => void;
  onEvaluateInterview?: (appId: number) => void;
  onMakeOffer?: (appId: number, positionId: number, branchId: number, departmentId: number) => void;
  onHire?: (appId: number) => void;
  onMoveStage?: (appId: number, nextStage: ApplicationStage) => void;
}

export function CandidatePipelineCard({
  application,
  onPress,
  onScheduleInterview,
  onEvaluateInterview,
  onMakeOffer,
  onHire,
  onMoveStage,
}: CandidatePipelineCardProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const isArabic = i18n.language.startsWith('ar');

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

  const getStageBadgeProps = () => {
    switch (application.stage) {
      case ApplicationStage.Applied:
        return { label: t('recruitment.stages.applied', 'تم التقديم / Applied'), color: '#3B82F6' };
      case ApplicationStage.Shortlisted:
        return { label: t('recruitment.stages.shortlisted', 'القائمة المختصرة / Shortlisted'), color: '#8B5CF6' };
      case ApplicationStage.Interview:
        return { label: t('recruitment.stages.interview', 'المقابلة / Interview'), color: '#F59E0B' };
      case ApplicationStage.Offer:
        return { label: t('recruitment.stages.offer', 'عرض العمل / Offer'), color: '#06B6D4' };
      case ApplicationStage.Hired:
        return { label: t('recruitment.stages.hired', 'تم التعيين / Hired'), color: theme.colors.success };
      case ApplicationStage.Rejected:
        return { label: t('recruitment.stages.rejected', 'مرفوض / Rejected'), color: theme.colors.danger ?? '#EF4444' };
      default:
        return { label: String(application.stage), color: theme.colors.textMuted };
    }
  };

  const stageBadge = getStageBadgeProps();

  return (
    <Pressable
      onPress={() => onPress?.(application)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Top Header: Candidate Avatar + Name + Stage Badge */}
      <View style={styles.topRow}>
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
              {positionTitle}
            </AppText>
          </View>
        </View>

        <AppStatusBadge label={stageBadge.label} color={stageBadge.color} />
      </View>

      {/* Meta info: Email, Phone, Expected Salary, Rating */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <AppIcon name="mail-outline" size={13} color={theme.colors.textMuted} />
          <AppText variant="caption" style={{ color: theme.colors.textMuted }} numberOfLines={1}>
            {application.candidateEmail}
          </AppText>
        </View>

        {application.averageEvaluationScore ? (
          <View style={[styles.scoreBadge, { backgroundColor: '#FEF3C7' }]}>
            <AppIcon name="star" size={12} color="#D97706" />
            <AppText variant="caption" weight="800" style={{ color: '#D97706' }}>
              {application.averageEvaluationScore}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* Action buttons row based on current stage */}
      <View style={styles.actionRow}>
        {onMoveStage && application.status === ApplicationStatus.Submitted && (
          <AppButton
            size="sm"
            variant="outline"
            icon="arrow-forward-outline"
            onPress={() => onMoveStage(application.id, ApplicationStage.Shortlisted)}
          >
            {t('recruitment.actions.shortlist', 'ترشيح / Shortlist')}
          </AppButton>
        )}

        {onScheduleInterview &&
          (application.status === ApplicationStatus.Shortlisted ||
            application.stage === ApplicationStage.Shortlisted) && (
          <AppButton
            size="sm"
            variant="outline"
            icon="calendar-outline"
            onPress={() => onScheduleInterview(application.id)}
          >
            {t('recruitment.actions.scheduleInterview', 'مقابلة / Interview')}
          </AppButton>
        )}

        {onEvaluateInterview &&
          (application.status === ApplicationStatus.InterviewScheduled ||
            application.status === ApplicationStatus.Interviewed ||
            application.stage === ApplicationStage.Interview) && (
          <AppButton
            size="sm"
            variant="outline"
            icon="ribbon-outline"
            onPress={() => onEvaluateInterview(application.id)}
          >
            {t('recruitment.actions.evaluate', 'تقييم / Evaluate')}
          </AppButton>
        )}

        {onMakeOffer &&
          (application.status === ApplicationStatus.Interviewed ||
            application.stage === ApplicationStage.Interview) && (
          <AppButton
            size="sm"
            variant="outline"
            icon="mail-outline"
            onPress={() =>
              onMakeOffer(
                application.id,
                application.jobOpeningId,
                1,
                1
              )
            }
          >
            {t('recruitment.actions.makeOffer', 'عرض عمل / Offer')}
          </AppButton>
        )}

        {onHire &&
          (application.stage === ApplicationStage.Offer ||
            application.status === ApplicationStatus.OfferIssued ||
            application.status === ApplicationStatus.OfferAccepted) && (
          <AppButton
            size="sm"
            variant="primary"
            icon="checkmark-circle-outline"
            onPress={() => onHire(application.id)}
          >
            {t('recruitment.actions.hireCandidate', 'تعيين كموظف / Hire')}
          </AppButton>
        )}

        <AppButton
          size="sm"
          variant="outline"
          icon="eye-outline"
          onPress={() => onPress?.(application)}
        >
          {t('common.details', 'التفاصيل / Details')}
        </AppButton>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000010',
  },
});
