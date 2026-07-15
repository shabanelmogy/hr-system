import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SaveIcon from "@mui/icons-material/Save";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useState, type FormEvent } from "react";
import {
  appointmentValidationSchema,
  type AppointmentFormData,
} from "../validation/appointmentValidation";

const todayStart = dayjs().startOf("day");

type AppointmentDialogProps = {
  open: boolean;
  loading?: boolean;
  mode?: "add" | "edit";
  inclusiveEnd?: boolean;
  defaultTitle?: string;
  defaultStart: string;
  defaultEnd: string;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  onDelete?: () => void;
};

export default function AppointmentDialog({
  open,
  loading,
  mode = "add",
  inclusiveEnd = false,
  defaultTitle,
  defaultStart,
  defaultEnd,
  onClose,
  onSubmit,
  onDelete,
}: AppointmentDialogProps) {
  const [title, setTitle] = useState(defaultTitle || "");
  const [start, setStart] = useState<Dayjs | null>(() => dayjs(defaultStart));
  const [end, setEnd] = useState<Dayjs | null>(() => dayjs(defaultEnd));
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const validationEnd = inclusiveEnd && end ? end.add(1, "day") : end;
    const result = appointmentValidationSchema.safeParse({
      text: title,
      start: start?.format("YYYY-MM-DDTHH:mm") || "",
      end: validationEnd?.format("YYYY-MM-DDTHH:mm") || "",
    });

    if (!result.success) {
      const nextErrors: { title?: string; time?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "text") nextErrors.title ??= issue.message;
        else if (field === "time") nextErrors.time ??= issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <EventAvailableIcon color="primary" />
        <Typography variant="h6" component="div">
          {mode === "edit" ? "Edit Appointment" : "New Appointment"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Title"
              placeholder="What is this about?"
              fullWidth
              size="small"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title || " "}
              slotProps={{
                htmlInput: {
                  maxLength: 200,
                  "aria-required": true,
                  "aria-invalid": Boolean(errors.title),
                  "aria-describedby": errors.title
                    ? "appointment-title-error"
                    : undefined,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TextFieldsIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
                formHelperText: { id: "appointment-title-error" },
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <DateTimePicker
                label="Start"
                value={start}
                onChange={(value) => setStart(value ? dayjs(value) : null)}
                minDateTime={todayStart}
                ampm={false}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: Boolean(errors.time),
                    helperText: errors.time || " ",
                    slotProps: {
                      htmlInput: {
                        "aria-required": true,
                        "aria-invalid": Boolean(errors.time),
                        "aria-describedby": errors.time
                          ? "appointment-time-error"
                          : undefined,
                      },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    },
                  },
                }}
              />
              <DateTimePicker
                label="End"
                value={end}
                onChange={(value) => setEnd(value ? dayjs(value) : null)}
                minDateTime={todayStart}
                ampm={false}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: Boolean(errors.time),
                    helperText: " ",
                    slotProps: {
                      htmlInput: {
                        "aria-required": true,
                        "aria-invalid": Boolean(errors.time),
                        "aria-describedby": errors.time
                          ? "appointment-time-error"
                          : undefined,
                      },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    },
                  },
                }}
              />
            </Stack>

            {errors.time && (
              <Typography id="appointment-time-error" color="error" variant="body2">
                {errors.time}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {mode === "edit" && onDelete && (
            <Button
              color="error"
              onClick={onDelete}
              startIcon={<DeleteForeverIcon />}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Add Appointment"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
