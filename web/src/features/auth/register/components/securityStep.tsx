/* eslint-disable react/prop-types */
import {
  alpha,
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

// Icons
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Components
import VerificationBadge from "./verificationBadge";

interface SecurityStepProps {
  register: any;
  errors: any;
  emailRef: React.RefObject<HTMLInputElement>;
  watchPassword: string;
  passwordStrength: number;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  emailVerified: boolean;
  emailChecking: boolean;
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
  emailVerified,
  emailChecking,
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
        {t("auth.accountSecurity") || "Account Security"}
      </Typography>

      <Box>
        <TextField
          fullWidth
          label={t("auth.email") || "Email"}
          variant="outlined"
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
          inputRef={emailRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <VerificationBadge
                  isVerified={emailVerified}
                  isChecking={emailChecking}
                  tooltip={
                    emailChecking
                      ? t("auth.checkingEmail") || "Checking email availability..."
                      : emailVerified
                        ? t("auth.emailAvailable") || "Email is available"
                        : t("auth.emailUnavailable") ||
                        "Email unavailable or not verified"
                  }
                />
              </InputAdornment>
            ),
          }}
          sx={textFieldStyles}
        />

        <Collapse in={emailVerified}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
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
            <Typography variant="caption" fontWeight={500}>
              {t("auth.emailAvailable") || "Email is available"}
            </Typography>
          </Box>
        </Collapse>
      </Box>

      <Box>
        <TextField
          fullWidth
          label={t("auth.password") || "Password"}
          variant="outlined"
          type={showPassword ? "text" : "password"}
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyles}
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
              {passwordStrength === 0 && (t("auth.passwordWeak") || "Weak")}
              {passwordStrength === 1 && (t("auth.passwordFair") || "Fair")}
              {passwordStrength === 2 && (t("auth.passwordGood") || "Good")}
              {passwordStrength === 3 && (t("auth.passwordStrong") || "Strong")}
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

      <TextField
        fullWidth
        label={t("auth.confirmPassword") || "Confirm Password"}
        variant="outlined"
        type={showPassword ? "text" : "password"}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={textFieldStyles}
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
          {t("auth.passwordRequirementsTitle") || "Password Requirements:"}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {[
            {
              label: t("validation.min8Chars") || "8+ characters",
              check: watchPassword?.length >= 8,
            },
            {
              label: t("validation.uppercase") || "Uppercase",
              check: /[A-Z]/.test(watchPassword || ""),
            },
            {
              label: t("validation.lowercase") || "Lowercase",
              check: /[a-z]/.test(watchPassword || ""),
            },
            {
              label: t("validation.number") || "Number",
              check: /[0-9]/.test(watchPassword || ""),
            },
            {
              label: t("validation.special") || "Special character",
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
