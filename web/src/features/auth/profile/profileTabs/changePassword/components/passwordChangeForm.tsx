/* eslint-disable react/prop-types */
import { MyTextField } from "@/shared/components";
import { Stack } from "@mui/material";
import { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";

interface PasswordChangeFormProps {
  handleChangePassword: (data: any) => void;
  handleSubmit: UseFormHandleSubmit<any>;
  isEditing: boolean;
  control: Control<any>;
  errors: FieldErrors<any>;
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
        <Stack spacing={3}>
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
        </Stack>
      </form>
    </>
  );
};

export default PasswordChangeForm;
