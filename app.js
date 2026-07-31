const FACTOR_GRAMS_PER_LB = 453.59237;
const DEFAULT_MANDREL = 48;
const VALID_MANDRELS = [48, 51];
const DEFAULT_LANGUAGE = 'en';
const VALID_LANGUAGES = ['en', 'es', 'fr'];
const DEFAULT_PERSONALITY = 'heavy';
const VALID_PERSONALITIES = ['professional', 'light', 'heavy', 'off'];

const translations = {
  en: {
    personality: 'Personality', chatPersonality: 'Chat personality', professional: 'Professional',
    lightSarcasm: 'Light sarcasm', heavySarcasm: 'Heavy sarcasm', off: 'Off',
    personalityChanged: 'Personality changed to {mode}.',
    language: 'Language', preferredLanguage: 'Preferred language', online: 'Online', offline: 'No signal',
    changeTheme: 'Change theme', plantMode: 'PLANT MODE', heroTitle: 'What do you need to calculate?',
    heroDescription: 'Works without a signal for BW, FT and S-Wrap.', quickTools: 'Quick tools',
    chat: 'Chat', chatSubtitle: 'Type naturally', bwSubtitle: '48” or 51” mandrel',
    ftSubtitle: 'Calculate length', swrapSubtitle: 'Adjust speed', calculator: 'CALCULATOR',
    weightLb: 'Weight (lb)', lengthFt: 'Length (ft)', mandrel: 'Mandrel', length: 'Length',
    currentWeight: 'Current weight', currentSpeed: 'Current speed', targetWeight: 'Target weight',
    newSpeed: 'New speed', swFormula: 'Current weight × speed ÷ target weight',
    local: 'LOCAL', recentHistory: 'Recent history', clear: 'Clear', send: 'Send',
    chatPlaceholder: 'Example: 520 6578, 180, FT 10 520...', chatAria: 'Message for Viejito',
    calculateBW: 'Calculate BW', calculateFT: 'Calculate FT', calculateSWrap: 'Calculate S-Wrap',
    defaultMandrel: '{m}” mandrel (default)', mandrelOnly: '{m}” mandrel',
    noHistory: 'No calculations saved yet.', historyCleared: 'History cleared',
    invalidNumbers: 'Check the numbers. All values must be greater than zero.',
    help: 'Enter numbers such as “520 6578”, “180” or “FT 10 520”.',
    bwSingle: 'I interpreted {n} as Basis Weight. To calculate length, type “FT basis-weight weight”, for example “FT 10 520”. To calculate BW, enter weight and length, for example “520 6578”.',
    ftSingle: 'I interpreted {n} as a length in FT. To calculate length, type “FT basis-weight weight”, for example “FT 10 520”.',
    swSingle: 'I interpreted {n} as S-Wrap speed. To recalculate it, enter current weight, current speed and target weight.',
    newRecommendedSpeed: 'Recommended new speed', onlyMandrels: 'Only 48” and 51” mandrels are supported.',
    recalculatedMandrel: 'Recalculated with {m}” mandrel', defaultChanged: 'Default mandrel changed to {m}”.',
    introTitle: 'Viejito 4.0',
    intro: 'Ready. Without commands: two numbers calculate BW using the 48” mandrel; 15 through 230 is interpreted as S-Wrap Speed; more than 230 is interpreted as FT. You can force BW, FT or S-Wrap by typing it.',
    footer: 'Viejito 4.0 • First functional PWA'
  },
  es: {
    personality: 'Personalidad', chatPersonality: 'Personalidad del chat', professional: 'Profesional',
    lightSarcasm: 'Sarcasmo ligero', heavySarcasm: 'Sarcasmo pesado', off: 'Apagado',
    personalityChanged: 'Personalidad cambiada a {mode}.',
    language: 'Idioma', preferredLanguage: 'Idioma preferido', online: 'En línea', offline: 'Sin señal',
    changeTheme: 'Cambiar tema', plantMode: 'MODO PLANTA', heroTitle: '¿Qué necesitas calcular?',
    heroDescription: 'Funciona sin señal para BW, FT y S-Wrap.', quickTools: 'Herramientas rápidas',
    chat: 'Chat', chatSubtitle: 'Escribe como hablas', bwSubtitle: 'Mandrel 48” o 51”',
    ftSubtitle: 'Calcula longitud', swrapSubtitle: 'Ajusta velocidad', calculator: 'CALCULADORA',
    weightLb: 'Peso (lb)', lengthFt: 'Longitud (ft)', mandrel: 'Mandrel', length: 'Longitud',
    currentWeight: 'Peso actual', currentSpeed: 'Velocidad actual', targetWeight: 'Peso objetivo',
    newSpeed: 'Nueva velocidad', swFormula: 'Peso actual × velocidad ÷ peso objetivo',
    local: 'LOCAL', recentHistory: 'Historial reciente', clear: 'Borrar', send: 'Enviar',
    chatPlaceholder: 'Ej.: 520 6578, 180, FT 10 520...', chatAria: 'Mensaje para Viejito',
    calculateBW: 'Calcular BW', calculateFT: 'Calcular FT', calculateSWrap: 'Calcular S-Wrap',
    defaultMandrel: 'Mandrel {m}” (predeterminado)', mandrelOnly: 'Mandrel {m}”',
    noHistory: 'Todavía no hay cálculos guardados.', historyCleared: 'Historial borrado',
    invalidNumbers: 'Revisa los números. Todos deben ser mayores de cero.',
    help: 'Escribe números como “520 6578”, “180” o “FT 10 520”.',
    bwSingle: 'Interpreté {n} como Basis Weight. Para calcular FT escribe “FT basis-weight peso”, por ejemplo “FT 10 520”. Para calcular BW escribe peso y longitud, por ejemplo “520 6578”.',
    ftSingle: 'Interpreté {n} como longitud en FT. Para calcular la longitud escribe “FT basis-weight peso”, por ejemplo “FT 10 520”.',
    swSingle: 'Interpreté {n} como velocidad de S-Wrap. Para recalcularla escribe: peso actual, velocidad actual y peso objetivo.',
    newRecommendedSpeed: 'Nueva velocidad recomendada', onlyMandrels: 'Solo usamos mandrel de 48” o 51”.',
    recalculatedMandrel: 'Recalculado con mandrel {m}”', defaultChanged: 'Mandrel predeterminado cambiado a {m}”.',
    introTitle: 'Viejito 4.0',
    intro: 'Listo. Sin comandos: dos números calculan BW con mandrel 48”; de 15 a 230 interpreto S-Wrap Speed; más de 230 interpreto FT. Puedes forzar BW, FT o S-Wrap escribiéndolo.',
    footer: 'Viejito 4.0 • Primera PWA funcional'
  },
  fr: {
    personality: 'Personnalité', chatPersonality: 'Personnalité du chat', professional: 'Professionnel',
    lightSarcasm: 'Sarcasme léger', heavySarcasm: 'Sarcasme appuyé', off: 'Désactivé',
    personalityChanged: 'Personnalité changée : {mode}.',
    language: 'Langue', preferredLanguage: 'Langue préférée', online: 'En ligne', offline: 'Pas de réseau',
    changeTheme: 'Changer le thème', plantMode: 'MODE USINE', heroTitle: 'Que devez-vous calculer ?',
    heroDescription: 'Fonctionne sans réseau pour BW, FT et S-Wrap.', quickTools: 'Outils rapides',
    chat: 'Discussion', chatSubtitle: 'Écrivez naturellement', bwSubtitle: 'Mandrin 48” ou 51”',
    ftSubtitle: 'Calculer la longueur', swrapSubtitle: 'Régler la vitesse', calculator: 'CALCULATRICE',
    weightLb: 'Poids (lb)', lengthFt: 'Longueur (ft)', mandrel: 'Mandrin', length: 'Longueur',
    currentWeight: 'Poids actuel', currentSpeed: 'Vitesse actuelle', targetWeight: 'Poids cible',
    newSpeed: 'Nouvelle vitesse', swFormula: 'Poids actuel × vitesse ÷ poids cible',
    local: 'LOCAL', recentHistory: 'Historique récent', clear: 'Effacer', send: 'Envoyer',
    chatPlaceholder: 'Ex. : 520 6578, 180, FT 10 520...', chatAria: 'Message pour Viejito',
    calculateBW: 'Calculer BW', calculateFT: 'Calculer FT', calculateSWrap: 'Calculer S-Wrap',
    defaultMandrel: 'Mandrin {m}” (par défaut)', mandrelOnly: 'Mandrin {m}”',
    noHistory: 'Aucun calcul enregistré pour le moment.', historyCleared: 'Historique effacé',
    invalidNumbers: 'Vérifiez les nombres. Toutes les valeurs doivent être supérieures à zéro.',
    help: 'Entrez des nombres comme « 520 6578 », « 180 » ou « FT 10 520 ».',
    bwSingle: 'J’ai interprété {n} comme Basis Weight. Pour calculer la longueur, tapez « FT basis-weight poids », par exemple « FT 10 520 ». Pour calculer BW, entrez le poids et la longueur, par exemple « 520 6578 ».',
    ftSingle: 'J’ai interprété {n} comme une longueur en FT. Pour calculer la longueur, tapez « FT basis-weight poids », par exemple « FT 10 520 ».',
    swSingle: 'J’ai interprété {n} comme la vitesse S-Wrap. Pour la recalculer, entrez le poids actuel, la vitesse actuelle et le poids cible.',
    newRecommendedSpeed: 'Nouvelle vitesse recommandée', onlyMandrels: 'Seuls les mandrins de 48” et 51” sont pris en charge.',
    recalculatedMandrel: 'Recalculé avec le mandrin {m}”', defaultChanged: 'Mandrin par défaut changé à {m}”.',
    introTitle: 'Viejito 4.0',
    intro: 'Prêt. Sans commande : deux nombres calculent BW avec le mandrin de 48”; de 15 à 230 est interprété comme la vitesse S-Wrap; plus de 230 est interprété comme FT. Vous pouvez forcer BW, FT ou S-Wrap en l’écrivant.',
    footer: 'Viejito 4.0 • Première PWA fonctionnelle'
  }
};


const sarcasmLines = {
  en: {
    light: [
      'Not bad. You entered the numbers in the right order this time. 😏',
      'There you go. The calculator survived another shift.',
      'Clean result. Almost suspiciously clean.',
      'Done. Try not to make it look too easy.',
      'That was painless. We should celebrate responsibly.'
    ],
    heavy: [
      'Amazing. Two numbers, one result, and nothing caught fire. 😂',
      'Look at you calculating like management might be watching.',
      'Correct result. I am as surprised as you are.',
      'Another calculation completed without calling maintenance. Impressive.',
      'There it is. Even the machine looks proud of you.',
      'You typed it right on the first try. Mark the calendar.',
      'Done. Now act like you knew the answer all along.'
    ]
  },
  es: {
    light: [
      'No está mal. Esta vez sí pusiste los números en el orden correcto. 😏',
      'Listo. La calculadora sobrevivió otro turno.',
      'Resultado limpio. Hasta parece sospechoso.',
      'Terminado. No hagas que parezca demasiado fácil.',
      'Eso no dolió. Casi merece celebración.'
    ],
    heavy: [
      '¡Milagro! Dos números, un resultado y nada se incendió. 😂',
      'Mírate calculando como si el supervisor estuviera mirando.',
      'Resultado correcto. Estoy tan sorprendido como tú.',
      'Otro cálculo terminado sin llamar a mantenimiento. Impresionante.',
      'Ahí está. Hasta la máquina parece orgullosa de ti.',
      'Lo escribiste bien a la primera. Marca este día en el calendario.',
      'Listo. Ahora finge que ya sabías la respuesta.'
    ]
  },
  fr: {
    light: [
      'Pas mal. Cette fois, les nombres sont dans le bon ordre. 😏',
      'Terminé. La calculatrice a survécu à un autre quart.',
      'Résultat propre. Presque trop propre.',
      'C’est fait. Ne rendez pas ça trop facile.',
      'Sans douleur. Cela mérite presque une célébration.'
    ],
    heavy: [
      'Miracle ! Deux nombres, un résultat et rien n’a pris feu. 😂',
      'Regardez-vous calculer comme si le superviseur observait.',
      'Résultat correct. Je suis aussi surpris que vous.',
      'Encore un calcul sans appeler la maintenance. Impressionnant.',
      'Voilà. Même la machine semble fière de vous.',
      'Correct du premier coup. Notez la date.',
      'Terminé. Faites maintenant comme si vous connaissiez déjà la réponse.'
    ]
  }
};

let lastSarcasmIndex = -1;
function personalityLabel(mode=state.personality){
  const map = {
    professional: t('professional'),
    light: t('lightSarcasm'),
    heavy: t('heavySarcasm'),
    off: t('off')
  };
  return map[mode] || mode;
}
function getSarcasmLine(){
  if(state.personality === 'professional' || state.personality === 'off') return '';
  const languageLines = sarcasmLines[state.language] || sarcasmLines.en;
  const lines = languageLines[state.personality] || [];
  if(!lines.length) return '';
  let index = Math.floor(Math.random() * lines.length);
  if(lines.length > 1 && index === lastSarcasmIndex) index = (index + 1) % lines.length;
  lastSarcasmIndex = index;
  return lines[index];
}

const state = {
  language: VALID_LANGUAGES.includes(localStorage.getItem('viejitoLanguage')) ? localStorage.getItem('viejitoLanguage') : DEFAULT_LANGUAGE,
  personality: VALID_PERSONALITIES.includes(localStorage.getItem('viejitoPersonality')) ? localStorage.getItem('viejitoPersonality') : DEFAULT_PERSONALITY,
  mandrel: Number(localStorage.getItem('viejitoMandrel')) || DEFAULT_MANDREL,
  context: JSON.parse(localStorage.getItem('viejitoContext') || '{}'),
  history: JSON.parse(localStorage.getItem('viejitoHistory') || '[]')
};

const $ = (id) => document.getElementById(id);
const fmt = (n, d=3) => Number(n).toFixed(d).replace(/\.?0+$/, '');
const numbers = (text) => (text.replace(/,/g,'.').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const positive = (...vals) => vals.every(v => Number.isFinite(v) && v > 0);
const t = (key, vars={}) => {
  let value = translations[state.language]?.[key] ?? translations.en[key] ?? key;
  Object.entries(vars).forEach(([name, replacement]) => value = value.replaceAll(`{${name}}`, replacement));
  return value;
};

function calculateBW(weight, length, mandrel=DEFAULT_MANDREL){
  if(!positive(weight,length,mandrel)) throw new Error(t('invalidNumbers'));
  return (weight * FACTOR_GRAMS_PER_LB) / ((length * 12 * mandrel) / 100);
}
function calculateFT(bw, weight, mandrel=DEFAULT_MANDREL){
  if(!positive(bw,weight,mandrel)) throw new Error(t('invalidNumbers'));
  return (weight * FACTOR_GRAMS_PER_LB * 100) / (bw * 12 * mandrel);
}
function calculateSWrap(currentWeight,currentSpeed,targetWeight){
  if(!positive(currentWeight,currentSpeed,targetWeight)) throw new Error(t('invalidNumbers'));
  return currentWeight * currentSpeed / targetWeight;
}

function explicitIntent(text){
  const value=text.toLowerCase();
  if(/\b(s[- ]?wrap|swrap|speed|velocity|velocidad|vitesse)\b/.test(value)) return 'swrap';
  if(/\b(ft|feet|foot|pies?|longitud|length|longueur)\b/.test(value)) return 'ft';
  if(/\b(bw|basis\s*weight|peso\s*base|gramaje|poids\s*de\s*base)\b/.test(value)) return 'bw';
  return null;
}
function requestedMandrel(text){
  const value=text.toLowerCase();
  if(/(?:mandrel|mandril|mandrin|core)?\s*51\s*(?:"|in|inch|pulgadas?|pouces?)?\b/.test(value)) return 51;
  if(/(?:mandrel|mandril|mandrin|core)?\s*48\s*(?:"|in|inch|pulgadas?|pouces?)?\b/.test(value)) return 48;
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

  if(/^\s*(51|48)\s*(?:"|in|inch|pulgadas?|pouces?)?\s*$/.test(lower) && state.context.lastCalculation){
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

  if(!intent) return {kind:'help',message:t('help')};

  try{
    if(intent==='bw'){
      if(vals.length>=2){
        const [weight,length]=vals;
        const result=calculateBW(weight,length,mandrel);
        state.context={intent:'bw',weight,length,mandrel,lastCalculation:true}; saveContext();
        addHistory('BW',`${fmt(result)} • ${weight} lb / ${length} ft • ${mandrel}”`);
        return {kind:'result',title:'Basis Weight',value:fmt(result),meta:mandrel===48?t('defaultMandrel',{m:mandrel}):t('mandrelOnly',{m:mandrel}),sarcasm:getSarcasmLine()};
      }
      const n=vals[0];
      state.context={...state.context,intent:'bw',pendingValue:n,mandrel}; saveContext();
      return {kind:'info',title:'Basis Weight',message:t('bwSingle',{n:fmt(n)})};
    }
    if(intent==='ft'){
      if(vals.length>=2){
        const [bw,weight]=vals;
        const result=calculateFT(bw,weight,mandrel);
        state.context={intent:'ft',bw,weight,mandrel,lastCalculation:true}; saveContext();
        addHistory('FT',`${fmt(result,0)} ft • BW ${bw} / ${weight} lb • ${mandrel}”`);
        return {kind:'result',title:'Feet',value:`${fmt(result,0)} ft`,meta:mandrel===48?t('defaultMandrel',{m:mandrel}):t('mandrelOnly',{m:mandrel}),sarcasm:getSarcasmLine()};
      }
      const n=vals[0];
      state.context={...state.context,intent:'ft',length:n,mandrel}; saveContext();
      return {kind:'info',title:'Feet',message:t('ftSingle',{n:fmt(n,0)})};
    }
    if(intent==='swrap'){
      if(vals.length>=3){
        const [currentWeight,currentSpeed,targetWeight]=vals;
        const result=calculateSWrap(currentWeight,currentSpeed,targetWeight);
        state.context={intent:'swrap',currentWeight,currentSpeed,targetWeight,lastCalculation:true}; saveContext();
        addHistory('S-Wrap',`${fmt(result,1)} speed • ${currentWeight} × ${currentSpeed} ÷ ${targetWeight}`);
        return {kind:'result',title:'S-Wrap Speed',value:fmt(result,1),meta:t('newRecommendedSpeed'),sarcasm:getSarcasmLine()};
      }
      const n=vals[0];
      state.context={...state.context,intent:'swrap',currentSpeed:n}; saveContext();
      return {kind:'info',title:'S-Wrap Speed',message:t('swSingle',{n:fmt(n,1)})};
    }
  }catch(error){return {kind:'error',message:error.message};}
}

function recalculateWithMandrel(mandrel){
  if(!VALID_MANDRELS.includes(mandrel)) return {kind:'error',message:t('onlyMandrels')};
  state.mandrel=mandrel; localStorage.setItem('viejitoMandrel',String(mandrel));
  const c=state.context;
  try{
    if(c.intent==='bw'&&positive(c.weight,c.length)){
      const result=calculateBW(c.weight,c.length,mandrel); state.context={...c,mandrel}; saveContext();
      addHistory('BW',`${fmt(result)} • ${c.weight} lb / ${c.length} ft • ${mandrel}”`);
      return {kind:'result',title:'Basis Weight',value:fmt(result),meta:t('recalculatedMandrel',{m:mandrel}),sarcasm:getSarcasmLine()};
    }
    if(c.intent==='ft'&&positive(c.bw,c.weight)){
      const result=calculateFT(c.bw,c.weight,mandrel); state.context={...c,mandrel}; saveContext();
      addHistory('FT',`${fmt(result,0)} ft • BW ${c.bw} / ${c.weight} lb • ${mandrel}”`);
      return {kind:'result',title:'Feet',value:`${fmt(result,0)} ft`,meta:t('recalculatedMandrel',{m:mandrel}),sarcasm:getSarcasmLine()};
    }
  }catch(e){return {kind:'error',message:e.message};}
  return {kind:'info',title:t('mandrel'),message:t('defaultChanged',{m:mandrel})};
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
  if(!state.history.length){box.innerHTML=`<div class="empty">${escapeHTML(t('noHistory'))}</div>`;return;}
  box.innerHTML=state.history.slice(0,8).map(item=>`<div class="history-item"><div><strong>${escapeHTML(item.type)}</strong><small>${escapeHTML(item.detail)}</small></div><time>${new Date(item.time).toLocaleTimeString(state.language, {hour:'2-digit',minute:'2-digit'})}</time></div>`).join('');
}
function escapeHTML(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function bubble(role,content){
  const div=document.createElement('div'); div.className=`bubble ${role}`;
  if(typeof content==='string') div.textContent=content;
  else div.innerHTML=`${content.title?`<span class="title">${escapeHTML(content.title)}</span>`:''}${content.value?`<strong style="font-size:1.55rem">${escapeHTML(content.value)}</strong>`:''}${content.message?escapeHTML(content.message):''}${content.meta?`<small style="display:block;margin-top:5px;opacity:.72">${escapeHTML(content.meta)}</small>`:''}${content.sarcasm?`<div class="sarcasm-line">${escapeHTML(content.sarcasm)}</div>`:''}`;
  $('chat-log').appendChild(div); $('chat-log').scrollTop=$('chat-log').scrollHeight;
}
function showToast(msg){const toast=$('toast');toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
function switchView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.quick-card').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  $(`view-${view}`).classList.add('active');
}
function selectMandrel(target,value){
  document.querySelectorAll(`.mandrel[data-target="${target}"]`).forEach(b=>b.classList.toggle('active',Number(b.dataset.value)===value));
}
function currentMandrel(target){return Number(document.querySelector(`.mandrel[data-target="${target}"].active`).dataset.value);}
function updateConnection(){
  const pill=$('connection-pill');
  const online=navigator.onLine;
  pill.textContent=online?t('online'):t('offline');
  pill.className=`pill ${online?'online':'offline'}`;
}
function updateMetaText(){
  $('bw-meta').textContent=state.mandrel===48?t('defaultMandrel',{m:48}):t('mandrelOnly',{m:state.mandrel});
  $('ft-meta').textContent=state.mandrel===48?t('defaultMandrel',{m:48}):t('mandrelOnly',{m:state.mandrel});
}
function applyLanguage(language, announce=false){
  state.language=VALID_LANGUAGES.includes(language)?language:DEFAULT_LANGUAGE;
  localStorage.setItem('viejitoLanguage',state.language);
  document.documentElement.lang=state.language;
  $('language-select').value=state.language;
  $('personality-select').value=state.personality;
  $('personality-label').textContent=t('personality');
  $('personality-select').setAttribute('aria-label',t('chatPersonality'));
  $('personality-select').options[0].text=t('professional');
  $('personality-select').options[1].text=t('lightSarcasm');
  $('personality-select').options[2].text=t('heavySarcasm');
  $('personality-select').options[3].text=t('off');
  $('language-label').textContent=t('language');
  $('language-select').setAttribute('aria-label',t('preferredLanguage'));
  $('connection-pill').textContent=navigator.onLine?t('online'):t('offline');
  $('theme-toggle').setAttribute('aria-label',t('changeTheme'));
  $('hero-eyebrow').textContent=t('plantMode');
  $('hero-title').textContent=t('heroTitle');
  $('hero-description').textContent=t('heroDescription');
  $('quick-grid').setAttribute('aria-label',t('quickTools'));
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $('chat-input').placeholder=t('chatPlaceholder');
  $('chat-input').setAttribute('aria-label',t('chatAria'));
  $('send-button').textContent=t('send');
  $('bw-calc').textContent=t('calculateBW');
  $('ft-calc').textContent=t('calculateFT');
  $('sw-calc').textContent=t('calculateSWrap');
  $('sw-formula').textContent=t('swFormula');
  $('clear-history').textContent=t('clear');
  $('footer-text').textContent=t('footer');
  updateMetaText();
  updateConnection();
  renderHistory();
  if(announce){
    $('chat-log').innerHTML='';
    bubble('bot',{title:t('introTitle'),message:t('intro')});
  }
}

$('chat-form').addEventListener('submit',event=>{
  event.preventDefault();
  const input=$('chat-input');
  const text=input.value.trim();
  if(!text)return;
  bubble('user',text);
  input.value='';
  setTimeout(()=>{
    const response=interpret(text);
    if(response?.kind==='result' && !response.sarcasm && (state.personality==='light' || state.personality==='heavy')){
      response.sarcasm=getSarcasmLine();
    }
    bubble('bot',response);
  },120);
});
document.querySelectorAll('.example').forEach(button=>button.addEventListener('click',()=>{$('chat-input').value=button.dataset.example;$('chat-form').requestSubmit();}));
document.querySelectorAll('.quick-card').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
document.querySelectorAll('.mandrel').forEach(button=>button.addEventListener('click',()=>selectMandrel(button.dataset.target,Number(button.dataset.value))));
$('language-select').addEventListener('change',event=>applyLanguage(event.target.value,true));
$('personality-select').addEventListener('change',event=>{
  state.personality=VALID_PERSONALITIES.includes(event.target.value)?event.target.value:DEFAULT_PERSONALITY;
  localStorage.setItem('viejitoPersonality',state.personality);
  showToast(t('personalityChanged',{mode:personalityLabel()}));
});
$('bw-calc').addEventListener('click',()=>{try{const w=Number($('bw-weight').value),l=Number($('bw-length').value),m=currentMandrel('bw'),r=calculateBW(w,l,m);$('bw-result').textContent=fmt(r);$('bw-meta').textContent=m===48?t('defaultMandrel',{m}):t('mandrelOnly',{m});addHistory('BW',`${fmt(r)} • ${w} lb / ${l} ft • ${m}”`);}catch(e){showToast(e.message);}});
$('ft-calc').addEventListener('click',()=>{try{const bw=Number($('ft-bw').value),w=Number($('ft-weight').value),m=currentMandrel('ft'),r=calculateFT(bw,w,m);$('ft-result').textContent=`${fmt(r,0)} ft`;$('ft-meta').textContent=m===48?t('defaultMandrel',{m}):t('mandrelOnly',{m});addHistory('FT',`${fmt(r,0)} ft • BW ${bw} / ${w} lb • ${m}”`);}catch(e){showToast(e.message);}});
$('sw-calc').addEventListener('click',()=>{try{const a=Number($('sw-current').value),s=Number($('sw-speed').value),target=Number($('sw-target').value),r=calculateSWrap(a,s,target);$('sw-result').textContent=fmt(r,1);addHistory('S-Wrap',`${fmt(r,1)} speed • ${a} × ${s} ÷ ${target}`);}catch(e){showToast(e.message);}});
$('clear-history').addEventListener('click',()=>{state.history=[];localStorage.removeItem('viejitoHistory');renderHistory();showToast(t('historyCleared'));});
$('theme-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('viejitoTheme',document.documentElement.classList.contains('light')?'light':'dark');});
window.addEventListener('online',updateConnection);
window.addEventListener('offline',updateConnection);

if(localStorage.getItem('viejitoTheme')==='light')document.documentElement.classList.add('light');
selectMandrel('bw',state.mandrel);
selectMandrel('ft',state.mandrel);
applyLanguage(state.language);
bubble('bot',{title:t('introTitle'),message:t('intro')});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js?v=1.3.1',{updateViaCache:'none'});
      await registration.update();
    }catch(error){
      console.error(error);
    }
  });
}
