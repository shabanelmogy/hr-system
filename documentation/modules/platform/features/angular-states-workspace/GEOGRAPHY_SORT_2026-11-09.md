# Three-state collection sorting and geography IDs

This corrective change extends the existing ReferenceData list queries and the
shared Angular collection controls. Countries, States and Districts are global
reference data. The existing list routes, actor and View permissions own this
read operation. Their validators accept `id` as an additive sort field, and the
existing read stores sort the integer key after filtering and before paging.
The persistence schema, relationship rules and write workflows require no change.

| Case | Result |
|---|---|
| Activation of an unsorted column | Ascending |
| Second activation | Descending |
| Third activation | Cleared. The column indicator becomes neutral. |
| Cleared server order | The feature's normal default, with the first page and existing search and filters |
| Cleared local order | Source row order with the first page and existing filters |
| ID ordering | Numeric ordering over all matching records, including across page boundaries |

The shared Grid normalizes the installed PrimeNG Table sort events to the owner
contract. An explicit `null` removes single-column sorting. The native sort
presentation is reset while preserving the filter metadata. The Cards control
shows a neutral state and remembers the selected field for the next ascending
activation. Geography and Tenant screens use their respective existing wire
defaults for cleared sorting. Unsupported API sort fields remain invalid.

The Angular browser harness checks the four Grid transitions and the Cards cycle
for all three geography lists. ReferenceData store tests use IDs 2, 10 and 100
to distinguish numeric from string ordering and check the second page. Next and
Mobile can continue sending their existing queries. Hosted rollout is tracked
in PROD-033.

[PrimeNG Table sorting](https://primeng.dev/table#sort).

## Verification

The full API restore, Release build and test run passed 1348 tests across
12 projects with 3 existing environment-dependent skips. This
includes six numeric ID sort cases covering both directions and page boundaries.
The full Angular gate passed 1013 tests and the production build.
Sixteen browser scenarios covered Grid and Cards in English and Arabic, Light
and Dark, with phone and desktop coverage. Browser requests used fixtures.
See the [execution receipt](verification/geography-sort-2026-11-09.json).
