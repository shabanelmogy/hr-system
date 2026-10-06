/**
 * @deprecated Transitional palette keys from the pre-token theme.
 *
 * `myColor` and `purple.*` have no meaning in the shared design system. They are kept
 * with their original values so existing screens render unchanged while slice S3.2 of
 * `documentation/plans/business/erp-platform-template/PLAN.md` replaces each consumer
 * with a semantic token (`palette.primary`, `palette.app.muted`, `palette.success`, …).
 * When no consumer remains, delete this file and its augmentation.
 *
 * Note: the old theme also overrode `palette.success` with indigo/light blue. That
 * override is intentionally gone: success is green again, from @app/tokens.
 */
export function getLegacyPalette(mode: "light" | "dark") {
  return mode === "light"
    ? {
        myColor: {
          main: "#DD0F0FFF",
        },
        purple: {
          primary: "#7C3AED",
          primaryLight: "#F5F3FF",
          primaryDark: "#6D28D9",
          completed: "#E0FFF0",
          completedLight: "#ECFDF5",
          inactive: "#D4E0FF",
          inactiveIcon: "#A5A6B9",
          iconActive: "#94A3B8",
          iconCompleted: "#e91e63",
          connector: "#E9E9FF",
          text: "#1F2937",
          textSecondary: "#4B5563",
          white: "#F9FAFB",
        },
      }
    : {
        myColor: {
          main: "#1D0FDDFF",
        },
        purple: {
          primary: "#A78BFA",
          primaryLight: "#2D1B69",
          primaryDark: "#8B5CF6",
          completed: "#E0FFF0",
          completedLight: "#182A54",
          inactive: "#1D1A3A",
          inactiveIcon: "#6B7280",
          iconActive: "#94A3B8",
          iconCompleted: "#F9FAFB",
          connector: "#312E81",
          text: "#F9FAFB",
          textSecondary: "#D1D5DB",
          white: "#F9FAFB",
        },
      };
}
