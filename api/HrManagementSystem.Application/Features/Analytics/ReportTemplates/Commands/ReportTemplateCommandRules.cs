using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;
using System.Linq.Expressions;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands;

internal static class ReportTemplateCommandRules
{
    public static void AddDefinitionRules<T>(
        AbstractValidator<T> validator,
        Expression<Func<T, string>> featureKey,
        Expression<Func<T, string>> name,
        Expression<Func<T, string?>> description,
        Expression<Func<T, string>> dataSourceKey,
        Expression<Func<T, string>> definitionJson)
    {
        validator.RuleFor(featureKey).NotEmpty().MaximumLength(64);
        validator.RuleFor(name).NotEmpty().MaximumLength(150);
        validator.RuleFor(description).MaximumLength(500);
        validator.RuleFor(dataSourceKey).NotEmpty().MaximumLength(64);
        var getFeatureKey = featureKey.Compile();
        var getDataSourceKey = dataSourceKey.Compile();
        validator.RuleFor(x => x)
            .Must(x => ReportTemplateDefinitionSafety.IsApprovedPair(
                getFeatureKey(x), getDataSourceKey(x)))
            .WithMessage("The report feature and data source combination is not approved.");
        validator.RuleFor(definitionJson)
            .NotEmpty()
            .Must(ReportTemplateDefinitionSafety.IsSafe)
            .WithMessage(
                "The report definition must be valid RDLX JSON, at most 1 MiB, and must not contain credentials, absolute URLs, database connection strings, or unapproved API endpoints.");
    }
}
