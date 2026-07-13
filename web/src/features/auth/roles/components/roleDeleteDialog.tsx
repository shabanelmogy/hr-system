import { MyDeleteConfirmation } from "@/shared/components";

interface RoleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedRole: { name: string } | null;
}

const RoleDeleteDialog = ({ open, onClose, onConfirm, selectedRole }: RoleDeleteDialogProps) => {
  // Create the display name for the role being deleted
  const deletedField = selectedRole ? selectedRole.name : "";

  return (
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
    />
  );
};

export default RoleDeleteDialog;
