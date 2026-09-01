import React from "react";
import { AppChip } from "@/shared/components/cards";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import type { GridActionsCellItemProps, GridColDef } from "@mui/x-data-grid";
import { organizationalResourceSupportsParent, type OrganizationalResource, type OrganizationalStructureItem } from "../../types/OrganizationalStructure";

interface ColumnsFactoryProps {
  t: (key: string) => string;
  resource: OrganizationalResource;
  language: "ar" | "en";
  getActions: (params: { row: OrganizationalStructureItem }) => React.ReactElement<GridActionsCellItemProps>[];
}

function getParent(item: OrganizationalStructureItem, language: "ar" | "en") {
  const values = language === "ar"
    ? [item.positionCode, item.divisionNameAr, item.departmentNameAr, item.branchNameAr, item.parentNameAr]
    : [item.positionCode, item.divisionNameEn, item.departmentNameEn, item.branchNameEn, item.parentNameEn];
  return values.find(Boolean) ?? "";
}

function getJobDescriptionStatus(item: OrganizationalStructureItem): "draft" | "approved" | "rejected" | "expired" | "" {
  if (typeof item.jobDescriptionStatus === "number") {
    return ({ 1: "draft", 2: "approved", 3: "rejected", 4: "expired" } as const)[item.jobDescriptionStatus] ?? "";
  }
  const value = item.jobDescriptionStatus?.toLowerCase();
  return value === "draft" || value === "approved" || value === "rejected" || value === "expired" ? value : "";
}

export const useOrganizationalStructureColumns = ({ t, resource, language, getActions }: ColumnsFactoryProps): GridColDef<OrganizationalStructureItem>[] => {
  const columns: GridColDef<OrganizationalStructureItem>[] = [
    { field: "id", headerName: t("general.id"), flex: 0.45, align: "center", headerAlign: "center", sortable: false },
    { field: "nameAr", headerName: t("general.nameAr"), flex: 1.15, minWidth: 150, align: "center", headerAlign: "center" },
    { field: "nameEn", headerName: t("general.nameEn"), flex: 1.15, minWidth: 150, align: "center", headerAlign: "center" },
    { field: "code", headerName: t("organizationalStructure.fields.code"), flex: 0.75, minWidth: 110, align: "center", headerAlign: "center", renderCell: renderCode },
  ];

  if (organizationalResourceSupportsParent(resource)) {
    columns.push({
      field: "parent",
      headerName: t("organizationalStructure.fields.parent"),
      flex: 1.2,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      sortable: true,
      renderCell: ({ row }) => <AppChip label={getParent(row, language)} colorKey="primary" variant="outlined" size="small" />,
    });
  }

  if (resource === "branches") {
    columns.push({
      field: "isHeadquarters",
      headerName: t("organizationalStructure.fields.headquarters"),
      flex: 0.85,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => <AppChip label={value ? t("organizationalStructure.yes") : t("organizationalStructure.no")} colorKey={value ? "success" : "secondary"} variant="outlined" size="small" />,
    });
  } else if (resource === "job-levels") {
    columns.push({
      field: "levelOrder",
      headerName: t("organizationalStructure.fields.levelOrder"),
      flex: 0.75,
      align: "center",
      headerAlign: "center",
      sortable: true,
      renderCell: ({ value }) => <AppChip label={String(value ?? "")} colorKey="secondary" variant="outlined" size="small" />,
    });
  } else if (resource === "positions") {
    columns.push({
      field: "targetHeadcount",
      headerName: t("organizationalStructure.fields.targetHeadcount"),
      flex: 0.85,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => <AppChip label={String(value ?? 0)} colorKey={Number(value) > 0 ? "success" : "secondary"} variant="outlined" size="small" />,
    });
  } else if (resource === "job-descriptions") {
    columns.push(
      { field: "version", headerName: t("organizationalStructure.fields.version"), flex: 0.75, align: "center", headerAlign: "center", renderCell: renderCode },
      {
        field: "jobDescriptionStatus",
        headerName: t("organizationalStructure.fields.approvalStatus"),
        flex: 0.95,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => {
          const status = getJobDescriptionStatus(row);
          return status ? <AppChip label={t(`organizationalStructure.jobDescriptionStatus.${status}`)} colorKey={status === "approved" ? "success" : status === "rejected" ? "error" : status === "expired" ? "warning" : "info"} variant="soft" size="small" /> : null;
        },
      },
    );
  }

  columns.push(
    { field: "createdOn", headerName: t("general.createdOn"), flex: 1, align: "center", headerAlign: "center", valueFormatter: renderDate },
    { field: "updatedOn", headerName: t("general.updatedOn"), flex: 1, align: "center", headerAlign: "center", sortable: false, valueFormatter: renderDate },
    {
      field: "isDeleted",
      headerName: t("organizationalStructure.fields.status"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => <AppChip label={value ? t("organizationalStructure.status.archived") : t("organizationalStructure.status.active")} colorKey={value ? "error" : "success"} variant="soft" size="small" />,
    },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), flex: 0.9, minWidth: 112, align: "center", headerAlign: "center", sortable: false, getActions },
  );
  return columns;
};
