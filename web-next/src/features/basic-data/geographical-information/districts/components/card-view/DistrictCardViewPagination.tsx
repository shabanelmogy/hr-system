import React from "react";
import { useTranslation } from "react-i18next";
import { CardViewPagination as SharedCardViewPagination } from "@/shared/components/lists/card-view";
import { DistrictCardViewPaginationProps } from "./DistrictCard.types";

const DistrictCardViewPagination: React.FC<DistrictCardViewPaginationProps> = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <SharedCardViewPagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      itemsPerPageOptions={itemsPerPageOptions}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      itemsLabel={t("districts.districts") || "items"}
    />
  );
};

export default DistrictCardViewPagination;
