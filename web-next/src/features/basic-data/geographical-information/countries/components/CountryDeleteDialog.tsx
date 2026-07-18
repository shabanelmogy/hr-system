import { DeleteConfirmationDialog } from "@/shared/components/dialogs";
import { Country } from "../types/Country";

interface CountryDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  selectedCountry: Country | null;
  loading?: boolean;
}

const CountryDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedCountry,
  loading = false,
}: CountryDeleteDialogProps) => {
  const itemLabel = selectedCountry
    ? `${selectedCountry.nameEn} (${selectedCountry.nameAr || selectedCountry.nameEn})`
    : "";

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      itemLabel={itemLabel}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
};

export default CountryDeleteDialog;
