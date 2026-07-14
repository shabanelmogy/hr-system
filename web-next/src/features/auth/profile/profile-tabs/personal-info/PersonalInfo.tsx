import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, Fade, alpha } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useSession } from "@/lib/auth/SessionContext";
import { MySimpleLoader } from "@/shared/components/common";
import { useUpdateUserInfo, useUserInfo } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import PersonalInfoForm from "./components/PersonalInfoForm";
import PersonalInfoHeader from "./components/PersonalInfoHeader";
import getPersonalDetailsSchema from "./utils/validation";
import type { PersonalInfoValues, ProfileUserData } from "../../types";

interface PersonalInfoProps {
  onInfoUpdated?: (data: ProfileUserData) => void;
  showSuccess?: (message: string, title: string) => void;
  showError?: (message: string, title: string) => void;
}

const PersonalInfo = ({ onInfoUpdated, showSuccess, showError }: PersonalInfoProps) => {
  const { t } = useTranslation();
  const { user, isLoading: isSessionLoading } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef<PersonalInfoValues | null>(null);
  const reportedLoadError = useRef<unknown>(null);
  const {
    data: userInfo,
    error: userInfoError,
    isLoading: isUserInfoLoading,
  } = useUserInfo({
    enabled: Boolean(user) && !isSessionLoading,
    retry: (failureCount: number, error: unknown) =>
      getErrorStatus(error) !== 429 && failureCount < 1,
  });
  const updateUserInfo = useUpdateUserInfo();

  const validationSchema = getPersonalDetailsSchema(t);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      id: user?.userId ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      userName: user?.userName ?? "",
    },
  });

  useEffect(() => {
    if (!user) return;

    const values: PersonalInfoValues = {
      id: userInfo?.id ?? user.userId,
      firstName: userInfo?.firstName ?? user.firstName ?? "",
      lastName: userInfo?.lastName ?? user.lastName ?? "",
      userName: userInfo?.userName ?? user.userName ?? "",
    };
    originalData.current = values;
    reset(values);
    onInfoUpdated?.({
      ...values,
      email: user.email,
      roles: user.roles,
    });
  }, [onInfoUpdated, reset, user, userInfo]);

  useEffect(() => {
    if (!userInfoError || reportedLoadError.current === userInfoError) return;
    reportedLoadError.current = userInfoError;

    const details = describeProfileError(userInfoError);

    // Session claims contain every field shown by this form, so a temporary
    // rate limit should not block the profile page or open an error dialog.
    if (getErrorStatus(userInfoError) === 429 && user) {
      console.warn("Profile information was rate-limited; using session values.", details);
      return;
    }

    console.error("Failed to fetch user info:", details);

    if (showError) {
      const status = getErrorStatus(userInfoError);
      showError(
        `${t("auth.failedLoadUserInfo")}${status ? ` (${status})` : ""}`,
        t("messages.error"),
      );
    }
  }, [showError, t, user, userInfoError]);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleUndo = () => {
    if (originalData.current) {
      reset(originalData.current, {
        keepValues: false,
        keepDirtyValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      setIsEditing(false);
    }
  };

  const handleSave = async (data: PersonalInfoValues) => {
    setIsSaving(true);
    try {
      const savedData: PersonalInfoValues = { ...data, id: data.id || user?.userId || "" };
      await updateUserInfo.mutateAsync(savedData);

      // Update localStorage
      localStorage.setItem("userName", savedData.userName);
      localStorage.setItem("firstName", savedData.firstName);
      localStorage.setItem("lastName", savedData.lastName);

      // Show success notification
      if (showSuccess) {
        showSuccess(t("auth.profileUpdated"), t("messages.success"));
      }

      // Update original data reference
      originalData.current = savedData;
      reset(savedData);

      // Update parent component
      if (onInfoUpdated) {
        onInfoUpdated(savedData);
      }

      // IMPORTANT: Exit edit mode after successful save
      setIsEditing(false);
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        if (showError) {
          showError(updatedState.messages.join("\n"), updatedState.title);
        }
      });
    } finally {
      // Always stop loading, no matter what happens
      setIsSaving(false);
    }
  };

  const onButtonClick = () => {
    if (isEditing) {
      // Trigger form submission when in edit mode
      handleSubmit(handleSave)();
    } else {
      // Enter edit mode
      toggleEdit();
    }
  };

  if (isSessionLoading && !user) {
    return <MySimpleLoader />;
  }

  if (isUserInfoLoading && !user) return <MySimpleLoader />;

  return (
    <Fade in={true} timeout={300}>
      <Card
        sx={{
          p: 0,
          borderRadius: 1,
          boxShadow: (theme) =>
            `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: "hidden",
          border: (theme) =>
            `1px solid ${alpha(theme.palette.info.light, 0.2)}`,
        }}
      >
        <PersonalInfoHeader
          isEditing={isEditing}
          isSaving={isSaving}
          isDirty={isDirty}
          onButtonClick={onButtonClick}
          handleUndo={handleUndo}
          t={t}
        />

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <PersonalInfoForm
            isEditing={isEditing}
            control={control}
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            handleSave={handleSave}
          />
        </CardContent>
      </Card>
    </Fade>
  );
};

export default PersonalInfo;

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function describeProfileError(error: unknown) {
  if (error && typeof error === "object") {
    const value = error as {
      status?: number;
      title?: string;
      message?: string;
      detail?: string;
    };
    return {
      status: value.status,
      title: value.title,
      message: value.message,
      detail: value.detail,
    };
  }

  return error instanceof Error ? error.message : String(error);
}
