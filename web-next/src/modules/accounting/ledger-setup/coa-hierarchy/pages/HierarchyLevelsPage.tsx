"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { PageHeader } from "@/shared/components/navigation/header";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import HierarchyLevelsDataGrid from "../components/HierarchyLevelsDataGrid";
import {
  useArchiveHierarchyLevel,
  useCreateHierarchyLevel,
  useHierarchyLevels,
  useRestoreHierarchyLevel,
  useUpdateHierarchyLevel,
} from "../hooks/useCoaHierarchyQueries";
import type {
  AccountHierarchyLevel,
  AccountHierarchyLevelMutationRequest,
  AccountRecordStatus,
} from "../types/coaHierarchy";

const HierarchyLevelForm = dynamic(
  () => import("../components/HierarchyLevelForm"),
  { ssr: false },
);

type DialogMode = "add" | "edit" | "view" | "archive" | "restore" | null;

export default function HierarchyLevelsPage() {
  const { t } = useTranslation();
  const authorization = usePermissions();
  const canView = authorization.hasPermission(permissions.ViewAccounts);
  const canManage =
    !authorization.isReadOnly &&
    authorization.hasPermission(permissions.ManageAccounts);

  if (!canView) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          {t("ledgerSetup.hierarchyLevels.messages.forbidden")}
        </Alert>
      </Box>
    );
  }

  return <AuthorizedHierarchyLevelsPage canManage={canManage} />;
}

function AuthorizedHierarchyLevelsPage({
  canManage,
}: {
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const [recordStatus, setRecordStatus] =
    useState<AccountRecordStatus>("active");
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<AccountHierarchyLevel | null>(null);
  const data = useHierarchyLevels(recordStatus);

  const closeDialog = () => {
    setDialog(null);
    setSelected(null);
  };

  const handleMutationError = async (error: Error, fallbackKey: string) => {
    if (
      error instanceof ApiClientError &&
      error.status === 409 &&
      error.code === "Accounting.ConcurrencyConflict"
    ) {
      await data.refetch();
      closeDialog();
      showToast.warning(
        t("ledgerSetup.hierarchyLevels.messages.conflictReloaded"),
      );
      return;
    }
    showToast.error(extractErrorMessage(error) || t(fallbackKey));
  };

  const create = useCreateHierarchyLevel({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.hierarchyLevels.messages.created"));
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(
        error,
        "ledgerSetup.hierarchyLevels.messages.createFailed",
      );
    },
  });
  const update = useUpdateHierarchyLevel({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.hierarchyLevels.messages.updated"));
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(
        error,
        "ledgerSetup.hierarchyLevels.messages.updateFailed",
      );
    },
  });
  const archive = useArchiveHierarchyLevel({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.hierarchyLevels.messages.archived"));
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(
        error,
        "ledgerSetup.hierarchyLevels.messages.archiveFailed",
      );
    },
  });
  const restore = useRestoreHierarchyLevel({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.hierarchyLevels.messages.restored"));
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(
        error,
        "ledgerSetup.hierarchyLevels.messages.restoreFailed",
      );
    },
  });

  const select = (
    item: AccountHierarchyLevel | null,
    next: DialogMode,
  ) => {
    if (next !== "view" && next !== null && !canManage) return;
    setSelected(item);
    setDialog(next);
  };

  const submit = async (request: AccountHierarchyLevelMutationRequest) => {
    if (!canManage) return;
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request,
        rowVersion: selected.rowVersion,
      });
    }
  };

  if (data.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void data.refetch()}>
              {t("common.retry")}
            </Button>
          }
        >
          {extractErrorMessage(data.error) ||
            t("ledgerSetup.hierarchyLevels.messages.listFailed")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <PageHeader
        title={t("ledgerSetup.hierarchyLevels.title")}
        subTitle={t("ledgerSetup.hierarchyLevels.subtitle")}
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => select(null, "add")}
            >
              {t("ledgerSetup.hierarchyLevels.actions.add")}
            </Button>
          ) : undefined
        }
      />
      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        {data.isFetching && !data.isLoading ? (
          <LinearProgress
            sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }}
          />
        ) : null}
        <HierarchyLevelsDataGrid
          rows={data.data ?? []}
          loading={data.isLoading}
          recordStatus={recordStatus}
          canManage={canManage}
          onRecordStatusChange={setRecordStatus}
          onView={(item) => select(item, "view")}
          onEdit={(item) => select(item, "edit")}
          onArchive={(item) => select(item, "archive")}
          onRestore={(item) => select(item, "restore")}
        />
      </Box>

      {dialog === "add" || dialog === "edit" || dialog === "view" ? (
        <HierarchyLevelForm
          open
          mode={dialog}
          item={selected}
          loading={create.isPending || update.isPending}
          onClose={closeDialog}
          onSubmit={submit}
        />
      ) : null}

      <ConfirmationDialog
        open={dialog === "archive"}
        title={t("ledgerSetup.hierarchyLevels.confirm.archiveTitle")}
        description={t(
          "ledgerSetup.hierarchyLevels.confirm.archiveDescription",
        )}
        confirmLabel={t("actions.archive")}
        cancelLabel={t("actions.cancel")}
        confirmColor="warning"
        confirmIcon={<ArchiveRoundedIcon />}
        icon={<ArchiveRoundedIcon color="warning" />}
        busy={archive.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (!canManage || !selected) return;
          void archive.mutateAsync({
            id: selected.id,
            rowVersion: selected.rowVersion,
          });
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {selected?.levelNumber}
        </Typography>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={dialog === "restore"}
        title={t("ledgerSetup.hierarchyLevels.confirm.restoreTitle")}
        description={t(
          "ledgerSetup.hierarchyLevels.confirm.restoreDescription",
        )}
        confirmLabel={t("actions.restore")}
        cancelLabel={t("actions.cancel")}
        confirmColor="success"
        confirmIcon={<RestoreRoundedIcon />}
        icon={<RestoreRoundedIcon color="success" />}
        busy={restore.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (!canManage || !selected) return;
          void restore.mutateAsync({
            id: selected.id,
            rowVersion: selected.rowVersion,
          });
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {selected?.levelNumber}
        </Typography>
      </ConfirmationDialog>
    </Box>
  );
}
