import UnifiedCardViewHeader from "@/shared/components/common/cardView/cardHeader/UnifiedCardViewHeader";
import { CardViewHeaderProps } from "./StateCard.types";
import { useTranslation } from "react-i18next";

const CardViewHeader = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  processedStatesLength,
  page,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onFilterByChange,
  onClearSearch,
  onReset,
}: CardViewHeaderProps) => {
  const { t } = useTranslation();
  return (
    <UnifiedCardViewHeader
      title={t("states.mainTitle")}
      subtitle={`${t("states.browseAndManage")} ${processedStatesLength} ${t(
        "states.browseDescription"
      )}`}
      mainChipLabel={`${processedStatesLength} ${t("states.state")}`}
      page={page}
      searchTerm={searchTerm}
      searchPlaceholder={t("states.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={() => {
        onSearchChange("");
        onFilterByChange("all");
        onClearSearch();
      }}
      sortBy={sortBy}
      sortByOptions={[
        { value: "name", label: t("states.name") },
        { value: "code", label: t("states.stateCode") },
        { value: "country", label: t("states.country") },
        { value: "created", label: t("states.createdDate")},
      ]}
      onSortByChange={onSortByChange}
      sortOrder={sortOrder as "asc" | "desc"}
      onSortOrderChange={(v) => onSortOrderChange(v)}
      filterBy={filterBy}
      filterOptions={[
        { value: "all", label: t("states.all") },
        { value: "recent30", label: t("states.recent30Days") },
        { value: "recent60", label: t("states.recent60Days") },
        { value: "recent90", label: t("states.recent90Days") },
        { value: "recent120", label: t("states.recent120Days") },
      ]}
      onFilterByChange={onFilterByChange}
      onReset={onReset}
    />
  );
};

export default CardViewHeader;
