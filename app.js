const FACTOR_GRAMS_PER_LB = 453.59237;
const DEFAULT_MANDREL = 48;
const VALID_MANDRELS = [48, 51];
const state = {
  mandrel: Number(localStorage.getItem('viejitoMandrel')) || DEFAULT_MANDREL,
  context: JSON.parse(localStorage.getItem('viejitoContext') || '{}'),
  history: JSON.parse(localStorage.getItem('viejitoHistory') || '[]')
};

const $ = (id) => document.getElementById(id);
const fmt = (n, d=3) => Number(n).toFixed(d).replace(/\.?0+$/, '');
const numbers = (text) => (text.replace(/,/g,'.').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const positive = (...vals) => vals.every(v => Number.isFinite(v) && v > 0);

function calculateBW(weight, length, mandrel=DEFAULT_MANDREL){
  if(!positive(weight,length,mandrel)) throw new Error('Revisa los números. Todos deben ser mayores de cero.');
  return (weight * FACTOR_GRAMS_PER_LB) / ((length * 12 * mandrel) / 100);
}
function calculateFT(bw, weight, mandrel=DEFAULT_MANDREL){
  if(!positive(bw,weight,mandrel)) throw new Error('Revisa los números. Todos deben ser mayores de cero.');
  return (weight * FACTOR_GRAMS_PER_LB * 100) / (bw * 12 * mandrel);
}
function calculateSWrap(currentWeight,currentSpeed,targetWeight){
  if(!positive(currentWeight,currentSpeed,targetWeight)) throw new Error('Revisa los números. Todos deben ser mayores de cero.');
  return currentWeight * currentSpeed / targetWeight;
}

function explicitIntent(text){
  const t=text.toLowerCase();
  if(/\b(s[- ]?wrap|swrap|speed|velocidad)\b/.test(t)) return 'swrap';
  if(/\b(ft|feet|foot|pies?|longitud)\b/.test(t)) return 'ft';
  if(/\b(bw|basis\s*weight|peso\s*base|gramaje)\b/.test(t)) return 'bw';
  return null;
}
function requestedMandrel(text){
  const t=text.toLowerCase();
  if(/(?:mandrel|mandril|core)?\s*51\s*(?:"|in|inch|pulgadas?)?\b/.test(t)) return 51;
  if(/(?:mandrel|mandril|core)?\s*48\s*(?:"|in|inch|pulgadas?)?\b/.test(t)) return 48;
  return null;
}
function stripMandrelValue(vals,text){
  const mandrel=requestedMandrel(text);
  if(!mandrel) return vals;
  const copy=[...vals];
  const idx=copy.lastIndexOf(mandrel);
  if(idx>=0) copy.splice(idx,1);
  return copy;
}

function interpret(text){
  const explicit=explicitIntent(text);
  const mandrel=requestedMandrel(text) || state.context.mandrel || state.mandrel || DEFAULT_MANDREL;
  let vals=stripMandrelValue(numbers(text),text);
  const lower=text.toLowerCase().trim();

  if(/^\s*(51|48)\s*(?:"|in|inch|pulgadas?)?\s*$/.test(lower) && state.context.lastCalculation){
    return recalculateWithMandrel(Number(vals[0] || numbers(text)[0]));
  }

  let intent=explicit;
  if(!intent){
    if(vals.length>=3) intent='swrap';
    else if(vals.length===2) intent='bw';
    else if(vals.length===1){
      const n=vals[0];
      if(n<15) intent='bw';
      else if(n<=230) intent='swrap';
      else intent='ft';
    }
  }

  if(!intent) return {kind:'help',message:'Escribe números como “520 6578”, “180” o “FT 10 520”.'};

  try{
    if(intent==='bw'){
      if(vals.length>=2){
        const [weight,length]=vals;
        const result=calculateBW(weight,length,mandrel);
        state.context={intent:'bw',weight,length,mandrel,lastCalculation:true}; saveContext();
        addHistory('BW',`${fmt(result)} • ${weight} lb / ${length} ft • ${mandrel}”`);
        return {kind:'result',title:'Basis Weight',value:fmt(result),meta:`Mandrel ${mandrel}”${mandrel===48?' (predeterminado)':''}`};
      }
      const n=vals[0];
      state.context={...state.context,intent:'bw',pendingValue:n,mandrel}; saveContext();
      return {kind:'info',title:'Basis Weight',message:`Interpreté ${fmt(n)} como Basis Weight. Para calcular FT escribe “FT ${fmt(n)} peso”, o para calcular BW escribe peso y longitud, por ejemplo “520 6578”.`};
    }
    if(intent==='ft'){
      if(vals.length>=2){
        const [bw,weight]=vals;
        const result=calculateFT(bw,weight,mandrel);
        state.context={intent:'ft',bw,weight,mandrel,lastCalculation:true}; saveContext();
        addHistory('FT',`${fmt(result,0)} ft • BW ${bw} / ${weight} lb • ${mandrel}”`);
        return {kind:'result',title:'Feet',value:`${fmt(result,0)} ft`,meta:`Mandrel ${mandrel}”${mandrel===48?' (predeterminado)':''}`};
      }
      const n=vals[0];
      state.context={...state.context,intent:'ft',length:n,mandrel}; saveContext();
      return {kind:'info',title:'Feet',message:`Interpreté ${fmt(n,0)} como longitud en FT. Para calcular la longitud escribe “FT basis-weight peso”, por ejemplo “FT 10 520”.`};
    }
    if(intent==='swrap'){
      if(vals.length>=3){
        const [currentWeight,currentSpeed,targetWeight]=vals;
        const result=calculateSWrap(currentWeight,currentSpeed,targetWeight);
        state.context={intent:'swrap',currentWeight,currentSpeed,targetWeight,lastCalculation:true}; saveContext();
        addHistory('S-Wrap',`${fmt(result,1)} speed • ${currentWeight} × ${currentSpeed} ÷ ${targetWeight}`);
        return {kind:'result',title:'S-Wrap Speed',value:fmt(result,1),meta:'Nueva velocidad recomendada'};
      }
      const n=vals[0];
      state.context={...state.context,intent:'swrap',currentSpeed:n}; saveContext();
      return {kind:'info',title:'S-Wrap Speed',message:`Interpreté ${fmt(n,1)} como velocidad de S-Wrap. Para recalcularla escribe: peso actual, velocidad actual y peso objetivo.`};
    }
  }catch(error){return {kind:'error',message:error.message};}
}

function recalculateWithMandrel(mandrel){
  if(!VALID_MANDRELS.includes(mandrel)) return {kind:'error',message:'Solo usamos mandrel de 48” o 51”.'};
  state.mandrel=mandrel; localStorage.setItem('viejitoMandrel',String(mandrel));
  const c=state.context;
  try{
    if(c.intent==='bw'&&positive(c.weight,c.length)){
      const result=calculateBW(c.weight,c.length,mandrel); state.context={...c,mandrel}; saveContext();
      addHistory('BW',`${fmt(result)} • ${c.weight} lb / ${c.length} ft • ${mandrel}”`);
      return {kind:'result',title:'Basis Weight',value:fmt(result),meta:`Recalculado con mandrel ${mandrel}”`};
    }
    if(c.intent==='ft'&&positive(c.bw,c.weight)){
      const result=calculateFT(c.bw,c.weight,mandrel); state.context={...c,mandrel}; saveContext();
      addHistory('FT',`${fmt(result,0)} ft • BW ${c.bw} / ${c.weight} lb • ${mandrel}”`);
      return {kind:'result',title:'Feet',value:`${fmt(result,0)} ft`,meta:`Recalculado con mandrel ${mandrel}”`};
    }
  }catch(e){return {kind:'error',message:e.message};}
  return {kind:'info',title:'Mandrel',message:`Mandrel predeterminado cambiado a ${mandrel}”.`};
}

function saveContext(){localStorage.setItem('viejitoContext',JSON.stringify(state.context));}
function addHistory(type,detail){
  state.history.unshift({type,detail,time:new Date().toISOString()});
  state.history=state.history.slice(0,20);
  localStorage.setItem('viejitoHistory',JSON.stringify(state.history));
  renderHistory();
}
function renderHistory(){
  const box=$('history-list');
  if(!state.history.length){box.innerHTML='<div class="empty">Todavía no hay cálculos guardados.</div>';return;}
  box.innerHTML=state.history.slice(0,8).map(item=>`<div class="history-item"><div><strong>${escapeHTML(item.type)}</strong><small>${escapeHTML(item.detail)}</small></div><time>${new Date(item.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time></div>`).join('');
}
function escapeHTML(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function bubble(role,content){
  const div=document.createElement('div'); div.className=`bubble ${role}`;
  if(typeof content==='string') div.textContent=content;
  else div.innerHTML=`${content.title?`<span class="title">${escapeHTML(content.title)}</span>`:''}${content.value?`<strong style="font-size:1.55rem">${escapeHTML(content.value)}</strong>`:''}${content.message?escapeHTML(content.message):''}${content.meta?`<small style="display:block;margin-top:5px;opacity:.72">${escapeHTML(content.meta)}</small>`:''}`;
  $('chat-log').appendChild(div); $('chat-log').scrollTop=$('chat-log').scrollHeight;
}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}
function switchView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.quick-card').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  $(`view-${view}`).classList.add('active');
}
function selectMandrel(target,value){
  document.querySelectorAll(`.mandrel[data-target="${target}"]`).forEach(b=>b.classList.toggle('active',Number(b.dataset.value)===value));
}
function currentMandrel(target){return Number(document.querySelector(`.mandrel[data-target="${target}"].active`).dataset.value);}
function updateConnection(){const p=$('connection-pill');const online=navigator.onLine;p.textContent=online?'En línea':'Sin señal';p.className=`pill ${online?'online':'offline'}`;}

$('chat-form').addEventListener('submit',e=>{e.preventDefault();const input=$('chat-input');const text=input.value.trim();if(!text)return;bubble('user',text);input.value='';setTimeout(()=>bubble('bot',interpret(text)),120);});
document.querySelectorAll('.example').forEach(b=>b.addEventListener('click',()=>{$('chat-input').value=b.dataset.example;$('chat-form').requestSubmit();}));
document.querySelectorAll('.quick-card').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('.mandrel').forEach(b=>b.addEventListener('click',()=>{selectMandrel(b.dataset.target,Number(b.dataset.value));}));
$('bw-calc').addEventListener('click',()=>{try{const w=Number($('bw-weight').value),l=Number($('bw-length').value),m=currentMandrel('bw'),r=calculateBW(w,l,m);$('bw-result').textContent=fmt(r);$('bw-meta').textContent=`Mandrel ${m}”${m===48?' predeterminado':''}`;addHistory('BW',`${fmt(r)} • ${w} lb / ${l} ft • ${m}”`);}catch(e){showToast(e.message);}});
$('ft-calc').addEventListener('click',()=>{try{const bw=Number($('ft-bw').value),w=Number($('ft-weight').value),m=currentMandrel('ft'),r=calculateFT(bw,w,m);$('ft-result').textContent=`${fmt(r,0)} ft`;$('ft-meta').textContent=`Mandrel ${m}”${m===48?' predeterminado':''}`;addHistory('FT',`${fmt(r,0)} ft • BW ${bw} / ${w} lb • ${m}”`);}catch(e){showToast(e.message);}});
$('sw-calc').addEventListener('click',()=>{try{const a=Number($('sw-current').value),s=Number($('sw-speed').value),t=Number($('sw-target').value),r=calculateSWrap(a,s,t);$('sw-result').textContent=fmt(r,1);addHistory('S-Wrap',`${fmt(r,1)} speed • ${a} × ${s} ÷ ${t}`);}catch(e){showToast(e.message);}});
$('clear-history').addEventListener('click',()=>{state.history=[];localStorage.removeItem('viejitoHistory');renderHistory();showToast('Historial borrado');});
$('theme-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('viejitoTheme',document.documentElement.classList.contains('light')?'light':'dark');});
window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);

if(localStorage.getItem('viejitoTheme')==='light')document.documentElement.classList.add('light');
selectMandrel('bw',state.mandrel);selectMandrel('ft',state.mandrel);renderHistory();updateConnection();
bubble('bot',{title:'Viejito 4.0',message:'Listo. Sin comandos: dos números calculan BW con mandrel 48”; de 15 a 230 interpreto S-Wrap Speed; más de 230 interpreto FT. Puedes forzar BW, FT o S-Wrap escribiéndolo.'});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
