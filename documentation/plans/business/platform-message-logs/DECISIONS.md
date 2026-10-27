# Message logs — Decisions

2026-10-21 requester: Email current sends only; each company sees own logs only; detail and Excel, no resend. Content snapshot after sensitive-link redaction. Retention choices in company Settings. Prior project decisions: Administration grouping/shared components/bilingual parity mandatory, experimental DB migration permitted, physical native testing deferred.

Implementation assumption (announced): cleanup initially disabled,90 days prefilled, presets30/90/custom1..3650. No silent destructive default. Transport truth: pending/accepted/failed/cancelled/uncertain, no delivered/read claim. Technical capture remains best-effort with bounded writes; no mail replay on log failure; central RISK-011. Unattributed/anonymous send not assigned to a company or exposed through a global entry. Reopen only when a real provider/use-case needs SMS, delivery callbacks, replay or durable compliance capture.
