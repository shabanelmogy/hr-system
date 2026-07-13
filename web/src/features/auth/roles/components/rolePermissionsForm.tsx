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
import { useState, useEffect, useRef } from "react";

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
  // State variables matching Blazor exactly
  const [role, setRole] = useState({ id: "", name: "" });
  const [originalRole, setOriginalRole] = useState({ id: "", name: "" });
  const [isBusy, setIsBusy] = useState(false);
  
  const focusText = useRef(null);

  // Initialize edited role - exact match to Blazor method
  const initializeEditedRole = () => {
    if (editedRole?.id) {
      const clonedRole = { ...editedRole };
      setRole(clonedRole);
      setOriginalRole({ ...clonedRole }); // Deep clone equivalent
    } else {
      const newRole = { id: "", name: "" };
      setRole(newRole);
      setOriginalRole(newRole);
    }
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
  const saveRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsBusy(true);
    
    try {
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
    } finally {
      setIsBusy(false);
    }
  };

  // CloseDialog - exact match to Blazor method
  const closeDialog = () => {
    if (isBusy) return;
    
    // Restore original values
    setRole({ ...originalRole });
    onClose(false);
  };

  // Handle input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole({ ...role, name: e.target.value });
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
          {role.id ? t?.("roles.edit") || "Edit Role" : t?.("roles.add") || "Add Role"}
        </Typography>

        {/* Form - exact match to RadzenTemplateForm */}
        <form onSubmit={saveRole}>
          {/* Role Name Field - exact match to RadzenFormField */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label={t?.("general.name") || "Role Name"}
              fullWidth
              autoComplete="off"
              inputProps={{ maxLength: 50 }}
              value={role.name}
              onChange={handleNameChange}
              required
              disabled={isBusy}
              inputRef={focusText}
              error={!role.name && role.name !== ""}
              helperText={!role.name && role.name !== "" ? (t?.("validation.required") || "Required field") : ""}
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
              disabled={isBusy || !role.name}
              size="small"
              startIcon={isBusy && <CircularProgress size={16} />}
            >
              {isBusy 
                ? (t?.("general.submitting") || "Submitting...") 
                : (t?.("actions.save") || "Save")
              }
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={closeDialog}
              disabled={isBusy}
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