"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import {
  useTenantsQuery,
  type TenantManagementResponse,
} from "@/features/tenants";
import { tenantAdminApi, tenantAdminKeys } from "./tenantAdminApi";
import type {
  TenantAdminFormState,
  TenantAdminRequest,
  TenantAdminResponse,
} from "./types";

export default function TenantAdminManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const tenantsQuery = useTenantsQuery();
  const adminsQuery = useQuery({
    queryKey: tenantAdminKeys.all,
    queryFn: tenantAdminApi.getAll,
  });
  const [editing, setEditing] = useState<TenantAdminResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<TenantAdminResponse | null>(null);

  const saveMutation = useMutation({
    mutationFn: ({ id, request }: { id: string | null; request: TenantAdminRequest }) =>
      id ? tenantAdminApi.update(id, request) : tenantAdminApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
      setFormOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tenantAdminApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
      setDeleting(null);
    },
  });

  const openCreate = () => {
    saveMutation.reset();
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (admin: TenantAdminResponse) => {
    saveMutation.reset();
    setEditing(admin);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <ContentWrapper>
      <PageHeader
        title={t("tenantAdmins.title")}
        subTitle={t("tenantAdmins.subtitle")}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t("tenantAdmins.add")}
        </Button>
      </Box>

      {adminsQuery.isLoading || tenantsQuery.isLoading ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : adminsQuery.isError || tenantsQuery.isError ? (
        <Alert severity="error">
          {getErrorMessage(adminsQuery.error ?? tenantsQuery.error)}
        </Alert>
      ) : adminsQuery.data?.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 2,
          }}
        >
          {adminsQuery.data.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={() => openEdit(admin)}
              onDelete={() => setDeleting(admin)}
            />
          ))}
        </Box>
      ) : (
        <Alert severity="info">{t("tenantAdmins.empty")}</Alert>
      )}

      <TenantAdminForm
        open={formOpen}
        admin={editing}
        tenants={tenantsQuery.data ?? []}
        loading={saveMutation.isPending}
        error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
        onClose={closeForm}
        onSave={(request) =>
          saveMutation.mutate({ id: editing?.id ?? null, request })}
      />

      <DeleteConfirmationDialog
        open={deleting !== null}
        itemLabel={deleting ? `${deleting.firstName} ${deleting.lastName}` : ""}
        loading={deleteMutation.isPending}
        onClose={() => !deleteMutation.isPending && setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </ContentWrapper>
  );
}

function AdminCard({
  admin,
  onEdit,
  onDelete,
}: {
  admin: TenantAdminResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <ManageAccountsIcon color="primary" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" noWrap>
              {admin.firstName} {admin.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {admin.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{admin.userName}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={admin.isDisabled || admin.isLocked ? "error" : "success"}
            label={admin.isDisabled
              ? t("tenantAdmins.disabled")
              : admin.isLocked
                ? t("tenantAdmins.locked")
                : t("tenantAdmins.active")}
          />
        </Stack>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          {t("tenantAdmins.assignedTenants")}
        </Typography>
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
          {admin.tenants.map((tenant) => (
            <Chip
              key={tenant.id}
              size="small"
              color={tenant.isDefault ? "primary" : "default"}
              variant={tenant.isDefault ? "filled" : "outlined"}
              label={tenant.isDefault
                ? `${tenant.name} ? ${t("tenantAdmins.default")}`
                : tenant.name}
            />
          ))}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          {t("actions.edit")}
        </Button>
        <Button color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          {t("actions.delete")}
        </Button>
      </CardActions>
    </Card>
  );
}

function TenantAdminForm({
  open,
  admin,
  tenants,
  loading,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  admin: TenantAdminResponse | null;
  tenants: TenantManagementResponse[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (request: TenantAdminRequest) => void;
}) {
  const { t } = useTranslation();
  const defaults = useMemo(() => toForm(admin), [admin]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TenantAdminFormState>({ defaultValues: defaults });

  useEffect(() => {
    if (open) reset(defaults);
  }, [defaults, open, reset]);

  const selectedTenantIds = useWatch({ control, name: "tenantIds" });
  const defaultTenantId = useWatch({ control, name: "defaultTenantId" });
  useEffect(() => {
    if (!selectedTenantIds.includes(defaultTenantId)) {
      setValue("defaultTenantId", selectedTenantIds[0] ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [defaultTenantId, selectedTenantIds, setValue]);

  const tenantOptions = tenants.map((tenant) => ({
    id: tenant.id,
    label: `${tenant.name} (${tenant.identifier})`,
  }));
  const selectedTenantOptions = tenantOptions.filter((tenant) =>
    selectedTenantIds.includes(tenant.id));

  const submit = (values: TenantAdminFormState) => {
    onSave({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      userName: values.userName.trim(),
      email: values.email.trim(),
      password: values.password.trim() || undefined,
      isDisabled: values.isDisabled,
      tenantIds: values.tenantIds,
      defaultTenantId: values.defaultTenantId,
    });
  };

  return (
    <MyForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit(submit)}
      title={admin ? t("tenantAdmins.edit") : t("tenantAdmins.add")}
      subtitle={t("tenantAdmins.formSubtitle")}
      submitButtonText={t("actions.save")}
      isSubmitting={loading}
      isDirty={isDirty}
      maxWidth="md"
      icon={<ManageAccountsIcon />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          pt: 1,
        }}
      >
        <MyTextField
          fieldName="firstName"
          label={t("tenantAdmins.firstName")}
          register={register("firstName", { required: t("validation.required") })}
          errors={errors}
          required
          margin="none"
        />
        <MyTextField
          fieldName="lastName"
          label={t("tenantAdmins.lastName")}
          register={register("lastName", { required: t("validation.required") })}
          errors={errors}
          required
          margin="none"
        />
        <MyTextField
          fieldName="userName"
          label={t("tenantAdmins.userName")}
          register={register("userName", { required: t("validation.required") })}
          errors={errors}
          required
          margin="none"
        />
        <MyTextField
          fieldName="email"
          label={t("tenantAdmins.email")}
          type="email"
          register={register("email", { required: t("validation.required") })}
          errors={errors}
          required
          margin="none"
        />
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <MyTextField
            fieldName="password"
            label={admin ? t("tenantAdmins.newPassword") : t("tenantAdmins.password")}
            type="password"
            register={register("password", admin
              ? {}
              : { required: t("validation.required") })}
            errors={errors}
            required={!admin}
            margin="none"
          />
        </Box>
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <MySelect
            control={control}
            name="tenantIds"
            label={t("tenantAdmins.tenants")}
            dataSource={tenantOptions}
            valueMember="id"
            displayMember="label"
            multiple
            required
            errors={errors}
            showClearButton
          />
        </Box>
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <MySelect
            control={control}
            name="defaultTenantId"
            label={t("tenantAdmins.defaultTenant")}
            dataSource={selectedTenantOptions}
            valueMember="id"
            displayMember="label"
            required
            errors={errors}
            all={false}
            showClearButton={false}
          />
        </Box>
        {admin ? (
          <Controller
            control={control}
            name="isDisabled"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />}
                label={t("tenantAdmins.disableAccount")}
              />
            )}
          />
        ) : null}
      </Box>
      {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
    </MyForm>
  );
}

function toForm(admin: TenantAdminResponse | null): TenantAdminFormState {
  return {
    firstName: admin?.firstName ?? "",
    lastName: admin?.lastName ?? "",
    userName: admin?.userName ?? "",
    email: admin?.email ?? "",
    password: "",
    isDisabled: admin?.isDisabled ?? false,
    tenantIds: admin?.tenants.map((tenant) => tenant.id) ?? [],
    defaultTenantId: admin?.defaultTenantId ?? "",
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error &&
      typeof error.message === "string") {
    return error.message;
  }
  return "Unable to manage tenant administrator.";
}
