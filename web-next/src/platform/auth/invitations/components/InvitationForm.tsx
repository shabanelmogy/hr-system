import { Box, Divider, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import useRoleStore from "@/platform/auth/roles/store/useRoleStore";
import useUserStore from "@/platform/auth/users/store/useUserStore";
import type { Translator } from "@/platform/auth/types";
import { getInvitationValidationSchema, type InvitationFormData } from "../utils/validation";

interface InvitationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InvitationFormData) => void | Promise<void>;
  loading: boolean;
  t: Translator;
}

export default function InvitationForm({ open, onClose, onSubmit, loading, t }: InvitationFormProps) {
  const { i18n } = useTranslation();
  const { loading: optionsLoading, handleApiCall } = useApiHandler({
    showSuccessNotification: false,
    showErrorNotification: false,
  });
  const roles = useRoleStore((state) => state.roles);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const companies = useUserStore((state) => state.companyOptions);
  const fetchCompanyOptions = useUserStore((state) => state.fetchCompanyOptions);
  const schema = useMemo(() => getInvitationValidationSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<InvitationFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      roles: [],
      companyIds: [],
      defaultCompanyId: 0,
    },
  });
  const selectedCompanyIds = useWatch({ control, name: "companyIds" }) ?? [];

  useEffect(() => {
    if (!open) return;
    reset({ firstName: "", lastName: "", userName: "", email: "", roles: [], companyIds: [], defaultCompanyId: 0 });
    void handleApiCall(async () => {
      await Promise.all([fetchRoles(), fetchCompanyOptions()]);
    });
  }, [fetchCompanyOptions, fetchRoles, handleApiCall, open, reset]);

  const roleOptions = useMemo(() => roles
    .filter((role) => !role.isDeleted)
    .map((role) => ({ value: role.name, label: role.name })), [roles]);

  const companyOptions = useMemo(() => companies
    .filter((company) => company.isActive)
    .map((company) => ({
      id: company.id,
      value: company.id,
      label: i18n.language.startsWith("ar") ? company.nameAr : company.nameEn,
    })), [companies, i18n.language]);

  const defaultCompanyOptions = companyOptions.filter((company) => selectedCompanyIds.includes(company.id));

  const submit = async (data: InvitationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      applyApiFieldErrors(error, setError, {
        FirstName: "firstName",
        LastName: "lastName",
        UserName: "userName",
        Email: "email",
        Roles: "roles",
        CompanyIds: "companyIds",
        DefaultCompanyId: "defaultCompanyId",
        "User.DuplicatedUserName": "userName",
        "User.DuplicatedEmail": "email",
        "Role.InvalidRoles": "roles",
      });
      throw error;
    }
  };

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t("users.sendInvitation")}
      subtitle={t("invitations.subTitle")}
      submitButtonText={t("users.sendInvitation")}
      onSubmit={handleSubmit(submit)}
      isSubmitting={loading || optionsLoading}
      isDirty={isDirty}
      focusFieldName="firstName"
      autoFocusFirst
    >
      <MyTextField fieldName="firstName" labelKey={t("users.firstName")} control={control} errors={errors} maxValue={50} required />
      <MyTextField fieldName="lastName" labelKey={t("users.lastName")} control={control} errors={errors} maxValue={50} required />
      <MyTextField fieldName="userName" labelKey={t("users.userName")} control={control} errors={errors} maxValue={50} required />
      <MyTextField fieldName="email" labelKey={t("users.email")} control={control} errors={errors} type="email" required />

      <MySelect
        control={control}
        name="roles"
        label={t("users.roles")}
        dataSource={roleOptions}
        valueMember="value"
        displayMember="label"
        multiple
        required
        loading={optionsLoading}
        disabled={loading}
        errors={errors}
        actualFieldName="roles"
      />

      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }}><Typography variant="body2" color="text.secondary">{t("users.companyAccessSection")}</Typography></Divider>
        <MySelect
          control={control}
          name="companyIds"
          label={t("users.companies")}
          dataSource={companyOptions}
          valueMember="value"
          displayMember="label"
          multiple
          required
          loading={optionsLoading}
          disabled={loading}
          errors={errors}
          actualFieldName="companyIds"
          onChange={(_event, selected) => {
            const selectedCompanies = Array.isArray(selected) ? selected : [];
            const selectedIds = selectedCompanies.map((company) => company.id);
            if (!selectedIds.includes(getValues("defaultCompanyId"))) {
              setValue("defaultCompanyId", selectedIds[0] ?? 0, { shouldDirty: true, shouldValidate: true });
            }
          }}
        />
        <Box sx={{ mt: 2 }}>
          <MySelect
            control={control}
            name="defaultCompanyId"
            label={t("users.defaultCompany")}
            dataSource={defaultCompanyOptions}
            valueMember="value"
            displayMember="label"
            required
            loading={optionsLoading}
            disabled={loading || selectedCompanyIds.length === 0}
            errors={errors}
            actualFieldName="defaultCompanyId"
          />
        </Box>
      </Box>
    </MyForm>
  );
}
