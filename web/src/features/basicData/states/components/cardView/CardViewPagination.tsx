import UnifiedCardViewPagination from "@/shared/components/common/cardView/UnifiedCardViewPagination";
import { CardViewPaginationProps } from "./StateCard.types";
import { useTranslation } from "react-i18next";

const CardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: CardViewPaginationProps) => {
  const {t} = useTranslation();
  return (
    <UnifiedCardViewPagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      itemsPerPageOptions={itemsPerPageOptions}
      itemsLabel={t("states.state")}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default CardViewPagination;
