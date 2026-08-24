# Documentation System Guidance

- Treat `recipe-manifest.json`, `templates/`, and the canonical books listed in the manifest as authored sources.
- Never edit `generated/` files directly. Run `Generate-Documentation.ps1` after changing a template, manifest, or canonical numbered section.
- Keep paths in feature manifests repository-relative and use forward slashes.
- A required source file belongs in its application project. Reference it from a manifest; do not copy runtime source into `documentation/`.
- Preserve the distinction between verified current behavior, desired behavior, and an unresolved finding.
- Keep a new feature's required-file manifest as `required-files.draft.json` until all declared runtime sources exist. Only final manifests belong in `recipe-manifest.json`.
- Complete the scaffolded `IMPLEMENTATION-REQUEST.md` and review artifact before runtime implementation. `Required`, `Deferred`, and `Excluded` decisions are platform-specific and retain their documented meanings from `documentation/system/README.md`.
- Every non-reference feature uses feature-scoped recipe IDs and outputs under `generated/<feature>/`; the unscoped phase packets belong to Countries.
- Every feature review must finish with phase 06 and a passing `Generate-Documentation.ps1 -Check` result.
- Phase 06 separates feature regressions, inherited repository failures,
  environment blockers, and manual release checks and records an owner/release
  decision for every non-passing gate.
- Do not place secrets, environment values, generated binaries, package caches, or test output in this directory.
