import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium,expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220';
const output=path.resolve(root,'../.codex-tmp/angular-grid-capabilities');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const smoke=process.argv.includes('--smoke'),full=process.argv.includes('--full');
const collectionRoot='src/app/shared/ui/collections';
const sourcePaths=[...fs.readdirSync(path.join(root,collectionRoot)).filter(name=>!name.endsWith('.spec.ts')).map(name=>collectionRoot+'/'+name),
 'src/app/shared/data/grid-filter.ts','src/app/shared/ui/layout/_scrollbar.scss','src/styles.scss','src/theme/prime-preset.ts',
 'src/app/shared/ui/layout/page-header.ts','src/app/shared/ui/layout/page-header.scss','src/app/shared/ui/buttons/action-button.ts','src/app/shared/ui/buttons/action-button.scss','src/app/shared/ui/feedback/status-badge.ts','src/app/shared/ui/controls/option-select.ts','src/app/shared/ui/overlays/popover-panel.ts','src/app/shared/ui/forms/fields/date-field.ts','src/app/shared/ui/forms/fields/text-field.ts','src/app/shared/ui/forms/fields/numeric-field.ts','src/app/dev/grid-capabilities-preview.ts','src/theme/grid-locale.ts','src/app/platform/localization/catalog.generated.ts'].sort();
const fingerprint=()=>{const hash=createHash('sha256');for(const source of sourcePaths)hash.update(source+'\0').update(fs.readFileSync(path.join(root,source)));return hash.digest('hex');};
const sourceFingerprint=fingerprint();
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const palette of(full?themePaletteOrder:['green']))for(const mode of(smoke?['light']:['light','dark']))for(const language of(smoke?['en']:['en','ar']))for(const width of(smoke?[1440]:[390,1440])){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:1050},reducedMotion:'reduce',acceptDownloads:true});
  await context.addCookies(Object.entries({themePalette:palette,currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  const page=await context.newPage(),errors=[],hotUpdates=[],requests=[],dialogs=[];let acceptanceStarted=false;
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('/api/'))requests.push(request.url());});page.on('dialog',async dialog=>{dialogs.push(dialog.type());await dialog.dismiss();});
  page.on('websocket',socket=>socket.on('framereceived',frame=>{try{const update=JSON.parse(String(frame.payload));if(update.type==='full-reload'||update.event==='angular:component-update')hotUpdates.push({update,afterBaseline:acceptanceStarted});}catch{}}));
  const captions=core[language],state=page.getByTestId('grid-state'),rows=page.locator('[data-collection-row]');
  const ready=async()=>{await expect(state).toHaveAttribute('data-kind','ready');await expect(rows.first()).toBeVisible();};
  const starts=async()=>Number(await state.getAttribute('data-starts'));
  const reset=async()=>{await page.getByTestId('reset').getByRole('button').click();await expect(state).toHaveAttribute('data-filters','[]');await ready();};
  const openFilter=async field=>{await page.locator(`th[data-column-key="${field}"] p-column-filter`).getByRole('button').first().click();await expect(page.locator('.p-datatable-filter-overlay')).toBeVisible();};
  const overlay=()=>page.locator('.p-datatable-filter-overlay');
  const choose=async(locator,text)=>{await locator.getByRole('combobox').click();await page.getByRole('option',{name:text,exact:true}).click();};
  await page.goto(origin+'/dev/grid-capabilities');await ready();await page.evaluate(()=>document.fonts.ready);await expect(rows).toHaveCount(10);assert.equal(await starts(),1);
  await expect(page.locator('html')).toHaveAttribute('dir',language==='ar'?'rtl':'ltr');
  acceptanceStarted=true;
  const geometry=await page.evaluate(()=>{
   const header=document.querySelector('erp-page-header'),title=header.querySelector('h1'),column=document.querySelector('th[data-column-key=name]'),style=getComputedStyle(title);
   const badges=header.querySelector('.header-badges').getBoundingClientRect(),controls=header.querySelector('.header-controls').getBoundingClientRect();
   return{headerHeight:header.getBoundingClientRect().height,titleFontSize:style.fontSize,titleWeight:style.fontWeight,columnHeight:column.getBoundingClientRect().height,badgesTop:badges.top,controlsBottom:controls.bottom,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  assert.ok(geometry.documentWidth<=width+1);assert.equal(geometry.columnHeight,56);assert.equal(geometry.titleFontSize,width===390?'16px':'18px');assert.equal(geometry.titleWeight,'600');
  if(width===390)assert.ok(geometry.badgesTop>=geometry.controlsBottom,'Mobile badges occupy their own row below controls');
  await page.screenshot({path:path.join(output,`${palette}-${mode}-${language}-${width}-grid.png`),fullPage:true,animations:'disabled'});
  if(!full||palette==='green'){
   await openFilter('name');const before=await starts();await overlay().locator('erp-grid-filter-input input').fill('A');
   assert.equal(await starts(),before,'Draft filtering must wait for Apply');await overlay().getByRole('button',{name:captions['collections.addRule'],exact:true}).click();
   await expect(overlay().locator('erp-grid-filter-input')).toHaveCount(2);await overlay().locator('erp-grid-filter-input input').nth(1).fill('B');
   await choose(overlay().locator('.p-datatable-filter-operator'),captions['collections.matchAny']);
   await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-filter.png`),fullPage:true,animations:'disabled'});
   await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await expect.poll(starts).toBe(before+1);await ready();
   const filters=JSON.parse(await state.getAttribute('data-filters'));assert.equal(filters[0].operator,'or');assert.equal(filters[0].constraints.length,2);
   assert.ok((await rows.allTextContents()).every(text=>text.includes('A ·')||text.includes('B ·')));
   await openFilter('amount');await overlay().locator('erp-grid-filter-input input').fill('5');await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await ready();await expect.poll(async()=>JSON.parse(await state.getAttribute('data-filters')).length).toBe(2);
   await reset();
   await openFilter('day');await overlay().locator('erp-grid-filter-input input').fill('2026-01-14');await overlay().getByRole('button',{name:captions['dateField.chooseDate']+' · '+captions['general.createdOn'],exact:true}).click();await page.locator('.p-popover [data-pc-section="day"][data-date="2026-0-15"]').click();await expect(overlay()).toBeVisible();await expect(overlay().locator('erp-grid-filter-input input')).toHaveValue('2026-01-15');await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await expect.poll(async()=>JSON.parse(await state.getAttribute('data-filters'))[0]?.constraints[0].value).toBe('2026-01-15');await ready();await reset();
   await openFilter('enabled');await choose(overlay().locator('erp-grid-filter-input erp-option-select'),captions['collections.trueValue']);await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await ready();await expect.poll(async()=>JSON.parse(await state.getAttribute('data-filters'))[0]?.constraints[0].value).toBe(true);
   await reset();await openFilter('enabled');await choose(overlay().locator('erp-grid-filter-input erp-option-select'),captions['collections.falseValue']);await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await ready();await expect.poll(async()=>JSON.parse(await state.getAttribute('data-filters'))[0]?.constraints[0].value).toBe(false);
   await reset();await openFilter('name');await overlay().getByRole('button',{name:captions['collections.clear'],exact:true}).click();await ready();
   const beforeSort=await starts();await page.locator('th[data-column-key="name"]').click({modifiers:['Control']});await expect.poll(starts).toBe(beforeSort+1);await ready();assert.equal(JSON.parse(await state.getAttribute('data-sorts')).length,2);
   const reads=await starts();await page.getByTestId('language').getByRole('button').click();await page.getByTestId('language').getByRole('button').click();assert.equal(await starts(),reads);
   await rows.first().locator('erp-button button[aria-expanded]').click();await expect(page.getByTestId('row-detail')).toBeVisible();await rows.first().locator('erp-button button[aria-expanded]').click();await expect(page.getByTestId('row-detail')).toHaveCount(0);
   await choose(page.getByTestId('selection-mode'),captions['collections.selectionRadio']);await rows.nth(0).getByRole('radio').check();await rows.nth(1).getByRole('radio').check();await expect(rows.locator('input[type=radio]:checked')).toHaveCount(1);await expect(rows.nth(1)).toHaveAttribute('aria-selected','true');
   await choose(page.getByTestId('selection-mode'),captions['collections.selectionSingle']);await rows.nth(0).getByRole('checkbox').check();await rows.nth(1).getByRole('checkbox').check();await expect(rows.locator('input[type=checkbox]:checked')).toHaveCount(1);
   await choose(page.getByTestId('selection-mode'),captions['collections.selectionRange']);await rows.first().getByRole('checkbox').check();await rows.nth(2).locator('td').nth(3).click({modifiers:['Shift']});await expect(rows.locator('input[type=checkbox]:checked')).toHaveCount(3);
   await rows.nth(2).focus();await rows.nth(2).press('Shift+ArrowDown');await expect(rows.locator('input[type=checkbox]:checked')).toHaveCount(4);
   await page.getByTestId('freeze-row').getByRole('button').click();await expect(page.locator('[data-collection-row][data-collection-frozen=true]')).toHaveCount(1);await expect(rows).toHaveCount(10);assert.deepEqual(await page.locator('p-table tbody').evaluateAll(elements=>elements.map(element=>getComputedStyle(element).position)),['sticky','static']);await page.getByTestId('freeze-row').getByRole('button').click();await expect(page.locator('[data-collection-row][data-collection-frozen=true]')).toHaveCount(0);
   await rows.first().getByRole('button',{name:captions['collections.rowActions'],exact:true}).click();await page.getByRole('menuitem',{name:captions['actions.view'],exact:true}).click();await expect(state).toHaveAttribute('data-action',/^view:\d+$/);
   await page.getByTestId('group').getByRole('button').click();await expect(state).toHaveAttribute('data-kind','ready');await expect(page.locator('.group-row')).toHaveCount(1);await expect(rows).toHaveCount(0);const groupReads=await starts();await page.locator('.group-row').getByRole('button').click();await expect(rows).toHaveCount(10);await page.locator('.group-row').getByRole('button').click();await expect(rows).toHaveCount(0);assert.equal(await starts(),groupReads);await reset();
   await page.getByTestId('header-groups').getByRole('button').click();await expect(page.locator('p-table thead tr')).toHaveCount(3);await expect(page.locator('th[data-column-key=id]')).toHaveAttribute('rowspan','2');await expect(page.getByTestId('projected-header')).toHaveText(captions['general.id']);await expect(page.getByTestId('projected-footer')).toHaveText('10 / 137');
   await openFilter('name');await overlay().locator('erp-grid-filter-input input').fill('A');await overlay().getByRole('button',{name:captions['collections.apply'],exact:true}).click();await ready();await expect(page.getByTestId('projected-footer')).toHaveText('10 / 46');await reset();await page.getByTestId('header-groups').getByRole('button').click();await expect(page.locator('p-table thead tr')).toHaveCount(1);await expect(page.getByTestId('projected-footer')).toHaveCount(0);
   const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:captions['collections.exportCsv'],exact:true}).click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'grid-fixture.csv');const target=path.join(output,`fixture-${language}-${width}.csv`);await download.saveAs(target);assert.equal(fs.readFileSync(target,'utf8').split('\r\n').length,12);
   const gridOptions=page.getByRole('button',{name:captions['actions.gridOptions'],exact:true});await gridOptions.click();await page.getByTestId('pin').getByRole('button').click();await expect(page.locator('th[data-column-key="id"]')).toHaveClass(/(^|\s)p-datatable-frozen-column(\s|$)/);
   await page.getByTestId('save').getByRole('button').click();await page.keyboard.press('Escape');await expect(gridOptions).toBeFocused();await page.getByTestId('scope').getByRole('button').click();await expect(state).toHaveAttribute('data-scope','fixture-b');await ready();
   await expect(page.getByTestId('row-detail')).toHaveCount(0);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(hotUpdates.filter(event=>event.afterBaseline),[],'Development server reloaded after the stable acceptance baseline');assert.equal(fingerprint(),sourceFingerprint,'Runtime files changed during acceptance');assert.deepEqual(requests,[]);assert.deepEqual(dialogs,[]);
  results.push({palette,mode,language,width,sourceFingerprint,bootstrapReloads:hotUpdates.filter(event=>!event.afterBaseline).length,interactions:!full||palette==='green',geometry,starts:await starts(),passed:true});await context.close();console.log(`Shared Grid capabilities passed ${palette}/${mode}/${language}/${width}`);
 }
 fs.writeFileSync(path.join(output,full?'visual-results.json':smoke?'smoke-results.json':'focused-results.json'),JSON.stringify(results,null,2));
 console.log(`Shared Grid: ${results.length} ${full?'visual':smoke?'smoke':'focused'} cases passed; neutral simulated-remote fixtures only. Full capability matrix remains authoritative.`);
}finally{await browser.close();}
