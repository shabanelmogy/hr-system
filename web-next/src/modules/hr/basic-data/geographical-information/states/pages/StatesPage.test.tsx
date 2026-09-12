import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StatesPage from "./StatesPage";

const capture = vi.hoisted(() => ({
  logic: {} as Record<string, unknown>,
  multiViewProps: null as Record<string, unknown> | null,
  formProps: null as Record<string, unknown> | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../hooks/useStateGridLogic", () => ({ default: () => capture.logic }));
vi.mock("../hooks/useStateQueries", () => ({
  useState: () => ({ data: null, isLoading: false, error: null, refetch: vi.fn() }),
}));
vi.mock("../components/StatesMultiView", () => ({
  default: (props: Record<string, unknown>) => {
    capture.multiViewProps = props;
    return <div data-testid="states-multi-view" />;
  },
}));
vi.mock("../components/StateForm", () => ({
  default: (props: Record<string, unknown>) => {
    capture.formProps = props;
    return <div data-testid="state-form" />;
  },
}));
vi.mock("../components/StateArchiveDialog", () => ({ default: () => null }));
vi.mock("../components/StateRestoreDialog", () => ({ default: () => null }));
vi.mock("../components/StateBulkArchiveDialog", () => ({ default: () => null }));

describe("StatesPage wiring", () => {
  beforeEach(() => {
    capture.multiViewProps = null;
    capture.formProps = null;
    capture.logic = createStateLogic();
  });

  it("keeps initial loading separate from background fetching and wires mutations", () => {
    renderToStaticMarkup(<StatesPage />);

    expect(capture.multiViewProps).toMatchObject({
      loading: false,
      isFetching: true,
      selectedStateIds: [7],
    });
    expect(capture.multiViewProps?.onBulkArchive).toBe(capture.logic.onBulkArchive);
    expect(capture.multiViewProps?.onSearchChange).toBe(capture.logic.setSearchValue);
    expect(capture.formProps?.onSubmit).toBe(capture.logic.handleFormSubmit);
  });
});

function createStateLogic(): Record<string, unknown> {
  const callback = () => undefined;
  return {
    dialogType: "add",
    selectedState: null,
    restoreState: null,
    selectedStateIds: [7],
    bulkArchiveOpen: false,
    loading: false,
    states: [],
    gridStates: [],
    paginationMode: "server",
    totalCount: 13,
    apiRef: { current: null },
    error: null,
    isFetching: true,
    page: 0,
    pageSize: 10,
    searchValue: "cai",
    searchField: "nameEn",
    searchOperator: "contains",
    sortColumn: "createdOn",
    sortDirection: "DESC",
    filter: "active",
    permissions: { canView: true, canCreate: true, canEdit: true, canDelete: true, canRestore: true },
    isCreating: false,
    isUpdating: false,
    isArchiving: false,
    isBulkArchiving: false,
    isRestoring: false,
    lastAddedId: null,
    lastEditedId: null,
    lastDeletedIndex: null,
    setPage: callback,
    setPageSize: callback,
    setSearchValue: callback,
    setSearchField: callback,
    setSearchOperator: callback,
    setSort: callback,
    setFilter: callback,
    resetList: callback,
    closeDialog: callback,
    handleFormSubmit: callback,
    handleDelete: callback,
    setSelectedStateIds: callback,
    onBulkArchive: callback,
    closeBulkArchive: callback,
    handleBulkArchive: callback,
    handleRefresh: callback,
    onEdit: callback,
    onView: callback,
    onDelete: callback,
    onAdd: callback,
    onRestore: callback,
    closeRestore: callback,
    handleRestore: callback,
  };
}
