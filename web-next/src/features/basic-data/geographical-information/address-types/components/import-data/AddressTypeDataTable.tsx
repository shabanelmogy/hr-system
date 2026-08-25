import { LocationOn } from "@mui/icons-material";
import { MyDataTable } from "@/shared/components/data-grid";
import { useTranslation } from "react-i18next";
import type { AddressTypeImportColumn, AddressTypeImportRow } from "./types";

interface AddressTypeDataTableProps {
  rows: AddressTypeImportRow[];
  columns: AddressTypeImportColumn[];
}

const AddressTypeDataTable = ({ rows, columns }: AddressTypeDataTableProps) => {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  return (
    <MyDataTable
      data={rows}
      columns={columns}
      icon={<LocationOn />}
      countLabel={t("addressTypes.total")}
      initialRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      getRowId={(row) => row.rowNumber}
    />
  );
};

export default AddressTypeDataTable;
