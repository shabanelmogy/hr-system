# S3-A7 acceptance amendment2026-10-31

## D35 — Angular quality owns acceptance; Next review is not a prerequisite

Requester2026-10-31: «المهم الوقتى التركيز على بناء الانجولار بشكل دقيق مش ضرورى نراجع مشروع Next».

Build and verify Angular against the existing business/API contracts, exact
authorization, shared-component-first/PrimeNG policy, shared color tokens and
actual Angular journeys. Running, debugging or reviewing the retained Next client
and an automated/pixel comparison against its development server are not
prerequisites for Angular implementation or bounded acceptance. Existing source
may remain a read-only reference when useful; this does not authorize additional
Next work. Experimental Next configuration and E2E edits made during diagnosis
were reverted; no Next runtime change is delivered.

This explicitly supersedes the S3-A7 required eight-case rendered-Next gate and
the mandatory rendered-Next prerequisite of S3-A8. Historical source results stay
historical; they are not relabeled as new Angular proof. Preserve ERP functionality,
API/RBAC/scope/atomicity and current platform decisions. Angular visual consistency,
EN/AR/RTL, keyboard/responsive controls and all five required Countries views remain
Required. Full host/realtime/production-size/Table capability gates remain owned
by their exact slices. No new business scope, BFF/global store or native rewrite.


Decision recorded before Phase06 verification and customer education. Full Angular check443tests and actual Angular40+15+5 browser cases are the acceptance evidence. No Next comparison or repair is used to satisfy the revised current gate. FOLLOW-020 is outside Angular scope; no source bug is claimed fixed.
