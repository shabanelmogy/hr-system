# Kanban Card Attachment Management - User Story

## Feature Overview
Manage file attachments for Kanban cards. This feature allows users to attach files to cards for documentation, reference materials, images, or any other relevant files. Each card can have multiple attachments, and attachments are linked to uploaded files in the system.

---

## User Stories

### US-001: View All Kanban Card Attachments
**As a** user with appropriate permissions  
**I want to** view all Kanban card attachments across all cards  
**So that** I can see all files attached to tasks

**Acceptance Criteria:**
- User can see a list of all non-deleted card attachments
- Each attachment shows: card title, file name, file URL, file size, content type, upload date
- Only users with `ViewKanbanCardAttachments` permission can access
- Deleted attachments are excluded from the list
- Results include related card and file information

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardattachments`
- Returns: `IEnumerable<KanbanCardAttachmentResponse>`
- Includes navigation properties for Card and UploadedFile

---

### US-002: View Kanban Card Attachment by ID
**As a** user  
**I want to** view details of a specific card attachment  
**So that** I can see complete attachment information

**Acceptance Criteria:**
- User can retrieve a single card attachment by ID
- Returns complete attachment information including card and file details
- Returns 404 if attachment not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardattachments/{id}`
- Returns: `Result<KanbanCardAttachmentResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: View Attachments by Card ID
**As a** user with appropriate permissions  
**I want to** view all attachments of a specific Kanban card  
**So that** I can see all files related to that task

**Acceptance Criteria:**
- User can retrieve all attachments for a specific card
- Only non-deleted attachments are returned
- Results include file details
- Attachments are ordered by creation date (newest first)
- Only users with `ViewKanbanCardAttachments` permission can access
- Empty list returned if card has no attachments

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardattachments/card/{cardId}`
- Returns: `IEnumerable<KanbanCardAttachmentResponse>`
- Filters by card ID and IsDeleted = false
- Ordered by CreatedOn descending

---

### US-004: Attach File to Kanban Card
**As a** user with appropriate permissions  
**I want to** attach a file to a Kanban card  
**So that** I can provide supporting documentation or resources

**Acceptance Criteria:**
- User can attach a file by providing: card ID and uploaded file ID
- System validates that the card exists and is not deleted
- System validates that the file exists and is not deleted
- System prevents duplicate attachments (same file + card combination)
- Only users with `CreateKanbanCardAttachments` permission can attach files
- Returns complete attachment information after creation

**Validation Rules:**
- KanbanCardId: Required, must be greater than 0, card must exist
- UploadedFileId: Required, must be greater than 0, file must exist
- Unique constraint: No duplicate (CardId + FileId) combinations

**Technical Notes:**
- Endpoint: `POST /api/v1/kanbancardattachments`
- Returns: `Result<KanbanCardAttachmentResponse>`
- Status Codes: 201 (Created), 404 (Card/File Not Found), 409 (Duplicate)

---

### US-005: Update Kanban Card Attachment
**As a** user with appropriate permissions  
**I want to** update a card attachment's assignment  
**So that** I can reassign files to different cards

**Acceptance Criteria:**
- User can update card ID or file ID
- System validates attachment exists
- System validates new card exists (if changed)
- System validates new file exists (if changed)
- System prevents duplicate attachments after update
- System logs all changes for audit purposes
- Only users with `EditKanbanCardAttachments` permission can update
- Returns updated attachment information

**Validation Rules:**
- Same validation as Attach operation
- Cannot create duplicate attachment through update
- Attachment ID must exist

**Technical Notes:**
- Endpoint: `PUT /api/v1/kanbancardattachments`
- Returns: `Result<KanbanCardAttachmentResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 409 (Duplicate)
- Change logging enabled via IEntityChangeLogService

---

### US-006: Remove Attachment from Kanban Card
**As a** user with appropriate permissions  
**I want to** remove an attachment from a Kanban card  
**So that** outdated or incorrect files are no longer associated with the task

**Acceptance Criteria:**
- User can delete a card attachment by ID
- System performs soft delete (sets IsDeleted = true)
- System records deletion metadata (who, when, from which PC)
- Deleted attachments are excluded from all queries
- File itself is not deleted, only the attachment link
- Only users with `DeleteKanbanCardAttachments` permission can delete
- Returns 404 if attachment not found

**Technical Notes:**
- Endpoint: `DELETE /api/v1/kanbancardattachments/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found)
- Soft delete implementation with audit fields

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbancardattachments | ViewKanbanCardAttachments | Get all card attachments |
| GET | /api/v1/kanbancardattachments/{id} | - | Get attachment by ID |
| GET | /api/v1/kanbancardattachments/card/{cardId} | ViewKanbanCardAttachments | Get attachments by card |
| POST | /api/v1/kanbancardattachments | CreateKanbanCardAttachments | Attach file to card |
| PUT | /api/v1/kanbancardattachments | EditKanbanCardAttachments | Update attachment |
| DELETE | /api/v1/kanbancardattachments/{id} | DeleteKanbanCardAttachments | Remove attachment |

---

## Data Models

### KanbanCardAttachmentRequest
```csharp
{
    "id": 0,
    "kanbanCardId": 1,
    "uploadedFileId": 5
}
```

### KanbanCardAttachmentResponse
```csharp
{
    "id": 1,
    "kanbanCardId": 1,
    "kanbanCardTitle": "Implement user authentication",
    "uploadedFileId": 5,
    "fileName": "authentication-diagram.png",
    "fileUrl": "/uploads/files/authentication-diagram.png",
    "fileSize": 245678,
    "contentType": "image/png",
    "uploadedOn": "2024-01-15T10:30:00Z",
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": null,
    "isDeleted": false
}
```

### SimpleKanbanCardAttachmentResponse
```csharp
{
    "id": 1,
    "fileName": "authentication-diagram.png",
    "fileUrl": "/uploads/files/authentication-diagram.png",
    "uploadedOn": "2024-01-15T10:30:00Z"
}
```

---

## Business Rules

1. **Unique Attachment**: Each file can only be attached to a card once
2. **Valid References**: Card and File must exist and not be deleted
3. **Multiple Attachments**: A card can have multiple file attachments
4. **File Reuse**: Same file can be attached to multiple different cards
5. **Soft Delete**: All deletions are soft deletes with audit trail
6. **Change Logging**: All updates are logged for audit purposes
7. **Cascade Behavior**: Restrict delete on foreign keys to prevent orphaned records
8. **File Preservation**: Deleting attachment doesn't delete the actual file

---

## Validation Rules

### KanbanCardId
- Required
- Must be greater than 0
- Card must exist in database
- Card must not be deleted

### UploadedFileId
- Required
- Must be greater than 0
- File must exist in database
- File must not be deleted

### Uniqueness
- Combination of (KanbanCardId + UploadedFileId) must be unique
- Enforced at database level with composite unique index
- Validated in application layer before save

---

## Error Scenarios

### 404 Not Found
- **KanbanCardAttachmentNotFound**: Attachment with specified ID doesn't exist
- **InvalidKanbanCard**: Referenced card doesn't exist or is deleted
- **InvalidFile**: Referenced file doesn't exist or is deleted

### 409 Conflict
- **KanbanCardAttachmentExists**: File is already attached to this card

### 400 Bad Request
- **GreaterThanZero**: Card ID or File ID must be greater than 0
- **Required**: Required field is missing
- **InvalidValues**: Card or file doesn't exist

---

## Database Schema

### Table: KanbanCardAttachments

| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Identity |
| KanbanCardId | int | Foreign Key, Required |
| UploadedFileId | int | Foreign Key, Required |
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
- Unique Index: (KanbanCardId, UploadedFileId) where IsDeleted = false
- Foreign Key Index: KanbanCardId
- Foreign Key Index: UploadedFileId
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

### Relationships
- **KanbanCard**: Many-to-One (required)
- **UploadedFile**: Many-to-One (required)

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records
7. **File Access Control**: Verify user has access to card before viewing attachments
8. **File Type Validation**: Validate file types through UploadedFile entity
9. **File Size Limits**: Enforce file size limits through UploadedFile entity

---

## Testing Scenarios

### Positive Tests
1. Attach file to card with valid data
2. Update attachment to different card
3. Update attachment to different file
4. View all attachments
5. View attachments by card
6. Remove attachment (soft delete)
7. Retrieve attachment by ID
8. Attach multiple files to same card
9. Attach same file to multiple cards

### Negative Tests
1. Attach file to non-existent card
2. Attach non-existent file to card
3. Attach duplicate (same file + card)
4. Update to create duplicate
5. Remove non-existent attachment
6. Access without proper permissions
7. Attach file to deleted card
8. Attach deleted file to card
9. Update with invalid card ID (0 or negative)
10. Update with invalid file ID (0 or negative)

---

## Related Entities

- **KanbanCard**: Parent entity representing the card
- **UploadedFile**: File entity representing the attached file
- **KanbanColumn**: Indirect relationship through KanbanCard
- **KanbanBoard**: Indirect relationship through KanbanCard and KanbanColumn

---

## Workflow Examples

### Attaching Documentation
1. User uploads a file (creates UploadedFile)
2. User attaches file to a card
3. File appears in card's attachment list
4. Team members can view and download the file
5. File provides context for the task

### Managing Attachments
1. User views card attachments
2. User identifies outdated attachment
3. User removes old attachment
4. User uploads new version of file
5. User attaches new file to card

### Sharing Resources
1. User uploads a shared resource file
2. User attaches file to multiple related cards
3. All cards reference the same file
4. Updates to file are reflected across all cards
5. Efficient storage with file reuse

---

## Future Enhancements

1. **Attachment Previews**: Generate thumbnails for images and documents
2. **Inline Viewing**: View attachments without downloading
3. **Version Control**: Track file versions and changes
4. **Attachment Comments**: Add comments to specific attachments
5. **Bulk Attach**: Attach multiple files at once
6. **Attachment Categories**: Categorize attachments by type
7. **Attachment Search**: Search within attachment content
8. **Attachment Notifications**: Notify when attachments are added/removed
9. **Attachment Analytics**: Track attachment usage and downloads
10. **Attachment Permissions**: Granular permissions per attachment
11. **Attachment Expiry**: Set expiration dates for attachments
12. **Attachment Encryption**: Encrypt sensitive attachments
13. **Attachment Watermarks**: Add watermarks to documents
14. **Attachment Conversion**: Convert files to different formats
15. **Attachment Integration**: Integrate with cloud storage services

---

## Performance Considerations

1. **Indexing**: Proper indexes on foreign keys and composite unique constraint
2. **Pagination**: Implement pagination for large attachment lists
3. **Lazy Loading**: Load file details only when needed
4. **Caching**: Cache frequently accessed attachment metadata
5. **Query Optimization**: Use projections to reduce data transfer
6. **Eager Loading**: Use Include() for related entities when needed
7. **AsNoTracking**: Use for read-only queries
8. **File Streaming**: Stream large files instead of loading into memory

---

## Integration Points

### With Other Modules
1. **File Management**: Attachments use the UploadedFile system
2. **Notification System**: Send notifications for attachment changes
3. **Activity Log**: Track all attachment activities
4. **Search**: Index attachment metadata for search
5. **Reporting**: Include attachments in reports

### External Systems
1. **Cloud Storage**: Store files in cloud storage (S3, Azure Blob)
2. **CDN**: Serve files through CDN for better performance
3. **Virus Scanning**: Scan uploaded files for malware
4. **Document Processing**: Extract text from documents for search
5. **Image Processing**: Generate thumbnails and optimize images

---

## Accessibility Considerations

1. **Keyboard Navigation**: Full keyboard support for attachment operations
2. **Screen Reader Support**: Proper ARIA labels for attachment information
3. **File Type Indicators**: Clear indicators for different file types
4. **Download Links**: Accessible download links with descriptive text
5. **Alternative Text**: Provide alt text for image attachments

---

## Localization Support

All error messages and UI text support multiple languages:
- English (en-US)
- Arabic (ar-EG)

Error messages are stored in localization JSON files and retrieved based on user's language preference.

---

## Audit Trail

All attachment operations are logged with:
- User who performed the action
- Timestamp of the action
- PC/Machine name
- Type of operation (Create, Update, Delete)
- Before and after values (for updates)

---

## Best Practices

1. **Descriptive Names**: Use clear, descriptive file names
2. **File Organization**: Organize files logically by type or purpose
3. **Size Management**: Keep file sizes reasonable for performance
4. **Regular Cleanup**: Remove outdated or unnecessary attachments
5. **Version Control**: Use naming conventions for file versions
6. **Security**: Don't attach sensitive information without encryption
7. **Accessibility**: Ensure files are accessible to all team members
8. **Documentation**: Use attachments to document decisions and requirements

---

## Permissions Required

### ViewKanbanCardAttachments
- View all card attachments
- View attachments by card

### CreateKanbanCardAttachments
- Attach files to cards

### EditKanbanCardAttachments
- Update card attachments
- Reassign attachments

### DeleteKanbanCardAttachments
- Remove attachments from cards

---

## Business Value

1. **Documentation**: Centralize task-related documentation
2. **Context**: Provide visual and written context for tasks
3. **Collaboration**: Share resources among team members
4. **Reference**: Keep reference materials accessible
5. **Transparency**: Make information visible to all stakeholders
6. **Efficiency**: Reduce time searching for related files
7. **Compliance**: Maintain audit trail of attached documents

---

## File Type Support

Common file types that can be attached:
- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Images**: JPG, PNG, GIF, SVG, WEBP
- **Spreadsheets**: XLS, XLSX, CSV
- **Presentations**: PPT, PPTX
- **Archives**: ZIP, RAR, 7Z
- **Code**: Various source code files
- **Other**: As configured in UploadedFile system

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented
