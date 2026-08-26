# Attendance Devices API Implementation Profile

## 1. Exact Source Inventory
Feature source is in Domain/Attendance/Devices, Application/Features/Attendance/Devices, Infrastructure/Features/Attendance/Devices and versioned controllers; the companion is HrManagementSystem.AttendanceConnector.

## 2. Ownership and Persistence
All device, credential, raw and run entities are tenant/company scoped. Device BranchId is optional with a composite same-company foreign key, selected by request rather than token.

## 3. Transport Contract
CRUD is api/v1/attendance-devices; branch lookup is branches; provider and health
are providers and connector/health. Raw lists are attendance-device-users,
raw-attendance-punches and device-pull-runs. A separate agent-only, token-authenticated
surface lets an enrolled local Agent claim a leased pull request and submit its
bounded result. It is outbound from the customer network; no hosted API endpoint
connects to a customer LAN address.

## 4. Authorization Contract
View, Manage, Credentials, Pull and ViewRaw are distinct permissions. Controllers only use ISender. A migration grants existing system Admin roles idempotently.

## 5. Query Contract
Lists are one-based, database-paged (default 10, max 100), allow-listed sorted and stable by Id. Users search code/name; punches filter device/code/from/to; runs filter device/status/operation.

## 6. Write Contract
Devices can be created, edited and enabled/disabled but not deleted. Mutations are rejected while a pull runs. Implemented ZKTeco credentials accept numeric CommKey only.

## 7. Validation and Errors
Numeric allowed host/port, known provider, valid timezone, scoped active branch and ordered UTC period are required. Errors are localized and contain no secret.

## 8. Connector and Pull Lifecycle
A durable pending run is saved with initiating actor scope and assigned to a single
site Agent. The Agent claims the work with a short lease, invokes the x86 STA
connector locally, then submits success or safe failure data. Raw persistence is
transactional and unique-key idempotent. Expired leases become retryable without
duplicating raw rows.

## 9. Data Protection and Audit
Dedicated Data Protection protects credentials. Audit covers device, credentials, tests, and pull lifecycle. Realtime invalidation is post-commit best effort.

## 10. Registration and Configuration
Enroll a revocable, company-scoped Agent token and bind each device to one Agent.
Configure the Agent with the hosted HTTPS API URL, enrollment token, local allowed
CIDRs/ports, timeout, and polling interval. The SDK remains installed and registered
on the x86 Agent host; it is not copied into the web/API deployments.

## 11. Tests and Manual Matrix
Focused tests cover thin routes, permissions, redaction, raw scope, idempotency, timezone and permission migration. Hardware/model/firmware tests remain manual.
