"use client";

import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { alpha, Box, ButtonBase, darken, Stack, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";

export type LauncherTone = "primary" | "secondary" | "success" | "info" | "warning" | "error";
type LauncherVariant = "module" | "submodule";

export interface ModuleLauncherSubmodule {
  code: string;
  name: string;
  entryPath?: string | null;
  icon?: ReactNode;
  tone?: LauncherTone;
}

export interface ModuleLauncherModule {
  code: string;
  name: string;
  submodules: readonly ModuleLauncherSubmodule[];
  icon?: ReactNode;
  tone?: LauncherTone;
  accentColor?: string;
}

export function ModuleLauncher({ modules }: { modules: readonly ModuleLauncherModule[] }) {
  const { t } = useTranslation();
  return (
    <LauncherShell
      title={t("modules.title")}
      description={t("modules.description")}
      icon={<GridViewRoundedIcon />}
    >
      {modules.length === 0 ? (
        <EmptyLauncher icon={<AppsRoundedIcon />} message={t("modules.empty")} />
      ) : (
        <LauncherGrid variant="module">
          {modules.map((module) => (
            <LauncherTile
              key={module.code}
              href={appRoutes.platform.apps.module(module.code)}
              icon={module.icon}
              label={getModuleName(module, t)}
              tone={module.tone}
              accentColor={module.accentColor}
              variant="module"
              iconSize={58}
              eyebrow={module.code.toUpperCase()}
            />
          ))}
        </LauncherGrid>
      )}
    </LauncherShell>
  );
}

export function SubmoduleLauncher({ module }: { module: ModuleLauncherModule }) {
  const { t } = useTranslation();
  return (
    <LauncherShell
      title={getModuleName(module, t)}
      description={t("modules.submoduleDescription")}
      icon={module.icon ?? <AppsRoundedIcon />}
    >
      {module.submodules.length === 0 ? (
        <EmptyLauncher
          icon={<ExtensionRoundedIcon />}
          message={module.code === "acc" ? t("modules.accountingEmpty") : t("modules.genericEmpty")}
        />
      ) : (
        <LauncherGrid variant="submodule">
          {module.submodules.map((submodule) => (
            <LauncherTile
              key={submodule.code}
              href={
                submodule.entryPath ||
                appRoutes.platform.apps.submodule(module.code, submodule.code)
              }
              icon={submodule.icon}
              label={t(`modules.submodules.${module.code}.${submodule.code}`, {
                defaultValue: submodule.name,
              })}
              tone={submodule.tone}
              variant="submodule"
              iconSize={38}
              eyebrow={submodule.code.replaceAll("-", " ")}
            />
          ))}
        </LauncherGrid>
      )}
    </LauncherShell>
  );
}

function LauncherShell({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: { xs: 3, md: 4 },
        minHeight: { md: 470 },
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4.5 },
        border: `1px solid ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.2 : 0.08,
        )}`,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.16)}, ${alpha(theme.palette.background.paper, 0.78)} 42%, ${theme.palette.background.paper})`
            : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.12)}, ${theme.palette.background.paper} 42%, ${theme.palette.background.paper})`,
        boxShadow: `0 18px 60px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.2 : 0.07,
        )}`,
      }}
    >
      <Stack
        spacing={{ xs: 3.5, md: 4.5 }}
        sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
      >
        <Stack
          spacing={1.25}
          sx={{ alignItems: "center", textAlign: "center", maxWidth: 720 }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              color: "primary.main",
              bgcolor: alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.16 : 0.08,
              ),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              "& > svg": { fontSize: 29 },
            }}
          >
            {icon}
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 850,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.15rem" },
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 640, lineHeight: 1.7 }}
          >
            {description}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

function LauncherGrid({ children, variant }: { children: ReactNode; variant: LauncherVariant }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          variant === "module"
            ? "repeat(auto-fit, minmax(168px, 196px))"
            : "repeat(auto-fit, minmax(126px, 150px))",
        justifyContent: "center",
        gap: variant === "module" ? { xs: 2, sm: 2.5, md: 3 } : { xs: 2, sm: 2.5 },
        width: "100%",
        maxWidth: variant === "module" ? 1120 : 980,
      }}
    >
      {children}
    </Box>
  );
}

function LauncherTile({
  href,
  icon,
  label,
  tone = "primary",
  accentColor,
  variant,
  iconSize,
  eyebrow,
}: {
  href: string;
  icon?: ReactNode;
  label: string;
  tone?: LauncherTone;
  accentColor?: string;
  variant: LauncherVariant;
  iconSize: number;
  eyebrow?: string;
}) {
  const theme = useTheme();
  const palette = theme.palette[tone];
  const isPrimary = variant === "module";
  const accent = accentColor ?? palette.main;
  const accentContrast = theme.palette.getContrastText(accent);

  return (
    <ButtonBase
      component={Link}
      href={href as Route}
      aria-label={label}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: isPrimary ? 3.5 : 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: isPrimary ? "stretch" : "start",
        justifySelf: "stretch",
        justifyContent: "flex-start",
        gap: isPrimary ? 1.6 : 1.2,
        p: isPrimary ? { xs: 1.5, sm: 1.75 } : 1.25,
        minHeight: isPrimary ? { xs: 188, sm: 206 } : { xs: 142, sm: 150 },
        height: isPrimary ? { xs: 188, sm: 206 } : "auto",
        color: "text.primary",
        backgroundColor: alpha(
          isPrimary ? accent : theme.palette.background.paper,
          isPrimary
            ? theme.palette.mode === "dark" ? 0.08 : 0.055
            : theme.palette.mode === "dark" ? 0.66 : 0.92,
        ),
        border: `1px solid ${alpha(
          accent,
          theme.palette.mode === "dark" ? 0.52 : 0.28,
        )}`,
        boxShadow: `0 10px 26px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.2 : 0.055,
        )}`,
        transition: theme.transitions.create(["transform", "background-color", "border-color", "box-shadow"]),
        "&:hover": {
          bgcolor: alpha(accent, theme.palette.mode === "dark" ? 0.18 : 0.09),
          borderColor: alpha(accent, theme.palette.mode === "dark" ? 0.78 : 0.52),
          transform: "translateY(-5px)",
          boxShadow: `0 18px 34px ${alpha(
            accent,
            theme.palette.mode === "dark" ? 0.34 : 0.2,
          )}`,
          "& .launcher-arrow": {
            opacity: 1,
            transform:
              theme.direction === "rtl"
                ? "translateX(-2px) scaleX(-1)"
                : "translateX(2px)",
          },
        },
        "&:focus-visible": {
          outline: `3px solid ${alpha(accent, 0.38)}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className="launcher-arrow"
        sx={{
          position: "absolute",
          top: 12,
          insetInlineEnd: 12,
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          color: accent,
          bgcolor: alpha(
            accent,
            theme.palette.mode === "dark" ? 0.14 : 0.08,
          ),
          opacity: isPrimary ? 0.72 : 0,
          transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
          transition: theme.transitions.create(["opacity", "transform"]),
          "& > svg": { fontSize: 17 },
        }}
      >
        <ArrowForwardRoundedIcon />
      </Box>
      <Box
        sx={{
          width: isPrimary ? { xs: 98, sm: 108 } : { xs: 72, sm: 76 },
          height: isPrimary ? { xs: 98, sm: 108 } : { xs: 72, sm: 76 },
          borderRadius: isPrimary ? 3.5 : 3,
          display: "grid",
          placeItems: "center",
          color: accentContrast,
          background: `linear-gradient(145deg, ${accent}, ${darken(accent, 0.24)})`,
          boxShadow: `0 12px 30px ${alpha(accent, isPrimary ? 0.4 : 0.3)}`,
          flexShrink: 0,
          "& > svg": { fontSize: isPrimary ? { xs: iconSize - 4, sm: iconSize + 2 } : iconSize, flexShrink: 0 },
        }}
      >
        {icon ?? <AppsRoundedIcon />}
      </Box>
      {eyebrow ? (
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: accent,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        component="span"
        variant="body2"
        sx={{
          alignSelf: "stretch",
          fontWeight: isPrimary ? 800 : 700,
          lineHeight: isPrimary ? 1.2 : 1.25,
          fontSize: isPrimary ? { xs: "1rem", sm: "1.06rem" } : undefined,
          minHeight: isPrimary ? "2.4em" : undefined,
          display: isPrimary ? "flex" : undefined,
          alignItems: isPrimary ? "center" : undefined,
          justifyContent: isPrimary ? "center" : undefined,
          textAlign: "center",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

function EmptyLauncher({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: "center", py: 7, color: "text.secondary" }}>
      <Box sx={{ "& > svg": { fontSize: 52 } }}>{icon}</Box>
      <Typography sx={{ textAlign: "center" }}>{message}</Typography>
    </Stack>
  );
}

function getModuleName(
  module: Pick<ModuleLauncherModule, "code" | "name">,
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  return t(`modules.${module.code}`, { defaultValue: module.name });
}
