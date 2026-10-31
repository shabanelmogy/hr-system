import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium,expect} from '@playwright/test';
import {themePaletteOrder} from '@app/tokens';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(app,'../.codex-tmp/angular-collections');fs.mkdirSync(output,{recursive:true});
const resources=JSON.parse(fs.readFileSync(path.join(app,'src/locales/generated/core.json'),'utf8'));
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
 for(const palette of (process.argv.includes('--focused')?['green']:themePaletteOrder))for(const mode of ['light','dark'])for(const language of ['en','ar'])for(const width of [390,1440]){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:1050}});
  await context.addCookies(Object.entries({themePalette:palette,currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  const page=await context.newPage(),errors=[],requests=[];let dialogs=0;
  page.on('pageerror',error=>errors.push(error.message));page.on('dialog',async dialog=>{dialogs++;await dialog.dismiss();});page.on('request',request=>{if(request.url().includes('/api/'))requests.push(request.url());});
  const core=resources[language],state=page.getByTestId('state'),rows=page.locator('[data-collection-row]'),shell=page.locator('erp-collection-frame');
  const ready=async()=>{await expect(state).toHaveAttribute('data-kind','ready');await expect(rows.first()).toBeVisible();};
  const command=async(action,kind='ready')=>{const before=Number(await state.getAttribute('data-requests'));await action();await expect(state).toHaveAttribute('data-requests',String(before+1));await expect(state).toHaveAttribute('data-kind',kind);};
  const record=key=>page.locator('erp-collection-footer').getByRole('button',{name:core['pagination.goTo'+key+'Record'],exact:true});
  const select=async(host,value)=>{await host.getByRole('combobox').click();await page.getByRole('option',{name:value,exact:true}).click();};
  await page.goto(origin+'/dev/collections');await ready();await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('dir',language==='ar'?'rtl':'ltr');await expect(rows).toHaveCount(10);
  assert.equal(await page.locator('table').getAttribute('role'),'grid');await expect(page.locator('table')).toHaveAttribute('aria-rowcount','37');
  await expect(record('First')).toBeDisabled();await expect(record('Last')).toBeEnabled();
  const geometry=await page.evaluate(()=>{
   const table=document.querySelector('.p-datatable-table-container'),footer=document.querySelector('erp-collection-footer'),cell=document.querySelector('td'),head=document.querySelector('th');
   return{pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,row:cell.getBoundingClientRect().height,header:head.getBoundingClientRect().height,internalX:table.scrollWidth>table.clientWidth,internalY:table.scrollHeight>table.clientHeight,footerHeight:footer.getBoundingClientRect().height,border:getComputedStyle(cell).borderBottomColor,expectedBorder:getComputedStyle(document.body).getPropertyValue('--border').trim()};
  });
  assert.ok(geometry.pageWidth<=geometry.viewport+1,JSON.stringify(geometry));assert.equal(geometry.row,52);assert.equal(geometry.header,56);assert.ok(geometry.footerHeight>=52);if(width===390)assert.ok(geometry.internalX);
  if(palette==='green'&&!process.argv.includes('--layout-only')){
   await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-table.png`),fullPage:true});
   // Inner actions and checkboxes do not change the active record.
   await rows.nth(1).locator('p-checkbox input').check();await expect(state).toHaveAttribute('data-selected','2');await expect(state).toHaveAttribute('data-active','1');
   await rows.nth(1).locator('[data-action-id] button').click();await expect(state).toHaveAttribute('data-opened','2');await expect(state).toHaveAttribute('data-active','1');
   await command(()=>record('Last').click());await expect(state).toHaveAttribute('data-page','3');await expect(state).toHaveAttribute('data-active','37');await expect(state).toHaveAttribute('data-selected','');await expect(rows.last()).toBeFocused();
   await record('Previous').click();await expect(state).toHaveAttribute('data-active','36');
   await command(()=>record('First').click());await expect(state).toHaveAttribute('data-active','1');
   await rows.first().focus();await page.keyboard.press('End');await expect(state).toHaveAttribute('data-active','10');
   await command(()=>page.keyboard.press('ArrowDown'));await expect(state).toHaveAttribute('data-active','11');await expect(rows.first()).toBeFocused();
   await page.keyboard.press('Space');await expect(state).toHaveAttribute('data-selected','11');
   await shell.locator('.selection-bar p-checkbox input').check();await expect(state).toHaveAttribute('data-selected','11,12,13,15,16,17,18,19,20');
   await rows.last().click();await command(()=>record('Next').click());await expect(state).toHaveAttribute('data-page','2');await expect(state).toHaveAttribute('data-active','21');await expect(state).toHaveAttribute('data-selected','');
   await command(()=>select(page.locator('erp-collection-footer p-paginator'),'5'));await expect(state).toHaveAttribute('data-page','0');await expect(rows).toHaveCount(5);
   // Options are presentation only; one hidden column, density, scope reset and focus return.
   const options=shell.getByRole('button',{name:core['actions.gridOptions'],exact:true});await options.click();
   await page.locator('.grid-options p-selectbutton').getByRole('button',{name:core['collections.compact'],exact:true}).click();
   assert.ok(Math.abs(await rows.first().locator('td').first().evaluate(e=>e.getBoundingClientRect().height)-36)<=1);
   await page.locator('.grid-options p-tab[value=columns]').click();await page.locator('.grid-options').getByRole('checkbox',{name:core['general.nameEn'],exact:true}).uncheck();await expect(page.locator('th')).toHaveCount(4);
   await page.keyboard.press('Escape');await expect(options).toBeFocused();
   await command(()=>page.getByTestId('scope').getByRole('button').click());await expect(page.locator('th')).toHaveCount(5);
   assert.ok(Math.abs(await rows.first().locator('td').first().evaluate(e=>e.getBoundingClientRect().height)-52)<=1);
   await command(()=>select(page.getByTestId('filter'),core['common.inactive']));
   await expect(rows.first().locator('erp-status-badge')).toHaveText(core['common.inactive']);
   const search=shell.locator('erp-text-field input');await command(()=>search.fill('A'));await expect(rows.first()).toContainText('A ·');
   // A late search is superseded by the next query; no stale rows can return.
   await search.fill('no-match');await expect(state).toHaveAttribute('data-kind','ready');
   await search.fill('B');await expect(rows).toHaveCount(0);await expect(shell).toContainText(core['pagination.noData']);
   await search.fill('');await expect(rows.first()).toBeVisible();await command(()=>select(page.getByTestId('filter'),core['common.all']));
   await command(()=>page.locator('th').filter({hasText:'#'}).press('Enter'));await expect(rows.first().locator('td').nth(1)).toHaveText('37');
   for(const kind of ['error','forbidden','loading']){
    await command(()=>page.locator(`[data-scenario="${kind}"] button`).click(),kind);await expect(rows).toHaveCount(0);
    if(kind==='error')await command(()=>shell.getByRole('button',{name:core['actions.retry'],exact:true}).click());
    else await command(()=>page.locator('[data-scenario="ready"] button').click());
   }
   await command(()=>page.locator('[data-scenario="unknown"] button').click());await expect(record('Last')).toBeDisabled();await expect(page.locator('p-paginator')).toHaveCount(0);await expect(page.locator('.record-count')).toContainText(core['pagination.unknownTotal']);
   await rows.last().click();await command(()=>record('Next').click());await expect(state).toHaveAttribute('data-page','1');
   await command(()=>page.locator('[data-scenario="out-of-range"] button').click());await expect(rows).toHaveCount(0);await expect(state).toHaveAttribute('data-page','4');
   await command(()=>page.locator('[data-scenario="ready"] button').click());
  }
  await page.getByTestId('cards-view').getByRole('button').click();await expect(page.locator('erp-card-list')).toBeVisible();await expect(rows.first()).toBeVisible();
  assert.ok(await rows.first().locator('erp-surface-card').count());await expect(rows.first().locator('erp-status-badge')).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(palette==='green'&&!process.argv.includes('--layout-only')){
   await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-cards.png`),fullPage:true});
   await rows.first().focus();await page.keyboard.press(language==='ar'?'ArrowLeft':'ArrowRight');await expect(state).toHaveAttribute('data-active','36');await expect(rows.nth(1)).toBeFocused();
   await page.keyboard.press(language==='ar'?'ArrowRight':'ArrowLeft');await expect(state).toHaveAttribute('data-active','37');
   await command(()=>record('Last').click());await expect(state).toHaveAttribute('data-active','1'); // descending order retained by the owner
   await expect(rows.last()).toBeFocused();await rows.last().press('Enter');await expect(state).toHaveAttribute('data-opened','1');
   await command(()=>page.getByTestId('scope').getByRole('button').click());await expect(state).toHaveAttribute('data-selected','');
  }
  if(process.argv.includes('--layout-only')){await page.screenshot({path:path.join(output,`final-${mode}-${language}-${width}-cards.png`),fullPage:true});await page.getByTestId('grid-view').getByRole('button').click();await expect(rows.first()).toBeVisible();await page.screenshot({path:path.join(output,`final-${mode}-${language}-${width}-table.png`),fullPage:true});}
  assert.deepEqual(errors,[]);assert.equal(dialogs,0);assert.deepEqual(requests,[]);
  results.push({palette,mode,language,width,geometry,passed:true});await context.close();
 }
 fs.writeFileSync(path.join(output,process.argv.includes('--layout-only')?'layout-results.json':process.argv.includes('--focused')?'focused-results.json':'results.json'),JSON.stringify(results,null,2));console.log(`Collections: ${results.length} palette/mode/language/viewport cases; Table + Cards; ${process.argv.includes('--layout-only')?'layout-only checks passed':'eight full interaction/state/keyboard flows passed'}. `);
}finally{await browser.close();}
