# Recruitment Web Frontend Reference

Status: reviewed implementation profile. Review date: 2026-09-08.

Recruitment is owned by `web-next/src/modules/hr/recruitment`. API-facing contracts live in `types`, transport
is isolated in `services`, React Query hooks own caching/mutations, and the page composes the feature.
The client never supplies tenant/company scope or offer organization placement.

Creation journeys use the shared `MyForm` system with React Hook Form, Zod resolvers, inline field
errors, and enabled primary submission. Requisition organization comes from an approved staffing
request; job-offer placement comes from the selected application on the server. Interview scheduling
may omit the lead employee so the API resolves the authenticated employee link. Evaluation state is
keyed by interview/template and cannot leak scores, recommendation, or comments between dialogs.

The Kanban, grids, cards, loading/error/empty feedback, permissions, and confirmation flows reuse the
project shared components. Browser-native `confirm` was removed from recruitment settings. Settings
state derives from server/local fallback plus explicit user overrides, without effect-driven state
copying or side effects inside state updater callbacks. Stage, source, criterion, rejection-reason,
and general-governance settings use React Hook Form plus Zod; editable fields reuse the shared form
controls and render bilingual inline validation. All added text is bilingual.

Verification for this review: `npm run type-check` passes and scoped ESLint for geographical,
organizational-structure, and recruitment feature paths reports no code warnings or errors.
