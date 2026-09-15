import { LocationCity as DistrictIcon } from "@mui/icons-material";
import { MyDataTable } from "@/shared/components/data-grid";
import { useTranslation } from "react-i18next";
import type { ColumnConfig, DistrictImportPreview } from "./types";

interface DistrictDataTableProps {
  districts: DistrictImportPreview[];
  columns: ColumnConfig[];
}

export default function DistrictDataTable({ districts, columns }: DistrictDataTableProps) {
  const { t } = useTranslation();

  if (districts.length === 0) return null;

  return (
    <MyDataTable
      data={districts}
      columns={columns}
      icon={<DistrictIcon />}
      countLabel={t("districts.total")}
      initialRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
    />
  );
}
