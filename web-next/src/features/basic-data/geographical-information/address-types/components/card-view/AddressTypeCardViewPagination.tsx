import { CardViewPagination as SharedCardViewPagination } from "@/shared/components/lists/card-view";
import { AddressTypeCardViewPaginationProps } from "./AddressTypeCard.types";
import { useTranslation } from "react-i18next";

const AddressTypeCardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: AddressTypeCardViewPaginationProps) => {
  const { t } = useTranslation();
  return (
    <SharedCardViewPagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalItems={totalItems}
      itemsPerPageOptions={itemsPerPageOptions}
      itemsLabel={t("addressTypes.addressType")}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default AddressTypeCardViewPagination;
