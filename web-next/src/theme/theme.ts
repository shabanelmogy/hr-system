import type { ThemeOptions } from "@mui/material/styles";
import {
  createMuiThemeOptions,
  defaultPalette,
  getTheme,
  type ThemePalette,
} from "@app/tokens";

import { getLegacyPalette } from "./legacyPalette";

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
    palette: {
      ...tokenOptions.palette,
      // Transitional keys kept until every consumer moves to semantic tokens
      // (erp-platform-template slice S3.2). Do not use them in new code.
      ...getLegacyPalette(mode),
    },
  };
};
