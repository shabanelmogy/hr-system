import { zodResolver } from "@hookform/resolvers/zod";
import {
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  DeleteForever as DeleteForeverIcon,
  EventAvailable as EventAvailableIcon,
  TextFields as TextFieldsIcon,
} from "@mui/icons-material";
import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type Resolver,
  useForm,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyDateTimeField, MyForm, MyTextField } from "@/shared/components/forms";
import type { AppointmentFormData } from "../../types/appointment";
import { getAppointmentValidationSchema } from "../../validation/appointmentValidation";
import AppointmentDeleteDialog from "./AppointmentDeleteDialog";

interface AppointmentDialogProps {
  open: boolean;
  loading: boolean;
  mode: "add" | "edit";
  defaultValues: AppointmentFormData;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export default function AppointmentDialog({
  open,
  loading,
  mode,
  defaultValues,
  onClose,
  onSubmit,
  onDelete,
}: AppointmentDialogProps) {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const schema = useMemo(
    () => getAppointmentValidationSchema(t, { allowPastStart: mode === "edit" }),
    [mode, t],
  );
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(schema) as Resolver<AppointmentFormData>,
    mode: "onSubmit",
    defaultValues,
  });
  const isAllDay = useWatch({ control, name: "isAllDay" });
  const errorMessages = Object.fromEntries(
    Object.entries(errors)
      .filter((entry): entry is [string, { message: string }] =>
        typeof entry[1]?.message === "string",
      )
      .map(([field, error]) => [field, error.message]),
  );

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [defaultValues, open, reset]);

  const setAllDay = (checked: boolean) => {
    const current = getValues();
    setValue("isAllDay", checked, { shouldDirty: true, shouldValidate: true });

    if (checked) {
      setValue("start", dayjs(current.start).format("YYYY-MM-DD"), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("end", dayjs(current.end).format("YYYY-MM-DD"), {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const start = dayjs(current.start).hour(9).minute(0).second(0);
    const candidateEnd = dayjs(current.end).hour(10).minute(0).second(0);
    const end = candidateEnd.isAfter(start) ? candidateEnd : start.add(1, "hour");
    setValue("start", start.toISOString(), { shouldDirty: true, shouldValidate: true });
    setValue("end", end.toISOString(), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <MyForm
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        title={
          mode === "edit"
            ? t("appointments.editTitle")
            : t("appointments.addTitle")
        }
        subtitle={
          mode === "edit"
            ? t("appointments.editSubtitle")
            : t("appointments.addSubtitle")
        }
        submitButtonText={
          mode === "edit"
            ? t("appointments.saveChanges")
            : t("appointments.addAppointment")
        }
        isSubmitting={loading}
        isDirty={isDirty}
        icon={<EventAvailableIcon />}
        maxWidth="sm"
        focusFieldName="text"
        overlayActionType={mode === "edit" ? "update" : "create"}
        overlayMessage={
          mode === "edit"
            ? t("appointments.updating")
            : t("appointments.creating")
        }
        errors={errorMessages}
        footerLeft={
          mode === "edit" && onDelete ? (
            <Button
              type="button"
              color="error"
              variant="outlined"
              disabled={loading}
              startIcon={<DeleteForeverIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              {t("actions.delete")}
            </Button>
          ) : null
        }
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <MyTextField
            control={control}
            errors={errors}
            fieldName="text"
            label={t("appointments.titleLabel")}
            placeholder={t("appointments.titlePlaceholder")}
            maxLength={200}
            required
            loading={loading}
            startIcon={<TextFieldsIcon fontSize="small" />}
          />

          <Controller
            name="isAllDay"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    disabled={loading}
                    onChange={(_, checked) => setAllDay(checked)}
                    slotProps={{ input: { "aria-label": t("appointments.allDay") } }}
                  />
                }
                label={t("appointments.allDay")}
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <AppointmentDateField
              name="start"
              label={t("appointments.start")}
              isAllDay={isAllDay}
              loading={loading}
              allowPast={mode === "edit"}
              control={control}
              error={errors.start?.message}
              icon={<CalendarMonthIcon fontSize="small" />}
            />
            <AppointmentDateField
              name="end"
              label={t("appointments.end")}
              isAllDay={isAllDay}
              loading={loading}
              allowPast={mode === "edit"}
              control={control}
              error={errors.end?.message}
              icon={<AccessTimeIcon fontSize="small" />}
            />
          </Stack>
        </Stack>
      </MyForm>

      {onDelete && (
        <AppointmentDeleteDialog
          open={deleteOpen}
          title={getValues("text")}
          loading={loading}
          onClose={() => setDeleteOpen(false)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
}

interface AppointmentDateFieldProps {
  name: "start" | "end";
  label: string;
  isAllDay: boolean;
  loading: boolean;
  allowPast: boolean;
  control: Control<AppointmentFormData>;
  error?: string;
  icon: ReactNode;
}

function AppointmentDateField({
  name,
  label,
  isAllDay,
  loading,
  allowPast,
  control,
  error,
  icon,
}: AppointmentDateFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MyDateTimeField
          fieldName={name}
          label={label}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          mode={isAllDay ? "date" : "date-time"}
          disabled={loading}
          required
          error={Boolean(error)}
          helperText={error ?? " "}
          minDate={allowPast ? undefined : dayjs().startOf("day")}
          minDateTime={allowPast ? undefined : dayjs()}
          icon={icon}
        />
      )}
    />
  );
}
