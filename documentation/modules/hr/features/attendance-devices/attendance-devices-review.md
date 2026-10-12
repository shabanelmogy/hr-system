# Attendance Devices Feature Review

## 1. Review Manifest
Attendance Devices (attendance-devices), phase-one raw hardware integration. Countries is the shared architecture and verification reference.

## 2. Scope and Non-goals
Manage read-only device connections and raw users/punches only. Attendance calculation, shifts, payroll, employee matching, biometric templates, reports, and dashboards are out of scope.

## 3. Frozen Shared Contract
The actor supplies TenantId and CompanyId. A user may optionally select BranchId; the API verifies it belongs to that same scope. Branch is not a token claim and branch permissions are deferred.

## 4. API, Site Agent, and Persistence Responsibility
HR API owns device definitions, encrypted credentials, raw staging data, idempotency,
audit, and durable pull requests. Each customer site runs an approved Windows x86
Attendance Agent on the same private network as its devices. The Agent makes only
outbound HTTPS requests to claim work assigned to its tenant/company, executes the
approved SDK call locally, and submits a bounded result using a short-lived work
lease. The hosted API never connects to a customer's `localhost` or private LAN.

## 5. Provider Evidence
Only zkteco-com is implemented through ZKTeco x86 COM. Every other catalog provider is explicitly unavailable until a real adapter is built.

## 6. Raw Data Contract
Users retain code/name/safe metadata. Punches retain original unspecified device-local time, UTC, verify/in-out/work codes, and idempotency key. DST-invalid/ambiguous time is skipped rather than guessed.

## 7. Web Responsibility
Required web views are device master/detail, raw users, raw punches, and pull runs. Reuse shared server lists and grids. Cards, charts, reports, and import are excluded.

## 8. Security and Operations
Credentials are Data Protection payloads, write-only, never logged or returned to a
browser. A site Agent has a revocable, hashed enrollment token and can claim only
devices explicitly assigned to it within one tenant/company. Numeric device IP and
port must meet the Agent CIDR/port policy. The Agent uses HTTPS to the hosted API;
no inbound firewall rule, browser-to-localhost call, shared connector secret, or
remote API-to-private-network connection is allowed.

## 9. Verification Evidence
API and x86 connector builds plus focused API tests passed. Web checks are recorded in the web profile. No migration was applied, no service started, and no hardware was contacted.

## 10. Handoff and Deferred Work
Apply migrations, enroll a site Agent with a one-time token, configure its local
device CIDRs/ports and hosted API URL, then run a manual hardware matrix. The Agent
is packaged as an x86 Windows service or tray process and reports its heartbeat and
SDK readiness. Branch management and branch authorization are independent future
vertical slices.
