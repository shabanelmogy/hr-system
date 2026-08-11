# Countries API — Frontend Integration Guide

## Overview

Manages country records used across the system (states, addresses, etc.).
All endpoints require a valid **JWT Bearer token**.

**Base URL:** `/api/v1/countries`  
**Permission Group:** `Countries`

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
| `ViewCountries` | `Countries:View` |
| `CreateCountries` | `Countries:Create` |
| `EditCountries` | `Countries:Edit` |
| `DeleteCountries` | `Countries:Delete` |

---

## Endpoints Summary

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/countries` | ViewCountries | Get all countries |
| GET | `/api/v1/countries/{id}` | ViewCountries | Get country by ID |
| GET | `/api/v1/countries/{id}/states` | ViewCountries | Get country with its states |
| POST | `/api/v1/countries` | CreateCountries | Create a new country |
| POST | `/api/v1/countries/bulk` | CreateCountries | Bulk insert countries |
| PUT | `/api/v1/countries` | EditCountries | Update a country |
| DELETE | `/api/v1/countries/{id}` | DeleteCountries | Soft delete / restore |
| GET | `/api/v1/countries/count` | ViewCountries | Get active country count |

---

## Data Models

### CountryRequest (POST / PUT body)

| Field | Type | Required | Constraints | UI Component |
|-------|------|----------|-------------|--------------|
| `id` | `int` | ✅ | Send `0` for new records, existing ID for update | Hidden field |
| `nameAr` | `string` | ✅ | 2–100 chars, Arabic letters only, unique | Text input (RTL) |
| `nameEn` | `string` | ✅ | 2–100 chars, English letters only, unique | Text input (LTR) |
| `alpha2Code` | `string?` | ❌ | Exactly 2 uppercase letters if provided, unique (e.g. `EG`) | Text input, maxLength=2, auto-uppercase |
| `alpha3Code` | `string?` | ❌ | Exactly 3 uppercase letters if provided, unique (e.g. `EGY`) | Text input, maxLength=3, auto-uppercase |
| `phoneCode` | `string?` | ❌ | 1–10 chars if provided (e.g. `20`, `966`) | Text input, maxLength=10 |
| `currencyCode` | `string?` | ❌ | Exactly 3 uppercase letters if provided, unique (e.g. `EGP`) | Text input, maxLength=3, auto-uppercase |

### CountryResponse (GET response)

```json
{
  "id": 1,
  "nameAr": "مصر",
  "nameEn": "Egypt",
  "alpha2Code": "EG",
  "alpha3Code": "EGY",
  "phoneCode": "20",
  "currencyCode": "EGP",
  "states": [
    {
      "id": 1,
      "nameAr": "القاهرة",
      "nameEn": "Cairo",
      "code": "CAI",
      "isDeleted": false
    }
  ],
  "createdOn": "2024-01-15T10:30:00Z",
  "updatedOn": null,
  "isDeleted": false
}
```

---

## Endpoint Details

### GET /api/v1/countries

**Permission:** `ViewCountries`  
**Description:** Returns all countries (including deleted ones — filter `isDeleted` on the frontend).

**Response 200:**
```json
[
  {
    "id": 1,
    "nameAr": "مصر",
    "nameEn": "Egypt",
    "alpha2Code": "EG",
    "alpha3Code": "EGY",
    "phoneCode": "20",
    "currencyCode": "EGP",
    "states": [],
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
| 403 | User lacks ViewCountries permission |

---

### GET /api/v1/countries/{id}

**Permission:** `ViewCountries`  
**Description:** Returns a single country by ID.

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `int` | Country ID |

**Response 200:** Same shape as single item in the list above.

**Errors:**
| Code | When |
|------|------|
| 404 | Country not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### GET /api/v1/countries/{id}/states

**Permission:** `ViewCountries`  
**Description:** Returns a country with its full states list populated.  
Use this endpoint when you need to show the states dropdown for a specific country.

**Response 200:** Same as GET by ID but `states` array is fully populated.

---

### POST /api/v1/countries

**Permission:** `CreateCountries`  
**Description:** Creates a new country.

**Request Body:**
```json
{
  "id": 0,
  "nameAr": "مصر",
  "nameEn": "Egypt",
  "alpha2Code": "EG",
  "alpha3Code": "EGY",
  "phoneCode": "20",
  "currencyCode": "EGP"
}
```

**Response 201:** Returns the created country.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed (see validation rules below) |
| 409 | `nameAr`, `nameEn`, `alpha2Code`, or `alpha3Code` already exists |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### POST /api/v1/countries/bulk

**Permission:** `CreateCountries`  
**Description:** Inserts multiple countries at once. Stops on first duplicate.

**Request Body:** Array of CountryRequest objects (all with `id: 0`).

```json
[
  { "id": 0, "nameAr": "مصر", "nameEn": "Egypt", "alpha2Code": "EG", "alpha3Code": "EGY", "phoneCode": "20", "currencyCode": "EGP" },
  { "id": 0, "nameAr": "السعودية", "nameEn": "Saudi Arabia", "alpha2Code": "SA", "alpha3Code": "SAU", "phoneCode": "966", "currencyCode": "SAR" }
]
```

**Response 204:** No content on success.

**Errors:**
| Code | When |
|------|------|
| 400 | Empty list provided |
| 409 | One or more names/codes already exist |

---

### PUT /api/v1/countries

**Permission:** `EditCountries`  
**Description:** Updates an existing country. Send the full object including the existing `id`.

**Request Body:** Same as POST but `id` must be the existing record's ID.

**Response 201:** Returns the updated country.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed |
| 404 | Country not found |
| 409 | Name or code conflict |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### DELETE /api/v1/countries/{id}

**Permission:** `DeleteCountries`  
**Description:** Toggles soft-delete. Calling on an active record deletes it; calling again restores it.

**Response 204:** No content.

**Errors:**
| Code | When |
|------|------|
| 400 | Country is referenced by states — cannot delete |
| 404 | Country not found |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### GET /api/v1/countries/count

**Permission:** `ViewCountries`  
**Description:** Returns the count of active (non-deleted) countries.

**Response 200:**
```json
{
  "count": 195,
  "country": null,
  "action": null
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `nameEn` | Required, 2–100 chars, English letters only, unique across all countries |
| `nameAr` | Required, 2–100 chars, Arabic letters only, unique across all countries |
| `alpha2Code` | Optional — if provided: exactly 2 chars, unique |
| `alpha3Code` | Optional — if provided: exactly 3 chars, unique |
| `phoneCode` | Optional — if provided: 1–10 chars |
| `currencyCode` | Optional — if provided: exactly 3 chars, unique |

> **Note:** Uniqueness for `nameEn`, `nameAr`, `alpha2Code`, `alpha3Code` is global (not scoped to any parent). The same code cannot exist in two different countries.

---

## UI Building Guide

### Form Fields

```
┌─────────────────────────────────────────────────────┐
│  Arabic Name *          │  English Name *            │
│  [text input RTL]       │  [text input LTR]          │
├─────────────────────────────────────────────────────┤
│  Alpha-2 Code           │  Alpha-3 Code              │
│  [text, max 2, upper]   │  [text, max 3, upper]      │
├─────────────────────────────────────────────────────┤
│  Phone Code             │  Currency Code             │
│  [text, max 10]         │  [text, max 3, upper]      │
└─────────────────────────────────────────────────────┘
```

- `nameAr` and `nameEn` are **required** — show validation error immediately on blur
- Optional fields (`alpha2Code`, `alpha3Code`, `phoneCode`, `currencyCode`) — only validate if the user types something
- Auto-uppercase `alpha2Code`, `alpha3Code`, `currencyCode` on input
- No dropdown fields — all free-text

### List / Grid View

- Show `isDeleted` as a status badge (Active / Deleted)
- `states` array length can be shown as a chip count
- Use `GET /api/v1/countries/count` to show a summary card at the top of the page

### Delete Behaviour

- If the API returns **400** on delete, show: *"This country cannot be deleted because it has associated states."*
- If the API returns **204**, toggle the row's visual state (do not remove from list — it's a soft delete)
