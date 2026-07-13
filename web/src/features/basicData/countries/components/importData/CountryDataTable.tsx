import React from "react";
import { Public as PublicIcon } from "@mui/icons-material";
import MyDataTable from "@/shared/components/common/datagrid/myDataTable";
import { useTranslation } from "react-i18next";
import { Country, ColumnConfig } from "./types";

interface CountryDataTableProps {
  countries: Country[];
  columns: ColumnConfig[];
}

const CountryDataTable: React.FC<CountryDataTableProps> = ({
  countries,
  columns,
}) => {
  const { t } = useTranslation();

  if (countries.length === 0) return null;

  return (
    <MyDataTable
      data={countries}
      columns={columns}
      icon={<PublicIcon />}
      countLabel={t("countries.total") || "Total Countries:"}
      initialRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
    />
  );
};

export default CountryDataTable;
