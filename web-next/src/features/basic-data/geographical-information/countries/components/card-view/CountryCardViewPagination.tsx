import { CardViewPagination as SharedCardViewPagination } from "@/shared/components/lists/card-view";
import { CountryCardViewPaginationProps } from "./CountryCard.types";
import { useTranslation } from "react-i18next";

const CountryCardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: CountryCardViewPaginationProps) => {
  const { t } = useTranslation();
  return (
    <SharedCardViewPagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      itemsPerPageOptions={itemsPerPageOptions}
      itemsLabel={t("countries.country")}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default CountryCardViewPagination;
