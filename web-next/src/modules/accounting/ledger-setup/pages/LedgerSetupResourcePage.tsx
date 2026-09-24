"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { Alert, Box, Button, Chip, LinearProgress, Tab, Tabs, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { MyDataGrid } from "@/shared/components/data-grid";
import { showToast } from "@/shared/components/feedback/transient";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { PageHeader } from "@/shared/components/navigation/header";
import SplitTreeView from "@/shared/components/tree-view/SplitTreeView";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { ledgerSetupService } from "../services/ledgerSetupService";
import type { LedgerSetupEntity, LedgerSetupEntityDefinition, LedgerSetupField, LedgerSetupLookupSource, LedgerSetupOption, LedgerSetupRecord, LedgerSetupResource, ResolveAccountPreviewResponse } from "../types";
import { canCreateLedgerSetupMockDraft, createLedgerSetupMockDraft } from "../utils/ledgerSetupMockData";
import { createLedgerSetupSchema, type LedgerSetupFormValues } from "../validation/ledgerSetupValidation";

const booleanOptions: readonly LedgerSetupOption[] = [{ id: true, label: "general.yes" }, { id: false, label: "general.no" }];
const manualPostingOptions: readonly LedgerSetupOption[] = [{ id: 1, label: "ledgerSetup.enums.manualPosting.allowed" }, { id: 2, label: "ledgerSetup.enums.manualPosting.restricted" }, { id: 3, label: "ledgerSetup.enums.manualPosting.blocked" }];
const currencyPolicyOptions: readonly LedgerSetupOption[] = [{ id: 1, label: "ledgerSetup.enums.currencyPolicy.any" }, { id: 2, label: "ledgerSetup.enums.currencyPolicy.functionalOnly" }, { id: 3, label: "ledgerSetup.enums.currencyPolicy.specificCurrency" }];
const dimensionRequirementOptions: readonly LedgerSetupOption[] = [{ id: 1, label: "ledgerSetup.enums.dimensionRequirement.optional" }, { id: 2, label: "ledgerSetup.enums.dimensionRequirement.required" }, { id: 3, label: "ledgerSetup.enums.dimensionRequirement.forbidden" }];
const resetPolicyOptions: readonly LedgerSetupOption[] = [{ id: 1, label: "ledgerSetup.enums.resetPolicy.never" }, { id: 2, label: "ledgerSetup.enums.resetPolicy.fiscalYear" }];
const companyOnlyOption: readonly LedgerSetupOption[] = [{ id: 1, label: "ledgerSetup.enums.company" }];

const field = (name: string, options: Omit<LedgerSetupField, "name" | "label"> = {}): LedgerSetupField => ({ name, label: `ledgerSetup.fields.${name}`, ...options });

const entityDefinitions: Record<LedgerSetupEntity, LedgerSetupEntityDefinition> = {
  settings: { entity: "settings", titleKey: "ledgerSetup.companySettings.title", fields: [field("functionalCurrencyId", { type: "select", optionSource: "currencies", required: true }), field("primaryBookId", { type: "select", optionSource: "books", required: true })] },
  accounts: { entity: "accounts", titleKey: "ledgerSetup.accounts.title", tree: true, supportsArchive: true, fields: [field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true }), field("accountHierarchyLevelId", { type: "select", optionSource: "hierarchyLevels", required: true }), field("parentAccountId", { type: "select", optionSource: "accounts" }), field("allowPosting", { type: "select", options: booleanOptions, required: true }), field("manualPostingPolicy", { type: "select", options: manualPostingOptions, required: true }), field("currencyPolicy", { type: "select", options: currencyPolicyOptions, required: true }), field("specificCurrencyId", { type: "select", optionSource: "currencies" })] },
  hierarchyLevels: { entity: "hierarchyLevels", titleKey: "ledgerSetup.hierarchyLevels.title", supportsArchive: true, fields: [field("levelNumber", { type: "number", required: true }), field("nameAr", { required: true }), field("nameEn", { required: true }), field("canPost", { type: "select", options: booleanOptions, required: true })] },
  dimensionDefinitions: { entity: "dimensionDefinitions", titleKey: "ledgerSetup.dimensions.definitions", supportsArchive: true, fields: [field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true }), field("valueSource", { type: "select", options: [{ id: 1, label: "ledgerSetup.enums.accountingOwned" }], required: true })] },
  dimensionValues: { entity: "dimensionValues", titleKey: "ledgerSetup.dimensions.values", supportsArchive: true, scope: "dimension", fields: [field("dimensionDefinitionId", { type: "select", optionSource: "dimensions", required: true }), field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true })] },
  dimensionPolicies: { entity: "dimensionPolicies", titleKey: "ledgerSetup.dimensions.policies", scope: "account", fields: [field("accountId", { type: "select", optionSource: "accounts", required: true }), field("dimensionDefinitionId", { type: "select", optionSource: "dimensions", required: true }), field("requirement", { type: "select", options: dimensionRequirementOptions, required: true })] },
  books: { entity: "books", titleKey: "ledgerSetup.books.title", supportsArchive: true, fields: [field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true })] },
  journals: { entity: "journals", titleKey: "ledgerSetup.journals.title", supportsArchive: true, fields: [field("bookId", { type: "select", optionSource: "books", required: true }), field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true }), field("categoryCode", { required: true }), field("numberPrefix", { required: true }), field("numberPadding", { type: "number", required: true }), field("resetPolicy", { type: "select", options: resetPolicyOptions, required: true }), field("nextNumber", { type: "number", required: true })] },
  exchangeRateTypes: { entity: "exchangeRateTypes", titleKey: "ledgerSetup.exchangeRates.types", supportsArchive: true, fields: [field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true })] },
  exchangeRates: { entity: "exchangeRates", titleKey: "ledgerSetup.exchangeRates.rates", fields: [field("exchangeRateTypeId", { type: "select", optionSource: "exchangeRateTypes", required: true }), field("fromCurrencyId", { type: "select", optionSource: "currencies", required: true }), field("toCurrencyId", { type: "select", optionSource: "currencies", required: true }), field("effectiveFrom", { type: "date", required: true }), field("effectiveTo", { type: "date" }), field("version", { type: "number", required: true }), field("rate", { type: "number", required: true })] },
  accountMappings: { entity: "accountMappings", titleKey: "ledgerSetup.accountDetermination.mappings", fields: [field("bookId", { type: "select", optionSource: "books", required: true }), field("purposeCode", { required: true }), field("sourceType", { type: "select", options: companyOnlyOption, required: true }), field("sourceReferenceId"), field("accountId", { type: "select", optionSource: "accounts", required: true }), field("effectiveFrom", { type: "date", required: true }), field("effectiveTo", { type: "date" })] },
  postingProfiles: { entity: "postingProfiles", titleKey: "ledgerSetup.accountDetermination.profiles", fields: [field("bookId", { type: "select", optionSource: "books", required: true }), field("code", { required: true }), field("nameAr", { required: true }), field("nameEn", { required: true }), field("purposeCode", { required: true }), field("contextType", { type: "select", options: companyOnlyOption, required: true }), field("contextReferenceId"), field("accountId", { type: "select", optionSource: "accounts", required: true }), field("priority", { type: "number", required: true }), field("version", { type: "number", required: true }), field("effectiveFrom", { type: "date", required: true }), field("effectiveTo", { type: "date" })] },
};

const resourceEntities: Record<LedgerSetupResource, readonly LedgerSetupEntity[]> = {
  "company-settings": ["settings"], accounts: ["accounts"], "hierarchy-levels": ["hierarchyLevels"],
  dimensions: ["dimensionDefinitions", "dimensionValues", "dimensionPolicies"], books: ["books"], journals: ["journals"],
  "exchange-rates": ["exchangeRateTypes", "exchangeRates"], "account-determination": ["accountMappings", "postingProfiles"],
};

function selectionValue(event: unknown): number | undefined {
  if (event && typeof event === "object" && "target" in event) {
    const value = (event as { target?: { value?: unknown } }).target?.value;
    return typeof value === "number" ? value : Number(value) || undefined;
  }
  return undefined;
}

function normalizeFieldValue(fieldDefinition: LedgerSetupField, value: LedgerSetupFormValues[string]) {
  if (fieldDefinition.type === "number") return value === "" || value == null ? null : Number(value);
  return value === undefined || value === "" ? null : value;
}

function displayName(item: LedgerSetupRecord): string {
  const code = item.code ?? item.currencyCode;
  const name = item.nameEn ?? item.nameAr;
  return [code, name].filter(Boolean).join(" — ") || String(item.id ?? "");
}

function flattenTree(nodes: readonly LedgerSetupRecord[], parentAccountId: number | null = null): LedgerSetupRecord[] {
  return nodes.flatMap((node) => {
    const normalized = { ...node, parentAccountId };
    const children = Array.isArray(node.children) ? node.children.filter((child): child is LedgerSetupRecord => Boolean(child) && typeof child === "object") : [];
    return [normalized, ...flattenTree(children, typeof node.id === "number" ? node.id : null)];
  });
}

function EntityPanel({ definition, canManage }: { definition: LedgerSetupEntityDefinition; canManage: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const auth = usePermissions();
  const requestedSources = Array.from(new Set([
    ...definition.fields.flatMap((item) => item.optionSource ? [item.optionSource] : []),
    ...(definition.scope === "account" ? ["accounts" as const] : definition.scope === "dimension" ? ["dimensions" as const] : []),
  ]));
  const allowedSources = requestedSources.filter((source): source is LedgerSetupLookupSource =>
    source === "accounts" || source === "hierarchyLevels"
      ? auth.hasPermission(permissions.ViewAccounts)
      : source === "dimensions"
        ? auth.hasPermission(permissions.ViewDimensions)
        : auth.hasPermission(permissions.ViewAccountingSetup),
  );
  const lookupsQuery = useQuery({ queryKey: ["accounting", "ledger-setup", "lookups", allowedSources], queryFn: () => ledgerSetupService.lookups(allowedSources), enabled: allowedSources.length > 0 });
  const scopeOptions = definition.scope === "dimension" ? lookupsQuery.data?.dimensions : definition.scope === "account" ? lookupsQuery.data?.accounts : undefined;
  const [selectedScopeId, setSelectedScopeId] = useState<number | undefined>();
  const [pageModel, setPageModel] = useState({ page: 0, pageSize: 50 });
  const [search, setSearch] = useState("");
  const scopeId = scopeOptions?.some((option) => Number(option.id) === selectedScopeId)
    ? selectedScopeId
    : scopeOptions?.[0]?.id ? Number(scopeOptions[0].id) : undefined;
  const serverSearch = definition.entity === "accounts" || definition.entity === "dimensionDefinitions" ? search.trim() : undefined;
  const paged = ["accounts", "dimensionDefinitions", "dimensionValues", "journals", "exchangeRates", "accountMappings", "postingProfiles"].includes(definition.entity);
  const queryKey = ["accounting", "ledger-setup", definition.entity, scopeId, pageModel.page, pageModel.pageSize, serverSearch] as const;
  const query = useQuery({ queryKey, queryFn: () => ledgerSetupService.list(definition.entity, scopeId, pageModel.page + 1, pageModel.pageSize, serverSearch), enabled: !definition.scope || Boolean(scopeId) });
  const treeQuery = useQuery({ queryKey: ["accounting", "ledger-setup", "account-tree"], queryFn: ledgerSetupService.tree, enabled: Boolean(definition.tree) });
  const [dialog, setDialog] = useState<"create" | "edit" | "view" | "archive" | "restore" | null>(null);
  const [selected, setSelected] = useState<LedgerSetupRecord | null>(null);
  const schema = useMemo(() => createLedgerSetupSchema(definition.fields, t("ledgerSetup.validation.required")), [definition.fields, t]);
  const form = useForm<LedgerSetupFormValues>({ resolver: zodResolver(schema), defaultValues: {} });
  const mockSequence = useRef(1);
  const currencyPolicy = useWatch({ control: form.control, name: "currencyPolicy" });
  const mutation = useMutation({ mutationFn: (values: LedgerSetupFormValues) => ledgerSetupService.save(definition.entity, dialog === "edit" ? selected?.id ?? null : null, { ...Object.fromEntries(definition.fields.map((item) => [item.name, normalizeFieldValue(item, values[item.name])])), ...(definition.entity === "accounts" && Number(values.currencyPolicy) !== 3 ? { specificCurrencyId: null } : {}), rowVersion: selected?.rowVersion }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["accounting", "ledger-setup"] }); showToast.success(t("ledgerSetup.messages.saved")); setDialog(null); } });
  const lifecycle = useMutation<void>({ mutationFn: async () => { if (dialog === "restore") await ledgerSetupService.restore(definition.entity, selected ?? {}); else await ledgerSetupService.archive(definition.entity, selected ?? {}); }, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["accounting", "ledger-setup"] }); showToast.success(t(dialog === "restore" ? "ledgerSetup.messages.restored" : "ledgerSetup.messages.archived")); setDialog(null); } });
  const openForm = (mode: "create" | "edit" | "view", item?: LedgerSetupRecord) => { const value = item ?? (scopeId && definition.scope ? { [definition.scope === "account" ? "accountId" : "dimensionDefinitionId"]: scopeId } : {}); setSelected(item ?? null); form.reset(value as LedgerSetupFormValues); setDialog(mode); };
  const openTreeAccount = async (mode: "edit" | "view", item: LedgerSetupRecord) => {
    if (typeof item.id !== "number") return;
    try {
      const account = await queryClient.fetchQuery({ queryKey: ["accounting", "ledger-setup", "account", item.id], queryFn: () => ledgerSetupService.account(item.id!), staleTime: 0 });
      openForm(mode, account);
    } catch (error) { showToast.error(error, t("ledgerSetup.messages.loadFailed")); }
  };
  const submit = form.handleSubmit(async (values) => { try { await mutation.mutateAsync(values); } catch (error) { applyApiFieldErrors(error, form.setError); showToast.error(error, t("ledgerSetup.messages.saveFailed")); } });
  const lookupOptions = (fieldDefinition: LedgerSetupField): LedgerSetupOption[] => {
    if (fieldDefinition.options) return [...fieldDefinition.options].map((option) => ({ ...option, label: t(option.label) }));
    const records = fieldDefinition.optionSource ? lookupsQuery.data?.[fieldDefinition.optionSource] ?? [] : [];
    return records.filter((item) => fieldDefinition.name !== "parentAccountId" || item.id !== selected?.id).map((item) => ({ id: Number(item.id), label: displayName(item) }));
  };
  const mockLookups = lookupsQuery.data ?? {};
  const mockUnavailable = !canCreateLedgerSetupMockDraft(definition.fields, mockLookups);
  const generateMock = () => {
    const draft = createLedgerSetupMockDraft({
      fields: definition.fields,
      lookups: mockLookups,
      sequence: mockSequence.current++,
      currentValues: form.getValues(),
    });
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      form.setValue(name, value, { shouldDirty: true, shouldValidate: true });
    }
  };
  const rows = query.data ?? [];
  const treeRows = treeQuery.data ? flattenTree(treeQuery.data) : rows;
  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
    {definition.scope ? <MySelect dataSource={(scopeOptions ?? []).map((item) => ({ id: Number(item.id), label: displayName(item) }))} selectedItem={scopeId} handleSelectionChange={(event) => { setSelectedScopeId(selectionValue(event)); setPageModel((current) => ({ ...current, page: 0 })); }} label={t(definition.scope === "account" ? "ledgerSetup.fields.accountId" : "ledgerSetup.fields.dimensionDefinitionId")} valueMember="id" displayMember="label" all={false} showClearButton={false} loading={lookupsQuery.isLoading} /> : null}
    {query.isFetching ? <LinearProgress /> : null}
    {query.error ? <Alert severity="error">{extractErrorMessage(query.error) || t("ledgerSetup.messages.loadFailed")}</Alert> : null}
    {canManage ? <Box><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openForm(definition.entity === "settings" && rows[0] ? "edit" : "create", rows[0])}>{t(definition.entity === "settings" && rows[0] ? "actions.edit" : "ledgerSetup.actions.add")}</Button></Box> : null}
    {definition.tree ? <SplitTreeView items={treeRows} getId={(item) => Number(item.id)} getParentId={(item) => typeof item.parentAccountId === "number" ? item.parentAccountId : null} getCode={(item) => String(item.code ?? "")} getName={(item) => String(item.nameEn ?? "")} getSecondaryName={(item) => String(item.nameAr ?? "")} getIsDeleted={(item) => Boolean(item.isDeleted)} searchFilter={(item, term) => displayName(item).toLowerCase().includes(term.toLowerCase())} searchPlaceholder={t("ledgerSetup.search")} canDrag={false} onEdit={(item) => { if (canManage) void openTreeAccount("edit", item); }} onSelect={(item) => { if (item) void openTreeAccount("view", item); }} /> : <MyDataGrid rows={rows.map((row, index) => ({ ...row, id: row.id ?? index }))} columns={[...definition.fields.slice(0, 6).map((item) => ({ field: item.name, headerName: t(item.label), flex: 1, minWidth: 130 })), { field: "recordState", headerName: t("ledgerSetup.fields.status"), width: 120, renderCell: ({ row }) => <Chip size="small" label={t(row.isDeleted ? "ledgerSetup.status.archived" : "ledgerSetup.status.active")} color={row.isDeleted ? "warning" : "success"} /> }, { field: "actions", headerName: t("actions.buttons"), minWidth: 230, sortable: false, renderCell: ({ row }) => <Box sx={{ display: "flex", gap: .5 }}><Button size="small" onClick={() => openForm("view", row)}>{t("actions.view")}</Button>{canManage && !row.isDeleted ? <Button size="small" onClick={() => openForm("edit", row)}>{t("actions.edit")}</Button> : null}{canManage && definition.supportsArchive ? <Button size="small" color="warning" startIcon={row.isDeleted ? <RestoreRoundedIcon /> : <ArchiveRoundedIcon />} onClick={() => { setSelected(row); setDialog(row.isDeleted ? "restore" : "archive"); }}>{t(row.isDeleted ? "actions.restore" : "actions.archive")}</Button> : null}</Box> }]} loading={query.isLoading} autoHeight disableRowSelectionOnClick paginationMode={paged ? "server" : "client"} paginationModel={paged ? pageModel : undefined} onPaginationModelChange={paged ? setPageModel : undefined} pageSizeOptions={paged ? [25, 50, 100] : undefined} rowCount={paged ? pageModel.page * pageModel.pageSize + rows.length + (rows.length === pageModel.pageSize ? 1 : 0) : undefined} toolbarSearch={serverSearch !== undefined ? { value: search, onChange: (value) => { setSearch(value); setPageModel((current) => ({ ...current, page: 0 })); }, onClear: () => { setSearch(""); setPageModel((current) => ({ ...current, page: 0 })); }, placeholder: t("ledgerSetup.search") } : undefined} />}
    <MyForm open={dialog === "create" || dialog === "edit" || dialog === "view"} onClose={() => setDialog(null)} title={t(definition.titleKey)} subtitle={t("ledgerSetup.form.subtitle")} submitButtonText={t(dialog === "edit" ? "actions.update" : "actions.create")} isViewMode={dialog === "view"} hideFooter={dialog === "view"} isSubmitting={mutation.isPending} isDirty={form.formState.isDirty} errors={toFormErrorMessages(form.formState.errors)} errorLabels={Object.fromEntries(definition.fields.map((item) => [item.name, t(item.label)]))} onSubmit={dialog === "view" ? undefined : submit} mockDataAction={dialog !== "view" ? { onGenerate: generateMock, disabled: mutation.isPending || lookupsQuery.isLoading || Boolean(lookupsQuery.error) || mockUnavailable } : undefined}>
      {dialog === "view" && canManage && definition.supportsArchive && selected?.rowVersion ? <Button color="warning" startIcon={selected.isDeleted ? <RestoreRoundedIcon /> : <ArchiveRoundedIcon />} onClick={() => setDialog(selected.isDeleted ? "restore" : "archive")}>{t(selected.isDeleted ? "actions.restore" : "actions.archive")}</Button> : null}
      {definition.fields.filter((item) => item.name !== "specificCurrencyId" || definition.entity !== "accounts" || Number(currencyPolicy) === 3).map((item) => item.type === "select" ? <MySelect key={item.name} name={item.name} label={t(item.label)} control={form.control} dataSource={lookupOptions(item)} valueMember="id" displayMember="label" errors={form.formState.errors} required={item.required || (item.name === "specificCurrencyId" && Number(currencyPolicy) === 3)} isViewMode={dialog === "view"} showClearButton={!item.required && dialog !== "view"} /> : <MyTextField key={item.name} fieldName={item.name} labelKey={t(item.label)} control={form.control} errors={form.formState.errors} type={item.type === "number" ? "number" : item.type === "date" ? "date" : "text"} required={item.required} readOnly={dialog === "view"} />)}
    </MyForm>
    <ConfirmationDialog open={dialog === "archive" || dialog === "restore"} title={t(dialog === "restore" ? "ledgerSetup.confirm.restoreTitle" : "ledgerSetup.confirm.archiveTitle")} description={t(dialog === "restore" ? "ledgerSetup.confirm.restoreDescription" : "ledgerSetup.confirm.archiveDescription")} confirmLabel={t(dialog === "restore" ? "common.restore" : "common.archive")} cancelLabel={t("actions.cancel")} confirmColor={dialog === "restore" ? "success" : "warning"} busy={lifecycle.isPending} onClose={() => setDialog(null)} onConfirm={() => void lifecycle.mutateAsync()}><Typography sx={{ fontWeight: 700 }}>{selected ? displayName(selected) : ""}</Typography></ConfirmationDialog>
  </Box>;
}

function ResolutionPreview({ canView }: { canView: boolean }) {
  const { t } = useTranslation();
  const lookups = useQuery({ queryKey: ["accounting", "ledger-setup", "lookups", ["books"]], queryFn: () => ledgerSetupService.lookups(["books"]) });
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ResolveAccountPreviewResponse | null>(null);
  const schema = useMemo(() => createLedgerSetupSchema([field("bookId", { type: "select", required: true }), field("purposeCode", { required: true }), field("onDate", { required: true })], t("ledgerSetup.validation.required")), [t]);
  const form = useForm<LedgerSetupFormValues>({ resolver: zodResolver(schema), defaultValues: { onDate: new Date().toISOString().slice(0, 10) } });
  const preview = useMutation({ mutationFn: ledgerSetupService.resolvePreview, onSuccess: setResult });
  if (!canView) return null;
  return <Box sx={{ mt: 1 }}><Button variant="outlined" onClick={() => setOpen(true)}>{t("ledgerSetup.accountDetermination.preview")}</Button><MyForm open={open} title={t("ledgerSetup.accountDetermination.preview")} subtitle={t("ledgerSetup.accountDetermination.previewHelp")} submitButtonText={t("ledgerSetup.actions.resolve")} isSubmitting={preview.isPending} isDirty={form.formState.isDirty} errors={toFormErrorMessages(form.formState.errors)} errorLabels={{ bookId: t("ledgerSetup.fields.bookId"), purposeCode: t("ledgerSetup.fields.purposeCode"), onDate: t("ledgerSetup.fields.onDate"), contextReferenceId: t("ledgerSetup.fields.contextReferenceId") }} onClose={() => { setOpen(false); setResult(null); }} onSubmit={form.handleSubmit((values) => preview.mutate({ bookId: Number(values.bookId), purposeCode: String(values.purposeCode), onDate: String(values.onDate), contextReferenceId: values.contextReferenceId ? String(values.contextReferenceId) : null }))}><MySelect name="bookId" label={t("ledgerSetup.fields.bookId")} control={form.control} dataSource={(lookups.data?.books ?? []).map((item) => ({ id: Number(item.id), label: displayName(item) }))} valueMember="id" displayMember="label" errors={form.formState.errors} loading={lookups.isLoading} required /><MyTextField fieldName="purposeCode" labelKey={t("ledgerSetup.fields.purposeCode")} control={form.control} errors={form.formState.errors} required /><MyTextField fieldName="onDate" labelKey={t("ledgerSetup.fields.onDate")} control={form.control} errors={form.formState.errors} type="date" required /><MyTextField fieldName="contextReferenceId" labelKey={t("ledgerSetup.fields.contextReferenceId")} control={form.control} errors={form.formState.errors} />{result ? <Alert severity={result.status === 1 ? "success" : "warning"}>{t(`ledgerSetup.resolutionStatus.${result.status}`)}{result.accountId ? ` — ${t("ledgerSetup.fields.accountId")}: ${result.accountId}` : ""}</Alert> : null}</MyForm></Box>;
}

export default function LedgerSetupResourcePage({ resource }: { resource: LedgerSetupResource }) {
  const { t } = useTranslation();
  const auth = usePermissions();
  const entities = resourceEntities[resource];
  const [activeEntity, setActiveEntity] = useState<LedgerSetupEntity>(entities[0]);
  const accountArea = activeEntity === "accounts" || activeEntity === "hierarchyLevels";
  const dimensionArea = activeEntity === "dimensionDefinitions" || activeEntity === "dimensionValues" || activeEntity === "dimensionPolicies";
  const canView = accountArea ? auth.hasPermission(permissions.ViewAccounts) : dimensionArea ? auth.hasPermission(permissions.ViewDimensions) : auth.hasPermission(permissions.ViewAccountingSetup);
  const canManage = !auth.isReadOnly && (accountArea ? auth.hasPermission(permissions.ManageAccounts) : dimensionArea ? auth.hasPermission(permissions.ManageDimensions) : auth.hasPermission(permissions.ManageAccountingSetup));
  if (!canView) return <Alert severity="error">{t("common.accessDenied")}</Alert>;
  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%", minHeight: 0 }}><PageHeader title={t("menu.ledgerSetup")} subTitle={t("ledgerSetup.subtitle")} />{entities.length > 1 ? <Tabs value={activeEntity} onChange={(_, value: LedgerSetupEntity) => setActiveEntity(value)} variant="scrollable" scrollButtons="auto">{entities.map((entity) => <Tab key={entity} value={entity} label={t(entityDefinitions[entity].titleKey)} />)}</Tabs> : null}<EntityPanel key={activeEntity} definition={entityDefinitions[activeEntity]} canManage={canManage} />{resource === "account-determination" ? <ResolutionPreview canView={canView} /> : null}</Box>;
}
