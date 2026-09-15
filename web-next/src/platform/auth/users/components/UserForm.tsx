import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  type SvgIconProps,
} from "@mui/material";
import {
  Business,
  VpnKey,
  Security,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getUserValidationSchema,
  type UserFormData,
} from "../utils/validation";
import useRoleStore from "../../roles/store/useRoleStore";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import type { Translator, User } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useSession } from "@/lib/auth/SessionContext";
import { useTranslation } from "react-i18next";
import useUserStore from "../store/useUserStore";

interface UserFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedUser: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  loading: boolean;
  t: Translator;
}

const UserForm = ({
  open,
  dialogType, // "add" | "edit" | "view"
  selectedUser,
  onClose,
  onSubmit,
  loading,
  t,
}: UserFormProps) => {
  const { i18n } = useTranslation();
  const { user: currentUser } = useSession();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const formLifecycleKey = `${open ? "open" : "closed"}:${dialogType}:${selectedUser?.id ?? "new"}`;
  const [passwordSectionState, setPasswordSectionState] = useState({
    lifecycleKey: "",
    visible: false,
  });
  const {
    loading: rolesLoading,
    handleApiCall: handleRolesApiCall,
  } = useApiHandler({
    showSuccessNotification: false,
    showErrorNotification: false,
  });

  const roles = useRoleStore((state) => state.roles);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const companyOptions = useUserStore((state) => state.companyOptions);
  const fetchCompanyOptions = useUserStore((state) => state.fetchCompanyOptions);

  const isViewMode = dialogType === "view";
  const isEditMode = dialogType === "edit";
  const isAddMode = dialogType === "add";
  const showPasswordSection = isAddMode || (
    isEditMode
    && passwordSectionState.lifecycleKey === formLifecycleKey
    && passwordSectionState.visible
  );

  const schema = useMemo(() => getUserValidationSchema(t, isEditMode), [t, isEditMode]);

  const {
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    clearErrors,
    setError,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isDisabled: false,
      roles: [],
      companyIds: [],
      defaultCompanyId: 0,
    },
  });

  // Watch password for strength indicator
  const watchedPassword = useWatch({ control, name: "password" });
  const watchedCompanyIds = useWatch({ control, name: "companyIds" }) ?? [];

  // Fetch roles when form opens
  useEffect(() => {
    if (open) {
      void handleRolesApiCall(async () => {
        await Promise.all([fetchRoles(), fetchCompanyOptions()]);
      });
    }
  }, [open, fetchCompanyOptions, fetchRoles, handleRolesApiCall]);

  // Clear password errors when hiding password section in edit mode
  useEffect(() => {
    if (isEditMode && !showPasswordSection) {
      clearErrors(["password", "confirmPassword"]);
    }
  }, [showPasswordSection, isEditMode, clearErrors]);

  // Get random but consistent color for each role
  const getRandomRoleColor = (roleName: string) => {
    const colors = ["primary", "warning", "error", "secondary", "success"] as const;

    let hash = 0;
    if (roleName) {
      for (let i = 0; i < roleName.length; i++) {
        const char = roleName.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
    }

    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Convert roles to autocomplete options
  const roleOptions = roles.filter((role) => !role.isDeleted).map((role) => ({
      label: role.name,
      value: role.name,
      color: getRandomRoleColor(role.name),
      ...role,
    }));
  const localizedCompanyOptions = companyOptions
    .filter((company) => company.isActive)
    .map((company) => ({
      ...company,
      label: i18n.language.startsWith("ar") ? company.nameAr : company.nameEn,
      value: company.id,
    }));
  const selectedDefaultCompanyOptions = localizedCompanyOptions.filter((company) =>
    watchedCompanyIds.includes(company.id),
  );

  // Password strength checker
  const getPasswordStrength = (password?: string | null) => {
    const checks = {
      length: Boolean(password && password.length >= 8),
      lowercase: Boolean(password && /[a-z]/.test(password)),
      uppercase: Boolean(password && /[A-Z]/.test(password)),
      numbers: Boolean(password && /\d/.test(password)),
      symbols: Boolean(password && /[^A-Za-z0-9]/.test(password)),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const strengths: Array<{ label: string; color: SvgIconProps["color"] }> = [
      { label: "", color: "disabled" },
      { label: t("users.passwordVeryWeak"), color: "error" },
      { label: t("users.passwordWeak"), color: "error" },
      { label: t("users.passwordMedium"), color: "warning" },
      { label: t("users.passwordStrong"), color: "info" },
      {
        label: t("users.passwordVeryStrong"),
        color: "success",
      },
    ];
    return { score, ...strengths[score], checks };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);
  const passwordCheckLabels: Record<keyof typeof passwordStrength.checks, string> = {
    length: t("users.passwordLength"),
    lowercase: t("users.passwordLowercase"),
    uppercase: t("users.passwordUppercase"),
    numbers: t("users.passwordNumbers"),
    symbols: t("users.passwordSymbols"),
  };

  // Reset form when dialog opens or selected user changes
  useEffect(() => {
    if (open && (dialogType === "add" || selectedUser)) {
      const userData = {
        firstName:
          isEditMode || isViewMode ? selectedUser?.firstName || "" : "",
        lastName: isEditMode || isViewMode ? selectedUser?.lastName || "" : "",
        userName: isEditMode || isViewMode ? selectedUser?.userName || "" : "",
        email: isEditMode || isViewMode ? selectedUser?.email || "" : "",
        password: "", // Always empty for security
        confirmPassword: "", // Always empty for security
        isDisabled:
          isEditMode || isViewMode ? selectedUser?.isDisabled || false : false,
        profilePicture:
          isEditMode || isViewMode ? selectedUser?.profilePicture || "" : "",
        roles: isEditMode || isViewMode ? selectedUser?.roles || [] : [],
        companyIds:
          isEditMode || isViewMode
            ? selectedUser?.companyIds || []
            : currentUser?.companyId
              ? [currentUser.companyId]
              : [],
        defaultCompanyId:
          isEditMode || isViewMode
            ? selectedUser?.defaultCompanyId ?? selectedUser?.companyIds[0] ?? 0
            : currentUser?.companyId ?? 0,
      };

      reset(userData);
      if (isEditMode) {
        clearErrors(["password", "confirmPassword"]);
      }
    }
  }, [
    open,
    dialogType,
    selectedUser,
    reset,
    isAddMode,
    isEditMode,
    isViewMode,
    clearErrors,
    currentUser?.companyId,
  ]);

  // Get appropriate action type for overlay
  const getOverlayActionType = () => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  // Get appropriate overlay message
  const getOverlayMessage = () => {
    if (isAddMode) return t("users.creatingUser");
    if (isEditMode) return t("users.updatingUser");
    return t("users.savingUser");
  };

  // Convert react-hook-form errors to simple error object for MyForm
  const getErrorMessages = () => {
    const errorMessages: Record<string, string> = {};
    Object.entries(errors).forEach(([key, error]) => {
      if (typeof error?.message === "string") {
        // ✅ FIXED: Don't show password errors if password section is hidden in edit mode
        if (isEditMode && !showPasswordSection && (key === "password" || key === "confirmPassword")) {
          return; // Skip password errors when section is hidden
        }
        errorMessages[key] = error.message;
      }
    });
    return errorMessages;
  };

  // Handle form submission with password logic
  const handleFormSubmit = async (data: UserFormData) => {
    // ✅ FIXED: Clean up password data properly
    const submitData = { ...data };
    
    if (isEditMode) {
      if (!showPasswordSection) {
        // Remove password fields completely if section is hidden
        delete submitData.password;
        delete submitData.confirmPassword;
      } else if (!submitData.password || submitData.password.trim() === "") {
        // Remove empty password fields
        delete submitData.password;
        delete submitData.confirmPassword;
      }
    }
    
    try {
      await onSubmit(submitData);
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
    }
  };

  // Handle password section toggle with cleanup
  const handlePasswordSectionToggle = () => {
    const newShowPassword = !showPasswordSection;
    setPasswordSectionState({ lifecycleKey: formLifecycleKey, visible: newShowPassword });
    
    // Clear password fields and errors when hiding section
    if (!newShowPassword) {
      setValue("password", "", { shouldDirty: true, shouldValidate: false });
      setValue("confirmPassword", "", { shouldDirty: true, shouldValidate: false });
      clearErrors(["password", "confirmPassword"]);
    }
  };
  const handleClose = () => {
    setPasswordSectionState({ lifecycleKey: "", visible: false });
    onClose();
  };

  return (
    <MyForm
      open={open}
      onClose={handleClose}
      title={
        isViewMode
          ? t("users.view")
          : isEditMode
          ? t("users.edit")
          : t("users.add")
      }
      subtitle={
        isViewMode
          ? t("users.viewSubtitle")
          : isEditMode
          ? t("users.editSubtitle")
          : t("users.addSubtitle")
      }
      submitButtonText={
        isViewMode
          ? undefined
          : isEditMode
          ? t("actions.update")
          : t("actions.add")
      }
      onSubmit={isViewMode ? undefined : handleSubmit(handleFormSubmit)}
      isSubmitting={loading}
      isDirty={isDirty}
      hideFooter={isViewMode}
      recordId={selectedUser?.id ?? undefined}
      focusFieldName="firstName"
      autoFocusFirst={true}
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      errors={getErrorMessages()}
    >
      {(isEditMode || isViewMode) && (
        <input type="hidden" value={selectedUser?.id || ""} readOnly />
      )}
      {/* Required: First Name */}
      <MyTextField
        fieldName="firstName"
        labelKey={t("users.firstName")}
        inputRef={firstNameRef}
        loading={loading}
        errors={errors}
        control={control}
        maxValue={50}
        placeholder={t("users.firstNamePlaceholder")}
        showCounter={!isViewMode}
        readOnly={isViewMode}
        data-field-name="firstName"
      />
      {/* Required: Last Name */}
      <MyTextField
        fieldName="lastName"
        labelKey={t("users.lastName")}
        inputRef={lastNameRef}
        loading={loading}
        errors={errors}
        control={control}
        maxValue={50}
        placeholder={t("users.lastNamePlaceholder")}
        showCounter={!isViewMode}
        readOnly={isViewMode}
        data-field-name="lastName"
      />
      {/* Required: User Name */}
      <MyTextField
        fieldName="userName"
        labelKey={t("users.userName")}
        inputRef={userNameRef}
        loading={loading}
        errors={errors}
        control={control}
        maxValue={50}
        placeholder={t("users.userNamePlaceholder")}
        showCounter={!isViewMode}
        readOnly={isViewMode}
      />
      {/* Required: Email */}
      <MyTextField
        fieldName="email"
        labelKey={t("users.email")}
        inputRef={emailRef}
        loading={loading}
        errors={errors}
        control={control}
        maxValue={100}
        placeholder={t("users.emailPlaceholder")}
        showCounter={!isViewMode}
        readOnly={isViewMode}
      />
      {/* Roles Multi-Select with API Data */}
      <Box>
        <MySelect
          control={control}
          name="roles"
          label={t("users.roles")}
          dataSource={roleOptions}
          valueMember="value"
          displayMember="label"
          colorMember="color"
          multiple={true}
          loading={rolesLoading}
          disabled={isViewMode || loading}
          placeholder={
            rolesLoading
              ? t("users.loadingRoles")
              : t("users.rolesPlaceholder")
          }
          loadingText={t("users.loadingRoles")}
          noOptionsText={t("users.noRolesFound")}
          isViewMode={isViewMode}
          filterSelectedOptions={true}
          defaultChipColor="primary"
          chipVariant="outlined"
          chipSize="small"
          showDeleteIcon={!isViewMode}
          errors={errors}
          actualFieldName="roles"
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("users.companyAccessSection")}
          </Typography>
        </Divider>

        <MySelect
          control={control}
          name="companyIds"
          label={t("users.companies")}
          dataSource={localizedCompanyOptions}
          valueMember="value"
          displayMember="label"
          multiple
          required
          loading={rolesLoading}
          disabled={isViewMode || loading}
          placeholder={t("users.companiesPlaceholder")}
          loadingText={t("users.loadingCompanies")}
          noOptionsText={t("users.noCompaniesFound")}
          isViewMode={isViewMode}
          errors={errors}
          actualFieldName="companyIds"
          defaultChipColor="info"
          onChange={(_event, selected) => {
            const selectedCompanies = Array.isArray(selected) ? selected : [];
            const selectedIds = selectedCompanies.map((company) => company.id);
            const currentDefault = getValues("defaultCompanyId");
            if (!selectedIds.includes(currentDefault)) {
              setValue("defaultCompanyId", selectedIds[0] ?? 0, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
        />

        <Box sx={{ mt: 2 }}>
          <MySelect
            control={control}
            name="defaultCompanyId"
            label={t("users.defaultCompany")}
            dataSource={selectedDefaultCompanyOptions}
            valueMember="value"
            displayMember="label"
            required
            loading={rolesLoading}
            disabled={isViewMode || loading || watchedCompanyIds.length === 0}
            placeholder={t("users.defaultCompanyPlaceholder")}
            loadingText={t("users.loadingCompanies")}
            noOptionsText={t("users.selectCompaniesFirst")}
            isViewMode={isViewMode}
            errors={errors}
            actualFieldName="defaultCompanyId"
          />
        </Box>

        {!isViewMode ? (
          <Alert severity="info" icon={<Business />} sx={{ mt: 2 }}>
            {t("users.companyAccessHint")}
          </Alert>
        ) : null}
      </Box>
      {/* Password section for add mode or edit mode */}
      {(isAddMode || isEditMode) && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {t("users.passwordSection")}
            </Typography>
          </Divider>

          {/* Password Toggle Button for Edit Mode */}
          {isEditMode && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant={showPasswordSection ? "contained" : "outlined"}
                startIcon={<VpnKey />}
                onClick={handlePasswordSectionToggle}
              >
                {showPasswordSection
                  ? t("users.hidePasswordFields")
                  : t("users.changePassword")}
              </Button>

              {showPasswordSection && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t("users.passwordChangeNote")}
                </Alert>
              )}
            </Box>
          )}

          {(isAddMode || showPasswordSection) && (
            <Box>
              {/* Password Field */}
              <MyTextField
                fieldName="password"
                labelKey={t("users.password")}
                inputRef={passwordRef}
                loading={loading}
                errors={errors}
                control={control}
                maxValue={50}
                placeholder={t("users.passwordPlaceholder")}
                showCounter={false}
                readOnly={false}
                type="password"
                required={isAddMode}
              />

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Security fontSize="small" color={passwordStrength.color} />
                    <Typography
                      variant="caption"
                      color={`${passwordStrength.color}.main`}
                    >
                      {passwordStrength.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Box
                        key={level}
                        sx={{
                          height: 4,
                          flex: 1,
                          borderRadius: 2,
                          backgroundColor:
                            level <= passwordStrength.score
                              ? `${passwordStrength.color}.main`
                              : "grey.300",
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {(Object.entries(passwordStrength.checks) as Array<[
                      keyof typeof passwordStrength.checks,
                      boolean,
                    ]>).map(
                      ([check, passed]) => (
                        <Typography
                          key={check}
                          variant="caption"
                          color={passed ? "success.main" : "text.secondary"}
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {passed ? "✓" : "○"}{" "}
                          {passwordCheckLabels[check]}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}

              {/* Confirm Password Field */}
              <MyTextField
                fieldName="confirmPassword"
                labelKey={t("users.confirmPassword")}
                inputRef={confirmPasswordRef}
                loading={loading}
                errors={errors}
                control={control}
                maxValue={50}
                placeholder={t("users.confirmPasswordPlaceholder")}
                showCounter={false}
                readOnly={false}
                type="password"
                required={isAddMode}
              />
            </Box>
          )}
        </Box>
      )}
    </MyForm>
  );
};

export default UserForm;
