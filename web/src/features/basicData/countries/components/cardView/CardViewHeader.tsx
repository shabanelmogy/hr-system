import UnifiedCardViewHeader from "@/shared/components/common/cardView/cardHeader/UnifiedCardViewHeader";
import { useTranslation } from "react-i18next";
import { CardViewHeaderProps } from "./CountryCard.types";

const CardViewHeader = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  processedCountriesLength,
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
      title={t("countries.mainTitle")}
      subtitle={`${t("countries.browseAndManage")} ${processedCountriesLength} ${t(
        "countries.browseDescription"
      )}`}
      mainChipLabel={`${processedCountriesLength} ${t("countries.country")}`}
      page={page}

      searchTerm={searchTerm}
      searchPlaceholder={t("countries.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={() => {
        onSearchChange("");
        onFilterByChange("all");
        onClearSearch();
      }}

      sortBy={sortBy}
      sortByOptions={[
        { value: "name", label: t("countries.name") },
        { value: "alpha2", label: t("countries.alpha2Code") },
        { value: "alpha3", label: t("countries.alpha3Code") },
        { value: "phone", label: t("countries.phoneCode") },
        { value: "currency", label: t("countries.currencyCode") },
        { value: "created", label: t("countries.createdDate") },
      ]}
      onSortByChange={onSortByChange}

      sortOrder={sortOrder as "asc" | "desc"}
      onSortOrderChange={(v) => onSortOrderChange(v)}

      filterBy={filterBy}
      filterOptions={[
        { value: "all", label: t("countries.all") },
        { value: "recent", label: t("countries.recent30Days") },
        { value: "hasPhone", label: t("countries.hasPhone") },
        { value: "hasCurrency", label: t("countries.hasCurrency") },
      ]}
      onFilterByChange={onFilterByChange}

      onReset={onReset}
    />
  );
};

export default CardViewHeader;
