import { DeleteConfirmationDialog } from "@/shared/components/dialogs";

interface RoleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedRole: { name: string } | null;
}

const RoleDeleteDialog = ({ open, onClose, onConfirm, selectedRole }: RoleDeleteDialogProps) => {
  const itemLabel = selectedRole ? selectedRole.name : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      itemLabel={itemLabel}
      onConfirm={onConfirm}
    />
  );
};

export default RoleDeleteDialog;
