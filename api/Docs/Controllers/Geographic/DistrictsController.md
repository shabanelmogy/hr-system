# Districts API — Frontend Integration Guide

## Overview

Manages district records. Each district belongs to a state.  
All endpoints require a valid **JWT Bearer token**.

**Base URL:** `/api/v1/districts`  
**Permission Group:** `Districts`

---

## Authentication

All requests must include:
```
Authorization: Bearer <token>
```

---

## Permissions

| Constant | Value |
|----------|-------|
| `ViewDistricts` | `Districts:View` |
| `CreateDistricts` | `Districts:Create` |
| `EditDistricts` | `Districts:Edit` |
| `DeleteDistricts` | `Districts:Delete` |

---

## Endpoints Summary

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/districts` | ViewDistricts | Get all districts |
| GET | `/api/v1/districts/by-state/{stateId}` | ViewDistricts | Get districts for a specific state |
| GET | `/api/v1/districts/{id}` | ViewDistricts | Get district by ID |
| GET | `/api/v1/districts/{id}/addresses` | ViewDistricts | Get district with its addresses |
| POST | `/api/v1/districts` | CreateDistricts | Create a new district |
| PUT | `/api/v1/districts` | EditDistricts | Update a district |
| DELETE | `/api/v1/districts/{id}` | DeleteDistricts | Soft delete / restore |
| GET | `/api/v1/districts/count` | ViewDistricts | Get active district count |

---

## Data Models

### DistrictRequest (POST / PUT body)

| Field | Type | Required | Constraints | UI Component |
|-------|------|----------|-------------|--------------|
| `id` | `int` | ✅ | Send `0` for new records, existing ID for update | Hidden field |
| `nameAr` | `string` | ✅ | 2–100 chars, unique within the same state | Text input (RTL) |
| `nameEn` | `string` | ✅ | 2–100 chars, unique within the same state | Text input (LTR) |
| `code` | `string` | ✅ | 2–10 chars, unique within the same state (e.g. `NC`, `NR`) | Text input, maxLength=10 |
| `stateId` | `int` | ✅ | Must be a valid, non-deleted state ID | **Dropdown** — load from States API |

> ⚠️ **Dropdown field:** `stateId` must be populated from `GET /api/v1/states` or `GET /api/v1/states/by-country/{countryId}`.  
> Display `nameEn` / `nameAr` as the label, send `id` as the value.

### DistrictResponse (GET response)

```json
{
  "id": 1,
  "nameAr": "القاهرة الجديدة",
  "nameEn": "New Cairo",
  "code": "NC",
  "stateId": 1,
  "state": {
    "id": 1,
    "nameAr": "القاهرة",
    "nameEn": "Cairo",
    "code": "CAI",
    "isDeleted": false
  },
  "createdOn": "2024-01-15T10:30:00Z",
  "updatedOn": null,
  "isDeleted": false
}
```

---

## Endpoint Details

### GET /api/v1/districts

**Permission:** `ViewDistricts`  
**Description:** Returns all districts with their parent state info.

**Response 200:**
```json
[
  {
    "id": 1,
    "nameAr": "القاهرة الجديدة",
    "nameEn": "New Cairo",
    "code": "NC",
    "stateId": 1,
    "state": { "id": 1, "nameAr": "القاهرة", "nameEn": "Cairo", "code": "CAI", "isDeleted": false },
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": null,
    "isDeleted": false
  }
]
```

**Errors:**
| Code | When |
|------|------|
| 401 | Missing or invalid token |
| 403 | User lacks ViewDistricts permission |

---

### GET /api/v1/districts/by-state/{stateId}

**Permission:** `ViewDistricts`  
**Description:** Returns only the active districts for a specific state.  
**Use this endpoint to populate a districts dropdown after the user selects a state.**

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `stateId` | `int` | State ID |

**Response 200:** Array of DistrictResponse (same shape as GET all).

---

### GET /api/v1/districts/{id}

**Permission:** `ViewDistricts`  
**Description:** Returns a single district by ID.

**Response 200:** Single DistrictResponse object.

**Errors:**
| Code | When |
|------|------|
| 404 | District not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### GET /api/v1/districts/{id}/addresses

**Permission:** `ViewDistricts`  
**Description:** Returns a district with its full addresses list populated.

**Response 200:** DistrictResponse with `addresses` array populated.

---

### POST /api/v1/districts

**Permission:** `CreateDistricts`  
**Description:** Creates a new district.

**Request Body:**
```json
{
  "id": 0,
  "nameAr": "القاهرة الجديدة",
  "nameEn": "New Cairo",
  "code": "NC",
  "stateId": 1
}
```

**Response 201:** Returns the created district.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed or `stateId` does not exist |
| 409 | `nameAr`, `nameEn`, or `code` already exists within the same state |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### PUT /api/v1/districts

**Permission:** `EditDistricts`  
**Description:** Updates an existing district. Send the full object including the existing `id`.

**Request Body:** Same as POST but `id` must be the existing record's ID.

**Response 201:** Returns the updated district.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed |
| 404 | District not found |
| 409 | Name or code conflict within the same state |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### DELETE /api/v1/districts/{id}

**Permission:** `DeleteDistricts`  
**Description:** Toggles soft-delete. Calling on an active record deletes it; calling again restores it.

**Response 204:** No content.

**Errors:**
| Code | When |
|------|------|
| 400 | District is referenced by addresses — cannot delete |
| 404 | District not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### GET /api/v1/districts/count

**Permission:** `ViewDistricts`  
**Description:** Returns the count of active (non-deleted) districts.

**Response 200:**
```json
{
  "count": 142
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `nameEn` | Required, 2–100 chars, unique within the same state |
| `nameAr` | Required, 2–100 chars, unique within the same state |
| `code` | Required, 2–10 chars, unique within the same state |
| `stateId` | Required, must be > 0, must reference an existing non-deleted state |

> **Note:** Uniqueness for `nameEn`, `nameAr`, and `code` is **scoped to the state** — the same name can exist in two different states.

---

## UI Building Guide

### Form Fields

```
┌─────────────────────────────────────────────────────┐
│  Country (for filtering)                            │
│  [dropdown — load from GET /api/v1/countries]       │
├─────────────────────────────────────────────────────┤
│  State *                                            │
│  [dropdown — load from GET /api/v1/states/by-country/{countryId}]  │
├─────────────────────────────────────────────────────┤
│  Arabic Name *          │  English Name *            │
│  [text input RTL]       │  [text input LTR]          │
├─────────────────────────────────────────────────────┤
│  District Code *                                    │
│  [text input, max 10 chars, e.g. NC, NR]            │
└─────────────────────────────────────────────────────┘
```

### Dropdown: State

- The form has a **Country** selector (not sent to the API — used only to filter the State dropdown)
- After country is selected, load states: `GET /api/v1/states/by-country/{countryId}`
- Filter out `isDeleted: true` items
- Display: `nameEn (nameAr)` — e.g. *Cairo (القاهرة)*
- Send: `id` as `stateId`
- On edit: pre-select the current `state.id` (and pre-select the parent country from `state.country.id`)

### Cascading Dropdown Flow

```
User selects Country
  → Load states: GET /api/v1/states/by-country/{countryId}
  → User selects State
    → stateId is ready to submit
```

### Delete Behaviour

- If the API returns **400** on delete, show: *"This district cannot be deleted because it has associated addresses."*
- If the API returns **204**, toggle the row's visual state (soft delete — do not remove from list)

### Address Form Integration

When building an address form that needs the full geographic hierarchy:

```
Step 1: GET /api/v1/countries              → populate Country dropdown
Step 2: GET /api/v1/states/by-country/{id} → populate State dropdown (on country change)
Step 3: GET /api/v1/districts/by-state/{id} → populate District dropdown (on state change)
```
