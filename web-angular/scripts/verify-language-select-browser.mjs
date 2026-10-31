import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium,expect } from '@playwright/test';
import { contrastRatio,themePaletteOrder } from '@app/tokens';
const output=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../.codex-tmp/angular-shell');fs.mkdirSync(output,{recursive:true});
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4210';
const api=process.env.ANGULAR_API_ORIGIN??'https://localhost:7037';
const hex=value=>'#'+value.match(/[\d.]+/g).slice(0,3).map(v=>Number(v).toString(16).padStart(2,'0')).join('');
const browser=await chromium.launch({channel:'chrome'});const results=[];
try{
  for(const palette of themePaletteOrder)for(const mode of ['light','dark'])for(const language of ['en','ar']){
    const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await context.addCookies(Object.entries({themePalette:palette,currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
    await context.route(api+'/api/**',r=>r.fulfill({status:r.request().url().endsWith('/csrf')?200:401,contentType:'application/json',body:JSON.stringify({requestToken:'fixture'})}));
    const p=await context.newPage();await p.goto(origin+'/login');const wrapper=p.locator('.desktop-preferences erp-option-select');await wrapper.waitFor();
    await expect(wrapper.locator('p-select')).toHaveCount(1);await expect(wrapper.locator('select')).toHaveCount(0);
    await expect(wrapper.locator('.p-select-label')).toHaveText(language==='en'?'English':'العربية');
    const foreground=await wrapper.evaluate(e=>({host:getComputedStyle(e).color,selected:getComputedStyle(e.querySelector('.p-select-label')).color}));
    assert.equal(foreground.selected,foreground.host,`${palette}/${mode}: closed language must inherit its actual surface foreground`);
    const combo=wrapper.getByRole('combobox');await combo.focus();await combo.press('ArrowDown');const selected=p.getByRole('option',{selected:true});await expect(selected).toBeVisible();
    const row=await selected.evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));assert.ok(contrastRatio(hex(row.color),hex(row.background))>=4.5,`${palette}/${mode}: selected option contrast`);
    if(palette==='green')await p.screenshot({path:path.join(output,`language-fixed-${language}-${mode}.png`),fullPage:true});
    await p.keyboard.press('Escape');await expect(p.getByRole('listbox')).toHaveCount(0);await expect(combo).toBeFocused();
    await combo.press('ArrowDown');await combo.press(language==='en'?'End':'Home');await combo.press('Enter');
    await expect(p.locator('html')).toHaveAttribute('dir',language==='en'?'rtl':'ltr');
    results.push({palette,mode,language,foreground,row,passed:true});await context.close();
  }
  fs.writeFileSync(path.join(output,'language-results.json'),JSON.stringify(results,null,2));console.log(`PrimeNG language selector passed: ${results.length} palette/mode/language cases; inherited value color, selected-option contrast and keyboard change/Escape.`);
}finally{await browser.close();}
