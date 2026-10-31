# S1-A4 implementation request

Documentation state: Final Phase00. Implement the exact SHARED_REFERENCE_CONTRACT
after bounded authorization and current gates. No business capability/API/schema,
real lookup adapter or native UI is added. Reuse existing form/field lifecycle,
actual PrimeNG Select and primitives. Native/current Next preserved.

Existing-System Relationship Review: Preference OptionSelect has different value/
commit semantics; extend generic form field lifecycle instead of feature wrappers.
Caller owns scope, query cancellation, selected resolution, business validators,
permissions, debounce and server paging. No fake All ID or local remote-page filter.
Rules/edge/impact: typed IDs, selected off-page vs selectable options, missing/
archived/scope/IME/races/errors/CVA/reset/focus/read-only and finite states are
explicit in the frozen contract and four books. All optional views classified.
Runtime paths are added only when present; verification before Phase06/education.
