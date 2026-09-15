using ErpSystem.Modules.Platform.Contracts.Communications;

namespace ErpSystem.Modules.Platform.Application.Tenancy.Administration;

public sealed record GetTenantsPageQuery(TenantAdministrationPageRequest Request)
    : IQuery<TenantAdministrationPage<TenantManagementResponse>>;

public sealed record GetAllTenantsQuery : IQuery<IReadOnlyList<TenantManagementResponse>>;

public sealed record GetTenantQuery(string Id)
    : IQuery<TenantAdministrationResult<TenantManagementResponse>>;

public sealed record CreateTenantCommand(TenantManagementRequest Request)
    : ICommand<TenantAdministrationResult<TenantManagementResponse>>;

public sealed record UpdateTenantCommand(string Id, TenantManagementRequest Request)
    : ICommand<TenantAdministrationResult<TenantManagementResponse>>;

public sealed record ArchiveTenantCommand(string Id, ArchiveTenantRequest Request)
    : ICommand<TenantAdministrationResult<TenantManagementResponse>>;

public sealed record RestoreTenantCommand(string Id, RestoreTenantRequest Request)
    : ICommand<TenantAdministrationResult<TenantManagementResponse>>;

public sealed record GetTenantAdministratorsPageQuery(TenantAdministrationPageRequest Request)
    : IQuery<TenantAdministrationPage<TenantAdministratorResponse>>;

public sealed record GetAllTenantAdministratorsQuery
    : IQuery<IReadOnlyList<TenantAdministratorResponse>>;

public sealed record GetTenantAdministratorQuery(string Id)
    : IQuery<TenantAdministrationResult<TenantAdministratorResponse>>;

public sealed record CreateTenantAdministratorCommand(CreateTenantAdministratorRequest Request)
    : ICommand<TenantAdministrationResult<TenantAdministratorResponse>>;

public sealed record UpdateTenantAdministratorCommand(string Id, UpdateTenantAdministratorRequest Request)
    : ICommand<TenantAdministrationResult<TenantAdministratorResponse>>;

public sealed record ArchiveTenantAdministratorCommand(string Id)
    : ICommand<TenantAdministrationResult>;

public sealed record RestoreTenantAdministratorCommand(string Id)
    : ICommand<TenantAdministrationResult<TenantAdministratorResponse>>;

public sealed class GetTenantsPageQueryHandler(ITenantManagementAdapter adapter)
    : IQueryHandler<GetTenantsPageQuery, TenantAdministrationPage<TenantManagementResponse>>
{
    public Task<TenantAdministrationPage<TenantManagementResponse>> Handle(
        GetTenantsPageQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetPageAsync(request.Request, cancellationToken);
}

public sealed class GetAllTenantsQueryHandler(ITenantManagementAdapter adapter)
    : IQueryHandler<GetAllTenantsQuery, IReadOnlyList<TenantManagementResponse>>
{
    public Task<IReadOnlyList<TenantManagementResponse>> Handle(
        GetAllTenantsQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetAllAsync(cancellationToken);
}

public sealed class GetTenantQueryHandler(ITenantManagementAdapter adapter)
    : IQueryHandler<GetTenantQuery, TenantAdministrationResult<TenantManagementResponse>>
{
    public Task<TenantAdministrationResult<TenantManagementResponse>> Handle(
        GetTenantQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetAsync(request.Id, cancellationToken);
}

public sealed class CreateTenantCommandHandler(
    ITenantManagementAdapter adapter,
    IWhatsAppSender whatsAppSender)
    : ICommandHandler<CreateTenantCommand, TenantAdministrationResult<TenantManagementResponse>>
{
    public async Task<TenantAdministrationResult<TenantManagementResponse>> Handle(
        CreateTenantCommand command,
        CancellationToken cancellationToken)
    {
        var result = await adapter.CreateAsync(command.Request, cancellationToken).ConfigureAwait(false);
        if (result.IsFailure || string.IsNullOrWhiteSpace(result.Value.ContactPhone))
            return result;

        await whatsAppSender.SendTextAsync(
            new WhatsAppTextMessage(
                result.Value.ContactPhone,
                BuildTenantWelcomeMessage(result.Value),
                $"tenant-created-{result.Value.Id}"),
            CancellationToken.None).ConfigureAwait(false);

        return result;
    }

    private static string BuildTenantWelcomeMessage(TenantManagementResponse tenant)
    {
        var plan = string.IsNullOrWhiteSpace(tenant.PlanName) ? "-" : tenant.PlanName;
        var endDate = tenant.SubscriptionEndsOn?.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) ?? "-";

        return $"""
            Welcome to ERP System.

            Tenant: {tenant.Name}
            Identifier: {tenant.Identifier}
            Plan: {plan}
            Subscription status: {tenant.SubscriptionStatus}
            Starts on: {tenant.SubscriptionStartedOn.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture)}
            Ends on: {endDate}
            Admin limit: {tenant.MaxAdmins}
            User limit: {tenant.MaxUsers}
            """;
    }
}

public sealed class UpdateTenantCommandHandler(ITenantManagementAdapter adapter)
    : ICommandHandler<UpdateTenantCommand, TenantAdministrationResult<TenantManagementResponse>>
{
    public Task<TenantAdministrationResult<TenantManagementResponse>> Handle(
        UpdateTenantCommand command,
        CancellationToken cancellationToken) =>
        adapter.UpdateAsync(command.Id, command.Request, cancellationToken);
}

public sealed class ArchiveTenantCommandHandler(ITenantManagementAdapter adapter)
    : ICommandHandler<ArchiveTenantCommand, TenantAdministrationResult<TenantManagementResponse>>
{
    public Task<TenantAdministrationResult<TenantManagementResponse>> Handle(
        ArchiveTenantCommand command,
        CancellationToken cancellationToken) =>
        adapter.ArchiveAsync(command.Id, command.Request, cancellationToken);
}

public sealed class RestoreTenantCommandHandler(ITenantManagementAdapter adapter)
    : ICommandHandler<RestoreTenantCommand, TenantAdministrationResult<TenantManagementResponse>>
{
    public Task<TenantAdministrationResult<TenantManagementResponse>> Handle(
        RestoreTenantCommand command,
        CancellationToken cancellationToken) =>
        adapter.RestoreAsync(command.Id, command.Request, cancellationToken);
}

public sealed class GetTenantAdministratorsPageQueryHandler(ITenantAdministratorAdapter adapter)
    : IQueryHandler<GetTenantAdministratorsPageQuery, TenantAdministrationPage<TenantAdministratorResponse>>
{
    public Task<TenantAdministrationPage<TenantAdministratorResponse>> Handle(
        GetTenantAdministratorsPageQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetPageAsync(request.Request, cancellationToken);
}

public sealed class GetAllTenantAdministratorsQueryHandler(ITenantAdministratorAdapter adapter)
    : IQueryHandler<GetAllTenantAdministratorsQuery, IReadOnlyList<TenantAdministratorResponse>>
{
    public Task<IReadOnlyList<TenantAdministratorResponse>> Handle(
        GetAllTenantAdministratorsQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetAllAsync(cancellationToken);
}

public sealed class GetTenantAdministratorQueryHandler(ITenantAdministratorAdapter adapter)
    : IQueryHandler<GetTenantAdministratorQuery, TenantAdministrationResult<TenantAdministratorResponse>>
{
    public Task<TenantAdministrationResult<TenantAdministratorResponse>> Handle(
        GetTenantAdministratorQuery request,
        CancellationToken cancellationToken) =>
        adapter.GetAsync(request.Id, cancellationToken);
}

public sealed class CreateTenantAdministratorCommandHandler(ITenantAdministratorAdapter adapter)
    : ICommandHandler<CreateTenantAdministratorCommand, TenantAdministrationResult<TenantAdministratorResponse>>
{
    public Task<TenantAdministrationResult<TenantAdministratorResponse>> Handle(
        CreateTenantAdministratorCommand command,
        CancellationToken cancellationToken) =>
        adapter.CreateAsync(command.Request, cancellationToken);
}

public sealed class UpdateTenantAdministratorCommandHandler(ITenantAdministratorAdapter adapter)
    : ICommandHandler<UpdateTenantAdministratorCommand, TenantAdministrationResult<TenantAdministratorResponse>>
{
    public Task<TenantAdministrationResult<TenantAdministratorResponse>> Handle(
        UpdateTenantAdministratorCommand command,
        CancellationToken cancellationToken) =>
        adapter.UpdateAsync(command.Id, command.Request, cancellationToken);
}

public sealed class ArchiveTenantAdministratorCommandHandler(ITenantAdministratorAdapter adapter)
    : ICommandHandler<ArchiveTenantAdministratorCommand, TenantAdministrationResult>
{
    public Task<TenantAdministrationResult> Handle(
        ArchiveTenantAdministratorCommand command,
        CancellationToken cancellationToken) =>
        adapter.ArchiveAsync(command.Id, cancellationToken);
}

public sealed class RestoreTenantAdministratorCommandHandler(ITenantAdministratorAdapter adapter)
    : ICommandHandler<RestoreTenantAdministratorCommand, TenantAdministrationResult<TenantAdministratorResponse>>
{
    public Task<TenantAdministrationResult<TenantAdministratorResponse>> Handle(
        RestoreTenantAdministratorCommand command,
        CancellationToken cancellationToken) =>
        adapter.RestoreAsync(command.Id, cancellationToken);
}
