/* eslint-disable react/prop-types */
// components/UserForm.jsx - FINAL FIX: No password required in edit mode
import { MyForm, MySelectForm, MyTextField } from "@/shared/components";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import {
  VpnKey,
  Security,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getUserValidationSchema } from "../utils/validation";
import useRoleStore from "../../roles/store/useRoleStore";

interface UserFormProps {
  open: boolean;
  dialogType: string;
  selectedUser: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  t: (key: string) => string;
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
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const userNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);



  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Use the role store
  const { roles, fetchRoles, loading: rolesLoading } = useRoleStore() as any;

  const isViewMode = dialogType === "view";
  const isEditMode = dialogType === "edit";
  const isAddMode = dialogType === "add";

  // ✅ FIXED: Only pass 2 parameters - removed showPasswordSection
  const schema = getUserValidationSchema(t, isAddMode);

  const {
    handleSubmit,
    reset,
    control,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
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
  const watchedPassword = watch("password");

  // Fetch roles when form opens
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open, fetchRoles]);

  // Reset password section state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setShowPasswordSection(isAddMode); // Show by default for add mode
      // Clear password errors when opening in edit mode
      if (isEditMode) {
        setTimeout(() => {
          clearErrors(["password", "confirmPassword"]);
        }, 100);
      }
    } else {
      setShowPasswordSection(false);
    }
  }, [open, isAddMode, isEditMode, clearErrors]);

  // Clear password errors when hiding password section in edit mode
  useEffect(() => {
    if (isEditMode && !showPasswordSection) {
      clearErrors(["password", "confirmPassword"]);
    }
  }, [showPasswordSection, isEditMode, clearErrors]);

  // Get random but consistent color for each role
  const getRandomRoleColor = (roleName: any) => {
    const colors = ["primary", "warning", "error", "secondary", "success"];

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
  const roleOptions =
    roles?.map((role: any) => ({
      label: role.name,
      value: role.name,
      color: getRandomRoleColor(role.name),
      ...role,
    })) || [];

  // Password strength checker
  const getPasswordStrength = (password: any) => {
    if (!password) return { score: 0, label: "", color: "default" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    const strengths = {
      0: { label: "", color: "default" },
      1: { label: t("users.passwordVeryWeak") || "Very Weak", color: "error" },
      2: { label: t("users.passwordWeak") || "Weak", color: "error" },
      3: { label: t("users.passwordMedium") || "Medium", color: "warning" },
      4: { label: t("users.passwordStrong") || "Strong", color: "info" },
      5: {
        label: t("users.passwordVeryStrong") || "Very Strong",
        color: "success",
      },
    };

    return { score, ...(strengths as any)[score], checks };
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
    const errorMessages = {};
    Object.keys(errors).forEach((key) => {
      if ((errors as any)[key]?.message) {
        // ✅ FIXED: Don't show password errors if password section is hidden in edit mode
        if (isEditMode && !showPasswordSection && (key === "password" || key === "confirmPassword")) {
          return; // Skip password errors when section is hidden
        }
        (errorMessages as any)[key] = (errors as any)[key].message;
      }
    });
    return errorMessages;
  };

  // Handle form submission with password logic
  const handleFormSubmit = (data: any) => {
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
    
    onSubmit(submitData);
  };

  // Handle password section toggle with cleanup
  const handlePasswordSectionToggle = () => {
    const newShowPassword = !showPasswordSection;
    setShowPasswordSection(newShowPassword);
    
    // Clear password fields and errors when hiding section
    if (!newShowPassword) {
      const currentValues = watch();
      reset({
        ...currentValues,
        password: "",
        confirmPassword: "",
      });
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
          ? null
          : isEditMode
          ? t("actions.update")
          : t("actions.create")
      }
      onSubmit={isViewMode ? undefined : handleSubmit(handleFormSubmit)}
      isSubmitting={loading}
      hideFooter={isViewMode}
      recordId={selectedUser?.id}
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
            <Typography variant="body2" color="text.secondary">
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