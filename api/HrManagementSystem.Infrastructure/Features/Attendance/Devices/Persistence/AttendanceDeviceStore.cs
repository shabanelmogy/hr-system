using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Domain.Attendance.Devices.Entities;
using Mapster;
using MapsterMapper;

namespace HrManagementSystem.Infrastructure.Features.Attendance.Devices.Persistence;

/// <summary>Scoped persistence questions only. CQRS handlers own mutations, audit and scheduling.</summary>
public sealed class AttendanceDeviceStore(ApplicationDbContext context, IMapper mapper)
    : IAttendanceDeviceReadStore, IAttendanceDeviceWriteStore
{
    public Task<AttendanceDevice?> FindAsync(int id, CancellationToken ct) =>
        context.AttendanceDevices.Include(x => x.Credential).FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> NameExistsAsync(string normalizedName, int? exceptId, CancellationToken ct) =>
        context.AttendanceDevices.AnyAsync(x => x.NormalizedName == normalizedName && (!exceptId.HasValue || x.Id != exceptId), ct);
    public Task<bool> BranchIsActiveAsync(int branchId, CancellationToken ct) =>
        context.Branches.AnyAsync(x => x.Id == branchId && x.IsActive && !x.IsDeleted, ct);
    public Task<bool> HasActivePullAsync(int deviceId, CancellationToken ct) =>
        context.DevicePullRuns.AnyAsync(x => x.AttendanceDeviceId == deviceId && (x.Status == "pending" || x.Status == "running"), ct);
    public Task<DevicePullRun?> FindRunByOperationAsync(int deviceId, Guid operationId, CancellationToken ct) =>
        context.DevicePullRuns.FirstOrDefaultAsync(x => x.AttendanceDeviceId == deviceId && x.OperationId == operationId, ct);
    public Task<AttendanceAgent?> FindAgentAsync(Guid id, CancellationToken ct) =>
        context.AttendanceAgents.FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> AgentNameExistsAsync(string normalizedName, CancellationToken ct) =>
        context.AttendanceAgents.AnyAsync(x => x.NormalizedName == normalizedName, ct);
    public void Add(AttendanceDevice device) => context.AttendanceDevices.Add(device);
    public void Add(AttendanceAgent agent) => context.AttendanceAgents.Add(agent);
    public void Add(DevicePullRun run) => context.DevicePullRuns.Add(run);

    public async Task<AttendanceDeviceResponse?> GetDeviceAsync(int id, CancellationToken ct) =>
        await context.AttendanceDevices.AsNoTracking().Where(x => x.Id == id)
            .ProjectToType<AttendanceDeviceResponse>(mapper.Config).FirstOrDefaultAsync(ct);
    public async Task<IReadOnlyList<AttendanceBranchResponse>> GetBranchesAsync(CancellationToken ct) =>
        await context.Branches.AsNoTracking().Where(x => x.IsActive && !x.IsDeleted)
            .OrderBy(x => x.NameEn).ThenBy(x => x.Id)
            .ProjectToType<AttendanceBranchResponse>(mapper.Config).ToListAsync(ct);
    public async Task<IReadOnlyList<AttendanceAgentResponse>> GetAgentsAsync(CancellationToken ct) =>
        await context.AttendanceAgents.AsNoTracking()
            .OrderBy(x => x.Name).ThenBy(x => x.Id)
            .Select(x => new AttendanceAgentResponse(x.Id, x.Name, x.IsActive, x.LastSeenAtUtc, x.Devices.Count))
            .ToListAsync(ct);
    public Task<PageResponse<AttendanceDeviceResponse>> GetDevicesAsync(int pageNumber, int pageSize, string? search, CancellationToken ct)
    {
        var query = context.AttendanceDevices.AsNoTracking();
        var term = search?.Trim();
        if (!string.IsNullOrWhiteSpace(term)) query = query.Where(x => x.Name.Contains(term) || x.Host.Contains(term));
        return PageAsync<AttendanceDevice, AttendanceDeviceResponse>(query.OrderBy(x => x.Name).ThenBy(x => x.Id), pageNumber, pageSize, ct);
    }
    public Task<PageResponse<RawDeviceUserResponse>> GetUsersAsync(RawDeviceUserPageRequest request, CancellationToken ct)
    {
        var query = context.RawDeviceUsers.AsNoTracking();
        var term = request.Search?.Trim();
        if (request.DeviceId.HasValue) query = query.Where(x => x.AttendanceDeviceId == request.DeviceId);
        if (!string.IsNullOrWhiteSpace(term)) query = query.Where(x => x.ExternalCode.Contains(term) || (x.Name != null && x.Name.Contains(term)));
        var desc = request.SortDirection == "desc";
        var ordered = request.SortBy switch
        {
            "name" => desc ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "deviceName" => desc ? query.OrderByDescending(x => x.AttendanceDevice.Name) : query.OrderBy(x => x.AttendanceDevice.Name),
            "pulledAtUtc" => desc ? query.OrderByDescending(x => x.PulledAtUtc) : query.OrderBy(x => x.PulledAtUtc),
            _ => desc ? query.OrderByDescending(x => x.ExternalCode) : query.OrderBy(x => x.ExternalCode)
        };
        return PageAsync<RawDeviceUser, RawDeviceUserResponse>(ordered.ThenBy(x => x.Id), request.PageNumber, request.PageSize, ct);
    }
    public Task<PageResponse<RawAttendancePunchResponse>> GetPunchesAsync(RawAttendancePunchPageRequest request, CancellationToken ct)
    {
        var query = context.RawAttendancePunches.AsNoTracking();
        var term = request.ExternalCode?.Trim();
        if (request.DeviceId.HasValue) query = query.Where(x => x.AttendanceDeviceId == request.DeviceId);
        if (!string.IsNullOrWhiteSpace(term)) query = query.Where(x => x.ExternalCode.Contains(term));
        if (request.FromUtc.HasValue) query = query.Where(x => x.OccurredAtUtc >= request.FromUtc);
        if (request.ToUtc.HasValue) query = query.Where(x => x.OccurredAtUtc <= request.ToUtc);
        var desc = request.SortDirection == "desc";
        var ordered = request.SortBy switch
        {
            "externalCode" => desc ? query.OrderByDescending(x => x.ExternalCode) : query.OrderBy(x => x.ExternalCode),
            "deviceName" => desc ? query.OrderByDescending(x => x.AttendanceDevice.Name) : query.OrderBy(x => x.AttendanceDevice.Name),
            "occurredAtDeviceLocal" => desc ? query.OrderByDescending(x => x.OccurredAtDeviceLocal) : query.OrderBy(x => x.OccurredAtDeviceLocal),
            "pulledAtUtc" => desc ? query.OrderByDescending(x => x.PulledAtUtc) : query.OrderBy(x => x.PulledAtUtc),
            _ => desc ? query.OrderByDescending(x => x.OccurredAtUtc) : query.OrderBy(x => x.OccurredAtUtc)
        };
        return PageAsync<RawAttendancePunch, RawAttendancePunchResponse>(ordered.ThenBy(x => x.Id), request.PageNumber, request.PageSize, ct);
    }
    public Task<PageResponse<PullRunResponse>> GetPullRunsAsync(PullRunPageRequest request, CancellationToken ct)
    {
        var query = context.DevicePullRuns.AsNoTracking();
        if (request.DeviceId.HasValue) query = query.Where(x => x.AttendanceDeviceId == request.DeviceId);
        if (!string.IsNullOrEmpty(request.Status)) query = query.Where(x => x.Status == request.Status);
        if (request.OperationId.HasValue) query = query.Where(x => x.OperationId == request.OperationId);
        var desc = request.SortDirection == "desc";
        var ordered = request.SortBy switch
        {
            "finishedAtUtc" => desc ? query.OrderByDescending(x => x.FinishedAtUtc) : query.OrderBy(x => x.FinishedAtUtc),
            "status" => desc ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "operationType" => desc ? query.OrderByDescending(x => x.OperationType) : query.OrderBy(x => x.OperationType),
            _ => desc ? query.OrderByDescending(x => x.StartedAtUtc) : query.OrderBy(x => x.StartedAtUtc)
        };
        return PageAsync<DevicePullRun, PullRunResponse>(ordered.ThenBy(x => x.Id), request.PageNumber, request.PageSize, ct);
    }
    private async Task<PageResponse<TResponse>> PageAsync<TEntity, TResponse>(
        IQueryable<TEntity> query, int page, int size, CancellationToken ct)
    {
        var count = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * size).Take(size).ProjectToType<TResponse>(mapper.Config).ToListAsync(ct);
        return new PageResponse<TResponse>(items, new MetaData
        {
            CurrentPage = page, PageNumber = page, PageSize = size, TotalCount = count,
            TotalPages = (int)Math.Ceiling(count / (double)size)
        });
    }
}
