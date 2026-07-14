import { MyTextField } from "@/shared/components/common";
import { Grid } from "@mui/material";
import { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";

export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
}

interface PasswordChangeFormProps {
  handleChangePassword: (data: PasswordChangeValues) => void;
  handleSubmit: UseFormHandleSubmit<PasswordChangeValues>;
  isEditing: boolean;
  control: Control<PasswordChangeValues>;
  errors: FieldErrors<PasswordChangeValues>;
  t: (key: string) => string;
}

const PasswordChangeForm = ({
  handleChangePassword,
  handleSubmit,
  isEditing,
  control,
  errors,
  t,
}: PasswordChangeFormProps) => {
  return (
    <>
      <form onSubmit={handleSubmit(handleChangePassword)}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              type="password"
              name="currentPassword"
              label={t("auth.currentPassword")}
              control={control}
              errors={errors}
              readOnly={!isEditing}
              showPasswordToggle={true}
              showClearButton={true}
              maxLength={50}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              type="password"
              name="newPassword"
              label={t("auth.newPassword")}
              control={control}
              errors={errors}
              readOnly={!isEditing}
              showPasswordToggle={true}
              showClearButton={true}
              maxLength={50}
              showCounter={false}
            />
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default PasswordChangeForm;
