import { CardViewPagination as SharedCardViewPagination } from "@/shared/components/lists/card-view";
import { StateCardViewPaginationProps } from "./StateCard.types";
import { useTranslation } from "react-i18next";

const StateCardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: StateCardViewPaginationProps) => {
  const {t} = useTranslation();
  return (
    <SharedCardViewPagination
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

export default StateCardViewPagination;
