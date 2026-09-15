using System.Security.Cryptography;
using System.Text;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Abstractions;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.ReportTemplates.Persistence;

public sealed class ReportTemplateContentHashProvider : IReportTemplateContentHashProvider
{
    public string Compute(string definitionJson) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(definitionJson)));
}
