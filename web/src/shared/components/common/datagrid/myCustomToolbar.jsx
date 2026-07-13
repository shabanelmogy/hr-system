/* eslint-disable react/prop-types */
import { MyOverlayLoader } from "@/shared/components";
import { usePdfExport, useServerExport, useSnackbar } from "@/shared/hooks";
import { Add, SaveAlt as ExportIcon, ViewList, ViewModule } from "@mui/icons-material";
import {
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  useTheme,
} from "@mui/material";
import {
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const MyCustomToolbar = ({
  showAddButton = false,
  addNewRow,
  fileName = "Export",
  reportPdfHeader,
  excludeColumnsFromExport = [],
  viewMode = "list",
  onViewModeChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  const apiRef = useGridApiContext();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();

  const culture = theme.direction === "rtl" ? "ar" : "en";

  // Server-side export hook
  const { exportToExcel: serverExportToExcel, isExporting: isServerExporting } =
    useServerExport({
      apiRef,
      defaultFileName: fileName,
      defaultCulture: culture,
      excludeColumnsFromExport: excludeColumnsFromExport,
    });

  // Pdf export hook
  const { exportToPdf, isExporting: isPdfExporting } = usePdfExport({
    apiRef,
    defaultFileName: fileName,
    defaultCulture: culture,
    reportPdfHeader: reportPdfHeader,
    excludeColumnsFromExport : excludeColumnsFromExport
  });

  // Determine if any export is in progress
  const isAnyExportInProgress = isPdfExporting || isServerExporting;

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Get current export type for the overlay loader
  const getCurrentActionType = () => {
    if (isPdfExporting) return "pdf";
    if (isServerExporting) return "excel";
    return "export";
  };

  // Get current export message
  const getCurrentMessage = () => {
    if (isPdfExporting) return t("actions.exportingPdf") || "Exporting PDF...";
    if (isServerExporting)
      return t("actions.exportingExcel") || "Exporting Excel...";
    return t("actions.exporting") || "Exporting...";
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
        {showAddButton && (
          <Button
            onClick={addNewRow}
            startIcon={<Add />}
            variant="text"
            sx={{
              minWidth: "auto",
              padding: "2.1px",
              ml: "10px",
              textTransform: "none",
              boxSizing: "border-box",
              "&:hover": {
                backgroundColor: "rgba(144, 202, 249, 0.08)",
              },
            }}
          >
            {t("actions.add")}
          </Button>
        )}

        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        {/* View Mode Toggle */}
        {onViewModeChange && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <IconButton
              onClick={() => onViewModeChange("list")}
              color={viewMode === "list" ? "primary" : "default"}
              size="small"
            >
              <ViewList />
            </IconButton>
            <IconButton
              onClick={() => onViewModeChange("grid")}
              color={viewMode === "grid" ? "primary" : "default"}
              size="small"
            >
              <ViewModule />
            </IconButton>
          </>
        )}

        {/* Custom Export Dropdown */}
        <IconButton
          onClick={handleExportClick}
          disabled={isAnyExportInProgress}
        >
          <ExportIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
        >
          {/* Default export options */}
          <GridPrintExportMenuItem />

          <Divider />

          {/* Server-side export options */}
          <GridCsvExportMenuItem options={{ fileName }} />

          <MenuItem
            onClick={() => serverExportToExcel({ selectedOnly: false })}
            disabled={isAnyExportInProgress}
          >
            {t("actions.exportExcel")}
          </MenuItem>
          <MenuItem
            onClick={() => exportToPdf({ selectedOnly: true })}
            disabled={isAnyExportInProgress}
          >
            {t("actions.exportPdf")}
          </MenuItem>
        </Menu>
      </Stack>

      {/* Reusable Overlay Loader */}
      <MyOverlayLoader
        open={isAnyExportInProgress}
        actionType={getCurrentActionType()}
        message={getCurrentMessage()}
      />
    </>
  );
};

export default MyCustomToolbar;
