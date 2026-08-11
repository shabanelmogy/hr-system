"use client";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { getAuthorizedBasicDataNavigation } from "../navigation/basicDataNavigation";

export default function BasicDataHomePage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useSession();
  const items = useMemo(() => getAuthorizedBasicDataNavigation(user), [user]);

  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("menu.chooseBasicDataArea")}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>{t("menu.basicDataDescription")}</Typography>
      </Box>

      {items.map((group) => {
        const groupItems = group.children?.length ? group.children : [group];
        const headingId = `basic-data-group-${group.id}`;

        return (
          <Box component="section" aria-labelledby={headingId} key={group.id}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.25, minWidth: 0 }}>
                <Box
                  aria-hidden
                  sx={{
                    display: "grid",
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    placeItems: "center",
                    borderRadius: 1,
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  {group.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography id={headingId} variant="h6" sx={{ fontWeight: 800 }}>
                    {t(group.titleKey)}
                  </Typography>
                  {group.descriptionKey && (
                    <Typography variant="body2" color="text.secondary">
                      {t(group.descriptionKey)}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Chip
                size="small"
                label={t("menu.basicDataAreaCount", { count: groupItems.length })}
                sx={{ flexShrink: 0 }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {groupItems.map((item, index) => (
                <Paper
                  key={item.id}
                  component={Link}
                  href={item.href}
                  elevation={0}
                  sx={{
                    display: "flex",
                    minWidth: 0,
                    minHeight: 108,
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    color: "text.primary",
                    textDecoration: "none",
                    transition: theme.transitions.create(
                      ["border-color", "background-color", "transform", "box-shadow"],
                      { duration: theme.transitions.duration.shortest },
                    ),
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.035),
                      boxShadow: theme.shadows[2],
                      transform: "translateY(-2px)",
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      display: "grid",
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      placeItems: "center",
                      borderRadius: 1,
                      color:
                        index % 3 === 1
                          ? "secondary.main"
                          : index % 3 === 2
                            ? "info.main"
                            : "primary.main",
                      backgroundColor:
                        index % 3 === 1
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : index % 3 === 2
                            ? alpha(theme.palette.info.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
                      {t(item.titleKey)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {item.descriptionKey
                        ? t(item.descriptionKey)
                        : t("menu.openBasicDataArea")}
                    </Typography>
                  </Box>
                  <ArrowForwardRoundedIcon
                    sx={{
                      flexShrink: 0,
                      color: "text.secondary",
                      transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
                    }}
                  />
                </Paper>
              ))}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
