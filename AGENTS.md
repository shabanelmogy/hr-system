## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Do not modify or update `graphify-out/` unless the user explicitly requests it.

## Economical subagent policy

- Do not spawn subagents for small or single-file tasks.
- Use at most 2 subagents concurrently.
- Use `luna_explorer` for read-only search, tracing, documentation lookup, and log analysis.
- Use `gpt-5.6-terra` with low reasoning for straightforward implementation.
- Use `gpt-5.6-terra` with medium reasoning for normal multi-file features.
- Escalate to `sol_worker` only for complex debugging, architecture, security, concurrency, migrations, or high-risk review.
- Never assign the same investigation or implementation to multiple agents.
- Reuse an existing agent for related follow-up work instead of spawning a replacement.
- Give each subagent a narrow, self-contained prompt and request a concise result with exact files and symbols.
- Prefer `fork_turns: "none"` or the smallest useful recent-turn window when spawning an agent.
- Keep Fast mode disabled for routine work.

## Research after a failed implementation

- If an implementation or fix does not satisfy the user on the first attempt, stop iterative guessing and research the issue on the web before making another implementation attempt.
- Prefer current official documentation and primary sources for the relevant framework, library, or platform.
- Base the next change on the documented behavior, and cite the sources used when reporting the result.

## Centralized documentation system

- All project-owned guides live under [`documentation/`](documentation/README.md). Do not create new `Docs/`, `docs/`, or `doc/` trees inside application projects.
- Before creating or restructuring a feature that spans API, `web-next`, or `mobile-react`, read [`documentation/system/README.md`](documentation/system/README.md) and run `./documentation/system/Generate-Documentation.ps1 -Check`.
- Choose the closest reviewed reference explicitly: Countries for a flat global reference-data lifecycle, or States for a parent-dependent reference-data lifecycle. Neither reference supplies tenant/company ownership rules for HR aggregates.
- Use the selected feature's `documentation/system/features/<reference>/required-files.json` to discover its complete evidence surface. Verify current source before applying the pattern.
- For a new feature, run `./documentation/system/New-FeatureDocumentation.ps1 -FeatureId <kebab-case-id> -FeatureName "<Display Name>" -ReferenceFeature countries|states`. Complete the generated `IMPLEMENTATION-REQUEST.md` and review artifact before runtime work. Keep its required-file manifest in draft state until the referenced runtime files exist.
- Treat `Required` as current-release and gated, `Deferred` as owned/scheduled with a reopening trigger, and `Excluded` as deliberately absent with no runtime placeholder. Decide every optional capability independently for web and mobile.
- For a review of an existing feature, default to read-only evidence collection unless the user also asks for changes. Record verified behavior, requested behavior, intentional platform differences, and unresolved findings separately.
- Register final canonical books, the final required-file manifest, and feature-scoped recipes under `generated/<feature>/`; do not reuse the unscoped Countries packets for another feature.
- During a new-feature draft, use the phase templates and the selected reference packets as navigation, never as implementation evidence. After canonical books are registered, generate the feature's own phases 00 through 06; phase 06 is mandatory for handoff.
- Never edit `documentation/system/generated/` directly. Update a canonical numbered section, recipe template, or manifest and regenerate.
- Keep runtime source in its owning application. Documentation manifests reference source files; they do not duplicate them.
- Copy the selected reference's architecture and verification discipline, but do not copy reference-specific fields, ownership, optional views, or documented findings unless the new feature requires them.
- At handoff, separate feature regressions, inherited repository failures,
  environment blockers, and manual release checks. A focused pass does not erase a
  failing full gate.

## Reference implementation fidelity

- When a user requires a feature to follow Countries, States, or another reviewed reference, treat the selected reference's current source as the implementation baseline, not merely a visual inspiration.
- Before editing, identify and reuse the reference's controller hook, multi-view composition, shared `PageHeader`, `MyDataGrid` toolbar, card scaffold, pagination, loading/empty/error states, and verification tests. Adapt only feature-owned fields, API contracts, permissions, relationships, and explicitly decided views.
- Do not replace an established reference structure with a custom page, local filtering/sorting, library-default controls, or look-alike card layout. A simpler implementation is not equivalent to the guide.
- Before handoff, compare the rendered Grid, Cards, search/filter toolbar, paging, and each required view against the selected reference at the same viewport. Record any intentional difference in the applicable feature guide; unresolved visual differences are feature regressions, not polish work.
