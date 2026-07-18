"use client";

import type { ElementType } from "react";
import {
  CloudOffOutlined as ServiceIcon,
  HomeOutlined as HomeIcon,
  LockOutlined as AccessIcon,
  RefreshOutlined as RetryIcon,
  SearchOffOutlined as NotFoundIcon,
} from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { safeReturnPath } from "./safeReturnPath";

export type UnavailableReason = "access" | "service" | "notFound";

export interface PageUnavailableProps {
  reason?: UnavailableReason;
  returnTo?: string;
}

export function PageUnavailable({
  reason = "notFound",
  returnTo = "/",
}: PageUnavailableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const config = getUnavailableConfig(reason, t);

  const retry = () => {
    router.replace(safeReturnPath(returnTo) as Route);
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 112px)",
        px: 3,
        py: 6,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2.5,
            display: "grid",
            placeItems: "center",
            borderRadius: 2,
            bgcolor: "action.hover",
            color: config.color,
          }}
        >
          <config.icon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="overline" color={config.color} sx={{ fontWeight: 700 }}>
          {config.code}
        </Typography>
        <Typography component="h1" variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
          {config.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
          {config.description}
        </Typography>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          {reason === "service" ? (
            <Button variant="contained" onClick={retry} startIcon={<RetryIcon />}>
              {t("feedback.routes.retry")}
            </Button>
          ) : (
            <Button component={Link} href="/" variant="contained" startIcon={<HomeIcon />}>
              {t("authorization.forbidden.dashboard")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

type Translate = (key: string) => string;

function getUnavailableConfig(
  reason: UnavailableReason,
  t: Translate,
): {
  code: string;
  title: string;
  description: string;
  color: "error.main" | "warning.main" | "text.secondary";
  icon: ElementType<SvgIconProps>;
} {
  if (reason === "service") {
    return {
      code: "503",
      title: t("feedback.routes.serviceTitle"),
      description: t("feedback.routes.serviceDescription"),
      color: "warning.main",
      icon: ServiceIcon,
    };
  }

  if (reason === "access") {
    return {
      code: "403",
      title: t("authorization.forbidden.title"),
      description: t("authorization.forbidden.message"),
      color: "error.main",
      icon: AccessIcon,
    };
  }

  return {
    code: "404",
    title: t("feedback.routes.notFoundTitle"),
    description: t("feedback.routes.notFoundDescription"),
    color: "text.secondary",
    icon: NotFoundIcon,
  };
}

export default PageUnavailable;
