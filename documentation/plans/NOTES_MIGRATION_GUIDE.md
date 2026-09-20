# Notes Migration Guide

Use this when consolidating existing scattered notes into the central registries.

## What to migrate

Search canonical plans/guides for language such as:

- deferred;
- production-only;
- production readiness;
- release gate;
- revisit later;
- future work;
- not a blocker;
- needs production evidence;
- manual smoke;
- known limitation;
- follow-up;
- reopen when;
- TODO that affects architecture/business/release.

## Migration rule

1. Create one stable central note ID.
2. Preserve the original business/technical meaning.
3. Record owner/status/reopen trigger.
4. Add a link back to the original canonical source.
5. Replace duplicated long lists in secondary docs with the note ID/link only when
   the original list is not itself part of the canonical contract.
6. Never move Required current-release work into Deferred just to clean a roadmap.
7. Never classify a release blocker as non-blocking without explicit evidence or
   product/architecture decision.

## Closure rule

A closed note keeps its row/history and adds:
- status = Closed/Verified;
- date;
- exact verification evidence;
- replacement plan/commit/guide if applicable.

Do not delete historical notes merely because they are complete.
