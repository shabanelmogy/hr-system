# Kanban Card Label Management - User Story

## Feature Overview
Manage labels linked to Kanban cards. This feature allows applying one or more labels to a card for categorization and quick visual identification. Labels typically have a name and a color. Cards can have multiple labels, and labels can be used across many cards.

---

## User Stories

### US-001: View All Kanban Card Labels Links
**As a** user with appropriate permissions  
**I want to** view all label links across all cards  
**So that** I can see which labels are used on which cards

**Acceptance Criteria:**
- User can see a list of all non-deleted label links (card-label relations)
- Each item shows: card ID, label ID, label name, label color, createdOn
- Only users with `ViewKanbanCardLabels` permission can access
- Deleted links are excluded from the list

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardlabels`
- Returns: `IEnumerable<KanbanCardLabelResponse>`
- Includes navigation properties for Label (name, color)

---

### US-002: View Kanban Card Label Link by ID
**As a** user  
**I want to** view details of a specific card-label link  
**So that** I can see which label is applied to which card

**Acceptance Criteria:**
- User can retrieve a single card-label link by ID
- Returns complete information including label details (name, color)
- Returns 404 if link not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardlabels/{id}`
- Returns: `Result<KanbanCardLabelResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: View Kanban Card Labels by Card ID
**As a** user with appropriate permissions  
**I want to** view all labels linked to a specific Kanban card  
**So that** I can understand the categorization of that task

**Acceptance Criteria:**
- User can retrieve all label links for a specific card
- Only non-deleted links are returned
- Results include label details (name, color)
- Only users with `ViewKanbanCardLabels` permission can access
- Empty list returned if card has no labels

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardlabels/card/{cardId}`
- Returns: `IEnumerable<KanbanCardLabelResponse>`
- Filters by `cardId` and `IsDeleted = false`

---

### US-004: Link Label to Kanban Card
**As a** user with appropriate permissions  
**I want to** attach a label to a Kanban card  
**So that** it can be categorized and easily filtered

**Acceptance Criteria:**
- User can link a label by providing: card ID and label ID
- System validates that the card exists and is not deleted
- System validates that the label exists and is not deleted
- System prevents duplicate links (same card + label combination)
- Only users with `CreateKanbanCardLabels` permission can add links
- Returns complete link information after creation

**Validation Rules:**
- KanbanCardId: Required, must be greater than 0, card must exist
- KanbanLabelId: Required, must be greater than 0, label must exist
- Unique constraint: No duplicate (CardId + LabelId) combinations

**Technical Notes:**
- Endpoint: `POST /api/v1/kanbancardlabels`
- Returns: `Result<KanbanCardLabelResponse>`
- Status Codes: 201 (Created), 404 (Card/Label Not Found), 409 (Duplicate)

---

### US-005: Update Kanban Card Label Link
**As a** user with appropriate permissions  
**I want to** update a card-label link  
**So that** I can correct or modify the relation if needed

**Acceptance Criteria:**
- User can update card ID and/or label ID
- System validates link exists
- System validates new card exists (if changed)
- System validates new label exists (if changed)
- System prevents duplicate links after update
- System logs all changes for audit purposes
- Only users with `EditKanbanCardLabels` permission can update
- Returns updated link information

**Validation Rules:**
- Same validation as Create operation
- Cannot create duplicate link through update
- Link ID must exist

**Technical Notes:**
- Endpoint: `PUT /api/v1/kanbancardlabels`
- Returns: `Result<KanbanCardLabelResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 409 (Duplicate)
- Change logging enabled via `IEntityChangeLogService`

---

### US-006: Remove Label from Kanban Card
**As a** user with appropriate permissions  
**I want to** remove a label from a Kanban card  
**So that** it no longer appears as categorized by that label

**Acceptance Criteria:**
- User can delete a link by ID
- System performs soft delete (sets IsDeleted = true)
- System records deletion metadata (who, when, from which PC)
- Deleted links are excluded from all queries
- Only users with `DeleteKanbanCardLabels` permission can delete
- Returns 404 if link not found

**Technical Notes:**
- Endpoint: `DELETE /api/v1/kanbancardlabels/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found)
- Soft delete implementation with audit fields

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbancardlabels | ViewKanbanCardLabels | Get all card-label links |
| GET | /api/v1/kanbancardlabels/{id} | - | Get card-label link by ID |
| GET | /api/v1/kanbancardlabels/card/{cardId} | ViewKanbanCardLabels | Get labels by card |
| POST | /api/v1/kanbancardlabels | CreateKanbanCardLabels | Link label to card |
| PUT | /api/v1/kanbancardlabels | EditKanbanCardLabels | Update link |
| DELETE | /api/v1/kanbancardlabels/{id} | DeleteKanbanCardLabels | Remove label from card |

---

## Data Models

### KanbanCardLabelRequest
```csharp
{
    "id": 0,
    "kanbanCardId": 1,
    "kanbanLabelId": 10
}
```

### KanbanCardLabelResponse
```csharp
{
    "id": 101,
    "kanbanCardId": 1,
    "kanbanLabelId": 10,
    "labelName": "High Priority",
    "colorHex": "#FF0000",
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": "2024-01-20T14:45:00Z",
    "isDeleted": false
}
```

---

## Business Rules

1. **Unique Label per Card**: The same label cannot be linked to a card more than once
2. **Valid References**: Card and Label must exist and not be deleted
3. **Multiple Labels**: A card can have multiple labels
4. **Reusable Labels**: A label can be used by many cards
5. **Soft Delete**: All deletions are soft deletes with audit trail
6. **Change Logging**: All updates are logged for audit purposes
7. **Cascade Behavior**: Restrict delete on foreign keys to prevent orphaned records

---

## Validation Rules

### KanbanCardId
- Required
- Must be greater than 0
- Card must exist in database
- Card must not be deleted

### KanbanLabelId
- Required
- Must be greater than 0
- Label must exist in database
- Label must not be deleted

### Uniqueness
- Combination of (KanbanCardId + KanbanLabelId) must be unique
- Enforced at database/index level and validated in application layer

---

## Error Scenarios

### 404 Not Found
- **KanbanCardLabelNotFound**: Link with specified ID doesn't exist

### 409 Conflict
- **KanbanCardLabelExists**: Label is already linked to this card

### 400 Bad Request
- **InvalidKanbanCard**: Card doesn't exist or is deleted
- **InvalidKanbanLabel**: Label doesn't exist or is deleted
- **GreaterThanZero**: IDs must be greater than 0
- **InvalidValues**: Provided IDs are invalid

---

## Database Schema

### Table: KanbanCardLabels

| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Identity |
| KanbanCardId | int | Foreign Key, Required |
| KanbanLabelId | int | Foreign Key, Required |
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
- Composite Index: (KanbanCardId, KanbanLabelId)
- Foreign Key Index: KanbanCardId
- Foreign Key Index: KanbanLabelId
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

### Relationships
- **KanbanCard**: Many-to-One (required)
- **KanbanLabel**: Many-to-One (required)

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records

---

## Testing Scenarios

### Positive Tests
1. Link label to card with valid data
2. Update link to different card
3. Update link to different label
4. View all links
5. View links by card
6. Remove link (soft delete)
7. Retrieve link by ID
8. Link multiple labels to the same card
9. Link the same label to multiple cards

### Negative Tests
1. Link label to non-existent card
2. Link non-existent label to card
3. Link duplicate (same card + label)
4. Update to create duplicate
5. Remove non-existent link
6. Access without proper permissions
7. Link label to deleted card
8. Link deleted label to card
9. Update with invalid IDs (0 or negative)

---

## Related Entities

- **KanbanCard**: Parent entity representing the card
- **KanbanLabel**: Label entity representing tag metadata
- **KanbanColumn**: Indirect relationship through KanbanCard
- **KanbanBoard**: Indirect relationship through KanbanCard and KanbanColumn

---

## Workflow Examples

### Applying Labels
1. User creates or selects a card
2. User attaches one or more labels (e.g., Priority, Type)
3. Labels appear on the card in the board view
4. Cards can be filtered by label

### Updating Labels
1. User reviews labels on card
2. User removes irrelevant label links
3. User adds new labels as needed
4. Changes are logged and reflected immediately

### Organizing by Label
1. Manager filters cards by label (e.g., High Priority)
2. Manager reviews workload and constraints
3. Manager updates labels to reflect current priorities

---

## Future Enhancements

1. **Bulk Labeling**: Apply labels to multiple cards at once
2. **Label Analytics**: Track label usage and trends
3. **Color Themes**: Validate color contrast and accessibility
4. **Label Groups**: Group related labels (e.g., Priority, Type)
5. **Label Suggestions**: Recommend labels based on content
6. **Custom Icons**: Support icons alongside color
7. **Board-level Filters**: Persist label filters per user

---

## Performance Considerations

1. **Indexing**: Proper indexes on foreign keys and composite combinations
2. **Pagination**: Implement pagination for large datasets
3. **Query Optimization**: Use projections to reduce data transfer
4. **AsNoTracking**: Use for read-only queries
5. **Caching**: Cache frequently used label metadata per board

---

## Permissions Required

### ViewKanbanCardLabels
- View all card-label links
- View labels for a specific card

### CreateKanbanCardLabels
- Link labels to cards

### EditKanbanCardLabels
- Update existing links

### DeleteKanbanCardLabels
- Remove labels from cards

---

## Business Value

1. **Categorization**: Organize cards by type, priority, and workflow
2. **Visual Clarity**: Provide quick visual cues via color-coded labels
3. **Filtering and Focus**: Enable filtering by labels to improve focus
4. **Consistency**: Enforce consistent tagging across projects
5. **Scalability**: Support many-to-many usage across cards and boards

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented