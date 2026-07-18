import { useEffect, useRef } from "react";
import { HandleApiError } from "@/shared/services";
import useSnackbar from "./useSnackbar";

type QueryErrorNotifier = (error: unknown) => void;

interface QueryErrorNotificationOptions {
  enabled?: boolean;
  notify?: QueryErrorNotifier;
}

export default function useQueryErrorNotification(
  error: unknown,
  { enabled = true, notify }: QueryErrorNotificationOptions = {},
) {
  const { showSnackbar } = useSnackbar();
  const notifyRef = useRef<QueryErrorNotifier | undefined>(notify);

  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  useEffect(() => {
    if (!enabled || !error) return;

    if (notifyRef.current) {
      notifyRef.current(error);
      return;
    }

    HandleApiError(error, (notification) => {
      showSnackbar("error", notification.messages, notification.title);
    });
  }, [enabled, error, showSnackbar]);
}
