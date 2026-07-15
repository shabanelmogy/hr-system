/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { GridApiCommon } from "@mui/x-data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid } from "@/shared/components/common";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { AddressType } from "../../types/AddressType";
import { makeAddressTypeActions } from "./GridActions";
import { useAddressTypeColumns } from "./Columns";

interface AddressTypesDataGridProps {
  items: AddressType[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApiCommon | null>;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onAdd: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
  onRefresh?: () => void;
}

const AddressTypesDataGrid: React.FC<AddressTypesDataGridProps> = ({
  items,
  loading = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const permissions = useModulePermissions("AddressTypes");

  const getActions = useCallback(
    makeAddressTypeActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  const columns = useAddressTypeColumns({ permissions, getActions });

  const handleAddNew = useCallback(() => {
    if (permissions.canCreate) {
      onAdd();
    }
  }, [onAdd, permissions.canCreate]);

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={items}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "id", sort: "asc" }]}
        addNewRow={permissions.canCreate ? handleAddNew : undefined}
        pagination
        pageSizeOptions={[5, 10, 25]}
        fileName={t("addressTypes.title")}
        reportPdfHeader={t("addressTypes.title")}
        lastAddedId={lastAddedId}
        lastEditedId={lastEditedId}
        lastDeletedIndex={lastDeletedIndex}
        refreshData={onRefresh}
      />
    </ContentWrapper>
  );
};

export default AddressTypesDataGrid;

export type { AddressTypesDataGridProps, AddressType };
