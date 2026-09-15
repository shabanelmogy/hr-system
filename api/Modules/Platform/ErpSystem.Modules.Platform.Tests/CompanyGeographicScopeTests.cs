using ErpSystem.Modules.Platform.Application.Features.CompanyGeography;
using ErpSystem.Modules.Platform.Presentation.Features.Tenancy.V1;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyGeographicScopeTests
{
    [Fact]
    public void PlatformFeature_ValidatesDefaultAndRegistrationCountriesInsideScope()
    {
        var validator = new UpdateCompanyGeographicScopeCommandValidator();
        var invalid = validator.Validate(new UpdateCompanyGeographicScopeCommand([1, 2], 3, 1));
        Assert.False(invalid.IsValid);
        var valid = validator.Validate(new UpdateCompanyGeographicScopeCommand([1, 2], 2, 1));
        Assert.True(valid.IsValid);
    }

    [Fact]
    public void Controller_UsesMediatRAndPreservesVersionedRoute()
    {
        var constructor = Assert.Single(typeof(CompanyGeographicScopeController).GetConstructors());
        Assert.Equal(typeof(ISender), constructor.GetParameters().Single().ParameterType);
        var route = typeof(CompanyGeographicScopeController).GetCustomAttributes(typeof(RouteAttribute), inherit: true).Single();
        Assert.Equal("api/v{version:apiVersion}/company-geographic-scope", ((RouteAttribute)route).Template);
    }
}