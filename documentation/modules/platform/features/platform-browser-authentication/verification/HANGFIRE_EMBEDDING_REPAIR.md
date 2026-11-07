# Hangfire embedding corrective change — 2026-11-06

Classification: corrective change to existing Platform browser authentication and
the authorized Angular Super Admin tools. This does not add a job engine, job
mutations, permissions, or a second authentication owner.

## Verified failure and requested behavior

- Angular navigation repeated the Health, API Docs, and Hangfire identifiers in
  the Administration order. Their entries now occur once.
- The Health page rendered an empty placeholder without reading `/health`.
- The default JWT message callback explicitly excluded `/hangfire` from browser
  Cookies. Angular has no Next server proxy to attach a Bearer header to iframe
  navigation. A direct authenticated frame therefore could not use its session.
- ASP.NET's native antiforgery defaults emit SAMEORIGIN and a Strict Cookie.
  Cross-origin framing needs a scoped ancestor policy; explicitly enabled
  cross-site mode also needs the native Cookie on iframe requests.
- The user explicitly requires the actual Hangfire dashboard inside the Angular
  page. A custom counters screen or opening another tab does not satisfy this.

## Existing-system relationship and rules

Primary relationship: extend Platform's existing browser transport and protected
Hangfire dashboard. Reuse the current JWT/live session validation, dashboard
authorization filter, allowed API hosts, permission `Hangfire:View`, and native
Hangfire routing/assets/CSRF. Next retains its Bearer proxy; Mobile retains Bearer.

| Rule | Enforcement / outcome | Evidence |
| --- | --- | --- |
| Cookie identity is fallback only | Authorization header and BearerOnly metadata retain precedence; hubs retain the dedicated scheme | JWT callback and Platform tests |
| Dashboard access stays protected | Authenticated identity, `Hangfire:View`, allowed API host remain required | Existing Hangfire authorization filter tests |
| Dashboard Cookie mutations require HTTPS and trusted origin | Exact configured origins or the API's own origin; other origins rejected with 403 | Middleware tests |
| Dashboard CSRF remains native | Framework Cookie/header pair validated, with no Angular alias; invalid/missing pair rejected with 400 | Real ASP.NET antiforgery unit scenarios |
| Other Cookie mutations retain Angular CSRF | `X-ERP-XSRF` and browser allowlist still required | Non-dashboard regression cases |
| Frame permission is path-specific | Only `/hangfire` and its child routes receive `frame-ancestors 'self'` plus validated browser origins; unrelated CSP directives remain | Actual local HTTP middleware response test |
| Cross-site Cookie support is explicit | Existing `UseCrossSiteCookies=true` applies Secure/HttpOnly/None to the native antiforgery Cookie, preserving its name/header; defaults remain Strict | Configuration tests |

## Impact and edge cases

| Surface | Decision |
| --- | --- |
| Domain, persistence, migrations, job scheduling | N/A: no model, schema, or business mutation change |
| Platform Infrastructure | Change JWT Cookie fallback and native antiforgery Cookie policy |
| Platform Presentation | Extend existing browser middleware and native CSRF bridge; preserve server validation |
| Angular | Credentialed dashboard HTML access check, permission-scoped read, real iframe, refresh/error/retry/forbidden; cancellation on actor/tool change |
| Health | Credentialed `/health` read, validated status/dependency model; valid 503 diagnostic JSON is displayed, HTML/gateway 503 is an error |
| Next | Existing Bearer proxy and native antiforgery Cookie/header contract reused; no Next runtime change |
| Mobile | Dashboard intentionally excluded; native Bearer and realtime paths unchanged |
| Caching | Hangfire responses with configured frame policy are private/no-store |
| Deployment | No deployed server settings or binaries changed by this source fix |

The Angular preflight reads a document only to verify access; it never injects
response HTML into Angular. The iframe URL comes from the configured API origin,
contains no credentials, and keeps nested Hangfire navigation inside the frame.
No counters fallback, automatic polling, or storage of credentials is added.

## Verification and limits

- Red: native Cookie fallback/cross-site settings and iframe policy/security
  regressions failed against the old implementation.
- Green: 14 API scenarios passed, including actual ASP.NET token validation and
  local middleware response headers.
- Angular focused suite: 16 passed across service, state, and navigation tests.
- Chromium fixture matrix: 8 cases (EN/AR, light/dark, 390/1440), valid unhealthy
  Health 503, load failure/retry, actual iframe mounting/nested URL navigation,
  dashboard 503/retry/403 removal, usable frame height and zero outer overflow.
  These are **synthetic dashboard documents**, not a claim that a deployed
  Hangfire dashboard or real job actions were tested.
- Full Angular/API gates passed: 943 Angular tests / 184 files and 1324 API tests
  with 3 existing opt-in browser skips. Six retained Next Hangfire proxy tests
  passed. See the [corrective receipt](../../angular-super-admin-final-review/operational-tools-verification-2026-11-06.json)
  for attempt history, final commands, review results and verification limits.

Release acceptance remains `PROD-006`, `PROD-007`, and the existing browser host
configuration check `PROD-019`. The target API must deploy this source and include
the exact frontend HTTPS origin in both browser and CORS allowlists, retain the
API host in Hangfire's allowlist, and enable cross-site Cookies only for a
cross-site topology. A reverse proxy must not append a conflicting frame policy.
Browsers blocking third-party Cookies require a same-site deployment policy;
this implementation does not bypass browser protections. Verify real dashboard
assets, stats polling, permission denial, and native-CSRF job actions on the
target deployment before closing those production checks.

## Primary references

- [Hangfire dashboard authorization and routing](https://docs.hangfire.io/en/latest/configuration/using-dashboard.html)
- [Hangfire ASP.NET Core middleware and native CSRF validation](https://github.com/HangfireIO/Hangfire/blob/main/src/Hangfire.AspNetCore/Dashboard/AspNetCoreDashboardMiddleware.cs)
- [ASP.NET Core antiforgery and frame protection](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0)

The research confirms that Hangfire validates its own framework token pair; the
implementation preserves that authority instead of disabling antiforgery.
