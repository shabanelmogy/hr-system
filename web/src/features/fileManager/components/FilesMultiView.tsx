import { MultiViewHeader } from "@/shared/components";
import { Box } from "@mui/material";
import { useCallback, useState, useRef } from "react";
import type { GridApiCommon } from "@mui/x-data-grid";
import type { TFunction } from "i18next";
import type { FileItem } from "../types/File";
import FilesDataGrid from "./FilesDataGrid";

import GroupedFilesView from "./groupedView/GroupedFilesView";

interface FilesMultiViewProps {
  files: FileItem[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onAdd: () => void;
  onRefresh?: () => void;
  t: TFunction;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const FilesMultiView = ({
  files,
  loading,
  apiRef,
  onDownload,
  onView,
  onDelete,
  onAdd,
  onRefresh,
  t,
}: FilesMultiViewProps) => {
  const [currentViewType, setCurrentViewType] = useState<"list" | "grouped">(
    "list"
  );
  const [searchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    icon: React.ReactNode;
  } | null>(null);
  const backToGroupsRef = useRef<(() => void) | null>(null);

  const displayFiles = files;
  const displayLoading = loading;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleViewTypeChange = useCallback(
    (newViewType: "list" | "grouped") => {
      setCurrentViewType(newViewType);
    },
    []
  );

  const handleBackToGroups = useCallback(() => {
    if (backToGroupsRef.current) {
      backToGroupsRef.current();
    }
    setSelectedGroup(null);
  }, []);

  const renderView = () => {
    switch (currentViewType) {
      case "list":
        return (
          <FilesDataGrid
            files={displayFiles}
            loading={displayLoading}
            apiRef={apiRef}
            onDownload={onDownload}
            onView={onView}
            onDelete={onDelete}
            onAdd={onAdd}
            t={t}
          />
        );
      case "grouped":
        return (
          <GroupedFilesView
            files={displayFiles as any}
            onOpenFile={(f) => onView?.(f as any)}
            onDeleteFile={(f) => {
              onDelete?.(f as any);
            }}
            onOpenGroup={() => {}}
            onGroupChange={setSelectedGroup}
            onBackToGroups={backToGroupsRef}
          />
        );
      default:
        return (
          <FilesDataGrid
            files={displayFiles}
            loading={displayLoading}
            apiRef={apiRef}
            onDownload={onDownload}
            onView={onView}
            onDelete={onDelete}
            onAdd={onAdd}
            t={t}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <MultiViewHeader
        title={
          selectedGroup
            ? selectedGroup.name
            : t("files.title") || "Files Management"
        }
        titleIcon={selectedGroup?.icon}
        showBackButton={!!selectedGroup}
        onBack={handleBackToGroups}
        storageKey="files-view-layout"
        defaultView="list"
        availableViews={["list", "grouped"]}
        viewLabels={{
          list: t("files.gridView") || "List",
          grouped: t("files.groupView") || "Grouped",
        }}
        onAdd={onAdd}
        dataCount={displayFiles?.length || 0}
        totalLabel={
          searchTerm
            ? t("files.filtered") || "Filtered"
            : t("files.total") || "Total"
        }
        onRefresh={handleRefresh}
        onViewTypeChange={handleViewTypeChange}
        t={(key) => t(key)}
        showActions={{
          add: true,
          refresh: true,
          export: false,
          filter: false,
        }}
        onExport={undefined}
        onFilter={undefined}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          position: "relative",
        }}
      >
        {renderView()}
      </Box>
    </Box>
  );
};

export default FilesMultiView;
