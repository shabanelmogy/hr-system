"use client";

import { useFiscalYearLookup } from "@/modules/hr/finance";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Delete } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type Path, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBudgetSourcePlan, useBudgetSourcePlans } from "../hooks/useWorkforceBudgetQueries";
import type { BudgetSourcePlan, WorkforceBudgetDetail, WorkforceBudgetMutationRequest } from "../types/WorkforceBudget";
import { getWorkforceBudgetSchema, type WorkforceBudgetFormValues } from "../validation/workforceBudgetValidation";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  item?: WorkforceBudgetDetail | null;
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
  onSubmit: (request: WorkforceBudgetMutationRequest) => Promise<void>;
}

interface LookupOption { id: number; displayName: string }

const emptyAllocation = () => ({ fiscalPeriodId: 0, targetHeadcount: 0, allocatedSalaryCost: 0, allocatedRecruitmentCost: 0 });

const emptyValues = (): WorkforceBudgetFormValues => ({
  budgetCode: "",
  workforcePlanId: 0,
  currencyCode: "EGP",
  lines: [],
});

function AllocationSums({ control, lineIndex, currency }: { control: Control<WorkforceBudgetFormValues>; lineIndex: number; currency: string }) {
  const { t } = useTranslation();
  const authorizedHeadcount = Number(useWatch({ control, name: `lines.${lineIndex}.authorizedHeadcount` }) ?? 0);
  const salaryBudget = Number(useWatch({ control, name: `lines.${lineIndex}.allocatedSalaryBudget` }) ?? 0);
  const recruitmentBudget = Number(useWatch({ control, name: `lines.${lineIndex}.allocatedRecruitmentBudget` }) ?? 0);
  const allocations = useWatch({ control, name: `lines.${lineIndex}.periodAllocations` }) ?? [];
  const headcountSum = allocations.reduce((sum, allocation) => sum + Number(allocation.targetHeadcount ?? 0), 0);
  const salarySum = allocations.reduce((sum, allocation) => sum + Number(allocation.allocatedSalaryCost ?? 0), 0);
  const recruitmentSum = allocations.reduce((sum, allocation) => sum + Number(allocation.allocatedRecruitmentCost ?? 0), 0);
  return <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: "wrap" }}>
    <Chip size="small" color={headcountSum === authorizedHeadcount ? "success" : "warning"} variant="outlined" label={t("workforceBudget.sums.headcount", { sum: headcountSum, total: authorizedHeadcount })} />
    <Chip size="small" color={Math.abs(salarySum - salaryBudget) < 0.005 ? "success" : "warning"} variant="outlined" label={t("workforceBudget.sums.salary", { sum: salarySum.toLocaleString(), total: salaryBudget.toLocaleString(), currency })} />
    <Chip size="small" color={Math.abs(recruitmentSum - recruitmentBudget) < 0.005 ? "success" : "warning"} variant="outlined" label={t("workforceBudget.sums.recruitment", { sum: recruitmentSum.toLocaleString(), total: recruitmentBudget.toLocaleString(), currency })} />
  </Stack>;
}

function PeriodAllocationsEditor({ control, errors, lineIndex, periodIds, readOnly, loading }: {
  control: Control<WorkforceBudgetFormValues>;
  errors: FieldErrors<WorkforceBudgetFormValues>;
  lineIndex: number;
  periodIds: number[];
  readOnly: boolean;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const allocations = useFieldArray({ control, name: `lines.${lineIndex}.periodAllocations` as const });
  const options = useMemo<LookupOption[]>(() => periodIds.map(id => ({ id, displayName: `${t("workforceBudget.fields.fiscalPeriod")} ${id}` })), [periodIds, t]);
  const text = (name: Path<WorkforceBudgetFormValues>, label: string) => (
    <MyTextField fieldName={name} labelKey={label} type="number" control={control} errors={errors} readOnly={readOnly} loading={loading} />
  );
  return <Stack spacing={1} sx={{ mt: 1 }}>
    <Typography variant="subtitle2">{t("workforceBudget.allocations.title")}</Typography>
    {allocations.fields.map((allocation, allocationIndex) => <Stack key={allocation.id} direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
      <Box sx={{ flex: 1.2 }}><MySelect
        name={`lines.${lineIndex}.periodAllocations.${allocationIndex}.fiscalPeriodId` as Path<WorkforceBudgetFormValues>}
        label={t("workforceBudget.fields.fiscalPeriod")}
        control={control}
        dataSource={options}
        valueMember="id"
        displayMember="displayName"
        errors={errors}
        actualFieldName={`lines.${lineIndex}.periodAllocations.${allocationIndex}.fiscalPeriodId` as Path<WorkforceBudgetFormValues>}
        required
        loading={loading}
        isViewMode={readOnly}
      /></Box>
      <Box sx={{ flex: 1 }}>{text(`lines.${lineIndex}.periodAllocations.${allocationIndex}.targetHeadcount`, t("workforceBudget.fields.headcount"))}</Box>
      <Box sx={{ flex: 1 }}>{text(`lines.${lineIndex}.periodAllocations.${allocationIndex}.allocatedSalaryCost`, t("workforceBudget.fields.salary"))}</Box>
      <Box sx={{ flex: 1 }}>{text(`lines.${lineIndex}.periodAllocations.${allocationIndex}.allocatedRecruitmentCost`, t("workforceBudget.fields.recruitment"))}</Box>
      {!readOnly ? <IconButton aria-label={t("actions.remove")} disabled={allocations.fields.length === 1} onClick={() => allocations.remove(allocationIndex)}><Delete /></IconButton> : null}
    </Stack>)}
    {!readOnly ? <Button size="small" startIcon={<Add />} onClick={() => allocations.append(emptyAllocation())}>{t("workforceBudget.allocations.add")}</Button> : null}
  </Stack>;
}

export default function WorkforceBudgetForm({ open, mode, item, loading = false, detailError, onRetryDetail, onClose, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const readOnly = mode === "view";
  const identityReadOnly = mode !== "add";
  const form = useForm<WorkforceBudgetFormValues>({
    resolver: zodResolver(getWorkforceBudgetSchema(t)) as Resolver<WorkforceBudgetFormValues>,
    defaultValues: emptyValues(),
    mode: "onSubmit",
  });
  const selectedPlanId = useWatch({ control: form.control, name: "workforcePlanId" });
  const currency = useWatch({ control: form.control, name: "currencyCode" }) || "EGP";
  const isArabic = i18n.language.startsWith("ar");
  const sourcePlans = useBudgetSourcePlans({ pageNumber: 1, pageSize: 50 }, open && mode === "add");
  const sourcePlan = useBudgetSourcePlan(mode === "add" ? selectedPlanId : undefined, open && mode === "add" && Boolean(selectedPlanId));
  const activePlan: BudgetSourcePlan | null = useMemo(() => {
    if (mode !== "add") return null;
    const loaded = sourcePlan.data;
    if (loaded) return loaded;
    return (sourcePlans.data?.items ?? []).find(plan => plan.id === Number(selectedPlanId)) ?? null;
  }, [mode, sourcePlan.data, sourcePlans.data, selectedPlanId]);
  const fiscalYears = useFiscalYearLookup();
  void fiscalYears;
  const planOptions = useMemo<LookupOption[]>(() => {
    const items = sourcePlans.data?.items ?? [];
    const merged = activePlan && !items.some(plan => plan.id === activePlan.id)
      ? [...items, { ...activePlan, fiscalPeriodIds: activePlan.fiscalPeriodIds, lines: activePlan.lines }]
      : items;
    return merged.map(plan => ({ id: plan.id, displayName: `${plan.planCode} Ã¢â‚¬â€ ${isArabic ? plan.titleAr : plan.titleEn}` }));
  }, [sourcePlans.data, activePlan, isArabic]);

  useEffect(() => {
    if (!open) return;
    if (mode === "add") {
      const seed = activePlan;
      form.reset({
        budgetCode: "",
        workforcePlanId: Number(selectedPlanId) || 0,
        currencyCode: "EGP",
        lines: (seed && seed.id === Number(selectedPlanId) ? seed.lines : []).map(planLine => ({
          workforcePlanLineId: planLine.id,
          authorizedHeadcount: planLine.plannedHiringSlots,
          allocatedSalaryBudget: 0,
          allocatedRecruitmentBudget: 0,
          periodAllocations: planLine.periodTargets.map(target => ({ fiscalPeriodId: target.fiscalPeriodId, targetHeadcount: target.newHireSlots + target.replacementSlots, allocatedSalaryCost: 0, allocatedRecruitmentCost: 0 })),
        })),
      });
    } else if (item) {
      form.reset({
        budgetCode: item.budgetCode,
        workforcePlanId: item.workforcePlanId,
        currencyCode: item.currencyCode,
        lines: item.lines.map(line => ({
          workforcePlanLineId: line.workforcePlanLineId,
          authorizedHeadcount: line.authorizedHeadcount,
          allocatedSalaryBudget: line.allocatedSalaryBudget,
          allocatedRecruitmentBudget: line.allocatedRecruitmentBudget,
          periodAllocations: line.periodAllocations.map(allocation => ({
            fiscalPeriodId: allocation.fiscalPeriodId,
            targetHeadcount: allocation.targetHeadcount,
            allocatedSalaryCost: allocation.allocatedSalaryCost,
            allocatedRecruitmentCost: allocation.allocatedRecruitmentCost,
          })),
        })),
      });
    } else {
      form.reset(emptyValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, item, activePlan?.id]);

  const field = (name: Path<WorkforceBudgetFormValues>, label: string, type: "text" | "number" = "text", locked = false) => (
    <MyTextField fieldName={name} labelKey={label} type={type} control={form.control} errors={form.formState.errors} readOnly={readOnly || locked || Boolean(detailError)} loading={loading} />
  );

  const generateMockData = () => {
    const plan = activePlan;
    if (!plan || plan.lines.length === 0) return;
    const next = { shouldDirty: true, shouldValidate: true };
    form.setValue("budgetCode", `WB-${new Date().getFullYear() + 1}-001`, next);
    form.setValue("workforcePlanId", plan.id, next);
    form.setValue("currencyCode", "EGP", next);
    form.setValue("lines", plan.lines.map((planLine, lineIndex) => {
      const salaryPerSlot = 60000 * (lineIndex + 1);
      const recruitmentPerSlot = 5000 * (lineIndex + 1);
      const salaryTotal = salaryPerSlot * planLine.plannedHiringSlots;
      const recruitmentTotal = recruitmentPerSlot * planLine.plannedHiringSlots;
      const periodCount = Math.max(planLine.periodTargets.length, 1);
      const salaryBase = Math.floor((salaryTotal / periodCount) * 100) / 100;
      const recruitmentBase = Math.floor((recruitmentTotal / periodCount) * 100) / 100;
      return {
        workforcePlanLineId: planLine.id,
        authorizedHeadcount: planLine.plannedHiringSlots,
        allocatedSalaryBudget: salaryTotal,
        allocatedRecruitmentBudget: recruitmentTotal,
        periodAllocations: planLine.periodTargets.map((target, targetIndex) => {
          const last = targetIndex === planLine.periodTargets.length - 1;
          return {
            fiscalPeriodId: target.fiscalPeriodId,
            targetHeadcount: target.newHireSlots + target.replacementSlots,
            allocatedSalaryCost: last ? salaryTotal - salaryBase * (periodCount - 1) : salaryBase,
            allocatedRecruitmentCost: last ? recruitmentTotal - recruitmentBase * (periodCount - 1) : recruitmentBase,
          };
        }),
      };
    }), next);
  };

  const errors = toFormErrorMessages(form.formState.errors);
  const lines = useWatch({ control: form.control, name: "lines" }) ?? [];
  const mockDisabled = loading || !activePlan || activePlan.lines.length === 0;

  return <MyForm
    open={open}
    onClose={onClose}
    title={t(`workforceBudget.form.${mode}Title`)}
    subtitle={t("workforceBudget.form.subtitle")}
    submitButtonText={mode === "edit" ? t("actions.update") : t("actions.create")}
    onSubmit={readOnly ? undefined : form.handleSubmit(async values => {
      try {
        await onSubmit({
          budgetCode: values.budgetCode.trim().toUpperCase(),
          workforcePlanId: Number(values.workforcePlanId),
          currencyCode: values.currencyCode.trim().toUpperCase(),
          lines: values.lines.map(line => ({
            workforcePlanLineId: Number(line.workforcePlanLineId),
            authorizedHeadcount: Number(line.authorizedHeadcount),
            allocatedSalaryBudget: Number(line.allocatedSalaryBudget),
            allocatedRecruitmentBudget: Number(line.allocatedRecruitmentBudget),
            periodAllocations: line.periodAllocations.map(allocation => ({
              fiscalPeriodId: Number(allocation.fiscalPeriodId),
              targetHeadcount: Number(allocation.targetHeadcount),
              allocatedSalaryCost: Number(allocation.allocatedSalaryCost),
              allocatedRecruitmentCost: Number(allocation.allocatedRecruitmentCost),
            })),
          })),
        });
      } catch (error) {
        applyApiFieldErrors(error, form.setError, {
          "WorkforceBudget.DuplicateCode": ["budgetCode"],
          "WorkforceBudget.DuplicatePlan": ["workforcePlanId"],
          "WorkforceBudget.PlanNotFound": ["workforcePlanId"],
          "WorkforceBudget.PlanNotApproved": ["workforcePlanId"],
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
    focusFieldName="budgetCode"
    autoFocusFirst
    errors={errors}
    mockDataAction={process.env.NODE_ENV !== "production" && !readOnly ? { onGenerate: generateMockData, disabled: mockDisabled } : undefined}
  >
    {detailError ? <Alert severity="error" action={onRetryDetail ? <Button color="inherit" onClick={onRetryDetail}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Box sx={{ flex: 1 }}>{field("budgetCode", t("workforceBudget.fields.budgetCode"), "text", identityReadOnly)}</Box>
      <Box sx={{ flex: 1 }}><MySelect name="workforcePlanId" label={t("workforceBudget.fields.plan")} control={form.control} dataSource={planOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="workforcePlanId" loading={loading || sourcePlans.isLoading} required isViewMode={readOnly || identityReadOnly} /></Box>
      <Box sx={{ flex: 1 }}>{field("currencyCode", t("workforceBudget.fields.currency"), "text", readOnly || (identityReadOnly && item != null && ![1, 4].includes(item.status)))}</Box>
    </Stack>
    <Divider sx={{ my: 1 }} />
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h6">{t("workforceBudget.lines.title")}</Typography>
      {activePlan && mode === "add" ? <Chip size="small" variant="outlined" label={t("workforceBudget.lines.coverage", { count: lines.length || activePlan.lines.length })} /> : null}
    </Stack>
    {lines.map((line, index) => {
      const planLine = activePlan?.lines.find(candidate => candidate.id === Number(line.workforcePlanLineId));
      return <Box key={`${line.workforcePlanLineId}-${index}`} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, mt: 1 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700 }}>{t("workforceBudget.lines.item", { number: index + 1 })}</Typography>
          {planLine ? <Chip size="small" variant="outlined" label={t("workforceBudget.lines.ceiling", { count: planLine.plannedHiringSlots })} /> : null}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>{field(`lines.${index}.authorizedHeadcount`, t("workforceBudget.fields.headcount"), "number")}</Box>
          <Box sx={{ flex: 1 }}>{field(`lines.${index}.allocatedSalaryBudget`, t("workforceBudget.fields.salary"), "number")}</Box>
          <Box sx={{ flex: 1 }}>{field(`lines.${index}.allocatedRecruitmentBudget`, t("workforceBudget.fields.recruitment"), "number")}</Box>
        </Stack>
        <AllocationSums control={form.control} lineIndex={index} currency={currency} />
        <PeriodAllocationsEditor control={form.control} errors={form.formState.errors} lineIndex={index} periodIds={activePlan && mode === "add" ? activePlan.fiscalPeriodIds : (item?.lines[index]?.periodAllocations.map(allocation => allocation.fiscalPeriodId) ?? [])} readOnly={readOnly} loading={loading} />
      </Box>;
    })}
    {mode === "add" && !activePlan ? <Alert severity="info" sx={{ mt: 2 }}>{t("workforceBudget.form.selectPlanFirst")}</Alert> : null}
  </MyForm>;
}
