import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CountriesPage from "./CountriesPage";

const capture = vi.hoisted(() => ({
  logic: {} as Record<string, unknown>,
  multiViewProps: null as Record<string, unknown> | null,
  formProps: null as Record<string, unknown> | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../hooks/useCountryGridLogic", () => ({ default: () => capture.logic }));
vi.mock("../hooks/useCountryQueries", () => ({
  useCountry: () => ({ data: null, isFetching: false, error: null, refetch: vi.fn() }),
}));
vi.mock("../components/CountriesMultiView", () => ({
  default: (props: Record<string, unknown>) => {
    capture.multiViewProps = props;
    return <div data-testid="countries-multi-view" />;
  },
}));
vi.mock("../components/CountryForm", () => ({
  default: (props: Record<string, unknown>) => {
    capture.formProps = props;
    return <div data-testid="country-form" />;
  },
}));
vi.mock("../components/CountryArchiveDialog", () => ({ default: () => null }));
vi.mock("../components/CountryRestoreDialog", () => ({ default: () => null }));
vi.mock("../components/CountryBulkArchiveDialog", () => ({ default: () => null }));

describe("CountriesPage wiring", () => {
  beforeEach(() => {
    capture.multiViewProps = null;
    capture.formProps = null;
    capture.logic = createCountryLogic();
  });

  it("keeps initial loading separate from background fetching and wires mutations", () => {
    renderToStaticMarkup(<CountriesPage />);

    expect(capture.multiViewProps).toMatchObject({
      loading: false,
      isFetching: true,
      selectedCountryIds: [4],
    });
    expect(capture.multiViewProps?.onBulkArchive).toBe(capture.logic.onBulkArchive);
    expect(capture.multiViewProps?.onSearchChange).toBe(capture.logic.setSearchValue);
    expect(capture.formProps?.onSubmit).toBe(capture.logic.handleFormSubmit);
  });
});

function createCountryLogic(): Record<string, unknown> {
  const callback = () => undefined;
  return {
    dialogType: "add",
    selectedCountry: null,
    restoreCountry: null,
    selectedCountryIds: [4],
    bulkArchiveOpen: false,
    loading: false,
    countries: [],
    gridCountries: [],
    paginationMode: "server",
    totalCount: 11,
    apiRef: { current: null },
    error: null,
    isFetching: true,
    page: 0,
    pageSize: 10,
    searchValue: "egy",
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
    setSelectedCountryIds: callback,
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
