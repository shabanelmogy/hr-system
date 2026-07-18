import type { Ref } from "react";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => refs.forEach((ref) => assignRef(ref, value));
}
