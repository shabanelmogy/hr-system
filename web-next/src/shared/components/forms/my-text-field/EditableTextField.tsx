import { TextField } from "@mui/material";
import type { ReactNode, Ref } from "react";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import { mergeRefs } from "./refUtils";
import type { FieldErrorLike, RegisteredField } from "./types";

type EditableTextFieldProps = {
  control?: unknown;
  name: string;
  inputRef?: Ref<HTMLInputElement>;
  registeredField?: RegisteredField;
  registerValue: string;
  value?: unknown;
  fieldError?: FieldErrorLike;
  helperText?: ReactNode;
  preventZero: boolean;
  maxLength?: number;
  getCommonProps: (value: string, onClear: () => void) => Record<string, unknown>;
  onClear: (controllerOnChange?: (value: string) => void) => void;
  onRegisterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function EditableTextField(props: EditableTextFieldProps) {
  if (props.control) {
    return (
      <Controller
        name={props.name}
        control={props.control as Control<FieldValues>}
        render={({ field }) => {
          const fieldValue = String(field.value ?? "");
          return (
            <TextField
              {...props.getCommonProps(fieldValue, () => props.onClear(field.onChange))}
              {...field}
              inputRef={mergeRefs(field.ref, props.inputRef)}
              error={Boolean(props.fieldError)}
              helperText={props.helperText}
              onChange={(event) => {
                const value = String(event.target.value ?? "");
                if (props.preventZero && value === "0") return;
                if (props.maxLength != null && value.length > props.maxLength) return;
                field.onChange(value);
              }}
            />
          );
        }}
      />
    );
  }

  return (
    <TextField
      {...props.getCommonProps(props.registerValue, () => props.onClear())}
      {...props.registeredField}
      inputRef={mergeRefs(props.registeredField?.ref, props.inputRef)}
      value={props.value !== undefined ? props.value : undefined}
      error={Boolean(props.fieldError)}
      helperText={props.helperText}
      onChange={props.onRegisterChange}
    />
  );
}
