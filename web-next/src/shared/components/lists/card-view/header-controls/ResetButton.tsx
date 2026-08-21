import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface ResetButtonProps {
  onReset: () => void;
  fullWidth?: boolean;
  height?: number | string;
}

export const ResetButton = ({
  onReset,
  fullWidth = true,
  height,
}: ResetButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      fullWidth={fullWidth}
      sx={{
        p: 0.9,
        ...(height == null ? {} : { height, minHeight: height }),
      }}
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
