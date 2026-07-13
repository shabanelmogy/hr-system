/* eslint-disable react/prop-types */
import {
  Box,
  Collapse,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

// Icons
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Person2Icon from "@mui/icons-material/Person2";

// Components
import VerificationBadge from "./verificationBadge";

interface PersonalDetailsStepProps {
  register: any;
  errors: any;
  firstNameRef: React.RefObject<HTMLInputElement>;
  lastNameRef: React.RefObject<HTMLInputElement>;
  userNameRef: React.RefObject<HTMLInputElement>;
  usernameVerified: boolean;
  usernameChecking: boolean;
  t: (key: string) => string;
}

const PersonalDetailsStep = ({
  register,
  errors,
  firstNameRef,
  lastNameRef,
  userNameRef,
  usernameVerified,
  usernameChecking,
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person2Icon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={textFieldStyles}
      />

      <TextField
        fullWidth
        label={t("auth.lastName") || "Last Name"}
        variant="outlined"
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
        {...register("lastName")}
        inputRef={lastNameRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person2Icon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={textFieldStyles}
      />

      <Box>
        <TextField
          fullWidth
          label={t("auth.userName") || "Username"}
          variant="outlined"
          error={!!errors.userName}
          helperText={errors.userName?.message}
          {...register("userName")}
          inputRef={userNameRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BadgeIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <VerificationBadge
                  isVerified={usernameVerified}
                  isChecking={usernameChecking}
                  tooltip={
                    usernameChecking
                      ? t("auth.checkingUsername") ||
                      "Checking username availability..."
                      : usernameVerified
                        ? t("auth.usernameAvailable") || "Username is available"
                        : t("auth.usernameUnavailable") ||
                        "Username unavailable or not verified"
                  }
                />
              </InputAdornment>
            ),
          }}
          sx={textFieldStyles}
        />

        <Collapse in={usernameVerified}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.main,
              borderRadius: 6,
              px: 1.5,
              py: 0.5,
              mt: 0.75,
              ml: 0.5,
              fontSize: "0.75rem",
              border: `1px solid ${theme.palette.success.light}`,
              boxShadow: theme.shadows[1],
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: "0.875rem",
                mr: 0.5,
                color: theme.palette.success.main,
              }}
            />
            <Typography
              variant="caption"
              fontWeight={500}
              color={theme.palette.success.contrastText}
            >
              {t("auth.usernameAvailable") || "Username is available"}
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Stack>
  );
};

export default PersonalDetailsStep;
