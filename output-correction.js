/*
  Industrial IA 5.35.1 — Output Correction escalation
  When BW is heavy and S-Wrap is already at the 228 ft/min ceiling,
  Viejito asks for measured two-roll production data and calculates a
  coordinated Primary/Secondary starting point to reduce output.
  No setpoint is applied automatically.
*/
(function(root){
  'use strict';

  const MAX_SWRAP = (typeof MAX_SWRAP_SPEED!=='undefined'&&Number.isFinite(Number(MAX_SWRAP_SPEED))) ? Number(MAX_SWRAP_SPEED) : (Number(root.VIEJITO_MAX_SWRAP)||228);
  const CARD_ID = 'output-correction-escalation';
  const DIALOG_ID = 'output-correction-dialog';
  const STYLE_ID = 'output-correction-style';
  let lastSignature = '';

  const num = value => Number(value);
  const finitePositive = value => Number.isFinite(num(value)) && num(value) > 0;
  const fixed = (value, digits=1) => Number.isFinite(num(value)) ? num(value).toFixed(digits) : '—';
  const language = () => {
    try{return String((typeof state!=='undefined'?state?.language:null) || root.localStorage?.getItem('viejitoLanguageV1') || 'en').toLowerCase();}
    catch(_){return 'en';}
  };
  const tx = (en, es, fr=en) => language()==='es' ? es : language()==='fr' ? fr : en;

  function calculateOutputCorrection(input={}){
    const actualBW=num(input.actualBW), targetBW=num(input.targetBW);
    const primaryRPM=num(input.primaryRPM), secondaryRPM=num(input.secondaryRPM);
    const w1=num(input.w1), w2=num(input.w2), minutes=num(input.minutes);
    if(![actualBW,targetBW,primaryRPM,secondaryRPM,w1,w2,minutes].every(finitePositive)){
      return {ready:false,reason:'missing-input'};
    }
    const currentOutput=(w1+w2)*60/minutes;
    const outputRatio=targetBW/actualBW;
    const targetOutput=currentOutput*outputRatio;
    const outputChangePercent=(outputRatio-1)*100;
    return {
      ready:true,
      actualBW,targetBW,primaryRPM,secondaryRPM,w1,w2,minutes,
      currentOutput,targetOutput,outputRatio,outputChangePercent,
      proportionalPrimary:primaryRPM*outputRatio,
      proportionalSecondary:secondaryRPM*outputRatio
    };
  }

  function activeContext(){
    try{
      const appState=typeof state!=='undefined'?state:null;
      const opt=appState?.latestOptimization;
      if(!opt)return null;
      const actualBW=num(opt.actualBW),targetBW=num(opt.targetBW),currentSWrap=num(appState?.currentSWrap ?? opt.currentSWrap);
      const heavy=finitePositive(actualBW)&&finitePositive(targetBW)&&actualBW>targetBW;
      const atMax=finitePositive(currentSWrap)&&currentSWrap>=MAX_SWRAP-.05;
      const needsMore=Boolean(opt.limitReached) || num(opt.rawFormulaSuggestion)>MAX_SWRAP || num(opt.learning?.rawLearnedSuggestion)>MAX_SWRAP;
      if(!(heavy&&atMax&&needsMore))return null;
      return {opt,actualBW,targetBW,currentSWrap};
    }catch(_){return null;}
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${CARD_ID}{margin-top:14px;padding:14px;border:1px solid rgba(255,171,0,.55);border-radius:14px;background:rgba(255,171,0,.08);display:grid;gap:10px}
      #${CARD_ID}.hidden{display:none}
      #${CARD_ID} .oc-head{display:flex;gap:10px;align-items:flex-start}
      #${CARD_ID} .oc-icon{font-size:22px;line-height:1}
      #${CARD_ID} strong{display:block}
      #${CARD_ID} small{display:block;opacity:.8;margin-top:3px;line-height:1.35}
      #${CARD_ID} button{width:100%}
      #${DIALOG_ID}{border:0;padding:0;background:transparent;max-width:min(92vw,620px);width:100%}
      #${DIALOG_ID}::backdrop{background:rgba(0,0,0,.7);backdrop-filter:blur(2px)}
      #${DIALOG_ID} .oc-modal{background:var(--panel,#151d25);color:inherit;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:18px;max-height:88vh;overflow:auto;box-shadow:0 24px 70px rgba(0,0,0,.45)}
      #${DIALOG_ID} .oc-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      #${DIALOG_ID} .oc-close{width:auto;min-width:44px;padding:8px 12px}
      #${DIALOG_ID} .oc-context{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}
      #${DIALOG_ID} .oc-context div,#${DIALOG_ID} .oc-result-grid div{padding:10px;border-radius:12px;background:rgba(255,255,255,.055)}
      #${DIALOG_ID} .oc-context small,#${DIALOG_ID} .oc-result-grid small{display:block;opacity:.7;margin-bottom:3px}
      #${DIALOG_ID} .oc-warning{padding:12px;border-radius:12px;background:rgba(255,171,0,.12);border:1px solid rgba(255,171,0,.45);line-height:1.4;margin:12px 0}
      #${DIALOG_ID} .oc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      #${DIALOG_ID} label{display:grid;gap:5px;font-size:.9rem}
      #${DIALOG_ID} input{width:100%;box-sizing:border-box}
      #${DIALOG_ID} .oc-wide{grid-column:1/-1}
      #${DIALOG_ID} .oc-result{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
      #${DIALOG_ID} .oc-result-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
      #${DIALOG_ID} .oc-setpoints{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
      #${DIALOG_ID} .oc-setpoints div{padding:12px;border-radius:12px;background:rgba(69,187,122,.10);border:1px solid rgba(69,187,122,.28)}
      #${DIALOG_ID} .oc-setpoints small{display:block;opacity:.72}
      #${DIALOG_ID} .oc-setpoints strong{font-size:1.25rem;margin-top:2px}
      #${DIALOG_ID} .oc-note{font-size:.86rem;opacity:.8;line-height:1.4;margin-top:10px}
      @media(max-width:560px){#${DIALOG_ID} .oc-grid,#${DIALOG_ID} .oc-result-grid{grid-template-columns:1fr 1fr}#${DIALOG_ID} .oc-context,#${DIALOG_ID} .oc-setpoints{grid-template-columns:1fr}#${DIALOG_ID} .oc-modal{padding:15px}}
    `;
    document.head.appendChild(style);
  }

  function ensureCard(){
    const panel=document.getElementById('optimizer-panel');
    if(!panel)return null;
    let card=document.getElementById(CARD_ID);
    if(card)return card;
    card=document.createElement('div');
    card.id=CARD_ID;
    card.className='hidden';
    card.innerHTML=`
      <div class="oc-head"><span class="oc-icon">⚠️</span><div><strong data-oc="card-title"></strong><small data-oc="card-copy"></small></div></div>
      <button type="button" data-oc="open"></button>`;
    panel.appendChild(card);
    card.querySelector('[data-oc="open"]')?.addEventListener('click',openDialog);
    return card;
  }

  function ensureDialog(){
    let dialog=document.getElementById(DIALOG_ID);
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id=DIALOG_ID;
    dialog.innerHTML=`
      <form class="oc-modal" method="dialog" onsubmit="return false">
        <div class="oc-title"><div><small data-oc="eyebrow"></small><h3 data-oc="title" style="margin:.2rem 0 0"></h3></div><button type="button" class="secondary oc-close" data-oc="close">✕</button></div>
        <div class="oc-context">
          <div><small data-oc="actual-label"></small><strong data-oc="actual">—</strong></div>
          <div><small data-oc="target-label"></small><strong data-oc="target">—</strong></div>
          <div><small>S-Wrap</small><strong>${MAX_SWRAP.toFixed(0)} MAX</strong></div>
        </div>
        <div class="oc-warning"><strong data-oc="time-warning-title"></strong><span data-oc="time-warning"></span></div>
        <div class="oc-grid">
          <label><span data-oc="primary-label"></span><input data-oc-input="primary" inputmode="decimal" type="number" step="0.1" min="1" placeholder="110"></label>
          <label><span data-oc="secondary-label"></span><input data-oc-input="secondary" inputmode="decimal" type="number" step="0.1" min="1" placeholder="11"></label>
          <label><span data-oc="w1-label"></span><input data-oc-input="w1" inputmode="decimal" type="number" step="0.1" min="1" placeholder="552"></label>
          <label><span data-oc="w2-label"></span><input data-oc-input="w2" inputmode="decimal" type="number" step="0.1" min="1" placeholder="560"></label>
          <label class="oc-wide"><span data-oc="minutes-label"></span><input data-oc-input="minutes" inputmode="decimal" type="number" step="0.01" min="0.01" placeholder="60.00"></label>
          <button class="primary oc-wide" type="button" data-oc="calculate"></button>
        </div>
        <div class="oc-result" data-oc="result" hidden></div>
      </form>`;
    document.body.appendChild(dialog);
    dialog.querySelector('[data-oc="close"]')?.addEventListener('click',()=>dialog.close());
    dialog.querySelector('[data-oc="calculate"]')?.addEventListener('click',calculateFromForm);
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    return dialog;
  }

  function renderLanguage(){
    const card=ensureCard(),dialog=ensureDialog();
    if(card){
      card.querySelector('[data-oc="card-title"]').textContent=tx('S-Wrap MAX — Output correction required','S-Wrap MAX — Se necesita corregir el output','S-Wrap MAX — correction du débit requise');
      card.querySelector('[data-oc="card-copy"]').textContent=tx(`S-Wrap is already ${MAX_SWRAP} ft/min and BW still needs to come down. Use measured two-roll output to calculate a coordinated Primary/Secondary starting point.`,`El S-Wrap ya está en ${MAX_SWRAP} ft/min y el BW todavía necesita bajar. Usa el output real de dos rollos para calcular un starting point coordinado de Primary/Secondary.`,`Le S-Wrap est déjà à ${MAX_SWRAP} ft/min. Utilisez le débit réel de deux rouleaux pour calculer un point de départ Primary/Secondary.`);
      card.querySelector('[data-oc="open"]').textContent=tx('Calculate Output Correction','Calcular corrección de Output','Calculer la correction du débit');
    }
    if(dialog){
      const set=(key,text)=>{const el=dialog.querySelector(`[data-oc="${key}"]`);if(el)el.textContent=text;};
      set('eyebrow',tx('MAX S-WRAP ESCALATION','ESCALACIÓN POR S-WRAP MÁXIMO','ESCALADE S-WRAP MAX'));
      set('title',tx('Output Correction','Corrección de Output','Correction du débit'));
      set('actual-label',tx('Current BW','BW actual','BW actuel'));
      set('target-label',tx('Target BW','BW objetivo','BW cible'));
      set('time-warning-title',tx('Run Time accuracy is critical. ','La precisión del Run Time es muy importante. ','La précision du temps est essentielle. '));
      set('time-warning',tx('Enter the real run time for these two rolls as precisely as possible. An inaccurate time changes lb/hr and can produce a poorer Primary/Secondary recommendation.','Ingresa el tiempo real de producción de estos dos rollos lo más preciso posible. Un tiempo incorrecto cambia las lb/hr y puede producir una sugerencia de Primary/Secondary menos precisa.','Entrez le temps réel des deux rouleaux aussi précisément que possible.'));
      set('primary-label',tx('Current Primary Speed (RPM)','Primary Speed actual (RPM)','Vitesse Primary actuelle (RPM)'));
      set('secondary-label',tx('Current Secondary Speed (RPM)','Secondary Speed actual (RPM)','Vitesse Secondary actuelle (RPM)'));
      set('w1-label',tx('Roll 1 Weight (lb)','Peso Roll 1 (lb)','Poids rouleau 1 (lb)'));
      set('w2-label',tx('Roll 2 Weight (lb)','Peso Roll 2 (lb)','Poids rouleau 2 (lb)'));
      set('minutes-label',tx('Run Time for both rolls (minutes)','Run Time de esos dos rollos (minutos)','Temps des deux rouleaux (minutes)'));
      set('calculate',tx('Calculate coordinated starting point','Calcular starting point coordinado','Calculer le point de départ coordonné'));
    }
  }

  function openDialog(){
    const ctx=activeContext();
    if(!ctx)return;
    injectStyle();renderLanguage();
    const dialog=ensureDialog();
    dialog.querySelector('[data-oc="actual"]').textContent=fixed(ctx.actualBW,2);
    dialog.querySelector('[data-oc="target"]').textContent=fixed(ctx.targetBW,2);
    const result=dialog.querySelector('[data-oc="result"]');if(result){result.hidden=true;result.innerHTML='';}
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }

  function processRecommendation(core,ctx){
    let rec=null;
    try{
      const appState=typeof state!=='undefined'?state:null;
      const engine=appState?.processLearning;
      if(engine&&typeof engine.recommendForSpeedChange==='function'){
        rec=engine.recommendForSpeedChange({
          currentPrimaryRPM:core.primaryRPM,
          currentSecondaryRPM:core.secondaryRPM,
          currentSWrap:MAX_SWRAP,
          targetSWrap:MAX_SWRAP,
          currentBW:ctx.actualBW,
          targetBW:ctx.targetBW,
          product:appState?.activeShift?.product||appState?.product||'',
          mandrel:typeof currentMandrel==='function'?currentMandrel('bw'):null,
          currentOutputLbHr:core.currentOutput
        });
      }
    }catch(_){rec=null;}
    if(rec?.ready)return rec;
    return {
      ready:true,method:'proportional-start',
      primaryRPM:core.proportionalPrimary,
      secondaryRPM:core.proportionalSecondary,
      targetOutputLbHr:core.targetOutput,
      secondaryHeat:null
    };
  }

  function calculateFromForm(){
    const ctx=activeContext(),dialog=ensureDialog();
    if(!ctx||!dialog)return;
    const val=key=>num(dialog.querySelector(`[data-oc-input="${key}"]`)?.value);
    const core=calculateOutputCorrection({actualBW:ctx.actualBW,targetBW:ctx.targetBW,primaryRPM:val('primary'),secondaryRPM:val('secondary'),w1:val('w1'),w2:val('w2'),minutes:val('minutes')});
    if(!core.ready){
      if(typeof showToast==='function')showToast(tx('Complete all five fields with values greater than zero.','Completa los cinco campos con valores mayores que cero.','Complétez les cinq champs.'));
      return;
    }
    const rec=processRecommendation(core,ctx);
    const reduction=Math.abs(core.outputChangePercent);
    const method=rec.method==='learned-search'?tx('Process Learning search','Búsqueda de Process Learning','Recherche Process Learning'):tx('Proportional starting point','Starting point proporcional','Point de départ proportionnel');
    const heat=finitePositive(rec.secondaryHeat)?`<div><small>${tx('Secondary Heat start','Secondary Heat inicial','Secondary Heat initial')}</small><strong>${fixed(rec.secondaryHeat,0)}</strong></div>`:'';
    const result=dialog.querySelector('[data-oc="result"]');
    result.hidden=false;
    result.innerHTML=`
      <strong>${tx('OUTPUT CORRECTION','CORRECCIÓN DE OUTPUT','CORRECTION DU DÉBIT')}</strong>
      <div class="oc-result-grid">
        <div><small>${tx('Current output','Output actual','Débit actuel')}</small><strong>${fixed(core.currentOutput,0)} lb/hr</strong></div>
        <div><small>${tx('Target output','Output objetivo','Débit cible')}</small><strong>${fixed(core.targetOutput,0)} lb/hr</strong></div>
        <div><small>${tx('Output change needed','Cambio de output necesario','Changement de débit')}</small><strong>−${fixed(reduction,1)}%</strong></div>
        <div><small>${tx('Method','Método','Méthode')}</small><strong>${method}</strong></div>
      </div>
      <div class="oc-setpoints">
        <div><small>S-Wrap</small><strong>${MAX_SWRAP.toFixed(0)} ft/min</strong></div>
        <div><small>Primary</small><strong>${fixed(rec.primaryRPM,1)} RPM</strong></div>
        <div><small>Secondary</small><strong>${fixed(rec.secondaryRPM,1)} RPM</strong></div>
        ${heat}
      </div>
      <p class="oc-note">${tx('Starting point only. Do not increase S-Wrap above 228. Verify Primary Pressure, melt, motor load and the next completed-roll BW after the coordinated output change.','Solo es un starting point. No subas S-Wrap de 228. Verifica Primary Pressure, melt, motor load y el BW del próximo rollo después del cambio coordinado de output.','Point de départ seulement. Vérifiez pression, melt, charge moteur et le BW du prochain rouleau.')}</p>`;
    try{
      if(typeof recordQualityEvent==='function')recordQualityEvent('output_correction_recommended',{
        actualBW:ctx.actualBW,targetBW:ctx.targetBW,currentSWrap:MAX_SWRAP,currentOutputLbHr:Number(core.currentOutput.toFixed(1)),targetOutputLbHr:Number(core.targetOutput.toFixed(1)),
        beforePrimaryRPM:core.primaryRPM,beforeSecondaryRPM:core.secondaryRPM,suggestedPrimaryRPM:Number(rec.primaryRPM),suggestedSecondaryRPM:Number(rec.secondaryRPM),runMinutes:core.minutes,winder1Weight:core.w1,winder2Weight:core.w2,method:rec.method||'proportional-start'
      });
    }catch(_){}
  }

  function refresh(){
    if(!document.body)return;
    injectStyle();renderLanguage();
    const card=ensureCard(),ctx=activeContext();
    if(!card)return;
    card.classList.toggle('hidden',!ctx);
    if(ctx){
      const signature=[ctx.actualBW,ctx.targetBW,ctx.currentSWrap,(typeof state!=='undefined'?state?.activeShift?.runId:'')||''].join('|');
      if(signature!==lastSignature){lastSignature=signature;renderLanguage();}
    }
  }

  function start(){
    if(!document.body)return;
    refresh();
    const panel=document.getElementById('optimizer-panel');
    if(panel&&root.MutationObserver)new MutationObserver(refresh).observe(panel,{subtree:true,childList:true,characterData:true,attributes:true});
    ['bw-target','bw-current-swrap','bw-weight','bw-length','bw2-weight','bw2-length'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>setTimeout(refresh,0)));
    root.setInterval(refresh,1500);
  }

  root.ViejitoOutputCorrection={calculateOutputCorrection,refresh,openDialog};
  if(typeof module!=='undefined'&&module.exports)module.exports={calculateOutputCorrection};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:globalThis);
