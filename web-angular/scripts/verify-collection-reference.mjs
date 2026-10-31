import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,expect} from '@playwright/test';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const output=path.resolve(process.env.NEXT_REFERENCE_OUTPUT??path.resolve(app,'../.codex-tmp/angular-collections/reference'));fs.mkdirSync(output,{recursive:true});
const origin=process.env.NEXT_REFERENCE_ORIGIN??'http://localhost:3100';const backend=process.env.NEXT_REFERENCE_BACKEND??'http://127.0.0.1:3199';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
 for(const mode of ['light','dark'])for(const language of ['en','ar'])for(const width of [390,1440]){
  const context=await browser.newContext({baseURL:origin,viewport:{width,height:1050},reducedMotion:'reduce'});const page=await context.newPage();
  const reset=await page.request.post(backend+'/__e2e/reset');if(!reset.ok())throw new Error('Reference fixture reset failed');
  await context.addCookies(Object.entries({themePalette:'green',currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  await page.goto('/login?returnTo='+encodeURIComponent('/super-admin/geography/countries'));
  await page.getByRole('button',{name:/^(Super Admin|مدير النظام)$/}).click();
  await expect(page.locator('.MuiDataGrid-root')).toBeVisible({timeout:120000});await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible({timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
  const geometry=await page.evaluate(()=>{
   const row=document.querySelector('.MuiDataGrid-row'),head=document.querySelector('.MuiDataGrid-columnHeaders'),footer=document.querySelector('.MuiDataGrid-footerContainer'),grid=document.querySelector('.MuiDataGrid-root');
   return{row:row.getBoundingClientRect().height,header:head.getBoundingClientRect().height,footer:footer.getBoundingClientRect().height,gridWidth:grid.getBoundingClientRect().width,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-table.png`),fullPage:true});
  const cards=page.getByRole('button',{name:language==='ar'?'بطاقات':'Cards',exact:true});
  if(await cards.count()){await cards.click();await expect(page.locator('.MuiDataGrid-root')).toHaveCount(0);await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-cards.png`),fullPage:true});}
  else throw new Error('Reviewed Countries Cards view control was not found');
  results.push({mode,language,width,geometry});await context.close();
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(`Current Next Countries reference: ${results.length} matched viewport/mode/language captures, Grid and Cards.`);
}finally{await browser.close();}
