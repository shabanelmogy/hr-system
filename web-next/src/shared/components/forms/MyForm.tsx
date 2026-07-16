import React from "react";
import type { MyFormProps } from "./types";
import { FormContainer } from "./FormContainer";
import { FormHeader } from "./FormHeader";
import { FormContent } from "./FormContent";
import { FormFooter } from "./FormFooter";

type MyFormComponent = React.FC<MyFormProps> & {
  Container: typeof FormContainer;
  Header: typeof FormHeader;
  Content: typeof FormContent;
  Footer: typeof FormFooter;
};

const MyForm: MyFormComponent = (props) => {
  // Backwards compatibility: Render the compound components internally
  // so existing implementations don't break.
  return (
    <FormContainer {...props}>
      <FormHeader />
      <FormContent>{props.children}</FormContent>
      {!props.hideFooter && <FormFooter />}
    </FormContainer>
  );
};

MyForm.Container = FormContainer;
MyForm.Header = FormHeader;
MyForm.Content = FormContent;
MyForm.Footer = FormFooter;

export default MyForm;
