import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Divider, MenuItem, Stack, TextField } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useDataGridShell } from "../core/context";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { SearchBar } from "@/shared/components/lists/card-view/header-controls/SearchBar";
import { GridOptionsButton } from "./GridOptionsButton";

const toolbarControlHeight = 40;

export function DataGridToolbar() {
  const {
    onToolbarAdd,
    showColumnFilterButton,
    showGridOptions,
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
        <Box sx={{ flex: "1 1 560px", maxWidth: { xs: "100%", lg: 780 }, minWidth: 260 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            useFlexGap
            sx={{ alignItems: { md: "center" }, gap: 0.5 }}
          >
            {toolbarSearch.column ? (
              <TextField
                select
                size="small"
                label={toolbarSearch.column.label}
                value={toolbarSearch.column.value}
                onChange={(event) => toolbarSearch.column?.onChange(event.target.value)}
                sx={{
                  flex: "0 0 155px",
                  minWidth: 155,
                  "& .MuiInputBase-root": { height: toolbarControlHeight },
                }}
              >
                {toolbarSearch.column.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            {toolbarSearch.operator ? (
              <TextField
                select
                size="small"
                label={toolbarSearch.operator.label}
                value={toolbarSearch.operator.value}
                onChange={(event) => toolbarSearch.operator?.onChange(event.target.value)}
                sx={{
                  flex: "0 0 165px",
                  minWidth: 165,
                  "& .MuiInputBase-root": { height: toolbarControlHeight },
                }}
              >
                {toolbarSearch.operator.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            <Box
              sx={{
                flex: "1 1 220px",
                minWidth: 220,
                "& .MuiInputBase-root": { height: toolbarControlHeight },
              }}
            >
              <SearchBar
                searchTerm={toolbarSearch.value}
                placeholder={toolbarSearch.placeholder}
                onSearchChange={toolbarSearch.onChange}
                onClearSearch={toolbarSearch.onClear}
                margin="none"
              />
            </Box>
          </Stack>
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
      {!showGridOptions ? <GridToolbarColumnsButton /> : null}
      {showColumnFilterButton ? <GridToolbarFilterButton /> : null}
      {!showGridOptions ? <GridToolbarDensitySelector /> : null}
      {toolbarContent}
      {showGridOptions ? <GridOptionsButton label={t("actions.gridOptions")} /> : null}
    </Stack>
  );
}
