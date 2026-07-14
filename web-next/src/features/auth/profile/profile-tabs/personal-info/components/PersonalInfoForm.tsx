import { Grid } from "@mui/material";
import { MyTextField } from "@/shared/components/common";
import { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import type { PersonalInfoValues } from "../../../types";

interface PersonalInfoFormProps {
  isEditing: boolean;
  control: Control<PersonalInfoValues>;
  errors: FieldErrors<PersonalInfoValues>;
  handleSubmit: UseFormHandleSubmit<PersonalInfoValues>;
  handleSave: (data: PersonalInfoValues) => void;
}

const PersonalInfoForm = ({
  isEditing,
  control,
  errors,
  handleSubmit,
  handleSave,
}: PersonalInfoFormProps) => {
  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MyTextField
            name="userName"
            labelKey="auth.userName"
            control={control}
            errors={errors}
            showCounter={false}
            readOnly={!isEditing}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyTextField
            name="firstName"
            labelKey="auth.firstName"
            control={control}
            errors={errors}
            showCounter={false}
            readOnly={!isEditing}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyTextField
            name="lastName"
            labelKey="auth.lastName"
            control={control}
            errors={errors}
            showCounter={false}
            readOnly={!isEditing}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default PersonalInfoForm;
