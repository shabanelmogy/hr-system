global using System.ComponentModel.DataAnnotations;
global using System.Globalization;
global using System.IdentityModel.Tokens.Jwt;
global using System.Linq.Dynamic.Core;
global using System.Reflection;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;
global using System.Threading.RateLimiting;
global using Asp.Versioning;
global using Asp.Versioning.ApiExplorer;
global using FluentValidation;
global using Hangfire;
global using HealthChecks.UI.Client;

global using Microsoft.EntityFrameworkCore.ChangeTracking;
global using Microsoft.EntityFrameworkCore.Diagnostics;
global using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

global using HrManagementSystem.Features.Security.Authorization.Contracts;
global using HrManagementSystem.Features.Security.Authorization.Services;
global using HrManagementSystem.Features.GeographicalInformation.States.Services;
global using HrManagementSystem.Features.Analytics.Reports.Contracts;
global using HrManagementSystem.Features.Analytics.Reports.Services;
global using HrManagementSystem.Features.Security.Users.Contracts;
global using HrManagementSystem.Features.Platform.Files.Contracts;
global using HrManagementSystem.Features.Platform.Localization.Contracts;
global using HrManagementSystem.Features.Catalog.SubCategories.Contracts;
global using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;
global using HrManagementSystem.Features.GeographicalInformation.States.Contracts;
global using HrManagementSystem.Features.Platform.Files.Services;
global using HrManagementSystem.Features.Platform.Localization.Services;
global using HrManagementSystem.Features.Catalog.SubCategories.Services;
global using HrManagementSystem.Features.Security.Users.Services;
global using HrManagementSystem.Features.Analytics.Views.Contracts;
global using HrManagementSystem.Features.Analytics.Views.Services;
global using HrManagementSystem.Features.GeographicalInformation.Addresses.Errors;
global using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Errors;
global using HrManagementSystem.Features.Security.ApiKeys.Errors;
global using HrManagementSystem.Features.Security.Authorization.Errors;
global using HrManagementSystem.Features.Catalog.Categories.Errors;
global using HrManagementSystem.Features.GeographicalInformation.Countries.Errors;
global using HrManagementSystem.Features.GeographicalInformation.Districts.Errors;
global using HrManagementSystem.Features.Platform.Localization.Errors;
global using HrManagementSystem.Features.Analytics.Reports.Errors;
global using HrManagementSystem.Features.GeographicalInformation.States.Errors;
global using HrManagementSystem.Features.Catalog.SubCategories.Errors;
global using HrManagementSystem.Features.Security.Users.Errors;

global using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
global using HrManagementSystem.Shared.Errors;
global using HrManagementSystem.Infrastructure.Persistance.Seeds;
global using HrManagementSystem.Infrastructure.Security.Authentication;
global using HrManagementSystem.Infrastructure.Localization;

global using HrManagementSystem.Infrastructure.Localization.Configurations;
global using HrManagementSystem.Infrastructure.Persistance;
global using HrManagementSystem.Shared.Extensions;
global using HrManagementSystem.Shared.Settings;
global using HrManagementSystem.Infrastructure.Versions;
global using HrManagementSystem.Shared.Helpers;
global using HrManagementSystem.Shared.Consts;

global using HrManagementSystem.Infrastructure.Dependencies;
global using HrManagementSystem.Infrastructure.Hangfire.Filters;
global using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

global using HrManagementSystem.Features.Security.ApiKeys.Entities;
global using HrManagementSystem.Features.Appointments.Entities;


global using HrManagementSystem.Features.Security.Authentication.Entities;
global using HrManagementSystem.Features.Catalog.Categories.Entities;
global using HrManagementSystem.Features.Platform.EntityChangeLogs.Entities;
global using HrManagementSystem.Features.Platform.Files.Entities;
global using HrManagementSystem.Features.Analytics.Reports.Entities;
global using HrManagementSystem.Features.Catalog.SubCategories.Entities;
global using HrManagementSystem.Shared.Entities;
global using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;
global using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;
global using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;

global using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;

global using HrManagementSystem.Features.GeographicalInformation.States.Entities;
global using HrManagementSystem.Features.Employees.Entities;

global using HrManagementSystem.Features.Platform.EntityChangeLogs.Services;
global using HrManagementSystem.Features.Analytics.Exporting.Services;
global using HrManagementSystem.Features.Catalog.Categories.Services;
global using HrManagementSystem.Features.Analytics.Dashboard.Services;
global using HrManagementSystem.Features.Security.Authentication.Services;
global using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Services;
global using HrManagementSystem.Features.GeographicalInformation.Districts.Services;
global using HrManagementSystem.Features.GeographicalInformation.Countries.Services;

global using HrManagementSystem.Features.Security.Authentication.Contracts;
global using HrManagementSystem.Features.Catalog.Categories.Contracts;
global using HrManagementSystem.Features.Analytics.Dashboard.Contracts;
global using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
global using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
global using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

global using HrManagementSystem.Features.Security.ApiKeys.Services;
global using HrManagementSystem.Shared.Services;

global using Mapster;
global using MapsterMapper;
global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Diagnostics.HealthChecks;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.Identity.UI.Services;
global using Microsoft.AspNetCore.Localization;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.SignalR;
global using Microsoft.AspNetCore.WebUtilities;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.Extensions.Caching.Distributed;
global using Microsoft.Extensions.Caching.Hybrid;
global using Microsoft.Extensions.Localization;
global using Microsoft.Extensions.Options;
global using Microsoft.IdentityModel.Tokens;
global using Microsoft.OpenApi;
global using Serilog;
global using Serilog.Context;
global using Swashbuckle.AspNetCore.SwaggerGen;


