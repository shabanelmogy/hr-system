import type { Ref } from "react";
import { CheckCircleOutlined as VerifiedIcon } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import MyTextField from "@/shared/components/forms/text-fields/MyTextField";
import { useTranslation } from "react-i18next";

interface DeleteConfirmationFieldProps {
  value: string;
  keyword: string;
  disabled: boolean;
  showError: boolean;
  verified: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
}

export function DeleteConfirmationField({
  value,
  keyword,
  disabled,
  showError,
  verified,
  inputRef,
  onChange,
}: DeleteConfirmationFieldProps) {
  const { t } = useTranslation();
  const helperText = showError
    ? t("messages.pleaseTypeExactly", { keyword })
    : verified
      ? t("messages.confirmationVerified")
      : " ";

  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
        {t("messages.typeDeleteToConfirm")} {" "}
        <Box
          component="code"
          dir="ltr"
          sx={{
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "action.hover",
            color: "error.main",
            fontWeight: 700,
          }}
        >
          {keyword}
        </Box>{" "}
        {t("messages.inTheBoxBelow")}
      </Typography>

      <MyTextField
        counter
        fieldName="deleteConfirmation"
        inputRef={inputRef}
        maxValue={keyword.length}
        minValue={keyword.length}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        label={t("messages.typeDELETE", { keyword })}
        error={showError}
        disabled={disabled}
        required
        autoFocus
        autoComplete="off"
        slotProps={{
          htmlInput: {
            dir: "ltr",
            "aria-required": true,
            spellCheck: false,
          },
          formHelperText: {
            component: "div",
          },
        }}
        helperText={
          verified ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.5,
                color: "success.main",
              }}
            >
              <VerifiedIcon sx={{ fontSize: 16 }} />
              <span>{helperText}</span>
            </Box>
          ) : (
            helperText
          )
        }
      />
    </Box>
  );
}
