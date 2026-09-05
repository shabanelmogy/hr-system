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
import type { RecruitmentSourceConfig } from "../../types/recruitmentSettingsTypes";

interface SourceEditDialogProps {
  open: boolean;
  source: RecruitmentSourceConfig | null;
  onClose: () => void;
  onSave: (data: Omit<RecruitmentSourceConfig, "id">) => void;
}

export default function SourceEditDialog({
  open,
  source,
  onClose,
  onSave,
}: SourceEditDialogProps) {
  const { t } = useTranslation();

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [type, setType] = useState<RecruitmentSourceConfig["type"]>("portal");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (source) {
      setNameAr(source.nameAr);
      setNameEn(source.nameEn);
      setType(source.type);
      setIsActive(source.isActive);
    } else {
      setNameAr("");
      setNameEn("");
      setType("portal");
      setIsActive(true);
    }
  }, [source, open]);

  const handleSave = () => {
    onSave({
      nameAr: nameAr.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      type,
      isActive,
      applicationsCount: source?.applicationsCount || 0,
      hiredCount: source?.hiredCount || 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {source
          ? t("recruitment.settings.editSource", "تعديل قناة ومصدر الاستقطاب")
          : t("recruitment.settings.addSource", "إضافة قناة ومصدر استقطاب جديد")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.sourceNameAr", "اسم القناة (بالعربية)")}
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.sourceNameEn", "اسم القناة (بالإنجليزية)")}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label={t("recruitment.settings.sourceType", "نوع القناة / المنصة")}
              value={type}
              onChange={(e) => setType(e.target.value as RecruitmentSourceConfig["type"])}
            >
              <MenuItem value="portal">{t("recruitment.settings.typePortal", "بوابة التوظيف الرسمية / موقع ويب")}</MenuItem>
              <MenuItem value="social">{t("recruitment.settings.typeSocial", "شبكات مهنية واجتماعية (LinkedIn, إلخ)")}</MenuItem>
              <MenuItem value="referral">{t("recruitment.settings.typeReferral", "ترشيح من موظفي الشركة (Employee Referral)")}</MenuItem>
              <MenuItem value="agency">{t("recruitment.settings.typeAgency", "مكتب أو وكالة توظيف خارجية (Headhunter)")}</MenuItem>
              <MenuItem value="fair">{t("recruitment.settings.typeFair", "معارض توظيف وجامعات (Job Fair)")}</MenuItem>
              <MenuItem value="other">{t("recruitment.settings.typeOther", "أخرى")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="success"
                />
              }
              label={t("recruitment.settings.sourceActive", "القناة نشطة ومتاحة في استمارة التقديم")}
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
          disabled={!nameAr.trim() && !nameEn.trim()}
          sx={{ fontWeight: 600 }}
        >
          {t("common.save", "حفظ")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
