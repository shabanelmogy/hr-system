using FluentValidation;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class GeographicalNameRulesTests
{
    [Theory]
    [InlineData("New Cairo 2")]
    [InlineData("منطقة 7")]
    [InlineData("R&D / 2")]
    public void SharedValidatorAcceptsInternationalNamesWithSpacesDigitsAndPunctuation(string value)
    {
        var validator = new InlineValidator<NameRequest>();
        validator.RuleFor(request => request.Name)
            .GeographicalName(new EchoStringLocalizer(), nameof(NameRequest.Name));

        var result = validator.Validate(new NameRequest(value));

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("New Cairo 2")]
    [InlineData("منطقة 7")]
    [InlineData("R&D / 2")]
    public void AcceptsPrintableUnicodeNamesWithSpacesDigitsAndPunctuation(string value)
    {
        Assert.True(GeographicalNameRules.IsValid(value));
    }

    [Theory]
    [InlineData("Cairo\nSouth")]
    [InlineData("Cairo\tSouth")]
    [InlineData("Cairo\u0000")]
    public void RejectsControlAndLineBreakCharacters(string value)
    {
        Assert.False(GeographicalNameRules.IsValid(value));
    }

    [Fact]
    public void RejectsMalformedUtf16WithoutThrowing()
    {
        Assert.False(GeographicalNameRules.IsValid("\uD800"));
    }

    [Fact]
    public void RejectsBlankNames()
    {
        Assert.False(GeographicalNameRules.IsValid("   "));
    }

    [Fact]
    public void Normalize_TrimsAndUsesCanonicalUnicodeForm()
    {
        var decomposed = "  Cafe\u0301  ";

        Assert.Equal("Café", GeographicalNameRules.Normalize(decomposed));
        Assert.True(GeographicalNameRules.IsValid(decomposed));
    }

    [Fact]
    public void SharedValidator_CanonicalizesTheRequestBeforeLengthAndPersistenceChecks()
    {
        var request = new NameRequest("  Cafe\u0301  ");
        var validator = new InlineValidator<NameRequest>();
        validator.RuleFor(item => item.Name)
            .GeographicalName(new EchoStringLocalizer(), nameof(NameRequest.Name));

        var result = validator.Validate(request);

        Assert.True(result.IsValid);
        Assert.Equal("Café", request.Name);
    }

    private sealed record NameRequest(string Name);

    private sealed class EchoStringLocalizer : IStringLocalizer
    {
        public LocalizedString this[string name] => new(name, name);

        public LocalizedString this[string name, params object[] arguments] => new(name, name);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
