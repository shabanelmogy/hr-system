import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Divider, Stack } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useDataGridShell } from "../core/context";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { SearchBar } from "@/shared/components/lists/card-view/header-controls/SearchBar";

export function DataGridToolbar() {
  const {
    onToolbarAdd,
    showColumnFilterButton,
    toolbarContent,
    toolbarSearch,
  } = useDataGridShell();
  const { t } = useTranslation();
  const { isReadOnly } = useAppReadOnly();

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5, p: 1 }}
    >
      {toolbarSearch ? (
        <Box sx={{ flex: "1 1 280px", maxWidth: { xs: "100%", md: 440 }, minWidth: 220 }}>
          <SearchBar
            searchTerm={toolbarSearch.value}
            placeholder={toolbarSearch.placeholder}
            onSearchChange={toolbarSearch.onChange}
            onClearSearch={toolbarSearch.onClear}
          />
        </Box>
      ) : null}
      {onToolbarAdd ? (
        <>
          <Button
            onClick={onToolbarAdd}
            disabled={isReadOnly}
            startIcon={<AddIcon />}
            size="small"
          >
            {t("actions.add")}
          </Button>
          <Divider orientation="vertical" flexItem />
        </>
      ) : null}
      <GridToolbarColumnsButton />
      {showColumnFilterButton ? <GridToolbarFilterButton /> : null}
      <GridToolbarDensitySelector />
      {toolbarContent}
    </Stack>
  );
}
