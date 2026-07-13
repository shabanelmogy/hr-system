# Entity Implementation Guide

This guide provides a step-by-step process for implementing a new entity in the HR Management System. Follow these 13 steps to ensure complete and consistent entity implementation.

---

## Step 01: Create Entity Table

**Location:** `backend\HrManagementSystem\Entities\BasicEntities\` or `ApplicationEntities\{Module}\`

**Purpose:** Define the entity class with its properties and relationships.

**Implementation:**
1. Create a new C# class file named `{EntityName}.cs`
2. Inherit from `AuditableEntity` base class
3. Define properties:
   - `Id` (int) - Primary key
   - Business properties (string, int, bool, DateTime, etc.)
   - Navigation properties (foreign keys and collections)

---

### Property Conventions

#### Bilingual Name Pattern
When an entity has a display name, always define **both** `NameAr` and `NameEn` instead of a single `Name` property:

```csharp
public string NameAr { get; set; } = string.Empty;
public string NameEn { get; set; } = string.Empty;
```

#### Required String Initialization
Use `string.Empty` for required strings. `null!` is also acceptable but `string.Empty` is preferred for consistency:

```csharp
public string NameEn { get; set; } = string.Empty;  // preferred
public string NameEn { get; set; } = null!;          // acceptable
```

#### Optional / Nullable Properties
Use `string?` (or any nullable type) for optional fields. Do **not** assign a default value:

```csharp
public string? Alpha2Code { get; set; }
public string? PhoneCode { get; set; }
public string? CurrencyCode { get; set; }
```

#### Navigation Collections
Use `virtual` on collection navigation properties when the entity is a parent referenced by child entities (supports lazy loading and EF proxies). Non-virtual is acceptable for leaf entities:

```csharp
// Parent entity — use virtual
public virtual ICollection<State> States { get; set; } = [];

// Leaf entity — non-virtual is fine
public ICollection<CategorySubcategory> CategorySubcategories { get; set; } = [];
```

#### Foreign Key + Navigation Reference (Child Entities)
Always declare both the FK scalar and the nullable navigation property:

```csharp
public int CountryId { get; set; }
public Country? Country { get; set; }
```

---

### Examples

**Entity with bilingual names, optional fields, and virtual collection (Country):**
```csharp
namespace HrManagementSystem.Entities.ApplicationEntities.GeographicDetails;

public class Country : AuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? Alpha2Code { get; set; }
    public string? Alpha3Code { get; set; }
    public string? PhoneCode { get; set; }
    public string? CurrencyCode { get; set; }
    public virtual ICollection<State> States { get; set; } = [];
}
```

**Child entity with FK + navigation reference (State):**
```csharp
namespace HrManagementSystem.Entities.ApplicationEntities.GeographicDetails;

public class State : AuditableEntity
{
    public int Id { get; set; }
    public string NameAr { get; set; } = null!;
    public string NameEn { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public int CountryId { get; set; }
    public Country? Country { get; set; }
    public virtual ICollection<District> Districts { get; set; } = [];
}
```

**Simple entity without bilingual names (KanbanBoard):**
```csharp
namespace HrManagementSystem.Entities.BasicEntities;

public class KanbanBoard : AuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? BackgroundColor { get; set; }
    public bool IsArchived { get; set; }
    public ICollection<KanbanColumn> Columns { get; set; } = [];
    public ICollection<KanbanBoardMember> Members { get; set; } = [];
    public ICollection<KanbanLabel> Labels { get; set; } = [];
    public ICollection<BoardTask> Tasks { get; set; } = [];
}
```

---

## Step 02: Add In ApplicationDbContext

**Location:** `backend\HrManagementSystem\Persistance\ApplicationDbContext.cs`

**Purpose:** Register the entity as a DbSet in the database context.

**Implementation:**
1. Open `ApplicationDbContext.cs`
2. Add a new `DbSet<EntityName>` property
3. Use plural naming convention

**Example:**
```csharp
public DbSet<KanbanBoard> KanbanBoards { get; set; }
```

---

## Step 03: Create Entity Configurations

**Location:** `backend\HrManagementSystem\Persistance\EntitiesConfigurations\`

**Purpose:** Configure entity properties, indexes, and relationships using Fluent API.

**Implementation:**
1. Create `{EntityName}Configuration.cs`
2. Implement `IEntityTypeConfiguration<EntityName>`
3. Configure:
   - Property constraints (MaxLength, IsRequired)
   - Unique indexes
   - Relationships (HasMany/WithOne)
   - Foreign keys

**Example (KanbanBoardConfiguration):**
```csharp
namespace HrManagementSystem.Persistance.EntitiesConfigurations;

public class KanbanBoardConfiguration : IEntityTypeConfiguration<KanbanBoard>
{
    public void Configure(EntityTypeBuilder<KanbanBoard> builder)
    {
        builder.HasIndex(x => x.Name).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);

        builder.HasMany(b => b.Columns)
               .WithOne(c => c.KanbanBoard)
               .HasForeignKey(c => c.KanbanBoardId);

        builder.HasMany(b => b.Members)
                .WithOne(m => m.KanbanBoard)
                .HasForeignKey(m => m.KanbanBoardId);

        builder.HasMany(b => b.Labels)
                .WithOne(l => l.KanbanBoard)
                .HasForeignKey(l => l.KanbanBoardId);

        builder.HasMany(b => b.Tasks)
                .WithOne(t => t.KanbanBoard)
                .HasForeignKey(t => t.KanbanBoardId);
    }
}
```

---

## Step 04: Create Response And Request

**Location:** `backend\HrManagementSystem\Contracts\BasicContracts\{EntityName}s\`

**Purpose:** Define DTOs for API communication.

**Implementation:**
1. Create folder `{EntityName}s` in Contracts
2. Create `{EntityName}Request.cs` - for Create/Update operations
3. Create `{EntityName}Response.cs` - for returning data
4. Create `Simple{EntityName}Response.cs` (optional) - for lightweight responses

**Example (KanbanBoardRequest.cs):**
```csharp
namespace HrManagementSystem.Contracts.BasicContracts.KanbanBoards
{
    public record KanbanBoardRequest(
        int Id,
        string Name,
        string Description
    );
}
```

**Example (KanbanBoardResponse.cs):**
```csharp
namespace HrManagementSystem.Contracts.BasicContracts.KanbanBoards
{
    public record KanbanBoardResponse(
        int Id,
        string Name,
        string? Description,
        bool IsArchived,
        DateTime CreatedOn,
        DateTime? UpdatedOn,
        bool IsDeleted,
        IEnumerable<KanbanColumnResponse> Columns,
        IEnumerable<KanbanLabelResponse> Labels,
        IEnumerable<KanbanBoardMemberResponse> Members,
        IEnumerable<BoardTaskResponse> Tasks
    );
}
```

---

## Step 05: Create Validator

**Location:** `backend\HrManagementSystem\Contracts\BasicContracts\{EntityName}s\`

**Purpose:** Validate request data using FluentValidation.

**Implementation:**
1. Create `{EntityName}RequestValidator.cs`
2. Inherit from `AbstractValidator<EntityNameRequest>`
3. Inject dependencies (DbContext, IStringLocalizer)
4. Define validation rules:
   - Required fields
   - Length constraints
   - Custom business rules (e.g., duplicate checks)
5. Use localized error messages

**Example (KanbanBoardRequestValidator.cs):**
```csharp
namespace HrManagementSystem.Contracts.BasicContracts.KanbanBoards
{
    public class KanbanBoardRequestValidator : AbstractValidator<KanbanBoardRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<KanbanBoardRequest> _localizer;

        public KanbanBoardRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<KanbanBoardRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(c => c.Name)
                .Trimmed()
                .NotEmpty()
                .Length(3, 100)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(c => c)
             .Must(c => !IsNameDuplicated(c))
             .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(c => c.Description)
                .Trimmed()
                .NotEmpty()
                .Length(3, 500)
                .WithMessage(_localizer[Strings.MaxLengthError]);
        }

        private bool IsNameDuplicated(KanbanBoardRequest board)
        {
            return _dbContext.KanbanBoards.Any(c => c.Name == board.Name && c.Id != board.Id);
        }
    }
}
```

---

## Step 06: Create Errors Class

**Location:** `backend\HrManagementSystem\Errors\EntitiesErrors\`

**Purpose:** Define domain-specific error messages.

**Implementation:**
1. Create `{EntityName}Errors.cs`
2. Inject `IStringLocalizer<EntityNameErrors>`
3. Define error properties using `Error` record
4. Include error code, localized message, and HTTP status code

**Example (KanbanBoardErrors.cs):**
```csharp
namespace HrManagementSystem.Errors.EntitiesErrors
{
    public class KanbanBoardErrors(IStringLocalizer<KanbanBoardErrors> localizer)
    {
        public IStringLocalizer<KanbanBoardErrors> _localizer = localizer;

        public Error KanbanBoardNotFound =>
            new("KanbanBoard.NotFound", _localizer[nameof(KanbanBoardNotFound)], StatusCodes.Status404NotFound);

        public Error KanbanBoardExists =>
            new("KanbanBoard.Duplicated", _localizer[nameof(KanbanBoardExists)], StatusCodes.Status409Conflict);

        public Error KanbanBoardHasColumns =>
            new("KanbanBoard.HasColumns", _localizer[nameof(KanbanBoardHasColumns)], StatusCodes.Status400BadRequest);
    }
}
```

---

## Step 07: Translate Keys In JSON Files

**Location:** `backend\HrManagementSystem\Localization\Resources\`

**Purpose:** Provide localized error messages in multiple languages.

**Implementation:**
1. Open `en-US.json` and add English translations
2. Open `ar-EG.json` and add Arabic translations
3. Use the same keys as defined in the Errors class

**Example (en-US.json):**
```json
{
    "KanbanBoardNotFound": "The Kanban board was not found.",
    "KanbanBoardExists": "A Kanban board with this name already exists.",
    "KanbanBoardHasColumns": "Cannot delete Kanban board because it has associated columns."
}
```

**Example (ar-EG.json):**
```json
{
    "KanbanBoardNotFound": "لوحة كانبان غير موجودة.",
    "KanbanBoardExists": "لوحة كانبان بهذا الاسم موجودة بالفعل.",
    "KanbanBoardHasColumns": "لا يمكن حذف لوحة كانبان لوجود قوائم مرتبطة."
}
```

---

## Step 08: Add Keys In Strings File

**Location:** `backend\HrManagementSystem\Consts\Strings.cs`

**Purpose:** Define reusable validation message keys.

**Implementation:**
1. Open `Strings.cs`
2. Add new constants if needed (most common ones already exist)
3. Use `nameof()` pattern for type safety

**Common Keys:**
- `Required`
- `MaxLengthError`
- `DuplicatedValue`
- `GreaterThanZero`
- `InvalidValues`

**Note:** Usually no changes needed as common validation keys already exist.

---

## Step 09: Create Interface

**Location:** `backend\HrManagementSystem\Services\BasicServices\{EntityName}sService\`

**Purpose:** Define the service contract.

**Implementation:**
1. Create folder `{EntityName}sService`
2. Create `I{EntityName}Service.cs`
3. Define CRUD methods:
   - `GetAllAsync()` - Returns IEnumerable
   - `GetAsync(int id)` - Returns Result<Response>
   - `AddAsync(Request)` - Returns Result<Response>
   - `UpdateAsync(Request)` - Returns Result<Response>
   - `ToggleAsync(int id)` - Returns Result (soft delete)

**Example (IKanbanBoardService.cs):**
```csharp
using HrManagementSystem.Contracts.BasicContracts.KanbanBoards;

namespace HrManagementSystem.Services.BasicServices.KanbanBoardsService;

public interface IKanbanBoardService
{
    Task<IEnumerable<KanbanBoardResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<Result<KanbanBoardResponse>> GetAsync(int id, CancellationToken cancellationToken);
    Task<Result<KanbanBoardResponse>> AddAsync(KanbanBoardRequest request, CancellationToken cancellationToken = default);
    Task<Result<KanbanBoardResponse>> UpdateAsync(KanbanBoardRequest request, CancellationToken cancellationToken = default);
    Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
}
```

---

## Step 10: Create Service

**Location:** `backend\HrManagementSystem\Services\BasicServices\{EntityName}sService\`

**Purpose:** Implement business logic and data access.

**Implementation:**
1. Create `{EntityName}Service.cs`
2. Implement the interface
3. Inject dependencies:
   - `IMapper`
   - `ApplicationDbContext`
   - `IEntityChangeLogService`
   - `IHttpContextAccessor`
   - `{EntityName}Errors`
4. Implement methods:
   - Use `AsNoTracking()` for read operations
   - Filter by `!IsDeleted`
   - Use projections for responses
   - Log changes in Update operations
   - Implement soft delete in Toggle

**Example (KanbanBoardService.cs):**
```csharp
using HrManagementSystem.Contracts.BasicContracts.KanbanBoards;

namespace HrManagementSystem.Services.BasicServices.KanbanBoardsService;

public class KanbanBoardService(
    IMapper mapper,
    ApplicationDbContext context,
    IEntityChangeLogService entityChangeLogService,
    IHttpContextAccessor httpContextAccessor,
    KanbanBoardErrors kanbanBoardErrors) : IKanbanBoardService
{
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationDbContext _context = context;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly KanbanBoardErrors _kanbanBoardErrors = kanbanBoardErrors;

    public async Task<IEnumerable<KanbanBoardResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.KanbanBoards
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Select(c => new KanbanBoardResponse(
                c.Id,
                c.Name,                   
                c.Description,
                c.IsArchived,
                c.CreatedOn,
                c.UpdatedOn,
                c.IsDeleted,
                // Include related entities...
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<Result<KanbanBoardResponse>> GetAsync(int id, CancellationToken cancellationToken)
    {
        var board = await _context.KanbanBoards
            .AsNoTracking()
            .Where(c => c.Id == id && !c.IsDeleted)
            .Select(c => new KanbanBoardResponse(/* ... */))
            .FirstOrDefaultAsync(cancellationToken);

        if (board is null)
            return Result.Failure<KanbanBoardResponse>(_kanbanBoardErrors.KanbanBoardNotFound);

        return Result.Success(board);
    }

    public async Task<Result<KanbanBoardResponse>> AddAsync(KanbanBoardRequest request, CancellationToken cancellationToken = default)
    {
        var newBoard = _mapper.Map<KanbanBoard>(request);
        await _context.KanbanBoards.AddAsync(newBoard, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        var response = _mapper.Map<KanbanBoardResponse>(newBoard);
        return Result.Success(response);
    }

    public async Task<Result<KanbanBoardResponse>> UpdateAsync(KanbanBoardRequest request, CancellationToken cancellationToken = default)
    {
        var current = await _context.KanbanBoards
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (current == null)
            return Result.Failure<KanbanBoardResponse>(_kanbanBoardErrors.KanbanBoardNotFound);

        var updated = _mapper.Map<KanbanBoard>(request);
        await _entityChangeLogService.CreateChangeLogAsync(request.Id, current, updated);

        _mapper.Map(request, current);
        _context.Update(current);
        await _context.SaveChangesAsync(cancellationToken);

        var response = await _context.KanbanBoards
            .Where(c => c.Id == updated.Id)
            .Select(c => _mapper.Map<KanbanBoardResponse>(c))
            .FirstOrDefaultAsync(cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var board = await _context.KanbanBoards
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (board == null)
            return Result.Failure(_kanbanBoardErrors.KanbanBoardNotFound);

        // Add business validation if needed
        board.IsDeleted = !board.IsDeleted;
        board.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId();
        board.DeletedOn = DateTime.UtcNow;
        board.DeletedByPc = Environment.MachineName;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
```

**Register Service:**
Add to `backend\HrManagementSystem\Dependencies\EntitiesService.cs`:
```csharp
services.AddScoped<IKanbanBoardService, KanbanBoardService>();
```

**Register Errors:**
Add to `backend\HrManagementSystem\Dependencies\ErrorsService.cs`:
```csharp
service.AddScoped<KanbanBoardErrors>();
```

---

## Step 11: Create Permissions

**Location:** `backend\HrManagementSystem\Consts\Permissions.cs`

**Purpose:** Define authorization permissions for the entity.

**Implementation:**
1. Open `Permissions.cs`
2. Add four permission constants:
   - `View{EntityName}s`
   - `Create{EntityName}s`
   - `Edit{EntityName}s`
   - `Delete{EntityName}s`
3. Use format: `"{EntityName}s:{Action}"`

**Example:**
```csharp
public const string ViewKanbanBoards = "KanbanBoards:View";
public const string CreateKanbanBoards = "KanbanBoards:Create";
public const string EditKanbanBoards = "KanbanBoards:Edit";
public const string DeleteKanbanBoards = "KanbanBoards:Delete";
```

---

## Step 12: Create Controller

**Location:** `backend\HrManagementSystem\Controllers\V1\`

**Purpose:** Expose REST API endpoints.

**Implementation:**
1. Create `{EntityName}sController.cs`
2. Add attributes:
   - `[ApiVersion("1.0")]`
   - `[Route(ApiRoutes.BaseRoute)]`
   - `[ApiController]`
   - `[Authorize]`
3. Inject service via constructor
4. Implement endpoints:
   - `GET` - GetAll (with permission)
   - `GET {id}` - GetById
   - `POST` - Add (with permission)
   - `PUT` - Update (with permission)
   - `DELETE {id}` - Delete (with permission)
5. Use `[HasPermission]` attribute for protected endpoints
6. Return appropriate status codes

**Example (KanbanBoardsController.cs):**
```csharp
using HrManagementSystem.Contracts.BasicContracts.KanbanBoards;
using HrManagementSystem.Services.BasicServices.KanbanBoardsService;

namespace HrManagementSystem.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class KanbanBoardsController(IKanbanBoardService service) : ControllerBase
{
    private readonly IKanbanBoardService _service = service;

    [HttpGet]
    [HasPermission(Permissions.ViewKanbanBoards)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var boards = await _service.GetAllAsync(cancellationToken);
        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _service.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateKanbanBoards)]
    public async Task<IActionResult> Add([FromBody] KanbanBoardRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.AddAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditKanbanBoards)]
    public async Task<IActionResult> Update([FromBody] KanbanBoardRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);
        return result.IsSuccess
           ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
           : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteKanbanBoards)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _service.ToggleAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
```

---

## Step 13: Create User Story

**Location:** `backend\HrManagementSystem\Docs\User Stories\{Module}\`

**Purpose:** Document requirements and acceptance criteria.

**Implementation:**
1. Create folder for the module if it doesn't exist
2. Create `{EntityName}_UserStory.md`
3. Include:
   - Feature overview
   - User stories with acceptance criteria
   - API endpoints
   - Business rules
   - Validation rules
   - Error scenarios

**Example Structure:**
```markdown
# Kanban Board Management - User Story

## Feature Overview
Manage Kanban boards for project management and task tracking.

## User Stories

### US-001: View Kanban Boards
**As a** user
**I want to** view all Kanban boards
**So that** I can see available boards

**Acceptance Criteria:**
- User can see list of all non-deleted boards
- Each board shows: name, description, status
- Only users with ViewKanbanBoards permission can access

### US-002: Create Kanban Board
**As a** user
**I want to** create a new Kanban board
**So that** I can organize tasks

**Acceptance Criteria:**
- User can provide: name (required, 3-100 chars), description (required, 3-500 chars)
- System validates uniqueness of board name
- Only users with CreateKanbanBoards permission can create

### US-003: Update Kanban Board
**As a** user
**I want to** update an existing board
**So that** I can modify board details

**Acceptance Criteria:**
- User can update name and description
- System logs all changes
- Only users with EditKanbanBoards permission can update

### US-004: Delete Kanban Board
**As a** user
**I want to** delete a board
**So that** I can remove unused boards

**Acceptance Criteria:**
- System performs soft delete
- Cannot delete if board has active columns
- Only users with DeleteKanbanBoards permission can delete

## API Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbanboards | ViewKanbanBoards | Get all boards |
| GET | /api/v1/kanbanboards/{id} | - | Get board by ID |
| POST | /api/v1/kanbanboards | CreateKanbanBoards | Create new board |
| PUT | /api/v1/kanbanboards | EditKanbanBoards | Update board |
| DELETE | /api/v1/kanbanboards/{id} | DeleteKanbanBoards | Delete board |

## Business Rules
1. Board names must be unique
2. Cannot delete board with active columns
3. All operations use soft delete
4. Changes are logged for audit

## Validation Rules
- Name: Required, 3-100 characters
- Description: Required, 3-500 characters

## Error Scenarios
- 404: Board not found
- 409: Board name already exists
- 400: Board has active columns (cannot delete)
```

---

## Checklist

Use this checklist to ensure all steps are completed:

- [ ] Step 01: Entity table created (bilingual names, nullable optionals, virtual collections where needed)
- [ ] Step 02: DbSet added to ApplicationDbContext
- [ ] Step 03: Entity configuration created
- [ ] Step 04: Request and Response DTOs created
- [ ] Step 05: Validator created
- [ ] Step 06: Errors class created
- [ ] Step 07: Translations added to JSON files
- [ ] Step 08: String keys verified/added
- [ ] Step 09: Service interface created
- [ ] Step 10: Service implementation created and registered
- [ ] Step 11: Permissions defined
- [ ] Step 12: Controller created
- [ ] Step 13: User story documented

---

## Notes

- Always use soft delete (IsDeleted flag)
- Include audit fields from AuditableEntity
- Use Result pattern for error handling
- Apply localization for all user-facing messages
- Follow naming conventions (plural for collections, controllers)
- Use CancellationToken for async operations
- Apply AsNoTracking() for read-only queries
- Log entity changes in Update operations
- Use projection in queries for better performance
- Use `NameAr` + `NameEn` for any entity with a display name (not a single `Name`)
- Use `virtual` on collection navigation properties for parent entities
- Use `string?` for optional properties; `string.Empty` (preferred) or `null!` for required strings
- Always declare both FK scalar and nullable navigation reference on child entities

---

## Common Patterns

### Soft Delete Pattern
```csharp
entity.IsDeleted = !entity.IsDeleted;
entity.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId();
entity.DeletedOn = DateTime.UtcNow;
entity.DeletedByPc = Environment.MachineName;
```

### Query Pattern
```csharp
await _context.Entities
    .AsNoTracking()
    .Where(e => !e.IsDeleted)
    .Select(e => new EntityResponse(/* ... */))
    .ToListAsync(cancellationToken);
```

### Result Pattern
```csharp
if (entity is null)
    return Result.Failure<EntityResponse>(_errors.EntityNotFound);

return Result.Success(response);
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team
