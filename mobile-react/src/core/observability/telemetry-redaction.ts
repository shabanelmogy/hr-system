const SENSITIVE_KEY_PATTERN = /(token|password|secret|authorization|cookie|salary|amount|payload|email|phone|national|address)/i;

export const SENSITIVE_ROUTE_PARAMS = [
  'email', 'code', 'userId', 'invitationId', 'token', 'id', 'password', 'refreshToken',
] as const;

export function sanitizeTelemetryAttributes(
  attributes: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (SENSITIVE_KEY_PATTERN.test(key) || value === null || value === undefined) continue;
    if (typeof value === 'boolean' || typeof value === 'number') safe[key] = value;
    else if (typeof value === 'string') safe[key] = value.slice(0, 160);
  }
  return safe;
}
