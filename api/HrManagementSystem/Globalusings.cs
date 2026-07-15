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

global using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
global using HrManagementSystem.Shared.Errors;
global using HrManagementSystem.Infrastructure.Persistance.Seeds;
global using HrManagementSystem.Infrastructure.Security.Authentication;
global using HrManagementSystem.Infrastructure.Localization;
global using HrManagementSystem.Infrastructure.Validation;

global using HrManagementSystem.Infrastructure.Localization.Configurations;
global using HrManagementSystem.Infrastructure.Persistance;
global using HrManagementSystem.Shared.Extensions;
global using HrManagementSystem.Shared.Settings;
global using HrManagementSystem.Shared.Storage;
global using HrManagementSystem.Infrastructure.Versions;
global using HrManagementSystem.Shared.Helpers;
global using HrManagementSystem.Shared.Consts;

global using HrManagementSystem.Infrastructure.Dependencies;
global using HrManagementSystem.Infrastructure.Hangfire.Filters;
global using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

global using HrManagementSystem.Shared.Entities;
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
global using Microsoft.AspNetCore.RateLimiting;
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


