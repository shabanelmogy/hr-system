import { useNotifications } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import EmailIcon from "@mui/icons-material/Email";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SendIcon from "@mui/icons-material/Send";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const ResendEmailConfirmation = () => {
  const { showError, showSuccess, showInfo, SnackbarComponent } =
    useNotifications();
  const theme = useTheme();
  const inputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const imagePath = `/images/confirmedemail${isDarkMode ? "-dark" : ""}.png`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await apiService.post(
        apiRoutes.auth.resendEmailConfirmation,
        { email: data.email },
        { ReturnUrl: "emailConfirmed" }
      );
      reset();
      showSuccess(t("auth.confirmationEmailSent"), t("messages.success"));
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        showError(updatedState.messages, error.title);
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const MotionComponent = motion.div;

  // Color scheme for light and dark modes
  const colors = {
    cardBackground: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#1e293b", 0.8)}, ${alpha(
          "#0f172a",
          0.9
        )})`
      : theme.palette.background.paper,

    headerBackground: isDarkMode
      ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(
          theme.palette.primary.main,
          0.8
        )})`
      : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,

    iconBackground: isDarkMode
      ? alpha(theme.palette.background.paper, 0.95)
      : theme.palette.background.paper,

    iconBoxShadow: isDarkMode
      ? `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`
      : `0 0 20px ${alpha(theme.palette.common.white, 0.3)}`,

    dividerColor: isDarkMode
      ? alpha(theme.palette.divider, 0.3)
      : alpha(theme.palette.divider, 0.6),

    buttonBackground: isDarkMode
      ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
      : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  };

  return (
    <Fade in={true} timeout={800}>
      <Card
        elevation={isDarkMode ? 12 : 6}
        sx={{
          maxWidth: 450,
          width: "90%",
          mx: "auto",
          mt: { xs: 4, sm: 7 },
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: isDarkMode ? theme.shadows[16] : theme.shadows[8],
          background: colors.cardBackground,
          border: isDarkMode
            ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            : "none",
        }}
      >
        <Box
          sx={{
            background: colors.headerBackground,
            py: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            component={MotionComponent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: "50%",
                p: 2,
                bgcolor: colors.iconBackground,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: colors.iconBoxShadow,
                border: isDarkMode
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  : "none",
              }}
            >
              <img
                src={imagePath}
                alt="Confirmation"
                style={{
                  width: isMobile ? 100 : 120,
                  height: isMobile ? 100 : 120,
                  objectFit: "contain",
                  filter: isDarkMode ? "brightness(1.1)" : "none",
                }}
              />
            </Paper>
          </Box>

          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="bold"
            align="center"
            sx={{
              color: isDarkMode
                ? theme.palette.common.white
                : theme.palette.common.white,
              textShadow: isDarkMode
                ? `0px 2px 4px ${alpha(theme.palette.common.black, 0.5)}`
                : "0px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {t("auth.emailConfirmation")}
          </Typography>
        </Box>

        <CardContent
          sx={{
            py: 4,
            backgroundColor: isDarkMode
              ? "transparent"
              : theme.palette.background.default,
          }}
        >
          <Stack justifyContent="center" alignItems="center" spacing={3}>
            <Box sx={{ textAlign: "center", px: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  color: isDarkMode
                    ? theme.palette.text.primary
                    : theme.palette.grey[800],
                  fontWeight: 500,
                }}
              >
                Check your email inbox to activate your account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode
                    ? alpha(theme.palette.text.secondary, 0.8)
                    : theme.palette.grey[600],
                }}
              >
                Didn't receive the email? Enter your address below to resend it
              </Typography>
            </Box>

            <Divider
              sx={{
                width: "80%",
                opacity: isDarkMode ? 0.3 : 0.6,
                backgroundColor: colors.dividerColor,
              }}
            />

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: "100%", px: 2 }}
            >
              <Stack spacing={3} alignItems="center">
                <TextField
                  inputRef={inputRef}
                  label={t("auth.email")}
                  variant="outlined"
                  fullWidth
                  autoComplete="off"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.6)
                        : theme.palette.background.paper,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode
                        ? theme.palette.text.secondary
                        : theme.palette.grey[700],
                    },
                    "& .MuiOutlinedInput-input": {
                      color: theme.palette.text.primary,
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <MarkEmailReadIcon /> : <SendIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: isDarkMode ? theme.shadows[8] : theme.shadows[4],
                    minWidth: 250,
                    background: colors.buttonBackground,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: isDarkMode
                        ? theme.shadows[12]
                        : theme.shadows[8],
                      transform: "translateY(-2px)",
                      background: isDarkMode
                        ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                        : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                    "&:disabled": {
                      background: isDarkMode
                        ? `linear-gradient(45deg, ${alpha(
                            theme.palette.primary.main,
                            0.5
                          )}, ${alpha(theme.palette.primary.dark, 0.5)})`
                        : `linear-gradient(45deg, ${alpha(
                            theme.palette.primary.main,
                            0.6
                          )}, ${alpha(theme.palette.primary.dark, 0.6)})`,
                    },
                  }}
                >
                  {isSubmitting
                    ? t("actions.sending")
                    : t("auth.resendConfirmation")}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
        {SnackbarComponent}
      </Card>
    </Fade>
  );
};

export default ResendEmailConfirmation;
