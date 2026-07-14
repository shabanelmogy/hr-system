"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemIcon,
  ListItemButton,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import {
  useNotificationActions,
  useNotificationList,
  useUnreadNotificationCount,
} from "./notificationQueries";
import {
  formatRelativeTime,
  isSafeAppUrl,
  normalizeSeverity,
  translateNotification,
  type NormalizedNotificationSeverity,
} from "./notificationPresentation";
import type { AppNotification, NotificationFilter } from "./types";

export function NotificationBell() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const countQuery = useUnreadNotificationCount();
  const unreadCount = countQuery.data ?? 0;
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={t("notifications.title")}>
        <IconButton
          color="inherit"
          aria-label={t("notifications.open", { count: unreadCount })}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="large"
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            invisible={unreadCount === 0}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationPopover
        anchorEl={anchorEl}
        open={open}
        unreadCount={unreadCount}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}

type NotificationPopoverProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  unreadCount: number;
  onClose: () => void;
};

function NotificationPopover({
  anchorEl,
  open,
  unreadCount,
  onClose,
}: NotificationPopoverProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [confirmDismissAll, setConfirmDismissAll] = useState(false);
  const allQuery = useNotificationList("all", open);
  const unreadQuery = useNotificationList("unread", open && filter === "unread");
  const listQuery = filter === "unread" ? unreadQuery : allQuery;
  const actions = useNotificationActions();
  const { isConnected, isConnecting } = useSignalRConnection();
  const notifications = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data],
  );
  const totalCount = allQuery.data?.pages[0]?.metaData.totalCount ?? 0;
  const isMutating =
    actions.markAllRead.isPending ||
    actions.markAllUnread.isPending ||
    actions.dismissAll.isPending;

  const openNotification = (notification: AppNotification) => {
    if (!notification.readOn) actions.markRead.mutate(notification.id);
    if (isSafeAppUrl(notification.actionUrl)) {
      router.push(notification.actionUrl as Parameters<typeof router.push>[0]);
      onClose();
    }
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: i18n.dir() === "rtl" ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: i18n.dir() === "rtl" ? "left" : "right",
        }}
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
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 18px 52px rgba(0,0,0,0.55)"
                  : "0 18px 52px rgba(15,23,42,0.2)",
              backgroundImage: "none",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.13),
            }}
          >
            <NotificationsNoneRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("notifications.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("notifications.summary", {
                unread: unreadCount,
                total: totalCount,
              })}
            </Typography>
          </Box>
          <ConnectionIndicator
            connected={isConnected}
            connecting={isConnecting}
          />
          <Tooltip title={t("general.close", { defaultValue: "Close" })}>
            <IconButton size="small" onClick={onClose} aria-label={t("general.close")}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs
          value={filter}
          onChange={(_event, value: NotificationFilter) => setFilter(value)}
          aria-label={t("notifications.filterLabel")}
          sx={{
            px: 1,
            minHeight: 44,
            bgcolor: "background.paper",
            "& .MuiTab-root": { minHeight: 44, fontWeight: 700 },
          }}
        >
          <Tab value="all" label={t("notifications.all")} sx={{ minHeight: 42 }} />
          <Tab
            value="unread"
            label={t("notifications.unread", { count: unreadCount })}
            sx={{ minHeight: 42 }}
          />
        </Tabs>
        <Divider />

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {listQuery.isPending ? (
            <NotificationSkeleton />
          ) : listQuery.isError ? (
            <Box sx={{ p: 2 }}>
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void listQuery.refetch()}>
                    {t("notifications.retry")}
                  </Button>
                }
              >
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
                  markingRead={
                    actions.markRead.isPending &&
                    actions.markRead.variables === notification.id
                  }
                  markingUnread={
                    actions.markUnread.isPending &&
                    actions.markUnread.variables === notification.id
                  }
                  dismissing={
                    actions.dismiss.isPending &&
                    actions.dismiss.variables === notification.id
                  }
                />
              ))}
            </List>
          )}

          {listQuery.hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 1.5 }}>
              <Button
                size="small"
                onClick={() => void listQuery.fetchNextPage()}
                disabled={listQuery.isFetchingNextPage}
                startIcon={
                  listQuery.isFetchingNextPage ? (
                    <CircularProgress size={16} />
                  ) : undefined
                }
              >
                {t("notifications.loadMore")}
              </Button>
            </Box>
          )}
        </Box>

        <Divider />
        <Box
          sx={{
            p: 1,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) 36px",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          <Button
            size="small"
            startIcon={<DoneAllRoundedIcon />}
            disabled={unreadCount === 0 || isMutating}
            onClick={() => actions.markAllRead.mutate()}
            sx={{ minWidth: 0, whiteSpace: "normal", lineHeight: 1.2 }}
          >
            {t("notifications.markAllRead")}
          </Button>
          <Button
            size="small"
            color="inherit"
            startIcon={<MarkEmailUnreadOutlinedIcon />}
            disabled={totalCount === 0 || unreadCount >= totalCount || isMutating}
            onClick={() => actions.markAllUnread.mutate()}
            sx={{ minWidth: 0, whiteSpace: "normal", lineHeight: 1.2 }}
          >
            {t("notifications.markAllUnread")}
          </Button>
          <Tooltip title={t("notifications.dismissAll")}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={totalCount === 0 || isMutating}
                onClick={() => setConfirmDismissAll(true)}
                aria-label={t("notifications.dismissAll")}
              >
                <DeleteSweepOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Popover>

      <Dialog
        open={confirmDismissAll}
        onClose={() => setConfirmDismissAll(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2, backgroundImage: "none" } } }}
      >
        <DialogTitle>{t("notifications.dismissAllTitle")}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {t("notifications.dismissAllDescription")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDismissAll(false)}>
            {t("notifications.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={actions.dismissAll.isPending}
            onClick={() =>
              actions.dismissAll.mutate(undefined, {
                onSuccess: () => setConfirmDismissAll(false),
              })
            }
          >
            {t("notifications.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

type NotificationRowProps = {
  notification: AppNotification;
  locale: string;
  onOpen: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onDismiss: () => void;
  markingRead: boolean;
  markingUnread: boolean;
  dismissing: boolean;
};

function NotificationRow({
  notification,
  locale,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  markingRead,
  markingUnread,
  dismissing,
}: NotificationRowProps) {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const content = translateNotification(notification, t);
  const severity = normalizeSeverity(notification.severity);
  const unread = !notification.readOn;
  const busy = markingRead || markingUnread || dismissing;

  return (
    <Box
      sx={{
        position: "relative",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: unread
          ? (theme) => alpha(theme.palette.primary.main, 0.06)
          : "transparent",
        "&::before": {
          content: '""',
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 0,
          width: 3,
          bgcolor: unread ? "primary.main" : "transparent",
        },
      }}
    >
      <ListItemButton
        onClick={onOpen}
        disabled={busy}
        alignItems="flex-start"
        sx={{ gap: 1.25, px: 2, py: 1.5, paddingInlineEnd: 6.5 }}
      >
        <SeverityIcon severity={severity} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
              variant="body2"
              sx={{
                minWidth: 0,
                flex: 1,
                fontWeight: unread ? 800 : 650,
                overflowWrap: "anywhere",
              }}
            >
              {content.title}
            </Typography>
            {unread && (
              <Box
                aria-label={t("notifications.unreadIndicator")}
                sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main" }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.35, lineHeight: 1.5, overflowWrap: "anywhere" }}
          >
            {content.message}
          </Typography>
          <Box sx={{ mt: 0.85, display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(notification.createdOn, locale)}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {notification.category}
            </Typography>
          </Box>
        </Box>
      </ListItemButton>

      <Tooltip title={t("notifications.moreActions")}>
        <IconButton
          size="small"
          aria-label={t("notifications.moreActions")}
          onClick={(event) => {
            event.stopPropagation();
            setMenuAnchor(event.currentTarget);
          }}
          sx={{ position: "absolute", top: 10, insetInlineEnd: 8 }}
        >
          {busy ? <CircularProgress size={18} /> : <MoreVertRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 190, borderRadius: 1.5, backgroundImage: "none" } } }}
      >
        {isSafeAppUrl(notification.actionUrl) && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onOpen();
            }}
          >
            <ListItemIcon><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>
            {t("notifications.openItem")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            if (unread) onMarkRead();
            else onMarkUnread();
          }}
        >
          <ListItemIcon>
            {unread ? (
              <MarkEmailReadOutlinedIcon fontSize="small" />
            ) : (
              <MarkEmailUnreadOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          {unread ? t("notifications.markRead") : t("notifications.markUnread")}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onDismiss();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t("notifications.dismiss")}
        </MenuItem>
      </Menu>
    </Box>
  );
}

function SeverityIcon({ severity }: { severity: NormalizedNotificationSeverity }) {
  const details: Record<
    NormalizedNotificationSeverity,
    { icon: React.ReactNode; color: keyof Theme["palette"] }
  > = {
    info: { icon: <InfoOutlinedIcon fontSize="small" />, color: "info" },
    success: {
      icon: <CheckCircleOutlineRoundedIcon fontSize="small" />,
      color: "success",
    },
    warning: {
      icon: <WarningAmberRoundedIcon fontSize="small" />,
      color: "warning",
    },
    critical: {
      icon: <ErrorOutlineRoundedIcon fontSize="small" />,
      color: "error",
    },
  };
  const detail = details[severity];

  return (
    <Box
      sx={(theme) => {
        const palette = theme.palette[detail.color] as {
          main: string;
          contrastText?: string;
        };
        return {
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: palette.main,
          bgcolor: alpha(palette.main, 0.12),
        };
      }}
    >
      {detail.icon}
    </Box>
  );
}

function ConnectionIndicator({
  connected,
  connecting,
}: {
  connected: boolean;
  connecting: boolean;
}) {
  const { t } = useTranslation();
  const title = connected
    ? t("notifications.liveConnected")
    : connecting
      ? t("notifications.liveConnecting")
      : t("notifications.liveDisconnected");

  return (
    <Tooltip title={title}>
      <Box
        component="span"
        aria-label={title}
        sx={{
          display: "grid",
          placeItems: "center",
          color: connected
            ? "success.main"
            : connecting
              ? "warning.main"
              : "text.disabled",
        }}
      >
        {connected ? (
          <WifiRoundedIcon fontSize="small" />
        ) : connecting ? (
          <SyncRoundedIcon fontSize="small" />
        ) : (
          <WifiOffRoundedIcon fontSize="small" />
        )}
      </Box>
    </Tooltip>
  );
}

function NotificationEmptyState({ filter }: { filter: NotificationFilter }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 260,
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        px: 3,
        textAlign: "center",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {filter === "unread"
          ? t("notifications.noUnreadTitle")
          : t("notifications.emptyTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {filter === "unread"
          ? t("notifications.noUnreadDescription")
          : t("notifications.emptyDescription")}
      </Typography>
    </Box>
  );
}

function NotificationSkeleton() {
  return (
    <Box aria-busy="true">
      {[0, 1, 2, 3].map((item) => (
        <Box
          key={item}
          sx={{ display: "flex", gap: 1.25, px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="48%" />
            <Skeleton width="88%" />
            <Skeleton width="32%" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
