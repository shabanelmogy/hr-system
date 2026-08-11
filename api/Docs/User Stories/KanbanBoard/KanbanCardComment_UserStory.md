# Kanban Card Comment Management - User Story

## Feature Overview
Manage comments associated with Kanban cards. Users can add, view, edit, and delete comments on specific cards. Only the creator of a comment can update or delete it. Deletions are soft deletes to preserve audit history.

---

## User Stories

### US-CC-001: View All Comments
As a user with appropriate permissions
I want to view all Kanban card comments
So that I can audit and review activity across all cards

Acceptance Criteria:
- Returns a list of all non-deleted comments
- Each item shows: Id, KanbanCardId, KanbanCardTitle, CommentText, CreatedBy info, CreatedOn/UpdatedOn, IsDeleted
- Ordered by CreatedOn descending
- Only users with `ViewKanbanCardComments` permission can access

Technical Notes:
- Endpoint: GET /api/v1/KanbanCardComments/GetAll
- Returns: IEnumerable<KanbanCardCommentResponse>

---

### US-CC-002: View Comment by ID
As an authenticated user
I want to view a comment by its ID
So that I can see its details

Acceptance Criteria:
- Returns the comment details if it exists and is not deleted
- Returns 404 if the comment does not exist or is deleted
- No special permission required (authenticated users only)

Technical Notes:
- Endpoint: GET /api/v1/KanbanCardComments/GetById/{id}
- Returns: Result<KanbanCardCommentResponse>
- Status Codes: 200, 404

---

### US-CC-003: View Comments by Card ID
As a user with appropriate permissions
I want to view comments for a specific Kanban card
So that I can review the discussion related to a given task

Acceptance Criteria:
- Returns non-deleted comments for the specified card
- Ordered by CreatedOn descending
- Returns an empty list if no comments found
- Only users with `ViewKanbanCardComments` permission can access

Technical Notes:
- Endpoint: GET /api/v1/KanbanCardComments/GetByCardId/card/{cardId}
- Returns: IEnumerable<KanbanCardCommentResponse>
- Status Codes: 200

---

### US-CC-004: Create Comment
As a user with appropriate permissions
I want to add a new comment to a card
So that I can share notes or updates

Acceptance Criteria:
- User provides: KanbanCardId, CommentText
- Validates that the card exists and is not deleted
- CommentText must be 1..2000 characters
- Returns the created comment details
- Only users with `CreateKanbanCardComments` permission can create

Validation Rules:
- KanbanCardId: > 0, must reference an existing, non-deleted card
- CommentText: required, length 1..2000, trimmed

Technical Notes:
- Endpoint: POST /api/v1/KanbanCardComments/Add
- Body: KanbanCardCommentRequest
- Returns: Result<KanbanCardCommentResponse>
- Status Codes: 201, 400 (validation error), 404 (invalid card id if implemented through errors)

---

### US-CC-005: Update Comment
As a user with appropriate permissions
I want to update my own comment
So that I can correct or improve it

Acceptance Criteria:
- Only the creator of the comment can update it
- Validates that the comment exists and is not deleted
- Validates CommentText 1..2000
- Logs changes for audit
- Returns the updated comment details
- Only users with `EditKanbanCardComments` permission can update

Technical Notes:
- Endpoint: PUT /api/v1/KanbanCardComments/Update
- Body: KanbanCardCommentRequest (Id is required)
- Returns: Result<KanbanCardCommentResponse>
- Status Codes: 200, 403 (UnauthorizedCommentAccess), 404 (KanbanCardCommentNotFound), 400 (validation error)

---

### US-CC-006: Delete Comment (Soft Delete)
As a user with appropriate permissions
I want to delete my own comment
So that I can remove incorrect or outdated content

Acceptance Criteria:
- Only the creator of the comment can delete it
- Soft delete toggled (IsDeleted flag) with audit metadata: DeletedById, DeletedOn, DeletedByPc
- Deleted comments are excluded from queries
- Only users with `DeleteKanbanCardComments` permission can delete

Technical Notes:
- Endpoint: DELETE /api/v1/KanbanCardComments/Delete/{id}
- Returns: Result
- Status Codes: 204, 403 (UnauthorizedCommentAccess), 404 (KanbanCardCommentNotFound)

---

## API Endpoints Summary

| Method | Endpoint                                          | Permission                  | Description                     |
|--------|---------------------------------------------------|-----------------------------|---------------------------------|
| GET    | /api/v1/KanbanCardComments/GetAll                | ViewKanbanCardComments      | Get all comments                |
| GET    | /api/v1/KanbanCardComments/GetById/{id}          | -                           | Get comment by ID              |
| GET    | /api/v1/KanbanCardComments/GetByCardId/card/{cardId} | ViewKanbanCardComments  | Get comments by Kanban card ID |
| POST   | /api/v1/KanbanCardComments/Add                   | CreateKanbanCardComments    | Create new comment              |
| PUT    | /api/v1/KanbanCardComments/Update                | EditKanbanCardComments      | Update existing comment         |
| DELETE | /api/v1/KanbanCardComments/Delete/{id}           | DeleteKanbanCardComments    | Soft delete a comment           |

Note: Routes follow ApiRoutes.BaseRoute = "api/v{version:apiVersion}/[controller]/[action]" with additional route templates on some actions.

---

## Data Models

### KanbanCardCommentRequest
```json
{
  "id": 0,
  "kanbanCardId": 1,
  "commentText": "This is a comment"
}
```

### KanbanCardCommentResponse
```json
{
  "id": 1,
  "kanbanCardId": 1,
  "kanbanCardTitle": "Implement user authentication",
  "commentText": "Started working on this task",
  "userId": "user-guid",
  "userName": "john.doe",
  "userEmail": "john.doe@example.com",
  "createdOn": "2024-01-16T09:00:00Z",
  "updatedOn": "2024-01-16T10:00:00Z",
  "isDeleted": false
}
```

### SimpleKanbanCardCommentResponse
```json
{
  "id": 1,
  "commentText": "Started working on this task",
  "userId": "user-guid",
  "userName": "john.doe",
  "createdOn": "2024-01-16T09:00:00Z"
}
```

---

## Business Rules
1. Creator-only modification: only the user who created a comment can update or delete it
2. Soft delete: comments are soft deleted using IsDeleted flag and audit fields
3. Ordering: comments are returned ordered by CreatedOn descending
4. Card integrity: KanbanCardId must reference an existing, non-deleted card
5. Projections: queries use projections to return DTOs efficiently

---

## Validation Rules
- KanbanCardId: required, > 0, must exist and not be deleted
- CommentText: required, trimmed, length 1..2000 characters

---

## Error Scenarios
- 404 Not Found: KanbanCardCommentNotFound
- 403 Forbidden: UnauthorizedCommentAccess (when non-creator attempts update/delete)
- 400 Bad Request: Validation errors (Required, MaxLengthError, GreaterThanZero, InvalidValues)
- 400 Bad Request: InvalidKanbanCard (optional usage by domain logic)

---

## Database Schema

### Table: KanbanCardComments

| Column       | Type            | Constraints                       |
|--------------|-----------------|-----------------------------------|
| Id           | int             | Primary Key, Identity             |
| KanbanCardId | int             | Foreign Key (KanbanCards), Index  |
| CommentText  | nvarchar(2000)  | Required                          |
| CreatedOn    | datetime        | Required                          |
| CreatedById  | string          | Foreign Key (AspNetUsers)         |
| UpdatedOn    | datetime        | Nullable                          |
| UpdatedById  | string          | Foreign Key (AspNetUsers)         |
| IsDeleted    | bit             | Required, Default false           |
| DeletedOn    | datetime        | Nullable                          |
| DeletedById  | string          | Foreign Key (AspNetUsers)         |
| DeletedByPc  | string          | Nullable                          |

Relationships:
- KanbanCard: Many-to-One (required)

---

## Security Considerations
1. Authentication required for all endpoints
2. Authorization via Permissions: View/Create/Edit/DeleteKanbanCardComments
3. Data validation: FluentValidation with localized messages
4. Audit trail: maintain Created/Updated/Deleted metadata
5. Soft delete: prevent hard deletion to preserve history
6. Foreign key constraints: ensure referential integrity
7. XSS prevention: treat CommentText as untrusted input at UI level

---

## Testing Scenarios

### Positive
1. Create comment with valid data
2. View all comments (authorized)
3. View comments by card ID
4. Update comment by creator
5. Delete comment by creator (soft delete)

### Negative
1. Create comment with non-existent card
2. Create comment with empty text
3. Update non-existent comment
4. Update comment by non-creator (403)
5. Delete comment by non-creator (403)
6. Delete non-existent comment (404)
7. Access list endpoints without View permission

---

## Related Entities
- KanbanCard: Parent entity
- ApplicationUser: User entity (audit fields)

---

## Performance Considerations
1. Index on KanbanCardId to optimize queries by card
2. Projections to DTOs to reduce over-fetching
3. AsNoTracking for read endpoints
4. Pagination (optional) for large comment sets (future enhancement)

---

**Document Version:** 1.0
**Last Updated:** 2025
**Author:** HR Management System Team
