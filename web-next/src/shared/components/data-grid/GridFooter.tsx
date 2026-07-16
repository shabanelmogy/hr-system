import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GridFooterContainer, GridPagination } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useGridPagination } from "./useGridPagination";
import type {
  GridApi,
  GridPaginationModel,
  GridRowIdGetter,
  GridRowsProp,
} from "@mui/x-data-grid";
import type { MutableRefObject, RefObject } from "react";
import type { NavigationUpdate } from "./types";

interface GridFooterProps {
  apiRef: RefObject<GridApi | null> | null;
  rows?: GridRowsProp;
  rowId: GridRowIdGetter;
  onNavigationUpdate?: (updateFn: NavigationUpdate) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  paginationDirectionRef?: MutableRefObject<"forward" | "backward">;
}

export const GridFooter = ({
  apiRef,
  rows = [],
  rowId,
  onNavigationUpdate,
  paginationModel,
  onPaginationModelChange,
  paginationDirectionRef,
}: GridFooterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = theme.direction === "rtl";

  const {
    navigationCounter,
    displayPaginationModel,
    orderedCount,
    handleGoToFirstRecord,
    handleGoToLastRecord,
    handleGoToPreviousRecord,
    handleGoToNextRecord,
  } = useGridPagination({
    apiRef,
    rows,
    rowId,
    paginationModel,
    onPaginationModelChange,
    paginationDirectionRef,
    onNavigationUpdate,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(orderedCount / (displayPaginationModel?.pageSize || 5))
  );
  const currentPage = (displayPaginationModel?.page || 0) + 1;

  const FirstIcon = isRTL ? LastPageIcon : FirstPageIcon;
  const LastIcon = isRTL ? FirstPageIcon : LastPageIcon;
  const PreviousIcon = isRTL ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <GridFooterContainer
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        minHeight: 52,
        paddingLeft: 2,
        paddingRight: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ flex: "0 0 150px" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          flex: "1",
        }}
      >
        <Tooltip title={t("pagination.goToFirstRecord") || "First Record"}>
          <span>
            <IconButton
              onClick={handleGoToFirstRecord}
              disabled={orderedCount === 0 || navigationCounter <= 1}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": { color: theme.palette.action.disabled },
              }}
            >
              <FirstIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("pagination.goToPreviousRecord") || "Previous Record"}>
          <span>
            <IconButton
              onClick={handleGoToPreviousRecord}
              disabled={orderedCount === 0 || navigationCounter <= 1}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": { color: theme.palette.action.disabled },
              }}
            >
              <PreviousIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: "120px",
            justifyContent: "center",
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            px: 2,
            py: 0.5,
            mx: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: "0.875rem",
              direction: "ltr",
            }}
          >
            {orderedCount > 0
              ? `${navigationCounter} / ${orderedCount}`
              : "0 / 0"}
          </Typography>
        </Box>

        <Tooltip title={t("pagination.goToNextRecord") || "Next Record"}>
          <span>
            <IconButton
              onClick={handleGoToNextRecord}
              disabled={orderedCount === 0 || navigationCounter >= orderedCount}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": { color: theme.palette.action.disabled },
              }}
            >
              <NextIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("pagination.goToLastRecord") || "Last Record"}>
          <span>
            <IconButton
              onClick={handleGoToLastRecord}
              disabled={orderedCount === 0 || navigationCounter >= orderedCount}
              size="small"
              sx={{
                padding: "6px",
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
                "&:disabled": { color: theme.palette.action.disabled },
              }}
            >
              <LastIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: "0 0 300px",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            minWidth: "80px",
            direction: "ltr",
          }}
        >
          {t("pagination.page") || "Page"} {currentPage}{" "}
          {t("pagination.of") || "of"} {totalPages}
        </Typography>

        <Box
          sx={{
            minWidth: "180px",
            "& .MuiTablePagination-root": { borderTop: "none", overflow: "visible" },
            "& .MuiTablePagination-toolbar": { minHeight: "52px", paddingLeft: 0, paddingRight: 0, overflow: "visible" },
            "& .MuiTablePagination-displayedRows": { display: "none" },
            "& .MuiTablePagination-actions": { display: "none" },
            "& .MuiTablePagination-select": { minWidth: "60px" },
            "& .MuiSelect-select": { paddingRight: "32px !important" },
            "& .MuiInputBase-root": {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              "&:hover": { borderColor: theme.palette.primary.main },
            },
          }}
        >
          <GridPagination />
        </Box>
      </Box>
    </GridFooterContainer>
  );
};
