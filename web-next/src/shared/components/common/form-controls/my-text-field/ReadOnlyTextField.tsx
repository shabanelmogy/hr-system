import { alpha, Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Controller, type Control, type FieldValues } from "react-hook-form";

type ReadOnlyTextFieldProps = {
  control?: unknown;
  name: string;
  label: ReactNode;
  type: string;
  value?: unknown;
  watch?: (name: string) => unknown;
};

export default function ReadOnlyTextField(props: ReadOnlyTextFieldProps) {
  const renderValue = (value: unknown) => (
    <Box sx={{ width: "100%", mb: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
        <Typography variant="subtitle2" sx={{ color: "info.light", minWidth: 120, fontWeight: "bold" }}>
          {props.label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: (theme) => alpha(
              theme.palette.mode === "dark" ? theme.palette.primary.main : theme.palette.info.light,
              0.08,
            ),
            color: "text.primary",
            flexGrow: 1,
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            border: (theme) => `1px solid ${alpha(theme.palette.info.light, 0.2)}`,
          }}
        >
          {props.type === "password"
            ? (value ? "\u2022".repeat(10) : "-")
            : value == null ? "-" : String(value)}
        </Typography>
      </Stack>
    </Box>
  );

  if (props.control) {
    return (
      <Controller
        name={props.name}
        control={props.control as Control<FieldValues>}
        render={({ field }) => renderValue(props.value !== undefined ? props.value : field.value)}
      />
    );
  }

  return renderValue(props.value !== undefined ? props.value : props.watch?.(props.name));
}
