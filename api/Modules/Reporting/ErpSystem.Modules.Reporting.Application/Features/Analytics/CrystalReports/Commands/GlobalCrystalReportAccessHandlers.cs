using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed class ReplaceGlobalCrystalReportGrantsCommandHandler(IGlobalCrystalReportStore store,
    IGlobalCrystalReportAccessStore access, GlobalCrystalReportPolicy policy, IReportingUnitOfWork unitOfWork,
    CrystalReportErrors errors) : ICommandHandler<ReplaceGlobalCrystalReportGrantsCommand, Result>
{
    public async Task<Result> Handle(ReplaceGlobalCrystalReportGrantsCommand request, CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(entity => policy.Allows(entity, ReportingPermissions.EditGlobalCrystalReportAccess)))
            return Result.Failure(errors.GlobalCrystalReportForbidden);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var version))
            return Result.Failure(errors.CrystalReportInvalidRowVersion);
        var snapshot = await store.FindAsync(request.ReportId, cancellationToken);
        if (snapshot == null || snapshot.IsDeleted || !policy.Allows(snapshot.EntityKey, ReportingPermissions.EditGlobalCrystalReportAccess))
            return Result.Failure(errors.CrystalReportNotFound);
        if (!await access.RolesValidAsync(request.Grants.Select(grant => grant.RoleId).ToArray(), cancellationToken))
            return Result.Failure(errors.CrystalReportInvalidRole);
        return await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"], async cancellation =>
        {
            var report = await store.FindAsync(request.ReportId, cancellation);
            if (report == null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.EditGlobalCrystalReportAccess))
                return Result.Failure(errors.CrystalReportNotFound);
            if (!report.RowVersion.SequenceEqual(version)) return Result.Failure(errors.CrystalReportConcurrencyConflict);
            store.ApplyRowVersion(report, version);
            await access.ReplaceAsync(report.Id, request.Grants.Select(grant => GlobalCrystalReportRoleGrant.Create(
                report.Id, grant.RoleId, CrystalReportRules.ParseRights(grant.Rights))).ToArray(), cancellation);
            await unitOfWork.SaveChangesAsync(cancellation);
            return Result.Success();
        }, cancellationToken);
    }
}

public sealed class ArchiveGlobalCrystalReportCommandHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, IReportingUnitOfWork unitOfWork, CrystalReportErrors errors)
    : ICommandHandler<ArchiveGlobalCrystalReportCommand, Result>
{
    public async Task<Result> Handle(ArchiveGlobalCrystalReportCommand request, CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(entity => policy.Allows(entity, ReportingPermissions.ArchiveGlobalCrystalReports)))
            return Result.Failure(errors.GlobalCrystalReportForbidden);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var version))
            return Result.Failure(errors.CrystalReportInvalidRowVersion);
        return await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"], async cancellation =>
        {
            var report = await store.FindAsync(request.ReportId, cancellation);
            if (report == null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.ArchiveGlobalCrystalReports))
                return Result.Failure(errors.CrystalReportNotFound);
            if (!report.RowVersion.SequenceEqual(version)) return Result.Failure(errors.CrystalReportConcurrencyConflict);
            store.ApplyRowVersion(report, version);
            report.Archive();
            await unitOfWork.SaveChangesAsync(cancellation);
            return Result.Success();
        }, cancellationToken);
    }
}
