# Angular 22 and PrimeNG Web Migration — Research

Official sources reviewed 2026-10-28. Framework capabilities do not prove project compatibility.

| Source | Implication |
| --- | --- |
| [Angular releases](https://angular.dev/reference/releases) | v22 Active, current LTS end June 2028; recheck at execution. |
| [Version compatibility](https://angular.dev/reference/versions) | Listed 22.0 line: Node ^22.22.3 / ^24.15 / ^26 and TS >=6.0 <6.1; verify exact target peers. |
| [Zoneless](https://angular.dev/guide/zoneless) | Default from v21; use template signals/AsyncPipe/notifications; test asynchronous Reactive Forms updates. |
| [Reactive Forms](https://angular.dev/guide/forms/reactive-forms) | Explicit nested/dynamic form model; proposed ERP baseline. |
| [Guards](https://angular.dev/guide/routing/route-guards) | Browser guards cannot replace server authorization. |
| [Interceptors](https://angular.dev/guide/http/interceptors) | Central HTTP behavior; feature services still own transport contracts. |
| [PrimeNG configuration](https://primeng.dev/configuration) | Central overlay mounting/stacking and runtime internal translations support SIG-07; actual ERP browser/focus/RTL behavior still needs proof. |
| [Angular security / XSRF](https://angular.dev/best-practices/security) | Standard XSRF support is relative/same-origin and needs server verification; proposed cross-origin API cookies require explicit reviewed token bootstrap/header handling. |
| [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0) | Exact allowed origins/credentials; CORS is not an authorization or antiforgery verifier. |
| [ASP.NET Core antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0) | A cookie-based browser extension requires a server-validated request-token contract, preserving existing header-only native calls. |
| [OWASP HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) | Avoid browser session credentials in JavaScript-accessible persistent storage; HttpOnly does not remove XSS-driven action risk. |
| [SignalStore](https://ngrx.io/guide/signals/signal-store) | Local/global scope and RxJS integration; not automatic server caching. |
| [PrimeNG migration](https://primeng.dev/migration/v22) | Current component APIs differ from older tutorials; strict templates and reviewed replacements. |
| [PrimeNG changelog](https://primeng.dev/changelog) | v22 supports Angular 22/Zoneless; 22.1.4 listed 2026-10-22. Verify exact selected peers. |
| [Table](https://primeng.dev/table) | Paging/editing/virtual/lazy features; verify actual ERP needs rather than assume spreadsheet parity. |
| [Theming](https://primeng.dev/theming) | Map semantic/component design tokens centrally. |
| [RTL](https://primeng.dev/guides/rtl) | Direction support exists; actual layouts/overlays still need testing. |
| [PrimeUI dev agreement](https://primeui.dev/eula/commercial-per-developer) | Seat/version entitlement applies; never store license keys in planning docs. |
| [EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) | Optimistic concurrency tokens detect intervening writes; conflict recovery must be designed and tested (ERP-05). |
| [EF Core transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions) | Commit boundaries provide atomic database changes; do not assume multiple client calls form one transaction (ERP-06). |
| [.NET numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types) | Decimal precision differs from binary floating point; domain rounding/wire semantics still need explicit contracts (ERP-07). |
| [ASP.NET OpenAPI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview?view=aspnetcore-10.0) | Schemas describe API operations; actual project generator suitability and completeness need proof (ERP-01). |

The earlier independent .NET BFF recommendation was superseded by the requester's
explicit no-BFF decision on 2026-10-28 (DEC-025). Angular calls the existing API
directly. DEC-027 reviews actual cookie/token support, origin/CSRF/credential
handling and refresh/logout behavior before implementation. BFF capability in
framework documentation does not justify adding an unwanted server.

PrimeUI does not establish parity for Crystal, ActiveReportsJS designer,
Syncfusion PDF, calendar or diagrams. Prove each required Angular adapter and
its license separately under RISK-017.

The source-only Sigma review and requester-approved behavioral details are
recorded separately in [SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md), including exact
external baseline/source symbols and SIG-01..SIG-08. Angular HttpContext supports
typed local request metadata (SIG-02); Zoneless forms need actual rendering
notifications (SIG-05/07). External source/test definitions are evidence of
examples, not library compatibility or passing ERP tests.

S0 authentication conclusions and the distinction between current bearer APIs
and the proposed browser-cookie extension are in
[AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md). Primary documentation
supports the design trade-offs; actual source discrepancies remain RISK-018 and
must not be replaced by generic framework assumptions.

## Requester scope correction —2026-10-30 DEC-028

ActiveReports viewer/designer/SDK and associated authoring/licensing work are
Excluded from Angular migration by explicit requester instruction. References to
existing Next/native/API implementations are source evidence only and do not
reinstate that target. Current Angular reporting uses managed Crystal/PDF. Other
reporting manager, permissions, binary transport and PDF lifecycle requirements
remain governed by their owning contracts. No ActiveReports runtime placeholder.
