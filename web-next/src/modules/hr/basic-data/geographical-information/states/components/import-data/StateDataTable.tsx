import React from "react";
import { Map as MapIcon } from "@mui/icons-material";
import { MyDataTable } from "@/shared/components/data-grid";
import { useTranslation } from "react-i18next";
import { State, ColumnConfig } from "./types";

interface StateDataTableProps {
  states: State[];
  columns: ColumnConfig[];
}

const StateDataTable: React.FC<StateDataTableProps> = ({ states, columns }) => {
  const { t } = useTranslation();

  if (states.length === 0) return null;

  return (
    <MyDataTable
      data={states}
      columns={columns}
      icon={<MapIcon />}
      countLabel={t("states.total")}
      initialRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
    />
  );
};

export default StateDataTable;
