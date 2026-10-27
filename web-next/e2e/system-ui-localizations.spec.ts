import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";
import { companyUiCatalogVersion } from "../src/config/company-ui-catalog-version";
import ar from "../src/locales/resources/platform-auth/ar.json" with {type:"json"};
test.beforeEach(async({request})=>{await resetTestBackend(request);});
for(const language of ["en","ar"] as const){
 test(`global UI editor saves and resets through the shared Grid and form (${language})`,async({page,context})=>{
  test.setTimeout(180000);
  await context.addCookies([{name:"i18next",value:language,domain:"localhost",path:"/"}]);
  let revision=0;let value:string|null=null;
  await page.route(/\/system-ui-localizations\/(settings|texts|runtime|text|reset)(?:\?.*)?$/,async route=>{
   const url=new URL(route.request().url());const kind=url.pathname.split("/").pop();
   if(kind==="settings"){await route.fulfill({json:{revision,languages:["en","ar"],sources:[{id:"web:platform-auth",client:"web",namespace:"platform-auth"}],catalogVersions:{web:companyUiCatalogVersion,mobile:"test"}}});return;}
   if(kind==="runtime"){await route.fulfill({json:{revision,catalogVersion:companyUiCatalogVersion,overrides:value?[{namespace:"platform-auth",language,key:"systemUiTexts.title",value}]:[]}});return;}
   if(kind==="texts"){const shipped=language==="ar"?ar.systemUiTexts.title:"System UI texts";await route.fulfill({json:{revision,catalogVersion:companyUiCatalogVersion,items:[{key:"systemUiTexts.title",baseValue:"System UI texts",targetValue:value??shipped,shippedValue:shipped,isCustomized:value!==null}],totalCount:1,page:1,pageSize:25}});return;}
   const request=route.request().postDataJSON() as {value?:string;expectedRevision:number};
   if(request.expectedRevision!==revision){await route.fulfill({status:409,json:{title:"Conflict"}});return;}
   value=kind==="reset"?null:request.value??null;revision++;await route.fulfill({status:204});
  });
  await loginWithDemoRole(page,"Super Admin","/administration/settings?tab=system-ui-texts");
  const title=language==="ar"?ar.systemUiTexts.title:"System UI texts";
  await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible({timeout:60000});
  await expect(page.getByRole("grid")).toBeVisible();
  if(language==="en"){await page.getByRole("combobox",{name:"Target language",exact:true}).click();await page.getByRole("option",{name:"English",exact:true}).click();}
  const row=page.getByRole("row").filter({hasText:"systemUiTexts.title"});
  const edit=language==="ar"?ar.companyLocalizations.edit:"Edit text";
  const reset=language==="ar"?ar.companyLocalizations.reset:"Reset text";
  await row.getByRole("button",{name:edit,exact:true}).click();
  const dialog=page.getByRole("dialog");
  await dialog.getByRole("textbox").fill(language==="ar"?"نصوص إدارة النظام":"Global administration captions");
  await dialog.getByRole("button",{name:language==="ar"?/حفظ/:"Save Changes",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading",{name:language==="ar"?"نصوص إدارة النظام":"Global administration captions",exact:true})).toBeVisible();
  await row.getByRole("button",{name:reset,exact:true}).click();await page.getByRole("dialog").getByRole("button",{name:reset,exact:true}).click();
  await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible();
  const nextPage=page.getByRole("button",{name:language==="en"?"Go to next page":/الصفحة التالية/});
  await nextPage.scrollIntoViewIfNeeded();await expect(nextPage).toBeInViewport();
  await page.screenshot({path:`../.codex-tmp/system-ui-texts-${language}.png`,fullPage:false});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 });
}
