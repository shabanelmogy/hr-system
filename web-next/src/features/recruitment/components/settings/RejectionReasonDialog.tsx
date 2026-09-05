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
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { RejectionReasonConfig } from "../../types/recruitmentSettingsTypes";

interface RejectionReasonDialogProps {
  open: boolean;
  reason: RejectionReasonConfig | null;
  onClose: () => void;
  onSave: (data: Omit<RejectionReasonConfig, "id">) => void;
}

export default function RejectionReasonDialog({
  open,
  reason,
  onClose,
  onSave,
}: RejectionReasonDialogProps) {
  const { t } = useTranslation();

  const [reasonAr, setReasonAr] = useState("");
  const [reasonEn, setReasonEn] = useState("");
  const [category, setCategory] = useState<RejectionReasonConfig["category"]>("qualifications");
  const [sendAutoEmail, setSendAutoEmail] = useState(false);
  const [emailSubjectAr, setEmailSubjectAr] = useState("");
  const [emailSubjectEn, setEmailSubjectEn] = useState("");
  const [emailBodyAr, setEmailBodyAr] = useState("");
  const [emailBodyEn, setEmailBodyEn] = useState("");

  useEffect(() => {
    if (reason) {
      setReasonAr(reason.reasonAr);
      setReasonEn(reason.reasonEn);
      setCategory(reason.category);
      setSendAutoEmail(reason.sendAutoEmail);
      setEmailSubjectAr(reason.emailSubjectAr || "");
      setEmailSubjectEn(reason.emailSubjectEn || "");
      setEmailBodyAr(reason.emailBodyAr || "");
      setEmailBodyEn(reason.emailBodyEn || "");
    } else {
      setReasonAr("");
      setReasonEn("");
      setCategory("qualifications");
      setSendAutoEmail(true);
      setEmailSubjectAr("تحديث بخصوص طلب التوظيف");
      setEmailSubjectEn("Update regarding your application");
      setEmailBodyAr("نشكرك على اهتمامك ووقتك معنا، ونعتذر عن عدم المضي قدماً في طلبك لهذه الفرصة...");
      setEmailBodyEn("Thank you for your interest and time. We regret that we are unable to proceed with your application at this time...");
    }
  }, [reason, open]);

  const handleSave = () => {
    onSave({
      reasonAr: reasonAr.trim() || reasonEn.trim(),
      reasonEn: reasonEn.trim() || reasonAr.trim(),
      category,
      sendAutoEmail,
      emailSubjectAr: sendAutoEmail ? emailSubjectAr.trim() : undefined,
      emailSubjectEn: sendAutoEmail ? emailSubjectEn.trim() : undefined,
      emailBodyAr: sendAutoEmail ? emailBodyAr.trim() : undefined,
      emailBodyEn: sendAutoEmail ? emailBodyEn.trim() : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {reason
          ? t("recruitment.settings.editReason", "تعديل سبب الاستبعاد / الرفض")
          : t("recruitment.settings.addReason", "إضافة سبب استبعاد / رفض جديد")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.reasonAr", "سبب الرفض (بالعربية)")}
              value={reasonAr}
              onChange={(e) => setReasonAr(e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.reasonEn", "سبب الرفض (بالإنجليزية)")}
              value={reasonEn}
              onChange={(e) => setReasonEn(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label={t("recruitment.settings.reasonCategory", "تصنيف سبب الرفض")}
              value={category}
              onChange={(e) => setCategory(e.target.value as RejectionReasonConfig["category"])}
            >
              <MenuItem value="qualifications">{t("recruitment.settings.catQuals", "المؤهلات والخبرات الفنية")}</MenuItem>
              <MenuItem value="salary">{t("recruitment.settings.catSalary", "الراتب والميزانية")}</MenuItem>
              <MenuItem value="behavioral">{t("recruitment.settings.catBehavioral", "السلوك والثقافة المؤسسية")}</MenuItem>
              <MenuItem value="candidate_withdrew">{t("recruitment.settings.catWithdrew", "انسحاب أو اعتذار المرشح")}</MenuItem>
              <MenuItem value="other">{t("recruitment.settings.catOther", "أسباب أخرى / عدم الحضور")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendAutoEmail}
                  onChange={(e) => setSendAutoEmail(e.target.checked)}
                  color="primary"
                />
              }
              label={t(
                "recruitment.settings.sendPoliteEmail",
                "إرسال رسالة اعتذار مهنية تلقائية للمرشح عند اختيار هذا السبب (مثل أودو)"
              )}
            />
          </Grid>

          {sendAutoEmail && (
            <>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main", mb: 0.5 }}>
                  {t("recruitment.settings.emailTemplateTitle", "قالب رسالة الاعتذار التلقائية للمرشح:")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("recruitment.settings.emailSubjectAr", "عنوان البريد (بالعربية)")}
                  value={emailSubjectAr}
                  onChange={(e) => setEmailSubjectAr(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t("recruitment.settings.emailBodyAr", "نص الرسالة (بالعربية)")}
                  value={emailBodyAr}
                  onChange={(e) => setEmailBodyAr(e.target.value)}
                />
              </Grid>
            </>
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
          disabled={!reasonAr.trim() && !reasonEn.trim()}
          sx={{ fontWeight: 600 }}
        >
          {t("common.save", "حفظ")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
