import type { ThemeOptions } from "@mui/material/styles";
import {
  createMuiThemeOptions,
  defaultPalette,
  getTheme,
  type ThemePalette,
} from "@app/tokens";

/**
 * Application-only component defaults. Design values (colors, typography, shape,
 * spacing, motion) come from @app/tokens; this file owns behavior defaults only.
 */
const componentDefaults: NonNullable<ThemeOptions["components"]> = {
  // Keep the page scroll position stable for every reusable overlay.
  // Individual components can still opt back into scroll locking with
  // disableScrollLock={false} when they need modal behavior.
  MuiDialog: {
    defaultProps: {
      disableScrollLock: true,
    },
  },
  MuiDrawer: {
    defaultProps: {
      ModalProps: {
        disableScrollLock: true,
      },
    },
  },
  MuiMenu: {
    defaultProps: {
      disableScrollLock: true,
    },
  },
  MuiModal: {
    defaultProps: {
      disableScrollLock: true,
    },
  },
  MuiPopover: {
    defaultProps: {
      disableScrollLock: true,
    },
  },
};

export const getDesignTokens = (
  mode: "light" | "dark",
  direction: "ltr" | "rtl" = "ltr",
  palette: ThemePalette = defaultPalette,
): ThemeOptions => {
  const tokenOptions = createMuiThemeOptions(getTheme(palette, mode), direction);

  return {
    ...tokenOptions,
    components: componentDefaults,
    // Every web layout was written for MUI's 8px spacing unit (sx p/m/gap, Grid spacing).
    // The token options use the 4px token grid (spacing(1) = 4px), which halved all web
    // spacing after the S3 theme switch. Keep 8px on web: spacing(n) = 2 token steps.
    spacing: 8,
  };
};
