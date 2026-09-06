"use client";

import { useFiscalYear, useFiscalYearLookup } from "@/features/finance/fiscal-years";
import { useOrganizationalLookup } from "@/features/basic-data/organizational-structure/management";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, ArrowDownward, ArrowUpward, Delete } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type Path,
  type Resolver,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { WorkforcePlanDetail, WorkforcePlanMutationRequest } from "../types/WorkforcePlan";
import { getWorkforcePlanSchema, type WorkforcePlanFormValues } from "../validation/workforcePlanValidation";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  item?: WorkforcePlanDetail | null;
  revisions?: WorkforcePlanDetail[];
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
  onSubmit: (request: WorkforcePlanMutationRequest) => Promise<void>;
}

interface LookupOption { id: number; displayName: string }
interface PeriodOption extends LookupOption { sequence: number }

const emptyTarget = () => ({ fiscalPeriodId: 0, newHireSlots: 0, replacementSlots: 0 });
const emptyLine = () => ({
  positionId: 0,
  targetBranchId: null,
  newHireSlots: 0,
  replacementSlots: 0,
  justification: "",
  periodTargets: [emptyTarget()],
});

function DemandSummary({ control, lineIndex, baselineHeadcount }: {
  control: Control<WorkforcePlanFormValues>;
  lineIndex: number;
  baselineHeadcount?: number;
}) {
  const { t } = useTranslation();
  const newHireSlots = useWatch({ control, name: `lines.${lineIndex}.newHireSlots` }) ?? 0;
  const replacementSlots = useWatch({ control, name: `lines.${lineIndex}.replacementSlots` }) ?? 0;
  const total = Number(newHireSlots) + Number(replacementSlots);

  return <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: "wrap" }}>
    <Chip size="small" color="primary" variant="outlined" label={t("workforcePlanning.summary.totalHiring", { count: total })} />
    {baselineHeadcount === undefined
      ? <Chip size="small" variant="outlined" label={t("workforcePlanning.summary.baselineOnSave")} />
      : <>
          <Chip size="small" variant="outlined" label={t("workforcePlanning.summary.currentEmployees", { count: baselineHeadcount })} />
          <Chip size="small" color="success" variant="outlined" label={t("workforcePlanning.summary.expectedEmployees", { count: baselineHeadcount + Number(newHireSlots) })} />
        </>}
  </Stack>;
}

const emptyValues = (): WorkforcePlanFormValues => ({
  planCode: "",
  fiscalYearId: 0,
  titleEn: "",
  titleAr: "",
  description: "",
  lines: [emptyLine()],
});

function PeriodTargetsEditor({ control, errors, lineIndex, options, readOnly, loading }: {
  control: Control<WorkforcePlanFormValues>;
  errors: FieldErrors<WorkforcePlanFormValues>;
  lineIndex: number;
  options: PeriodOption[];
  readOnly: boolean;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const targets = useFieldArray({ control, name: `lines.${lineIndex}.periodTargets` as const });
  const text = (name: Path<WorkforcePlanFormValues>, label: string) => (
    <MyTextField fieldName={name} labelKey={label} type="number" control={control} errors={errors} readOnly={readOnly} loading={loading} />
  );

  return <Stack spacing={1} sx={{ mt: 1 }}>
    <Typography variant="subtitle2">{t("workforcePlanning.periodTargets.title")}</Typography>
    {targets.fields.map((target, periodIndex) => <Stack key={target.id} direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
      <Box sx={{ flex: 1.4 }}><MySelect
        name={`lines.${lineIndex}.periodTargets.${periodIndex}.fiscalPeriodId` as Path<WorkforcePlanFormValues>}
        label={t("workforcePlanning.fields.fiscalPeriod")}
        control={control}
        dataSource={options}
        valueMember="id"
        displayMember="displayName"
        errors={errors}
        actualFieldName={`lines.${lineIndex}.periodTargets.${periodIndex}.fiscalPeriodId` as Path<WorkforcePlanFormValues>}
        required
        loading={loading}
        isViewMode={readOnly}
      /></Box>
      <Box sx={{ flex: 1 }}>{text(`lines.${lineIndex}.periodTargets.${periodIndex}.newHireSlots`, t("workforcePlanning.fields.newHireSlots"))}</Box>
      <Box sx={{ flex: 1 }}>{text(`lines.${lineIndex}.periodTargets.${periodIndex}.replacementSlots`, t("workforcePlanning.fields.replacementSlots"))}</Box>
      {!readOnly ? <Stack direction="row">
        <IconButton aria-label={t("workforcePlanning.actions.moveUp")} disabled={periodIndex === 0} onClick={() => targets.move(periodIndex, periodIndex - 1)}><ArrowUpward /></IconButton>
        <IconButton aria-label={t("workforcePlanning.actions.moveDown")} disabled={periodIndex === targets.fields.length - 1} onClick={() => targets.move(periodIndex, periodIndex + 1)}><ArrowDownward /></IconButton>
        <IconButton aria-label={t("actions.remove")} disabled={targets.fields.length === 1} onClick={() => targets.remove(periodIndex)}><Delete /></IconButton>
      </Stack> : null}
    </Stack>)}
    {!readOnly ? <Button size="small" startIcon={<Add />} onClick={() => targets.append(emptyTarget())}>{t("workforcePlanning.periodTargets.add")}</Button> : null}
  </Stack>;
}

export default function WorkforcePlanForm({ open, mode, item, revisions = [], loading = false, detailError, onRetryDetail, onClose, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const readOnly = mode === "view";
  const identityReadOnly = mode !== "add";
  const form = useForm<WorkforcePlanFormValues>({
    resolver: zodResolver(getWorkforcePlanSchema(t)) as Resolver<WorkforcePlanFormValues>,
    defaultValues: emptyValues(),
    mode: "onSubmit",
  });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const selectedFiscalYearId = useWatch({ control: form.control, name: "fiscalYearId" });
  const fiscalYears = useFiscalYearLookup();
  const positions = useOrganizationalLookup("positions", undefined, open);
  const branches = useOrganizationalLookup("branches", undefined, open);
  const fallbackFiscalYearId = fiscalYears.data?.find(year => year.status === 2)?.id ?? fiscalYears.data?.find(year => year.status === 1)?.id ?? 0;
  const fiscalYear = useFiscalYear(selectedFiscalYearId || fallbackFiscalYearId, open && Boolean(selectedFiscalYearId || fallbackFiscalYearId));
  const isArabic = i18n.language.startsWith("ar");
  const optionLabel = useCallback((value: { code: string; nameAr: string; nameEn: string }) => `${value.code} — ${isArabic ? value.nameAr : value.nameEn}`, [isArabic]);
  const fiscalYearOptions = useMemo<LookupOption[]>(() => (fiscalYears.data ?? []).map(value => ({ id: value.id, displayName: optionLabel(value) })), [fiscalYears.data, optionLabel]);
  const positionOptions = useMemo<LookupOption[]>(() => (positions.data ?? []).map(value => ({ id: value.id, displayName: optionLabel(value) })), [positions.data, optionLabel]);
  const branchOptions = useMemo<LookupOption[]>(() => (branches.data ?? []).map(value => ({ id: value.id, displayName: optionLabel(value) })), [branches.data, optionLabel]);
  const periodOptions = useMemo<PeriodOption[]>(() => (fiscalYear.data?.periods ?? []).map(value => ({ id: value.id, sequence: value.sequence, displayName: `${value.code} — ${isArabic ? value.nameAr : value.nameEn}` })), [fiscalYear.data?.periods, isArabic]);

  useEffect(() => {
    if (!open) return;
    form.reset(item && mode !== "add" ? {
      planCode: item.planCode,
      fiscalYearId: item.fiscalYearId,
      titleEn: item.titleEn,
      titleAr: item.titleAr,
      description: item.description ?? "",
      lines: item.lines.map(line => ({
        positionId: line.positionId,
        targetBranchId: line.targetBranchId,
        newHireSlots: line.newHireSlots,
        replacementSlots: line.replacementSlots,
        justification: line.justification ?? "",
        periodTargets: line.periodTargets.map(target => ({ fiscalPeriodId: target.fiscalPeriodId, newHireSlots: target.newHireSlots, replacementSlots: target.replacementSlots })),
      })),
    } : emptyValues());
  }, [form, item, mode, open]);

  const field = (name: Path<WorkforcePlanFormValues>, label: string, type: "text" | "number" = "text", locked = false) => (
    <MyTextField fieldName={name} labelKey={label} type={type} control={form.control} errors={form.formState.errors} readOnly={readOnly || locked || Boolean(detailError)} loading={loading} />
  );
  const generateMockData = () => {
    const fiscalId = selectedFiscalYearId || fallbackFiscalYearId;
    const periods = fiscalYear.data?.periods ?? [];
    const firstPosition = positions.data?.[0];
    if (!fiscalId || !firstPosition || periods.length === 0) return;
    const next = { shouldDirty: true, shouldValidate: true };
    form.setValue("planCode", `WP-${new Date().getFullYear() + 1}`, next);
    form.setValue("fiscalYearId", fiscalId, next);
    form.setValue("titleEn", "Annual workforce growth plan", next);
    form.setValue("titleAr", "خطة نمو القوى العاملة السنوية", next);
    form.setValue("description", "Planned hiring demand distributed across fiscal periods.", next);
    form.setValue("lines", [{
      positionId: firstPosition.id,
      targetBranchId: branches.data?.[0]?.id ?? null,
      newHireSlots: periods.length,
      replacementSlots: 0,
      justification: "Capacity growth",
      periodTargets: periods.map(period => ({ fiscalPeriodId: period.id, newHireSlots: 1, replacementSlots: 0 })),
    }], next);
  };
  const errors = toFormErrorMessages(form.formState.errors);
  const previous = revisions.find(revision => revision.revisionNumber === (item?.revisionNumber ?? 1) - 1);
  const totalSlots = (plan?: WorkforcePlanDetail) => plan?.lines.reduce((sum, line) => sum + line.plannedHiringSlots, 0) ?? 0;

  return <MyForm
    open={open}
    onClose={onClose}
    title={t(`workforcePlanning.form.${mode}Title`)}
    subtitle={t("workforcePlanning.form.subtitle")}
    submitButtonText={mode === "edit" ? t("actions.update") : t("actions.create")}
    onSubmit={readOnly ? undefined : form.handleSubmit(async values => {
      try { await onSubmit({ ...values, lines: values.lines.map(line => ({ ...line, targetBranchId: line.targetBranchId ?? null })) }); }
      catch (error) {
        applyApiFieldErrors(error, form.setError, {
          "WorkforcePlan.DuplicateCode": ["planCode"],
          "WorkforcePlan.PositionNotFound": ["lines.0.positionId"],
          "WorkforcePlan.BranchNotFound": ["lines.0.targetBranchId"],
          "WorkforcePlan.PeriodNotFound": ["lines.0.periodTargets.0.fiscalPeriodId"],
        });
      }
    })}
    isSubmitting={loading}
    submitDisabled={Boolean(detailError)}
    isDirty={form.formState.isDirty}
    hideFooter={readOnly}
    isViewMode={readOnly}
    recordId={item?.id}
    maxWidth="lg"
    maxHeight="86vh"
    focusFieldName="planCode"
    autoFocusFirst
    errors={errors}
    mockDataAction={process.env.NODE_ENV !== "production" && !readOnly ? { onGenerate: generateMockData, disabled: loading || !fallbackFiscalYearId || !positions.data?.length || !fiscalYear.data?.periods.length } : undefined}
  >
    {detailError ? <Alert severity="error" action={onRetryDetail ? <Button color="inherit" onClick={onRetryDetail}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Box sx={{ flex: 1 }}>{field("planCode", t("workforcePlanning.fields.planCode"), "text", identityReadOnly)}</Box>
      <Box sx={{ flex: 1 }}><MySelect name="fiscalYearId" label={t("workforcePlanning.fields.fiscalYear")} control={form.control} dataSource={fiscalYearOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="fiscalYearId" loading={loading || fiscalYears.isLoading} required isViewMode={readOnly || identityReadOnly} /></Box>
    </Stack>
    {field("titleEn", t("workforcePlanning.fields.titleEn"))}
    {field("titleAr", t("workforcePlanning.fields.titleAr"))}
    {field("description", t("workforcePlanning.fields.description"))}
    <Divider sx={{ my: 1 }} />
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h6">{t("workforcePlanning.lines.title")}</Typography>
      {!readOnly ? <Button startIcon={<Add />} onClick={() => lines.append(emptyLine())}>{t("workforcePlanning.lines.add")}</Button> : null}
    </Stack>
    {lines.fields.map((line, index) => <Box key={line.id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, mt: 1 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontWeight: 700 }}>{t("workforcePlanning.lines.item", { number: index + 1 })}</Typography>
        {!readOnly ? <Stack direction="row">
          <IconButton aria-label={t("workforcePlanning.actions.moveUp")} disabled={index === 0} onClick={() => lines.move(index, index - 1)}><ArrowUpward /></IconButton>
          <IconButton aria-label={t("workforcePlanning.actions.moveDown")} disabled={index === lines.fields.length - 1} onClick={() => lines.move(index, index + 1)}><ArrowDownward /></IconButton>
          <IconButton aria-label={t("actions.remove")} disabled={lines.fields.length === 1} onClick={() => lines.remove(index)}><Delete /></IconButton>
        </Stack> : null}
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Box sx={{ flex: 1 }}><MySelect name={`lines.${index}.positionId`} label={t("workforcePlanning.fields.position")} control={form.control} dataSource={positionOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName={`lines.${index}.positionId`} loading={loading || positions.isLoading} required isViewMode={readOnly} /></Box>
        <Box sx={{ flex: 1 }}><MySelect name={`lines.${index}.targetBranchId`} label={t("workforcePlanning.fields.targetBranch")} control={form.control} dataSource={branchOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName={`lines.${index}.targetBranchId`} loading={loading || branches.isLoading} isViewMode={readOnly} showClearButton={!readOnly} helperText={t("workforcePlanning.form.branchHelper")} /></Box>
      </Stack>
      {readOnly && item?.lines[index] ? <Chip size="small" variant="outlined" sx={{ my: 1 }} label={t("workforcePlanning.baseline.asOf", { date: item.lines[index].baselineAsOfDate })} /> : null}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Box sx={{ flex: 1 }}>{field(`lines.${index}.newHireSlots`, t("workforcePlanning.fields.newHireSlots"), "number")}</Box><Box sx={{ flex: 1 }}>{field(`lines.${index}.replacementSlots`, t("workforcePlanning.fields.replacementSlots"), "number")}</Box></Stack>
      <DemandSummary control={form.control} lineIndex={index} baselineHeadcount={item?.lines[index]?.baselineHeadcount} />
      {field(`lines.${index}.justification`, t("workforcePlanning.fields.justification"))}
      <PeriodTargetsEditor control={form.control} errors={form.formState.errors} lineIndex={index} options={periodOptions} readOnly={readOnly} loading={loading || fiscalYear.isLoading} />
    </Box>)}
    {readOnly ? <Box sx={{ mt: 2 }}>
      <Typography variant="h6">{t("workforcePlanning.revisions.title")}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        {revisions.map(revision => <Chip key={revision.id} color={revision.id === item?.id ? "primary" : "default"} label={t("workforcePlanning.revisions.item", { revision: revision.revisionNumber, slots: totalSlots(revision) })} />)}
      </Stack>
      {previous && item ? <Alert severity="info" sx={{ mt: 1 }}>{t("workforcePlanning.revisions.delta", { count: totalSlots(item) - totalSlots(previous), revision: previous.revisionNumber })}</Alert> : null}
    </Box> : null}
  </MyForm>;
}
