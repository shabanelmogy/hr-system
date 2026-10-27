# Approved decisions

2026-10-19: use global exact permissions and separate audit entry endpoint; never make tenant AuditTrail globally grantable. Global text overrides affect SuperAdmin sessions only and are filtered by an explicit per-screen allowlist. No default-language change or new cultures. Shared Company UI editor structure is the reviewed shape; runtime overlay refactors must remain generic and preserve shipped/company precedence. No production publishing.
