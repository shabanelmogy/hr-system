using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Attendance.Devices.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Queries;

public sealed record GetAttendanceDevicesQuery(int PageNumber = 1, int PageSize = 10, string? Search = null) : IQuery<PageResponse<AttendanceDeviceResponse>>;
public sealed record GetAttendanceDeviceQuery(int Id) : IQuery<Result<AttendanceDeviceResponse>>;
public sealed record GetAttendanceBranchesQuery : IQuery<IReadOnlyList<AttendanceBranchResponse>>;
public sealed record GetAttendanceAgentsQuery : IQuery<IReadOnlyList<AttendanceAgentResponse>>;
public sealed record GetAttendanceProvidersQuery : IQuery<IReadOnlyList<ProviderResponse>>;
public sealed record GetAttendanceConnectorHealthQuery : IQuery<ConnectorHealthResponse>;
public sealed record GetRawDeviceUsersQuery(RawDeviceUserPageRequest Request) : IQuery<PageResponse<RawDeviceUserResponse>>;
public sealed record GetRawAttendancePunchesQuery(RawAttendancePunchPageRequest Request) : IQuery<PageResponse<RawAttendancePunchResponse>>;
public sealed record GetDevicePullRunsQuery(PullRunPageRequest Request) : IQuery<PageResponse<PullRunResponse>>;

public sealed class GetAttendanceDevicesQueryHandler(IAttendanceDeviceReadStore store) : IQueryHandler<GetAttendanceDevicesQuery, PageResponse<AttendanceDeviceResponse>>
{ public Task<PageResponse<AttendanceDeviceResponse>> Handle(GetAttendanceDevicesQuery request, CancellationToken cancellationToken) => store.GetDevicesAsync(request.PageNumber, request.PageSize, request.Search, cancellationToken); }
public sealed class GetAttendanceDeviceQueryHandler(IAttendanceDeviceReadStore store, AttendanceDeviceErrors errors) : IQueryHandler<GetAttendanceDeviceQuery, Result<AttendanceDeviceResponse>>
{
    public async Task<Result<AttendanceDeviceResponse>> Handle(GetAttendanceDeviceQuery request, CancellationToken cancellationToken)
    {
        var device = await store.GetDeviceAsync(request.Id, cancellationToken);
        return device is null ? Result.Failure<AttendanceDeviceResponse>(errors.NotFound) : Result.Success(device);
    }
}
public sealed class GetAttendanceBranchesQueryHandler(IAttendanceDeviceReadStore store)
    : IQueryHandler<GetAttendanceBranchesQuery, IReadOnlyList<AttendanceBranchResponse>>
{
    public Task<IReadOnlyList<AttendanceBranchResponse>> Handle(GetAttendanceBranchesQuery request, CancellationToken cancellationToken) =>
        store.GetBranchesAsync(cancellationToken);
}
public sealed class GetAttendanceAgentsQueryHandler(IAttendanceDeviceReadStore store)
    : IQueryHandler<GetAttendanceAgentsQuery, IReadOnlyList<AttendanceAgentResponse>>
{
    public Task<IReadOnlyList<AttendanceAgentResponse>> Handle(GetAttendanceAgentsQuery request, CancellationToken cancellationToken) =>
        store.GetAgentsAsync(cancellationToken);
}
public sealed class GetAttendanceProvidersQueryHandler(IAttendanceConnectorClient connector) : IQueryHandler<GetAttendanceProvidersQuery, IReadOnlyList<ProviderResponse>>
{ public async Task<IReadOnlyList<ProviderResponse>> Handle(GetAttendanceProvidersQuery request, CancellationToken cancellationToken) => (await connector.GetHealthAsync(cancellationToken)).Providers; }
public sealed class GetAttendanceConnectorHealthQueryHandler(IAttendanceConnectorClient connector) : IQueryHandler<GetAttendanceConnectorHealthQuery, ConnectorHealthResponse>
{ public Task<ConnectorHealthResponse> Handle(GetAttendanceConnectorHealthQuery request, CancellationToken cancellationToken) => connector.GetHealthAsync(cancellationToken); }
public sealed class GetRawDeviceUsersQueryHandler(IAttendanceDeviceReadStore store) : IQueryHandler<GetRawDeviceUsersQuery, PageResponse<RawDeviceUserResponse>>
{ public Task<PageResponse<RawDeviceUserResponse>> Handle(GetRawDeviceUsersQuery request, CancellationToken cancellationToken) => store.GetUsersAsync(request.Request, cancellationToken); }
public sealed class GetRawAttendancePunchesQueryHandler(IAttendanceDeviceReadStore store) : IQueryHandler<GetRawAttendancePunchesQuery, PageResponse<RawAttendancePunchResponse>>
{ public Task<PageResponse<RawAttendancePunchResponse>> Handle(GetRawAttendancePunchesQuery request, CancellationToken cancellationToken) => store.GetPunchesAsync(request.Request, cancellationToken); }
public sealed class GetDevicePullRunsQueryHandler(IAttendanceDeviceReadStore store) : IQueryHandler<GetDevicePullRunsQuery, PageResponse<PullRunResponse>>
{ public Task<PageResponse<PullRunResponse>> Handle(GetDevicePullRunsQuery request, CancellationToken cancellationToken) => store.GetPullRunsAsync(request.Request, cancellationToken); }
