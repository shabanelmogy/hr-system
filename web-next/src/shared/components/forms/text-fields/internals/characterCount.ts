export type CharacterCount = {
  count: number;
  percentage: number;
  color: string;
  remaining?: number;
};

type CharacterCountOptions = {
  maxLength?: number;
  normalColor: string;
  warningColor: string;
  errorColor: string;
  warningThreshold: number;
  errorThreshold: number;
};

export function getCharacterCount(value: unknown, options: CharacterCountOptions): CharacterCount {
  const count = String(value ?? "").length;
  if (options.maxLength == null) {
    return { count, percentage: 0, color: options.normalColor };
  }

  const percentage = options.maxLength === 0 ? 100 : (count / options.maxLength) * 100;
  const color = percentage > options.errorThreshold
    ? options.errorColor
    : percentage > options.warningThreshold
      ? options.warningColor
      : options.normalColor;

  return {
    count,
    percentage,
    color,
    remaining: options.maxLength - count,
  };
}

export function formatCharacterCount(
  count: CharacterCount,
  maxLength: number | undefined,
  format: "remaining" | "percentage" | "fraction" | string,
) {
  if (maxLength == null) return `${count.count}`;
  if (format === "remaining") return `${count.remaining} remaining`;
  if (format === "percentage") return `${Math.round(count.percentage)}%`;
  return `${count.count}/${maxLength}`;
}
