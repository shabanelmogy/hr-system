import AddIcon from "@mui/icons-material/Add";
import { Button, Divider, Stack } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useDataGridShell } from "../core/context";

export function DataGridToolbar() {
  const { onToolbarAdd } = useDataGridShell();
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5, p: 1 }}
    >
      {onToolbarAdd ? (
        <>
          <Button
            onClick={onToolbarAdd}
            startIcon={<AddIcon />}
            size="small"
          >
            {t("actions.add")}
          </Button>
          <Divider orientation="vertical" flexItem />
        </>
      ) : null}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </Stack>
  );
}
