import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ManagedCrystalReportView from "./ManagedCrystalReportView";

const { capture, listGlobal } = vi.hoisted(() => ({
  capture: { query: null as Record<string, unknown> | null },
  listGlobal: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { dir: () => "ltr" } }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: Record<string, unknown>) => {
    capture.query = options;
    if (options.enabled === true && typeof options.queryFn === "function") {
      void (options.queryFn as () => unknown)();
    }
    return { data: [], isError: false, isFetching: false, isLoading: false, refetch: vi.fn() };
  },
}));

vi.mock("../public/useManagedReportAvailability", () => ({
  useManagedReportAvailability: () => ({ allowed: false, isLoading: false, scope: "global" }),
}));

vi.mock("./services", () => ({
  crystalReportService: {
    listGlobal,
    listPublished: vi.fn(),
    renderGlobal: vi.fn(),
    render: vi.fn(),
  },
}));

describe("ManagedCrystalReportView authorization defense", () => {
  it("disables the catalog query and does not call the global API when denied", () => {
    const html = renderToStaticMarkup(
      <ManagedCrystalReportView
        catalogErrorMessage="catalog unavailable"
        entityKey="countries"
        filters={[]}
        scope="global"
        unavailableMessage="reports unavailable"
      />,
    );

    expect(capture.query?.enabled).toBe(false);
    expect(listGlobal).not.toHaveBeenCalled();
    expect(html).toContain("reports unavailable");
  });
});
