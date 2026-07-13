namespace CrystalReportGeneratorApi.Helpers
{
    public static class ViewsName
    {
        private static readonly string ViewPrefix = "V_"; 

        public static string AllCountries = $"{ViewPrefix}{nameof(AllCountries)}";

        public static string AllCountriesWithStates = $"{ViewPrefix}{nameof(AllCountriesWithStates)}";
    }
}