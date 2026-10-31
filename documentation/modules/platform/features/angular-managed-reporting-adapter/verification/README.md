# Managed Crystal/PDF verification —2026-10-30

40visual cases:5palettes ×2modes ×2languages ×390/1440.8focused lifecycle cases:
filters draft/apply/reset, selected source, language,200/201validation/shared focus,
ProblemDetails fields,invalid/JSON/empty/503PDF,retry,409 reload/hash,403 latch,
real BroadcastChannel permission loss,late render,SPA Router exit during CSRF,
empty/malformed catalog,open/download links and downloaded bytes equality.
Compact focused cases force navigator.pdfViewerEnabled=false to verify fallback.

Fresh retained login10/language20/context24 passed against intercepted configured
host requests. Source/HMR changes, native error dialogs and page/API errors fail the
driver. All cases are deterministic fixtures. No real account/SQL write or engine
report was used. Inline screenshots capture native Chrome plugin bounds (often
blank in headless capture), not proof the PDF page painted. Download bytes and
PDF signature/MIME are verified; iframe.load is never an acceptance signal.
Physical mobile/CSP/live RPT remain RISK-017/RISK-008/PROD-017/019.
