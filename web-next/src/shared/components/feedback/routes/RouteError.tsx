"use client";

import {
  ErrorOutlineRounded as ErrorIcon,
  InfoOutlined as DetailsIcon,
  RefreshOutlined as RetryIcon,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { showErrorDialog } from "../transient";
import { FeedbackState } from "../states/FeedbackState";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
}

export function RouteError({ error, reset, retry }: RouteErrorProps) {
  const { t } = useTranslation();
  const retryRoute = retry ?? reset;

  return (
    <FeedbackState
      role="alert"
      icon={<ErrorIcon color="error" />}
      title={t("feedback.routes.errorTitle")}
      description={t("feedback.routes.errorDescription")}
      actions={
        <>
          <Button variant="contained" onClick={retryRoute} startIcon={<RetryIcon />}>
            {t("feedback.routes.retry")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => showErrorDialog(error, t("feedback.routes.errorTitle"))}
            startIcon={<DetailsIcon />}
          >
            {t("feedback.routes.details")}
          </Button>
        </>
      }
      sx={{ minHeight: "40vh" }}
    />
  );
}

export default RouteError;
