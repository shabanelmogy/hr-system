/* eslint-disable react/prop-types */
import {
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
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
      <TextField
        fullWidth
        label={t("auth.firstName") || "First Name"}
        variant="outlined"
        error={!!errors.firstName}
        helperText={errors.firstName?.message}
        {...register("firstName")}
        inputRef={firstNameRef}
        sx={textFieldStyles}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Person2Icon color="primary" />
              </InputAdornment>
            ),
          }
        }}
      />
      <TextField
        fullWidth
        label={t("auth.lastName") || "Last Name"}
        variant="outlined"
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
        {...register("lastName")}
        inputRef={lastNameRef}
        sx={textFieldStyles}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Person2Icon color="primary" />
              </InputAdornment>
            ),
          }
        }}
      />
      <TextField
        fullWidth
        label={t("auth.userName") || "Username"}
        variant="outlined"
        error={!!errors.userName}
        helperText={errors.userName?.message}
        {...register("userName")}
        inputRef={userNameRef}
        sx={textFieldStyles}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <BadgeIcon color="primary" />
              </InputAdornment>
            ),
          }
        }}
      />
    </Stack>
  );
};

export default PersonalDetailsStep;
