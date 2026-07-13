import React from "react";
import { Box, Grid, TextField, MenuItem } from "@mui/material";
import GroupFolderCard from "./GroupFolderCard";
import { MappedFile } from "./FileMapper";
import { SortKey } from "./FileSorter";
import { getGroupIcon, getGroupColor } from "./GroupIconMapper";
import { useTranslation } from "react-i18next";

export interface GroupsOverviewProps {
  groups: Record<string, MappedFile[]>;
  query: string;
  sortKey: SortKey;
  onQueryChange: (query: string) => void;
  onSortKeyChange: (sortKey: SortKey) => void;
  onGroupClick: (group: string, items: MappedFile[]) => void;
}

const GroupsOverview: React.FC<GroupsOverviewProps> = ({
  groups,
  query,
  sortKey,
  onQueryChange,
  onSortKeyChange,
  onGroupClick,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          size="small"
          label={t("files.searchAll")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          sx={{ width: 300 }}
        />
        <TextField
          size="small"
          label={t("files.sortedBy")}
          select
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
          sx={{ width: 180 }}
        >
          <MenuItem value="name">{t("files.name")}</MenuItem>
          <MenuItem value="size">{t("files.size")}</MenuItem>
          <MenuItem value="updated">{t("files.lastUpdated")}</MenuItem>
        </TextField>
      </Box>

      {/* Folders grid */}
      <Grid container spacing={2}>
        {Object.entries(groups).map(([group, items]) => (
          <Grid key={group} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <GroupFolderCard
              title={`${group}`}
              count={items.length}
              icon={getGroupIcon(group)}
              color={getGroupColor(group)}
              onOpen={() => onGroupClick(group, items)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GroupsOverview;
