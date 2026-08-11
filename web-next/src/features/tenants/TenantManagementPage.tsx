"use client";

import AddIcon from "@mui/icons-material/Add";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { tenantApi, tenantKeys } from "./tenantApi";
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantManagementRequest,
  type TenantManagementResponse,
} from "./types";

interface TenantFormState {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string;
  planName: string;
  maxAdmins: string;
  maxUsers: string;
  billingEmail: string;
  contactName: string;
  contactPhone: string;
  notes: string;
}

export default function TenantManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<TenantManagementResponse | null>(null);
  const [form, setForm] = useState<TenantFormState | null>(null);

  const tenantsQuery = useQuery({
    queryKey: tenantKeys.all,
    queryFn: tenantApi.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, request }: { id: string | null; request: TenantManagementRequest }) =>
      id ? tenantApi.update(id, request) : tenantApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      setEditing(null);
      setForm(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(createEmptyForm());
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    setEditing(tenant);
    setForm(toForm(tenant));
  };

  const closeDialog = () => {
    if (saveMutation.isPending) return;
    setEditing(null);
    setForm(null);
    saveMutation.reset();
  };

  const save = () => {
    if (!form || !form.identifier.trim() || !form.name.trim() || !form.subscriptionStartedOn) return;
    saveMutation.mutate({ id: editing?.id ?? null, request: toRequest(form) });
  };

  return (
    <ContentWrapper>
      <PageHeader
        title={t("tenantManagement.title")}
        subTitle={t("tenantManagement.subtitle")}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t("tenantManagement.addTenant")}
        </Button>
      </Box>

      {tenantsQuery.isLoading ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : tenantsQuery.isError ? (
        <Alert severity="error">{getErrorMessage(tenantsQuery.error)}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 2,
            minWidth: 0,
          }}
        >
          {tenantsQuery.data?.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} onEdit={() => openEdit(tenant)} />
          ))}
        </Box>
      )}

      <TenantDialog
        form={form}
        isEdit={Boolean(editing)}
        error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
        loading={saveMutation.isPending}
        onChange={setForm}
        onClose={closeDialog}
        onSave={save}
      />
    </ContentWrapper>
  );
}

function TenantCard({
  tenant,
  onEdit,
}: {
  tenant: TenantManagementResponse;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" sx={{ minWidth: 0 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start">
          <Stack direction="row" gap={1.5} alignItems="center" minWidth={0}>
            <ApartmentIcon color="primary" />
            <Box minWidth={0}>
              <Typography variant="h6" noWrap>{tenant.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {tenant.identifier}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            color={getStatusColor(tenant.subscriptionStatus)}
            label={t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
          />
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 2 }}>
          <Metric label={t("tenantManagement.admins")} value={`${tenant.adminCount}/${tenant.maxAdmins}`} />
          <Metric label={t("tenantManagement.users")} value={`${tenant.userCount}/${tenant.maxUsers}`} />
          <Metric label={t("tenantManagement.companies")} value={tenant.companyCount} />
          <Metric label={t("tenantManagement.totalAccounts")} value={tenant.totalUserCount} />
        </Box>

        <Stack mt={2} gap={0.5}>
          <Typography variant="body2">
            {t("tenantManagement.plan")}: {tenant.planName || t("tenantManagement.noPlan")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(tenant.subscriptionStartedOn)} - {tenant.subscriptionEndsOn
              ? formatDate(tenant.subscriptionEndsOn)
              : t("tenantManagement.noEndDate")}
          </Typography>
          <Chip
            sx={{ alignSelf: "flex-start", mt: 0.5 }}
            size="small"
            color={tenant.isActive ? "success" : "default"}
            label={tenant.isActive ? t("tenantManagement.enabled") : t("tenantManagement.disabled")}
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          {t("tenantManagement.edit")}
        </Button>
      </CardActions>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6">{value}</Typography>
    </Box>
  );
}

function TenantDialog({
  form,
  isEdit,
  error,
  loading,
  onChange,
  onClose,
  onSave,
}: {
  form: TenantFormState | null;
  isEdit: boolean;
  error: string | null;
  loading: boolean;
  onChange: (form: TenantFormState) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  if (!form) return null;

  const set = <K extends keyof TenantFormState>(key: K, value: TenantFormState[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>
        {isEdit ? t("tenantManagement.editTenant") : t("tenantManagement.addTenant")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          <TextField required label={t("tenantManagement.identifier")} value={form.identifier} onChange={(event) => set("identifier", event.target.value)} />
          <TextField required label={t("tenantManagement.name")} value={form.name} onChange={(event) => set("name", event.target.value)} />
          <TextField label={t("tenantManagement.plan")} value={form.planName} onChange={(event) => set("planName", event.target.value)} />
          <TextField select label={t("tenantManagement.status")} value={form.subscriptionStatus} onChange={(event) => set("subscriptionStatus", event.target.value as SubscriptionStatus)}>
            {subscriptionStatuses.map((status) => <MenuItem key={status} value={status}>{t(`tenantManagement.statuses.${status}`)}</MenuItem>)}
          </TextField>
          <TextField type="date" slotProps={{ inputLabel: { shrink: true } }} label={t("tenantManagement.startsOn")} value={form.subscriptionStartedOn} onChange={(event) => set("subscriptionStartedOn", event.target.value)} />
          <TextField type="date" slotProps={{ inputLabel: { shrink: true } }} label={t("tenantManagement.endsOn")} value={form.subscriptionEndsOn} onChange={(event) => set("subscriptionEndsOn", event.target.value)} />
          <TextField type="number" label={t("tenantManagement.maxAdmins")} value={form.maxAdmins} onChange={(event) => set("maxAdmins", event.target.value)} />
          <TextField type="number" label={t("tenantManagement.maxUsers")} value={form.maxUsers} onChange={(event) => set("maxUsers", event.target.value)} />
          <TextField type="email" label={t("tenantManagement.billingEmail")} value={form.billingEmail} onChange={(event) => set("billingEmail", event.target.value)} />
          <TextField label={t("tenantManagement.contactName")} value={form.contactName} onChange={(event) => set("contactName", event.target.value)} />
          <TextField label={t("tenantManagement.contactPhone")} value={form.contactPhone} onChange={(event) => set("contactPhone", event.target.value)} />
          <FormControlLabel control={<Switch checked={form.isActive} onChange={(_, checked) => set("isActive", checked)} />} label={t("tenantManagement.tenantEnabled")} />
          <TextField multiline minRows={3} sx={{ gridColumn: { sm: "1 / -1" } }} label={t("tenantManagement.notes")} value={form.notes} onChange={(event) => set("notes", event.target.value)} />
        </Box>
        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose}>{t("actions.cancel")}</Button>
        <Button disabled={loading || !form.identifier.trim() || !form.name.trim() || !form.subscriptionStartedOn} variant="contained" onClick={onSave}>
          {loading ? <CircularProgress size={20} /> : t("actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function createEmptyForm(): TenantFormState {
  return {
    identifier: "",
    name: "",
    isActive: true,
    subscriptionStatus: "free",
    subscriptionStartedOn: new Date().toISOString().slice(0, 10),
    subscriptionEndsOn: "",
    planName: "Free",
    maxAdmins: "1",
    maxUsers: "5",
    billingEmail: "",
    contactName: "",
    contactPhone: "",
    notes: "",
  };
}

function toForm(tenant: TenantManagementResponse): TenantFormState {
  return {
    identifier: tenant.identifier,
    name: tenant.name,
    isActive: tenant.isActive,
    subscriptionStatus: tenant.subscriptionStatus,
    subscriptionStartedOn: tenant.subscriptionStartedOn.slice(0, 10),
    subscriptionEndsOn: tenant.subscriptionEndsOn?.slice(0, 10) ?? "",
    planName: tenant.planName ?? "",
    maxAdmins: String(tenant.maxAdmins),
    maxUsers: String(tenant.maxUsers),
    billingEmail: tenant.billingEmail ?? "",
    contactName: tenant.contactName ?? "",
    contactPhone: tenant.contactPhone ?? "",
    notes: tenant.notes ?? "",
  };
}

function toRequest(form: TenantFormState): TenantManagementRequest {
  const optional = (value: string) => value.trim() || null;
  return {
    identifier: form.identifier.trim(),
    name: form.name.trim(),
    isActive: form.isActive,
    subscriptionStatus: form.subscriptionStatus,
    subscriptionStartedOn: new Date(`${form.subscriptionStartedOn}T00:00:00Z`).toISOString(),
    subscriptionEndsOn: form.subscriptionEndsOn ? new Date(`${form.subscriptionEndsOn}T23:59:59Z`).toISOString() : null,
    planName: optional(form.planName),
    maxAdmins: Math.max(1, Number.parseInt(form.maxAdmins, 10) || 1),
    maxUsers: Math.max(0, Number.parseInt(form.maxUsers, 10) || 0),
    billingEmail: optional(form.billingEmail),
    contactName: optional(form.contactName),
    contactPhone: optional(form.contactPhone),
    notes: optional(form.notes),
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function getStatusColor(status: SubscriptionStatus): "default" | "success" | "warning" | "error" | "info" {
  if (status === "active") return "success";
  if (status === "trial") return "info";
  if (status === "pastDue") return "warning";
  if (status === "suspended" || status === "expired" || status === "cancelled") return "error";
  return "default";
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Unable to save tenant.";
}
