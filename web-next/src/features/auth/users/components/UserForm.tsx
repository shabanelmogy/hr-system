import MyForm from "@/shared/components/common/form/MyForm";
import MyTextField from "@/shared/components/common/form-controls/MyTextField";
import MySelectForm from "@/shared/components/common/select/MySelectForm";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
  type SvgIconProps,
} from "@mui/material";
import {
  VpnKey,
  Security,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getUserValidationSchema,
  type UserFormData,
} from "../utils/validation";
import useRoleStore from "../../roles/store/useRoleStore";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import type { Translator, User } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";

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
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const {
    loading: rolesLoading,
    handleApiCall: handleRolesApiCall,
  } = useApiHandler({
    showSuccessNotification: false,
    showErrorNotification: false,
  });

  const roles = useRoleStore((state) => state.roles);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);

  const isViewMode = dialogType === "view";
  const isEditMode = dialogType === "edit";
  const isAddMode = dialogType === "add";

  // ✅ FIXED: Only pass 2 parameters - removed showPasswordSection
  const schema = getUserValidationSchema(t, isAddMode);

  const {
    handleSubmit,
    reset,
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
    },
  });

  // Watch password for strength indicator
  const watchedPassword = useWatch({ control, name: "password" });

  // Fetch roles when form opens
  useEffect(() => {
    if (open) {
      void handleRolesApiCall(() => fetchRoles());
    }
  }, [open, fetchRoles, handleRolesApiCall]);

  // Reset password section state when dialog opens/closes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (open) {
        setShowPasswordSection(isAddMode);
        if (isEditMode) {
          clearErrors(["password", "confirmPassword"]);
        }
      } else {
        setShowPasswordSection(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, isAddMode, isEditMode, clearErrors]);

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
  const roleOptions = roles.map((role) => ({
      label: role.name,
      value: role.name,
      color: getRandomRoleColor(role.name),
      ...role,
    }));

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
      { label: t("users.passwordVeryWeak") || "Very Weak", color: "error" },
      { label: t("users.passwordWeak") || "Weak", color: "error" },
      { label: t("users.passwordMedium") || "Medium", color: "warning" },
      { label: t("users.passwordStrong") || "Strong", color: "info" },
      {
        label: t("users.passwordVeryStrong") || "Very Strong",
        color: "success",
      },
    ];
    return { score, ...strengths[score], checks };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

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
      };

      reset(userData);

      
      // Clear password errors after reset in edit mode
      if (isEditMode) {
        setTimeout(() => {
          clearErrors(["password", "confirmPassword"]);
        }, 100);
      }
    }
  }, [open, dialogType, selectedUser, reset, isEditMode, isViewMode, clearErrors]);

  // Get appropriate action type for overlay
  const getOverlayActionType = () => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  // Get appropriate overlay message
  const getOverlayMessage = () => {
    if (isAddMode) return t("users.creatingUser") || "Creating user...";
    if (isEditMode) return t("users.updatingUser") || "Updating user...";
    return t("users.savingUser") || "Saving user...";
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
        "User.DuplicatedUserName": "userName",
        "User.DuplicatedEmail": "email",
        "Role.InvalidRoles": "roles",
      });
    }
  };

  // Handle password section toggle with cleanup
  const handlePasswordSectionToggle = () => {
    const newShowPassword = !showPasswordSection;
    setShowPasswordSection(newShowPassword);
    
    // Clear password fields and errors when hiding section
    if (!newShowPassword) {
      setValue("password", "", { shouldDirty: true, shouldValidate: false });
      setValue("confirmPassword", "", { shouldDirty: true, shouldValidate: false });
      clearErrors(["password", "confirmPassword"]);
    }
  };

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={
        isViewMode
          ? t("users.view")
          : isEditMode
          ? t("users.edit")
          : t("users.add")
      }
      subtitle={
        isViewMode
          ? t("users.viewSubtitle") || "View user details"
          : isEditMode
          ? t("users.editSubtitle") || "Modify user information"
          : t("users.addSubtitle") || "Add a new user to the system"
      }
      submitButtonText={
        isViewMode
          ? undefined
          : isEditMode
          ? t("actions.update")
          : t("actions.create")
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
        <TextField
          margin="dense"
          label="Id"
          fullWidth
          disabled
          autoComplete="off"
          value={selectedUser?.id || ""}
          sx={{ display: "none" }}
        />
      )}
      {/* Required: First Name */}
      <Box sx={{ mt: 2 }}>
        <MyTextField
          fieldName="firstName"
          labelKey={t("users.firstName")}
          inputRef={firstNameRef}
          loading={loading}
          errors={errors}
          control={control}
          placeholder={t("users.firstNamePlaceholder")}
          showCounter={!isViewMode}
          readOnly={isViewMode}
          data-field-name="firstName"
        />
      </Box>
      {/* Required: Last Name */}
      <MyTextField
        fieldName="lastName"
        labelKey={t("users.lastName")}
        inputRef={lastNameRef}
        loading={loading}
        errors={errors}
        control={control}
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
        placeholder={t("users.emailPlaceholder")}
        showCounter={!isViewMode}
        readOnly={isViewMode}
      />
      {/* Roles Multi-Select with API Data */}
      <Box sx={{ mt: 2 }}>
        <MySelectForm
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
              ? t("users.loadingRoles") || "Loading roles..."
              : t("users.rolesPlaceholder") || "Select roles"
          }
          loadingText={t("users.loadingRoles") || "Loading roles..."}
          noOptionsText={t("users.noRolesFound") || "No roles found"}
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
      {/* Password Section */}
      {!isViewMode && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {t("users.passwordSection") || "Password Settings"}
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
                  ? t("users.hidePasswordFields") || "Hide Password Fields"
                  : t("users.changePassword") || "Change Password"}
              </Button>

              {showPasswordSection && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t("users.passwordChangeNote") ||
                    "Leave empty to keep current password"}
                </Alert>
              )}
            </Box>
          )}

          {/* Password Fields - Show for Add mode or when toggled in Edit mode */}
          {(isAddMode || showPasswordSection) && (
            <Box>
              {/* Password Field */}
              <MyTextField
                fieldName="password"
                labelKey={t("users.password") || "Password"}
                inputRef={passwordRef}
                loading={loading}
                errors={errors}
                control={control}
                placeholder={t("users.passwordPlaceholder") || "Enter password"}
                showCounter={false}
                readOnly={false}
                type="password"
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
                    {Object.entries(passwordStrength.checks || {}).map(
                      ([check, passed]) => (
                        <Typography
                          key={check}
                          variant="caption"
                          color={passed ? "success.main" : "text.secondary"}
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {passed ? "✓" : "○"}{" "}
                          {t(
                            `users.password${
                              check.charAt(0).toUpperCase() + check.slice(1)
                            }`
                          ) || check}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}

              {/* Confirm Password Field */}
              <MyTextField
                fieldName="confirmPassword"
                labelKey={t("users.confirmPassword") || "Confirm Password"}
                inputRef={confirmPasswordRef}
                loading={loading}
                errors={errors}
                control={control}
                placeholder={
                  t("users.confirmPasswordPlaceholder") || "Confirm password"
                }
                showCounter={false}
                readOnly={false}
                type="password"
              />
            </Box>
          )}
        </Box>
      )}
    </MyForm>
  );
};

export default UserForm;
