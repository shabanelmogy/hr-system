# Kanban Column Management - User Story

## Feature Overview
Manage columns within a Kanban board, including creating, renaming, reordering, archiving, and soft-deleting columns. Each column contains ordered cards and optionally tasks.

## User Stories

### US-001: View Kanban Columns
As a user
I want to view all Kanban columns
So that I can see available columns across boards

Acceptance Criteria:
- Returns all non-deleted columns
- Each column shows: Id, KanbanBoardId, Name, Order, IsArchived, CreatedOn, UpdatedOn
- Includes lightweight list of cards (Id, Title, Description, Order, DueDate, IsArchived)
- Requires permission: ViewKanbanColumns

### US-002: Get Kanban Column By Id
As a user
I want to view a specific column by Id
So that I can see its details

Acceptance Criteria:
- Returns 404 if column not found
- Returns the column with its cards

### US-003: Create Kanban Column
As a user
I want to create a new column in a board
So that I can organize cards

Acceptance Criteria:
- Required: KanbanBoardId (> 0), Name (3-100 chars), Order (>= 0)
- Validates board exists and is not deleted
- Validates unique column Name per board
- Requires permission: CreateKanbanColumns

### US-004: Update Kanban Column
As a user
I want to update a column
So that I can rename or reorder it

Acceptance Criteria:
- Can update Name, Order, IsArchived
- Logs changes in audit trail
- Requires permission: EditKanbanColumns

### US-005: Delete (Toggle) Kanban Column
As a user
I want to soft delete/restore a column
So that I can manage visibility without losing data

Acceptance Criteria:
- Toggles IsDeleted and fills audit delete fields
- Prevent deletion if column has active (non-deleted) cards
- Returns 400 if has active cards
- Requires permission: DeleteKanbanColumns

## API Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbancolumns | ViewKanbanColumns | Get all columns |
| GET | /api/v1/kanbancolumns/{id} | - | Get column by ID |
| POST | /api/v1/kanbancolumns | CreateKanbanColumns | Create new column |
| PUT | /api/v1/kanbancolumns | EditKanbanColumns | Update column |
| DELETE | /api/v1/kanbancolumns/{id} | DeleteKanbanColumns | Soft delete/restore column |

## Business Rules
1. Column Name must be unique per board
2. All operations use soft delete
3. Deletion blocked when column has non-deleted cards
4. Column Order is a non-negative integer
5. Changes are logged on update

## Validation Rules
- KanbanBoardId: Required, > 0, board must exist
- Name: Required, length 3-100
- Order: Required, >= 0

## Errors
- 404: KanbanColumnNotFound
- 409: KanbanColumnExists
- 400: KanbanColumnHasCards

## Notes
- Cards are returned in ascending Order within a column
- Use projection in queries for better performance
- Use AsNoTracking for read operations
