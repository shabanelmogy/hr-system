"use client";

import { useState } from "react";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTranslation } from "react-i18next";
import { copyText } from "@/shared/utils/clipboard";
import MyButton from "./MyButton";

type CopyState = "idle" | "copying" | "copied" | "failed";
export function CopyButton({ text, label, disabled = false }: {
  text: string; label?: string; disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<{ text: string; state: CopyState }>({ text: "", state: "idle" });
  const state = result.text === text ? result.state : "idle";
  const copy = async () => {
    setResult({ text, state: "copying" });
    try {
      await copyText(text);
      setResult({ text, state: "copied" });
    } catch {
      setResult({ text, state: "failed" });
    }
  };
  return <MyButton size="small" disabled={disabled || !text} loading={state === "copying"}
    startIcon={state === "copied" ? <CheckRoundedIcon /> : <ContentCopyOutlinedIcon />}
    onClick={() => void copy()}>
    <span aria-live="polite">{state === "copied" ? t("actions.copied") : state === "failed" ? t("errorDialog.copyFailed") : label ?? t("actions.copy")}</span>
  </MyButton>;
}
