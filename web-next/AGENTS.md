# Frontend Build Guidance

For any frontend change in this project, read [`../documentation/web-next/architecture/frontend-architecture-reference.md`](../documentation/web-next/architecture/frontend-architecture-reference.md) before editing files.

For a new business capability or substantial business rebuild, also start from
[`../documentation/plans/README.md`](../documentation/plans/README.md) and require
the gates required by the exact authorized implementation scope to pass before
runtime implementation. Overall `Implementation Ready` still requires G0-G4; a
bounded slice may start earlier only through the planning system's explicit
slice-authorization rule when remaining G4 findings are release-only. Web-only production checks,
deferrals, risks, follow-ups, and open decisions use stable IDs under
`../documentation/plans/notes/` rather than remaining only in a feature TODO.

The architecture reference is the baseline for feature ownership, App Router boundaries, shared-layer usage, dependency direction, naming, and required verification. New code must follow it unless an explicit exception is documented in the same change.

For server-managed feature work, also read [`../documentation/web-next/features/server-managed-feature-reference.md`](../documentation/web-next/features/server-managed-feature-reference.md). When following Countries, use the [cross-platform master](../documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md), the [web applied profile](../documentation/web-next/features/countries-frontend-reference.md), and phases 02, 04, 05, and 06 under `../documentation/system/generated/`.
Use the States profiles when a parent selector or parent-dependent list contract makes them the closer reference. Do not use the unscoped Countries generated packets as evidence for a different feature.

Run `../documentation/system/Generate-Documentation.ps1 -Check` before handoff when a feature contract, source manifest, or guide changes. Do not create a new `web-next/docs/` directory.

After every material frontend finding (architecture, runtime, performance, security, business-safety, or a regression/root-cause decision), update the owning canonical guide in `../documentation/` in the same work session. Record the observed problem, root cause, decision, verification, and regression-prevention rule; do not leave important implementation knowledge only in chat history.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
