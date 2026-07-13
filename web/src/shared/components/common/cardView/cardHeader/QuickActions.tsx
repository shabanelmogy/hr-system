import React from "react";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface QuickActionsProps {
  searchTerm: string;
  onClearSearch: () => void;
  onReset: () => void;
  clearSearchField: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onReset,
  clearSearchField,
}) => {
  const { t } = useTranslation();

  return (
    <Stack direction="column" spacing={1}>
      <Stack direction="row" spacing={1}>
        <Button
          sx={{ p: 0.9 }}
          size="small"
          variant="outlined"
          startIcon={
            <RestartAltIcon
              fontSize="small"
              sx={{ color: (theme) => theme.palette.error.light }}
            />
          }
          onClick={() => {
            onReset();
            clearSearchField();
          }}
        >
          {t("general.reset")}
        </Button>
      </Stack>
    </Stack>
  );
};
