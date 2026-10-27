export const enErrorLogs = {
  systemSettings: { title: 'System settings' },
  errorLogs: {
    title: 'Error logs', description: 'Review errors for your current company.', detail: 'Error details',
    all: 'All', search: 'Search errors', filters: 'Filters', clearFilters: 'Clear filters',
    from: 'From', to: 'To', export: 'Export XLSX', exportFailed: 'Unable to export error logs.',
    loadFailed: 'Unable to load error logs.', forbidden: 'You do not have access to these error logs.',
    empty: 'No matching errors were found.', invalidRange: 'The end date must be on or after the start date.',
    source: { api: 'API', job: 'Job', web: 'Web', mobile: 'Mobile' },
    severity: { warning: 'Warning', error: 'Error' },
    fields: { occurredOnUtc: 'Occurred', source: 'Source', severity: 'Severity', userName: 'User', service: 'Service', action: 'Action', statusCode: 'Status', durationMs: 'Duration (ms)', correlationId: 'Correlation ID', summary: 'Summary', client: 'Client', browser: 'Browser', ipAddress: 'IP address' },
  },
  systemErrorLogs: { title: 'System error logs', diagnostics: 'Method frames' },
  errorLogSettings: {
    title: 'Error log settings', description: 'Set the global retention period.', retentionDays: 'Retention days',
    required: 'Enter retention days.', range: 'Enter a whole number from 1 to 3650.',
    queueDepth: 'Queue depth: {{count}}', droppedCount: 'Dropped: {{count}}', failedWrites: 'Failed writes: {{count}}',
    saved: 'Error log settings saved.', saveFailed: 'Unable to save settings.', loadFailed: 'Unable to load settings.',
    conflict: 'Settings changed elsewhere. Reload the latest revision and review your draft before saving.', reloadRevision: 'Reload revision',
  },
};
