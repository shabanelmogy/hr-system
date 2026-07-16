import { createContext, useContext } from "react";
import type { MyFormProps } from "./types";

export interface FormContextType extends Omit<MyFormProps, 'children' | 'onSubmit'> {
  onClose: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement | null>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = FormContext.Provider;

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormContainer");
  }
  return context;
};
