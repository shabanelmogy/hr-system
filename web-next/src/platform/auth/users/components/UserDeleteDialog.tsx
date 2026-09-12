import { DeleteConfirmationDialog } from "@/shared/components/dialogs";

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedUser: { firstName: string; lastName: string; email: string } | null;
}

const UserDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedUser,
}: UserDeleteDialogProps) => {
  const itemLabel = selectedUser
    ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
    : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      itemLabel={itemLabel}
      onConfirm={onConfirm}
    />
  );
};

export default UserDeleteDialog;
