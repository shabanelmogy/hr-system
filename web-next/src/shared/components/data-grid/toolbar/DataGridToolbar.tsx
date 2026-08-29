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

const toolbarControlHeight = 36;

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
  const hasSearchSelectors = Boolean(toolbarSearch?.column || toolbarSearch?.operator);

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        alignItems: "center",
        flexWrap: "wrap",
        gap: { xs: 0.25, sm: 0.5 },
        p: { xs: 0.5, sm: 1 },
        "@media (min-width: 600px)": {
          flexWrap: hasSearchSelectors ? "wrap" : "nowrap",
        },
        ...(hasSearchSelectors
          ? { "@media (min-width: 880px)": { flexWrap: "nowrap" } }
          : {}),
      }}
    >
      {toolbarSearch ? (
        <Box
          sx={{
            flex: hasSearchSelectors ? "1 1 540px" : "1 1 360px",
            maxWidth: hasSearchSelectors
              ? { xs: "100%", sm: 560, md: 640, lg: 760 }
              : { xs: "100%", sm: 440, md: 520, lg: 640 },
            minWidth: hasSearchSelectors
              ? { xs: 160, sm: 0, md: 540 }
              : { xs: 160, sm: 180, md: 260 },
            overflow: "visible",
          }}
        >
          <Stack
            direction={hasSearchSelectors ? { xs: "column", md: "row" } : { xs: "column", sm: "row" }}
            useFlexGap
            sx={{ alignItems: { sm: "center" }, gap: 0.5 }}
          >
            {toolbarSearch.column ? (
              <TextField
                select
                size="small"
                label={toolbarSearch.column.label}
                value={toolbarSearch.column.value}
                onChange={(event) => toolbarSearch.column?.onChange(event.target.value)}
                sx={{
                  flex: { sm: "0 0 155px" },
                  minWidth: { xs: 0, sm: 155 },
                  width: { xs: "100%", sm: "auto" },
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
                  flex: { sm: "0 0 165px" },
                  minWidth: { xs: 0, sm: 165 },
                  width: { xs: "100%", sm: "auto" },
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
                flex: { sm: "1 1 220px" },
                minWidth: { xs: 0, sm: 220 },
                width: { xs: "100%", sm: "auto" },
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginInlineStart: "auto",
          flexShrink: 0,
          flexWrap: "nowrap",
          gap: { xs: 0.25, sm: 0.5 },
          minWidth: "max-content",
          "& > .MuiButtonBase-root, & > .MuiButton-root": {
            flexShrink: 0,
            minWidth: "auto",
            height: toolbarControlHeight,
            px: { xs: 0.5, sm: 0.75 },
            py: 0,
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            "& .MuiButton-startIcon": {
              marginInlineEnd: 0.35,
              marginInlineStart: 0,
            },
          },
          "& > .MuiDivider-root": { mx: 0.25 },
        }}
      >
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
      </Box>
    </Stack>
  );
}
