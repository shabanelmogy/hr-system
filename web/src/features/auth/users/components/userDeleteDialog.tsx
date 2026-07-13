import { MyDeleteConfirmation } from "@/shared/components";

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedUser: { firstName: string; lastName: string; email: string } | null;
}

const UserDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedUser,
}: UserDeleteDialogProps) => {
  // Create the display name for the user being deleted
  const deletedField = selectedUser
    ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
    : "";

  return (
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
    />
  );
};

export default UserDeleteDialog;