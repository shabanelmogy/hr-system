import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import LocalizationDataGrid from "./LocalizationDataGrid";

const state = vi.hoisted(() => ({ props: {} as Record<string, unknown>, canEdit: true, update: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/shared/hooks/usePermissions", () => ({ usePermissions: () => ({ hasPermission: () => state.canEdit, isReadOnly: false }) }));
vi.mock("@/shared/components/data-grid", () => ({ MyDataGrid: (props: Record<string, unknown>) => { state.props = props; return null; } }));
vi.mock("../hooks/useLocalizationRowEditing", () => ({ default: () => ({ rowModesModel: {}, setRowModesModel: vi.fn(),
  handleEditClick: vi.fn(), handleSaveClick: vi.fn(), handleCancelClick: vi.fn(), handleRowEditStop: vi.fn(),
  processRowUpdate: state.update, handleProcessRowUpdateError: vi.fn(), SnackbarComponent: null }) }));

describe("Localization messages shared Grid migration", () => {
  it.each([true, false])("preserves row editing and authorization with the shared Grid (%s)", (canEdit) => {
    state.canEdit = canEdit;
    renderToStaticMarkup(<LocalizationDataGrid culture="en" rows={[]} />);
    expect(state.props).toMatchObject({ editMode: "row", processRowUpdate: state.update,
      initialSortModel: [], checkboxSelection: false, showGridOptions: true });
    const columns = state.props.columns as { field: string; editable?: boolean }[];
    expect(columns.find((column) => column.field === "value")?.editable).toBe(canEdit);
    expect(columns.some((column) => column.field === "actions")).toBe(canEdit);
  });
});
