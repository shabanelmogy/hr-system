"use client";
import { Box } from "@mui/material";

/** Server-validated HTML. Scroll mode requires already deactivated links/navigation elements. */
export function SafeHtmlPreview({ html, title, scrollable = false }: { html: string; title: string; scrollable?: boolean }) {
  const policy = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'\">";
  return <Box component="iframe" title={title} sandbox="" tabIndex={scrollable ? 0 : -1} inert={!scrollable} referrerPolicy="no-referrer"
    srcDoc={policy + html} sx={{ width: "100%", minHeight: 320, pointerEvents: scrollable ? "auto" : "none", bgcolor: "common.white", border: 1, borderColor: "divider", borderRadius: 1 }} />;
}
