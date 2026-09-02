"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField } from "@/shared/components/forms";
import {
  getJobDescriptionApprovalSchema,
  getJobDescriptionRejectionSchema,
} from "../validation/organizationalStructureSchema";

type DecisionMode = "approve" | "reject";
interface DecisionValues { effectiveDate: string; expiryDate: string; reason: string }
interface Props {
  open: boolean;
  mode: DecisionMode;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: DecisionValues) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function JobDescriptionDecisionDialog({ open, mode, loading, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const schema = mode === "approve" ? getJobDescriptionApprovalSchema(t) : getJobDescriptionRejectionSchema(t);
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<DecisionValues>({
    resolver: zodResolver(schema) as unknown as Resolver<DecisionValues>,
    defaultValues: { effectiveDate: today(), expiryDate: "", reason: "" },
  });
  useEffect(() => {
    if (open) reset({ effectiveDate: today(), expiryDate: "", reason: "" });
  }, [mode, open, reset]);
  const errorMessages = Object.fromEntries(Object.entries(errors).flatMap(([key, error]) =>
    error?.message ? [[key, String(error.message)]] : []));

  return <MyForm
    open={open} onClose={onClose} maxWidth="sm" isSubmitting={loading} isDirty={isDirty}
    title={t(`organizationalStructure.decision.${mode}Title`)}
    subtitle={t("organizationalStructure.decision.subtitle")}
    submitButtonText={t(`organizationalStructure.decision.${mode}`)}
    onSubmit={handleSubmit(onSubmit)} autoFocusFirst errors={errorMessages}
    overlayActionType={mode} overlayMessage={t("organizationalStructure.decision.saving")}
  >
    <Box sx={{ display: "grid" }}>
      {mode === "approve" ? <>
        <MyTextField fieldName="effectiveDate" labelKey={t("organizationalStructure.fields.effectiveDate")} control={control} errors={errors} loading={loading} type="date" showCounter={false} />
        <MyTextField fieldName="expiryDate" labelKey={t("organizationalStructure.fields.expiryDate")} control={control} errors={errors} loading={loading} type="date" showCounter={false} />
      </> : <MyTextField fieldName="reason" labelKey={t("organizationalStructure.fields.decisionReason")} control={control} errors={errors} loading={loading} multiline rows={4} maxLength={1000} />}
    </Box>
  </MyForm>;
}
