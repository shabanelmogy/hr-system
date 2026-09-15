import {
  alpha,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { MyTextField } from "@/shared/components/forms";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { RegistrationFormData } from "../types";

// Icons
import CheckIcon from "@mui/icons-material/Check";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

interface SecurityStepProps {
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  watchPassword: string;
  passwordStrength: number;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  t: (key: string) => string;
}

const SecurityStep = ({
  register,
  errors,
  emailRef,
  watchPassword,
  passwordStrength,
  showPassword,
  setShowPassword,
  t,
}: SecurityStepProps) => {
  const theme = useTheme();

  // Map password strength to theme colors
  const strengthColors: { [key: number]: string } = {
    0: theme.palette.error.main,
    1: theme.palette.warning.main,
    2: theme.palette.info.main,
    3: theme.palette.success.main,
  };

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
        {t("auth.accountSecurity")}
      </Typography>
      <MyTextField
        counter
        errors={errors}
        fieldName="email"
        inputRef={emailRef}
        label={t("auth.email")}
        maxValue={254}
        register={register("email")}
        required
        startIcon={<EmailIcon color="primary" />}
        sx={textFieldStyles}
        type="email"
      />
      <Box>
        <MyTextField
          counter={false}
          errors={errors}
          fieldName="password"
          label={t("auth.password")}
          maxValue={128}
          register={register("password")}
          required
          setShowPassword={setShowPassword}
          showPassword={showPassword}
          startIcon={<LockIcon color="primary" />}
          sx={textFieldStyles}
          type="password"
        />

        {/* Password strength indicator */}
        <Box sx={{ mt: 1, mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                mr: 1,
                fontWeight: 500,
                color: strengthColors[passwordStrength],
              }}
            >
              {passwordStrength === 0 && (t("auth.passwordWeak"))}
              {passwordStrength === 1 && (t("auth.passwordFair"))}
              {passwordStrength === 2 && (t("auth.passwordGood"))}
              {passwordStrength === 3 && (t("auth.passwordStrong"))}
            </Typography>
            <Box sx={{ flexGrow: 1, display: "flex", gap: 0.75 }}>
              {[0, 1, 2, 3].map((level) => (
                <Box
                  key={level}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    flexGrow: 1,
                    bgcolor:
                      level <= passwordStrength
                        ? strengthColors[passwordStrength]
                        : theme.palette.divider,
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <MyTextField
        counter={false}
        errors={errors}
        fieldName="confirmPassword"
        label={t("auth.confirmPassword")}
        maxValue={128}
        register={register("confirmPassword")}
        required
        setShowPassword={setShowPassword}
        showPassword={showPassword}
        startIcon={<LockIcon color="primary" />}
        sx={textFieldStyles}
        type="password"
      />
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.info.light, 0.15),
          border: `1px solid ${theme.palette.info.light}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            fontWeight: 500,
            color: theme.palette.info.main,
            mb: 0.5,
          }}
        >
          {t("auth.passwordRequirementsTitle")}
        </Typography>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 1.5
          }}>
          {[
            {
              label: t("validation.min8Chars"),
              check: watchPassword?.length >= 8,
            },
            {
              label: t("validation.uppercase"),
              check: /[A-Z]/.test(watchPassword || ""),
            },
            {
              label: t("validation.lowercase"),
              check: /[a-z]/.test(watchPassword || ""),
            },
            {
              label: t("validation.number"),
              check: /[0-9]/.test(watchPassword || ""),
            },
            {
              label: t("validation.special"),
              check: /[^A-Za-z0-9]/.test(watchPassword || ""),
            },
          ].map((req, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                color: req.check
                  ? theme.palette.success.main
                  : alpha(theme.palette.text.secondary, 0.7),
              }}
            >
              {req.check ? (
                <CheckIcon
                  sx={{
                    fontSize: "0.75rem",
                    mr: 0.25,
                    color: theme.palette.success.main,
                  }}
                />
              ) : (
                <CircleOutlinedIcon
                  sx={{
                    fontSize: "0.75rem",
                    mr: 0.25,
                    color: alpha(theme.palette.text.secondary, 0.5),
                  }}
                />
              )}

              {/* Labels for password requirements */}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: req.check ? 700 : 400,
                  color: req.check
                    ? theme.palette.success.main
                    : alpha(theme.palette.text.secondary, 0.7),
                }}
              >
                {req.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default SecurityStep;
