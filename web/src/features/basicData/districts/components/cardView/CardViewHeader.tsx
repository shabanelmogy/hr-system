import React from "react";
import UnifiedCardViewHeader from "@/shared/components/common/cardView/cardHeader/UnifiedCardViewHeader";
import { useTranslation } from "react-i18next";

interface CardViewHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  processedDistrictsLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onFilterByChange: (value: string) => void;
  onClearSearch: () => void;
  onReset: () => void;
}

const CardViewHeader: React.FC<CardViewHeaderProps> = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  processedDistrictsLength,
  page,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onFilterByChange,
  onClearSearch,
  onReset,
}) => {
  const { t } = useTranslation();
  return (
    <UnifiedCardViewHeader
      title={t("districts.viewTitle") || "Districts Management"}
      subtitle={`${t("districts.browseAndManage") || "Browse and manage"} ${processedDistrictsLength} ${t("districts.districts") || "Districts"}`}
      mainChipLabel={`${processedDistrictsLength} ${t("districts.districts") || "Districts"}`}
      page={page}
      searchTerm={searchTerm}
      searchPlaceholder={t("districts.searchPlaceHolder") || "Search districts by name, code, or state..."}
      onSearchChange={onSearchChange}
      sortByOptions={[
        { value: "name", label: t("districts.sort.name") || "Name" },
        { value: "code", label: t("districts.sort.code") || "Code" },
        { value: "state", label: t("districts.sort.state") || "State" },
        { value: "created", label: t("districts.sort.created") || "Created Date" },
      ]}
      sortBy={sortBy}
      onSortByChange={onSortByChange}
      sortOrder={sortOrder as "asc" | "desc"}
      onSortOrderChange={onSortOrderChange}
      filterOptions={[
        { value: "all", label: t("districts.filters.all") || "All Districts" },
        { value: "recent", label: t("districts.filters.recent30Days") || "Recent (30 days)" },
        { value: "hasState", label: t("districts.filters.hasState") || "With State" },
      ]}
      filterBy={filterBy}
      onFilterByChange={onFilterByChange}
      onClearSearch={onClearSearch}
      onReset={onReset}
    />
  );
};

export default CardViewHeader;