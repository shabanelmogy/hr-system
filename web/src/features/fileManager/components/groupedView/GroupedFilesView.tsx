import React, { useMemo, useState } from "react";
import { FileItem, FileTypeGroup } from "./FileTypeClassifier";
import { groupByType } from "./groupByType";
import GroupsOverview from "./GroupsOverview";
import GroupFilesView from "./GroupFilesView";
import { mapFiles, MappedFile } from "./FileMapper";
import { sortFiles, SortKey } from "./FileSorter";
import { filterGroupsByQuery } from "./GroupFilter";
import { getGroupIcon } from "./GroupIconMapper";

export interface GroupedFilesViewProps {
  files: FileItem[];
  onOpenFile?: (file: FileItem) => void;
  onDeleteFile?: (file: FileItem) => void;
  onOpenGroup?: (group: FileTypeGroup, files: FileItem[]) => void;
  onGroupChange?: (
    group: { name: string; icon: React.ReactNode } | null
  ) => void;
  onBackToGroups?: React.MutableRefObject<(() => void) | null>;
}

const GroupedFilesView: React.FC<GroupedFilesViewProps> = ({
  files,
  onOpenFile,
  onDeleteFile,
  onOpenGroup,
  onGroupChange,
  onBackToGroups,
}) => {
  const [query, setQuery] = useState("");
  const [groupQuery, setGroupQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  // Group files by type first
  const groupedByType = useMemo(() => groupByType(files), [files]);

  // Map files to a normalized format
  const mappedGroups = useMemo(() => {
    const mapped: Record<string, MappedFile[]> = {};
    Object.entries(groupedByType).forEach(([groupName, groupFiles]) => {
      mapped[groupName] = mapFiles(groupFiles);
    });
    return mapped;
  }, [groupedByType]);

  // Sort files based on selected sort key
  const sorted = useMemo(() => {
    const sortedGroups: Record<string, MappedFile[]> = {};
    Object.entries(mappedGroups).forEach(([groupName, groupFiles]) => {
      sortedGroups[groupName] = sortFiles(groupFiles, sortKey);
    });
    return sortedGroups;
  }, [mappedGroups, sortKey]);

  // Filter groups by query
  const groups = useMemo(() => {
    return filterGroupsByQuery(sorted, query);
  }, [sorted, query]);

  const handleGroupClick = (group: string, items: MappedFile[]) => {
    setSelectedGroup(group);
    onOpenGroup?.(group as FileTypeGroup, items as any);
    onGroupChange?.({
      name: group,
      icon: getGroupIcon(group),
    });
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setGroupQuery("");
    setPage(1);
    onGroupChange?.(null);
  };

  // Expose handleBackToGroups to parent component
  React.useEffect(() => {
    if (onBackToGroups) {
      onBackToGroups.current = handleBackToGroups;
    }
  }, [onBackToGroups]);

  // If a group is selected, show files in that group
  if (selectedGroup && (groups as any)[selectedGroup]) {
    const allGroupFiles = (groups as any)[selectedGroup];

    return (
      <GroupFilesView
        groupName={selectedGroup}
        files={allGroupFiles}
        allFiles={files}
        query={groupQuery}
        page={page}
        pageSize={pageSize}
        onQueryChange={setGroupQuery}
        onPageChange={setPage}
        onBackClick={handleBackToGroups}
        onOpenFile={onOpenFile}
        onDeleteFile={onDeleteFile}
      />
    );
  }

  // Show groups overview
  return (
    <GroupsOverview
      groups={groups}
      query={query}
      sortKey={sortKey}
      onQueryChange={setQuery}
      onSortKeyChange={setSortKey}
      onGroupClick={handleGroupClick}
    />
  );
};

export default GroupedFilesView;
