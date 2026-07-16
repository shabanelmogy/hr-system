import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton = ({ onReset }: ResetButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      fullWidth
      sx={{ p: 0.9 }}
      size="small"
      variant="outlined"
      startIcon={
        <RestartAltIcon
          fontSize="small"
          sx={{ color: (theme) => theme.palette.error.light }}
        />
      }
      onClick={onReset}
    >
      {t("general.reset")}
    </Button>
  );
};
