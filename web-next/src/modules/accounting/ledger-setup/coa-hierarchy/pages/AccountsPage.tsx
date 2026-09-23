"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { showToast } from "@/shared/components/feedback/transient";
import { PageHeader } from "@/shared/components/navigation/header";
import { SplitTreeView } from "@/shared/components/tree-view";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import AccountTreeDetailPanel from "../components/AccountTreeDetailPanel";
import AccountsDataGrid from "../components/AccountsDataGrid";
import {
  coaHierarchyKeys,
  fetchFreshAccountDetail,
  useAccountCodeProposal,
  useAccountDetail,
  useAccountTree,
  useArchiveAccount,
  useCreateAccount,
  useRestoreAccount,
  useUpdateAccount,
} from "../hooks/useCoaHierarchyQueries";
import { coaHierarchyService } from "../services/coaHierarchyService";
import type {
  AccountDetail,
  AccountMutationRequest,
  AccountRecordStatus,
  AccountSearchField,
  AccountSearchOperator,
  AccountSortColumn,
  AccountTreeItem,
} from "../types/coaHierarchy";
import { flattenAccountTree } from "../utils/accountTree";
import { isAccountCodeConflict } from "../utils/accountErrors";

const AccountForm = dynamic(() => import("../components/AccountForm"), {
  ssr: false,
});

type DialogMode = "add" | "edit" | "view" | "archive" | "restore" | null;
type ViewMode = "tree" | "list";

interface ListFilters {
  recordStatus: AccountRecordStatus;
  searchField: AccountSearchField;
  searchOperator: AccountSearchOperator;
}

const defaultFilters: ListFilters = {
  recordStatus: "active",
  searchField: "all",
  searchOperator: "contains",
};

export default function AccountsPage() {
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
          {t("ledgerSetup.accounts.messages.forbidden")}
        </Alert>
      </Box>
    );
  }

  return <AuthorizedAccountsPage canManage={canManage} />;
}

function AuthorizedAccountsPage({ canManage }: { canManage: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [treeSearch, setTreeSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(
    () => new Set(),
  );
  const initializedExpansion = useRef(false);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [dialogAccount, setDialogAccount] = useState<AccountDetail | null>(null);
  const [createParentId, setCreateParentId] = useState<number | null>(null);

  const list = useServerListState<AccountSortColumn, ListFilters>({
    defaultColumn: "code",
    defaultFilters,
    defaultPageSize: 25,
  });
  const accountQuery = useMemo(
    () => ({
      pageNumber: list.state.page + 1,
      pageSize: list.state.pageSize,
      search: list.debouncedSearchValue || undefined,
      searchField: list.state.filters.searchField,
      searchOperator: list.state.filters.searchOperator,
      recordStatus: list.state.filters.recordStatus,
      sortBy: list.state.columnName,
      sortDirection: list.state.sortDirection.toLowerCase() as "asc" | "desc",
    }),
    [list.debouncedSearchValue, list.state],
  );
  const accountPage = useQuery({
    queryKey: coaHierarchyKeys.accountPage(accountQuery),
    queryFn: () => coaHierarchyService.getAccountPage(accountQuery),
    enabled: viewMode === "list",
    placeholderData: keepPreviousData,
  });
  const tree = useAccountTree(viewMode === "tree");
  const treeItems = useMemo(
    () => flattenAccountTree(tree.data ?? []),
    [tree.data],
  );
  const detail = useAccountDetail(selectedId, viewMode === "tree");
  const proposal = useAccountCodeProposal(dialog === "add");

  useEffect(() => {
    if (initializedExpansion.current || treeItems.length === 0) return;
    initializedExpansion.current = true;
    setExpandedIds(new Set(treeItems.map((item) => item.id)));
  }, [treeItems]);

  const closeDialog = () => {
    setDialog(null);
    setDialogAccount(null);
    setCreateParentId(null);
  };

  const refreshActiveView = async () => {
    if (viewMode === "tree") await tree.refetch();
    else await accountPage.refetch();
  };

  const handleMutationError = async (
    error: Error,
    fallbackKey: string,
    preserveCreate = false,
  ) => {
    if (isAccountCodeConflict(error)) {
      await proposal.refetch();
      showToast.error(extractErrorMessage(error) || t(fallbackKey));
      return;
    }
    if (
      error instanceof ApiClientError &&
      error.status === 409 &&
      error.code === "Accounting.ConcurrencyConflict"
    ) {
      await refreshActiveView();
      if (!preserveCreate) closeDialog();
      showToast.warning(t("ledgerSetup.accounts.messages.conflictReloaded"));
      return;
    }
    showToast.error(extractErrorMessage(error) || t(fallbackKey));
  };

  const create = useCreateAccount({
    onSuccess: (item) => {
      showToast.success(
        t("ledgerSetup.accounts.messages.created", { code: item.code }),
      );
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(
        error,
        "ledgerSetup.accounts.messages.createFailed",
        true,
      );
    },
  });
  const update = useUpdateAccount({
    onSuccess: (item) => {
      showToast.success(
        t("ledgerSetup.accounts.messages.updated", { code: item.code }),
      );
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(error, "ledgerSetup.accounts.messages.updateFailed");
    },
  });
  const archive = useArchiveAccount({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.accounts.messages.archived"));
      setSelectedId(null);
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(error, "ledgerSetup.accounts.messages.archiveFailed");
    },
  });
  const restore = useRestoreAccount({
    onSuccess: () => {
      showToast.success(t("ledgerSetup.accounts.messages.restored"));
      closeDialog();
    },
    onError: (error) => {
      void handleMutationError(error, "ledgerSetup.accounts.messages.restoreFailed");
    },
  });

  const openCreate = (parentId: number | null = null) => {
    if (!canManage) return;
    setDialogAccount(null);
    setCreateParentId(parentId);
    setDialog("add");
  };

  const openProtectedAction = async (
    id: number,
    next: Exclude<DialogMode, "add" | null>,
  ) => {
    if (next !== "view" && !canManage) return;
    try {
      const current = await fetchFreshAccountDetail(queryClient, id);
      setDialogAccount(current);
      setDialog(next);
    } catch (error) {
      showToast.error(
        extractErrorMessage(error) ||
          t("ledgerSetup.accounts.messages.detailFailed"),
      );
    }
  };

  const submit = async (request: AccountMutationRequest) => {
    if (!canManage) return;
    if (dialog === "add") await create.mutateAsync(request);
    else if (dialog === "edit" && dialogAccount) {
      await update.mutateAsync({
        id: dialogAccount.id,
        request,
        rowVersion: dialogAccount.rowVersion,
      });
    }
  };

  const treeError = tree.error
    ? extractErrorMessage(tree.error) || t("ledgerSetup.accounts.messages.treeFailed")
    : null;
  const proposalError = proposal.error
    ? extractErrorMessage(proposal.error) ||
      t("ledgerSetup.accounts.messages.proposalFailed")
    : null;

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
        title={t("ledgerSetup.accounts.title")}
        subTitle={t("ledgerSetup.accounts.subtitle")}
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => openCreate()}
            >
              {t("ledgerSetup.accounts.actions.add")}
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={viewMode}
        onChange={(_, value: ViewMode) => setViewMode(value)}
        aria-label={t("ledgerSetup.accounts.views.label")}
        sx={{ flexShrink: 0 }}
      >
        <Tab value="tree" label={t("ledgerSetup.accounts.views.tree")} />
        <Tab value="list" label={t("ledgerSetup.accounts.views.list")} />
      </Tabs>

      {viewMode === "tree" ? (
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          {tree.isFetching && !tree.isLoading ? (
            <LinearProgress
              sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 20 }}
            />
          ) : null}
          {treeError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => void tree.refetch()}>
                  {t("common.retry")}
                </Button>
              }
            >
              {treeError}
            </Alert>
          ) : (
            <SplitTreeView<AccountTreeItem>
              items={treeItems}
              getId={(item) => item.id}
              getParentId={(item) => item.parentAccountId}
              getCode={(item) => item.code}
              getName={(item, isArabic) =>
                isArabic ? item.nameAr : item.nameEn
              }
              getSecondaryName={(item, isArabic) =>
                isArabic ? item.nameEn : item.nameAr
              }
              variant="tree-list"
              searchFilter={(item, term) =>
                item.code.toLowerCase().includes(term) ||
                item.nameAr.toLowerCase().includes(term) ||
                item.nameEn.toLowerCase().includes(term)
              }
              searchValue={treeSearch}
              onSearchChange={setTreeSearch}
              expandedIds={expandedIds}
              onExpandedIdsChange={setExpandedIds}
              selectedId={selectedId}
              onSelect={(item) => setSelectedId(item?.id ?? null)}
              canDrag={false}
              onAddChild={
                canManage
                  ? (item) => {
                      if (!item.allowPosting) openCreate(item.id);
                    }
                  : undefined
              }
              onEdit={
                canManage
                  ? (item) => void openProtectedAction(item.id, "edit")
                  : undefined
              }
              renderDetailPanel={({ selectedItem }) => (
                <AccountTreeDetailPanel
                  node={selectedItem}
                  detail={detail.data}
                  loading={detail.isFetching}
                  error={
                    detail.error
                      ? extractErrorMessage(detail.error) ||
                        t("ledgerSetup.accounts.messages.detailFailed")
                      : null
                  }
                  canManage={canManage}
                  onRetry={() => void detail.refetch()}
                  onAddChild={(node) => openCreate(node.id)}
                  onEdit={(id) => void openProtectedAction(id, "edit")}
                  onArchive={(id) => void openProtectedAction(id, "archive")}
                />
              )}
              renderEmptyDetailPanel={() => (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {t("ledgerSetup.accounts.tree.emptyTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {t("ledgerSetup.accounts.tree.emptyPrompt")}
                  </Typography>
                </Box>
              )}
              rootTitle={t("ledgerSetup.accounts.tree.rootTitle")}
              searchPlaceholder={t("ledgerSetup.accounts.search.treePlaceholder")}
              loading={tree.isLoading}
              detailPanelWidth={440}
            />
          )}
        </Box>
      ) : accountPage.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void accountPage.refetch()}>
              {t("common.retry")}
            </Button>
          }
        >
          {extractErrorMessage(accountPage.error) ||
            t("ledgerSetup.accounts.messages.listFailed")}
        </Alert>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          {accountPage.isFetching && !accountPage.isLoading ? (
            <LinearProgress
              sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 4 }}
            />
          ) : null}
          <AccountsDataGrid
            rows={accountPage.data?.items ?? []}
            loading={accountPage.isLoading}
            page={list.state.page}
            pageSize={list.state.pageSize}
            totalCount={accountPage.data?.metaData.totalCount ?? 0}
            sortColumn={list.state.columnName}
            sortDirection={list.state.sortDirection}
            searchValue={list.state.searchValue}
            searchField={list.state.filters.searchField}
            searchOperator={list.state.filters.searchOperator}
            recordStatus={list.state.filters.recordStatus}
            canManage={canManage}
            onSearchChange={list.setSearchValue}
            onSearchFieldChange={(value) =>
              list.setFilters({ ...list.state.filters, searchField: value })
            }
            onSearchOperatorChange={(value) =>
              list.setFilters({ ...list.state.filters, searchOperator: value })
            }
            onRecordStatusChange={(value) =>
              list.setFilters({ ...list.state.filters, recordStatus: value })
            }
            onReset={list.reset}
            onPaginationChange={(model) =>
              model.pageSize !== list.state.pageSize
                ? list.setPageSize(model.pageSize)
                : list.setPage(model.page)
            }
            onSortChange={(model) => {
              const item = model[0];
              if (item?.sort) {
                list.setSort(
                  item.field as AccountSortColumn,
                  item.sort.toUpperCase() as "ASC" | "DESC",
                );
              }
            }}
            onView={(item) => void openProtectedAction(item.id, "view")}
            onEdit={(item) => void openProtectedAction(item.id, "edit")}
            onArchive={(item) => void openProtectedAction(item.id, "archive")}
            onRestore={(item) => void openProtectedAction(item.id, "restore")}
          />
        </Box>
      )}

      {dialog === "add" || dialog === "edit" || dialog === "view" ? (
        <AccountForm
          open
          mode={dialog}
          item={dialogAccount}
          proposalCode={proposal.data?.code}
          initialParentAccountId={createParentId}
          loading={
            create.isPending ||
            update.isPending ||
            (dialog === "add" && proposal.isFetching)
          }
          detailError={dialog === "add" ? proposalError : null}
          onRetryDetail={
            dialog === "add" ? () => void proposal.refetch() : undefined
          }
          onClose={closeDialog}
          onSubmit={submit}
        />
      ) : null}

      <ConfirmationDialog
        open={dialog === "archive"}
        title={t("ledgerSetup.accounts.confirm.archiveTitle")}
        description={t("ledgerSetup.accounts.confirm.archiveDescription")}
        confirmLabel={t("actions.archive")}
        cancelLabel={t("actions.cancel")}
        confirmColor="warning"
        confirmIcon={<ArchiveRoundedIcon />}
        icon={<ArchiveRoundedIcon color="warning" />}
        busy={archive.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (!canManage || !dialogAccount) return;
          void archive.mutateAsync({
            id: dialogAccount.id,
            rowVersion: dialogAccount.rowVersion,
          });
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {dialogAccount?.code}
        </Typography>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={dialog === "restore"}
        title={t("ledgerSetup.accounts.confirm.restoreTitle")}
        description={t("ledgerSetup.accounts.confirm.restoreDescription")}
        confirmLabel={t("actions.restore")}
        cancelLabel={t("actions.cancel")}
        confirmColor="success"
        confirmIcon={<RestoreRoundedIcon />}
        icon={<RestoreRoundedIcon color="success" />}
        busy={restore.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (!canManage || !dialogAccount) return;
          void restore.mutateAsync({
            id: dialogAccount.id,
            rowVersion: dialogAccount.rowVersion,
          });
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {dialogAccount?.code}
        </Typography>
      </ConfirmationDialog>
    </Box>
  );
}
