import { describe, expect, it } from "vitest";
import { systemSettingsSchema, textFormSchema } from "./companyLocalizationValidation";

describe("company text field validation", () => {
  const schema=textFormSchema("Keep all placeholders", "<0>Hello {{name}}</0> {0} {{name}}");
  it("preserves meaningful whitespace and allows reordered exact placeholders", () => {
    expect(schema.parse({value:"  {{name}} {0} <0>مرحبا {{name}}</0>  "}).value).toBe("  {{name}} {0} <0>مرحبا {{name}}</0>  ");
  });
  it.each(["", "   ", "<0>Hello {{name}}</0> {0}", "<0>Hello {{other}}</0> {0} {{name}}", "x".repeat(4001)])("places invalid text errors on the value field", value => {
    const result=schema.safeParse({value});
    expect(result.success).toBe(false);
    if(!result.success) expect(result.error.issues[0].path).toEqual(["value"]);
  });
});

it("global settings use an honest scope-free contract",()=>{
 const value={revision:0,languages:["en","ar"],sources:[],catalogVersions:{web:"v1",mobile:"v1"}};
 expect(systemSettingsSchema.safeParse(value).success).toBe(true);
 expect(systemSettingsSchema.safeParse({...value,tenantId:"fake",companyId:0,defaultLanguage:"en"}).success).toBe(false);
});
