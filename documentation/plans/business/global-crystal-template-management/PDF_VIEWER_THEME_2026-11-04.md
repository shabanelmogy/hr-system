# Shared native PDF viewer theme correction

Plan: global-crystal-template-management. Slice: GCT-1. Corrective presentation
change to the existing shared Angular PdfViewer; existing public inputs retained.

## Requested behavior and final decision

The requester wants a dark viewer background/toolbar with original PDF paper
colors, then explicitly confirmed retaining the iframe and attempting supported
theming. The requester also asks for printing in a new browser tab. Existing
Open PDF already uses a trusted original Blob URL and target=_blank.

Actual Chrome/Edge probes show that native PDF toolbar theming differs: Edge
remains light even with computed color-scheme:dark; Chrome uses dark chrome.
ThemeService already sets root color-scheme correctly. This is not proof that a
native toolbar follows application styles. The PDF.js experiment was withdrawn
after discussing the maintenance tradeoff with the requester. No renderer SDK,
worker, fonts, assets, localization keys or dependency changes are delivered.

## Bounded shared implementation

Keep native iframe, safe local validated Blob URLs, resource masking/cleanup and
Open/Download. Apply shared surface/foreground/border/radius tokens consistently
to the application toolbar in both fill and standalone layouts. Apply muted
background and explicit inherited color-scheme to the iframe. Do not filter,
invert or alter PDF bytes. Native PDF toolbar and internal backdrop remain
browser-owned; no promise of forced dark mode in every browser. No iframe reload
or report request on a theme change. No API, RPT, schema or permission change.

Angular22.2.3/PrimeNG22.1.4 unchanged. PrimeNG MCP discovery returned no tools;
no MCP validation is claimed. Reuse the existing PrimeNG anchor directives.

## Verification protocol

Use production assets intercepted through Playwright, synthetic identity/API and
a synthetic PDF. Do not start/restart application servers or mutate live records.
Chrome/Edge, EN/AR, 1213/390px, light then live dark switching: verify toolbar
and frame token colors, inherited scheme, same iframe/Blob/no render request,
original downloaded bytes, new PDF tab and visual unmodified white paper.
Run npm format, check:format, lint, architecture and full check. Update canonical
books/manifests/receipts and regenerate documentation. FOLLOW-024/PROD-028 retain
broader hosted acceptance; DEF-027/028 remain Deferred. No deployment authorized.

## Official references

- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/pdfViewerEnabled
- https://developer.chrome.com/docs/modern-web-guidance/guides/ui-atoms/component-specific-light-dark-theme

## Current result

Full Angular check passed:522unit tests/91files,26architecture/dependency tests,
strict types/templates, zero-warning lint, formatting and production build
495.63kB initial.8Chrome/Edge production fixture cases passed with live theme
switching, unchanged iframe/Blob/request identity, exact download bytes and actual
new PDF tab. Application screenshot capture does not reliably include native PDF
plugin pixels; separate direct-PDF probes demonstrate browser-owned chrome and
original white paper/colored fixture lines. This is not hosted acceptance or an
assertion that Edge native toolbar is dark. See registered portable receipt:
verification/pdf-viewer-theme/verification.json. No renderer dependency delivered.
