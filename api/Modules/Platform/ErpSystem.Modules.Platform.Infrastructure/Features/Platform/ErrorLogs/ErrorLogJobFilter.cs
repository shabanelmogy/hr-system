using ErpSystem.BuildingBlocks.Application.Diagnostics;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using Hangfire.Client;
using Hangfire.Common;
using Hangfire.Server;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

public sealed class ErrorLogJobFilter(IServiceScopeFactory scopes, IHttpContextAccessor httpContextAccessor,
    IErrorLogCaptureSink sink, TimeProvider clock)
    : JobFilterAttribute, IClientFilter, IServerFilter
{
    private const string UserKey = "errorlog.user";
    private const string TenantKey = "errorlog.tenant";
    private const string CompanyKey = "errorlog.company";

    public void OnCreating(CreatingContext context)
    {
        try
        {
            using var scope = scopes.CreateScope();
            var actor = httpContextAccessor.HttpContext?.RequestServices.GetService<ICurrentExecutionContext>()
                ?? scope.ServiceProvider.GetRequiredService<ICurrentExecutionContext>();
            if (!string.IsNullOrWhiteSpace(actor.UserId)) context.SetJobParameter(UserKey, actor.UserId);
            if (!string.IsNullOrWhiteSpace(actor.TenantId)) context.SetJobParameter(TenantKey, actor.TenantId);
            if (actor.CompanyId is > 0) context.SetJobParameter(CompanyKey, actor.CompanyId);
        }
        catch { /* Diagnostic capture must never prevent job creation. */ }
    }
    public void OnCreated(CreatedContext context) { }

    public void OnPerforming(PerformingContext context) { }

    public void OnPerformed(PerformedContext context)
    {
        if (context.Exception is null) return;
        try
        {
            var tenant = context.GetJobParameter<string>(TenantKey);
            var user = context.GetJobParameter<string>(UserKey);
            var company = context.GetJobParameter<int?>(CompanyKey);
            if (string.IsNullOrWhiteSpace(tenant)) company = null;
            var frames = new List<string>
            {
                $"JobId: {context.BackgroundJob.Id}",
                $"RetryCount: {context.GetJobParameter<int>("RetryCount")}",
                $"RuntimeVersion: {Environment.Version}",
                $"ApplicationVersion: {context.BackgroundJob.Job.Type.Assembly.GetName().Version}"
            };
            frames.AddRange(SafeExceptionDiagnostics.Capture(context.Exception));
            sink.TryCapture(new ErrorLogCapture(Guid.NewGuid(), clock.GetUtcNow(), ErrorLogSource.Job,
                ErrorLogSeverity.Error, null, user, tenant, company,
                context.BackgroundJob.Job.Type.Name, context.BackgroundJob.Job.Method.Name,
                null, context.BackgroundJob.Id, "JobAttemptFailed", null, null, null, frames));
        }
        catch { /* Diagnostic capture must never affect the job outcome. */ }
    }
}
