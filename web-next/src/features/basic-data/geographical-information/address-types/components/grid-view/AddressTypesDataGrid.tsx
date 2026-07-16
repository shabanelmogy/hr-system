import React, { useMemo } from "react";
import { GridApi } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/data-grid";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { AddressType } from "../../types/AddressType";
import { makeAddressTypeActions } from "./GridActions";
import { useAddressTypeColumns } from "./Columns";

interface AddressTypesDataGridProps {
  items: AddressType[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApi | null>;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

const AddressTypesDataGrid: React.FC<AddressTypesDataGridProps> = ({
  items,
  loading = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}) => {
  const { t } = useTranslation();
  const permissions = useModulePermissions("AddressTypes");

  const getActions = useMemo(
    () => makeAddressTypeActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  const columns = useAddressTypeColumns({ permissions, getActions });

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={items}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        initialSortModel={[{ field: "id", sort: "asc" }]}
        pagination
        pageSizeOptions={[5, 10, 25]}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
      />
    </ContentWrapper>
  );
};

export default AddressTypesDataGrid;

export type { AddressTypesDataGridProps, AddressType };
