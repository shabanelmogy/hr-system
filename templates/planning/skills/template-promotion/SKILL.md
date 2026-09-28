---
name: template-promotion
description: Use only in the template repository, after a change to the reference application, to classify it and promote reusable parts into the Foundation/Standard templates or log why not.
---
# Template promotion

## Purpose

Keep the templates as good as the reference application. The full policy is in
`templates/PROMOTION_POLICY.md`; this skill is the working procedure.

## Procedure

1. **Classify** each change:
   - *Domain only* (entities, rules, labels, seeds specific to the reference domain) → stays.
   - *Standard* (auth, tenancy, RBAC, audit, validation, pagination, BFF, shared UI, Docker, CI,
     planning system) → promote to `templates/api/content/standard/` and/or
     `templates/next/content/standard/`, or `templates/planning/`.
   - *Foundation* (minimal framework shell) → also `content/foundation` / `content/minimal`.
2. **Generalize.** Replace domain names with neutral ones; keep contracts aligned across API and
   web; never copy domain migrations.
3. **Update everything the contract touches:** source, manifests and lockfiles, migrations,
   generators, post-generation checks, documentation, component catalog, CI, changelog.
4. **Verify.** Generate a Standard workspace and build it; run the leakage check.
5. **If blocked,** add a row to `templates/PROMOTION_LOG.md` with the decision needed and exact
   target paths.

## Quality bar

- Standard output contains no reference-domain names.
- Reference app and template agree on shared contracts (routes, payload names, env variables).

## Anti-patterns

- Blind file copies with domain names left inside.
- Improving the template without back-porting to the reference application (or vice versa).
