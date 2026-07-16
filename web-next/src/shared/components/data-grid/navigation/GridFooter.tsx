import {
  GRID_CHECKBOX_SELECTION_FIELD,
  GridFooterContainer,
  GridPagination,
  gridFilteredSortedRowIdsSelector,
  gridFocusCellSelector,
  gridPaginationModelSelector,
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
  const focusedCell = useGridSelector(apiRef, gridFocusCellSelector);
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const { showRecordNavigation } = useDataGridShell();
  const { t } = useTranslation();
  const theme = useTheme();

  const isRtl = theme.direction === "rtl";
  const recordNavigationEnabled =
    showRecordNavigation && rootProps.paginationMode !== "server";
  const activeIndex = getActiveRecordIndex(
    orderedIds,
    focusedCell?.id,
    paginationModel.page,
    paginationModel.pageSize,
  );
  const recordNumber = activeIndex < 0 ? 0 : activeIndex + 1;

  const navigateToIndex = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

    const targetId = orderedIds[targetIndex];
    const visibleColumns = apiRef.current.getVisibleColumns();
    const targetColumnIndex = visibleColumns.findIndex(
      (column) =>
        column.field !== GRID_CHECKBOX_SELECTION_FIELD &&
        column.field !== "actions",
    );
    const columnIndex = targetColumnIndex >= 0 ? targetColumnIndex : 0;
    const targetColumn = visibleColumns[columnIndex];

    apiRef.current.setPage(
      getPageForRecord(targetIndex, paginationModel.pageSize),
    );
    if (targetColumn) {
      apiRef.current.setCellFocus(targetId, targetColumn.field);
    }
    apiRef.current.scrollToIndexes({ rowIndex: targetIndex, colIndex: columnIndex });
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
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: recordNavigationEnabled ? "space-between" : "flex-end",
        gap: 1,
        minHeight: 52,
        px: { xs: 0.5, sm: 1.5 },
        py: { xs: 0.5, sm: 0 },
      }}
    >
      {recordNavigationEnabled ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.25, sm: 0.5 },
            minWidth: 0,
          }}
        >
          <RecordNavigationButton
            label={labels.first}
            disabled={activeIndex <= 0}
            onClick={() => navigateToIndex(0)}
            icon={<FirstIcon fontSize="small" />}
          />
          <RecordNavigationButton
            label={labels.previous}
            disabled={activeIndex <= 0}
            onClick={() => navigateToIndex(activeIndex - 1)}
            icon={<PreviousIcon fontSize="small" />}
          />
          <Typography
            variant="body2"
            aria-live="polite"
            sx={{
              minWidth: { xs: 64, sm: 88 },
              px: { xs: 0.75, sm: 1.5 },
              py: 0.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              textAlign: "center",
              direction: "ltr",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {recordNumber} / {orderedIds.length}
          </Typography>
          <RecordNavigationButton
            label={labels.next}
            disabled={activeIndex < 0 || activeIndex >= orderedIds.length - 1}
            onClick={() => navigateToIndex(activeIndex + 1)}
            icon={<NextIcon fontSize="small" />}
          />
          <RecordNavigationButton
            label={labels.last}
            disabled={activeIndex < 0 || activeIndex >= orderedIds.length - 1}
            onClick={() => navigateToIndex(orderedIds.length - 1)}
            icon={<LastIcon fontSize="small" />}
          />
        </Box>
      ) : null}

      <Box
        sx={{
          minWidth: 0,
          maxWidth: "100%",
          ml: recordNavigationEnabled ? { xs: 0, sm: "auto" } : "auto",
          "& .MuiTablePagination-toolbar": {
            minHeight: 44,
            px: { xs: 0, sm: 1 },
          },
          "& .MuiTablePagination-selectLabel": {
            display: { xs: "none", sm: "block" },
          },
        }}
      >
        <GridPagination />
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
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
