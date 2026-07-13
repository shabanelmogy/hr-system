import UnifiedCardViewHeader from "@/shared/components/common/cardView/cardHeader/UnifiedCardViewHeader";
import { useTranslation } from "react-i18next";
import { CardViewHeaderProps } from "./AddressTypeCard.types";

const CardViewHeader = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  processedAddressTypesLength,
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
      title={t("addressTypes.mainTitle")}
      subtitle={`${t("addressTypes.browseAndManage")} ${processedAddressTypesLength} ${t(
        "addressTypes.browseDescription"
      )}`}
      mainChipLabel={`${processedAddressTypesLength} ${t("addressTypes.addressType")}`}
      page={page}

      searchTerm={searchTerm}
      searchPlaceholder={t("addressTypes.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={() => {
        onSearchChange("");
        onFilterByChange("all");
        onClearSearch();
      }}

      sortBy={sortBy}
      sortByOptions={[
        { value: "name", label: t("general.nameEn") },
        { value: "created", label: t("addressTypes.createdDate") },
      ]}
      onSortByChange={onSortByChange}

      sortOrder={sortOrder as "asc" | "desc"}
      onSortOrderChange={(v) => onSortOrderChange(v)}

      filterBy={filterBy}
      filterOptions={[
        { value: "all", label: t("addressTypes.all") },
        { value: "recent", label: t("addressTypes.recent30Days") },
      ]}
      onFilterByChange={onFilterByChange}

      onReset={onReset}
    />
  );
};

export default CardViewHeader;