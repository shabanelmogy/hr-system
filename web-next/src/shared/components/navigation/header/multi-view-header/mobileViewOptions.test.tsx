import { ViewModule } from "@mui/icons-material";
import { describe, expect, it } from "vitest";
import type { ViewOption } from "./types";
import { partitionMobileViewOptions } from "./mobileViewOptions";

function option(value: string): ViewOption {
  return {
    value,
    label: value,
    icon: <ViewModule />,
  };
}

describe("partitionMobileViewOptions", () => {
  const options = ["grid", "cards", "chart", "report"].map(option);

  it("keeps an active overflow view visible", () => {
    const result = partitionMobileViewOptions(options, "report", 2);

    expect(result.visible.map(({ value }) => value)).toEqual(["grid", "report"]);
    expect(result.overflow.map(({ value }) => value)).toEqual(["cards", "chart"]);
  });

  it("keeps the original order when the active view is already visible", () => {
    const result = partitionMobileViewOptions(options, "cards", 2);

    expect(result.visible.map(({ value }) => value)).toEqual(["grid", "cards"]);
    expect(result.overflow.map(({ value }) => value)).toEqual(["chart", "report"]);
  });

  it("does not create overflow when all views fit", () => {
    const result = partitionMobileViewOptions(options, "grid", options.length);

    expect(result.visible).toEqual(options);
    expect(result.overflow).toEqual([]);
  });
});
