import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppText, showToast } from '@/src/shared/components';
import { useCompleteInterview, useEvaluateInterview, useScorecardTemplate } from '../queries/use-recruitment';
import {
  InterviewEvaluationRecommendation,
  type InterviewSkillEvaluationDto,
  type JobSkillDto,
} from '../types';

interface InterviewEvaluationModalProps {
  visible: boolean;
  interviewId: number | null;
  candidateName?: string;
  positionTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SkillRatingState {
  skillName: string;
  score: number;
  weightPercentage: number;
  isMandatory: boolean;
  proficiencyLevel: string;
  notes: string;
}

export function InterviewEvaluationModal({
  visible,
  interviewId,
  candidateName,
  positionTitle,
  onClose,
  onSuccess,
}: InterviewEvaluationModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const completeMutation = useCompleteInterview();
  const evaluateMutation = useEvaluateInterview();

  const { data: template, isLoading: isTemplateLoading } = useScorecardTemplate(
    interviewId ?? 0
  );

  const [ratings, setRatings] = useState<SkillRatingState[]>([]);
  const [recommendation, setRecommendation] = useState<InterviewEvaluationRecommendation>(
    InterviewEvaluationRecommendation.Hire
  );
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (template?.skills && template.skills.length > 0) {
      setRatings(
        template.skills.map((skill: JobSkillDto) => ({
          skillName: skill.skillName,
          score: 3,
          weightPercentage: skill.defaultWeightPercentage || Math.round(100 / template.skills.length),
          isMandatory: skill.isMandatory,
          proficiencyLevel: skill.proficiencyLevel,
          notes: '',
        }))
      );
    }
  }, [template]);

  const handleScoreChange = (index: number, score: number) => {
    setRatings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, score } : item))
    );
  };

  const totalWeight = ratings.reduce((sum, r) => sum + r.weightPercentage, 0);
  const weightedScore =
    totalWeight > 0
      ? ratings.reduce((sum, r) => sum + r.score * r.weightPercentage, 0) / totalWeight
      : 0;

  const hasFailedMandatory = ratings.some((r) => r.isMandatory && r.score < 3);

  const recommendations = [
    { id: InterviewEvaluationRecommendation.StrongHire, label: t('recruitment.recommendations.strongHire', 'توصية قوية / Strong Hire') },
    { id: InterviewEvaluationRecommendation.Hire, label: t('recruitment.recommendations.hire', 'قبول / Hire') },
    { id: InterviewEvaluationRecommendation.Hold, label: t('recruitment.recommendations.hold', 'معلق / Hold') },
    { id: InterviewEvaluationRecommendation.NoHire, label: t('recruitment.recommendations.noHire', 'عدم قبول / No Hire') },
  ];

  const handleSubmit = async () => {
    if (!interviewId) return;

    try {
      try {
        await completeMutation.mutateAsync(interviewId);
      } catch {
        // Continue if already marked complete
      }

      const skillEvaluations: InterviewSkillEvaluationDto[] = ratings.map((r) => ({
        skillName: r.skillName,
        score: r.score,
        weightPercentage: r.weightPercentage,
        isMandatory: r.isMandatory,
        notes: r.notes.trim() || undefined,
      }));

      await evaluateMutation.mutateAsync({
        id: interviewId,
        request: {
          score: Math.round(weightedScore * 10) / 10,
          recommendation,
          comments: comments.trim() || undefined,
          skillEvaluations,
        },
      });

      showToast.success(t('recruitment.evaluation.submittedSuccess', 'تم تسجيل تقييم المقابلة بنجاح'));
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء تسجيل التقييم'));
    }
  };

  const isSubmitting = completeMutation.isPending || evaluateMutation.isPending;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <AppIcon name="ribbon-outline" size={22} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <AppText variant="titleSmall" weight="800">
                  {t('recruitment.evaluation.dialogTitle', 'بطاقة تقييم المقابلة / Scorecard')}
                </AppText>
                <AppText variant="caption" color="muted">
                  {candidateName || template?.candidateName || ''} {positionTitle ? `• ${positionTitle}` : ''}
                </AppText>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppIcon name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Score Summary Box */}
            <View style={[styles.scoreBanner, { backgroundColor: `${theme.colors.primary}12`, borderColor: theme.colors.primary }]}>
              <View>
                <AppText variant="caption" color="muted">
                  {t('recruitment.evaluation.weightedScore', 'التقييم الموزون')}
                </AppText>
                <AppText variant="titleSmall" weight="800" color="primary">
                  {weightedScore.toFixed(1)} / 5.0
                </AppText>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <AppIcon
                    key={star}
                    name={star <= Math.round(weightedScore) ? 'star' : 'star-outline'}
                    size={20}
                    color={theme.colors.primary}
                  />
                ))}
              </View>
            </View>

            {hasFailedMandatory && (
              <View style={[styles.warningBanner, { backgroundColor: `${theme.colors.warning}15`, borderColor: theme.colors.warning }]}>
                <AppIcon name="alert-circle-outline" size={18} color={theme.colors.warning} />
                <AppText variant="caption" color="warning" weight="700" style={{ flex: 1 }}>
                  {t('recruitment.evaluation.mandatoryWarning', 'تنبيه: مهارة إلزامية حصلت على أقل من 3')}
                </AppText>
              </View>
            )}

            {/* Skills List */}
            <AppText variant="label" weight="800" style={{ marginTop: 12, marginBottom: 8 }}>
              {t('recruitment.evaluation.skillsTitle', 'تقييم المهارات الموزونة للوظيفة')}
            </AppText>

            {ratings.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.skillCard,
                  {
                    borderColor: item.isMandatory && item.score < 3 ? theme.colors.warning : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <View style={styles.skillHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <AppText variant="bodySmall" weight="800">
                        {item.skillName}
                      </AppText>
                      {item.isMandatory && (
                        <View style={[styles.badge, { backgroundColor: `${theme.colors.danger}20` }]}>
                          <AppText variant="caption" color="danger" weight="800" style={{ fontSize: 10 }}>
                            {t('recruitment.skills.mandatory', 'إلزامي')}
                          </AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption" color="muted">
                      {t('recruitment.skills.weight', 'الوزن')}: {item.weightPercentage}% • {item.proficiencyLevel}
                    </AppText>
                  </View>

                  {/* Rating Selector */}
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Pressable
                        key={val}
                        onPress={() => handleScoreChange(idx, val)}
                        style={[
                          styles.ratingPill,
                          {
                            backgroundColor: item.score >= val ? theme.colors.primary : `${theme.colors.border}40`,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          weight="800"
                          style={{
                            color: item.score >= val ? '#fff' : theme.colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          {val}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            ))}

            {/* Recommendation */}
            <AppText variant="label" weight="800" style={{ marginTop: 14, marginBottom: 8 }}>
              {t('recruitment.evaluation.recommendation', 'التوصية بالتعيين')}
            </AppText>
            <View style={styles.chipsRow}>
              {recommendations.map((rec) => {
                const selected = recommendation === rec.id;
                return (
                  <Pressable
                    key={rec.id}
                    onPress={() => setRecommendation(rec.id)}
                    style={[
                      styles.recChip,
                      {
                        backgroundColor: selected ? theme.colors.primary : `${theme.colors.border}30`,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={selected ? '800' : '600'}
                      style={{ color: selected ? '#fff' : theme.colors.text }}
                    >
                      {rec.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* General Comments */}
            <AppText variant="label" weight="800" style={{ marginTop: 14, marginBottom: 6 }}>
              {t('recruitment.evaluation.generalComments', 'ملاحظات المقيم')}
            </AppText>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              multiline
              numberOfLines={3}
              placeholder={t('recruitment.evaluation.commentsPlaceholder', 'انطباع المقابلة ونقاط القوة والضعف...')}
              placeholderTextColor={theme.colors.textMuted}
              value={comments}
              onChangeText={setComments}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <AppButton variant="outline" onPress={onClose} style={styles.footerBtn}>
              {t('common.cancel', 'إلغاء')}
            </AppButton>
            <AppButton
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.footerBtn}
            >
              {t('recruitment.evaluation.submit', 'حفظ التقييم')}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  body: {
    padding: 16,
  },
  scoreBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  skillCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 5,
  },
  ratingPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBtn: {
    flex: 1,
  },
});
