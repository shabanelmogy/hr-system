using System;
using CrystalReportGeneratorApi.Helpers;

namespace CrystalReportGeneratorApi.Services
{
    public class DatabaseService
    {
        private readonly string _connectionStringName;

        public DatabaseService(string connectionStringName = "DbConnectionString")
        {
            _connectionStringName = connectionStringName;
            InitializeTables();
        }

        private void InitializeTables()
        {
            CreateCompaniesView();
            CreateStatesView();
        }

        public void CreateOrAlterView(string query)
        {      
            try
            {
                DatabaseHelper.ExecuteQuery(query, _connectionStringName);
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating or altering vw_ReportParameters view.", ex);
            }
        }

        public void CreateCompaniesView()
        {
            var query = $"CREATE OR ALTER VIEW {ViewsName.AllCountries} AS {ViewsQueries.AllCountries}";
            CreateOrAlterView(query);
        }

        public void CreateStatesView()
        {
            var query = $"CREATE OR ALTER VIEW {ViewsName.AllStates} AS {ViewsQueries.AllStates}";
            CreateOrAlterView(query);
        }
    }
}
