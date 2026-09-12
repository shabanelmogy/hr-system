"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Typography,
  Card,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Snackbar,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { MySelect, MyTextField } from "@/shared/components/forms";
import type { RecruitmentGeneralSettings } from "../../types/recruitmentSettingsTypes";
import {
  createGeneralSettingsSchema,
  type GeneralSettingsFormData,
  type GeneralSettingsFormInput,
} from "../../validation/recruitmentValidation";

const CURRENCY_CODES = ["EGP", "SAR", "AED", "USD", "EUR"] as const;
const PROBATION_MONTHS = [1, 3, 6] as const;

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
  const schema = useMemo(() => createGeneralSettingsSchema(t), [t]);
  const defaultValues = useMemo<GeneralSettingsFormInput>(() => ({
    ...settings,
    inboundEmailAlias: settings.inboundEmailAlias ?? "",
  }), [settings]);
  const currencyOptions = useMemo(() => CURRENCY_CODES.map((code) => ({
    id: code,
    name: t(`recruitment.settings.currencies.${code.toLowerCase()}`),
  })), [t]);
  const probationOptions = useMemo(() => PROBATION_MONTHS.map((months) => ({
    id: months,
    name: t(`recruitment.settings.probationOptions.${months === 1 ? "one" : months === 3 ? "three" : "six"}`),
  })), [t]);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<
    GeneralSettingsFormInput,
    unknown,
    GeneralSettingsFormData
  >({ resolver: zodResolver(schema), defaultValues });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleSave = (data: GeneralSettingsFormData) => {
    onUpdateSettings({
      ...data,
      inboundEmailAlias: data.inboundEmailAlias || undefined,
    });
    setSnackbarOpen(true);
  };

  const handleReset = () => {
    onResetAll();
    setResetDialogOpen(false);
    setSnackbarOpen(true);
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

      <Card
        component="form"
        noValidate
        onSubmit={handleSubmit(handleSave)}
        variant="outlined"
        sx={{ p: 3, borderRadius: 2, mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control}
              errors={errors}
              name="defaultCurrency"
              label={t("recruitment.settings.defaultCurrency", "العملة الافتراضية للرواتب والعروض")}
              dataSource={currencyOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="offerExpiryDays"
              type="number"
              label={t("recruitment.settings.offerExpiryDays", "مدة صلاحية العرض الوظيفي الافتراضية (بالأيام)")}
              minValue={1}
              maxValue={365}
              helperText={t("recruitment.settings.offerExpiryHint", "المدة المتاحة للمرشح للموافقة على العرض قبل انتهائه آلياً")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control}
              errors={errors}
              name="defaultProbationMonths"
              label={t("recruitment.settings.probationMonths", "فترة التجربة الافتراضية بعقد العمل")}
              dataSource={probationOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="inboundEmailAlias"
              type="email"
              label={t("recruitment.settings.inboundEmail", "بريد استقبال السير الذاتية الآلي (Job Email Alias)")}
              helperText={t("recruitment.settings.inboundEmailHint", "مثل أودو: السير الذاتية المرسلة لهذا البريد تتحول تلقائياً لطلبات تقديم")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name="autoPublishOpening"
              render={({ field }) => <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} color="primary" />}
                label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t("recruitment.settings.autoPublishLabel", "النشر التلقائي للشاغر عند اعتماد طلب الاحتياج")}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{t("recruitment.settings.autoPublishDesc", "إنشاء شاغر وظيفي ونشره على لوحة التوظيف فوراً بمجرد اعتماد طلب الاحتياج")}</Typography></Box>}
              />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name="enforceHeadcountCapacity"
              render={({ field }) => <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} color="warning" />}
                label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t("recruitment.settings.headcountStrictLabel", "التحقق الصارم من السعة المتبقية (Headcount Protection)")}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{t("recruitment.settings.headcountStrictDesc", "منع تعيين أي مرشح في حال اكتمال العدد المطلوب للشاغر وإغلاقه آلياً")}</Typography></Box>}
              />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              control={control}
              name="enablePublicPortal"
              render={({ field }) => <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} color="success" />}
                label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t("recruitment.settings.publicPortalLabel", "تفعيل بوابة التقديم الخارجية للجمهور (Public Careers Portal)")}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{t("recruitment.settings.publicPortalDesc", "إتاحة التقديم المباشر للمرشحين ورفع السيرة الذاتية عبر رابط الشركة الخارجي")}</Typography></Box>}
              />}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            type="button"
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={() => setResetDialogOpen(true)}
          >
            {t("recruitment.settings.resetDefaults", "استعادة الإعدادات الافتراضية")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
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
      <ConfirmationDialog
        open={resetDialogOpen}
        title={t("recruitment.settings.resetDefaults")}
        description={t("recruitment.settings.confirmReset")}
        confirmLabel={t("recruitment.settings.resetDefaults")}
        cancelLabel={t("actions.cancel")}
        confirmColor="error"
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleReset}
      />
    </Box>
  );
}
