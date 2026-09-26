import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import {
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import type {
  AccountListItem,
  AccountRecordStatus,
  AccountSearchField,
  AccountSearchOperator,
  AccountSortColumn,
} from "../types/coaHierarchy";

interface Props {
  rows: AccountListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  sortColumn: AccountSortColumn;
  sortDirection: "ASC" | "DESC";
  searchValue: string;
  searchField: AccountSearchField;
  searchOperator: AccountSearchOperator;
  recordStatus: AccountRecordStatus;
  canEdit: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: AccountSearchField) => void;
  onSearchOperatorChange: (value: AccountSearchOperator) => void;
  onRecordStatusChange: (value: AccountRecordStatus) => void;
  onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
  onView: (item: AccountListItem) => void;
  onEdit: (item: AccountListItem) => void;
  onArchive: (item: AccountListItem) => void;
  onRestore: (item: AccountListItem) => void;
}

export default function AccountsDataGrid(props: Props) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<AccountListItem>[]>(
    () => [
      {
        field: "code",
        headerName: t("ledgerSetup.fields.code"),
        minWidth: 130,
        flex: 0.6,
      },
      {
        field: "nameAr",
        headerName: t("ledgerSetup.fields.nameAr"),
        minWidth: 180,
        flex: 1,
      },
      {
        field: "nameEn",
        headerName: t("ledgerSetup.fields.nameEn"),
        minWidth: 180,
        flex: 1,
      },
      {
        field: "accountHierarchyLevelId",
        headerName: t("ledgerSetup.fields.accountHierarchyLevelId"),
        minWidth: 135,
        align: "center",
        headerAlign: "center",
        sortable: false,
      },
      {
        field: "allowPosting",
        headerName: t("ledgerSetup.fields.allowPosting"),
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        valueFormatter: (value: boolean) =>
          t(value ? "ledgerSetup.boolean.yes" : "ledgerSetup.boolean.no"),
      },
      {
        field: "createdOn",
        headerName: t("ledgerSetup.accounts.fields.createdOn"),
        minWidth: 150,
        flex: 0.7,
        valueFormatter: (value: string) =>
          value ? new Date(value).toLocaleDateString() : "",
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

  const searchOperators: AccountSearchOperator[] = [
    "contains",
    "doesNotContain",
    "equals",
    "doesNotEqual",
    "startsWith",
    "endsWith",
  ];
  const searchFields: AccountSearchField[] = ["all", "code", "nameAr", "nameEn"];

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={props.rows}
        columns={columns}
        loading={props.loading}
        checkboxSelection={false}
        pagination
        paginationMode="server"
        filterMode="server"
        sortingMode="server"
        paginationModel={{ page: props.page, pageSize: props.pageSize }}
        onPaginationModelChange={props.onPaginationChange}
        rowCount={props.totalCount}
        pageSizeOptions={[10, 25, 50, 100]}
        sortModel={[
          {
            field: props.sortColumn,
            sort: props.sortDirection.toLowerCase() as "asc" | "desc",
          },
        ]}
        onSortModelChange={props.onSortChange}
        showToolbar
        showGridOptions
        toolbarSearch={{
          value: props.searchValue,
          placeholder: t("ledgerSetup.accounts.search.placeholder"),
          onChange: props.onSearchChange,
          onClear: () => props.onSearchChange(""),
          column: {
            label: t("ledgerSetup.accounts.search.column"),
            value: props.searchField,
            onChange: (value) =>
              props.onSearchFieldChange(value as AccountSearchField),
            options: searchFields.map((value) => ({
              value,
              label: t(`ledgerSetup.accounts.search.fields.${value}`),
            })),
          },
          operator: {
            label: t("ledgerSetup.accounts.search.condition"),
            value: props.searchOperator,
            onChange: (value) =>
              props.onSearchOperatorChange(value as AccountSearchOperator),
            options: searchOperators.map((value) => ({
              value,
              label: t(`ledgerSetup.accounts.search.operators.${value}`),
            })),
          },
        }}
        toolbarContent={
          <ResetButton onReset={props.onReset} fullWidth={false} height={40} />
        }
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
                  primary={t(`ledgerSetup.accounts.recordStatus.${value}`)}
                />
              </MenuItem>
            ))}
          </>
        )}
      />
    </ContentWrapper>
  );
}
