# Kanban Label Management - User Story

## Feature Overview
Manage Kanban labels within a board to categorize and color-code Kanban cards. Each label belongs to a specific board and can be linked to cards within that board.

## User Stories

### US-001: View Kanban Labels
As a user
I want to view all Kanban labels
So that I can see available labels in the system

Acceptance Criteria:
- Returns all non-deleted labels
- Each label includes: id, board id, name, color hex, audit info
- Only users with ViewKanbanLabels permission can access

### US-002: Get Kanban Label by ID
As a user
I want to get a specific label by ID
So that I can view its details

Acceptance Criteria:
- Returns label details when it exists and is not deleted
- Returns 404 when label is not found

### US-003: Create Kanban Label
As a user
I want to create a new label
So that I can classify cards with color-coded tags

Acceptance Criteria:
- Required inputs: KanbanBoardId, Name, ColorHex
- Name must be unique per board
- ColorHex must be a valid hex color in the format #RRGGBB
- Only users with CreateKanbanLabels permission can create
- On success, returns 201 with created entity

### US-004: Update Kanban Label
As a user
I want to update an existing label
So that I can modify its name or color

Acceptance Criteria:
- Required inputs: Id, KanbanBoardId, Name, ColorHex
- Name must remain unique per board (excluding self)
- Only users with EditKanbanLabels permission can update
- On success, returns 201 with updated entity
- Returns 404 when label is not found

### US-005: Delete (Toggle) Kanban Label
As a user
I want to soft delete (toggle) a label
So that I can remove labels that are no longer needed

Acceptance Criteria:
- Performs soft delete toggle on the entity
- Cannot delete if label is linked to any non-deleted card labels
- Only users with DeleteKanbanLabels permission can delete
- On success, returns 204 No Content
- Returns 404 when label is not found
- Returns 400 if label is in use (linked to cards)

## API Endpoints

Note: The API base route is `api/v{version}/[controller]/[action]`. The controller name is `KanbanLabels`.

| Method | Endpoint                                 | Permission           | Description                  |
|--------|------------------------------------------|----------------------|------------------------------|
| GET    | /api/v1/KanbanLabels/GetAll              | ViewKanbanLabels     | Get all labels               |
| GET    | /api/v1/KanbanLabels/GetById/{id}        | -                    | Get label by ID              |
| POST   | /api/v1/KanbanLabels/Add                 | CreateKanbanLabels   | Create new label             |
| PUT    | /api/v1/KanbanLabels/Update              | EditKanbanLabels     | Update label                 |
| DELETE | /api/v1/KanbanLabels/Delete/{id}         | DeleteKanbanLabels   | Soft delete (toggle) label   |

## Request/Response Schemas

Request (KanbanLabelRequest):
- Id: int
- KanbanBoardId: int
- Name: string
- ColorHex: string (e.g., #FF5733)

Response (KanbanLabelResponse):
- Id: int
- KanbanBoardId: int
- Name: string
- ColorHex: string
- CreatedOn: DateTime
- UpdatedOn: DateTime?
- IsDeleted: bool

## Business Rules
1. A label belongs to exactly one board (KanbanBoardId).
2. Label names must be unique within the same board.
3. Soft delete is used; deleted labels are excluded from regular queries.
4. A label cannot be deleted if it is linked to any non-deleted KanbanCardLabel entities.

## Validation Rules
- KanbanBoardId: Required, must be greater than 0, board must exist and not be deleted.
- Name: Required, trimmed, length between 2 and 100 characters.
- ColorHex: Required, must match regex ^#[0-9A-Fa-f]{6}$ (length 7).
- Uniqueness: (KanbanBoardId + Name) must be unique among non-deleted labels.

## Error Scenarios
- 404: KanbanLabelNotFound — The Kanban label was not found.
- 409: KanbanLabelExists — A label with this name already exists in this board.
- 400: KanbanLabelInUse — Cannot delete the label because it is linked to cards.
- 400: Validation errors for invalid board, name, or color.

## Permissions
- ViewKanbanLabels
- CreateKanbanLabels
- EditKanbanLabels
- DeleteKanbanLabels

## Notes
- All read operations use AsNoTracking and filter out deleted entities.
- Changes are logged in update operations via the entity change log service.
- Soft delete toggles IsDeleted and sets DeletedBy/DeletedOn metadata.
