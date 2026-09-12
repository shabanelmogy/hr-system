import { MappedFile } from "./FileMapper";

export const filterGroupsByQuery = (
  groups: Record<string, MappedFile[]>,
  query: string
): Record<string, MappedFile[]> => {
  if (!query.trim()) return groups;

  const q = query.trim().toLowerCase();
  const filteredGroups: Record<string, MappedFile[]> = {};

  Object.entries(groups).forEach(([groupName, files]) => {
    const filteredFiles = files.filter((f) =>
      (f.name || "").toLowerCase().includes(q)
    );
    if (filteredFiles.length > 0) {
      filteredGroups[groupName] = filteredFiles;
    }
  });

  return filteredGroups;
};

export const filterFilesInGroup = (
  files: MappedFile[],
  query: string
): MappedFile[] => {
  if (!query.trim()) return files;

  const q = query.trim().toLowerCase();
  return files.filter((f) =>
    (f.name || "").toLowerCase().includes(q)
  );
};
