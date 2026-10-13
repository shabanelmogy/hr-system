# States API — Frontend Integration Guide

## Overview

Manages state/province records. Each state belongs to a country.  
All endpoints require a valid **JWT Bearer token**.

**Base URL:** `/api/v1/states`  
**Permission Group:** `States`

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
| `ViewStates` | `States:View` |
| `CreateStates` | `States:Create` |
| `EditStates` | `States:Edit` |
| `ArchiveStates` | `States:Archive` |
| `RestoreStates` | `States:Restore` |

---

## Endpoints Summary

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/states` | ViewStates | Server-paged management list |
| GET | `/api/v1/states/lookup` | ViewStates | Active selector data (optional parent filter) |
| GET | `/api/v1/states/by-country/{countryId}` | ViewStates | Active states for one country |
| GET | `/api/v1/states/{id}` | ViewStates | Detail |
| GET | `/api/v1/states/{id}/districts` | ViewStates | Record with its districts |
| POST | `/api/v1/states` | CreateStates | Create one record (201) |
| POST | `/api/v1/states/bulk` | CreateStates | Atomically create several records (201) |
| PUT | `/api/v1/states/{id}` | EditStates | Update one active record (200) |
| DELETE | `/api/v1/states/{id}` | ArchiveStates | Archive one active record (204) |
| POST | `/api/v1/states/bulk-archive` | ArchiveStates | Atomically archive up to 100 records (200) |
| POST | `/api/v1/states/{id}/restore` | RestoreStates | Restore one archived record (204) |

There is no count endpoint and no hard delete; archive and restore are separate operations.

---

## Data Models

### StateRequest (POST / PUT body)

| Field | Type | Required | Constraints | UI Component |
|-------|------|----------|-------------|--------------|
| `id` | `int?` | Create: optional / `0`; update: required | Omit or send `0` for new records, existing ID for update | Hidden field |
| `nameAr` | `string` | ✅ | 2–100 printable Unicode characters; spaces, digits, punctuation, and mixed scripts allowed; unique within the same country | Text input (RTL) |
| `nameEn` | `string` | ✅ | 2–100 printable Unicode characters; spaces, digits, punctuation, and mixed scripts allowed; unique within the same country | Text input (LTR) |
| `code` | `string` | ✅ | 2–10 chars, unique within the same country (e.g. `CAI`, `RYD`) | Text input, maxLength=10 |
| `countryId` | `int` | ✅ | Must be a valid, non-deleted country ID | **Dropdown** — load from Countries API |

> ⚠️ **Dropdown field:** `countryId` must be populated from `GET /api/v1/countries`.  
> Display `nameEn` / `nameAr` as the label, send `id` as the value.

### StateResponse (GET response)

```json
{
  "id": 1,
  "nameAr": "القاهرة",
  "nameEn": "Cairo",
  "code": "CAI",
  "country": {
    "id": 1,
    "nameAr": "مصر",
    "nameEn": "Egypt"
  },
  "createdOn": "2024-01-15T10:30:00Z",
  "updatedOn": null,
  "isDeleted": false
}
```


## Endpoint Details

### GET /api/v1/states

**Permission:** `ViewStates`  
**Description:** Returns all states with their parent country info.

**Response 200:**
```json
[
  {
    "id": 1,
    "nameAr": "القاهرة",
    "nameEn": "Cairo",
    "code": "CAI",
    "country": { "id": 1, "nameAr": "مصر", "nameEn": "Egypt" },
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
| 403 | User lacks ViewStates permission |

---

### GET /api/v1/states/by-country/{countryId}

**Permission:** `ViewStates`  
**Description:** Returns only the active states for a specific country.  
**Use this endpoint to populate a states dropdown after the user selects a country.**

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `countryId` | `int` | Country ID |

**Response 200:** Array of StateResponse (same shape as GET all).

---

### GET /api/v1/states/{id}

**Permission:** `ViewStates`  
**Description:** Returns a single state by ID.

**Response 200:** Single StateResponse object.

**Errors:**
| Code | When |
|------|------|
| 404 | State not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### GET /api/v1/states/{id}/districts

**Permission:** `ViewStates`  
**Description:** Returns a state by ID for district-selection flows.  
Use this before loading districts for a specific state.

**Response 200:** Single StateResponse object.

---

### POST /api/v1/states

**Permission:** `CreateStates`  
**Description:** Creates a new state.

**Request Body:**
```json
{
  "id": 0,
  "nameAr": "القاهرة",
  "nameEn": "Cairo",
  "code": "CAI",
  "countryId": 1
}
```

**Response 201:** Returns the created state.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed or `countryId` does not exist |
| 409 | `nameAr`, `nameEn`, or `code` already exists within the same country |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### PUT /api/v1/states/{id}

**Permission:** `EditStates`  
**Description:** Updates an existing state. The route `id` identifies the record; only active records can be updated.

**Request Body:** Same fields as POST.

**Response 200:** Returns the updated state.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed |
| 404 | State not found |
| 409 | Name or code conflict within the same country |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### DELETE /api/v1/states/{id}

**Permission:** `ArchiveStates`  
**Description:** Archives one active record. Use `POST /api/v1/states/{id}/restore` (`RestoreStates`) to restore it, and `POST /api/v1/states/bulk-archive` for up to 100 records at once.

**Response 204:** No content.

**Errors:**
| Code | When |
|------|------|
| 400 | State is referenced by districts — cannot delete |
| 404 | State not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---


## Validation Rules

| Field | Rule |
|-------|------|
| `nameEn` | Required, 2–100 printable Unicode characters, unique within the same country; control characters and line breaks rejected |
| `nameAr` | Required, 2–100 printable Unicode characters, unique within the same country; control characters and line breaks rejected |
| `code` | Required, 2–10 chars, unique within the same country |
| `countryId` | Required, must be > 0, must reference an existing non-deleted country |

> **Note:** Uniqueness for `nameEn`, `nameAr`, and `code` is **scoped to the country** — the same name can exist in two different countries.

---

## UI Building Guide

### Form Fields

```
┌─────────────────────────────────────────────────────┐
│  Country *                                          │
│  [dropdown — load from GET /api/v1/countries]       │
├─────────────────────────────────────────────────────┤
│  Arabic Name *          │  English Name *            │
│  [text input RTL]       │  [text input LTR]          │
├─────────────────────────────────────────────────────┤
│  State Code *                                       │
│  [text input, max 10 chars, e.g. CAI, RYD]          │
└─────────────────────────────────────────────────────┘
```

### Dropdown: Country

- Load on form open: `GET /api/v1/countries`
- Filter out `isDeleted: true` items
- Display: `nameEn (nameAr)` — e.g. *Egypt (مصر)*
- Send: `id` as `countryId`
- On edit: pre-select the current `country.id`

### Cascading Dropdowns (if used in address forms)

When building an address form that needs Country → State → District:
1. Load countries: `GET /api/v1/countries`
2. On country select, load states: `GET /api/v1/states/by-country/{countryId}`
3. On state select, load districts: `GET /api/v1/districts/by-state/{stateId}`

### Archive behaviour

- Archive returns **400** (`*InUseBy*` error) when active districts still use this state; show the localized dependency message.
- Archive and restore return **204**; refresh the list (archived rows stay visible under the archived/all status filter).
