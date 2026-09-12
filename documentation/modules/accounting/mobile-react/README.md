# Accounting mobile documentation

No Accounting Expo/React Native screens, navigation entries, or mobile API
clients exist in the current scaffold; the mobile surface is **not implemented**.

Mobile is expected to focus on review, approvals, alerts, and read-only reports
unless a feature contract explicitly requires posting. Any future write flow
must define offline/retry behavior, idempotency, permissions, accessibility,
localization, and audit feedback independently from the web experience.
