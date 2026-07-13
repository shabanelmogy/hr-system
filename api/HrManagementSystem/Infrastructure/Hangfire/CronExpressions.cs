namespace HrManagementSystem.Infrastructure.Hangfire
{
    /// <summary>
    /// Static class providing common Cron expressions for Hangfire job scheduling
    /// </summary>
    public static class CronExpressions
    {
        // Basic intervals

        /// <summary>
        /// Run once every minute
        /// </summary>
        public static string EveryMinute => "* * * * *";

        /// <summary>
        /// Run once every 5 minutes (00:00, 00:05, 00:10, etc.)
        /// </summary>
        public static string EveryFiveMinutes => "*/5 * * * *";

        /// <summary>
        /// Run once every 10 minutes
        /// </summary>
        public static string EveryTenMinutes => "*/10 * * * *";

        /// <summary>
        /// Run once every 15 minutes
        /// </summary>
        public static string EveryFifteenMinutes => "*/15 * * * *";

        /// <summary>
        /// Run once every 30 minutes
        /// </summary>
        public static string EveryThirtyMinutes => "*/30 * * * *";

        /// <summary>
        /// Run once every hour (at the beginning of the hour)
        /// </summary>
        public static string Hourly => "0 * * * *";

        /// <summary>
        /// Run once every 2 hours (at the beginning of every 2nd hour)
        /// </summary>
        public static string EveryTwoHours => "0 */2 * * *";

        /// <summary>
        /// Run once every 6 hours (at 00:00, 06:00, 12:00, 18:00)
        /// </summary>
        public static string EverySixHours => "0 */6 * * *";

        /// <summary>
        /// Run once every 12 hours (at 00:00 and 12:00)
        /// </summary>
        public static string EveryTwelveHours => "0 */12 * * *";

        /// <summary>
        /// Run once daily at midnight (00:00)
        /// </summary>
        public static string Daily => "0 0 * * *";

        /// <summary>
        /// Run once weekly on Sunday at midnight
        /// </summary>
        public static string Weekly => "0 0 * * 0";

        /// <summary>
        /// Run once monthly on the 1st at midnight
        /// </summary>
        public static string Monthly => "0 0 1 * *";

        /// <summary>
        /// Run once yearly on January 1st at midnight
        /// </summary>
        public static string Yearly => "0 0 1 1 *";

        // Specific times of day

        /// <summary>
        /// Run daily at 1:00 AM
        /// </summary>
        public static string DailyAt1am => "0 1 * * *";

        /// <summary>
        /// Run daily at 3:00 AM (common time for nightly jobs)
        /// </summary>
        public static string DailyAt3am => "0 3 * * *";

        /// <summary>
        /// Run daily at 6:00 AM
        /// </summary>
        public static string DailyAt6am => "0 6 * * *";

        /// <summary>
        /// Run daily at 9:00 AM
        /// </summary>
        public static string DailyAt9am => "0 9 * * *";

        /// <summary>
        /// Run daily at 12:00 PM (noon)
        /// </summary>
        public static string DailyAtNoon => "0 12 * * *";

        /// <summary>
        /// Run daily at 6:00 PM
        /// </summary>
        public static string DailyAt6pm => "0 18 * * *";

        /// <summary>
        /// Run daily at 9:00 PM
        /// </summary>
        public static string DailyAt9pm => "0 21 * * *";

        // Weekly on specific days

        /// <summary>
        /// Run every Monday at midnight
        /// </summary>
        public static string WeeklyOnMonday => "0 0 * * 1";

        /// <summary>
        /// Run every Tuesday at midnight
        /// </summary>
        public static string WeeklyOnTuesday => "0 0 * * 2";

        /// <summary>
        /// Run every Wednesday at midnight
        /// </summary>
        public static string WeeklyOnWednesday => "0 0 * * 3";

        /// <summary>
        /// Run every Thursday at midnight
        /// </summary>
        public static string WeeklyOnThursday => "0 0 * * 4";

        /// <summary>
        /// Run every Friday at midnight
        /// </summary>
        public static string WeeklyOnFriday => "0 0 * * 5";

        /// <summary>
        /// Run every Saturday at midnight
        /// </summary>
        public static string WeeklyOnSaturday => "0 0 * * 6";

        /// <summary>
        /// Run every Sunday at midnight
        /// </summary>
        public static string WeeklyOnSunday => "0 0 * * 0";

        // Business hours patterns

        /// <summary>
        /// Run every hour during business hours (8 AM - 5 PM, Monday - Friday)
        /// </summary>
        public static string BusinessHourly => "0 8-17 * * 1-5";

        /// <summary>
        /// Run at the start of business hours (8 AM, Monday - Friday)
        /// </summary>
        public static string StartOfBusinessDay => "0 8 * * 1-5";

        /// <summary>
        /// Run at the end of business hours (5 PM, Monday - Friday)
        /// </summary>
        public static string EndOfBusinessDay => "0 17 * * 1-5";

        // Monthly patterns

        /// <summary>
        /// Run on the 15th of every month at midnight
        /// </summary>
        public static string MonthlyOnThe15th => "0 0 15 * *";

        /// <summary>
        /// Run on the last day of every month at 11:00 PM
        /// </summary>
        public static string LastDayOfMonth => "0 23 L * *";

        /// <summary>
        /// Run on the first Monday of every month at 9:00 AM
        /// </summary>
        public static string FirstMondayOfMonth => "0 9 * * 1#1";

        /// <summary>
        /// Run on the last Friday of every month at 3:00 PM
        /// </summary>
        public static string LastFridayOfMonth => "0 15 * * 5L";

        // Quarterly patterns

        /// <summary>
        /// Run on the first day of each quarter (Jan 1, Apr 1, Jul 1, Oct 1) at midnight
        /// </summary>
        public static string FirstDayOfQuarter => "0 0 1 1,4,7,10 *";

        /// <summary>
        /// Run on the last day of each quarter at 11:00 PM
        /// </summary>
        public static string LastDayOfQuarter => "0 23 L 3,6,9,12 *";

        // Helper methods to construct Cron expressions

        /// <summary>
        /// Creates a Cron expression for a specific time every day
        /// </summary>
        /// <param name="hour">Hour (0-23)</param>
        /// <param name="minute">Minute (0-59)</param>
        /// <returns>Cron expression string</returns>
        public static string DailyAt(int hour, int minute) => $"{minute} {hour} * * *";

        /// <summary>
        /// Creates a Cron expression for a specific time on specific weekdays
        /// </summary>
        /// <param name="hour">Hour (0-23)</param>
        /// <param name="minute">Minute (0-59)</param>
        /// <param name="days">Days of week (0=Sunday, 1=Monday, etc.)</param>
        /// <returns>Cron expression string</returns>
        public static string WeeklyAt(int hour, int minute, params int[] days)
        {
            string dayList = string.Join(",", days);
            return $"{minute} {hour} * * {dayList}";
        }

        /// <summary>
        /// Creates a Cron expression for a specific time on a specific day of the month
        /// </summary>
        /// <param name="hour">Hour (0-23)</param>
        /// <param name="minute">Minute (0-59)</param>
        /// <param name="day">Day of month (1-31)</param>
        /// <returns>Cron expression string</returns>
        public static string MonthlyAt(int hour, int minute, int day) => $"{minute} {hour} {day} * *";

        /// <summary>
        /// Creates a Cron expression that runs at specific intervals
        /// </summary>
        /// <param name="minutes">Minutes between runs</param>
        /// <returns>Cron expression string</returns>
        public static string EveryXMinutes(int minutes)
        {
            if (minutes < 1 || minutes > 59)
                throw new ArgumentOutOfRangeException(nameof(minutes), "Minutes must be between 1 and 59");

            return $"*/{minutes} * * * *";
        }

        /// <summary>
        /// Creates a Cron expression that runs at specific intervals
        /// </summary>
        /// <param name="hours">Hours between runs</param>
        /// <returns>Cron expression string</returns>
        public static string EveryXHours(int hours)
        {
            if (hours < 1 || hours > 23)
                throw new ArgumentOutOfRangeException(nameof(hours), "Hours must be between 1 and 23");

            return $"0 */{hours} * * *";
        }

        /// <summary>
        /// Combines multiple Cron expressions with a comma
        /// </summary>
        /// <param name="expressions">The Cron expressions to combine</param>
        /// <returns>Combined Cron expression</returns>
        public static string Combine(params string[] expressions)
        {
            return string.Join(",", expressions);
        }
    }
}