/* eslint-disable react/prop-types */
import { Stack, Typography, useTheme } from "@mui/material";
import { MyTextField } from "@/shared/components/forms";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { RegistrationFormData } from "../types";

// Icons
import BadgeIcon from "@mui/icons-material/Badge";
import Person2Icon from "@mui/icons-material/Person2";

interface PersonalDetailsStepProps {
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  firstNameRef: React.RefObject<HTMLInputElement>;
  lastNameRef: React.RefObject<HTMLInputElement>;
  userNameRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
}

const PersonalDetailsStep = ({
  register,
  errors,
  firstNameRef,
  lastNameRef,
  userNameRef,
  t,
}: PersonalDetailsStepProps) => {
  const theme = useTheme();

  // Common TextField styles using theme colors
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "1px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
  };

  return (
    <Stack spacing={2}>
      <Typography
        variant="subtitle1"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {t("auth.personalDetails") || "Personal Details"}
      </Typography>
      <MyTextField
        counter
        errors={errors}
        fieldName="firstName"
        inputRef={firstNameRef}
        label={t("auth.firstName") || "First Name"}
        maxValue={50}
        minValue={3}
        register={register("firstName")}
        required
        startIcon={<Person2Icon color="primary" />}
        sx={textFieldStyles}
      />
      <MyTextField
        counter
        errors={errors}
        fieldName="lastName"
        inputRef={lastNameRef}
        label={t("auth.lastName") || "Last Name"}
        maxValue={50}
        minValue={3}
        register={register("lastName")}
        required
        startIcon={<Person2Icon color="primary" />}
        sx={textFieldStyles}
      />
      <MyTextField
        counter
        errors={errors}
        fieldName="userName"
        inputRef={userNameRef}
        label={t("auth.userName") || "Username"}
        maxValue={50}
        minValue={3}
        register={register("userName")}
        required
        startIcon={<BadgeIcon color="primary" />}
        sx={textFieldStyles}
      />
    </Stack>
  );
};

export default PersonalDetailsStep;
