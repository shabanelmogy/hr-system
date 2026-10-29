# Angular password sign-in - implementation request

Requester explicitly wants actual login at root and exact current web-next design.
S2-A0 Platform/Shell owner, password/demo login + tenant/company challenge + sanitized
session reload/refresh/logout/identity entry; forgot-password existing public API.
Reuse current shared form/field/button/theme/localization and extend them generically.
No fake auth, credential storage, BFF, schema or business shell. Register/provider
scope explicitly excluded where current API disabled/default off, no fake buttons.

## Existing-System Relationship Review

Current Next Login/AuthLayout/AuthTopBar/LeftPanel/LoginForm/selection dialogs and
validators are source of visual/interaction truth. Current browser-auth routes and
sanitized SessionContext already SQL/Chromium Verified. Native remains unchanged.
P-015 reviewed/Active source pattern. Actual Next screenshots captured before edits.

## Business Rules Matrix

| Rule | Owner | Result | Test |
| --- | --- | --- | --- |
| Current design/default entry | Shell/login shared composition | Actual /login in dev/prod, no empty default | Equal-viewport Next/Angular browser captures/geometry |
| Password/challenge/session | Existing API + Angular typed adapter | Cookies only, exact server-authoritative identity | HTTP/security unit + real API/SQL |
| Invalid data/pending | Shared form + feature validators | Errors beneath input, focus, duplicate guard | Browser/client validation |
| Session context/localization | Session owner | Clear previous text before identity, verified scope then expose | Reload/late response/translation tests |
| Provider unavailable | Existing API | Truthful Google unavailable feedback, no auth bypass | Known provider boundary RISK-018 |

## Edge Cases & Validation Matrix

Username trimmed 3..50, trimmed required password per existing Next; invalid,
network/config/rate limit and malformed response. Challenge expiry/cancel/scope,
logout/refresh conflict, stale completion, duplicate submit/CSRF renewal Required.
No raw access/refresh in JS, URLs/storage, arbitrary API-origin override or replay.
No business entity/money/UOM/date/import/report/attachment/offline/dirty draft;
reasoned N/A, existing SQL/session authority unchanged. Forgot-password actual
email must not be triggered by agent acceptance; use intercepted tests only.

## Impact Matrix

Angular auth feature/types/service/state/pages, real routes and public Shell layout:
Add. Shared form/field/action/dialog/icons: generic extension/add only where absent.
Exact localhost4210 Browser/CORS in ignored API development config; no API source/
schema change. Existing catalog IDs/keys and native contracts retained. Google/
external provider remains PROD-002/RISK-018; hosting PROD-017/019. Full S2 not claimed.

Requester follow-up authorized generic shared ValidationSummary badges with count, clickable field targets and retained inline errors. This invalid-state enhancement is explicitly requested in addition to the current source design.
