import { apiRoutes } from "@/routes";
import { useSnackbar } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockIcon from "@mui/icons-material/Lock";
import {
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    setValue("email", searchParams.get("email") || "");
    setValue("code", searchParams.get("code") || "");
    inputRef.current?.focus();
  }, [searchParams, setValue]);

  const passwordInputProps = useMemo(
    () => ({
      startAdornment: (
        <InputAdornment position="start">
          <LockIcon />
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword((prev) => !prev)}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }),
    [showPassword]
  ); // Only update when showPassword changes

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await apiService.post(apiRoutes.auth.resetPassword, data);
      reset();
      setTimeout(() => {
        window.location.href = "login"; // Full page reload
      }, 1000); // Adjust delay if necessary
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        showSnackbar("error", updatedState.messages, error.title);
      });
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {t("auth.resetPassword")}
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("newPassword", { required: "Password is required" })}
              label={t("auth.newPassword")}
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              inputRef={inputRef}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={passwordInputProps}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? t("actions.processing") : t("auth.resetPassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
      {SnackbarComponent}
    </Container>
  );
};

export default ResetPassword;
