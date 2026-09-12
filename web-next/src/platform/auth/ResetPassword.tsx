"use client";

import { apiRoutes } from "@/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyTextField } from "@/shared/components/forms";
import { useSnackbar } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import LockIcon from "@mui/icons-material/Lock";
import {
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ResetPasswordFormData,
  getResetPasswordLinkSchema,
  getResetPasswordSchema,
} from "./validation/recoverySchemas";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = getResetPasswordSchema(t);
  const emailFromLink = searchParams.get("email")?.trim() || "";
  const codeFromLink = searchParams.get("code")?.trim() || "";
  const linkValidation = getResetPasswordLinkSchema(t).safeParse({
    email: emailFromLink,
    code: codeFromLink,
  });
  const hasInvalidResetLink = !linkValidation.success;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: { email: "", code: "", newPassword: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const linkData = {
      email: emailFromLink,
      code: codeFromLink,
    };
    const validation = getResetPasswordLinkSchema(t).safeParse(linkData);
    reset({ ...linkData, newPassword: "" });

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "email" || field === "code") {
          setError(field, { type: "manual", message: issue.message });
        }
      });
    }

    inputRef.current?.focus();
  }, [codeFromLink, emailFromLink, reset, setError, t]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    const linkValidation = getResetPasswordLinkSchema(t).safeParse({
      email: data.email,
      code: data.code,
    });
    if (!linkValidation.success) {
      return;
    }

    setLoading(true);
    try {
      await apiService.post(apiRoutes.auth.resetPassword, data);
      reset();
      setTimeout(() => {
        router.replace("/login");
      }, 1000); // Adjust delay if necessary
    } catch (error) {
      HandleApiError(error as Error, (updatedState) => {
        showSnackbar("error", updatedState.messages, updatedState.title);
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {t("auth.resetPassword")}
          </Typography>
          {hasInvalidResetLink && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("auth.invalidResetLink")}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("email")} />
            <input type="hidden" {...register("code")} />
            <MyTextField
              counter={false}
              errors={errors}
              fieldName="newPassword"
              label={t("auth.newPassword")}
              loading={loading}
              margin="normal"
              maxValue={128}
              inputRef={inputRef}
              register={register("newPassword")}
              required
              setShowPassword={setShowPassword}
              showPassword={showPassword}
              startIcon={<LockIcon />}
              type="password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading || hasInvalidResetLink}
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
