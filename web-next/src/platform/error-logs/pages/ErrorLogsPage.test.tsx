import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ErrorLogsPage from "./ErrorLogsPage";

const captured = vi.hoisted(() => ({ props: {} as Record<string, unknown>, error: false }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }) }));
vi.mock("@/lib/auth/SessionContext", () => ({ useSession: () => ({ user: { roles: ["admin"] } }) }));
vi.mock("@/shared/hooks/usePermissions", () => ({ usePermissions: () => ({ hasPermission: () => true }) }));
vi.mock("../hooks/useErrorLogs", () => ({ useErrorLogList: () => ({ allowed: true, data: { items: [], totalCount: 0 },
  isError: captured.error, isPending: false, isFetching: false, refetch: vi.fn() }) }));
vi.mock("@/shared/components/data-grid", () => ({ MyDataGrid: (props: Record<string, unknown>) => {
  captured.props = props;
  return <span>Shared grid</span>;
} }));

describe("Error Logs standard Grid contract", () => {
  it.each([false, true])("keeps the actual shared grid and toolbar available, including failed reads (%s)", (error) => {
    captured.error = error;
    expect(renderToStaticMarkup(<ErrorLogsPage scope="company" />)).toContain("Shared grid");
    expect(captured.props).toMatchObject({ filterMode: "server", sortingMode: "server", paginationMode: "server",
      showGridOptions: true, checkboxSelection: false, sortModel: [{ field: "occurredOnUtc", sort: "desc" }] });
    expect(captured.props.showNavigationButtons).not.toBe(false);
    expect(captured.props.autoActivateFirstRow).not.toBe(false);
    expect(captured.props.toolbarSearch).toBeDefined();
    expect(captured.props.toolbarContent).toBeDefined();
    expect(captured.props.toolbarFilters).toBeDefined();
    expect(captured.props.emptyContent).toBeDefined();
  });
});
