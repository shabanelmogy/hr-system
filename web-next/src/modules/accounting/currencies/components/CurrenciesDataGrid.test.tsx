import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GridActionsCellItemProps, GridActionsColDef, GridColDef } from "@mui/x-data-grid";

import type { Currency } from "../types/Currency";

type CapturedGridProps = { columns: GridColDef<Currency>[] };

const gridState = vi.hoisted(() => ({
  props: null as CapturedGridProps | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/shared/components/data-grid", () => ({
  MyDataGrid: (props: CapturedGridProps) => {
    gridState.props = props;
    return null;
  },
}));

vi.mock("@/shared/components/layout", () => ({
  ContentWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/shared/components/lists/card-view/header-controls/ResetButton", () => ({
  ResetButton: () => null,
}));

import CurrenciesDataGrid from "./CurrenciesDataGrid";

const activeCurrency: Currency = {
  id: 1,
  currencyCode: "USD",
  nameAr: "دولار أمريكي",
  nameEn: "US Dollar",
  symbol: "$",
  isDeleted: false,
  createdOn: "2026-09-22T00:00:00Z",
  updatedOn: null,
  rowVersion: "AQ==",
};

const archivedCurrency: Currency = {
  ...activeCurrency,
  id: 2,
  isDeleted: true,
};

function renderGrid(canManage: boolean) {
  gridState.props = null;
  renderToStaticMarkup(
    <CurrenciesDataGrid
      rows={[activeCurrency, archivedCurrency]}
      loading={false}
      page={0}
      pageSize={10}
      totalCount={2}
      sortColumn="currencyCode"
      sortDirection="ASC"
      searchValue=""
      searchField="all"
      searchOperator="contains"
      recordStatus="all"
      canManage={canManage}
      onSearchChange={vi.fn()}
      onSearchFieldChange={vi.fn()}
      onSearchOperatorChange={vi.fn()}
      onRecordStatusChange={vi.fn()}
      onReset={vi.fn()}
      onPaginationChange={vi.fn()}
      onSortChange={vi.fn()}
      onView={vi.fn()}
      onEdit={vi.fn()}
      onArchive={vi.fn()}
      onRestore={vi.fn()}
    />,
  );

  expect(gridState.props).not.toBeNull();
  const captured = (gridState as { props: CapturedGridProps | null }).props;
  if (!captured) throw new Error("MyDataGrid props were not captured");
  const columns = captured.columns;
  const actionsColumn = columns.find(
    (column): column is GridActionsColDef<Currency> => column.type === "actions",
  );
  expect(actionsColumn?.getActions).toBeDefined();
  const getActions = actionsColumn!.getActions;
  return (row: Currency): readonly React.ReactElement<GridActionsCellItemProps>[] =>
    getActions({ id: row.id, row, columns });
}

describe("CurrenciesDataGrid permissions", () => {
  beforeEach(() => {
    gridState.props = null;
  });

  it("always exposes view, but disables lifecycle actions for view-only users", () => {
    const getActions = renderGrid(false);
    const activeActions = getActions(activeCurrency);
    const archivedActions = getActions(archivedCurrency);

    expect(activeActions.map(action => action.props.label)).toEqual([
      "actions.view",
      "actions.edit",
      "actions.archive",
    ]);
    expect(activeActions[0].props.disabled).toBeFalsy();
    expect(activeActions[1].props.disabled).toBe(true);
    expect(activeActions[2].props.disabled).toBe(true);
    expect(archivedActions[0].props.disabled).toBeFalsy();
    expect(archivedActions[1].props.disabled).toBe(true);
    expect(archivedActions[2].props.disabled).toBe(true);
  });

  it("enables valid lifecycle actions for managers and keeps archived edit disabled", () => {
    const getActions = renderGrid(true);
    const activeActions = getActions(activeCurrency);
    const archivedActions = getActions(archivedCurrency);

    expect(activeActions[0].props.disabled).toBeFalsy();
    expect(activeActions[1].props.disabled).toBeFalsy();
    expect(activeActions[2].props.disabled).toBeFalsy();
    expect(archivedActions.map(action => action.props.label)).toEqual([
      "actions.view",
      "actions.edit",
      "actions.restore",
    ]);
    expect(archivedActions[0].props.disabled).toBeFalsy();
    expect(archivedActions[1].props.disabled).toBe(true);
    expect(archivedActions[2].props.disabled).toBeFalsy();
    expect(archivedActions[2].props.showInMenu).toBe(true);
  });
});
