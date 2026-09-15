using System;
using System.Configuration;
using System.Threading;
using System.Threading.Tasks;

namespace CrystalReportGeneratorApi.Runtime
{
    /// <summary>
    /// Bounds concurrent SAP Crystal SDK work inside one runtime worker process.
    /// Rendering and report inspection both use native/resource-heavy Crystal APIs.
    /// </summary>
    public static class CrystalReportExecutionGate
    {
        private const int DefaultMaximumConcurrentExecutions = 2;
        private const int DefaultQueueTimeoutSeconds = 5;
        private static readonly SemaphoreSlim Slots = new SemaphoreSlim(
            ReadBoundedSetting(
                "CRYSTAL_REPORT_MAX_CONCURRENT_EXECUTIONS",
                "MaxConcurrentExecutions",
                DefaultMaximumConcurrentExecutions,
                1,
                32));
        private static readonly TimeSpan QueueTimeout = TimeSpan.FromSeconds(
            ReadBoundedSetting(
                "CRYSTAL_REPORT_QUEUE_TIMEOUT_SECONDS",
                "ExecutionQueueTimeoutSeconds",
                DefaultQueueTimeoutSeconds,
                0,
                60));

        public static async Task<IDisposable> TryEnterAsync()
        {
            var entered = QueueTimeout == TimeSpan.Zero
                ? await Slots.WaitAsync(0).ConfigureAwait(false)
                : await Slots.WaitAsync(QueueTimeout).ConfigureAwait(false);
            return entered ? new Lease() : null;
        }

        private static int ReadBoundedSetting(
            string environmentName,
            string appSettingName,
            int fallback,
            int minimum,
            int maximum)
        {
            var value = Environment.GetEnvironmentVariable(environmentName);
            if (string.IsNullOrWhiteSpace(value))
                value = ConfigurationManager.AppSettings[appSettingName];

            if (string.IsNullOrWhiteSpace(value))
                return fallback;

            int parsed;
            if (!int.TryParse(value, out parsed) || parsed < minimum || parsed > maximum)
                throw new ConfigurationErrorsException(
                    appSettingName + " must be between " + minimum + " and " + maximum + ".");

            return parsed;
        }

        public static void ValidateConfiguration()
        {
            // Forces static initialization so invalid deployment settings fail at startup.
            var availableSlots = Slots.CurrentCount;
            var queueTimeout = QueueTimeout;
        }

        private sealed class Lease : IDisposable
        {
            private int _disposed;

            public void Dispose()
            {
                if (Interlocked.Exchange(ref _disposed, 1) == 0)
                    Slots.Release();
            }
        }
    }
}
