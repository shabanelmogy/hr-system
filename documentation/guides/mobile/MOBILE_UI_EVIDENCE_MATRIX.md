# Mobile UI evidence matrix

Date: 2026-09-19. Source and component gates are complete; physical-device
evidence remains required before Phase 08 can be signed off.

| Surface | Phone LTR | Phone RTL | Tablet LTR/RTL | Dark mode | Accessibility/keyboard | State |
|---|---|---|---|---|---|---|
| Authentication and tenant/company selection | Pending device | Pending device | Pending device | Pending device | Pending TalkBack/VoiceOver | Manual gate |
| Module launcher and route denial/unavailable | Pending device | Pending device | Pending device | Pending device | Route-guard component/source covered | Manual gate |
| Countries/States/Districts/Address Types | Existing shared multi-view structure | Translation parity passed | Responsive source structure | Theme tokens used | Existing component tests | Visual comparison pending |
| Recruitment lists and pipeline | Server paging/status filtering implemented | Translation parity passed | Paged layouts present | Theme tokens used | Touch/keyboard pending | Device evidence pending |
| Workforce forms and nested collections | Shared AppForm and field errors implemented | Translation parity passed | Full-screen form composition | Theme tokens used | Validation focus/source covered | Device evidence pending |
| Offline policy and Sync Center | Scoped states and translated reasons implemented | Translation parity passed | Shared cards/actions | Theme tokens used | Touch targets use shared buttons | Device evidence pending |
| Files and reports | Online authority and secure cache source gates | Translation parity passed | Pending device | Theme tokens used | Native open/share pending | Device evidence pending |

Capture evidence at 360×800 phone and a tablet width, with English/Arabic,
light/dark, font scale 1.0 and 1.5, software keyboard, screen reader, back/deep
link, loading/empty/error/read-only/offline states. Store the build and device
metadata with the Phase 08 release record; screenshots alone do not prove the
workflow result.
