namespace CrystalReportGeneratorApi.Helpers
{
    public static class ViewsQueries
    {
        // Query for all companies with relevant joins
        public static string AllCountries =>
         "select Countries.Id as CountryId,Countries.NameAr as CountryAr,Countries.NameEn as CountryEn," +
         "States.Id as StateId,States.NameAr as StateAr,States.NameEn as StateEn " +
         "from Countries left join States on Countries.Id = States.CountryId";

        public static string AllStates =>
         "select States.Id as StateId,States.NameAr as StateAr,States.NameEn as StateEn," +
         "States.Code as StateCode,Countries.Id as CountryId,Countries.NameAr as CountryAr," +
         "Countries.NameEn as CountryEn from States inner join Countries on States.CountryId = Countries.Id";
    }
}
