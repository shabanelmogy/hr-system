import type { MuiAppPalette } from "@app/tokens";

// Extra design tokens that MUI has no slot for (surface, muted, brand2/3, input, ring,
// overlay, chart series). Read them as theme.palette.app.* — never as raw hex values.
declare module "@mui/material/styles" {
  interface Palette {
    app: MuiAppPalette;
  }
  interface PaletteOptions {
    app?: MuiAppPalette;
  }
}

export {};
