using System;
using System.Collections.Generic;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    public sealed class CrystalReportProfileRegistry
    {
        private readonly IReadOnlyDictionary<string, CrystalReportProfile> _profiles;

        public CrystalReportProfileRegistry(IEnumerable<CrystalReportProfile> profiles)
        {
            if (profiles == null)
                throw new ArgumentNullException(nameof(profiles));

            var map = new Dictionary<string, CrystalReportProfile>(StringComparer.OrdinalIgnoreCase);
            foreach (var profile in profiles)
            {
                if (profile == null || string.IsNullOrWhiteSpace(profile.EntityKey))
                    throw new ArgumentException("Every Crystal report profile must have an entity key.", nameof(profiles));
                if (map.ContainsKey(profile.EntityKey))
                    throw new InvalidOperationException(
                        "Duplicate Crystal report runtime profile: " + profile.EntityKey + ".");

                map.Add(profile.EntityKey, profile);
            }

            _profiles = map;
        }

        public CrystalReportProfile GetRequired(string entityKey)
        {
            CrystalReportProfile profile;
            if (string.IsNullOrWhiteSpace(entityKey) || !_profiles.TryGetValue(entityKey, out profile))
                throw new UnsupportedCrystalReportProfileException(
                    "The report entity does not have an approved runtime profile.");

            return profile;
        }

        public int Count => _profiles.Count;

        public static CrystalReportProfileRegistry CreateDefault()
        {
            return new CrystalReportProfileRegistry(new[]
            {
                new CrystalReportProfile(
                    "countries",
                    new[] { "CountryId", "CountryAr", "CountryEn", "StateId", "StateAr", "StateEn" }),
                new CrystalReportProfile(
                    "states",
                    new[]
                    {
                        "StateId", "StateAr", "StateEn", "StateCode",
                        "CountryId", "CountryAr", "CountryEn"
                    }),
                new CrystalReportProfile(
                    "districts",
                    new[]
                    {
                        "DistrictId", "DistrictAr", "DistrictEn", "DistrictCode",
                        "StateId", "StateAr", "StateEn", "AddressesCount"
                    }),
                new CrystalReportProfile(
                    "addresstypes",
                    new[] { "AddressTypeId", "AddressTypeAr", "AddressTypeEn", "AddressesCount" })
            });
        }
    }

    public sealed class CrystalReportProfile
    {
        public CrystalReportProfile(string entityKey, IReadOnlyCollection<string> requiredColumns)
        {
            if (string.IsNullOrWhiteSpace(entityKey))
                throw new ArgumentException("An entity key is required.", nameof(entityKey));
            if (requiredColumns == null || requiredColumns.Count == 0)
                throw new ArgumentException("At least one required column is required.", nameof(requiredColumns));

            EntityKey = entityKey;
            RequiredColumns = requiredColumns;
        }

        public string EntityKey { get; private set; }
        public IReadOnlyCollection<string> RequiredColumns { get; private set; }
    }

    public sealed class UnsupportedCrystalReportProfileException : Exception
    {
        public UnsupportedCrystalReportProfileException(string message) : base(message)
        {
        }
    }
}
