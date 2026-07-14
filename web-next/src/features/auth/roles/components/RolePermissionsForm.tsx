/* eslint-disable react/prop-types */
// components/RoleForm.jsx - Exact match to Blazor version
import { 
  Card, 
  TextField, 
  Button, 
  Box, 
  Typography,
  CircularProgress 
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { getRoleValidationSchema } from "../utils/validation";

interface RoleFormProps {
  open: boolean;
  editedRole: { id: string; name: string } | null;
  onClose: (success: boolean) => void;
  onSubmit: (role: { id: string; name: string }, action: string) => Promise<any>;
  onError?: (errors: string[]) => void;
  onSuccess?: () => void;
  t?: (key: string) => string;
}

const RoleForm = ({
  open,
  editedRole,
  onClose,
  onSubmit,
  onError,
  onSuccess,
  t,
}: RoleFormProps) => {
  const roleId = editedRole?.id || "";
  const validationSchema = getRoleValidationSchema(t || ((key) => key));
  const focusText = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<{ name: string }>({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  // Initialize edited role - exact match to Blazor method
  const initializeEditedRole = () => {
    reset({ name: editedRole?.name || "" });
  };

  // OnParametersSet equivalent
  useEffect(() => {
    if (open) {
      initializeEditedRole();
    }
  }, [open, editedRole]);

  // OnAfterRenderAsync equivalent
  useEffect(() => {
    if (open && focusText.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        focusText.current?.focus();
      }, 100);
    }
  }, [open]);

  // SaveRole - exact match to Blazor method
  const saveRole = async (data: { name: string }) => {
    try {
      const role = { id: roleId, name: data.name.trim() };
      if (!role.id) {
        // Add new role
        const response = await onSubmit(role, "add");
        if (response?.success !== false) {
          onSuccess?.();
          onClose(true);
        } else if (response?.errors) {
          onError?.(response.errors);
        }
      } else {
        // Update existing role
        const response = await onSubmit(role, "edit");
        if (response?.success !== false) {
          onSuccess?.();
          onClose(true);
        } else if (response?.errors) {
          onError?.(response.errors);
        }
      }
    } catch (error) {
      onError?.([(error as Error)?.message || 'An error occurred']);
    }
  };

  // CloseDialog - exact match to Blazor method
  const closeDialog = () => {
    if (isSubmitting) return;
    if (
      isDirty &&
      typeof window !== "undefined" &&
      !window.confirm("You have unsaved changes. Discard them?")
    ) {
      return;
    }
    onClose(false);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1300
      }}
    >
      <Card sx={{ p: 3, minWidth: 400, maxWidth: 600 }}>
        {/* Title */}
        <Typography variant="h5" gutterBottom>
          {roleId ? t?.("roles.edit") || "Edit Role" : t?.("roles.add") || "Add Role"}
        </Typography>

        {/* Form - exact match to RadzenTemplateForm */}
        <form onSubmit={handleSubmit(saveRole)} noValidate>
          {/* Role Name Field - exact match to RadzenFormField */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label={t?.("general.name") || "Role Name"}
              fullWidth
              autoComplete="off"
              {...register("name")}
              disabled={isSubmitting}
              inputRef={focusText}
              error={!!errors.name}
              helperText={errors.name?.message || ""}
              slotProps={{
                htmlInput: { maxLength: 50 }
              }}
            />
          </Box>

          {/* Action Buttons - exact match to RadzenRow */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 1, 
            mt: 2 
          }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              size="small"
              startIcon={isSubmitting && <CircularProgress size={16} />}
            >
              {isSubmitting
                ? (t?.("general.submitting") || "Submitting...") 
                : (t?.("actions.save") || "Save")
              }
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={closeDialog}
              disabled={isSubmitting}
              size="small"
            >
              {t?.("actions.close") || "Close"}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default RoleForm;
