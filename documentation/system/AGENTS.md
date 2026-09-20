# Documentation System Guidance

- Treat `recipe-manifest.json`, `templates/`, and the canonical books listed in the manifest as authored sources.
- Never edit `generated/` files directly. Run `Generate-Documentation.ps1` after changing a template, manifest, or canonical numbered section.
- Keep paths in feature manifests repository-relative and use forward slashes.
- A required source file belongs in its application project. Reference it from a manifest; do not copy runtime source into `documentation/`.
- Preserve the distinction between verified current behavior, desired behavior, and an unresolved finding.
- Keep a new feature's required-file manifest as `required-files.draft.json` until all declared runtime sources exist. Only final manifests belong in `recipe-manifest.json`.
- For planned work, record the canonical Plan ID + authorized Slice ID and complete
  Phase 00 Implementation Preflight before runtime implementation. The scaffolded
  `IMPLEMENTATION-REQUEST.md` and review artifact translate approved plan decisions
  into execution evidence; they must not silently re-plan the feature. Their
  Existing-System Relationship Review, Business Rules Matrix, Edge Cases &
  Validation Matrix, and Impact Matrix remain mandatory traceability evidence.
  Material product drift reopens the affected plan gate before coding. For API work,
  `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md` remains the technical
  implementation authority.
- Every non-reference feature uses feature-scoped recipe IDs and outputs under `generated/<feature>/`; the unscoped phase packets belong to Countries.
- Every new planned feature must finish implementation with Phase 06 Verification &
  Acceptance and a passing `Generate-Documentation.ps1 -Check` result.
- Phase 06 separates feature regressions, inherited repository failures,
  environment blockers, and manual release checks and records `Verified` or
  `Not Verified`. Customer education must not start before `Verified`.
- Customer-visible work then completes Phase 07 Customer Education & Closure from
  verified runtime behavior before the feature/phase is marked `Closed`.
- Do not place secrets, environment values, generated binaries, package caches, or test output in this directory.
