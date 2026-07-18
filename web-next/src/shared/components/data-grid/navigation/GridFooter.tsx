import {
  GridFooterContainer,
  GridPagination,
  gridFilteredSortedRowIdsSelector,
  gridPaginationModelSelector,
  gridRowSelectionIdsSelector,
  useGridApiContext,
  useGridRootProps,
  useGridSelector,
} from "@mui/x-data-grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useDataGridShell } from "../core/context";
import { getActiveRecordIndex, getPageForRecord } from "./recordNavigation";

export function GridFooter() {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const orderedIds = useGridSelector(apiRef, gridFilteredSortedRowIdsSelector);
  const selectedRows = useGridSelector(apiRef, gridRowSelectionIdsSelector);
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const { showRecordNavigation } = useDataGridShell();
  const { t } = useTranslation();
  const theme = useTheme();

  const isRtl = theme.direction === "rtl";
  const recordNavigationEnabled =
    showRecordNavigation && rootProps.paginationMode !== "server";
  const selectedId = selectedRows.keys().next().value;
  const activeIndex = getActiveRecordIndex(
    orderedIds,
    selectedId,
    paginationModel.page,
    paginationModel.pageSize,
  );
  const recordNumber = activeIndex < 0 ? 0 : activeIndex + 1;
  const totalRowCount =
    rootProps.paginationMode === "server"
      ? (rootProps.rowCount ?? orderedIds.length)
      : orderedIds.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalRowCount / Math.max(1, paginationModel.pageSize)),
  );
  const currentPage = Math.min(paginationModel.page + 1, totalPages);

  const navigateToIndex = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

    const targetId = orderedIds[targetIndex];
    apiRef.current.setPage(
      getPageForRecord(targetIndex, paginationModel.pageSize),
    );
    apiRef.current.setRowSelectionModel({
      type: "include",
      ids: new Set([targetId]),
    });

    setTimeout(() => {
      apiRef.current.scrollToIndexes({
        rowIndex: targetIndex % Math.max(1, paginationModel.pageSize),
      });
    }, 150);
  };

  const labels = {
    first: t("pagination.goToFirstRecord"),
    previous: t("pagination.goToPreviousRecord"),
    next: t("pagination.goToNextRecord"),
    last: t("pagination.goToLastRecord"),
  };
  const FirstIcon = isRtl ? LastPageIcon : FirstPageIcon;
  const LastIcon = isRtl ? FirstPageIcon : LastPageIcon;
  const PreviousIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

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
      <Box aria-hidden="true" sx={{ flex: "0 0 150px" }} />

      {recordNavigationEnabled ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flex: 1,
          }}
        >
          <RecordNavigationButton
            label={labels.first}
            disabled={activeIndex <= 0}
            onClick={() => navigateToIndex(0)}
            icon={<FirstIcon />}
          />
          <RecordNavigationButton
            label={labels.previous}
            disabled={activeIndex <= 0}
            onClick={() => navigateToIndex(activeIndex - 1)}
            icon={<PreviousIcon />}
          />
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
              aria-live="polite"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                fontSize: "0.875rem",
                direction: "ltr",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {recordNumber} / {orderedIds.length}
            </Typography>
          </Box>
          <RecordNavigationButton
            label={labels.next}
            disabled={activeIndex < 0 || activeIndex >= orderedIds.length - 1}
            onClick={() => navigateToIndex(activeIndex + 1)}
            icon={<NextIcon />}
          />
          <RecordNavigationButton
            label={labels.last}
            disabled={activeIndex < 0 || activeIndex >= orderedIds.length - 1}
            onClick={() => navigateToIndex(orderedIds.length - 1)}
            icon={<LastIcon />}
          />
        </Box>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
          flex: "0 0 300px",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            minWidth: "80px",
            direction: "ltr",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
        </Typography>

        <Box
          sx={{
            minWidth: "180px",
            "& .MuiTablePagination-root": {
              borderTop: "none",
              overflow: "visible",
            },
            "& .MuiTablePagination-toolbar": {
              minHeight: 52,
              px: 0,
              overflow: "visible",
            },
            "& .MuiTablePagination-displayedRows": { display: "none" },
            "& .MuiTablePagination-actions": { display: "none" },
            "& .MuiTablePagination-select": { minWidth: 60 },
            "& .MuiSelect-select": { paddingRight: "32px !important" },
            "& .MuiInputBase-root": {
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              "&:hover": { borderColor: "primary.main" },
            },
          }}
        >
          <GridPagination />
        </Box>
      </Box>
    </GridFooterContainer>
  );
}

interface RecordNavigationButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function RecordNavigationButton({
  label,
  disabled,
  onClick,
  icon,
}: RecordNavigationButtonProps) {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          size="small"
          sx={{
            p: "6px",
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
              color: "primary.main",
            },
            "&.Mui-disabled": { color: "action.disabled" },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
