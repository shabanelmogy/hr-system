import React from "react";
import { Box, TextField, Pagination } from "@mui/material";
import FileTile from "./FileTile";
import BackButton from "@/shared/components/common/BackButton";
import { MappedFile } from "./FileMapper";
import { FileItem } from "./FileTypeClassifier";
import { formatDistanceToNow } from "date-fns";

export interface GroupFilesViewProps {
  groupName: string;
  files: MappedFile[];
  allFiles: FileItem[];
  query: string;
  page: number;
  pageSize: number;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onBackClick?: () => void;
  onOpenFile?: (file: FileItem) => void;
  onDeleteFile?: (file: FileItem) => void;
}

const GroupFilesView: React.FC<GroupFilesViewProps> = ({
  files,
  allFiles,
  query,
  page,
  pageSize,
  onQueryChange,
  onPageChange,
  onBackClick,
  onOpenFile,
  onDeleteFile,
}) => {
  const filteredFiles = query.trim()
    ? files.filter((f) =>
        (f.name || "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : files;

  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedFiles = filteredFiles.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleQueryChange = (newQuery: string) => {
    onQueryChange(newQuery);
    onPageChange(1);
  };

  const findOriginalFile = (mappedFileId: string): FileItem | undefined => {
    return allFiles.find((file) => file.id.toString() === mappedFileId);
  };

  return (
    <Box
      sx={{ p: 2, pt: 1, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <BackButton
          onClick={onBackClick}
          tooltip="Back to groups"
          ariaLabel="Back to groups"
        />
        <TextField
          size="small"
          label="Search in group"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {paginatedFiles.map((f) => {
          const originalFile = findOriginalFile(f.id);
          return (
            <FileTile
              key={f.id}
              name={f.name}
              subtitle={[
                f.updatedAt
                  ? `Updated ${formatDistanceToNow(new Date(f.updatedAt))} ago`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" • ")}
              onOpen={() => {
                if (originalFile) onOpenFile?.(originalFile as any);
              }}
              onDelete={() => {
                if (originalFile) onDeleteFile?.(originalFile as any);
              }}
              onPreview={() => {
                if (originalFile) {
                  onOpenFile?.(originalFile as any);
                }
                return null;
              }}
            />
          );
        })}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default GroupFilesView;
