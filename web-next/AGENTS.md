# Frontend Build Guidance

For any frontend change in this project, read [`../documentation/web-next/architecture/frontend-architecture-reference.md`](../documentation/web-next/architecture/frontend-architecture-reference.md) before editing files.

The architecture reference is the baseline for feature ownership, App Router boundaries, shared-layer usage, dependency direction, naming, and required verification. New code must follow it unless an explicit exception is documented in the same change.

For server-managed feature work, also read [`../documentation/web-next/features/server-managed-feature-reference.md`](../documentation/web-next/features/server-managed-feature-reference.md). When following Countries, use the [cross-platform master](../documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md), the [web applied profile](../documentation/web-next/features/countries-frontend-reference.md), and phases 02, 04, 05, and 06 under `../documentation/system/generated/`.

Run `../documentation/system/Generate-Documentation.ps1 -Check` before handoff when a feature contract, source manifest, or guide changes. Do not create a new `web-next/docs/` directory.
