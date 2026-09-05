"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useTranslation } from "react-i18next";
import type { RecruitmentStageConfig } from "../../types/recruitmentSettingsTypes";
import StageEditDialog from "./StageEditDialog";

interface StagesSettingsTabProps {
  stages: RecruitmentStageConfig[];
  onAddStage: (stage: Omit<RecruitmentStageConfig, "id">) => void;
  onUpdateStage: (id: string, updates: Partial<RecruitmentStageConfig>) => void;
  onDeleteStage: (id: string) => void;
}

export default function StagesSettingsTab({
  stages,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
}: StagesSettingsTabProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<RecruitmentStageConfig | null>(null);

  const handleOpenAdd = () => {
    setSelectedStage(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (stage: RecruitmentStageConfig) => {
    setSelectedStage(stage);
    setDialogOpen(true);
  };

  const handleSave = (stageData: Omit<RecruitmentStageConfig, "id">) => {
    if (selectedStage) {
      onUpdateStage(selectedStage.id, stageData);
    } else {
      onAddStage(stageData);
    }
  };

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
            {t("recruitment.settings.stagesTitle", "مراحل مسار التعيين والكانبان (Pipeline Stages)")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(
              "recruitment.settings.stagesSubtitle",
              "تخصيص أعمدة لوحة الكانبان وترتيبها، وإعداد قوالب الإشعارات البريدية التلقائية لكل مرحلة مثل أودو"
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          {t("recruitment.settings.newStageBtn", "إضافة مرحلة جديدة")}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t(
          "recruitment.settings.stagesHint",
          "ملاحظة: يمكنك ضبط الترتيب التسلسلي للمراحل ليظهر في أعمدة لوحة المتابعة من البداية حتى التعيين، وتحديد المراحل التي ترغب في إرسال بريد تلقائي للمرشح فور وصوله إليها."
        )}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {stages.map((stg, index) => (
          <Card
            key={stg.id}
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2,
              borderLeft: isArabic ? undefined : `5px solid ${stg.color}`,
              borderRight: isArabic ? `5px solid ${stg.color}` : undefined,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DragIndicatorIcon sx={{ color: "text.disabled", cursor: "grab" }} />
              <Chip
                label={`#${index + 1}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, minWidth: 36 }}
              />
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: stg.color,
                }}
              />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {isArabic ? stg.nameAr : stg.nameEn}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    ({isArabic ? stg.nameEn : stg.nameAr})
                  </Typography>
                  {stg.isDefault && (
                    <Chip
                      label={t("recruitment.settings.defaultStage", "افتراضية")}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("recruitment.settings.seqNumber", "الترتيب التسلسلي")}: {stg.sequence}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {stg.sendEmailNotification && (
                <Tooltip
                  title={
                    stg.emailTemplate ||
                    t("recruitment.settings.autoEmailActive", "إشعار بريد تلقائي مفعل")
                  }
                >
                  <Chip
                    icon={<EmailOutlinedIcon />}
                    label={t("recruitment.settings.autoEmailChip", "إيميل تلقائي")}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </Tooltip>
              )}

              {stg.foldedInKanban && (
                <Chip
                  icon={<ViewColumnOutlinedIcon />}
                  label={t("recruitment.settings.foldedChip", "مطوية في الكانبان")}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                />
              )}

              <IconButton
                size="small"
                onClick={() => handleOpenEdit(stg)}
                sx={{ color: "primary.main" }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>

              {!stg.isDefault && (
                <IconButton
                  size="small"
                  onClick={() => onDeleteStage(stg.id)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Card>
        ))}
      </Box>

      {/* Stage Dialog */}
      <StageEditDialog
        open={dialogOpen}
        stage={selectedStage}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
