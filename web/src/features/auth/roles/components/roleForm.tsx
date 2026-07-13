/* eslint-disable react/prop-types */
// components/RoleForm.jsx
import { MyForm, MyTextField } from "@/shared/components";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { getRoleValidationSchema } from "../utils/validation";

interface RoleFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedRole: { id: string; name: string } | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  t: (key: string) => string;
}

const RoleForm = ({
  open,
  dialogType,
  selectedRole,
  onClose,
  onSubmit,
  loading,
  t,
}: RoleFormProps) => {
  const nameRef = useRef(null);

  const isViewMode = dialogType === "view";
  const isEditMode = dialogType === "edit";
  const isAddMode = dialogType === "add";

  const schema = getRoleValidationSchema(t);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  // Reset form when dialog opens or selected role changes
  useEffect(() => {
    if (open && (dialogType === "add" || selectedRole)) {
      reset({
        name: isEditMode || isViewMode ? selectedRole?.name || "" : "",
      });
    }
  }, [open, dialogType, selectedRole, reset, isEditMode, isViewMode]);

  // Get appropriate action type for overlay
  const getOverlayActionType = () => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  // Get appropriate overlay message
  const getOverlayMessage = () => {
    if (isAddMode) return t("roles.creatingRole") || "Creating role...";
    if (isEditMode) return t("roles.updatingRole") || "Updating role...";
    return t("roles.savingRole") || "Saving role...";
  };

  // Convert react-hook-form errors to simple error object for MyForm
  const getErrorMessages = () => {
    const errorMessages: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      const error = errors[key as keyof typeof errors];
      if (error?.message) {
        errorMessages[key] = error.message;
      }
    });
    return errorMessages;
  };

  // Handle error found callback
  const handleErrorFound = (fieldName: string, fieldElement: HTMLElement) => {
    console.log(`Validation error in field: ${fieldName}`, fieldElement);
    // You can add custom logic here, such as:
    // - Analytics tracking
    // - Custom focus behavior
    // - Additional UI feedback
  };

  return (
    <MyForm
      open={open}
      maxHeight="43vh"
      onClose={onClose}
      title={
        isViewMode
          ? t("actions.view")
          : isEditMode
            ? t("actions.edit")
            : t("actions.add")
      }
      subtitle={
        isViewMode
          ? t("roles.viewSubtitle") || "View role details"
          : isEditMode
            ? t("roles.editSubtitle") || "Modify role information"
            : t("roles.addSubtitle") || "Add a new role to the system"
      }
      submitButtonText={
        isViewMode
          ? null
          : isEditMode
            ? t("actions.update")
            : t("actions.create")
      }
      onSubmit={isViewMode ? undefined : handleSubmit(onSubmit)}
      isSubmitting={loading}
      hideFooter={isViewMode}
      recordId={selectedRole?.id}
      focusFieldName="name" // Specify which field to focus
      autoFocusFirst={true} // Will focus first field if name not found
      // Overlay customization
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      // Error handling props
      errors={getErrorMessages()} // Pass the converted errors
      onErrorFound={handleErrorFound} // Optional callback when error is found
    >
      {(isEditMode || isViewMode) && (
        <TextField
          margin="dense"
          label="Id"
          fullWidth
          disabled
          autoComplete="off"
          value={selectedRole?.id || ""}
          sx={{ display: "none" }}
        />
      )}

      {/* Required: Role Name */}
      <Box sx={{ mt: 2 }}>
        <MyTextField
          fieldName="name"
          labelKey={t("roles.name")}
          inputRef={nameRef}
          loading={loading}
          errors={errors}
          control={control}
          placeholder={t("roles.namePlaceholder")}
          showCounter={!isViewMode}
          readOnly={isViewMode}
          data-field-name="name" // Add this for better error field detection
        />
      </Box>
    </MyForm>
  );
};

export default RoleForm;
