import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import type {
  AccountHierarchyLevel,
  AccountRecordStatus,
} from "../types/coaHierarchy";

interface Props {
  rows: AccountHierarchyLevel[];
  loading: boolean;
  recordStatus: AccountRecordStatus;
  canEdit: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onRecordStatusChange: (value: AccountRecordStatus) => void;
  onView: (item: AccountHierarchyLevel) => void;
  onEdit: (item: AccountHierarchyLevel) => void;
  onArchive: (item: AccountHierarchyLevel) => void;
  onRestore: (item: AccountHierarchyLevel) => void;
}

export default function HierarchyLevelsDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<AccountHierarchyLevel>[]>(
    () => [
      {
        field: "levelNumber",
        headerName: t("ledgerSetup.fields.levelNumber"),
        minWidth: 110,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "nameAr",
        headerName: t("ledgerSetup.fields.nameAr"),
        minWidth: 200,
        flex: 1,
      },
      {
        field: "nameEn",
        headerName: t("ledgerSetup.fields.nameEn"),
        minWidth: 200,
        flex: 1,
      },
      {
        field: "canPost",
        headerName: t("ledgerSetup.fields.canPost"),
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        valueFormatter: (value: boolean) =>
          t(value ? "ledgerSetup.boolean.yes" : "ledgerSetup.boolean.no"),
      },
      {
        field: "actions",
        type: "actions",
        headerName: t("actions.buttons"),
        width: 165,
        sortable: false,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="view"
            icon={<Visibility />}
            label={t("actions.view")}
            onClick={() => props.onView(row)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label={t("actions.edit")}
            disabled={!props.canEdit || row.isDeleted}
            onClick={() => props.onEdit(row)}
            showInMenu={false}
          />,
          row.isDeleted ? (
            <GridActionsCellItem
              key="restore"
              icon={<Restore />}
              label={t("actions.restore")}
              disabled={!props.canRestore}
              onClick={() => props.onRestore(row)}
              showInMenu
            />
          ) : (
            <GridActionsCellItem
              key="archive"
              icon={<Archive />}
              label={t("actions.archive")}
              disabled={!props.canArchive}
              onClick={() => props.onArchive(row)}
              showInMenu
            />
          ),
        ],
      },
    ],
    [props, t],
  );

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={props.rows}
        columns={columns}
        loading={props.loading}
        checkboxSelection={false}
        showToolbar
        showGridOptions
        gridOptionsContent={(close) => (
          <>
            {(["active", "archived", "all"] as const).map((value) => (
              <MenuItem
                key={value}
                selected={props.recordStatus === value}
                onClick={() => {
                  close();
                  props.onRecordStatusChange(value);
                }}
              >
                <ListItemIcon>
                  <Radio checked={props.recordStatus === value} size="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t(`ledgerSetup.hierarchyLevels.recordStatus.${value}`)}
                />
              </MenuItem>
            ))}
          </>
        )}
        initialSortModel={[{ field: "levelNumber", sort: "asc" }]}
      />
    </ContentWrapper>
  );
}
