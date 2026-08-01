"use client";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isAuthorized } from "@/lib/auth/authorization";
import { useSession } from "@/lib/auth/SessionContext";
import { getBasicDataNavigation } from "../navigation/basicDataNavigation";
import type { BasicDataNavigationItem } from "../navigation/basicDataNavigation";

function filterNavigation(
  items: readonly BasicDataNavigationItem[],
  user: ReturnType<typeof useSession>["user"],
): BasicDataNavigationItem[] {
  return items.flatMap((item) => {
    const children = item.children ? filterNavigation(item.children, user) : [];
    const itemAllowed = item.permissions.length === 0 || isAuthorized(user, { permissions: item.permissions });

    return itemAllowed || children.length > 0 ? [{ ...item, children }] : [];
  });
}

export default function BasicDataHomePage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useSession();
  const items = useMemo(() => filterNavigation(getBasicDataNavigation(), user), [user]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("menu.chooseBasicDataArea")}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>{t("menu.basicDataDescription")}</Typography>
      </Box>
      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
        <List disablePadding>
          {items.map((item, index) => {
            const children = item.children ?? [];

            return (
              <Box key={item.id}>
                <ListItemButton
                  component={item.href ? Link : "div"}
                  href={item.href}
                  divider={index < items.length - 1 && children.length === 0}
                  sx={{ minHeight: 64, px: 2, gap: 1, "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) } }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={t(item.titleKey)}
                    secondary={children.length > 0 ? t("menu.basicDataGroup") : t("menu.openBasicDataArea")}
                    slotProps={{ primary: { sx: { fontWeight: 700 } }, secondary: { sx: { mt: 0.25 } } }}
                  />
                  {children.length === 0 && <ArrowForwardRoundedIcon sx={{ color: "text.secondary", transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" }} />}
                </ListItemButton>
                {children.length > 0 && (
                  <List disablePadding>
                    {children.map((child) => (
                      <ListItemButton
                        key={child.id}
                        component={Link}
                        href={child.href}
                        divider
                        sx={{ minHeight: 58, paddingInlineStart: 6, gap: 1, "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={t(child.titleKey)} secondary={t("menu.openBasicDataArea")} />
                        <ArrowForwardRoundedIcon sx={{ color: "text.secondary", transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" }} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Box>
            );
          })}
        </List>
      </Paper>
    </Stack>
  );
}
