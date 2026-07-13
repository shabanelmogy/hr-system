# State Entity User Story

## 📋 Story Status Legend:
	- ✅ Completed
	- 🔄 In Progress  
	- ⏳ Planned
	- ❌ Blocked

## Epic: Geographic Management System

### User Story: Manage States/Provinces

As a system administrator  
I want to manage states/provinces within countries  
So that geographic data (states and their districts) is consistent and usable across the system.

### Acceptance Criteria:

#### Functional Requirements:
1. Create State
   - I can add a new state with Arabic name, English name, and code
   - I must select a valid country
   - Names (Arabic/English) and code must be unique within the same country
   - On success, I receive the created state including its country info and timestamps

2. View States
   - I can view all states in a list
   - I can filter/list states by country
   - I can view details for a specific state by ID
   - I can retrieve a state with its related districts via a dedicated endpoint
   - I can see whether a state is active or soft-deleted

3. Update State
   - I can modify Arabic name, English name, code, and country
   - System prevents updates that would cause duplicates within the same country
   - System prevents updating to a non-existent country
   - System maintains an audit trail for changes

4. Delete/Restore State (Soft Delete Toggle)
   - I can toggle a state’s active/deleted status
   - System prevents deletion if any districts reference this state
   - System records deletion metadata (deleted by, machine name, timestamp)
   - On success, the operation returns no content

5. Real-time Updates
   - State count updates are broadcast in real-time to clients via SignalR when relevant events occur

6. Count
   - I can retrieve the total number of active states

#### Technical Requirements:
1. Validation
   - English name (NameEn): required, 2–100 characters, English letters and spaces only
   - Arabic name (NameAr): required, 2–100 characters, Arabic letters and spaces only
   - Code: required, 2–10 characters
   - CountryId: required, must be > 0 and must reference an existing (non-deleted) country
   - Uniqueness per CountryId: NameEn, NameAr, and Code must be unique within the same country

2. Security
   - Proper authorization is required for all operations
   - Permissions enforced: ViewStates, CreateStates, EditStates, DeleteStates
   - Audit trail is recorded for updates (and deletion metadata for soft-delete)

3. Performance
   - All operations are asynchronous
   - Efficient querying with proper filtering by CountryId
   - Recommended indexes/constraints:
     - Index on CountryId
     - Unique composite indexes: (CountryId, NameEn), (CountryId, NameAr), (CountryId, Code)

### API Contract Summary (for reference)
- Request: StateRequest { Id, NameAr, NameEn, Code, CountryId }
- Response: StateResponse { Id, NameAr, NameEn, Code, Country { Id, NameAr, NameEn, IsDeleted }, CreatedOn, UpdatedOn, IsDeleted }
- Count Response: StatesCountResponse { Count }

Endpoints (v1, base: api/v{version}/States/{Action})
- GET GetAll → list all states
- GET by-country/{countryId} (Action: GetAllByCountry) → list states for a country
- GET {id} (Action: GetByID) → get a single state by id
- GET {id}/districts (Action: GetStateWithDistricts) → get a state with related districts
- POST Add → create a state
- PUT Update → update a state
- DELETE {id} (Action: Delete) → soft-delete/restore
- GET count (Action: GetCount) → get active count

### Definition of Done:
- [ ] Entity and EF configurations created (including unique constraints and indexes)
- [ ] Service layer implemented for: get all, get by country, get by id, get with related districts, add, update, toggle delete/restore, get count
- [ ] Controller endpoints available with proper authorization attributes
- [ ] Validation rules implemented as specified
- [ ] Error handling with descriptive messages (e.g., not found, in use by district, duplicates, country not found)
- [ ] Mapping configured for State ⇄ Request/Response including Country projection
- [ ] Unit tests written and passing (service, validator)
- [ ] Integration tests passing (controller)
- [ ] API documentation updated with request/response examples
- [ ] Localization keys added for validation and errors (English/Arabic)
- [ ] SignalR integration for real-time count updates
- [ ] Database migration created and tested
- [ ] Audit trail recorded for updates and deletion metadata captured on soft-delete
