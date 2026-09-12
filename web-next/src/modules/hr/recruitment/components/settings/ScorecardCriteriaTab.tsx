"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Alert,
  Rating,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useTranslation } from "react-i18next";
import type { EvaluationCriterionConfig } from "../../types/recruitmentSettingsTypes";
import CriterionEditDialog from "./CriterionEditDialog";

interface ScorecardCriteriaTabProps {
  criteria: EvaluationCriterionConfig[];
  onAddCriterion: (data: Omit<EvaluationCriterionConfig, "id">) => void;
  onUpdateCriterion: (id: string, updates: Partial<EvaluationCriterionConfig>) => void;
  onDeleteCriterion: (id: string) => void;
}

export default function ScorecardCriteriaTab({
  criteria,
  onAddCriterion,
  onUpdateCriterion,
  onDeleteCriterion,
}: ScorecardCriteriaTabProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<EvaluationCriterionConfig | null>(null);

  const handleOpenAdd = () => {
    setSelectedCriterion(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (crit: EvaluationCriterionConfig) => {
    setSelectedCriterion(crit);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<EvaluationCriterionConfig, "id">) => {
    if (selectedCriterion) {
      onUpdateCriterion(selectedCriterion.id, data);
    } else {
      onAddCriterion(data);
    }
  };

  const getCategoryLabel = (cat: EvaluationCriterionConfig["category"]) => {
    switch (cat) {
      case "technical":
        return t("recruitment.settings.critTech", "الكفاءة الفنية والمهنية");
      case "communication":
        return t("recruitment.settings.critComm", "التواصل والتعبير");
      case "problem_solving":
        return t("recruitment.settings.critProblem", "حل المشكلات والتحليل");
      case "culture":
        return t("recruitment.settings.critCulture", "ثقافة وقيم المؤسسة");
      case "leadership":
        return t("recruitment.settings.critLead", "القيادة والعمل الجماعي");
      default:
        return cat;
    }
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("recruitment.settings.criteriaTitle", "بطاقات ومعايير التقييم الرقمية (Interview Scorecards)")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(
              "recruitment.settings.criteriaSubtitle",
              "تحديد البنود المعيارية لتقييم المقابلات وتوزيع أوزانها النسبية لحساب المتوسط العام للمرشح تلقائياً"
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          {t("recruitment.settings.newCriterionBtn", "إضافة معيار تقييم")}
        </Button>
      </Box>

      <Alert
        severity={totalWeight === 100 ? "success" : "info"}
        sx={{ mb: 3 }}
      >
        {t("recruitment.settings.weightSumInfo", "إجمالي الأوزان النسبية الحالية:")}{" "}
        <strong>{totalWeight}%</strong>{" "}
        {totalWeight !== 100 && (
          <span>{t("recruitment.settings.weightSumNotice", "(يُفضل أن يكون مجموع الأوزان 100% لدقة التقييم النهائي)")}</span>
        )}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {criteria.map((c) => (
          <Card
            key={c.id}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <FactCheckOutlinedIcon sx={{ color: "primary.main" }} />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {isArabic ? c.titleAr : c.titleEn}
                    </Typography>
                    <Chip
                      label={getCategoryLabel(c.category)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                    />
                    {c.isMandatory && (
                      <Chip
                        label={t("recruitment.settings.mandatoryChip", "إلزامي")}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ fontSize: "0.72rem", fontWeight: 700 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {isArabic ? c.titleEn : c.titleAr}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenEdit(c)}
                  sx={{ color: "primary.main" }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDeleteCriterion(c.id)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {c.descriptionAr && (
              <Typography variant="body2" sx={{ color: "text.secondary", pl: 4 }}>
                {isArabic ? c.descriptionAr : c.descriptionEn || c.descriptionAr}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "background.neutral",
                p: 1.5,
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {t("recruitment.settings.scaleLabel", "مقياس الدرجات:")}
                </Typography>
                <Rating
                  value={5}
                  max={5}
                  readOnly
                  size="small"
                  emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  (1 - 5 {t("recruitment.settings.stars", "نجوم")})
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 160 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {t("recruitment.settings.weightLabel", "الوزن:")} {c.weight}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(c.weight * 2, 100)}
                  sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Criterion Dialog */}
      <CriterionEditDialog
        open={dialogOpen}
        criterion={selectedCriterion}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
