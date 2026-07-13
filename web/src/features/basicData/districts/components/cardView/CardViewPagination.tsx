import React from "react";
import { useTranslation } from "react-i18next";
import UnifiedCardViewPagination from "@/shared/components/common/cardView/UnifiedCardViewPagination";
import { CardViewPaginationProps } from "./DistrictCard.types";

const CardViewPagination: React.FC<CardViewPaginationProps> = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <UnifiedCardViewPagination
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

export default CardViewPagination;
