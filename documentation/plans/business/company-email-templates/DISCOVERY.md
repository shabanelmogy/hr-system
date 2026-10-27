# Company email templates — Discovery

2026-10-20, new capability in Platform. Goal: edit reusable email content without code changes, add use cases gradually. Images show selector/variables/subject/CC/BCC/formatted body; they are explanatory examples, not rental-domain scope.

## User decisions
- Independent company customization only; no global editor.
- Initial actual messages: confirmation, password reset, user invitation.
- Web editing and preview; native preview only; Arabic and English.
- Shipped defaults when company context is absent/untrusted, customization only with verified context.
Original request and answers authorize necessary planning/implementation; no extra approval is required.

## Discovery dimensions
Outcome/process: replace three hardcoded messages with registered templates. Actors: company members with exact View/Edit/Reset. Truth: Platform registry + company override aggregate. Lifecycle: default/customize/update/reset, no arbitrary create/delete/approval. Time: no schedules, audit TimeProvider. Integration: current SMTP and server links. Clients: shared Web Grid/form, native Table/Cards preview. Privacy: sample-only preview, no sensitive message logs/CC/BCC. Volume: three definitions × two cultures per company. Recovery: revisions/reset. Money/stock/legal: no postings/campaigns. Success: known company uses own template; anonymous ambiguity never guesses company.

ASSUMPTION: delivery follows request culture with English fallback; verify en/ar captured render. No new user language setting. SMTP/provider configuration unchanged. Production/device unknowns retain PROD-017/PROD-026, outside this development acceptance.
