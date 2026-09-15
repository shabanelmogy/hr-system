using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Views;

public interface IViewStore
{
    Task CreateOrAlterAsync(ViewRequest view, CancellationToken cancellationToken = default);
    Task<List<ViewResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task DropAsync(string viewName, CancellationToken cancellationToken = default);
    Task<List<string>> GetTablesAsync(CancellationToken cancellationToken = default);
    Task<List<string>> GetTableColumnsAsync(string tableName, CancellationToken cancellationToken = default);
}

public interface IViewEffects
{
    void DispatchChange(string action, string viewName);
}

public sealed record CreateOrAlterViewCommand(ViewRequest View) : ICommand<Result>;
public sealed record DropViewCommand(string ViewName) : ICommand<Result>;
public sealed record GetAllViewsQuery : IQuery<List<ViewResponse>>;
public sealed record GetAllViewTablesQuery : IQuery<List<string>>;
public sealed record GetViewTableColumnsQuery(string TableName) : IQuery<List<string>>;

public sealed class CreateOrAlterViewCommandHandler(IViewStore store, IViewEffects effects)
    : ICommandHandler<CreateOrAlterViewCommand, Result>
{
    public async Task<Result> Handle(CreateOrAlterViewCommand command, CancellationToken cancellationToken)
    {
        ViewDefinitionPolicy.ValidateIdentifier(command.View.ViewName);
        ViewDefinitionPolicy.ValidateQuery(command.View.ViewQuery);
        await store.CreateOrAlterAsync(command.View, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("CreateOrUpdate", command.View.ViewName);
        return Result.Success();
    }
}

public sealed class DropViewCommandHandler(IViewStore store, IViewEffects effects)
    : ICommandHandler<DropViewCommand, Result>
{
    public async Task<Result> Handle(DropViewCommand command, CancellationToken cancellationToken)
    {
        ViewDefinitionPolicy.ValidateIdentifier(command.ViewName);
        await store.DropAsync(command.ViewName, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Delete", command.ViewName);
        return Result.Success();
    }
}

public sealed class GetAllViewsQueryHandler(IViewStore store)
    : IQueryHandler<GetAllViewsQuery, List<ViewResponse>>
{
    public Task<List<ViewResponse>> Handle(GetAllViewsQuery query, CancellationToken cancellationToken) =>
        store.GetAllAsync(cancellationToken);
}

public sealed class GetAllViewTablesQueryHandler(IViewStore store)
    : IQueryHandler<GetAllViewTablesQuery, List<string>>
{
    public Task<List<string>> Handle(GetAllViewTablesQuery query, CancellationToken cancellationToken) =>
        store.GetTablesAsync(cancellationToken);
}

public sealed class GetViewTableColumnsQueryHandler(IViewStore store)
    : IQueryHandler<GetViewTableColumnsQuery, List<string>>
{
    public Task<List<string>> Handle(GetViewTableColumnsQuery query, CancellationToken cancellationToken)
    {
        ViewDefinitionPolicy.ValidateIdentifier(query.TableName);
        return store.GetTableColumnsAsync(query.TableName, cancellationToken);
    }
}

internal static class ViewDefinitionPolicy
{
    public static void ValidateIdentifier(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier) ||
            identifier.Length > 128 ||
            !identifier.All(character => char.IsAsciiLetterOrDigit(character) || character == '_') ||
            (!char.IsAsciiLetter(identifier[0]) && identifier[0] != '_'))
        {
            throw new ArgumentException("The database identifier is invalid.", nameof(identifier));
        }
    }

    public static void ValidateQuery(string? query)
    {
        var normalized = query?.Trim();
        if (string.IsNullOrWhiteSpace(normalized) ||
            !normalized.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains(';') ||
            normalized.Contains("--", StringComparison.Ordinal) ||
            normalized.Contains("/*", StringComparison.Ordinal))
        {
            throw new ArgumentException("Only a single SELECT statement is allowed.", nameof(query));
        }
    }
}
