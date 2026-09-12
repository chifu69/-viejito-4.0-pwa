// Run with Playwright available in NODE_PATH. Uses a temporary, empty browser profile.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname;
  const file=path.join(root,name==='/'?'index.html':name);
  if(!file.startsWith(root+path.sep)||name.includes('..')||name.includes('/.')){res.writeHead(403);return res.end();}
  try{const body=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  let checks=0;
  try{
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg=>{if(msg.type()==='error'&&msg.text().includes('Chat turn failed'))errors.push(msg.text());});
    await page.goto(url);
    await page.evaluate(()=>{state.language='es';commitStartShift('6.35/43',1,170,'es','Jose Esquivel');});
    const ask=text=>page.evaluate(text=>interpret(text),text);
    const reset=()=>page.evaluate(()=>{chatWorkflow=null;saveChatWorkflow();dialogueEngine.sessions.clear();for(const k of Object.keys(localStorage))if(k.startsWith('viejitoDialogueV1'))localStorage.removeItem(k);});
    const expect=(condition,label)=>{assert.ok(condition,label);console.log('PASS',label);checks++;};

    await ask('calcular output');
    let r=await ask('520 515');expect(/minutos/.test(r.message),'bare weights advance to minutes');
    r=await ask('¿por qué?');expect(/60/.test(r.message),'explains time formula');
    r=await ask('¿cómo está la línea 2?');expect(await page.evaluate(()=>chatWorkflow?.stage==='minutes'),'line side question preserves pending form');
    r=await ask('10');expect(r.kind==='result'&&/6210|6,210|6.210/.test(JSON.stringify(r)),'bare minutes complete output after interruption');
    await reset();
    await ask('guardar proceso');await ask('100');
    await ask('¿qué es el secondary?');expect(await page.evaluate(()=>chatWorkflow?.primaryRPM===100&&chatWorkflow?.stage==='secondary'),'process definition preserves primary RPM');
    r=await ask('Secondary 8 W1 520 W2 515 10 minutos S-Wrap 170');
    expect(await page.evaluate(()=>chatWorkflow?.stage==='conditions'&&chatWorkflow?.w2===515),'multiple labeled values advance to optional conditions');
    const before=await page.evaluate(()=>state.processLearning.records.length);
    await ask('skip');expect(await page.evaluate(()=>state.processLearning.records.length)===before+1,'explicit training saves one record');
    await reset();
    const count=await page.evaluate(()=>state.processLearning.records.length);
    await ask('¿cómo guardar proceso Primary 100 Secondary 8 W1 520 W2 515 10 minutos?');
    expect(await page.evaluate(()=>state.processLearning.records.length)===count,'question about saving cannot train');
    await reset();
    const sw=await page.evaluate(()=>state.currentSWrap);
    await ask('no cambiar swrap a 180');
    expect(await page.evaluate(()=>state.currentSWrap)===sw,'negation does not change live S-Wrap');
    await page.evaluate(()=>{state.lastCompletedCut={averageBW:6.4,winder1:6.4,winder2:6.4,currentSWrap:170,targetBW:6.35,time:new Date().toISOString()};});
    await ask('¿y si lo bajo?');r=await ask('160');
    expect(r.title?.includes('Simulación')&&await page.evaluate(()=>state.currentSWrap)===sw,'simulation follow-up uses number without applying');
    await reset();
    await ask('calcula BW');await ask('520 lb');await ask('¿por qué?');r=await ask('7000 ft');
    expect(r.kind==='result'&&Number(r.value)>0,'BW accepts separate values around a side question');
    r=await ask('perdón, 530 lb');expect(r.message.includes('530'),'corrects previous chat calculation');
    r=await ask('¿y con 51?');expect(r.message.includes('51'),'recalculates with another mandrel');
    await reset();r=await ask('calcula BW 7000 520');expect(r.message.includes('520 lb')&&r.message.includes('7000 ft'),'BW recognizes reversed weight and footage');
    await reset();r=await ask('calcula BW 1200 1500');expect(r.kind==='info'&&r.message.includes('lb y ft'),'ambiguous BW pair requests units');
    r=await ask('1200 lb 1500 ft');expect(r.kind==='result','labeled answer resolves ambiguous pair');
    await reset();
    r=await ask('necesito ayuda porque el BW sigue subiendo');expect(!r.message.includes('Puedo operar las funciones'),'specific help does not return generic menu');
    r=await ask('¿qué opinas del desbalance?');expect(!r.message.includes('Dime qué quieres que revise'),'specific opinion reviews the supplied topic');
    await ask('¿y la 2?');expect(await page.evaluate(()=>ACTIVE_LINE)===1,'line follow-up leaves active line unchanged');
    const activeSpeed=await page.evaluate(()=>state.currentSWrap);
    await ask('cambia swrap a 180');expect(await page.evaluate(()=>state.currentSWrap)===activeSpeed,'ambiguous cross-line action is not applied to active line');
    await reset();
    await ask('cambia swrap a 180');expect(await page.evaluate(()=>state.currentSWrap)===180,'explicit action still works on the active line');
    await reset();
    await ask('necesito ayuda porque el BW sigue subiendo');await ask('sí');
    await ask('S-Wrap 175');r=await ask('¿por qué?');expect(/mezcla/.test(r.message),'diagnostic explains why timing matters');
    r=await ask('no');expect(/transici/.test(r.message)&&await page.evaluate(()=>state.currentSWrap)===180,'reported diagnostic data does not alter operational state');
    await reset();
    await page.evaluate(()=>{state.activeShift=null;lineRemove(SHIFT_KEY);});
    await ask('empezar linea 1');await ask('Jose Esquivel');await ask('6.35/43');await ask('170');
    await ask('sí pero S-Wrap 175');expect(await page.evaluate(()=>!state.activeShift&&chatWorkflow?.swrap===175),'mixed confirmation corrects draft without starting');
    await ask('sí');expect(await page.evaluate(()=>state.activeShift&&state.currentSWrap===175),'unambiguous confirmation starts corrected draft');
    await reset();
    await ask('calcular output');await ask('520 515');await ask('pausa');await ask('hola');
    await page.reload();await page.evaluate(()=>{state.language='es';});
    await ask('continuar');expect(await page.evaluate(()=>chatWorkflow?.stage==='minutes'&&chatWorkflow?.w1===520),'paused form survives reload');
    await ask('cancelar');expect(await page.evaluate(()=>chatWorkflow===null),'cancel clears pending workflow');
    // Exercise the actual submit handler and message rendering as well as direct turn calls.
    await page.evaluate(()=>setChatOpen(true));
    await page.locator('#chat-input').fill('hola');await page.locator('#chat-form').evaluate(el=>el.requestSubmit());
    await page.waitForTimeout(250);
    expect(await page.evaluate(()=>!inChatQuery),'UI submit resets chat-query flag');
    expect(errors.length===0,'no browser runtime errors: '+errors.join('; '));
    await context.close();
    const offline=await browser.newContext();
    const offlinePage=await offline.newPage();await offlinePage.goto(url);
    await offlinePage.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await offlinePage.reload();await offline.setOffline(true);await offlinePage.reload();
    expect(await offlinePage.evaluate(()=>typeof interpret==='function'&&window.ViejitoConversation.mode('no cambiar swrap a 180')==='negated'),'new dialogue modules load offline from service-worker cache');
    await offline.close();
    console.log(`${checks} browser checks passed`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
