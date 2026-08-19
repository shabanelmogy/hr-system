using System.Data.Common;
using Microsoft.Data.SqlClient;

namespace HrManagementSystem.Infrastructure.Common.Errors;

public static class DatabaseExceptionClassifier
{
    public static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        for (var current = exception.InnerException; current is not null; current = current.InnerException)
        {
            if (current is SqlException sqlException &&
                IsUniqueConstraintViolationNumber(sqlException.Number))
            {
                return true;
            }

            if (current is DbException databaseException &&
                IsUniqueConstraintViolationNumber(databaseException.ErrorCode))
            {
                return true;
            }
        }

        return false;
    }

    public static bool IsUniqueConstraintViolationNumber(int errorNumber) =>
        errorNumber is 2601 or 2627;
}
