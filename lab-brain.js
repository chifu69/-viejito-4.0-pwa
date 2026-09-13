/* Viejito Lab UI + orchestration. Experimental/shadow only; never mutates production controls. */
(function(){
  'use strict';
  const Core=window.ViejitoLabCore;if(!Core)return;
  const $=id=>document.getElementById(id);
  const KEYS={champion:'viejitoLabProcessChampionV1',experiments:'viejitoLabExperimentsV1',chatModel:'viejitoLabChatChampionV1',chatFeedback:'viejitoLabChatFeedbackV1',shadow:'viejitoLabChatShadowV1',settings:'viejitoLabSettingsV1'};
  const safeJSON=(raw,fallback)=>{try{const v=JSON.parse(raw||'');return v??fallback;}catch(_){return fallback;}};
  const load=(k,f)=>safeJSON(localStorage.getItem(k),f);const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn('Lab storage failed',e);}};
  const fmt=(v,d=3)=>{if(!Number.isFinite(Number(v)))return '—';const out=Number(v).toFixed(d);return d>0?out.replace(/\.?0+$/,''):out;};
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const bridge=()=>window.ViejitoLabBridge||{};
  const lang=()=>bridge().language?.()||'en';
  const text=(en,es)=>lang()==='es'?es:en;
  const archLabel=h=>`${(h||[]).join(' → ')} → 1`;
  const status=(msg,type='info')=>{const el=$('lab-status');if(el){el.textContent=msg;el.dataset.state=type;}};
  let processBusy=false,chatBusy=false;

  let processChampion=load(KEYS.champion,null);
  let experiments=load(KEYS.experiments,[]);
  let settings={autoCompare:true,...load(KEYS.settings,{})};
  let chatFeedback=load(KEYS.chatFeedback,[]);
  let shadowTurns=load(KEYS.shadow,[]);
  let chatBrain=null;
  try{const saved=load(KEYS.chatModel,null);chatBrain=saved?Core.ChatFitBrain.fromJSON(saved.model||saved):new Core.ChatFitBrain({hidden:[16,8]});}catch(_){chatBrain=new Core.ChatFitBrain({hidden:[16,8]});}

  function allLearningRows(){
    const b=bridge();if(typeof b.learningRecordsAll==='function')return Core.cleanProcessRows(b.learningRecordsAll());
    const rows=[];for(let line=1;line<=4;line++){const arr=b.learningRecords?.(line)||[];for(const r of arr)rows.push({...r,extruder:Number(r.extruder)||line,line});}return Core.cleanProcessRows(rows);
  }
  function datasetSummary(){
    const rows=allLearningRows(),products=new Set(rows.map(r=>String(r.product||'').trim()).filter(Boolean)),lines=new Set(rows.map(r=>Number(r.extruder||r.line)).filter(Boolean));
    return {rows,products:products.size,lines:lines.size};
  }
  function persistExperiments(){experiments=experiments.slice(-40);save(KEYS.experiments,experiments);}
  function addExperiment(exp){experiments.push({...exp,id:`lab-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,time:new Date().toISOString()});persistExperiments();renderExperiments();}
  function currentArchitecture(){return processChampion?.hidden?.length?processChampion.hidden:[16,8];}
  function adjacentArchitectures(hidden=currentArchitecture()){
    const a=hidden.map(Number);const total=a.reduce((s,v)=>s+v,0);
    if(total<=12)return [[8,4],[16,8],[24,12]];
    if(total<=24)return [[8,4],[16,8],[24,12]];
    if(total<=36)return [[16,8],[24,12],[32,16]];
    return [[24,12],[32,16],[48,24]];
  }
  function rowsToXY(rows){return {X:rows.map(Core.processFeatureRow),y:rows.map(Core.processTarget)};}
  async function trainArchitecture(hidden,split,{progressPrefix=''}={}){
    const train=rowsToXY(split.train),val=rowsToXY(split.validation),testRows=split.test.length?split.test:split.validation,test=rowsToXY(testRows);
    const model=new Core.DenseFitModel({inputSize:8,hidden,outputSize:1,task:'regression',seed:1337+hidden.reduce((a,b)=>a+b,0),learningRate:.009});
    let lastEpoch=0;
    const history=await model.fit(train.X,train.y,{epochs:180,batchSize:32,validationData:val.X.length?[val.X,val.y]:null,patience:24,onEpochEnd:async(epoch,logs)=>{
      lastEpoch=epoch+1;if(epoch%8===0){const p=$('lab-process-progress');if(p)p.textContent=`${progressPrefix}${archLabel(hidden)} • epoch ${epoch+1} • val ${fmt(logs.valLoss,4)}`;}
    }});
    const pred=test.X.length?model.predict(test.X):model.predict(train.X);const actual=test.y.length?test.y:train.y;const metrics=Core.regressionMetrics(pred,actual);
    return {hidden,model,history,metrics,epochs:lastEpoch,testRows:testRows.length?testRows:split.train};
  }
  function baselineForSplit(split){
    const rows=split.test.length?split.test:split.validation;const actual=rows.map(Core.processTarget);const pred=Core.adaptiveBaseline(split.train,rows);return {metrics:Core.regressionMetrics(pred,actual),pred,rows};
  }
  function subgroupRegressions(result){
    const rows=result.testRows||[],pred=rows.length?result.model.predict(rows.map(Core.processFeatureRow)):[];const groups=new Map();
    rows.forEach((r,i)=>{const key=`L${Number(r.extruder||r.line)||'?'} • ${String(r.product||'Unknown')}`;if(!groups.has(key))groups.set(key,{actual:[],pred:[]});groups.get(key).actual.push(Core.processTarget(r));groups.get(key).pred.push(pred[i]);});
    return [...groups.entries()].map(([key,g])=>({key,...Core.regressionMetrics(g.pred,g.actual)})).sort((a,b)=>b.count-a.count).slice(0,8);
  }
  function chooseWinner(results,currentHidden){
    const valid=results.filter(r=>Number.isFinite(r.metrics.mae));if(!valid.length)return null;const best=valid.slice().sort((a,b)=>a.metrics.mae-b.metrics.mae)[0];
    const tolerance=best.metrics.mae*1.015;const near=valid.filter(r=>r.metrics.mae<=tolerance).sort((a,b)=>a.model.parameterCount()-b.model.parameterCount());const efficient=near[0]||best;
    const current=valid.find(r=>JSON.stringify(r.hidden)===JSON.stringify(currentHidden));
    if(current&&efficient.model.parameterCount()>current.model.parameterCount()){
      const improvement=(current.metrics.mae-efficient.metrics.mae)/Math.max(current.metrics.mae,1e-9);
      if(improvement<.02)return current;
    }
    return efficient;
  }
  async function runProcessTraining(auto=false){
    if(processBusy)return;const summary=datasetSummary();
    if(summary.rows.length<12){status(text(`Lab needs at least 12 valid learned rolls; it has ${summary.rows.length}.`,`Lab necesita por lo menos 12 rollos aprendidos válidos; tiene ${summary.rows.length}.`),'warn');renderProcess();return;}
    processBusy=true;setProcessButtons(true);status(text('Training in isolated shadow mode…','Entrenando en modo sombra aislado…'),'working');
    try{
      const split=Core.timeSplit(summary.rows),baseline=baselineForSplit(split),current=currentArchitecture();
      const architectures=auto?adjacentArchitectures(current):[current],results=[];
      for(let i=0;i<architectures.length;i++)results.push(await trainArchitecture(architectures[i],split,{progressPrefix:auto?`${i+1}/${architectures.length} • `:''}));
      const winner=chooseWinner(results,current)||results[0];
      const previous=processChampion;
      processChampion={version:1,hidden:winner.hidden,model:winner.model.toJSON(),metrics:winner.metrics,baseline:baseline.metrics,samples:summary.rows.length,trainedAt:new Date().toISOString(),parameters:winner.model.parameterCount(),split:{train:split.train.length,validation:split.validation.length,test:split.test.length}};
      save(KEYS.champion,processChampion);
      const outcome=previous?.hidden?JSON.stringify(previous.hidden)===JSON.stringify(winner.hidden)?'kept':'promoted':'created';
      results.forEach(r=>addExperiment({type:'process-fit',architecture:r.hidden,samples:summary.rows.length,mae:r.metrics.mae,rmse:r.metrics.rmse,maxError:r.metrics.maxError,parameters:r.model.parameterCount(),baselineMAE:baseline.metrics.mae,selected:r===winner,outcome:r===winner?outcome:'rejected'}));
      const improve=Number.isFinite(baseline.metrics.mae)&&baseline.metrics.mae>0?100*(baseline.metrics.mae-winner.metrics.mae)/baseline.metrics.mae:null;
      status(text(`Champion ${archLabel(winner.hidden)} selected${improve!=null?` • ${fmt(improve,1)}% vs adaptive baseline`:''}.`,`Champion ${archLabel(winner.hidden)} seleccionado${improve!=null?` • ${fmt(improve,1)}% vs baseline adaptativo`:''}.`),'ok');
      renderProcess(results,winner,baseline,subgroupRegressions(winner));renderOverview();
    }catch(error){console.error('Lab process training failed',error);status(text(`Training failed: ${error.message}`,`Falló el entrenamiento: ${error.message}`),'error');}
    finally{processBusy=false;setProcessButtons(false);}
  }
  function setProcessButtons(disabled){['lab-train','lab-auto-compare'].forEach(id=>{if($(id))$(id).disabled=disabled;});}

  function renderOverview(){
    const s=datasetSummary();if($('lab-overview-process-count'))$('lab-overview-process-count').textContent=String(s.rows.length);
    if($('lab-overview-products'))$('lab-overview-products').textContent=String(s.products);
    if($('lab-overview-chat-count'))$('lab-overview-chat-count').textContent=String(shadowTurns.length);
    if($('lab-overview-champion'))$('lab-overview-champion').textContent=processChampion?archLabel(processChampion.hidden):'16 → 8 → 1';
    if($('lab-overview-fit-state'))$('lab-overview-fit-state').textContent=processChampion?text('Trained','Entrenado'):text('Waiting for training','Esperando entrenamiento');
    if($('lab-overview-chat-state'))$('lab-overview-chat-state').textContent=chatBrain?.trained?text('Trained','Entrenado'):text('Seed brain ready','Cerebro semilla listo');
  }
  function renderProcess(results=null,winner=null,baseline=null,groups=null){
    const s=datasetSummary();if($('lab-process-samples'))$('lab-process-samples').textContent=String(s.rows.length);if($('lab-process-products'))$('lab-process-products').textContent=String(s.products);if($('lab-process-lines'))$('lab-process-lines').textContent=String(s.lines);
    if($('lab-champion-arch'))$('lab-champion-arch').textContent=processChampion?archLabel(processChampion.hidden):'16 → 8 → 1';
    if($('lab-champion-params'))$('lab-champion-params').textContent=processChampion?Number(processChampion.parameters||0).toLocaleString():'—';
    if($('lab-viejito-mae'))$('lab-viejito-mae').textContent=processChampion?.baseline?.mae!=null?fmt(processChampion.baseline.mae,3):'—';
    if($('lab-fit-mae'))$('lab-fit-mae').textContent=processChampion?.metrics?.mae!=null?fmt(processChampion.metrics.mae,3):'—';
    if($('lab-auto-toggle'))$('lab-auto-toggle').checked=settings.autoCompare!==false;
    const resultEl=$('lab-process-results');if(!resultEl)return;
    if(results?.length){
      resultEl.innerHTML=`<div class="lab-model-comparison">${results.map(r=>`<div class="lab-model-row ${r===winner?'winner':''}"><strong>${esc(archLabel(r.hidden))}</strong><span>MAE ${fmt(r.metrics.mae,3)}</span><span>${Number(r.model.parameterCount()).toLocaleString()} params</span><em>${r===winner?'🏆 Champion':'Challenger'}</em></div>`).join('')}</div>${groups?.length?`<div class="lab-subgroups"><strong>${text('Held-out check by line/product','Prueba separada por línea/producto')}</strong>${groups.map(g=>`<span>${esc(g.key)} • n=${g.count} • MAE ${fmt(g.mae,3)}</span>`).join('')}</div>`:''}`;
    }else if(processChampion)resultEl.innerHTML=`<p>${text('Last champion was trained','Último champion entrenado')} ${new Date(processChampion.trainedAt).toLocaleString()} • ${processChampion.split?.train||0}/${processChampion.split?.validation||0}/${processChampion.split?.test||0} train/validation/test.</p>`;
    else resultEl.innerHTML=`<p>${text('The first FIT model starts at 16 → 8 → 1. It will not affect normal Viejito.','El primer modelo FIT empieza en 16 → 8 → 1. No afecta al Viejito normal.')}</p>`;
  }

  function feedbackExamples(){return chatFeedback.filter(r=>r?.text&&Core.CHAT_INTENTS.includes(r.intent)).map(r=>[r.text,r.intent]);}
  async function trainChat(){
    if(chatBusy)return;chatBusy=true;if($('lab-chat-train'))$('lab-chat-train').disabled=true;const out=$('lab-chat-train-status');if(out)out.textContent=text('Training Chat Brain with approved examples…','Entrenando Chat Brain con ejemplos aprobados…');
    try{
      const result=await chatBrain.fit(feedbackExamples(),{epochs:190,onEpochEnd:async(epoch,logs)=>{if(out&&epoch%12===0)out.textContent=`epoch ${epoch+1} • val ${fmt(logs.valLoss,4)}`;}});
      save(KEYS.chatModel,{model:chatBrain.toJSON(),trainedAt:new Date().toISOString(),accuracy:result.accuracy,samples:result.count});
      addExperiment({type:'chat-fit',architecture:chatBrain.hidden,samples:result.count,accuracy:result.accuracy,selected:true,outcome:'trained'});
      if(out)out.textContent=text(`Chat Brain trained • ${fmt(result.accuracy*100,1)}% on its labeled set.`,`Chat Brain entrenado • ${fmt(result.accuracy*100,1)}% en su conjunto etiquetado.`);renderChat();renderOverview();
    }catch(error){console.error(error);if(out)out.textContent=text(`Training failed: ${error.message}`,`Falló: ${error.message}`);}
    finally{chatBusy=false;if($('lab-chat-train'))$('lab-chat-train').disabled=false;}
  }
  function currentContext(line=bridge().activeLine?.()||1){try{return bridge().context?.(line)||{};}catch(_){return {};}}
  function labChatReply(analysis,input){
    const c=analysis.contextUsed||{},r=analysis.references||{},cut=c.lastCut||{},w=r.winder||analysis.session?.lastWinder;const spanish=lang()==='es';
    const pick=(en,es)=>spanish?es:en;
    if(analysis.intent==='greeting')return pick('I’m here. Lab Brain is listening in shadow mode.','Aquí estoy. Lab Brain está escuchando en modo sombra.');
    if(analysis.intent==='thanks')return pick('You’re welcome. I kept the conversation context.','De nada. Conservé el contexto de la conversación.');
    if(analysis.intent==='cancel')return pick('Understood. In Lab I would cancel the pending chat step, without changing production.','Entendido. En Lab cancelaría el paso pendiente del chat, sin cambiar producción.');
    if(analysis.intent==='continue')return pick('I would resume the last conversational workflow with its saved context.','Retomaría el último flujo del chat con el contexto guardado.');
    if(analysis.intent==='swrap_change')return pick('I understand this as an S-Wrap action. Lab will not execute it; it only checks understanding.','Entiendo esto como una acción de S-Wrap. Lab no la ejecuta; solo verifica que entendió bien.');
    if(['winder_heavy','winder_light'].includes(analysis.intent)&&w){const value=Number(w===1?cut.winder1:cut.winder2),target=Number(cut.targetBW??c.targetBW);if(Number.isFinite(value)&&Number.isFinite(target)){const delta=value-target;return pick(`I understand Winder ${w}. Last BW ${fmt(value,3)}, target ${fmt(target,3)} (${delta>=0?'+':''}${fmt(delta,3)}). I kept W${w} as the active reference for your next short follow-up.`,`Entiendo Winder ${w}. Último BW ${fmt(value,3)}, target ${fmt(target,3)} (${delta>=0?'+':''}${fmt(delta,3)}). Dejé W${w} como referencia activa para tu próximo mensaje corto.`);}return pick(`I understand you mean Winder ${w}, but I do not have a completed BW for it in the current context.`,`Entiendo que hablas de Winder ${w}, pero no tengo un BW completo para ese winder en el contexto actual.`);}
    if(analysis.intent==='bw_status'){const avg=Number(cut.averageBW),target=Number(cut.targetBW??c.targetBW);if(Number.isFinite(avg)&&Number.isFinite(target))return pick(`Latest average BW ${fmt(avg,3)} vs target ${fmt(target,3)}.`,`Último BW promedio ${fmt(avg,3)} vs target ${fmt(target,3)}.`);}
    if(analysis.intent==='trend')return pick('I understand this as a trend follow-up and would keep the last line/product reference instead of starting a new topic.','Entiendo esto como seguimiento de tendencia y conservaría la última línea/producto en vez de empezar un tema nuevo.');
    if(analysis.intent==='production')return pick(`I understand this as production status for Line ${c.line||bridge().activeLine?.()||1}.`,`Entiendo esto como estado de producción de Line ${c.line||bridge().activeLine?.()||1}.`);
    if(analysis.intent==='process')return pick(`I understand this as process context (Primary/Secondary/pressure) for ${c.product||'the active product'}.`,`Entiendo esto como contexto de proceso (Primary/Secondary/presión) para ${c.product||'el producto activo'}.`);
    if(r.ambiguous)return pick('“The one/two” is still ambiguous in this Lab context. I would ask one short clarification instead of guessing.','“La uno/dos” todavía es ambigua en este contexto del Lab. Haría una sola pregunta corta en vez de adivinar.');
    return pick(`Lab reads this as “${analysis.intent}”. It would preserve the current line/product context for the next turn.`,`Lab interpreta esto como “${analysis.intent}”. Conservaría la línea/producto actual para el siguiente turno.`);
  }
  function testChatInput(){const input=$('lab-chat-input');if(!input?.value.trim())return;const line=bridge().activeLine?.()||1,c=currentContext(line),a=chatBrain.analyze(input.value,{line,context:c}),reply=labChatReply(a,input.value);const el=$('lab-chat-output');if(el)el.innerHTML=`<div><small>INTENT</small><strong>${esc(a.intent)}</strong><span>${a.learnedIntent?`FIT ${esc(a.learnedIntent)} • ${fmt(a.confidence*100,0)}%`:'rule + context'}</span></div><div><small>REFERENCE</small><strong>${a.references.winder?`Winder ${a.references.winder}`:a.references.line?`Line ${a.references.line}`:a.references.ambiguous?'Ambiguous':'Context'}</strong></div><p>${esc(reply)}</p>`;input.value='';}
  function renderChat(){
    const saved=load(KEYS.chatModel,null);if($('lab-chat-samples'))$('lab-chat-samples').textContent=String(Core.CHAT_SEED_EXAMPLES.length+feedbackExamples().length);if($('lab-chat-feedback-count'))$('lab-chat-feedback-count').textContent=String(chatFeedback.length);if($('lab-chat-shadow-count'))$('lab-chat-shadow-count').textContent=String(shadowTurns.length);
    if($('lab-chat-accuracy'))$('lab-chat-accuracy').textContent=saved?.accuracy!=null?`${fmt(saved.accuracy*100,1)}%`:'—';if($('lab-chat-model-status'))$('lab-chat-model-status').textContent=chatBrain.trained?text('FIT + context active','FIT + contexto activo'):text('Seed/rules only','Solo semilla/reglas');
    const list=$('lab-chat-shadow-list');if(!list)return;const recent=shadowTurns.slice(-12).reverse();
    list.innerHTML=recent.length?recent.map(turn=>`<div class="lab-shadow-row" data-shadow-id="${esc(turn.id)}"><div><small>L${turn.line} • ${new Date(turn.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small><strong>${esc(turn.text)}</strong><span>${esc(turn.analysis?.intent||'other')}${turn.analysis?.references?.winder?` • W${turn.analysis.references.winder}`:''}</span><small class="lab-shadow-compare"><b>Normal:</b> ${esc(turn.currentResponse||'—')}</small><small class="lab-shadow-compare lab-version"><b>Lab:</b> ${esc(turn.labResponse||'—')}</small></div><select aria-label="Correct intent">${Core.CHAT_INTENTS.map(i=>`<option value="${i}" ${i===turn.analysis?.intent?'selected':''}>${i}</option>`).join('')}</select><button type="button" data-lab-approve="${esc(turn.id)}">✓</button></div>`).join(''):`<p>${text('Live chat turns will appear here for review.','Los turnos del chat normal aparecerán aquí para revisión.')}</p>`;
  }
  function approveShadow(id){const turn=shadowTurns.find(t=>t.id===id);if(!turn)return;const row=document.querySelector(`[data-shadow-id="${CSS.escape(id)}"]`),intent=row?.querySelector('select')?.value||turn.analysis?.intent||'other';chatFeedback.push({text:turn.text,intent,time:new Date().toISOString(),line:turn.line});chatFeedback=chatFeedback.slice(-250);save(KEYS.chatFeedback,chatFeedback);turn.approvedIntent=intent;save(KEYS.shadow,shadowTurns);renderChat();}

  function observeChatTurn(payload={}){
    const line=Number(payload.line)||bridge().activeLine?.()||1,context=payload.context||currentContext(line),analysis=chatBrain.analyze(payload.text||'',{line,context});
    const turn={id:`shadow-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,time:new Date().toISOString(),line,text:String(payload.text||'').slice(0,500),analysis:{intent:analysis.intent,ruleIntent:analysis.ruleIntent,learnedIntent:analysis.learnedIntent,confidence:analysis.confidence,references:analysis.references},currentResponse:String(payload.response?.message||payload.response?.value||'').slice(0,700),labResponse:String(labChatReply(analysis,payload.text||'')).slice(0,700)};
    shadowTurns.push(turn);shadowTurns=shadowTurns.slice(-80);save(KEYS.shadow,shadowTurns);if(!$('lab-dialog')?.classList.contains('hidden')){renderChat();renderOverview();}
    return turn;
  }

  function renderExperiments(){const list=$('lab-experiment-list');if(!list)return;const rows=experiments.slice().reverse();list.innerHTML=rows.length?rows.map(e=>`<div class="lab-experiment-row"><div><small>${new Date(e.time).toLocaleString()} • ${esc(e.type)}</small><strong>${e.type==='process-fit'?esc(archLabel(e.architecture)):esc((e.architecture||[]).join(' → '))}</strong></div><span>${e.mae!=null?`MAE ${fmt(e.mae,3)}`:e.accuracy!=null?`Accuracy ${fmt(e.accuracy*100,1)}%`:''}</span><em>${e.selected?'🏆 ':''}${esc(e.outcome||'')}</em></div>`).join(''):`<p>${text('No experiments yet.','Todavía no hay experimentos.')}</p>`;}

  function switchTab(name){document.querySelectorAll('[data-lab-tab]').forEach(b=>b.classList.toggle('active',b.dataset.labTab===name));document.querySelectorAll('[data-lab-panel]').forEach(p=>p.classList.toggle('hidden',p.dataset.labPanel!==name));}
  function renderAll(){renderOverview();renderProcess();renderChat();renderExperiments();if($('lab-auto-toggle'))$('lab-auto-toggle').checked=settings.autoCompare!==false;}
  function openLab(){const d=$('lab-dialog');if(!d)return;d.classList.remove('hidden');d.setAttribute('aria-hidden','false');renderAll();status(text('Shadow mode: Lab can learn and compare, but cannot change production.','Modo sombra: Lab puede aprender y comparar, pero no puede cambiar producción.'),'info');const count=datasetSummary().rows.length;if(settings.autoCompare&&count>=12&&(!processChampion||count-Number(processChampion.samples||0)>=20))setTimeout(()=>runProcessTraining(true),300);if(!chatBrain.trained&&!chatBusy)setTimeout(()=>trainChat(),450);}
  function closeLab(){const d=$('lab-dialog');if(!d)return;d.classList.add('hidden');d.setAttribute('aria-hidden','true');}

  function wire(){
    $('lab-open')?.addEventListener('click',()=>{document.getElementById('tool-menu-popover')?.classList.add('hidden');openLab();});$('lab-close')?.addEventListener('click',closeLab);
    $('lab-dialog')?.addEventListener('click',e=>{if(e.target===$('lab-dialog'))closeLab();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('lab-dialog')?.classList.contains('hidden'))closeLab();});
    document.querySelectorAll('[data-lab-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.labTab)));
    $('lab-train')?.addEventListener('click',()=>runProcessTraining(false));$('lab-auto-compare')?.addEventListener('click',()=>runProcessTraining(true));
    $('lab-auto-toggle')?.addEventListener('change',e=>{settings.autoCompare=!!e.target.checked;save(KEYS.settings,settings);});
    $('lab-chat-train')?.addEventListener('click',trainChat);$('lab-chat-test')?.addEventListener('click',testChatInput);$('lab-chat-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();testChatInput();}});
    $('lab-chat-shadow-list')?.addEventListener('click',e=>{const id=e.target?.dataset?.labApprove;if(id)approveShadow(id);});
  }

  window.ViejitoLab={open:openLab,close:closeLab,observeChatTurn,notifyProcessDataChanged(){renderOverview();renderProcess();},trainProcess:runProcessTraining,trainChat,version:'1.0'};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{wire();renderAll();});else{wire();renderAll();}
})();
