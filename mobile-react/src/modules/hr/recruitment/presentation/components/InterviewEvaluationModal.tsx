import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppModal, AppStateView, AppText, showToast } from '@/src/shared/components';
import { useCompleteInterview, useEvaluateInterview, useScorecardTemplate } from '../queries/use-recruitment';
import {
  InterviewEvaluationRecommendation,
  InterviewStatus,
  type InterviewDto,
  type InterviewSkillEvaluationDto,
  type JobSkillDto,
} from '../../domain/models/recruitment';

interface InterviewEvaluationModalProps {
  visible: boolean;
  interview: InterviewDto | null;
  canManageApplications: boolean;
  canEvaluateInterviews: boolean;
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
  interview,
  canManageApplications,
  canEvaluateInterviews,
  onClose,
  onSuccess,
}: InterviewEvaluationModalProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const completeMutation = useCompleteInterview();
  const evaluateMutation = useEvaluateInterview();
  const [completedInterviewId, setCompletedInterviewId] = useState<number | null>(null);

  const scorecardQuery = useScorecardTemplate(
    interview?.id ?? 0
  );
  const template = scorecardQuery.data;

  const templateKey = useMemo(
    () => `${interview?.id ?? 0}:${template?.interviewId ?? 0}:${(template?.skills ?? [])
      .map((skill) => `${skill.skillName}:${skill.defaultWeightPercentage}:${skill.isMandatory}`)
      .join('|')}`,
    [interview?.id, template]
  );
  const defaultRatings = useMemo<SkillRatingState[]>(
    () => (template?.skills ?? []).map((skill: JobSkillDto) => ({
      skillName: skill.skillName,
      score: 3,
      weightPercentage: skill.defaultWeightPercentage || Math.round(100 / (template?.skills.length || 1)),
      isMandatory: skill.isMandatory,
      proficiencyLevel: skill.proficiencyLevel,
      notes: '',
    })),
    [template]
  );
  // Keep edits local while deriving a fresh scorecard whenever the interview or
  // template changes. This avoids an effect-driven setState race during modal
  // transitions and guarantees stale ratings cannot leak into another interview.
  const [ratingsState, setRatingsState] = useState<{ key: string; values: SkillRatingState[] }>({ key: '', values: [] });
  const ratings = ratingsState.key === templateKey ? ratingsState.values : defaultRatings;
  const [recommendationState, setRecommendationState] = useState<{ key: string; value: InterviewEvaluationRecommendation }>({ key: '', value: InterviewEvaluationRecommendation.Hire });
  const recommendation = recommendationState.key === templateKey ? recommendationState.value : InterviewEvaluationRecommendation.Hire;
  const [commentsState, setCommentsState] = useState<{ key: string; value: string }>({ key: '', value: '' });
  const comments = commentsState.key === templateKey ? commentsState.value : '';

  const handleScoreChange = (index: number, score: number) => {
    setRatingsState({
      key: templateKey,
      values: ratings.map((item, i) => (i === index ? { ...item, score } : item)),
    });
  };

  const totalWeight = ratings.reduce((sum, r) => sum + r.weightPercentage, 0);
  const weightedScore =
    totalWeight > 0
      ? ratings.reduce((sum, r) => sum + r.score * r.weightPercentage, 0) / totalWeight
      : 0;

  const hasFailedMandatory = ratings.some((r) => r.isMandatory && r.score < 3);

  const recommendations = [
    { id: InterviewEvaluationRecommendation.StrongHire, label: t('recruitment.recommendations.strongHire') },
    { id: InterviewEvaluationRecommendation.Hire, label: t('recruitment.recommendations.hire') },
    { id: InterviewEvaluationRecommendation.Hold, label: t('recruitment.recommendations.hold') },
    { id: InterviewEvaluationRecommendation.NoHire, label: t('recruitment.recommendations.noHire') },
  ];

  const interviewCanBeEvaluated = canEvaluateInterviews && (interview?.status === InterviewStatus.Completed || (
    interview?.status === InterviewStatus.Scheduled &&
    (canManageApplications || completedInterviewId === interview.id)
  ));
  const templateMatchesInterview = !!interview && !!template && template.interviewId === interview.id;
  const templateReady = templateMatchesInterview && template.skills.length > 0;

  const handleSubmit = async () => {
    if (!interview || !interviewCanBeEvaluated || !templateReady) return;

    try {
      if (
        interview.status === InterviewStatus.Scheduled &&
        completedInterviewId !== interview.id
      ) {
        if (!canManageApplications) return;
        await completeMutation.mutateAsync(interview.id);
        setCompletedInterviewId(interview.id);
      }

      const skillEvaluations: InterviewSkillEvaluationDto[] = ratings.map((r) => ({
        skillName: r.skillName,
        score: r.score,
        weightPercentage: r.weightPercentage,
        isMandatory: r.isMandatory,
        notes: r.notes.trim() || null,
      }));

      await evaluateMutation.mutateAsync({
        id: interview.id,
        request: {
          score: Math.round(weightedScore * 10) / 10,
          recommendation,
          comments: comments.trim() || undefined,
          skillEvaluations,
        },
      });

      showToast.success(t('recruitment.evaluation.submittedSuccess'));
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast.error(error, t('common.error'));
    }
  };

  const isSubmitting = completeMutation.isPending || evaluateMutation.isPending;

  const positionTitle = interview
    ? (i18n.language.startsWith('ar') ? interview.positionTitleAr : interview.positionTitleEn)
    : '';

  return (
    <AppModal
      closeDisabled={isSubmitting}
      closeLabel={t('common.close')}
      contentContainerStyle={styles.body}
      footer={(
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <AppButton disabled={isSubmitting} variant="outline" onPress={onClose} style={styles.footerBtn}>
            {t('common.cancel')}
          </AppButton>
          <AppButton
            disabled={!interviewCanBeEvaluated || !templateReady}
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.footerBtn}
          >
            {t('recruitment.evaluation.submit')}
          </AppButton>
        </View>
      )}
      icon="ribbon-outline"
      onClose={onClose}
      subtitle={interview ? `${interview.candidateName} · ${positionTitle}` : undefined}
      title={t('recruitment.evaluation.dialogTitle')}
      visible={visible}
    >
      {scorecardQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : scorecardQuery.isError || (template && !templateMatchesInterview) ? (
        <AppStateView
          message={t('feedback.unknownError')}
          onRetry={() => { void scorecardQuery.refetch(); }}
          state="error"
        />
      ) : !templateReady ? (
        <AppStateView
          message={t('recruitment.evaluation.noScorecardSkills')}
          state="empty"
        />
      ) : (
      <>
            {/* Score Summary Box */}
            <View style={[styles.scoreBanner, { backgroundColor: `${theme.colors.primary}12`, borderColor: theme.colors.primary }]}>
              <View>
                <AppText variant="caption" color="muted">
                  {t('recruitment.evaluation.weightedScore')}
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
                  {t('recruitment.evaluation.mandatoryWarning')}
                </AppText>
              </View>
            )}

            {/* Skills List */}
            <AppText variant="label" weight="800" style={{ marginTop: 12, marginBottom: 8 }}>
              {t('recruitment.evaluation.skillsTitle')}
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
                            {t('recruitment.skills.mandatory')}
                          </AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption" color="muted">
                      {t('recruitment.skills.weight')}: {item.weightPercentage}% • {item.proficiencyLevel}
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
              {t('recruitment.evaluation.recommendation')}
            </AppText>
            <View style={styles.chipsRow}>
              {recommendations.map((rec) => {
                const selected = recommendation === rec.id;
                return (
                  <Pressable
                    key={rec.id}
                    onPress={() => setRecommendationState({ key: templateKey, value: rec.id })}
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
              {t('recruitment.evaluation.generalComments')}
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
              placeholder={t('recruitment.evaluation.commentsPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={comments}
              onChangeText={(value) => setCommentsState({ key: templateKey, value })}
            />
      </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
    paddingBottom: 8,
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
