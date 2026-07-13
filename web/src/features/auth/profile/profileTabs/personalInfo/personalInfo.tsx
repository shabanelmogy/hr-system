/* eslint-disable react/prop-types */
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent, Fade, alpha } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { apiRoutes } from "@/routes";
import { MySimpleLoader } from "@/shared/components";
import { HandleApiError, apiService } from "@/shared/services";
import PersonalInfoForm from "./components/personalInfoForm";
import PersonalInfoHeader from "./components/personalInfoHeader";
import getPersonalDetailsSchema from "./utils/validation";

interface PersonalInfoProps {
  onInfoUpdated?: (data: any) => void;
  showSuccess?: (message: string, title: string) => void;
  showError?: (message: string, title: string) => void;
}

const PersonalInfo = ({ onInfoUpdated, showSuccess, showError }: PersonalInfoProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef(null);

  const validationSchema = getPersonalDetailsSchema(t);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userInfo = await apiService.get(apiRoutes.auth.getUserInfo);
        originalData.current = JSON.parse(JSON.stringify(userInfo));
        reset(userInfo);
        if (onInfoUpdated) {
          onInfoUpdated(userInfo);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        if (showError) {
          showError(t("auth.failedLoadUserInfo"), t("messages.error"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleEdit = () => {
    if (!isEditing) {
      // Store current form values when entering edit mode
      const currentValues = control._formValues;
      originalData.current = JSON.parse(JSON.stringify(currentValues));
    }
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

  const handleSave = async (data: { firstName?: string; lastName?: string; userName?: string }) => {
    setIsSaving(true);
    try {
      const requestData = {
        ...data,
        request: data,
      };

      await apiService.put(apiRoutes.auth.updateUserInfo, requestData);

      // Update localStorage
      localStorage.setItem("userName", data.userName);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);

      // Show success notification
      if (showSuccess) {
        showSuccess(t("auth.profileUpdated"), t("messages.success"));
      }

      // Update original data reference
      originalData.current = JSON.parse(JSON.stringify(data));

      // Update parent component
      if (onInfoUpdated) {
        onInfoUpdated(data);
      }

      // IMPORTANT: Exit edit mode after successful save
      setIsEditing(false);
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        if (showError) {
          showError(updatedState.messages, (error as any)?.title);
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

  if (isLoading) {
    return <MySimpleLoader />;
  }

  return (
    <Fade in={true} timeout={300}>
      <Card
        sx={{
          p: 0,
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          border: (theme) =>
            `1px solid ${alpha(theme.palette.info.light, 0.2)}`,
          "&:hover": {
            boxShadow: (theme) =>
              `0 12px 28px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
      >
        <PersonalInfoHeader
          isEditing={isEditing}
          isSaving={isSaving}
          onButtonClick={onButtonClick}
          handleUndo={handleUndo}
          t={t}
        />

        <CardContent sx={{ p: 3 }}>
          <PersonalInfoForm
            isEditing={isEditing}
            control={control}
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
