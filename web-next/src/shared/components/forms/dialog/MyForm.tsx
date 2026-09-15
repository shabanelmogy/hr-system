import React from "react";
import type { MyFormProps } from "./types";
import { FormContainer } from "./FormContainer";
import { FormHeader } from "./FormHeader";
import { FormContent } from "./FormContent";
import { FormFooter } from "./FormFooter";

const MyForm: React.FC<MyFormProps> = (props) => (
  <FormContainer {...props}>
    <FormHeader />
    <FormContent>{props.children}</FormContent>
    {!props.hideFooter && <FormFooter />}
  </FormContainer>
);

export default MyForm;