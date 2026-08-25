import { CardViewHeader } from "@/shared/components/lists/card-view";
import { useTranslation } from "react-i18next";
import type { TenantSortColumn } from "../types";

interface TenantCardViewHeaderProps {
  searchValue: string;
  sortColumn: TenantSortColumn;
  sortDirection: "ASC" | "DESC";
  page: number;
  onSearchChange: (value: string) => void;
  onSortChange: (column: TenantSortColumn, direction: "ASC" | "DESC") => void;
  onReset: () => void;
}

export default function TenantCardViewHeader({
  searchValue,
  sortColumn,
  sortDirection,
  page,
  onSearchChange,
  onSortChange,
  onReset,
}: TenantCardViewHeaderProps) {
  const { t } = useTranslation();

  return (
    <CardViewHeader
      title={t("tenantManagement.title")}
      mainChipLabel=""
      page={page}
      showTitleSection={false}
      compact
      searchTerm={searchValue}
      searchPlaceholder={t("tenantManagement.searchPlaceholder")}
      onSearchChange={onSearchChange}
      onClearSearch={() => onSearchChange("")}
      sortBy={sortColumn}
      sortByOptions={[
        { value: "name", label: t("tenantManagement.name") },
        { value: "identifier", label: t("tenantManagement.identifier") },
        { value: "createdOn", label: t("general.createdOn") },
      ]}
      onSortByChange={(value) => onSortChange(value as TenantSortColumn, sortDirection)}
      sortOrder={sortDirection.toLowerCase() as "asc" | "desc"}
      onSortOrderChange={(value) => onSortChange(
        sortColumn,
        value.toUpperCase() as "ASC" | "DESC",
      )}
      filterBy="all"
      filterOptions={[]}
      onFilterByChange={() => undefined}
      onReset={onReset}
      showFilter={false}
    />
  );
}
