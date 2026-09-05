"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { RecruitmentStageConfig } from "../../types/recruitmentSettingsTypes";

const PRESET_COLORS = [
  "#1976d2", // Blue
  "#ed6c02", // Orange
  "#9c27b0", // Purple
  "#0288d1", // Light Blue
  "#5c6bc0", // Indigo
  "#ff9800", // Amber
  "#009688", // Teal
  "#2e7d32", // Green
  "#d32f2f", // Red
  "#795548", // Brown
];

interface StageEditDialogProps {
  open: boolean;
  stage: RecruitmentStageConfig | null;
  onClose: () => void;
  onSave: (stageData: Omit<RecruitmentStageConfig, "id">) => void;
}

export default function StageEditDialog({ open, stage, onClose, onSave }: StageEditDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [sequence, setSequence] = useState(10);
  const [color, setColor] = useState("#1976d2");
  const [foldedInKanban, setFoldedInKanban] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");

  useEffect(() => {
    if (stage) {
      setNameAr(stage.nameAr);
      setNameEn(stage.nameEn);
      setSequence(stage.sequence);
      setColor(stage.color);
      setFoldedInKanban(stage.foldedInKanban);
      setSendEmailNotification(stage.sendEmailNotification);
      setEmailTemplate(stage.emailTemplate || "");
    } else {
      setNameAr("");
      setNameEn("");
      setSequence(10);
      setColor("#1976d2");
      setFoldedInKanban(false);
      setSendEmailNotification(false);
      setEmailTemplate("");
    }
  }, [stage, open]);

  const handleSave = () => {
    onSave({
      nameAr: nameAr.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      sequence: Number(sequence) || 10,
      color,
      foldedInKanban,
      isDefault: stage?.isDefault || false,
      sendEmailNotification,
      emailTemplate: emailTemplate.trim() || undefined,
      mappedStatus: stage?.mappedStatus || 3,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {stage
          ? t("recruitment.settings.editStage", "تعديل مرحلة التعيين")
          : t("recruitment.settings.addStage", "إضافة مرحلة تعيين جديدة")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.stageNameAr", "اسم المرحلة (بالعربية)")}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.stageNameEn", "اسم المرحلة (بالإنجليزية)")}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t("recruitment.settings.sequence", "الترتيب التسلسلي")}
              value={sequence}
              onChange={(e) => setSequence(Number(e.target.value))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              {t("recruitment.settings.stageColor", "لون تمييز المرحلة")}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
              {PRESET_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: c,
                    cursor: "pointer",
                    border: color === c ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.15s ease",
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={foldedInKanban}
                  onChange={(e) => setFoldedInKanban(e.target.checked)}
                />
              }
              label={t(
                "recruitment.settings.foldInKanban",
                "طوي العمود افتراضياً في لوحة الكانبان (Folded in Kanban)"
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  color="primary"
                />
              }
              label={t(
                "recruitment.settings.autoEmail",
                "إرسال إشعار بريدي تلقائي للمرشح عند نقله لهذه المرحلة"
              )}
            />
          </Grid>

          {sendEmailNotification && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("recruitment.settings.emailTemplate", "نص قالب البريد الإلكتروني التلقائي")}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder="أدخل نص الرسالة التي ستصل للمرشح..."
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel", "إلغاء")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!nameAr.trim() && !nameEn.trim()}
          sx={{ fontWeight: 600 }}
        >
          {t("common.save", "حفظ")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
