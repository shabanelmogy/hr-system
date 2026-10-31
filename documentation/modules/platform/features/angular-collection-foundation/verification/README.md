# Portable S1-A3 verification evidence

2026-10-29, source main a2c56412 plus this bounded implementation. No credentials,
Cookies, user data, license values or raw network logs are stored here.

- results.json: original40 palette/mode/language/viewport cases, both adapters;
  eight green cases additionally exercise full state/criteria/paging/keyboard flows.
- focused-results.json: final8 interaction cases after exact52px row and RTL
  horizontal-card keyboard adjustment. Compact36px verified through options.
- layout-results.json: final8 layout-only cases after footer record centering.
  These are render/geometry checks, not another8 interaction claims.
- next-reference-results.json:8 current source Countries Grid/Cards reference
  captures at matched mode/language/viewport using its existing deterministic backend.
- angular-/next- PNG pairs: wide light English and narrow dark Arabic; Table/Cards.

Reference runtime on this workstation is Next16.3.5/Vitest4.1.11 although tracked
declarations/lock require16.4.3/4.1.12. RISK-012 reopened for local install alignment;
these observations do not replace the pinned dependency/release gate. Fixture
translation/photo404s were inherited; no live SQL override claim is made here.
