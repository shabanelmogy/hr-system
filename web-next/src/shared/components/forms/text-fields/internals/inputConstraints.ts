export type InputConstraintValue = number | string;

const valueBoundInputTypes = new Set([
  "date",
  "datetime-local",
  "month",
  "number",
  "range",
  "time",
  "week",
]);

export function usesValueBounds(type: string) {
  return valueBoundInputTypes.has(type);
}

export function getInputConstraints(
  type: string,
  minValue?: InputConstraintValue,
  maxValue?: InputConstraintValue,
) {
  if (!usesValueBounds(type)) {
    return {
      ...(typeof minValue === "number" && { minLength: minValue }),
      ...(typeof maxValue === "number" && { maxLength: maxValue }),
    };
  }

  const resolvedMin = minValue ?? (type === "number" ? 0 : undefined);

  return {
    ...(resolvedMin != null && { min: resolvedMin }),
    ...(maxValue != null && { max: maxValue }),
  };
}

export function getCharacterLimit(
  type: string,
  maxLength?: number,
  maxValue?: InputConstraintValue,
) {
  if (maxLength != null) return maxLength;
  if (!usesValueBounds(type) && typeof maxValue === "number") return maxValue;
  return undefined;
}
