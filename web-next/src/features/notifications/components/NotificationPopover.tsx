import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import { Alert, alpha, Box, Button, CircularProgress, Divider, List, Popover, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotificationActions, useNotificationList } from "../notificationQueries";
import { isSafeAppUrl } from "../notificationPresentation";
import type { AppNotification, NotificationFilter } from "../types";
import DismissAllNotificationsDialog from "./DismissAllNotificationsDialog";
import NotificationBulkActions from "./NotificationBulkActions";
import NotificationPopoverHeader from "./NotificationPopoverHeader";
import NotificationRow from "./NotificationRow";
import { NotificationEmptyState, NotificationSkeleton } from "./NotificationStatus";

type NotificationPopoverProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  unreadCount: number;
  onClose: () => void;
};

export default function NotificationPopover(props: NotificationPopoverProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [confirmDismissAll, setConfirmDismissAll] = useState(false);
  const allQuery = useNotificationList("all", props.open);
  const unreadQuery = useNotificationList("unread", props.open && filter === "unread");
  const listQuery = filter === "unread" ? unreadQuery : allQuery;
  const actions = useNotificationActions();
  const connection = useSignalRConnection();
  const notifications = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data],
  );
  const totalCount = allQuery.data?.pages[0]?.metaData.totalCount ?? 0;
  const isMutating = actions.markAllRead.isPending || actions.markAllUnread.isPending || actions.dismissAll.isPending;

  const openNotification = (notification: AppNotification) => {
    if (!notification.readOn) actions.markRead.mutate(notification.id);
    if (isSafeAppUrl(notification.actionUrl)) {
      router.push(notification.actionUrl as Parameters<typeof router.push>[0]);
      props.onClose();
    }
  };

  return (
    <>
      <Popover
        open={props.open}
        anchorEl={props.anchorEl}
        onClose={props.onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: i18n.dir() === "rtl" ? "left" : "right" }}
        transformOrigin={{ vertical: "top", horizontal: i18n.dir() === "rtl" ? "left" : "right" }}
        slotProps={{
          paper: {
            dir: i18n.dir(),
            role: "dialog",
            "aria-label": t("notifications.title"),
            sx: {
              mt: 1,
              width: { xs: "calc(100vw - 16px)", sm: 440 },
              maxWidth: 440,
              height: { xs: "min(76vh, 660px)", sm: "min(74vh, 660px)" },
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              boxShadow: (theme) => theme.palette.mode === "dark" ? "0 18px 52px rgba(0,0,0,0.55)" : "0 18px 52px rgba(15,23,42,0.2)",
              backgroundImage: "none",
              overflow: "hidden",
            },
          },
        }}
      >
        <NotificationPopoverHeader
          unreadCount={props.unreadCount}
          totalCount={totalCount}
          connected={connection.isConnected}
          connecting={connection.isConnecting}
          onClose={props.onClose}
        />
        <Tabs value={filter} onChange={(_event, value: NotificationFilter) => setFilter(value)} aria-label={t("notifications.filterLabel")} sx={{ px: 1, minHeight: 44, bgcolor: "background.paper", "& .MuiTab-root": { minHeight: 44, fontWeight: 700 } }}>
          <Tab value="all" label={t("notifications.all")} sx={{ minHeight: 42 }} />
          <Tab value="unread" label={t("notifications.unread", { count: props.unreadCount })} sx={{ minHeight: 42 }} />
        </Tabs>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {listQuery.isPending ? (
            <NotificationSkeleton />
          ) : listQuery.isError ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void listQuery.refetch()}>{t("notifications.retry")}</Button>}>
                {t("notifications.loadError")}
              </Alert>
            </Box>
          ) : notifications.length === 0 ? (
            <NotificationEmptyState filter={filter} />
          ) : (
            <List disablePadding>
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  locale={i18n.resolvedLanguage ?? i18n.language}
                  onOpen={() => openNotification(notification)}
                  onMarkRead={() => actions.markRead.mutate(notification.id)}
                  onMarkUnread={() => actions.markUnread.mutate(notification.id)}
                  onDismiss={() => actions.dismiss.mutate(notification.id)}
                  markingRead={actions.markRead.isPending && actions.markRead.variables === notification.id}
                  markingUnread={actions.markUnread.isPending && actions.markUnread.variables === notification.id}
                  dismissing={actions.dismiss.isPending && actions.dismiss.variables === notification.id}
                />
              ))}
            </List>
          )}
          {listQuery.hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 1.5 }}>
              <Button size="small" onClick={() => void listQuery.fetchNextPage()} disabled={listQuery.isFetchingNextPage} startIcon={listQuery.isFetchingNextPage ? <CircularProgress size={16} /> : undefined}>
                {t("notifications.loadMore")}
              </Button>
            </Box>
          )}
        </Box>
        <Divider />
        <NotificationBulkActions
          unreadCount={props.unreadCount}
          totalCount={totalCount}
          disabled={isMutating}
          onMarkAllRead={() => actions.markAllRead.mutate()}
          onMarkAllUnread={() => actions.markAllUnread.mutate()}
          onDismissAll={() => setConfirmDismissAll(true)}
        />
      </Popover>
      <DismissAllNotificationsDialog
        open={confirmDismissAll}
        loading={actions.dismissAll.isPending}
        onClose={() => setConfirmDismissAll(false)}
        onConfirm={() => actions.dismissAll.mutate(undefined, { onSuccess: () => setConfirmDismissAll(false) })}
      />
    </>
  );
}
