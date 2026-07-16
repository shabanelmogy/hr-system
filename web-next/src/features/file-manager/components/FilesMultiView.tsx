import { PageHeader } from "@/shared/components/navigation/header";
import { Box } from "@mui/material";
import { useCallback, useState, useRef } from "react";
import type { GridApi } from "@mui/x-data-grid";
import type { RefObject } from "react";
import type { TFunction } from "i18next";
import type { FileItem } from "../types/File";
import FilesDataGrid from "./FilesDataGrid";

import GroupedFilesView from "./grouped-view/GroupedFilesView";

interface FilesMultiViewProps {
  files: FileItem[];
  loading: boolean;
  isFetching?: boolean;
  apiRef?: RefObject<GridApi | null>;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
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

  const handleViewTypeChange = useCallback(
    (newViewType: string) => {
      if (newViewType === "list" || newViewType === "grouped") {
        setCurrentViewType(newViewType);
      }
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
            t={t}
          />
        );
      case "grouped":
        return (
          <GroupedFilesView
            files={displayFiles}
            onOpenFile={onView}
            onDeleteFile={(f) => {
              onDelete(f);
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
      <PageHeader
        variant="multi-view"
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
          list: t("files.grid-view") || "List",
          grouped: t("files.groupView") || "Grouped",
        }}
        onAdd={onAdd}
        dataCount={displayFiles?.length || 0}
        totalLabel={
          searchTerm
            ? t("files.filtered") || "Filtered"
            : t("files.total") || "Total"
        }
        onRefresh={onRefresh}
        onViewTypeChange={handleViewTypeChange}
        t={(key: string) => t(key)}
        showActions={{
          add: true,
          refresh: true,
          export: false,
          filter: false,
        }}
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
