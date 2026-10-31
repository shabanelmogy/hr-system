import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.NEXT_REFERENCE_ORIGIN??'http://localhost:3100',backend=process.env.NEXT_REFERENCE_BACKEND??'http://127.0.0.1:3199';
const output=path.resolve(root,'../.codex-tmp/angular-country-charts/reference');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8')),captions=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/reference-countries.json'),'utf8'));
const rows=Array.from({length:12},(_,index)=>{const id=index+1;return{id,nameAr:'دولة '+id,nameEn:'Country '+id,alpha2Code:null,alpha3Code:null,phoneCode:null,currencyCode:id%4===0?null:id%4===2?'EGP':'USD',statesCount:id%3,isDeleted:false,createdOn:`2026-${String(Math.ceil(id/4)).padStart(2,'0')}-${String(id).padStart(2,'0')}T00:00:00Z`,updatedOn:null};});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const mode of ['light','dark'])for(const language of ['en','ar'])for(const width of [390,1440]){
  const context=await browser.newContext({baseURL:origin,viewport:{width,height:width===390?780:1050},reducedMotion:'reduce'}),page=await context.newPage();
  await page.request.post(backend+'/__e2e/reset');await context.addCookies(Object.entries({themePalette:'green',currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  await context.route(origin+'/api/v1/countries?**',async route=>{
   assert.equal(route.request().method(),'GET');const url=new URL(route.request().url()),size=Number(url.searchParams.get('pageSize')),pageNumber=Number(url.searchParams.get('pageNumber')),sorted=[...rows].sort((a,b)=>b.createdOn.localeCompare(a.createdOn)),totalPages=Math.ceil(12/size);
   await route.fulfill({contentType:'application/json',body:JSON.stringify({items:sorted.slice((pageNumber-1)*size,pageNumber*size),metaData:{currentPage:pageNumber,pageNumber,pageSize:size,totalCount:12,totalPages,hasNext:pageNumber<totalPages,hasPrev:pageNumber>1}})});
  });
  await page.goto('/login?returnTo='+encodeURIComponent('/super-admin/geography/countries'));await page.getByRole('button',{name:/^(Super Admin|مدير النظام)$/}).click();await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible({timeout:120000});
  const label=core[language]['views.chart'],chart=page.getByRole('button',{name:label,exact:true});
  if(await chart.count()&&await chart.isVisible())await chart.click();else{await page.getByRole('button',{name:core[language]['navigation.moreViews'],exact:true}).click();await page.getByRole('menuitem',{name:label,exact:true}).click();}
  await expect(page.locator('figure')).toHaveCount(4);await expect(page.locator('figure .recharts-wrapper')).toHaveCount(4);await page.evaluate(()=>document.fonts.ready);
  const geometry=await page.locator('figure').evaluateAll(figures=>figures.map(figure=>{
   const style=getComputedStyle(figure),rect=figure.getBoundingClientRect(),heading=figure.querySelector('h6'),titleStyle=getComputedStyle(heading);
   return{title:heading.textContent,width:rect.width,height:rect.height,padding:style.padding,radius:style.borderRadius,titleSize:titleStyle.fontSize,titleWeight:titleStyle.fontWeight,font:titleStyle.fontFamily,barCount:figure.querySelectorAll('.recharts-bar-rectangle').length,pieCount:figure.querySelectorAll('.recharts-pie-sector').length,areaCount:figure.querySelectorAll('.recharts-area-area').length};
  }));
  assert.deepEqual(geometry.map(item=>item.title),['countries.charts.statesByCountry','countries.charts.statesCoverage','countries.charts.topCurrencies','countries.charts.timeline'].map(key=>captions[language][key]));
  assert.equal(geometry[0].barCount,6);assert.equal(geometry[1].pieCount,2);assert.equal(geometry[2].barCount,2);assert.equal(geometry[3].areaCount,1);await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-charts.png`),fullPage:true,animations:'disabled'});
  results.push({mode,language,width,geometry,passed:true});await context.close();console.log(`Next chart source passed ${mode}/${language}/${width}`);
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}
