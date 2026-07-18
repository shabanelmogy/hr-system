import type { ViewOption, ViewType } from "./types";

export function partitionMobileViewOptions(
  options: ViewOption[],
  activeView: ViewType,
  maxVisible: number,
): { visible: ViewOption[]; overflow: ViewOption[] } {
  const visibleCount = Math.max(1, maxVisible);
  if (options.length <= visibleCount) {
    return { visible: options, overflow: [] };
  }

  const visible = options.slice(0, visibleCount);
  const activeOption = options.find((option) => option.value === activeView);

  if (
    activeOption &&
    !visible.some((option) => option.value === activeOption.value)
  ) {
    visible[visible.length - 1] = activeOption;
  }

  const visibleValues = new Set(visible.map((option) => option.value));
  const overflow = options.filter((option) => !visibleValues.has(option.value));

  return { visible, overflow };
}
