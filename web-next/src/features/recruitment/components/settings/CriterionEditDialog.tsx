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
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { EvaluationCriterionConfig } from "../../types/recruitmentSettingsTypes";

interface CriterionEditDialogProps {
  open: boolean;
  criterion: EvaluationCriterionConfig | null;
  onClose: () => void;
  onSave: (data: Omit<EvaluationCriterionConfig, "id">) => void;
}

export default function CriterionEditDialog({
  open,
  criterion,
  onClose,
  onSave,
}: CriterionEditDialogProps) {
  const { t } = useTranslation();

  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [category, setCategory] = useState<EvaluationCriterionConfig["category"]>("technical");
  const [weight, setWeight] = useState(20);
  const [isMandatory, setIsMandatory] = useState(true);

  useEffect(() => {
    if (criterion) {
      setTitleAr(criterion.titleAr);
      setTitleEn(criterion.titleEn);
      setDescriptionAr(criterion.descriptionAr || "");
      setDescriptionEn(criterion.descriptionEn || "");
      setCategory(criterion.category);
      setWeight(criterion.weight);
      setIsMandatory(criterion.isMandatory);
    } else {
      setTitleAr("");
      setTitleEn("");
      setDescriptionAr("");
      setDescriptionEn("");
      setCategory("technical");
      setWeight(20);
      setIsMandatory(true);
    }
  }, [criterion, open]);

  const handleSave = () => {
    onSave({
      titleAr: titleAr.trim() || titleEn.trim(),
      titleEn: titleEn.trim() || titleAr.trim(),
      descriptionAr: descriptionAr.trim() || undefined,
      descriptionEn: descriptionEn.trim() || undefined,
      category,
      maxScore: 5,
      weight: Number(weight) || 20,
      isMandatory,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {criterion
          ? t("recruitment.settings.editCriterion", "تعديل معيار تقييم المقابلة")
          : t("recruitment.settings.addCriterion", "إضافة معيار تقييم جديد")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.criterionTitleAr", "عنوان المعيار (بالعربية)")}
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.criterionTitleEn", "عنوان المعيار (بالإنجليزية)")}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t("recruitment.settings.criterionCategory", "تصنيف المعيار")}
              value={category}
              onChange={(e) => setCategory(e.target.value as EvaluationCriterionConfig["category"])}
            >
              <MenuItem value="technical">{t("recruitment.settings.critTech", "الكفاءة الفنية والمهنية")}</MenuItem>
              <MenuItem value="communication">{t("recruitment.settings.critComm", "التواصل والتعبير")}</MenuItem>
              <MenuItem value="problem_solving">{t("recruitment.settings.critProblem", "حل المشكلات والتحليل")}</MenuItem>
              <MenuItem value="culture">{t("recruitment.settings.critCulture", "ثقافة وقيم المؤسسة")}</MenuItem>
              <MenuItem value="leadership">{t("recruitment.settings.critLead", "القيادة والعمل الجماعي")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t("recruitment.settings.criterionWeight", "الوزن النسبي (%)")}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t("recruitment.settings.criterionDescAr", "وصف وإرشادات التقييم للمحاور")}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="ما الذي يجب على المحاور التركيز عليه لقياس هذا المعيار؟"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  color="primary"
                />
              }
              label={t(
                "recruitment.settings.mandatoryCriterion",
                "معيار إلزامي (يجب على كل مقيّم رصد درجة له لإنهاء المقابلة)"
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel", "إلغاء")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!titleAr.trim() && !titleEn.trim()}
          sx={{ fontWeight: 600 }}
        >
          {t("common.save", "حفظ")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
