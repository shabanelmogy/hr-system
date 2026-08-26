using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Attendance.Devices.Commands;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using MediatR;

namespace HrManagementSystem.Api.Features.Attendance.Devices.V1;

/// <summary>
/// Outbound-only protocol for the Windows site agent. These endpoints deliberately have no JWT/browser path:
/// the enrollment token authenticates a single agent and all company scope comes from that server-side identity.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/attendance-agent")]
[ApiController]
[AllowAnonymous]
[RequireHttps]
public sealed class AttendanceAgentController(
    ISender sender, IAttendanceAgentAuthenticator authenticator, ICurrentActorScope actorScope) : ControllerBase
{
    private const string AgentIdHeader = "X-Attendance-Agent-Id";
    private const string AgentTokenHeader = "X-Attendance-Agent-Token";

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat(CancellationToken cancellationToken)
    {
        var session = await AuthenticateAsync(cancellationToken);
        if (session is null) return Unauthorized();
        using var scope = actorScope.BeginScope(session.AuditUserId, session.TenantId, session.CompanyId);
        var result = await sender.Send(new HeartbeatAttendanceAgentCommand(session.AgentId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("claim")]
    public async Task<IActionResult> Claim(CancellationToken cancellationToken)
    {
        var session = await AuthenticateAsync(cancellationToken);
        if (session is null) return Unauthorized();
        using var scope = actorScope.BeginScope(session.AuditUserId, session.TenantId, session.CompanyId);
        var result = await sender.Send(new ClaimAttendanceAgentWorkCommand(session.AgentId), cancellationToken);
        return result.IsSuccess ? (result.Value is null ? NoContent() : Ok(result.Value)) : result.ToProblem();
    }

    [HttpPost("runs/{runId:long}/result")]
    public async Task<IActionResult> SubmitResult(long runId, SubmitAttendanceAgentWorkResultRequest request, CancellationToken cancellationToken)
    {
        var session = await AuthenticateAsync(cancellationToken);
        if (session is null) return Unauthorized();
        using var scope = actorScope.BeginScope(session.AuditUserId, session.TenantId, session.CompanyId);
        var result = await sender.Send(new SubmitAttendanceAgentWorkResultCommand(session.AgentId, runId, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    private async Task<AttendanceAgentSession?> AuthenticateAsync(CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(Request.Headers[AgentIdHeader].ToString(), out var agentId)) return null;
        var token = Request.Headers[AgentTokenHeader].ToString();
        return await authenticator.AuthenticateAsync(agentId, token, cancellationToken);
    }
}
