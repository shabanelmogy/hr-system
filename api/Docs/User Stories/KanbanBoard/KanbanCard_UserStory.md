# Kanban Card Management - User Story

## Feature Overview
Manage Kanban cards within columns. Cards represent individual tasks or work items that can be tracked, assigned, and moved through different stages of completion. Each card can have assignees, labels, comments, and attachments.

---

## User Stories

### US-001: View All Kanban Cards
**As a** user with appropriate permissions  
**I want to** view all Kanban cards across all columns  
**So that** I can see all tasks and their current status

**Acceptance Criteria:**
- User can see a list of all non-deleted cards
- Cards are ordered by their position (Order field)
- Each card shows: title, description, column, order, due date, archive status
- Only users with `ViewKanbanCards` permission can access
- Deleted cards are excluded from the list
- Results include related assignees, labels, comments, and attachments

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancards`
- Returns: `IEnumerable<KanbanCardResponse>`
- Includes navigation properties for related entities

---

### US-002: View Kanban Card by ID
**As a** user  
**I want to** view details of a specific card  
**So that** I can see complete information including assignees, comments, and attachments

**Acceptance Criteria:**
- User can retrieve a single card by ID
- Returns complete card information including all related data
- Returns 404 if card not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancards/{id}`
- Returns: `Result<KanbanCardResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: Create Kanban Card
**As a** user with appropriate permissions  
**I want to** create a new card in a column  
**So that** I can track a new task or work item

**Acceptance Criteria:**
- User can create a card by providing: column ID, title, description, order, due date
- System validates that the column exists and is not deleted
- Title is required (3-200 characters)
- Description is optional (max 1000 characters)
- Order must be greater than or equal to 0
- Due date is optional
- Only users with `CreateKanbanCards` permission can create cards
- Returns complete card information after creation

**Validation Rules:**
- Title: Required, 3-200 characters
- Description: Optional, max 1000 characters
- KanbanColumnId: Required, must be greater than 0, column must exist
- Order: Required, must be >= 0
- DueDate: Optional
- IsArchived: Boolean, defaults to false

**Technical Notes:**
- Endpoint: `POST /api/v1/kanbancards`
- Returns: `Result<KanbanCardResponse>`
- Status Codes: 201 (Created), 404 (Column Not Found), 400 (Validation Error)

---

### US-004: Update Kanban Card
**As a** user with appropriate permissions  
**I want to** update a card's information  
**So that** I can modify task details, move it to another column, or change its order

**Acceptance Criteria:**
- User can update: title, description, column, order, due date, archive status
- System validates card exists
- System validates new column exists (if changed)
- System logs all changes for audit purposes
- Only users with `EditKanbanCards` permission can update
- Returns updated card information

**Validation Rules:**
- Same validation as Create operation
- Card ID must exist

**Technical Notes:**
- Endpoint: `PUT /api/v1/kanbancards`
- Returns: `Result<KanbanCardResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 400 (Validation Error)
- Change logging enabled via IEntityChangeLogService

---

### US-005: Delete Kanban Card
**As a** user with appropriate permissions  
**I want to** delete a card  
**So that** I can remove completed or cancelled tasks

**Acceptance Criteria:**
- User can delete a card by ID
- System performs soft delete (sets IsDeleted = true)
- System prevents deletion if card has active assignees
- System records deletion metadata (who, when, from which PC)
- Deleted cards are excluded from all queries
- Only users with `DeleteKanbanCards` permission can delete
- Returns 404 if card not found

**Business Rules:**
- Cannot delete card if it has active (non-deleted) assignees
- Must remove all assignees before deletion

**Technical Notes:**
- Endpoint: `DELETE /api/v1/kanbancards/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found), 400 (Has Assignees)
- Soft delete implementation with audit fields

---

### US-006: Archive/Unarchive Kanban Card
**As a** user with appropriate permissions  
**I want to** archive or unarchive a card  
**So that** I can hide completed tasks without deleting them

**Acceptance Criteria:**
- User can toggle archive status via Update endpoint
- Archived cards can be filtered out in queries
- Archive status doesn't affect deletion rules
- Only users with `EditKanbanCards` permission can archive

**Technical Notes:**
- Implemented through Update endpoint
- IsArchived field controls visibility

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbancards | ViewKanbanCards | Get all cards |
| GET | /api/v1/kanbancards/{id} | - | Get card by ID |
| POST | /api/v1/kanbancards | CreateKanbanCards | Create new card |
| PUT | /api/v1/kanbancards | EditKanbanCards | Update card |
| DELETE | /api/v1/kanbancards/{id} | DeleteKanbanCards | Delete card |

---

## Data Models

### KanbanCardRequest
```csharp
{
    "id": 0,
    "kanbanColumnId": 1,
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "order": 0,
    "dueDate": "2024-12-31T23:59:59Z",
    "isArchived": false
}
```

### KanbanCardResponse
```csharp
{
    "id": 1,
    "kanbanColumnId": 1,
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "order": 0,
    "dueDate": "2024-12-31T23:59:59Z",
    "isArchived": false,
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": "2024-01-20T14:45:00Z",
    "isDeleted": false,
    "assignees": [
        {
            "id": 1,
            "userId": "user-guid",
            "userName": "john.doe"
        }
    ],
    "cardLabels": [
        {
            "id": 1,
            "labelId": 1,
            "labelName": "Backend",
            "colorHex": "#FF5733"
        }
    ],
    "comments": [
        {
            "id": 1,
            "content": "Started working on this task",
            "userId": "user-guid",
            "userName": "john.doe",
            "createdOn": "2024-01-16T09:00:00Z"
        }
    ],
    "attachments": [
        {
            "id": 1,
            "fileName": "design-mockup.png",
            "fileUrl": "/uploads/design-mockup.png",
            "uploadedOn": "2024-01-15T11:00:00Z"
        }
    ]
}
```

### SimpleKanbanCardResponse
```csharp
{
    "id": 1,
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "order": 0,
    "dueDate": "2024-12-31T23:59:59Z",
    "isArchived": false
}
```

---

## Business Rules

1. **Column Assignment**: Each card must belong to exactly one column
2. **Order Management**: Cards are ordered within their column using the Order field
3. **Assignee Protection**: Cannot delete card with active assignees
4. **Soft Delete**: All deletions are soft deletes with audit trail
5. **Change Logging**: All updates are logged for audit purposes
6. **Archive vs Delete**: Archived cards remain accessible but can be filtered out
7. **Due Date**: Optional field for deadline tracking

---

## Validation Rules

### Title
- Required
- Minimum length: 3 characters
- Maximum length: 200 characters
- Trimmed before validation

### Description
- Optional
- Maximum length: 1000 characters
- Trimmed before validation

### KanbanColumnId
- Required
- Must be greater than 0
- Column must exist in database
- Column must not be deleted

### Order
- Required
- Must be greater than or equal to 0
- Used for positioning cards within a column

### DueDate
- Optional
- DateTime format
- Can be null

### IsArchived
- Boolean
- Defaults to false

---

## Error Scenarios

### 404 Not Found
- **KanbanCardNotFound**: Card with specified ID doesn't exist
- **InvalidColumn**: Referenced column doesn't exist or is deleted

### 409 Conflict
- **KanbanCardExists**: Card with same title exists in column (if implemented)

### 400 Bad Request
- **KanbanCardHasAssignees**: Cannot delete card with active assignees
- **MaxLengthError**: Field exceeds maximum length
- **GreaterThanZero**: Column ID must be greater than 0
- **Required**: Required field is missing
- **InvalidValues**: Column doesn't exist

---

## Database Schema

### Table: KanbanCards

| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Identity |
| KanbanColumnId | int | Foreign Key, Required |
| Title | nvarchar(200) | Required |
| Description | nvarchar(1000) | Nullable |
| Order | int | Required |
| DueDate | datetime | Nullable |
| IsArchived | bit | Required, Default: false |
| CreatedOn | datetime | Required |
| CreatedById | string | Foreign Key |
| UpdatedOn | datetime | Nullable |
| UpdatedById | string | Foreign Key, Nullable |
| IsDeleted | bit | Required, Default: false |
| DeletedOn | datetime | Nullable |
| DeletedById | string | Foreign Key, Nullable |
| DeletedByPc | string | Nullable |

### Indexes
- Primary Key: Id
- Foreign Key Index: KanbanColumnId
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

### Relationships
- **KanbanColumn**: Many-to-One (required)
- **KanbanCardAssignees**: One-to-Many
- **KanbanCardLabels**: One-to-Many
- **KanbanCardComments**: One-to-Many
- **KanbanCardAttachments**: One-to-Many

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records
7. **XSS Prevention**: Input sanitization for title and description

---

## Testing Scenarios

### Positive Tests
1. Create card with valid data
2. Update card title and description
3. Move card to different column
4. Change card order
5. Set due date
6. Archive card
7. Delete card (without assignees)
8. View all cards
9. View card by ID

### Negative Tests
1. Create card with non-existent column
2. Create card with empty title
3. Create card with title too short (< 3 chars)
4. Create card with title too long (> 200 chars)
5. Create card with description too long (> 1000 chars)
6. Update non-existent card
7. Delete card with active assignees
8. Delete non-existent card
9. Access without proper permissions
10. Create card with negative order

---

## Related Entities

- **KanbanColumn**: Parent entity representing the column
- **KanbanCardAssignee**: Users assigned to the card
- **KanbanCardLabel**: Labels applied to the card
- **KanbanCardComment**: Comments on the card
- **KanbanCardAttachment**: Files attached to the card
- **ApplicationUser**: User entity for audit fields

---

## Future Enhancements

1. **Drag and Drop**: Support for reordering cards via drag and drop
2. **Card Templates**: Create cards from predefined templates
3. **Recurring Cards**: Automatically create cards on a schedule
4. **Card Dependencies**: Link cards that depend on each other
5. **Time Tracking**: Track time spent on cards
6. **Card Checklist**: Add subtasks within cards
7. **Card History**: View complete history of card changes
8. **Card Notifications**: Notify assignees of card updates
9. **Card Search**: Full-text search across cards
10. **Card Export**: Export cards to various formats

---

## Performance Considerations

1. **Indexing**: Proper indexes on foreign keys and frequently queried fields
2. **Pagination**: Implement pagination for large card lists
3. **Lazy Loading**: Load related entities only when needed
4. **Caching**: Cache frequently accessed cards
5. **Query Optimization**: Use projections to reduce data transfer

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented
