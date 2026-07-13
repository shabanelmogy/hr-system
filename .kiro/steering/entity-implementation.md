# Entity Implementation Guide (HrManagementSystem)

When building a new entity in the HR Management System, follow these 15 steps in order. Use `Country` as the reference example throughout.

---

## Project Conventions

- Soft delete only — never hard delete. Use `IsDeleted` flag.
- All entities inherit from `AuditableEntity`.
- Use the **Result pattern** for error handling in services.
- Use **FluentValidation** for request validation.
- All user-facing messages must be **localized** (en-US and ar-EG).
- Use `AsNoTracking()` for all read-only queries.
- Use **projections** (`Select(...)`) in queries for performance.
- Always pass and forward `CancellationToken` in async methods.
- Log entity changes in every `UpdateAsync` via `IEntityChangeLogService`.
- Bilingual name properties: use `NameAr` + `NameEn` instead of a single `Name` when the entity has a display name.
- Use `virtual` on collection navigation properties for entities referenced by child entities.
- Use `string?` for optional string properties; `string.Empty` or `null!` for required strings.

---

## Step 01 — Entity Class

**Location:** `Entities/BasicEntities/` or `Entities/ApplicationEntities/{Module}/`

- File: `{EntityName}.cs`
- Inherit from `AuditableEntity`
- Define `Id` (int), business properties, and navigation properties

**Bilingual name pattern:** When an entity has a display name, always define both `NameAr` and `NameEn` instead of a single `Name` property:

```csharp
public string NameAr { get; set; } = string.Empty;
public string NameEn { get; set; } = string.Empty;
```

**String initialization:** Use `string.Empty` for required strings, `null!` is also acceptable for required strings but `string.Empty` is preferred for consistency.

**Nullable optional properties:** Use `string?` (or other nullable types) for optional fields:

```csharp
public string? Alpha2Code { get; set; }
public string? PhoneCode { get; set; }
```

**Navigation collections:** Use `virtual` on collection navigation properties when the entity is expected to support lazy loading or is referenced by child entities:

```csharp
public virtual ICollection<ChildEntity> Children { get; set; } = [];
```

Non-virtual is also acceptable for collections that don't require lazy loading:

```csharp
public ICollection<ChildEntity> Children { get; set; } = [];
```

**Foreign key + navigation reference pattern** (for child entities):

```csharp
public int ParentId { get; set; }
public ParentEntity? Parent { get; set; }
```

**Example (Country) — `Entities/ApplicationEntities/GeographicDetails/Country.cs`:**

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

---

## Step 02 — Register DbSet

**Location:** `Persistance/ApplicationDbContext.cs`

Add a plural `DbSet<T>` property:

```csharp
public DbSet<Country> Countries { get; set; }
```

---

## Step 03 — Entity Configuration

**Location:** `Persistance/EntitiesConfigurations/{EntityName}Configuration.cs`

- Implement `IEntityTypeConfiguration<T>`
- Configure `MaxLength`, `IsRequired`, unique indexes, and relationships
- Use `.IsRequired(true)` on `HasForeignKey` for mandatory relationships

**Example (`CountryConfiguration.cs`):**

```csharp
namespace HrManagementSystem.Persistance.EntitiesConfigurations;

public class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        // Indexes
        builder.HasIndex(c => c.NameAr).IsUnique();
        builder.HasIndex(c => c.NameEn).IsUnique();
        builder.HasIndex(c => c.Alpha2Code).IsUnique();
        builder.HasIndex(c => c.Alpha3Code).IsUnique();

        // Properties
        builder.Property(c => c.NameEn).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Alpha2Code).HasMaxLength(2);
        builder.Property(c => c.Alpha3Code).HasMaxLength(3);
        builder.Property(c => c.PhoneCode).HasMaxLength(10);
        builder.Property(c => c.CurrencyCode).HasMaxLength(3);

        // Relationships
        builder.HasMany(c => c.States)
               .WithOne(s => s.Country)
               .HasForeignKey(s => s.CountryId)
               .IsRequired(true);
    }
}
```

---

## Step 04 — Contracts (DTOs)

**Location:** `Contracts/{EntityName}s/`

> Note: Geographic and application entities use a flat `Contracts/{EntityName}s/` folder. Basic entities use `Contracts/BasicContracts/{EntityName}s/`. Match the pattern of the module you're working in.

Create:
- `{EntityName}Request.cs` — used for both Create and Update (include `Id`, send `0` for new records)
- `{EntityName}Response.cs` — full response including audit fields
- `Simple{EntityName}Response.cs` — lightweight response for nested use (optional)

Use `record` types. Mirror nullable/non-nullable from the entity.

**Example (`CountryRequest.cs`):**

```csharp
namespace HrManagementSystem.Contracts.Countries;

public record CountryRequest(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode
);
```

**Example (`CountryResponse.cs`):**

```csharp
using HrManagementSystem.Contracts.States;

namespace HrManagementSystem.Contracts.Countries;

public record CountryResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Alpha2Code,
    string Alpha3Code,
    string PhoneCode,
    string CurrencyCode,
    List<SimpleStateResponse> States,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);
```

---

## Step 05 — Validator

**Location:** `Contracts/{EntityName}s/{EntityName}RequestValidator.cs`

- Inherit `AbstractValidator<{EntityName}Request>`
- Inject `ApplicationDbContext` and `IStringLocalizer`
- Validate each required field with `.NotEmpty()` + `.Length()` + `.WithName()` for field-level error messages
- Validate optional fields with `.When(c => !string.IsNullOrEmpty(c.Field))` guard
- Add a separate duplicate-check rule per unique field using `.Must(...)`

**Example (`CountryRequestValidator.cs`):**

```csharp
namespace HrManagementSystem.Contracts.Countries;

public class CountryRequestValidator : AbstractValidator<CountryRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<CountryRequest> _localizer;

    public CountryRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<CountryRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(c => c.NameEn)
            .Trimmed().NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(c => c.NameAr)
            .Trimmed().NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        // Optional field — only validate when provided
        RuleFor(c => c.Alpha2Code)
            .Length(2, 2)
            .When(c => !string.IsNullOrEmpty(c.Alpha2Code))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(c => c.Alpha3Code)
            .Length(3, 3)
            .When(c => !string.IsNullOrEmpty(c.Alpha3Code))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError]);

        // Duplicate checks — one rule per unique field
        RuleFor(c => c)
            .Must(c => !IsNameEnDuplicated(c))
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(c => c)
            .Must(c => !IsNameArDuplicated(c))
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(c => c)
            .Must(c => !IsAlpha2CodeDuplicated(c))
            .WithName(Strings.Alpha2Code)
            .WithMessage(_localizer[Strings.DuplicatedValue]);
    }

    private bool IsNameEnDuplicated(CountryRequest c) =>
        _dbContext.Countries.Any(x => x.NameEn == c.NameEn && x.Id != c.Id);

    private bool IsNameArDuplicated(CountryRequest c) =>
        _dbContext.Countries.Any(x => x.NameAr == c.NameAr && x.Id != c.Id);

    private bool IsAlpha2CodeDuplicated(CountryRequest c) =>
        _dbContext.Countries.Any(x => x.Alpha2Code == c.Alpha2Code && x.Id != c.Id);
}
```

---

## Step 06 — Errors Class

**Location:** `Errors/EntitiesErrors/{EntityName}Errors.cs`

- Inject `IStringLocalizer<{EntityName}Request>` — typed to the **Request** class, not the Errors class
- Field must be `private readonly`
- Define one `Error` property per error case
- Include business-rule errors (e.g. entity in use by related records)

**Example (`CountryErrors.cs`):**

```csharp
using HrManagementSystem.Contracts.Countries;

namespace HrManagementSystem.Errors.EntitiesErrors;

public class CountryErrors(IStringLocalizer<CountryRequest> localizer)
{
    private readonly IStringLocalizer<CountryRequest> _localizer = localizer;

    public Error CountryNotFound =>
        new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], StatusCodes.Status404NotFound);

    public Error CountryExists =>
        new("Country.Duplicated", _localizer[nameof(CountryExists)], StatusCodes.Status409Conflict);

    public Error CountryInUseByState =>
        new("Country.CountryInUseByState", _localizer[nameof(CountryInUseByState)], StatusCodes.Status400BadRequest);

    public Error NoCountriesProvided =>
        new("Country.NoCountriesProvided", _localizer[nameof(NoCountriesProvided)], StatusCodes.Status400BadRequest);

    public Error CountryError =>
        new("Country.CountryError", _localizer[nameof(CountryError)], StatusCodes.Status500InternalServerError);
}
```

> **Note:** If no Request class exists for the entity (e.g. `FileErrors`), fall back to `IStringLocalizer<{ErrorsClassName}>`.

---

## Step 07 — Localization JSON Files

**Location:** `Localization/Resources/`

Add matching keys to both files. Key names must exactly match the property names used in the Errors class.

**`en-US.json`:**
```json
"CountryNotFound": "Country not found",
"CountryExists": "Country already exists",
"CountryInUseByState": "Country is in use by states",
"NoCountriesProvided": "No countries provided",
"CountryError": "Country error"
```

**`ar-EG.json`:**
```json
"CountryNotFound": "لم يتم العثور على الدولة.",
"CountryExists": "دولة بهذا الاسم موجودة بالفعل.",
"CountryInUseByState": "البلد مستخدم من قبل الولايات",
"NoCountriesProvided": "لم يتم توفير البلدان",
"CountryError": "خطأ في البلد"
```

---

## Step 08 — Strings Constants

**Location:** `Consts/Strings.cs`

Common keys already exist (`Required`, `MaxLengthError`, `DuplicatedValue`, `GreaterThanZero`, `InvalidValues`). Only add new constants if a new validation message is needed.

---

## Step 09 — Service Interface

**Location:** `Services/{EntityName}sService/I{EntityName}Service.cs`

> Note: The real service folder is directly under `Services/`, not `Services/BasicServices/`. Match the existing structure.

Define standard CRUD contract. Add extra methods for any non-standard endpoints (bulk insert, count, sub-resource fetch).

**Example (`ICountryService.cs`):**

```csharp
namespace HrManagementSystem.Services.CountriesService;

public interface ICountryService
{
    Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<Result<CountryResponse>>? GetAsync(int id, CancellationToken cancellationToken);
    Task<Result<CountryResponse>>? GetRelatedStates(int id, CancellationToken cancellationToken);
    Task<Result<CountryResponse>> AddAsync(CountryRequest country, CancellationToken cancellationToken);
    Task<Result> AddRangeAsync(List<CountryRequest> countryRequests, CancellationToken cancellationToken = default);
    Task<Result<CountryResponse>> UpdateAsync(CountryRequest countryRequest, CancellationToken cancellationToken = default);
    Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
    Task<Result<CountriesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default);
}
```

---

## Step 10 — Service Implementation

**Location:** `Services/{EntityName}sService/{EntityName}Service.cs`

Inject via primary constructor: `ApplicationDbContext`, `IHttpContextAccessor`, `IEntityChangeLogService`, `{EntityName}Errors`, `IMapper`, and any hub contexts if real-time updates are needed.

**Mapping:** The project uses **Mapster**. Use `.Adapt<T>()` for single-object mapping and `.ProjectToType<T>()` for queryable projections. Use `_mapper.Map(source, dest)` for updating an existing tracked entity.

Key patterns per method:

- **GetAll** — `AsNoTracking()` + `.ProjectToType<CountryResponse>()` (no manual `Where(!IsDeleted)` needed if Mapster config handles it, otherwise add it)
- **Get** — `FindAsync` + `.Adapt<CountryResponse>()`
- **GetRelatedStates** — `Include(...)` + `FirstOrDefaultAsync` + `.Adapt<T>()`
- **Add** — `_mapper.Map<Country>(request)` → `AddAsync` → `SaveChangesAsync` → `.Adapt<CountryResponse>()`
- **AddRange** — validate duplicates in-memory and in DB, then `BulkInsertAsync` (EFCore.BulkExtensions)
- **Update** — load existing → `.Adapt<Country>()` for change log snapshot → `_mapper.Map(request, current)` → `Update` → `SaveChangesAsync`
- **Toggle** — check business constraints first, then flip `IsDeleted` + set audit fields

**Example (`CountryService.cs`):**

```csharp
namespace HrManagementSystem.Services.CountriesService;

public class CountryService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    CountryErrors countryErrors,
    IMapper mapper) : ICountryService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly CountryErrors _countryErrors = countryErrors;

    public async Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Countries
            .AsNoTracking()
            .ProjectToType<CountryResponse>()
            .ToListAsync(cancellationToken);
    }

    public async Task<Result<CountryResponse>>? GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var country = await _context.Countries.FindAsync(id, cancellationToken);

        return country is not null
            ? Result.Success(country.Adapt<CountryResponse>())
            : Result.Failure<CountryResponse>(_countryErrors.CountryNotFound);
    }

    public async Task<Result<CountryResponse>>? GetRelatedStates(int id, CancellationToken cancellationToken = default)
    {
        var country = await _context.Countries
            .Include(c => c.States)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        return country is null
            ? Result.Failure<CountryResponse>(_countryErrors.CountryNotFound)
            : Result.Success(country.Adapt<CountryResponse>());
    }

    public async Task<Result<CountryResponse>> AddAsync(CountryRequest request, CancellationToken cancellationToken = default)
    {
        var newCountry = _mapper.Map<Country>(request);
        await _context.AddAsync(newCountry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(newCountry.Adapt<CountryResponse>());
    }

    public async Task<Result> AddRangeAsync(List<CountryRequest> requests, CancellationToken cancellationToken = default)
    {
        if (requests == null || requests.Count == 0)
            return Result.Failure(_countryErrors.NoCountriesProvided);

        var currentUserId = _httpContextAccessor.HttpContext!.User.GetUserId()!;
        var newCountries = new List<Country>();

        foreach (var request in requests)
        {
            var exists = await _context.Countries.AnyAsync(
                c => c.NameAr == request.NameAr || c.NameEn == request.NameEn, cancellationToken);

            if (exists)
                return Result.Failure(_countryErrors.CountryExists);

            var country = _mapper.Map<Country>(request);
            country.CreatedById = currentUserId;
            newCountries.Add(country);
        }

        await _context.BulkInsertAsync(newCountries, cancellationToken: cancellationToken);
        return Result.Success();
    }

    public async Task<Result<CountryResponse>> UpdateAsync(CountryRequest request, CancellationToken cancellationToken = default)
    {
        var current = await _context.Countries
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (current is null)
            return Result.Failure<CountryResponse>(_countryErrors.CountryNotFound);

        var updated = request.Adapt<Country>();
        await _entityChangeLogService.CreateChangeLogAsync(request.Id, current, updated);

        _mapper.Map(request, current);
        _context.Update(current);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<CountryResponse>(current));
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        // Check business constraints before toggling
        var isInUse = await _context.States.AnyAsync(s => s.CountryId == id, cancellationToken);
        if (isInUse)
            return Result.Failure(_countryErrors.CountryInUseByState);

        var country = await _context.Countries.FindAsync(id);
        if (country is null)
            return Result.Failure(_countryErrors.CountryNotFound);

        country.IsDeleted = !country.IsDeleted;
        country.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId()!;
        country.DeletedByPc = Environment.MachineName;
        country.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result<CountriesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.Countries
            .Where(c => !c.IsDeleted)
            .CountAsync(cancellationToken);

        return Result.Success(new CountriesCountResponse(count, null, null));
    }
}
```

**Register in** `Dependencies/EntitiesService.cs`:
```csharp
services.AddScoped<ICountryService, CountryService>();
```

**Register errors in** `Dependencies/ErrorsService.cs`:
```csharp
services.AddScoped<CountryErrors>();
```

---

## Step 11 — Permissions

**Location:** `Consts/Permissions.cs`

Add four constants using the format `"{EntityName}s:{Action}"`:

```csharp
public const string ViewCountries   = "Countries:View";
public const string CreateCountries = "Countries:Create";
public const string EditCountries   = "Countries:Edit";
public const string DeleteCountries = "Countries:Delete";
```

---

## Step 12 — Controller

**Location:** `Controllers/V1/{EntityName}sController.cs`

- Attributes: `[ApiVersion("1.0")]`, `[Route(ApiRoutes.BaseRoute)]`, `[ApiController]`, `[Authorize]`
- Inject service via primary constructor
- Use `[HasPermission(...)]` on every endpoint
- `POST` returns `CreatedAtAction`; `DELETE` returns `NoContent`; errors return `.ToProblem()`
- Add extra endpoints for sub-resources (`GET /{id}/states`), bulk (`POST /bulk`), and count (`GET /count`) when needed

**Swagger XML docs are required on every action.** The project has `GenerateDocumentationFile=True` in the `.csproj` and `IncludeXmlComments` wired in `ConfigureSwaggerOptions`, so XML comments appear directly in Swagger UI. Use `[ProducesResponseType]` on every action.

**Example (`CountriesController.cs`):**

```csharp
namespace HrManagementSystem.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class CountriesController(ICountryService countryService) : ControllerBase
{
    private readonly ICountryService _countryService = countryService;

    /// <summary>Get all countries.</summary>
    /// <returns>List of all countries.</returns>
    /// <response code="200">Returns the list of countries.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Missing ViewCountries permission.</response>
    [HttpGet]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(IEnumerable<CountryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var countries = await _countryService.GetAllAsync(cancellationToken);
        return Ok(countries);
    }

    /// <summary>Get a country by ID.</summary>
    /// <param name="id">Country ID.</param>
    /// <response code="200">Country found.</response>
    /// <response code="404">Country not found.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _countryService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response) : response.ToProblem();
    }

    /// <summary>Get a country with its related states.</summary>
    /// <param name="id">Country ID.</param>
    /// <response code="200">Country with states.</response>
    /// <response code="404">Country not found.</response>
    [HttpGet("{id}/states")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCountryWithStates([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _countryService.GetRelatedStates(id, cancellationToken);
        return response.IsSuccess ? Ok(response) : response.ToProblem();
    }

    /// <summary>Create a new country.</summary>
    /// <param name="request">Country data.</param>
    /// <response code="201">Country created.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="409">Country already exists.</response>
    [HttpPost]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Add([FromBody] CountryRequest request, CancellationToken cancellationToken)
    {
        var result = await _countryService.AddAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result);
    }

    /// <summary>Bulk insert multiple countries.</summary>
    /// <param name="requests">List of country data.</param>
    /// <response code="204">All countries inserted.</response>
    /// <response code="400">No countries provided or validation failed.</response>
    /// <response code="409">One or more countries already exist.</response>
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AddRange([FromBody] List<CountryRequest> requests, CancellationToken cancellationToken)
    {
        var result = await _countryService.AddRangeAsync(requests, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <summary>Update an existing country.</summary>
    /// <param name="request">Updated country data including ID.</param>
    /// <response code="201">Country updated.</response>
    /// <response code="404">Country not found.</response>
    /// <response code="409">Name conflict.</response>
    [HttpPut]
    [HasPermission(Permissions.EditCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] CountryRequest request, CancellationToken cancellationToken)
    {
        var result = await _countryService.UpdateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result);
    }

    /// <summary>Toggle soft-delete state of a country.</summary>
    /// <param name="id">Country ID.</param>
    /// <response code="204">Toggled successfully.</response>
    /// <response code="400">Country is in use by states.</response>
    /// <response code="404">Country not found.</response>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _countryService.ToggleAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <summary>Get total count of active countries.</summary>
    /// <response code="200">Count returned.</response>
    [HttpGet("count")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountriesCountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _countryService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : result.ToProblem();
    }
}
```

---

## Step 13 — Swagger XML Docs on Controller (already covered in Step 12)

XML documentation is part of the controller implementation in Step 12. The project already has:
- `<GenerateDocumentationFile>True</GenerateDocumentationFile>` in the `.csproj`
- `options.IncludeXmlComments(xmlPath)` in `ConfigureSwaggerOptions.cs`
- `<NoWarn>$(NoWarn);1591</NoWarn>` to suppress missing-doc warnings

No extra setup is needed. Just write the XML comments as shown in Step 12.

---

## Step 14 — Controller Frontend Docs

**Location:** `Docs/Controllers/{Module}/{EntityName}sController.md`

**Purpose:** A standalone markdown file that gives frontend developers everything they need to integrate with this controller — without reading the source code or Swagger UI.

**Create the folder** `Docs/Controllers/{Module}/` if it doesn't exist.

**What to include:**
1. Overview — what this controller manages, permission group
2. Base URL and authentication header
3. Permissions table
4. Endpoints summary table
5. Per-endpoint detail: method + path, permission, request body (fields, types, required/optional, constraints), success response shape, all error codes with explanations, example JSON

**Example (`Docs/Controllers/Geographic/CountriesController.md`):**

```markdown
# Countries API — Frontend Integration Guide

## Overview
Manages country records used across the system (states, addresses, etc.).
All endpoints require a valid JWT Bearer token.

**Base URL:** `/api/v1/countries`
**Permission Group:** `Countries`

---

## Authentication
All requests must include:
Authorization: Bearer <token>

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
| POST | `/api/v1/countries` | CreateCountries | Create a country |
| POST | `/api/v1/countries/bulk` | CreateCountries | Bulk insert countries |
| PUT | `/api/v1/countries` | EditCountries | Update a country |
| DELETE | `/api/v1/countries/{id}` | DeleteCountries | Soft delete / restore |
| GET | `/api/v1/countries/count` | ViewCountries | Get active country count |

---

## Endpoint Details

### GET /api/v1/countries
**Permission:** `ViewCountries`
**Description:** Returns all countries.

**Response 200:**
```json
[
  {
    "id": 1,
    "nameAr": "مصر",
    "nameEn": "Egypt",
    "alpha2Code": "EG",
    "alpha3Code": "EGY",
    "phoneCode": "+20",
    "currencyCode": "EGP",
    "states": [],
    "createdOn": "2024-01-01T00:00:00Z",
    "updatedOn": null,
    "isDeleted": false
  }
]
```

**Errors:**
| Code | When |
|------|------|
| 401 | Missing or invalid token |
| 403 | Missing ViewCountries permission |

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
  "phoneCode": "+20",
  "currencyCode": "EGP"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | int | ✅ | Send `0` for new records |
| `nameAr` | string | ✅ | 2–100 characters, unique |
| `nameEn` | string | ✅ | 2–100 characters, unique |
| `alpha2Code` | string? | ❌ | Exactly 2 characters if provided, unique |
| `alpha3Code` | string? | ❌ | Exactly 3 characters if provided, unique |
| `phoneCode` | string? | ❌ | 1–10 characters if provided |
| `currencyCode` | string? | ❌ | Exactly 3 characters if provided |

**Response 201:** Returns the created country.

**Errors:**
| Code | When |
|------|------|
| 400 | Validation failed |
| 409 | Name or code already exists |
| 401 | Unauthorized |
| 403 | Missing permission |

---

### POST /api/v1/countries/bulk
**Permission:** `CreateCountries`
**Description:** Inserts multiple countries at once.

**Request Body:** Array of country objects (same shape as single POST, all with `id: 0`).

**Response 204:** No content on success.

**Errors:**
| Code | When |
|------|------|
| 400 | Empty list provided |
| 409 | One or more names/codes already exist |

---

### DELETE /api/v1/countries/{id}
**Permission:** `DeleteCountries`
**Description:** Toggles soft-delete. Active → deleted; deleted → restored.

**Response 204:** No content.

**Errors:**
| Code | When |
|------|------|
| 400 | Country is referenced by states (cannot delete) |
| 404 | Country not found |
```

---

## Step 15 — User Story

**Location:** `Docs/User Stories/{Module}/{EntityName}_UserStory.md`

Include: feature overview, user stories with acceptance criteria, API endpoint table, business rules, validation rules, and error scenarios. Use the Countries controller as the reference for the endpoint table format.

---

## Checklist

- [ ] Step 01: Entity class created
- [ ] Step 02: DbSet added to ApplicationDbContext
- [ ] Step 03: Entity configuration created
- [ ] Step 04: Request/Response DTOs created
- [ ] Step 05: Validator created
- [ ] Step 06: Errors class created
- [ ] Step 07: Translations added (en-US + ar-EG)
- [ ] Step 08: String keys verified
- [ ] Step 09: Service interface created
- [ ] Step 10: Service implemented and registered (service + errors)
- [ ] Step 11: Permissions defined
- [ ] Step 12: Controller created with Swagger XML docs and `[ProducesResponseType]` on every action
- [ ] Step 13: Swagger XML docs verified (no extra setup needed — already configured)
- [ ] Step 14: Controller frontend docs created in `Docs/Controllers/{Module}/`
- [ ] Step 15: User story documented
