# Mobile performance budgets

Date: 2026-09-19. Budgets are release gates. Values in the **Measured** column
must come from an installed release build on the recorded device; development
mode and Metro timings are not accepted.

| Journey | Budget | Measured | Evidence status |
|---|---:|---:|---|
| Cold start to interactive login/home on mid-tier Android | p95 ≤ 3.0 s | Pending | Requires preview APK device run |
| Authenticated foreground resume | p95 ≤ 1.0 s | Pending | Requires preview APK device run |
| Local navigation transition | p95 ≤ 500 ms | Pending | Requires device trace |
| Server search feedback after debounce | p95 ≤ 1.5 s excluding declared API latency | Pending | Requires hosted API |
| 100-row paged list memory growth | ≤ 35 MB over baseline | Pending | Requires native profiler |
| Large structured form interaction | p95 input response ≤ 100 ms | Pending | Requires device trace |
| File preview open, supported 10 MB file | p95 ≤ 4.0 s | Pending | Requires hosted API/device |
| Offline retry wake-up | due time + ≤ 1.0 s while foregrounded | Covered by scheduler design; timing pending | Requires device clock test |

The Android Hermes export measured during Phase 00 bundled about 2,876 modules
and roughly 9.3 MB of JavaScript. This is a bundling baseline, not startup,
memory, APK-size, or interaction evidence. The first preview release records
device model, OS, build ID, commit, API version, sample size and p50/p95 here.
