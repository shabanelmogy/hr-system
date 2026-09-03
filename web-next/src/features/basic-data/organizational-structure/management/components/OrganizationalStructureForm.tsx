"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useRef } from "react";
import { Controller, type Resolver, type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { useOrganizationalLookup } from "../hooks/useOrganizationalStructure";
import type {
  OrganizationalResource,
  OrganizationalStructureItem,
  OrganizationalStructureMutation,
} from "../types/OrganizationalStructure";
import { getOrganizationalStructureSchema } from "../validation/organizationalStructureSchema";
import {
  getNextOrganizationalStructureMockData,
  organizationalStructureMockDependenciesReady,
} from "../utils/organizationalStructureMockData";
import { DutySectionsEditor } from "./job-description-editors/DutySectionsEditor";
import { SkillsEditor } from "./job-description-editors/SkillsEditor";
import { EducationRequirementsEditor } from "./job-description-editors/EducationRequirementsEditor";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  resource: OrganizationalResource;
  item?: OrganizationalStructureItem | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationalStructureMutation) => Promise<void>;
}

const emptyValues: OrganizationalStructureMutation = {
  code: "", nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
  timeZoneId: "UTC", openedOn: new Date().toISOString().slice(0, 10),
  isHeadquarters: false, isCentralized: false, canManageOthers: false, isManagementLevel: false,
  targetHeadcount: 0, levelOrder: 0,
  dutySections: [], skills: [], educationRequirements: [],
};

const boolOptions = [
  { value: true, label: "organizationalStructure.yes" },
  { value: false, label: "organizationalStructure.no" },
] as const;

const toFormValues = (item?: OrganizationalStructureItem | null): OrganizationalStructureMutation => item ? {
  ...emptyValues,
  ...item,
  isCentralized: item.isCentralized ?? (item.resource === "departments" ? !item.branchId : false),
  version: item.version ?? (item.resource === "job-descriptions" ? item.code : undefined),
  dutySections: item.dutySections ?? [],
  skills: item.skills ?? [],
  educationRequirements: item.educationRequirements ?? [],
} : emptyValues;

export default function OrganizationalStructureForm({
  open, mode, resource, item, loading, onClose, onSubmit,
}: Props) {
  const { t } = useTranslation();
  const isView = mode === "view";
  const schema = getOrganizationalStructureSchema(resource, t);
  const { control, handleSubmit, reset, setError, setValue, formState: { errors, isDirty } } = useForm<OrganizationalStructureMutation>({
    resolver: zodResolver(schema) as Resolver<OrganizationalStructureMutation>,
    defaultValues: emptyValues,
  });
  const usedMockIndexes = useRef(new Set<number>());
  const branchId = useWatch({ control, name: "branchId" });
  const isCentralized = useWatch({ control, name: "isCentralized" });
  const dutySections = useWatch({ control, name: "dutySections" }) ?? [];
  const skills = useWatch({ control, name: "skills" }) ?? [];
  const educationRequirements = useWatch({ control, name: "educationRequirements" }) ?? [];

  const branches = useOrganizationalLookup("branches", undefined, open && resource === "departments");
  const departments = useOrganizationalLookup("departments", undefined, open && resource === "divisions");
  const parentDepartments = useOrganizationalLookup("departments", branchId || undefined, open && resource === "departments");
  const divisions = useOrganizationalLookup("divisions", undefined, open && resource === "positions");
  const jobTitles = useOrganizationalLookup("job-titles", undefined, open && resource === "positions");
  const jobLevels = useOrganizationalLookup("job-levels", undefined, open && resource === "positions");
  const positions = useOrganizationalLookup("positions", undefined, open && resource === "job-descriptions");
  const costCenters = useOrganizationalLookup("cost-centers", undefined, open && (resource === "departments" || resource === "divisions" || resource === "cost-centers"));
  const currencies = useOrganizationalLookup("currencies", undefined, open && resource === "job-levels");

  const mockLookups = {
    branches: branches.data ?? [],
    departments: departments.data ?? [],
    divisions: divisions.data ?? [],
    "job-titles": jobTitles.data ?? [],
    "job-levels": jobLevels.data ?? [],
    positions: positions.data ?? [],
  };

  useEffect(() => {
    if (open) reset(toFormValues(item));
  }, [item, open, reset, resource]);

  const options = (values = [] as { id: number; code: string; nameEn: string; nameAr: string }[]) =>
    values.map((value) => ({ id: value.id, displayName: `${value.code} — ${value.nameEn} (${value.nameAr})` }));
  const errorMessages = Object.fromEntries(Object.entries(errors).flatMap(([key, error]) =>
    error?.message ? [[key, String(error.message)]] : []));
  const submit: SubmitHandler<OrganizationalStructureMutation> = async (values) => {
    try {
      const payload: OrganizationalStructureMutation = {
        ...values,
        branchId: values.isCentralized ? undefined : (values.branchId || undefined),
      };
      await onSubmit(payload);
    }
    catch (error) {
      applyApiFieldErrors(error, setError, {
        "OrganizationalStructure.Duplicate": ["code", "nameAr", "nameEn"],
        "OrganizationalStructure.DuplicateCode": ["code"],
        "OrganizationalStructure.DuplicateNameEn": ["nameEn"],
        "OrganizationalStructure.DuplicateNameAr": ["nameAr"],
        "OrganizationalStructure.ParentNotFound": ["branchId", "departmentId", "divisionId", "jobTitleId", "jobLevelId", "positionId"],
      });
    }
  };
  const text = (name: keyof OrganizationalStructureMutation, label: string, props: Record<string, unknown> = {}) => (
    <MyTextField
      fieldName={name} labelKey={label} control={control} errors={errors}
      loading={loading} readOnly={isView} showCounter={!isView} {...props}
    />
  );
  const select = (
    name: "branchId" | "parentDepartmentId" | "parentCostCenterId" | "departmentId" | "divisionId" | "jobTitleId" | "jobLevelId" | "positionId",
    label: string,
    data: ReturnType<typeof options>,
    isLoading = false,
  ) => (
    <MySelect
      name={name} label={label} control={control} dataSource={data}
      valueMember="id" displayMember="displayName" errors={errors} actualFieldName={name}
      loading={loading || isLoading} isViewMode={isView} showClearButton={!isView}
    />
  );

  const generateMockData = () => {
    const sample = getNextOrganizationalStructureMockData(resource, usedMockIndexes.current, mockLookups);
    const options = { shouldDirty: true, shouldValidate: true };
    setValue("code", sample.code, options);
    setValue("nameAr", sample.nameAr, options);
    setValue("nameEn", sample.nameEn, options);

    if (resource === "branches") {
      setValue("timeZoneId", sample.timeZoneId ?? "Africa/Cairo", options);
      setValue("openedOn", sample.openedOn ?? new Date().toISOString().slice(0, 10), options);
      setValue("email", sample.email ?? "", options);
      setValue("phone", sample.phone ?? "", options);
      setValue("isHeadquarters", sample.isHeadquarters ?? false, options);
    }
    if (resource === "departments") {
      setValue("isCentralized", false, options);
      setValue("branchId", sample.branchId ?? 0, options);
      setValue("parentDepartmentId", sample.parentDepartmentId ?? 0, options);
      setValue("costCenterCode", sample.costCenterCode ?? "", options);
      setValue("descriptionAr", sample.descriptionAr ?? "", options);
      setValue("descriptionEn", sample.descriptionEn ?? "", options);
    }
    if (resource === "divisions") {
      setValue("departmentId", sample.departmentId ?? 0, options);
      setValue("costCenterCode", sample.costCenterCode ?? "", options);
      setValue("descriptionAr", sample.descriptionAr ?? "", options);
      setValue("descriptionEn", sample.descriptionEn ?? "", options);
    }
    if (resource === "job-levels") {
      setValue("levelOrder", sample.levelOrder ?? 0, options);
      setValue("minSalary", sample.minSalary ?? 0, options);
      setValue("maxSalary", sample.maxSalary ?? 0, options);
      setValue("currencyCode", sample.currencyCode ?? "EGP", options);
      setValue("canManageOthers", sample.canManageOthers ?? false, options);
      setValue("isManagementLevel", sample.isManagementLevel ?? false, options);
      setValue("descriptionAr", sample.descriptionAr ?? "", options);
      setValue("descriptionEn", sample.descriptionEn ?? "", options);
    }
    if (resource === "positions") {
      setValue("divisionId", sample.divisionId ?? 0, options);
      setValue("jobTitleId", sample.jobTitleId ?? 0, options);
      setValue("jobLevelId", sample.jobLevelId ?? 0, options);
      setValue("targetHeadcount", sample.targetHeadcount ?? 0, options);
    }
    if (resource === "job-descriptions") {
      const suffix = Math.floor(Math.random() * 900 + 100);
      setValue("code", `${sample.version ?? sample.code}.${suffix}`, options);
      setValue("version", `${sample.version ?? sample.code}.${suffix}`, options);
      setValue("nameAr", `${sample.nameAr} (${suffix})`, options);
      setValue("nameEn", `${sample.nameEn} (${suffix})`, options);
      setValue("purposeAr", sample.purposeAr ?? "", options);
      setValue("purposeEn", sample.purposeEn ?? "", options);
      setValue("dutySections", [
        {
          sectionTitleAr: "المهام القيادية والإدارية",
          sectionTitleEn: "Leadership & Management",
          weightPercentage: 40,
          items: [
            { textAr: "قيادة وتوجيه الفريق لتحقيق المستهدفات", textEn: "Lead and mentor team to achieve departmental goals", order: 1 },
            { textAr: "مراجعة تقارير الأداء ومؤشرات الإنجاز الدورية", textEn: "Review periodic performance reports and KPIs", order: 2 },
          ],
        },
        {
          sectionTitleAr: "التخطيط والتطوير الفني",
          sectionTitleEn: "Planning & Technical Development",
          weightPercentage: 60,
          items: [
            { textAr: "تطوير الحلول البرمجية وفق أعلى معايير الجودة", textEn: "Develop software solutions adhering to quality standards", order: 1 },
          ],
        },
      ], options);
      setValue("skills", [
        { skillName: "C# / .NET Core", proficiencyLevel: "Expert", isMandatory: true },
        { skillName: "React / Next.js", proficiencyLevel: "Advanced", isMandatory: true },
        { skillName: "Problem Solving", proficiencyLevel: "Advanced", isMandatory: false },
      ], options);
      setValue("educationRequirements", [
        { degreeLevel: "Bachelor's Degree", fieldOfStudy: "Computer Science / Software Engineering", isRequired: true },
      ], options);
      setValue("minExperienceYears", sample.minExperienceYears ?? 3, options);
      setValue("preferredQualificationsAr", sample.preferredQualificationsAr ?? "", options);
      setValue("preferredQualificationsEn", sample.preferredQualificationsEn ?? "", options);
      setValue("revisionNotes", sample.revisionNotes ?? "", options);
      setValue("positionId", sample.positionId ?? 0, options);
    }
  };

  return (
    <MyForm
      open={open} onClose={onClose} maxHeight="86vh"
      title={t(`organizationalStructure.form.${mode}`, { resource: t(`organizationalStructure.resources.${resource}`) })}
      subtitle={t("organizationalStructure.form.subtitle")}
      submitButtonText={isView ? undefined : t(mode === "add" ? "actions.create" : "actions.update")}
      onSubmit={isView ? undefined : handleSubmit(submit)} isSubmitting={loading}
      isDirty={isDirty} hideFooter={isView} focusFieldName="code" autoFocusFirst
      overlayActionType={mode === "add" ? "create" : "update"}
      overlayMessage={t("organizationalStructure.form.saving")} errors={errorMessages}
      mockDataAction={
        process.env.NODE_ENV !== "production" && !isView
          ? {
              onGenerate: generateMockData,
              disabled: loading || !organizationalStructureMockDependenciesReady(resource, mockLookups),
            }
          : undefined
      }
    >
      <Box sx={{ display: "grid" }}>
        {text("code", resource === "job-descriptions" ? t("organizationalStructure.fields.version") : t("organizationalStructure.fields.code"), { maxLength: resource === "job-descriptions" ? 30 : 50 })}
        {text("nameAr", t("general.nameAr"), { maxLength: 200 })}
        {text("nameEn", t("general.nameEn"), { maxLength: 200 })}

        {resource === "branches" && <>
          {text("timeZoneId", t("organizationalStructure.fields.timeZone"), { maxLength: 128 })}
          {text("openedOn", t("organizationalStructure.fields.openedOn"), { type: "date", showCounter: false })}
          {text("email", t("organizationalStructure.fields.email"), { type: "email", maxLength: 254 })}
          {text("phone", t("organizationalStructure.fields.phone"), { maxLength: 50 })}
          <MySelect name="isHeadquarters" label={t("organizationalStructure.fields.headquarters")} control={control}
            dataSource={boolOptions.map((x) => ({ ...x, label: t(x.label) }))} valueMember="value" displayMember="label"
            errors={errors} isViewMode={isView} />
        </>}

        {resource === "departments" && <>
          <Controller
            name="isCentralized"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    disabled={isView || loading}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      field.onChange(checked);
                      if (checked) {
                        setValue("branchId", 0, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    color="primary"
                  />
                }
                label={t("organizationalStructure.fields.isCentralized")}
                sx={{ mb: 1.5 }}
              />
            )}
          />
          {!isCentralized && select("branchId", t("organizationalStructure.resources.branches"), options(branches.data), branches.isLoading)}
          {select("parentDepartmentId", t("organizationalStructure.fields.parentDepartment"), options(parentDepartments.data?.filter((x) => x.id !== item?.id)), parentDepartments.isLoading)}
        </>}
        {resource === "divisions" && select("departmentId", t("organizationalStructure.resources.departments"), options(departments.data), departments.isLoading)}
        {(resource === "departments" || resource === "divisions") && <>
          {costCenters.data && costCenters.data.length > 0 ? (
            <MySelect
              name="costCenterCode"
              label={t("organizationalStructure.fields.costCenter")}
              control={control}
              dataSource={costCenters.data.map((cc) => ({
                value: cc.code,
                label: `${cc.code} — ${cc.nameEn} (${cc.nameAr})`,
              }))}
              valueMember="value"
              displayMember="label"
              errors={errors}
              isViewMode={isView}
            />
          ) : (
            text("costCenterCode", t("organizationalStructure.fields.costCenter"), { maxLength: 50 })
          )}
          {text("descriptionAr", t("organizationalStructure.fields.descriptionAr"), { multiline: true, rows: 3, maxLength: 2000 })}
          {text("descriptionEn", t("organizationalStructure.fields.descriptionEn"), { multiline: true, rows: 3, maxLength: 2000 })}
        </>}

        {resource === "cost-centers" && <>
          {select("parentCostCenterId", t("organizationalStructure.fields.parentCostCenter"), options(costCenters.data?.filter((x) => x.id !== item?.id)), costCenters.isLoading)}
          {text("descriptionAr", t("organizationalStructure.fields.descriptionAr"), { multiline: true, rows: 3, maxLength: 2000 })}
          {text("descriptionEn", t("organizationalStructure.fields.descriptionEn"), { multiline: true, rows: 3, maxLength: 2000 })}
        </>}

        {resource === "currencies" && <>
          {text("symbol", t("organizationalStructure.fields.symbol"), { maxLength: 10 })}
          {text("exchangeRateToDefault", t("organizationalStructure.fields.exchangeRate"), { type: "number", minValue: 0.0001, showCounter: false })}
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    disabled={isView || loading}
                    onChange={(e) => field.onChange(e.target.checked)}
                    color="primary"
                  />
                }
                label={t("organizationalStructure.fields.defaultCurrency")}
                sx={{ mb: 1.5 }}
              />
            )}
          />
        </>}

        {resource === "job-levels" && <>
          {text("levelOrder", t("organizationalStructure.fields.levelOrder"), { type: "number", minValue: 0, showCounter: false })}
          {text("minSalary", t("organizationalStructure.fields.minSalary"), { type: "number", minValue: 0, showCounter: false })}
          {text("maxSalary", t("organizationalStructure.fields.maxSalary"), { type: "number", minValue: 0, showCounter: false })}
          {currencies.data && currencies.data.length > 0 ? (
            <MySelect
              name="currencyCode"
              label={t("organizationalStructure.fields.currency")}
              control={control}
              dataSource={currencies.data.map((c) => ({
                value: c.code,
                label: `${c.code} — ${c.nameEn} (${c.nameAr})`,
              }))}
              valueMember="value"
              displayMember="label"
              errors={errors}
              isViewMode={isView}
            />
          ) : (
            text("currencyCode", t("organizationalStructure.fields.currency"), { maxLength: 3 })
          )}
          <MySelect name="canManageOthers" label={t("organizationalStructure.fields.canManageOthers")} control={control}
            dataSource={boolOptions.map((x) => ({ ...x, label: t(x.label) }))} valueMember="value" displayMember="label" errors={errors} isViewMode={isView} />
          <MySelect name="isManagementLevel" label={t("organizationalStructure.fields.managementLevel")} control={control}
            dataSource={boolOptions.map((x) => ({ ...x, label: t(x.label) }))} valueMember="value" displayMember="label" errors={errors} isViewMode={isView} />
          {text("descriptionAr", t("organizationalStructure.fields.descriptionAr"), { multiline: true, rows: 3, maxLength: 2000 })}
          {text("descriptionEn", t("organizationalStructure.fields.descriptionEn"), { multiline: true, rows: 3, maxLength: 2000 })}
        </>}

        {resource === "positions" && <>
          {select("divisionId", t("organizationalStructure.resources.divisions"), options(divisions.data), divisions.isLoading)}
          {select("jobTitleId", t("organizationalStructure.resources.job-titles"), options(jobTitles.data), jobTitles.isLoading)}
          {select("jobLevelId", t("organizationalStructure.resources.job-levels"), options(jobLevels.data), jobLevels.isLoading)}
          {text("targetHeadcount", t("organizationalStructure.fields.targetHeadcount"), { type: "number", minValue: 0, showCounter: false })}
        </>}

        {resource === "job-descriptions" && <>
          {select("positionId", t("organizationalStructure.resources.positions"), options(positions.data), positions.isLoading)}
          {text("purposeAr", t("organizationalStructure.fields.purposeAr"), { multiline: true, rows: 2, maxLength: 4000 })}
          {text("purposeEn", t("organizationalStructure.fields.purposeEn"), { multiline: true, rows: 2, maxLength: 4000 })}

          <DutySectionsEditor
            sections={dutySections}
            onChange={(val) => setValue("dutySections", val, { shouldDirty: true, shouldValidate: true })}
            disabled={isView || loading}
          />

          <SkillsEditor
            skills={skills}
            onChange={(val) => setValue("skills", val, { shouldDirty: true, shouldValidate: true })}
            disabled={isView || loading}
          />

          <EducationRequirementsEditor
            requirements={educationRequirements}
            onChange={(val) => setValue("educationRequirements", val, { shouldDirty: true, shouldValidate: true })}
            disabled={isView || loading}
          />

          {text("minExperienceYears", t("organizationalStructure.fields.experienceYears"), { type: "number", minValue: 0, showCounter: false })}
          {text("preferredQualificationsAr", t("organizationalStructure.fields.preferredQualificationsAr"), { multiline: true, rows: 2, maxLength: 4000 })}
          {text("preferredQualificationsEn", t("organizationalStructure.fields.preferredQualificationsEn"), { multiline: true, rows: 2, maxLength: 4000 })}
          {text("revisionNotes", t("organizationalStructure.fields.revisionNotes"), { multiline: true, rows: 2, maxLength: 2000 })}
        </>}
      </Box>
    </MyForm>
  );
}
