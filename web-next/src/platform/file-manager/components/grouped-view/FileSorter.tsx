import { MappedFile } from "./FileMapper";

export type SortKey = "name" | "size" | "created";

export const sortFiles = (files: MappedFile[], sortKey: SortKey): MappedFile[] => {
  return [...files].sort((a, b) => {
    switch (sortKey) {
      case "size":
        return (a.size || 0) - (b.size || 0);
      case "created":
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  });
};
