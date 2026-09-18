import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import EditableTextField from "./EditableTextField";

type ControllerProps = {
  render: (parameters: { field: Record<string, unknown> }) => {
    props: Record<string, unknown>;
  };
};

function renderControlledField(value: unknown) {
  const controller = EditableTextField({
    control: {},
    name: "email",
    registerValue: "",
    preventZero: false,
    getCommonProps: () => ({}),
    onClear: vi.fn(),
    onRegisterChange: vi.fn(),
  });

  if (!isValidElement<ControllerProps>(controller)) {
    throw new Error("Expected EditableTextField to render a controlled field");
  }

  return controller.props.render({
    field: {
      name: "email",
      value,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
  }).props;
}

describe("EditableTextField", () => {
  it("keeps an undefined React Hook Form value controlled", () => {
    expect(renderControlledField(undefined).value).toBe("");
  });

  it("preserves defined React Hook Form values", () => {
    expect(renderControlledField("branch@example.com").value).toBe(
      "branch@example.com",
    );
  });
});
