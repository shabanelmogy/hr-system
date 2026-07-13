using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;

namespace CrystalReportGeneratorApi.Helpers
{
    public static class DatabaseHelper
    {
        public static DataTable ExecuteQuery(string query, string connectionStringName = "DbConnectionString")
        {
            if (string.IsNullOrEmpty(query))
                throw new ArgumentException("Query cannot be null or empty.", nameof(query));

            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName]?.ConnectionString;

            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException($"Connection string '{connectionStringName}' not found in configuration.");

            DataTable resultTable = new DataTable();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlDataAdapter adapter = new SqlDataAdapter(query, connection))
                    {
                        adapter.Fill(resultTable);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error executing query.", ex);
            }

            return resultTable;
        }

        public static DataTable FillDataTable(string storedProcedureOrQuery, SortedList<string, object> parameters, CommandType queryType = CommandType.Text)
        {
            DataTable resultTable = new DataTable();
            SqlDataAdapter dataAdapter = null;

            try
            {
                // Ensure connection is open
                using (SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["DbConnectionString"].ConnectionString))
                {
                    sqlConnection.Open();

                    using (SqlCommand sqlCommand = new SqlCommand(storedProcedureOrQuery, sqlConnection))
                    {
                        sqlCommand.CommandType = queryType;

                        // Add parameters from SortedList
                        if (parameters != null)
                        {
                            foreach (var key in parameters.Keys)
                            {
                                sqlCommand.Parameters.AddWithValue(key, parameters[key] ?? DBNull.Value);
                            }
                        }

                        // Fill DataTable using SqlDataAdapter
                        dataAdapter = new SqlDataAdapter(sqlCommand);
                        dataAdapter.Fill(resultTable);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log or handle exception
                Console.WriteLine($"Error: {ex.Message}");
                throw new Exception("Error while executing query.", ex);
            }
            finally
            {
                dataAdapter?.Dispose();
            }

            return resultTable;
        }
        public static void CreateOrAlterView(string viewName, string viewQuery, string connectionStringName = "DbConnectionString")
        {
            if (string.IsNullOrWhiteSpace(viewName))
                throw new ArgumentException("View name cannot be empty.", nameof(viewName));

            if (string.IsNullOrWhiteSpace(viewQuery))
                throw new ArgumentException("View query cannot be empty.", nameof(viewQuery));

            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName]?.ConnectionString;

            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException($"Connection string '{connectionStringName}' not found in configuration.");

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string sql = $"CREATE OR ALTER VIEW [{viewName}] AS {viewQuery}";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating or altering view.", ex);
            }
        }

        public static void DropView(string viewName, string connectionStringName = "DbConnectionString")
        {
            if (string.IsNullOrWhiteSpace(viewName))
                throw new ArgumentException("View name cannot be empty.", nameof(viewName));

            string connectionString = ConfigurationManager.ConnectionStrings[connectionStringName]?.ConnectionString;

            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException($"Connection string '{connectionStringName}' not found in configuration.");

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string sql = $"IF EXISTS (SELECT * FROM sys.views WHERE name = @viewName) DROP VIEW [{viewName}]";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@viewName", viewName);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error dropping view.", ex);
            }
        }
    }
}

