using System.Reflection;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Files;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.Files.Contracts;
using ErpSystem.Modules.HR.Domain.Platform.Files.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Files.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Files.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Presentation.Features.Platform.Files.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Files;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace ErpSystem.Tests;

public sealed class PlatformFileOwnershipTests
{
    [Fact]
    public void GenericFilePolicy_IsPlatformOwnedWithoutHrReferences()
    {
        var platformContractsReferences = typeof(IFileStoragePolicy).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(IFileStoragePolicy).Assembly.GetName().Name);

        Assert.Equal(
            "ErpSystem.Modules.Platform.Contracts",
            typeof(IFileOperationsService).Assembly.GetName().Name);

        var dependencies = typeof(FileService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();
        Assert.Equal([typeof(IFileOperationsService)], dependencies);
    }

    [Fact]
    public void PlatformApplication_OwnsSafeStorageNamingAndPathPolicy()
    {
        var services = new ServiceCollection();
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<IFileStoragePolicy>();
        var root = Path.Combine(Path.GetTempPath(), "erp-file-policy", Guid.NewGuid().ToString("N"));

        Assert.Equal("report Final.PDF", policy.NormalizeClientFileName("report Final.PDF"));
        Assert.Equal(".pdf", policy.GetNormalizedExtension("report Final.PDF"));
        Assert.EndsWith(".png", policy.CreateStoredImageName("image.PNG"), StringComparison.Ordinal);

        var storedName = policy.CreateStoredFileName();
        var resolved = policy.ResolveStoredFilePath(root, storedName);
        Assert.Equal(Path.Combine(Path.GetFullPath(root), storedName), resolved);

        Assert.Throws<InvalidOperationException>(() =>
            policy.ResolveStoredFilePath(root, $"..{Path.DirectorySeparatorChar}escape.txt"));
        Assert.Throws<InvalidOperationException>(() =>
            policy.ResolveStoredFilePath(root, $"nested{Path.DirectorySeparatorChar}escape.txt"));
    }

    [Fact]
    public void ExistingFileHttpContract_RemainsHrOwnedAndRouteCompatible()
    {
        var upload = typeof(FilesController).GetMethod(nameof(FilesController.Upload));
        var uploadMany = typeof(FilesController).GetMethod(nameof(FilesController.UploadMany));
        var download = typeof(FilesController).GetMethod(nameof(FilesController.Download));
        var delete = typeof(FilesController).GetMethod(nameof(FilesController.Delete));

        Assert.NotNull(upload);
        Assert.NotNull(uploadMany);
        Assert.NotNull(download);
        Assert.NotNull(delete);
        Assert.Null(upload!.GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Null(uploadMany!.GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Equal("{storedFilename}", download!.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal("{storedFilename}", delete!.GetCustomAttribute<HttpDeleteAttribute>()!.Template);
        Assert.Equal("ErpSystem.Modules.HR.Application", typeof(UploadFileRequest).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.HR.Application", typeof(UploadFileResponse).Assembly.GetName().Name);
    }

    [Fact]
    public async Task LegacyHrPersistence_KeepsFilesTableAndHrSchema()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(options, new EmptyCurrentActor(), TimeProvider.System);

        var entityType = context.Model.FindEntityType(typeof(UploadedFile));
        Assert.NotNull(entityType);
        Assert.Equal("UploadedFile", entityType!.GetTableName());
        Assert.Equal(ApplicationDbContext.Schema, entityType.GetSchema());
    }

    [Fact]
    public async Task LegacyHrAdapter_PreservesStoredMetadataAndProtectedFileBehavior()
    {
        var root = Path.Combine(Path.GetTempPath(), "erp-file-adapter", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
                .Options;
            await using var context = new ApplicationDbContext(
                options,
                new TestCurrentActor("user-1", "tenant-1", 7),
                TimeProvider.System);

            var realtime = new RecordingRealtimeDispatcher();
            var platformServices = new ServiceCollection();
            platformServices.AddPlatformApplication();
            using var platformProvider = platformServices.BuildServiceProvider();
            var policy = platformProvider.GetRequiredService<IFileStoragePolicy>();
            var adapter = new LegacyFileOperationsAdapter(
                new TestWebHostEnvironment(root),
                context,
                realtime,
                policy);
            var services = new ServiceCollection();
            services.AddPlatformApplication();
            services.AddSingleton<IFileMetadataStore>(adapter);
            services.AddSingleton<IFileBinaryStore>(adapter);
            services.AddSingleton<IFileChangePublisher>(adapter);
            using var provider = services.BuildServiceProvider();
            var service = new FileService(provider.GetRequiredService<IFileOperationsService>());
            byte[] content = [1, 2, 3, 4];
            var upload = new FileUpload(
                "Quarterly Report.PDF",
                "application/pdf",
                content.Length,
                () => new MemoryStream(content, writable: false));

            var storedName = await service.UploadAsync(upload);

            var stored = await context.Files.SingleAsync();
            Assert.Equal("Quarterly Report.PDF", stored.FileName);
            Assert.Equal(".pdf", stored.FileExtension);
            Assert.Equal(storedName, stored.StoredFileName);
            Assert.Equal("tenant-1", stored.TenantId);
            Assert.Equal(7, stored.CompanyId);
            Assert.Equal("user-1", stored.CreatedById);
            Assert.True(File.Exists(Path.Combine(root, "App_Data", "ProtectedFiles", "uploads", storedName)));

            var (stream, contentType, fileName) = await service.DownloadAsync(storedName);
            Assert.NotNull(stream);
            await using (stream)
            {
                using var memory = new MemoryStream();
                await stream.CopyToAsync(memory);
                Assert.Equal(content, memory.ToArray());
            }
            Assert.Equal("application/pdf", contentType);
            Assert.Equal("Quarterly Report.PDF", fileName);

            Assert.True(await service.DeleteAsync(storedName));
            Assert.False(File.Exists(Path.Combine(root, "App_Data", "ProtectedFiles", "uploads", storedName)));
            Assert.Collection(realtime.Requests,
                change => Assert.Equal("Create", change.Action),
                change => Assert.Equal("Delete", change.Action));
        }
        finally
        {
            if (Directory.Exists(root))
                Directory.Delete(root, recursive: true);
        }
    }

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class TestCurrentActor(string userId, string tenantId, int companyId) : ICurrentActor
    {
        public string? UserId => userId;
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Requests { get; } = [];
        public void Dispatch(RealtimeChangeRequest request) => Requests.Add(request);
    }

    private sealed class TestWebHostEnvironment(string contentRoot) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "ErpSystem.Tests";
        public string EnvironmentName { get; set; } = "Test";
        public string WebRootPath { get; set; } = Path.Combine(contentRoot, "wwwroot");
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = contentRoot;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
