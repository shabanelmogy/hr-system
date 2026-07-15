import useViewLayout from "@/shared/hooks/useViewLayout";
import { Paper, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DesktopHeaderLayout from "./multi-view-header/DesktopHeaderLayout";
import MobileHeaderLayout from "./multi-view-header/MobileHeaderLayout";
import type { MultiViewHeaderProps, ViewType } from "./multi-view-header/types";
import ViewActivities from "./multi-view-header/ViewActivities";
import { createViewOptions } from "./multi-view-header/viewOptions";

export type { MultiViewHeaderProps, ViewType } from "./multi-view-header/types";

export default function MultiViewHeader({
  title,
  titleIcon,
  onBack,
  showBackButton = false,
  onAdd,
  storageKey,
  defaultView = "grid",
  availableViews = ["grid", "cards", "chart", "report", "import"],
  viewLabels = {},
  dataCount = 0,
  totalLabel = "Total",
  onRefresh,
  showActions = { add: true, refresh: true, export: false, filter: false },
  additionalChips = [],
  sx = {},
  onViewTypeChange,
  viewComponents = {},
  enableActivity = false,
}: MultiViewHeaderProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewType, changeView] = useViewLayout(storageKey, defaultView, availableViews);
  const viewOptions = useMemo(
    () => createViewOptions(availableViews, viewLabels, t),
    [availableViews, t, viewLabels],
  );

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement> | null,
    nextView: ViewType | null,
  ) => {
    changeView(event, nextView);
    if (nextView) onViewTypeChange?.(nextView);
  };

  useEffect(() => {
    onViewTypeChange?.(viewType);
  }, [onViewTypeChange, viewType]);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else window.location.reload();
  };

  const layoutProps = {
    title,
    titleIcon,
    showBackButton,
    onBack,
    actions: showActions,
    onAdd,
    onRefresh: handleRefresh,
    viewType,
    viewOptions,
    additionalChips,
    onViewChange: handleViewChange,
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          position: { xs: "sticky", md: "static" },
          top: { xs: 0, md: "auto" },
          zIndex: { xs: 100, md: "auto" },
          flexShrink: 0,
          ...sx,
        }}
      >
        <DesktopHeaderLayout {...layoutProps} />
        <MobileHeaderLayout
          {...layoutProps}
          isXs={isXs}
          dataCount={dataCount}
          totalLabel={totalLabel}
        />
      </Paper>
      <ViewActivities
        enabled={enableActivity}
        views={availableViews}
        activeView={viewType}
        components={viewComponents}
      />
    </>
  );
}
