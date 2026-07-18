import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

interface UseFormDialogFocusOptions {
  open: boolean;
  isViewMode: boolean;
  autoFocusFirst: boolean;
  focusFieldName: string | null;
  errors: Record<string, string>;
  formRef: RefObject<HTMLFormElement | null>;
  errorColor: string;
  onErrorFound?: (errorField: string, fieldElement: HTMLElement) => void;
}

export function useFormDialogFocus({
  open,
  isViewMode,
  autoFocusFirst,
  focusFieldName,
  errors,
  formRef,
  errorColor,
  onErrorFound,
}: UseFormDialogFocusOptions) {
  const lastFocusedErrorRef = useRef<string | null>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    },
    [],
  );

  const focusError = useCallback(() => {
    const form = formRef.current;
    if (!form) return false;

    const errorField = Object.keys(errors)
      .map((name) => ({ name, element: findNamedElement(form, name) }))
      .find(
        (candidate): candidate is { name: string; element: HTMLElement } =>
          candidate.element != null,
      );

    if (!errorField) return false;
    if (lastFocusedErrorRef.current === errorField.name) return true;
    lastFocusedErrorRef.current = errorField.name;

    errorField.element.scrollIntoView({ behavior: "smooth", block: "center" });
    schedule(() => {
      if (!errorField.element.isConnected) return;
      errorField.element.focus();
      animateErrorField(errorField.element, errorColor, schedule);
      onErrorFound?.(errorField.name, errorField.element);
    }, 300);
    return true;
  }, [errorColor, errors, formRef, onErrorFound, schedule]);

  const focusInitialField = useCallback(() => {
    if (isViewMode) return;
    if (Object.keys(errors).length > 0 && focusError()) return;
    if (!autoFocusFirst) return;

    schedule(() => {
      const form = formRef.current;
      if (!form) return;
      const preferred = focusFieldName
        ? findNamedElement(form, focusFieldName)
        : null;
      const firstField = form.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
      );
      (preferred ?? firstField)?.focus();
    }, 100);
  }, [autoFocusFirst, errors, focusError, focusFieldName, formRef, isViewMode, schedule]);

  useEffect(() => {
    if (!open) {
      lastFocusedErrorRef.current = null;
      return;
    }
    if (Object.keys(errors).length === 0) {
      lastFocusedErrorRef.current = null;
      return;
    }
    focusError();
  }, [errors, focusError, open]);

  return focusInitialField;
}

function findNamedElement(root: HTMLElement, fieldName: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[name]")).find(
    (element) => element.getAttribute("name") === fieldName,
  ) ?? null;
}

function animateErrorField(
  field: HTMLElement,
  errorColor: string,
  schedule: (callback: () => void, delay: number) => void,
) {
  const parent = field.closest<HTMLElement>(".MuiFormControl-root");
  if (!parent) return;

  parent.style.transition = "all 0.3s ease";
  parent.style.transform = "scale(1.02)";
  parent.style.boxShadow = `0 0 0 2px ${errorColor}`;
  parent.style.animation = "errorShake 0.5s ease-in-out";

  schedule(() => {
    if (!parent.isConnected) return;
    parent.style.transform = "scale(1)";
    parent.style.boxShadow = "";
    parent.style.animation = "";
  }, 600);
}
