"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Divider,
  Snackbar,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SecurityIcon from "@mui/icons-material/Security";
import { useTranslation } from "react-i18next";
import type { RecruitmentGeneralSettings } from "../../types/recruitmentSettingsTypes";

interface GeneralGovernanceTabProps {
  settings: RecruitmentGeneralSettings;
  onUpdateSettings: (updates: Partial<RecruitmentGeneralSettings>) => void;
  onResetAll: () => void;
}

export default function GeneralGovernanceTab({
  settings,
  onUpdateSettings,
  onResetAll,
}: GeneralGovernanceTabProps) {
  const { t } = useTranslation();

  const [formState, setFormState] = useState<RecruitmentGeneralSettings>({ ...settings });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSave = () => {
    onUpdateSettings(formState);
    setSnackbarOpen(true);
  };

  const handleReset = () => {
    if (window.confirm(t("recruitment.settings.confirmReset", "هل أنت متأكد من استعادة كافة إعدادات التوظيف الافتراضية؟"))) {
      onResetAll();
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("recruitment.settings.generalTitle", "الإعدادات العامة وسياسات الحوكمة (General Governance)")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t(
            "recruitment.settings.generalSubtitle",
            "ضبط القواعد والسياسات المؤسسية للرواتب، السعة، صلاحيات العروض، والربط التلقائي"
          )}
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Default Currency */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t("recruitment.settings.defaultCurrency", "العملة الافتراضية للرواتب والعروض")}
              value={formState.defaultCurrency}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, defaultCurrency: e.target.value }))
              }
            >
              <MenuItem value="EGP">EGP - الجنيه المصري</MenuItem>
              <MenuItem value="SAR">SAR - الريال السعودي</MenuItem>
              <MenuItem value="AED">AED - الدرهم الإماراتي</MenuItem>
              <MenuItem value="USD">USD - الدولار الأمريكي</MenuItem>
              <MenuItem value="EUR">EUR - اليورو</MenuItem>
            </TextField>
          </Grid>

          {/* Offer Expiry Days */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t("recruitment.settings.offerExpiryDays", "مدة صلاحية العرض الوظيفي الافتراضية (بالأيام)")}
              value={formState.offerExpiryDays}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, offerExpiryDays: Number(e.target.value) || 7 }))
              }
              helperText={t("recruitment.settings.offerExpiryHint", "المدة المتاحة للمرشح للموافقة على العرض قبل انتهائه آلياً")}
            />
          </Grid>

          {/* Probation Months */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t("recruitment.settings.probationMonths", "فترة التجربة الافتراضية بعقد العمل")}
              value={formState.defaultProbationMonths}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, defaultProbationMonths: Number(e.target.value) }))
              }
            >
              <MenuItem value={1}>شهر واحد (1 Month)</MenuItem>
              <MenuItem value={3}>3 أشهر (3 Months - المعتاد قانوناً)</MenuItem>
              <MenuItem value={6}>6 أشهر (6 Months)</MenuItem>
            </TextField>
          </Grid>

          {/* Inbound Email Alias */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("recruitment.settings.inboundEmail", "بريد استقبال السير الذاتية الآلي (Job Email Alias)")}
              value={formState.inboundEmailAlias || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, inboundEmailAlias: e.target.value }))
              }
              helperText={t("recruitment.settings.inboundEmailHint", "مثل أودو: السير الذاتية المرسلة لهذا البريد تتحول تلقائياً لطلبات تقديم")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.autoPublishOpening}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, autoPublishOpening: e.target.checked }))
                  }
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t("recruitment.settings.autoPublishLabel", "النشر التلقائي للشاغر عند اعتماد طلب الاحتياج")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("recruitment.settings.autoPublishDesc", "إنشاء شاغر وظيفي ونشره على لوحة التوظيف فوراً بمجرد اعتماد طلب الاحتياج")}
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.enforceHeadcountCapacity}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, enforceHeadcountCapacity: e.target.checked }))
                  }
                  color="warning"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t("recruitment.settings.headcountStrictLabel", "التحقق الصارم من السعة المتبقية (Headcount Protection)")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("recruitment.settings.headcountStrictDesc", "منع تعيين أي مرشح في حال اكتمال العدد المطلوب للشاغر وإغلاقه آلياً")}
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.enablePublicPortal}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, enablePublicPortal: e.target.checked }))
                  }
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t("recruitment.settings.publicPortalLabel", "تفعيل بوابة التقديم الخارجية للجمهور (Public Careers Portal)")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("recruitment.settings.publicPortalDesc", "إتاحة التقديم المباشر للمرشحين ورفع السيرة الذاتية عبر رابط الشركة الخارجي")}
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            {t("recruitment.settings.resetDefaults", "استعادة الإعدادات الافتراضية")}
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {t("common.saveChanges", "حفظ كافة التغييرات")}
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={t("recruitment.settings.savedSuccess", "تم حفظ إعدادات وسياسات التوظيف بنجاح!")}
      />
    </Box>
  );
}
