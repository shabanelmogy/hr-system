import { MappedFile } from "./FileMapper";

export type SortKey = "name" | "size" | "updated";

export const sortFiles = (files: MappedFile[], sortKey: SortKey): MappedFile[] => {
  return [...files].sort((a, b) => {
    switch (sortKey) {
      case "size":
        return (a.size || 0) - (b.size || 0);
      case "updated":
        return (
          new Date(a.updatedAt || 0).getTime() -
          new Date(b.updatedAt || 0).getTime()
        );
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  });
};
