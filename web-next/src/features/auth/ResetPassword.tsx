"use client";

import { apiRoutes } from "@/config";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ResetPasswordForm {
  email?: string;
  code?: string;
  newPassword?: string;
}

const ResetPassword = () => {
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ResetPasswordForm>();

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

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      await apiService.post(apiRoutes.auth.resetPassword, data);
      reset();
      setTimeout(() => {
        router.replace("/login");
      }, 1000); // Adjust delay if necessary
    } catch (error) {
      HandleApiError(error as Error, (updatedState) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
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
              helperText={errors.newPassword?.message as string}
              slotProps={{
                input: passwordInputProps
              }}
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
