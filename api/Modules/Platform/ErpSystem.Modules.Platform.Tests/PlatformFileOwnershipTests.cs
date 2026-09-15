using System.Reflection;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Application.Files.Settings;
using ErpSystem.Modules.Platform.Application.Files.Validation;
using ErpSystem.Modules.Platform.Application.Features.Platform.Files.Contracts;
using ErpSystem.Modules.Platform.Domain.Platform.Files.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Files;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Files.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Files.Storage;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.Files.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Files;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using MediatR;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformFileOwnershipTests
{
    [Fact]
    public void GenericFilePolicyAndOperations_ArePlatformOwnedWithoutHrReferences()
    {
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(IFileStoragePolicy).Assembly.GetName().Name);

        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(UploadFileCommand).Assembly.GetName().Name);

        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(PlatformFileUpload).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(FileSettings).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(FileSizeValidator).Assembly.GetName().Name);

        var contractsAssembly = typeof(PlatformFileUpload).Assembly;
        Assert.DoesNotContain(
            contractsAssembly.GetTypes(),
            type => type.Namespace?.StartsWith(
                "ErpSystem.Modules.Platform.Contracts.Files.Validation",
                StringComparison.Ordinal) == true);
        Assert.DoesNotContain(
            contractsAssembly.GetTypes(),
            type => type.Namespace?.StartsWith(
                "ErpSystem.Modules.Platform.Contracts.Files.Settings",
                StringComparison.Ordinal) == true);
    }

    [Fact]
    public void PlatformInfrastructure_OwnsSafeStorageNamingAndPathPolicy()
    {
        IFileStoragePolicy policy = new FileStoragePolicy();
        Assert.Equal("ErpSystem.Modules.Platform.Infrastructure", policy.GetType().Assembly.GetName().Name);
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
    public void ExistingFileHttpContract_RemainsPlatformOwnedAndRouteCompatible()
    {
        var constructor = typeof(FilesController).GetConstructors().Single();
        var upload = typeof(FilesController).GetMethod(nameof(FilesController.Upload));
        var uploadMany = typeof(FilesController).GetMethod(nameof(FilesController.UploadMany));
        var download = typeof(FilesController).GetMethod(nameof(FilesController.Download));
        var delete = typeof(FilesController).GetMethod(nameof(FilesController.Delete));

        Assert.Contains(
            constructor.GetParameters(),
            parameter => parameter.ParameterType == typeof(ISender));
        Assert.DoesNotContain(
            constructor.GetParameters(),
            parameter => parameter.ParameterType.Name.EndsWith("Service", StringComparison.Ordinal));
        Assert.DoesNotContain(
            constructor.GetParameters(),
            parameter => parameter.ParameterType.FullName?.EndsWith(".IFileService", StringComparison.Ordinal) == true);
        Assert.NotNull(upload);
        Assert.NotNull(uploadMany);
        Assert.NotNull(download);
        Assert.NotNull(delete);
        Assert.Null(upload!.GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Null(uploadMany!.GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Equal("{storedFilename}", download!.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal("{storedFilename}", delete!.GetCustomAttribute<HttpDeleteAttribute>()!.Template);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(UploadFileRequest).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(UploadFileResponse).Assembly.GetName().Name);
    }

    [Fact]
    public async Task PlatformPersistence_KeepsFilesTableAndPlatformSchema()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new PlatformDbContext(options, new EmptyCurrentActor());

        var entityType = context.Model.FindEntityType(typeof(UploadedFile));
        Assert.NotNull(entityType);
        Assert.Equal("UploadedFile", entityType!.GetTableName());
        Assert.Equal(PlatformDbContext.Schema, entityType.GetSchema());
    }

    [Fact]
    public async Task PlatformStore_PreservesStoredMetadataAndProtectedFileBehavior()
    {
        var root = Path.Combine(Path.GetTempPath(), "erp-file-adapter", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var options = new DbContextOptionsBuilder<PlatformDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
                .Options;
            await using var context = new PlatformDbContext(
                options,
                new TestCurrentActor("user-1", "tenant-1", 7));

            var realtime = new RecordingRealtimeDispatcher();
            IFileStoragePolicy policy = new FileStoragePolicy();
            var store = new PlatformFileOperationsStore(
                new TestWebHostEnvironment(root),
                context,
                realtime,
                policy);
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddPlatformApplication();
            services.AddSingleton<IFileStoragePolicy>(policy);
            services.AddSingleton<IFileUploadInspectionService, AllowFileUploadInspectionService>();
            services.AddSingleton<IFileMetadataStore>(store);
            services.AddSingleton<IFileBinaryStore>(store);
            services.AddSingleton<IFileChangePublisher>(store);
            using var provider = services.BuildServiceProvider();
            var sender = provider.GetRequiredService<ISender>();
            byte[] content = [1, 2, 3, 4];
            var upload = new PlatformFileUpload(
                "Quarterly Report.PDF",
                "application/pdf",
                content.Length,
                () => new MemoryStream(content, writable: false));

            var storedName = await sender.Send(new UploadFileCommand(upload));

            var stored = await context.Files.SingleAsync();
            Assert.Equal("Quarterly Report.PDF", stored.FileName);
            Assert.Equal(".pdf", stored.FileExtension);
            Assert.Equal(storedName, stored.StoredFileName);
            Assert.Equal("tenant-1", stored.TenantId);
            Assert.Equal(7, stored.CompanyId);
            Assert.Equal("user-1", stored.CreatedById);
            var uploadsPath = PlatformFileStoragePaths.GetUploadsPath(new TestWebHostEnvironment(root));
            Assert.True(File.Exists(Path.Combine(uploadsPath, storedName)));

            var download = await sender.Send(new DownloadFileQuery(storedName));
            Assert.NotNull(download.Stream);
            await using (download.Stream)
            {
                using var memory = new MemoryStream();
                await download.Stream.CopyToAsync(memory);
                Assert.Equal(content, memory.ToArray());
            }
            Assert.Equal("application/pdf", download.ContentType);
            Assert.Equal("Quarterly Report.PDF", download.FileName);

            Assert.True(await sender.Send(new DeleteFileCommand(storedName)));
            Assert.False(File.Exists(Path.Combine(uploadsPath, storedName)));
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

    private sealed class AllowFileUploadInspectionService : IFileUploadInspectionService
    {
        public Task InspectAsync(PlatformFileUpload upload, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
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

