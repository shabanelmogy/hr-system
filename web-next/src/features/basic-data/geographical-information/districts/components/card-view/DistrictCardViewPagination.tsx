import { CardViewPagination as SharedCardViewPagination } from "@/shared/components/lists/card-view";
import { DistrictCardViewPaginationProps } from "./DistrictCard.types";
import { useTranslation } from "react-i18next";

const DistrictCardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  pinned,
  onPageChange,
  onRowsPerPageChange,
}: DistrictCardViewPaginationProps) => {
  const {t} = useTranslation();
  return (
    <SharedCardViewPagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      itemsPerPageOptions={itemsPerPageOptions}
      itemsLabel={t("districts.state")}
      pinned={pinned}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default DistrictCardViewPagination;
