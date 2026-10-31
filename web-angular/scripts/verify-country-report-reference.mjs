import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {globalReportFixture as report} from '../src/app/modules/reporting/global-reports/report.fixture.ts';
import {reportPdfFixture} from './support/report-pdf-fixture.mjs';
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.NEXT_REFERENCE_ORIGIN??'http://localhost:3100',backend=process.env.NEXT_REFERENCE_BACKEND??'http://127.0.0.1:3199';
const output=path.resolve(root,'../.codex-tmp/angular-country-report/reference');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8')),pdf=reportPdfFixture(),results=[],browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const mode of ['light','dark'])for(const language of ['en','ar'])for(const width of [390,1440]){
  const context=await browser.newContext({baseURL:origin,viewport:{width,height:width===390?780:1050},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultNavigationTimeout(120000);let renders=[];
  await page.request.post(backend+'/__e2e/reset');await context.addCookies(Object.entries({themePalette:'green',currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  // Existing source fixture lacks global report permission: add it to client fixture
  // session responses only; never alter server source or a real user's grants.
  await context.route(origin+'/api/auth/**',async route=>{const response=await route.fetch();let body;try{body=await response.json();}catch{await route.fulfill({response});return;}if(body.user?.permissions)body.user.permissions=[...new Set([...body.user.permissions,'GlobalCrystalReports:View'])];await route.fulfill({response,json:body});});
  await context.route(origin+'/api/v1/global-crystal-reports?**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify([report])}));
  await context.route(origin+'/api/v1/global-crystal-reports/*/render',async route=>{renders.push(route.request().postDataJSON());await route.fulfill({contentType:'application/pdf',body:pdf});});
  await page.goto('/login?returnTo='+encodeURIComponent('/super-admin/geography/countries'));await page.getByRole('button',{name:/^(Super Admin|مدير النظام)$/}).click();await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible({timeout:120000});
  const text=core[language],label=text['views.report'],button=page.getByRole('button',{name:label,exact:true});
  if(await button.count()&&await button.isVisible())await button.click();else{await page.getByRole('button',{name:text['navigation.moreViews'],exact:true}).click();await page.getByRole('menuitem',{name:label,exact:true}).click();}
  const input=page.getByRole('textbox',{name:text['general.nameAr'],exact:true});await expect(input).toBeVisible();await expect(page.locator('iframe')).toHaveAttribute('title',text['reports.reportViewer']);await page.evaluate(()=>document.fonts.ready);
  const geometry=await input.evaluate(element=>{const panel=element.closest('.MuiPaper-root'),r=panel.getBoundingClientRect(),pdf=document.querySelector('iframe').getBoundingClientRect();return{panel:{x:r.x,y:r.y,width:r.width,height:r.height},document:{x:pdf.x,y:pdf.y,width:pdf.width,height:pdf.height},labels:Array.from(panel.querySelectorAll('label')).map(label=>label.textContent),font:getComputedStyle(element).fontFamily};});
  assert.deepEqual(geometry.labels,[text['general.nameAr'],text['general.nameEn'],text['reports.reportForms']]);if(width===1440)assert.equal(geometry.panel.width,280);
  // The retained Next development source can rerun its render Effect (StrictMode
  // and theme initialization). Record every request rather than assert an Angular
  // once-only lifetime contract on this source comparison harness.
  assert.ok(renders.length>=1);for(const request of renders){assert.deepEqual(request.filters,{});assert.equal(request.expectedSha256,report.rowVersion);assert.equal(request.entityKey,'countries');assert.ok(['en','ar'].includes(request.language));}
  assert.equal(renders.at(-1).language,language);
  await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-ready.png`),fullPage:true,animations:'disabled'});
  results.push({mode,language,width,geometry,renders,passed:true});await context.close();console.log(`Next Report source passed ${mode}/${language}/${width}`);
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}
