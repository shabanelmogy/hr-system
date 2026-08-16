"use client";

import { apiRoutes, appRoutes } from "@/config";
import { passwordPolicyPattern } from "@/features/auth/validation/passwordPolicy";
import { MyTextField } from "@/shared/components/forms";
import { useSnackbar } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import LockIcon from "@mui/icons-material/Lock";
import { Alert, Button, Card, CardContent, Container, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type InvitationFormData = {
  invitationId: string;
  token: string;
  password: string;
  confirmPassword: string;
};

const AcceptInvitationPage = () => {
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const invitationId = searchParams.get("invitationId")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  const linkValid = Boolean(invitationId && token);
  const schema = z
    .object({
      invitationId: z.string().uuid(),
      token: z.string().min(1),
      password: z
        .string()
        .min(8, t("validation.invalidPassword", { count: 8 }))
        .max(50)
        .regex(passwordPolicyPattern, t("validation.invalidPassword")),
      confirmPassword: z.string().min(1, t("validation.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("validation.passwordsMustMatch"),
    });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvitationFormData>({
    resolver: zodResolver(schema),
    defaultValues: { invitationId, token, password: "", confirmPassword: "" },
  });

  useEffect(() => {
    reset({ invitationId, token, password: "", confirmPassword: "" });
    passwordRef.current?.focus();
  }, [invitationId, reset, token]);

  const onSubmit = async (data: InvitationFormData) => {
    setLoading(true);
    try {
      await apiService.post(apiRoutes.userInvitations.accept, {
        invitationId: data.invitationId,
        token: data.token,
        password: data.password,
      });
      showSnackbar("success", t("auth.invitationAccepted"));
      window.setTimeout(() => router.replace(appRoutes.login), 800);
    } catch (error) {
      HandleApiError(error as Error, (state) => showSnackbar("error", state.messages, state.title));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>{t("auth.acceptInvitation")}</Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>{t("auth.acceptInvitationDescription")}</Typography>
          {!linkValid ? <Alert severity="error" sx={{ mb: 2 }}>{t("auth.invalidInvitationLink")}</Alert> : null}
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("invitationId")} />
            <input type="hidden" {...register("token")} />
            <MyTextField counter={false} errors={errors} fieldName="password" label={t("auth.newPassword")} loading={loading} margin="normal" maxValue={50} inputRef={passwordRef} register={register("password")} required startIcon={<LockIcon />} type="password" />
            <MyTextField counter={false} errors={errors} fieldName="confirmPassword" label={t("auth.confirmPassword")} loading={loading} margin="normal" maxValue={50} register={register("confirmPassword")} required startIcon={<LockIcon />} type="password" />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading || !linkValid}>
              {loading ? t("actions.processing") : t("auth.activateAccount")}
            </Button>
          </form>
        </CardContent>
      </Card>
      {SnackbarComponent}
    </Container>
  );
};

export default AcceptInvitationPage;
