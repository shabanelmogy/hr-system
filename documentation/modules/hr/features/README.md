# HR feature catalog

This index owns HR feature references while the existing canonical books remain
at their stable manifest paths. The links below mirror the current recipe
manifest; they are evidence locations, not a claim that every platform surface
is implemented. Add or change an entry only with a reviewed cross-project
contract and exact required-file evidence.

Geography and address features (Countries, States, Districts, Address types,
Addresses) belong to General Data — see [reference-data](../../reference-data/features/README.md).
Company geographic scope belongs to [Platform](../../platform/features/README.md)
and Fiscal years to [Accounting](../../accounting/features/README.md).

| Feature | Cross-project review | API | Web | Mobile |
| --- | --- | --- | --- | --- |
| Attendance devices | [review](../../../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md) | [API](../../../api/AttendanceDevices_API_Implementation_Profile.md) | [web](../../../web-next/features/attendance-devices-frontend-reference.md) | [mobile](../../../mobile-react/attendance-devices-mobile-reference.md) |
| Organizational structure | [review](../../../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md) | [API](../../../api/OrganizationalStructure_API_Implementation_Profile.md) | [web](../../../web-next/features/organizational-structure-frontend-reference.md) | [mobile](../../../mobile-react/organizational-structure-mobile-reference.md) |
| Workforce planning | [review](../../../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md) | [API](../../../api/WorkforcePlanning_API_Implementation_Profile.md) | [web](../../../web-next/features/workforce-planning-frontend-reference.md) | [mobile](../../../mobile-react/workforce-planning-mobile-reference.md) |
| Recruitment | [review](../../../project/RECRUITMENT_FEATURE_FULL_REVIEW.md) | [domain design](../../../api/Recruitment_Domain_Design.md) — no final API profile yet | [web](../../../web-next/features/recruitment-frontend-reference.md) | [mobile](../../../mobile-react/recruitment-mobile-reference.md) |

Recruitment is included as a design/review catalog entry; its API column is
explicitly marked as a domain-design source rather than evidence of a completed
API profile. Every other row still requires checking its required-file manifest
before claiming a complete platform implementation.

Use `documentation/system/` for phase recipes and generated packets. Keep
module-specific decisions here or in a linked canonical feature book; never
duplicate shared rules by hand.
