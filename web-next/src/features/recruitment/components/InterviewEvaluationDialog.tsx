"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";
import { MyForm } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import {
  useCompleteInterview,
  useInterviewScorecardTemplate,
  useSubmitInterviewEvaluation,
} from "../hooks/useRecruitment";
import {
  InterviewRecommendation,
  type InterviewSkillEvaluationDto,
  type JobSkillDto,
} from "../types";

interface InterviewEvaluationDialogProps {
  open: boolean;
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

export default function InterviewEvaluationDialog({
  open,
  interviewId,
  candidateName,
  positionTitle,
  onClose,
  onSuccess,
}: InterviewEvaluationDialogProps) {
  const { t } = useTranslation();
  const completeMutation = useCompleteInterview();
  const submitMutation = useSubmitInterviewEvaluation();

  const { data: template, isLoading: isTemplateLoading } =
    useInterviewScorecardTemplate(interviewId ?? 0, {
      enabled: open && !!interviewId,
    });

  const [ratings, setRatings] = useState<SkillRatingState[]>([]);
  const [recommendation, setRecommendation] = useState<InterviewRecommendation>(
    InterviewRecommendation.Hire
  );
  const [comments, setComments] = useState("");

  // Initialize scorecard when template loads
  useEffect(() => {
    if (template?.skills && template.skills.length > 0) {
      setRatings(
        template.skills.map((skill: JobSkillDto) => ({
          skillName: skill.skillName,
          score: 3,
          weightPercentage: skill.defaultWeightPercentage || Math.round(100 / template.skills.length),
          isMandatory: skill.isMandatory,
          proficiencyLevel: skill.proficiencyLevel,
          notes: "",
        }))
      );
    }
  }, [template]);

  const handleScoreChange = (index: number, newScore: number) => {
    setRatings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, score: newScore } : item))
    );
  };

  const handleNotesChange = (index: number, newNotes: string) => {
    setRatings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes: newNotes } : item))
    );
  };

  // Calculate live weighted score
  const totalWeight = ratings.reduce((sum, r) => sum + r.weightPercentage, 0);
  const weightedScore =
    totalWeight > 0
      ? ratings.reduce((sum, r) => sum + r.score * r.weightPercentage, 0) /
        totalWeight
      : 0;

  const hasFailedMandatorySkill = ratings.some(
    (r) => r.isMandatory && r.score < 3
  );

  const recommendationOptions = [
    {
      id: InterviewRecommendation.StrongHire,
      name: t("recruitment.recommendations.strongHire", "توصية قوية بالتعيين / Strong Hire"),
    },
    {
      id: InterviewRecommendation.Hire,
      name: t("recruitment.recommendations.hire", "يوصى بالتعيين / Hire"),
    },
    {
      id: InterviewRecommendation.Hold,
      name: t("recruitment.recommendations.hold", "معلق للمقارنة / Hold"),
    },
    {
      id: InterviewRecommendation.NoHire,
      name: t("recruitment.recommendations.noHire", "لا يوصى بالتعيين / No Hire"),
    },
    {
      id: InterviewRecommendation.StrongNoHire,
      name: t("recruitment.recommendations.strongNoHire", "رفض قاطع / Strong No Hire"),
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewId) return;

    try {
      // First ensure interview is marked completed
      try {
        await completeMutation.mutateAsync(interviewId);
      } catch {
        // Ignored if already completed
      }

      const skillEvaluations: InterviewSkillEvaluationDto[] = ratings.map((r) => ({
        skillName: r.skillName,
        score: r.score,
        weightPercentage: r.weightPercentage,
        isMandatory: r.isMandatory,
        notes: r.notes.trim() || undefined,
      }));

      await submitMutation.mutateAsync({
        interviewId,
        data: {
          score: Math.round(weightedScore * 10) / 10,
          recommendation,
          comments: comments.trim() || undefined,
          skillEvaluations,
        },
      });

      showToast.success(
        t("recruitment.evaluation.submittedSuccess", "تم تسجيل تقييم المقابلة بنجاح وحفظ بطاقة التقييم")
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast.error(
        err,
        t("recruitment.evaluation.submitFailed", "حدث خطأ أثناء حفظ تقييم المقابلة")
      );
    }
  };

  const isSubmitting = completeMutation.isPending || submitMutation.isPending;

  return (
    <MyForm
      open={open}
      title={t("recruitment.evaluation.dialogTitle", "بطاقة تقييم المقابلة الشخصية / Interview Scorecard")}
      subtitle={
        (candidateName || template?.candidateName)
          ? `${candidateName || template?.candidateName} - ${
              positionTitle || template?.positionTitleAr || template?.positionTitleEn || ""
            }`
          : t("recruitment.evaluation.dialogSubtitle", "تقييم مهارات المرشح وتقديم التوصية الرسمية")
      }
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {/* Candidate & Weighted Score Banner */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "primary.50",
            border: "1px solid",
            borderColor: "primary.200",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
              {t("recruitment.evaluation.candidateName", "المرشح")}:{" "}
              {candidateName || template?.candidateName || `#${interviewId}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {positionTitle ||
                template?.positionTitleAr ||
                template?.positionTitleEn ||
                t("recruitment.evaluation.position", "المنصب الشاغر")}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              {t("recruitment.evaluation.weightedScore", "التقييم الموزون الإجمالي")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 800 }}>
                {weightedScore.toFixed(1)} / 5.0
              </Typography>
              <Rating
                value={weightedScore}
                precision={0.1}
                readOnly
                size="small"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
            </Box>
          </Box>
        </Box>

        {hasFailedMandatorySkill && (
          <Alert severity="warning">
            {t(
              "recruitment.evaluation.mandatoryWarning",
              "تنبيه: حصل المرشح على درجة أقل من 3 في إحدى المهارات الإلزامية المطلوبة للوظيفة."
            )}
          </Alert>
        )}

        {isTemplateLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("recruitment.evaluation.skillsTitle", "تقييم المهارات الموزونة (مستمدة من بطاقة الوصف الوظيفي)")}
            </Typography>

            {ratings.map((item, idx) => (
              <Card
                key={idx}
                variant="outlined"
                sx={{
                  borderColor: item.isMandatory && item.score < 3 ? "warning.main" : "divider",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.skillName}
                        </Typography>
                        {item.isMandatory && (
                          <Chip
                            size="small"
                            color="error"
                            label={t("recruitment.skills.mandatory", "إلزامي / Required")}
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        )}
                        <Chip
                          size="small"
                          variant="outlined"
                          label={item.proficiencyLevel}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t("recruitment.skills.weight", "الوزن النسبي")}: {item.weightPercentage}%
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                        <Rating
                          name={`score-${idx}`}
                          value={item.score}
                          onChange={(_, val) => handleScoreChange(idx, val || 1)}
                          size="medium"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 35 }}>
                          {item.score} / 5
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        name={`notes-${idx}`}
                        label={t("recruitment.skills.interviewerNotes", "ملاحظات على مهارة ") + item.skillName}
                        value={item.notes}
                        onChange={(e) => handleNotesChange(idx, e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Divider />

        {/* Final Recommendation & General Notes */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t("recruitment.evaluation.finalDecision", "القرار والتوصية النهائية")}
        </Typography>

        <FormControl fullWidth size="small">
          <InputLabel id="rec-label">
            {t("recruitment.evaluation.recommendation", "التوصية النهائية بالتعيين")}
          </InputLabel>
          <Select
            labelId="rec-label"
            value={recommendation}
            label={t("recruitment.evaluation.recommendation", "التوصية النهائية بالتعيين")}
            onChange={(e) => setRecommendation(Number(e.target.value))}
          >
            {recommendationOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          name="comments"
          label={t("recruitment.evaluation.generalComments", "ملاحظات المقابلة وملخص نقاط القوة والضعف")}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          multiline
          rows={3}
          fullWidth
          placeholder={t("recruitment.evaluation.commentsPlaceholder", "اكتب هنا انطباع المقيم وملخص الكفاءة الفنية والشخصية...")}
        />
      </Stack>
    </MyForm>
  );
}
