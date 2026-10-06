# ERP Platform Template — Discovery

## 1. Discovery basis

Owner conversations in September 2026 (Arabic), the School Management conversion and template
work, and the read-only review in `REVIEW.md` with evidence in `EVIDENCE.md`.

## 2. Business outcome

A professional, reusable business/SaaS platform that starts any new product with the
fundamentals already built: multi-tenant API, MUI web client, native Expo mobile client, one
design language, shared screen patterns, common modules (chat, kanban, and similar), and a
planning system that turns either an existing application or a new business idea into an
executable plan.

## 3. Verified facts

1. The ERP repository already provides the modular API, tenancy, sessions, permissions, BFF,
   mobile foundation, shared components, and gated planning system (E-001 … E-013).
2. The repository still carries HR-era remnants and archives (E-014 … E-019).
3. The web theme is not shared with mobile and has non-semantic colors (E-026).
4. Chat, kanban, dashboard, calendar pattern, record-level scope, and a new-product generator
   are missing (E-025, E-030).

## 4. Requested decisions (owner)

- The ERP project is the base; the School becomes a module (D-001).
- Rename from hr-system to ERPSYSTEM: folder name (done) and remaining old names (D-008).
- Move the School template files into the ERP repository (D-007).
- Web: MUI (D-002). Mobile: native components, shared styles (D-003, D-004).
- A single customer is one tenant and logs in without noticing it (D-005).
- Deliver a review report and a merge plan inside `documentation/plans`; no code changes now (D-012).

## 5. Actors

| Actor | Goal |
| --- | --- |
| Platform owner / architect | Start a new product or module quickly on a proven base. |
| Module developer (human or AI assistant) | Follow one planning path, reuse shared components and patterns, pass gates. |
| Tenant administrator | Configure company, users, roles, branding. |
| End user (web and mobile) | Consistent screens, RTL/LTR, light/dark, offline where allowed. |

## 6. Open questions

| Question | Tracked as |
| --- | --- |
| MediatR: stay on 12.5, move to an MIT mediator, or write an in-house dispatcher? | DEC-011 |
| When and how to rename JWT issuer/audience? | DEC-012 |
| Which commercial libraries stay in core, move to optional modules, or are replaced? | DEC-013 |
| How do web-next and mobile-react consume `packages/*` (file dependency or npm workspaces)? | DEC-014 |
| Chat scope: record chatter only, or direct/group chat as well? | DEC-015 |
| Education integration: teachers as HR employees, guardians as Contacts parties, fees in Accounting? | DEC-016 |
| Is `AttendanceConnector` still deployed? | E-020 |
