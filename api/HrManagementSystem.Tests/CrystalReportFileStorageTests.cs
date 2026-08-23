using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class CrystalReportFileStorageTests
{
    [Fact]
    public async Task RelativeStorageRoot_IsResolvedFromApplicationContentRoot()
    {
        var contentRoot = Path.Combine(
            Path.GetTempPath(), "hrms-crystal-storage-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(contentRoot);

        try
        {
            var options = Options.Create(new CrystalReportStorageOptions
            {
                StorageRoot = "App_Data/CrystalReports",
                MaxFileSizeBytes = 1024
            });
            var storage = new PrivateCrystalReportFileStorage(
                options,
                new AcceptingInspector(),
                new TestWebHostEnvironment(contentRoot));
            byte[] source = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
            var upload = new FileUpload(
                "Countries.rpt",
                "application/octet-stream",
                source.Length,
                () => new MemoryStream(source, writable: false));

            var result = await storage.StoreAsync(upload, CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.File);
            Assert.True(File.Exists(Path.Combine(
                contentRoot, "App_Data", "CrystalReports", result.File.StorageKey)));
        }
        finally
        {
            if (Directory.Exists(contentRoot))
                Directory.Delete(contentRoot, recursive: true);
        }
    }

    private sealed class AcceptingInspector : ICrystalReportInspector
    {
        public Task<CrystalReportInspection?> InspectAsync(
            FileUpload upload,
            CancellationToken cancellationToken) =>
            Task.FromResult<CrystalReportInspection?>(new(
                true, "Countries", null, null));
    }

    private sealed class TestWebHostEnvironment(string contentRoot) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "HrManagementSystem.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = Path.Combine(contentRoot, "wwwroot");
        public string EnvironmentName { get; set; } = "Test";
        public string ContentRootPath { get; set; } = contentRoot;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
