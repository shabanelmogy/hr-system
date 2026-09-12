import React from "react";
import { Archive, CheckCircle, Edit, Restore, Visibility, Cancel, History } from "@mui/icons-material";
import { GridActionsCellItem, type GridActionsCellItemProps } from "@mui/x-data-grid";
import type { OrganizationalResource, OrganizationalStructureItem } from "../../types/OrganizationalStructure";

interface ActionFactoryProps {
  t: (key: string) => string;
  resource: OrganizationalResource;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  onView: (item: OrganizationalStructureItem) => void;
  onEdit: (item: OrganizationalStructureItem) => void;
  onLifecycle: (item: OrganizationalStructureItem) => void;
  onApprove: (item: OrganizationalStructureItem) => void;
  onReject: (item: OrganizationalStructureItem) => void;
  onViewLogs?: (item: OrganizationalStructureItem) => void;
}

export const makeOrganizationalStructureActions = ({
  t,
  resource,
  canEdit,
  canDelete,
  canApprove,
  onView,
  onEdit,
  onLifecycle,
  onApprove,
  onReject,
  onViewLogs,
}: ActionFactoryProps) =>
  (params: { row: OrganizationalStructureItem }): React.ReactElement<GridActionsCellItemProps>[] => {
    const item = params.row;
    const isDraftJobDescription = resource === "job-descriptions" &&
      (item.jobDescriptionStatus === 1 || String(item.jobDescriptionStatus).toLowerCase() === "draft");
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [
      <GridActionsCellItem
        key={`view-${item.id}`}
        icon={<Visibility sx={{ color: "info.main" }} />}
        label={t("actions.view")}
        onClick={() => onView(item)}
      />,
    ];

    if (canEdit && !item.isDeleted) {
      actions.push(
        <GridActionsCellItem
          key={`edit-${item.id}`}
          icon={<Edit />}
          label={t("actions.edit")}
          color="primary"
          onClick={() => onEdit(item)}
        />,
      );
    }
    if (canDelete) {
      actions.push(
        <GridActionsCellItem
          key={`lifecycle-${item.id}`}
          icon={item.isDeleted ? <Restore sx={{ color: "success.main" }} /> : <Archive sx={{ color: "warning.main" }} />}
          label={t(item.isDeleted ? "actions.restore" : "actions.archive")}
          onClick={() => onLifecycle(item)}
        />,
      );
    }
    if (resource === "job-descriptions" && canApprove && !item.isDeleted && isDraftJobDescription) {
      actions.push(
        <GridActionsCellItem
          key={`approve-${item.id}`}
          icon={<CheckCircle sx={{ color: "success.main" }} />}
          label={t("organizationalStructure.decision.approve")}
          onClick={() => onApprove(item)}
        />,
        <GridActionsCellItem
          key={`reject-${item.id}`}
          icon={<Cancel sx={{ color: "error.main" }} />}
          label={t("organizationalStructure.decision.reject")}
          onClick={() => onReject(item)}
        />,
      );
    }
    if (onViewLogs) {
      actions.push(
        <GridActionsCellItem
          key={`logs-${item.id}`}
          icon={<History sx={{ color: "text.secondary" }} />}
          label={t("actions.changeLog")}
          onClick={() => onViewLogs(item)}
        />,
      );
    }
    return actions;
  };
