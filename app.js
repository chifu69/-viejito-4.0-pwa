const BW_FACTOR_KEY='viejitoBWFactorV1';
let FACTOR_GRAMS_PER_LB=Number(localStorage.getItem(BW_FACTOR_KEY))||450;
const DEFAULT_MANDREL = 48;
const VALID_MANDRELS = [48, 51];
const DEFAULT_LANGUAGE = 'en';
const VALID_LANGUAGES = ['en', 'es', 'fr'];
const DEFAULT_PERSONALITY = 'heavy';
const VALID_PERSONALITIES = ['professional', 'light', 'heavy', 'off'];
const DEFAULT_TARGET_BW = 6.35;
const DEFAULT_CURRENT_SWRAP = 170;
const MAX_SWRAP_SPEED = Number(window.VIEJITO_MAX_SWRAP)||228;
const PROCESS_PERFORMANCE_KEY='viejitoProcessPerformanceV1';
const DEMO_MODE_KEY='viejitoDemoModeV1';
const TREND_HISTORY_KEY = 'viejitoBWTrendHistoryV3';
const DEMO_TREND_HISTORY_KEY = 'viejitoDemoBWTrendHistoryV1';
const DEMO_QUALITY_EVENT_KEY='viejitoDemoQualityEventsV1';
const DEMO_OPEN_RECOMMENDATION_KEY='viejitoDemoOpenRecommendationV1';
const DEMO_PENDING_RECOMMENDATION_KEY='viejitoDemoPendingRecommendationV1';
const DEMO_ACCEPTED_PREVENTIVE_TREND_KEY='viejitoDemoAcceptedPreventiveTrendV1';
const SHIFT_KEY = 'viejitoActiveShiftV1';
const SHIFT_ARCHIVE_KEY = 'viejitoShiftArchiveV1';
const TREND_SAMPLE_SIZE = 5;
const LAST_COMPLETED_CUT_KEY = 'viejitoLastCompletedCutV1';
const MAX_AUTO_CONTEXT_AGE_MS = 12 * 60 * 60 * 1000;
const ACTIVE_LINE_KEY = 'viejitoSelectedLineV1';
let ACTIVE_LINE = [1,2,3,4].includes(Number(localStorage.getItem(ACTIVE_LINE_KEY))) ? Number(localStorage.getItem(ACTIVE_LINE_KEY)) : 1;
const OPERATOR_KEY = 'viejitoOperatorV1';
const OPERATOR_BAD_WORDS = new Set([
  // English — exact normalized tokens only to avoid substring false positives.
  'fuck','fucker','fucking','shit','bullshit','bitch','asshole','motherfucker','dickhead','cunt','whore','slut','bastard','pussy','cock','nigger','nigga','faggot',
  // Spanish — exact normalized tokens only.
  'puta','puto','putas','putos','pendejo','pendeja','pendejos','pendejas','cabron','cabrona','cabrones','chingada','chingado','chingar','verga','mierda','culero','culera','pinche','joto','maricon','maricona','coño','cono'
]);
function normalizeOperatorToken(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t').replace(/[^a-zñ]+/g,' ').trim();
}
function validateOperatorName(value){
  const name=String(value||'').trim().replace(/\s+/g,' ');
  if(name.length<2||name.length>50)return {ok:false,name};
  if(!/^[\p{L}\p{M}][\p{L}\p{M}.'’ -]{1,49}$/u.test(name))return {ok:false,name};
  const normalized=normalizeOperatorToken(name);
  const tokens=normalized.split(/\s+/).filter(Boolean);
  if(tokens.some(token=>OPERATOR_BAD_WORDS.has(token)))return {ok:false,name};
  const compact=normalized.replace(/\s+/g,'');
  const blockedPhrases=['fuckyou','fuckoff','chinga tu madre'.replace(/\s+/g,''),'hijo de puta'.replace(/\s+/g,''),'hija de puta'.replace(/\s+/g,'')];
  if(blockedPhrases.some(phrase=>compact===phrase))return {ok:false,name};
  return {ok:true,name};
}
const lineKey = base => `${base}::line${ACTIVE_LINE}`;
const lineGet = (base, fallback=null) => localStorage.getItem(lineKey(base)) ?? fallback;
const lineSet = (base, value) => localStorage.setItem(lineKey(base), value);
const lineRemove = base => localStorage.removeItem(lineKey(base));
let inChatQuery = false;
const CHAT_MEMORY_MODE_KEY='viejitoChatMemoryModeV1';
const CHAT_HISTORY_KEY='viejitoChatHistoryV1';
const QUALITY_EVENT_KEY='viejitoQualityEventsV1';
const OPEN_RECOMMENDATION_KEY='viejitoOpenRecommendationV1';
const LEAD_PROMPT_EVENT='lead_confirmation';
const BW_LEAD_PROMPT_EVENT='bw_lead_confirmation';
function demoMode(){return localStorage.getItem(DEMO_MODE_KEY)==='on';}
function activeTrendHistoryKey(){return demoMode()?DEMO_TREND_HISTORY_KEY:TREND_HISTORY_KEY;}
function activeQualityEventKey(){return demoMode()?DEMO_QUALITY_EVENT_KEY:QUALITY_EVENT_KEY;}
function activeOpenRecommendationKey(){return demoMode()?DEMO_OPEN_RECOMMENDATION_KEY:OPEN_RECOMMENDATION_KEY;}
function activePendingRecommendationKey(){return demoMode()?DEMO_PENDING_RECOMMENDATION_KEY:PENDING_RECOMMENDATION_KEY;}
function activeAcceptedPreventiveTrendKey(){return demoMode()?DEMO_ACCEPTED_PREVENTIVE_TREND_KEY:ACCEPTED_PREVENTIVE_TREND_KEY;}

function scheduledShiftInfo(value=new Date()){
  try{return window.ViejitoShiftSchedule?.shiftAt?.(value)||null;}catch(_){return null;}
}
function scheduledShiftCode(value=new Date()){return scheduledShiftInfo(value)?.code||null;}
function shiftDisplay(info=scheduledShiftInfo()){
  if(!info)return '—';
  const day=info.type==='day';
  return `${info.code} Shift • ${day?'Day 7:00 AM–7:00 PM':'Night 7:00 PM–7:00 AM'}`;
}
function qualityEventsForLine(line=ACTIVE_LINE){
  const key=`${activeQualityEventKey()}::line${Number(line)}`;
  try{const rows=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(rows)?rows:[];}catch(_){return [];}
}
function saveQualityEventsForLine(line,rows){
  localStorage.setItem(`${activeQualityEventKey()}::line${Number(line)}`,JSON.stringify((rows||[]).slice(-1200)));
}
function recordQualityEvent(type,data={},line=ACTIVE_LINE){
  const now=new Date(),sched=scheduledShiftInfo(now),active=Number(line)===Number(ACTIVE_LINE)?state?.activeShift:null;
  const event={id:`qe-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type:String(type),time:now.toISOString(),line:Number(line),shiftCode:String(active?.shiftCode||sched?.code||''),shiftWorkDate:String(active?.shiftWorkDate||sched?.workDate||''),shiftId:active?.id||data.shiftId||null,runId:active?.runId||data.runId||null,operator:active?.operator||data.operator||'',product:active?.product||data.product||'',...data};
  const rows=qualityEventsForLine(line);rows.push(event);saveQualityEventsForLine(line,rows);return event;
}
function openRecommendationOpportunity(){
  try{return JSON.parse(lineGet(activeOpenRecommendationKey(),'null')||'null');}catch(_){return null;}
}
function saveOpenRecommendationOpportunity(value){const key=activeOpenRecommendationKey();if(value)lineSet(key,JSON.stringify(value));else lineRemove(key);}
function finalizeRecommendationOpportunity(outcome='not_used',reason='next_cut'){
  const open=openRecommendationOpportunity();if(!open)return null;
  const type=outcome==='accepted'?'recommendation_accepted':'recommendation_not_used';
  const event=recordQualityEvent(type,{recommendationId:open.id,recommendationType:open.recommendationType||'corrective',suggestedSWrap:Number(open.suggestedSWrap)||null,beforeSWrap:Number(open.beforeSWrap)||null,targetBW:Number(open.targetBW)||null,beforeBW:Number(open.beforeBW)||null,reason,product:open.product||'',shiftId:open.shiftId||null,runId:open.runId||null});
  saveOpenRecommendationOpportunity(null);return event;
}
function registerRecommendationOpportunity(result,trend=null){
  if(!state.activeShift)return null;
  // Only one actionable recommendation owns the next-cut decision. Corrective has priority.
  let kind=null,suggested=null,beforeBW=null,targetBW=null;
  if(result?.suggestAdjustment&&positive(Number(result.suggestedSWrap))&&!recommendationAlreadyCurrent(result)){
    kind=result.edgePreventive?'preventive_edge':'corrective';suggested=Number(result.suggestedSWrap);beforeBW=Number(result.actualBW);targetBW=Number(result.targetBW);
  }else if(trend?.ready&&trend?.recommendAdjustment&&positive(Number(trend.suggestedSWrap))&&!preventiveTrendAlreadyApplied(trend)){
    kind='preventive';suggested=Number(trend.suggestedSWrap);beforeBW=Number(state.lastCompletedCut?.averageBW);targetBW=Number(trend.targetBW||state.targetBW);
  }
  if(!kind){saveOpenRecommendationOpportunity(null);return null;}
  const existing=openRecommendationOpportunity();
  const signature=`${state.activeShift.id}|${state.activeShift.runId}|${state.lastCompletedCut?.time||Date.now()}|${kind}|${suggested}`;
  if(existing?.signature===signature)return existing;
  const item={id:`rec-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,signature,recommendationType:kind,suggestedSWrap:suggested,beforeSWrap:Number(state.currentSWrap),beforeBW,targetBW,product:state.activeShift.product,shiftId:state.activeShift.id,runId:state.activeShift.runId,time:new Date().toISOString()};
  saveOpenRecommendationOpportunity(item);recordQualityEvent('recommendation_presented',{recommendationId:item.id,recommendationType:kind,suggestedSWrap:suggested,beforeSWrap:item.beforeSWrap,targetBW,beforeBW});return item;
}
function recordSWrapChange(before,after,source='manual',meta={}){
  const a=Number(before),b=Number(after);if(!state.activeShift||!positive(a,b)||Math.abs(a-b)<0.05)return null;
  return recordQualityEvent('swrap_change',{beforeSWrap:a,afterSWrap:b,source,...meta});
}


const translations = {
  en: {
    personality: 'Personality', chatPersonality: 'Chat personality', professional: 'Professional',
    lightSarcasm: 'Light sarcasm', heavySarcasm: 'Heavy sarcasm', off: 'Off',
    personalityChanged: 'Personality changed to {mode}.',
    language: 'Language', preferredLanguage: 'Preferred language', online: 'Online', offline: 'No signal',
    changeTheme: 'Change theme', plantMode: 'PLANT MODE', heroTitle: 'What do you need to calculate?',
    heroDescription: 'Works without a signal for BW, FT and S-Wrap.', quickTools: 'Quick tools',
    chat: 'Chat', chatSubtitle: 'Type naturally', openChat: 'Open chat', closeChat: 'Close chat', assistantOnline: 'Local Brain 🧠 • Ready', bwSubtitle: '48” or 51” mandrel',
    ftSubtitle: 'Calculate length', swrapSubtitle: 'Adjust speed', calculator: 'CALCULATOR',
    weightLb: 'Weight (lb)', lengthFt: 'Length (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Required', winder2Optional: 'Required', averageBW: 'Average Basis Weight', imbalance: 'Winder difference', mandrel: 'Mandrel', length: 'Length',
    currentWeight: 'Current weight', currentSpeed: 'Current speed', targetWeight: 'Target weight',
    newSpeed: 'New speed', swFormula: 'Current weight × speed ÷ target weight',
    local: 'LOCAL', recentHistory: 'Recent history', clear: 'Clear', send: 'Send',
    chatPlaceholder: 'Example: 520 6578 • Primary 110 Secondary 10 • Why is melt high?', chatAria: 'Message for Viejito',
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
    introTitle: 'Industrial IA 5.34.6',
    intro: 'Ready. Without commands: two numbers calculate BW using the 48” mandrel; 15 through 228 is interpreted as S-Wrap Speed; more than 228 is interpreted as FT. You can force BW, FT or S-Wrap by typing it.',
    footer: 'Industrial IA 5.34.6 • Daily Quality Report'
  },
  es: {
    personality: 'Personalidad', chatPersonality: 'Personalidad del chat', professional: 'Profesional',
    lightSarcasm: 'Sarcasmo ligero', heavySarcasm: 'Sarcasmo pesado', off: 'Apagado',
    personalityChanged: 'Personalidad cambiada a {mode}.',
    language: 'Idioma', preferredLanguage: 'Idioma preferido', online: 'En línea', offline: 'Sin señal',
    changeTheme: 'Cambiar tema', plantMode: 'MODO PLANTA', heroTitle: '¿Qué necesitas calcular?',
    heroDescription: 'Funciona sin señal para BW, FT y S-Wrap.', quickTools: 'Herramientas rápidas',
    chat: 'Chat', chatSubtitle: 'Escribe como hablas', openChat: 'Abrir chat', closeChat: 'Cerrar chat', assistantOnline: 'Brain local 🧠 • Listo', bwSubtitle: 'Mandrel 48” o 51”',
    ftSubtitle: 'Calcula longitud', swrapSubtitle: 'Ajusta velocidad', calculator: 'CALCULADORA',
    weightLb: 'Peso (lb)', lengthFt: 'Longitud (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Obligatorio', winder2Optional: 'Obligatorio', averageBW: 'Promedio de Basis Weight', imbalance: 'Diferencia entre winders', mandrel: 'Mandrel', length: 'Longitud',
    currentWeight: 'Peso actual', currentSpeed: 'Velocidad actual', targetWeight: 'Peso objetivo',
    newSpeed: 'Nueva velocidad', swFormula: 'Peso actual × velocidad ÷ peso objetivo',
    local: 'LOCAL', recentHistory: 'Historial reciente', clear: 'Borrar', send: 'Enviar',
    chatPlaceholder: 'Ej.: 520 6578 • Primary 110 Secondary 10 • ¿Por qué sube el melt?', chatAria: 'Mensaje para Viejito',
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
    introTitle: 'Industrial IA 5.34.6',
    intro: 'Listo. Sin comandos: dos números calculan BW con mandrel 48”; de 15 a 228 interpreto S-Wrap Speed; más de 228 interpreto FT. Puedes forzar BW, FT o S-Wrap escribiéndolo.',
    footer: 'Industrial IA 5.34.6 • Reporte diario + Brain local'
  },
  fr: {
    personality: 'Personnalité', chatPersonality: 'Personnalité du chat', professional: 'Professionnel',
    lightSarcasm: 'Sarcasme léger', heavySarcasm: 'Sarcasme appuyé', off: 'Désactivé',
    personalityChanged: 'Personnalité changée : {mode}.',
    language: 'Langue', preferredLanguage: 'Langue préférée', online: 'En ligne', offline: 'Pas de réseau',
    changeTheme: 'Changer le thème', plantMode: 'MODE USINE', heroTitle: 'Que devez-vous calculer ?',
    heroDescription: 'Fonctionne sans réseau pour BW, FT et S-Wrap.', quickTools: 'Outils rapides',
    chat: 'Discussion', chatSubtitle: 'Écrivez naturellement', openChat: 'Ouvrir le chat', closeChat: 'Fermer le chat', assistantOnline: 'Cerveau local 🧠 • Prêt', bwSubtitle: 'Mandrin 48” ou 51”',
    ftSubtitle: 'Calculer la longueur', swrapSubtitle: 'Régler la vitesse', calculator: 'CALCULATRICE',
    weightLb: 'Poids (lb)', lengthFt: 'Longueur (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Obligatoire', winder2Optional: 'Obligatoire', averageBW: 'Moyenne Basis Weight', imbalance: 'Écart entre winders', mandrel: 'Mandrin', length: 'Longueur',
    currentWeight: 'Poids actuel', currentSpeed: 'Vitesse actuelle', targetWeight: 'Poids cible',
    newSpeed: 'Nouvelle vitesse', swFormula: 'Poids actuel × vitesse ÷ poids cible',
    local: 'LOCAL', recentHistory: 'Historique récent', clear: 'Effacer', send: 'Envoyer',
    chatPlaceholder: 'Ex. : 520 6578 • Primary 110 Secondary 10 • Pourquoi le melt monte ?', chatAria: 'Message pour Viejito',
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
    introTitle: 'Industrial IA 5.34.6',
    intro: 'Prêt. Sans commande : deux nombres calculent BW avec le mandrin de 48”; de 15 à 228 est interprété comme la vitesse S-Wrap; plus de 228 est interprété comme FT. Vous pouvez forcer BW, FT ou S-Wrap en l’écrivant.',
    footer: 'Industrial IA 5.34.6 • Rapport quotidien + Cerveau local'
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

const CONTEXT_SARCASM_KEY='viejitoContextSarcasmRecentV1';
const contextualSarcasmBanks={
  en:{
    improved:[
      'Well, look at that… you listened to the old man and it actually got better. 😏',
      'Much better. Apparently my advice was not just decorative. 😂',
      'That BW moved the right way. I will try not to look too proud.',
      'Progress! Somebody has been paying attention.',
      'Better numbers. I knew we would get there eventually.',
      'Nice correction. I might let you run the line after all.',
      'That is closer. See? Math occasionally has its uses.',
      'Good move. The roll agrees with me.',
      'Now that looks healthier. Keep doing suspiciously competent things.',
      'Improvement confirmed. I accept your silent thank-you.',
      'Closer to target. We are starting to look professional.',
      'There we go. Less drama, better BW.',
      'The correction worked. Try to contain your excitement.',
      'That roll behaved much better. Coincidence? I think not.',
      'Moving toward target. Viejito approves.',
      'That is the direction I wanted. Nicely done.',
      'Better. Not perfect, but I am willing to celebrate small victories.',
      'The numbers improved. I will take partial credit.',
      'Good recovery. The line is listening even if you are not.',
      'That adjustment earned you one imaginary gold star.'
    ],
    excellent:[
      'Would you look at that… almost dead on target. Try not to act surprised. 😎',
      'That is beautiful. I may frame this BW.',
      'Near perfect. Somebody call Quality before it changes its mind.',
      'Right on the money. Even I have nothing sarcastic to add… almost.',
      'That roll understood the assignment.',
      'Excellent correction. The math and the machine finally shook hands.',
      'Target acquired. Please enjoy this rare moment of peace.',
      'That is the kind of BW that makes dashboards happy.',
      'Very nice. I am reluctantly impressed.',
      'Clean result. Do not touch anything unless you have a good reason.',
      'That is about as pretty as production math gets.',
      'Excellent. Now pretend this was the plan all along.'
    ],
    worse:[
      'Well… that went the wrong direction. Even Viejito has bad days. 😅',
      'Not my finest prediction. I am taking notes instead of making excuses.',
      'That correction did not behave as expected. Good thing I actually learn.',
      'Hmm. The line disagreed with the math this time.',
      'That got worse. No victory speech from me on this one.',
      'Prediction missed. Updating the mental notebook.',
      'Well, the machine had other plans. Let us use the result and adjust.',
      'That was not the improvement I ordered.',
      'The BW moved the wrong way. I will own that one.',
      'Not ideal. At least the data is useful.',
      'That recommendation needs a rethink. Consider me humbled.',
      'The line just reminded me who is actually in charge.'
    ],
    ignored:[
      'You ignored me and it still improved. Fine… you win this round. 😂',
      'Not the move I suggested, but the BW got better. I saw nothing.',
      'You went your own way and survived. Annoyingly impressive.',
      'Apparently you had a plan. I will allow it.',
      'Different adjustment, better result. I am adding that to the notebook.',
      'You did not follow my suggestion, but the roll improved. Fair enough.',
      'Operator intuition: 1. Viejito ego: 0.',
      'I suggested one thing, you did another, and somehow this worked. Typical.',
      'I cannot argue with a better BW. Well played.',
      'You freelanced that one and got away with it.'
    ],
    typo:[
      'Good catch. I was about to calculate that disaster exactly as requested. 😌',
      'One extra digit almost sent that roll into another zip code.',
      'That number looked suspicious even by night-shift standards.',
      'My calculator was ready. Fortunately, common sense arrived first.',
      'Nice save. Fingers are faster than brains sometimes.',
      'I caught the typo before the math caught fire.',
      'That entry had ambitions far beyond a normal roll.',
      'I appreciate the creativity, but that weight looked a little heroic.'
    ]
  },
  es:{
    improved:['Vaya… al parecer sí escuchaste al viejito y mejoró. 😏','Mucho mejor. Parece que mi sugerencia no era decoración. 😂','Ese BW se movió en la dirección correcta.','Mejor número. Ya empezamos a parecer profesionales.','Ahí vamos. Menos drama y mejor BW.','La corrección funcionó. Trata de no emocionarte demasiado.','Más cerca del target. Viejito aprueba.','Buen ajuste. El rollo está de acuerdo conmigo.','Mejoró. Me voy a dar un poquito del crédito.','Buena recuperación. Así sí.'],
    excellent:['Mira nada más… casi clavado en el target. 😎','Eso está bonito. Casi para enmarcar ese BW.','Excelente. Ahora no le muevas nomás por deporte.','Ese rollo entendió la tarea.','Target conseguido. Disfruta este raro momento de paz.','Muy bien. Estoy impresionado… aunque me cueste admitirlo.'],
    worse:['Bueno… esa no fue mi mejor predicción. 😅','Eso se fue para el lado equivocado. Estoy tomando nota.','La línea no estuvo de acuerdo conmigo esta vez.','Empeoró. No voy a dar discurso de victoria.','Fallé esa predicción. Ajustando lo aprendido.','La máquina tenía otros planes.'],
    ignored:['Me ignoraste y aun así mejoró. Está bien… ganaste esta ronda. 😂','No hiciste lo que sugerí, pero mejoró. No vi nada.','Te fuiste por tu cuenta y funcionó. Molestamente impresionante.','Intuición del operador: 1. Ego de Viejito: 0.','No puedo discutir con un BW mejor. Bien jugado.'],
    typo:['Buena atrapada. Ya iba a calcular ese desastre exactamente como lo escribiste. 😌','Un dígito de más casi manda ese rollo a otro código postal.','Ese número se veía sospechoso hasta para turno de noche.','Menos mal llegó el sentido común antes que la calculadora.','Ese peso tenía demasiadas aspiraciones para ser un rollo normal.']
  }
};
function contextualSarcasm(event,data={}){
  if(state.personality==='professional'||state.personality==='off')return '';
  const lang=contextualSarcasmBanks[state.language]?state.language:'en',bank=contextualSarcasmBanks[lang][event]||contextualSarcasmBanks.en[event]||[];
  if(!bank.length)return '';
  let recent=[];try{recent=JSON.parse(lineGet(CONTEXT_SARCASM_KEY,'[]')||'[]')}catch(_){}
  let choices=bank.filter(x=>!recent.includes(x)); if(!choices.length)choices=bank;
  const line=choices[Math.floor(Math.random()*choices.length)];
  recent.push(line);lineSet(CONTEXT_SARCASM_KEY,JSON.stringify(recent.slice(-20)));return line;
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


const ADMIN_PASSWORD_HASH_KEY='viejitoAdminPasswordHashV1';
const MIGRATION_514_KEY='viejitoMigration514Done';
function hashAdminPassword(value){
  let h=2166136261; for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0).toString(16);
}
function migrateLegacyDataV514(){
  if(localStorage.getItem(MIGRATION_514_KEY)==='1')return;
  const mergeById=(a,b)=>{
    const out=[],seen=new Set();
    [...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])].forEach((r,i)=>{
      const key=String(r?.id ?? `${r?.timestamp||r?.time||''}|${r?.product||''}|${r?.finalBW||r?.averageBW||''}|${r?.extruder||r?.line||''}|${i}`);
      if(!seen.has(key)){seen.add(key);out.push(r);}
    }); return out;
  };
  const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(_){return []}};
  // Learning records from pre-line versions: classify by explicit extruder/line.
  const legacyLearning=parse('viejitoMachineLearningV3');
  if(Array.isArray(legacyLearning)&&legacyLearning.length){
    for(let line=1;line<=4;line++){
      const rows=legacyLearning.filter(r=>Number(r?.extruder||r?.line)===line);
      if(!rows.length)continue;
      const key=`viejitoMachineLearningV3::line${line}`;
      localStorage.setItem(key,JSON.stringify(mergeById(parse(key),rows)));
    }
  }
  // Legacy operational history: only migrate records carrying a reliable line/extruder.
  const legacyHistory=parse('viejitoHistory');
  if(Array.isArray(legacyHistory)&&legacyHistory.length){
    for(let line=1;line<=4;line++){
      const rows=legacyHistory.filter(r=>Number(r?.extruder||r?.line)===line);
      if(!rows.length)continue;
      const key=`viejitoHistory::line${line}`;
      localStorage.setItem(key,JSON.stringify(mergeById(parse(key),rows).slice(-250)));
    }
  }
  // Trend history may also contain extruder metadata.
  const legacyTrend=parse('viejitoBWTrendHistoryV1');
  if(Array.isArray(legacyTrend)&&legacyTrend.length){
    for(let line=1;line<=4;line++){
      const rows=legacyTrend.filter(r=>Number(r?.extruder||r?.line)===line);
      if(!rows.length)continue;
      const key=`viejitoBWTrendHistoryV1::line${line}`;
      localStorage.setItem(key,JSON.stringify(mergeById(parse(key),rows).slice(-250)));
    }
  }
  localStorage.setItem(MIGRATION_514_KEY,'1');
}
migrateLegacyDataV514();

(function migrateLineLanguagesV518(){
  const legacy=VALID_LANGUAGES.includes(localStorage.getItem('viejitoLanguage'))?localStorage.getItem('viejitoLanguage'):DEFAULT_LANGUAGE;
  for(let line=1;line<=4;line++){
    const key=`viejitoLanguage::line${line}`;
    if(!localStorage.getItem(key))localStorage.setItem(key,legacy);
  }
})();

function storedJSON(key,fallback){
  try{
    const raw=lineGet(key,null);
    if(raw===null||raw===undefined||raw==='')return fallback;
    const parsed=JSON.parse(raw);
    return parsed===null&&fallback!==null?fallback:parsed;
  }catch(error){
    console.warn(`Industrial IA: ignored corrupted stored JSON for ${key}`,error);
    return fallback;
  }
}

const state = {
  language: VALID_LANGUAGES.includes(lineGet('viejitoLanguage',DEFAULT_LANGUAGE)) ? lineGet('viejitoLanguage',DEFAULT_LANGUAGE) : DEFAULT_LANGUAGE,
  operator: lineGet(OPERATOR_KEY,'') || '',
  personality: VALID_PERSONALITIES.includes(localStorage.getItem('viejitoPersonality')) ? localStorage.getItem('viejitoPersonality') : DEFAULT_PERSONALITY,
  mandrel: Number(lineGet('viejitoMandrel')) || DEFAULT_MANDREL,
  context: storedJSON('viejitoContext',{}),
  history: storedJSON('viejitoHistory',[]),
  targetBW: Number(lineGet('viejitoTargetBW')) || DEFAULT_TARGET_BW,
  currentSWrap: clampSWrap(Number(lineGet('viejitoCurrentSWrap')) || DEFAULT_CURRENT_SWRAP),
  product: lineGet('viejitoProduct','') || '',
  activeShift: storedJSON(SHIFT_KEY,null),
  shiftArchive: storedJSON(SHIFT_ARCHIVE_KEY,[]),
  productionTargets: storedJSON('viejitoProductionTargetsV1',{}),
  latestOptimization: null,
  bwTrendHistory: storedJSON(activeTrendHistoryKey(),[]),
  latestTrend: null,
  lastCompletedCut: storedJSON(LAST_COMPLETED_CUT_KEY,null),
  selectedLine: ACTIVE_LINE,
  learningEngine: new AdaptiveLearningEngine(window.localStorage, lineKey('viejitoMachineLearningV3')),
  processLearning: new ProcessPerformanceLearning(window.localStorage, lineKey(PROCESS_PERFORMANCE_KEY))
};

const $ = (id) => document.getElementById(id);
const fmt = (n, d=3) => {
  const s = Number(n).toFixed(d);
  return d > 0 ? s.replace(/\.?0+$/, '') : s;
};
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
function calculateWinderPair(weight1,length1,weight2,length2,mandrel=DEFAULT_MANDREL){
  const winder1=calculateBW(weight1,length1,mandrel);
  const hasWinder2=positive(weight2,length2);
  const partialWinder2=(positive(weight2)||positive(length2))&&!hasWinder2;
  if(partialWinder2) throw new Error(t('invalidNumbers'));
  const winder2=hasWinder2?calculateBW(weight2,length2,mandrel):null;
  const average=hasWinder2?(winder1+winder2)/2:winder1;
  return {winder1,winder2,average,hasWinder2,difference:hasWinder2?Math.abs(winder1-winder2):0};
}
function calculateFT(bw, weight, mandrel=DEFAULT_MANDREL){
  if(!positive(bw,weight,mandrel)) throw new Error(t('invalidNumbers'));
  return (weight * FACTOR_GRAMS_PER_LB * 100) / (bw * 12 * mandrel);
}
function rawSWrapCalculation(currentWeight,currentSpeed,targetWeight){
  if(!positive(currentWeight,currentSpeed,targetWeight)) throw new Error(t('invalidNumbers'));
  return currentWeight * currentSpeed / targetWeight;
}
function clampSWrap(value){
  const n=Number(value);return Number.isFinite(n)?Math.min(MAX_SWRAP_SPEED,Math.max(1,n)):n;
}
function calculateSWrap(currentWeight,currentSpeed,targetWeight){
  return clampSWrap(rawSWrapCalculation(currentWeight,currentSpeed,targetWeight));
}
function swrapLimitCopy(){return chatLang(`Maximum S-Wrap limit reached: ${MAX_SWRAP_SPEED} ft/min.`,`Límite máximo de S-Wrap alcanzado: ${MAX_SWRAP_SPEED} ft/min.`,`Limite maximale S-Wrap atteinte : ${MAX_SWRAP_SPEED} ft/min.`);}


const optimizerText = {
  en: {
    targetBW:'Target BW', currentSWrap:'Current S-Wrap', swrapAtCut:'S-Wrap at cut', difference:'Difference', suggestedSWrap:'Suggested S-Wrap',
    tooLight:'Too light', tooHeavy:'Too heavy', greenStatus:'ON TARGET', yellowStatus:'NEAR LIMIT', redStatus:'OUT OF RANGE',
    greenMessage:'Within ±0.17. No adjustment needed.', yellowMessage:'More than ±0.17 and less than ±0.25 from target. Warning — watch the next cut and prepare an S-Wrap correction.',
    redMessage:'Adjust the S-Wrap now.', noChange:'Keep S-Wrap at {speed}. No change recommended.',
    decrease:'Decrease S-Wrap by {amount}, from {current} to {suggested}.', increase:'Increase S-Wrap by {amount}, from {current} to {suggested}.',
    hold:'Keep S-Wrap at {speed}.', smartMeta:'Target {target} • Current S-Wrap {speed}', formulaSuggestion:'Formula suggestion', learnedSuggestion:'Learned suggestion', confidence:'Confidence', rollsLearned:'Rolls learned', recordResult:'Record actual result', learningQuestion:'After making the change, enter the S-Wrap you used and the final BW.', appliedSWrap:'Applied S-Wrap', finalBW:'Final BW', saveLearn:'Save and learn', cancel:'Cancel', learningSaved:'Result saved. Viejito learned from this roll.', machineLearning:'Machine learning', resetLearning:'Reset learning', averageCorrection:'Average correction', successRate:'Success rate', deviceOnly:'Learning is stored only on this device.', resetDone:'Machine learning was reset.', trendPredictor:'Trend Predictor', trendWaiting:'Add {remaining} more BW roll(s) to activate the prediction.', trendStable:'The last 5 rolls are stable. No preventive change is recommended.', trendUp:'BW is increasing by about {slope} per roll. The next roll is projected at {projected}. Increase S-Wrap by {amount} points now, from {current} to {suggested}.', trendDown:'BW is decreasing by about {slope} per roll. The next roll is projected at {projected}. Decrease S-Wrap by {amount} points now, from {current} to {suggested}.', trendProjected:'Projected next BW', trendDirection:'Direction', trendConsistency:'Consistency', trendRolls:'Last rolls', trendClear:'Clear trend', trendCleared:'BW trend history cleared.', trendUpLabel:'Increasing', trendDownLabel:'Decreasing', trendStableLabel:'Stable', trendApply:'Apply S-Wrap {speed}', trendApplied:'Preventive change applied — Current S-Wrap: {speed}. Waiting for the next completed cut.', trendAppliedToast:'Preventive S-Wrap changed from {current} to {suggested}.'
  },
  es: {
    targetBW:'BW objetivo', currentSWrap:'S-Wrap actual', swrapAtCut:'S-Wrap al momento del corte', difference:'Diferencia', suggestedSWrap:'S-Wrap sugerido',
    tooLight:'Muy liviano', tooHeavy:'Muy pesado', greenStatus:'DENTRO DEL OBJETIVO', yellowStatus:'CERCA DEL LÍMITE', redStatus:'FUERA DE RANGO',
    greenMessage:'Dentro de ±0.17. No se necesita ajuste.', yellowMessage:'Más de ±0.17 y menos de ±0.25 del objetivo. ADVERTENCIA: vigila el próximo corte y prepárate para corregir el S-Wrap.',
    redMessage:'FUERA DE RANGO. Ajusta el S-Wrap ahora.', noChange:'Mantén el S-Wrap en {speed}. No se recomienda cambio.',
    decrease:'Baja el S-Wrap {amount}, de {current} a {suggested}.', increase:'Sube el S-Wrap {amount}, de {current} a {suggested}.',
    hold:'Mantén el S-Wrap en {speed}.', smartMeta:'Objetivo {target} • S-Wrap actual {speed}', formulaSuggestion:'Sugerencia por fórmula', learnedSuggestion:'Sugerencia aprendida', confidence:'Confianza', rollsLearned:'Rollos aprendidos', recordResult:'Registrar resultado real', learningQuestion:'Después del cambio, escribe el S-Wrap que usaste y el BW final.', appliedSWrap:'S-Wrap aplicado', finalBW:'BW final', saveLearn:'Guardar y aprender', cancel:'Cancelar', learningSaved:'Resultado guardado. Viejito aprendió de este rollo.', machineLearning:'Aprendizaje de la máquina', resetLearning:'Borrar aprendizaje', averageCorrection:'Corrección promedio', successRate:'Porcentaje de éxito', deviceOnly:'El aprendizaje se guarda solamente en este dispositivo.', resetDone:'Se borró el aprendizaje de la máquina.', trendPredictor:'Predictor de tendencia', trendWaiting:'Agrega {remaining} rollo(s) de BW para activar la predicción.', trendStable:'Los últimos 5 rollos están estables. No se recomienda ningún cambio preventivo.', trendUp:'El BW está aumentando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Sube el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendDown:'El BW está bajando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Baja el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendProjected:'Próximo BW proyectado', trendDirection:'Dirección', trendConsistency:'Consistencia', trendRolls:'Últimos rollos', trendClear:'Borrar tendencia', trendCleared:'Se borró el historial de tendencia de BW.', trendUpLabel:'Aumentando', trendDownLabel:'Bajando', trendStableLabel:'Estable', trendApply:'Aplicar S-Wrap {speed}', trendApplied:'Cambio preventivo aplicado — S-Wrap actual: {speed}. Esperando el próximo corte completo.', trendAppliedToast:'S-Wrap preventivo cambiado de {current} a {suggested}.'
  },
  fr: {
    targetBW:'BW cible', currentSWrap:'S-Wrap actuel', swrapAtCut:'S-Wrap lors de la coupe', difference:'Différence', suggestedSWrap:'S-Wrap suggéré',
    tooLight:'Trop léger', tooHeavy:'Trop lourd', greenStatus:'DANS LA CIBLE', yellowStatus:'PRÈS DE LA LIMITE', redStatus:'HORS PLAGE',
    greenMessage:'Dans ±0,17. Aucun réglage nécessaire.', yellowMessage:'Plus de ±0,17 et moins de ±0,25 de la cible. Attention : surveillez la prochaine coupe et préparez une correction du S-Wrap.',
    redMessage:'Modifiez le S-Wrap maintenant.', noChange:'Gardez le S-Wrap à {speed}. Aucun changement recommandé.',
    decrease:'Réduisez le S-Wrap de {amount}, de {current} à {suggested}.', increase:'Augmentez le S-Wrap de {amount}, de {current} à {suggested}.',
    hold:'Gardez le S-Wrap à {speed}.', smartMeta:'Cible {target} • S-Wrap actuel {speed}', formulaSuggestion:'Suggestion par formule', learnedSuggestion:'Suggestion apprise', confidence:'Confiance', rollsLearned:'Rouleaux appris', recordResult:'Enregistrer le résultat réel', learningQuestion:'Après le changement, saisissez le S-Wrap utilisé et le BW final.', appliedSWrap:'S-Wrap appliqué', finalBW:'BW final', saveLearn:'Enregistrer et apprendre', cancel:'Annuler', learningSaved:'Résultat enregistré. Viejito a appris de ce rouleau.', machineLearning:'Apprentissage machine', resetLearning:'Réinitialiser', averageCorrection:'Correction moyenne', successRate:'Taux de réussite', deviceOnly:'Les données restent uniquement sur cet appareil.', resetDone:'Apprentissage réinitialisé.', trendPredictor:'Prédicteur de tendance', trendWaiting:'Ajoutez encore {remaining} rouleau(x) BW pour activer la prévision.', trendStable:'Les 5 derniers rouleaux sont stables. Aucun changement préventif recommandé.', trendUp:'Le BW augmente d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Augmentez le S-Wrap de {amount} points, de {current} à {suggested}.', trendDown:'Le BW diminue d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Réduisez le S-Wrap de {amount} points, de {current} à {suggested}.', trendProjected:'Prochain BW estimé', trendDirection:'Direction', trendConsistency:'Cohérence', trendRolls:'Derniers rouleaux', trendClear:'Effacer la tendance', trendCleared:'Historique de tendance BW effacé.', trendUpLabel:'En hausse', trendDownLabel:'En baisse', trendStableLabel:'Stable', trendApply:'Appliquer S-Wrap {speed}', trendApplied:'Changement préventif appliqué — S-Wrap actuel : {speed}. En attente de la prochaine coupe terminée.', trendAppliedToast:'S-Wrap préventif modifié de {current} à {suggested}.'
  }
};
function ot(key,vars={}){
  let value=(optimizerText[state.language]||optimizerText.en)[key]||optimizerText.en[key]||key;
  Object.entries(vars).forEach(([name,replacement])=>value=value.replaceAll(`{${name}}`,replacement));
  return value;
}
function saveOptimizerSettings(targetBW,currentSWrap){
  if(!positive(targetBW,currentSWrap)) throw new Error(t('invalidNumbers'));
  state.targetBW=Number(targetBW);
  state.currentSWrap=clampSWrap(currentSWrap);
  // Keep the live per-line S-Wrap synchronized with the active shift/run too.
  if(state.activeShift){
    state.activeShift.currentSWrap=state.currentSWrap;
    const run=state.activeShift.runs?.find(item=>item.id===state.activeShift.runId);
    if(run)run.swrap=state.currentSWrap;
    saveShift();
  }
  lineSet('viejitoTargetBW',String(state.targetBW));
  lineSet('viejitoCurrentSWrap',String(state.currentSWrap));
}
function currentProcessContext(){
  // During an active shift, the committed run product is authoritative. The editable field may contain a draft.
  const product=String(state.activeShift?.product||$('bw-product')?.value||state.product||'').trim();
  const mandrel=currentMandrel('bw');
  state.product=product;
  lineSet('viejitoProduct',product);
  return {
    product:product.toUpperCase(),
    mandrel,
    extruder:Number(state.activeShift?.extruder)||null,
    shiftId:state.activeShift?.id||null,
    runId:state.activeShift?.runId||null,
    shiftCode:state.activeShift?.shiftCode||scheduledShiftCode()||null,
    shiftWorkDate:state.activeShift?.shiftWorkDate||scheduledShiftInfo()?.workDate||null
  };
}
function optimizeBasisWeight(actualBW,targetBW=state.targetBW,currentSWrap=state.currentSWrap,{persist=true}={}){
  if(!positive(targetBW,currentSWrap)) throw new Error(t('invalidNumbers'));
  const normalizedTarget=Number(targetBW);
  const normalizedSWrap=clampSWrap(currentSWrap);
  // Historical/result redraws must never overwrite the live S-Wrap for the line.
  // The last completed cut can legitimately have been made at a different S-Wrap.
  if(persist) saveOptimizerSettings(normalizedTarget,normalizedSWrap);
  const optimizer=new SmartOptimizer({targetBW:normalizedTarget,currentSWrap:normalizedSWrap,roundMode:'nearest1',learningEngine:state.learningEngine,context:currentProcessContext()});
  const result=optimizer.evaluate(actualBW);
  // 5.34.6: a green average at the outer edge of the ±0.17 band gets a
  // small 2-point preventive S-Wrap option before the next cut enters warning.
  const edgeStart=0.15;
  if(result.level==='green'&&Number(result.absoluteDifference)>=edgeStart&&Number(result.absoluteDifference)<=Number(result.greenTolerance||0.17)){
    const direction=Number(result.difference)>=0?1:-1;
    const preventive=clampSWrap(Number(result.currentSWrap)+(2*direction));
    if(Math.abs(preventive-Number(result.currentSWrap))>=0.5){
      result.edgePreventive=true;
      result.recommendationType='preventive_edge';
      result.fullCorrectiveFormulaSuggestion=result.formulaSuggestion;
      result.formulaSuggestion=preventive;
      result.suggestedSWrap=preventive;
      result.adjustment=Number((preventive-Number(result.currentSWrap)).toFixed(1));
      result.direction=result.adjustment>0?'increase':result.adjustment<0?'decrease':'hold';
      result.suggestAdjustment=result.direction!=='hold';
    }
  }
  return result;
}
function optimizerAction(result){
  if(!result.suggestAdjustment) return ot('noChange',{speed:fmt(result.currentSWrap,1)});
  const amount=fmt(Math.abs(result.adjustment),1);
  if(result.direction==='decrease') return ot('decrease',{amount,current:fmt(result.currentSWrap,1),suggested:fmt(result.suggestedSWrap,1)});
  if(result.direction==='increase') return ot('increase',{amount,current:fmt(result.currentSWrap,1),suggested:fmt(result.suggestedSWrap,1)});
  return ot('hold',{speed:fmt(result.currentSWrap,1)});
}
function optimizerStatus(result){
  if(result.level==='green'&&result.edgePreventive){
    const title=state.language==='es'?'EN OBJETIVO — CERCA DEL LÍMITE':state.language==='fr'?'DANS LA CIBLE — PRÈS DE LA LIMITE':'ON TARGET — NEAR LIMIT';
    const message=state.language==='es'
      ?`Todavía está dentro de ±0.17, pero está cerca del warning. Sugerencia preventiva: S-Wrap ${fmt(result.currentSWrap,1)} → ${fmt(result.suggestedSWrap,1)}. Vigila el próximo corte.`
      :state.language==='fr'
        ?`Toujours dans ±0,17, mais près de la limite. Suggestion préventive : S-Wrap ${fmt(result.currentSWrap,1)} → ${fmt(result.suggestedSWrap,1)}. Surveillez la prochaine coupe.`
        :`Still within ±0.17, but close to warning. Preventive suggestion: S-Wrap ${fmt(result.currentSWrap,1)} → ${fmt(result.suggestedSWrap,1)}. Watch the next cut.`;
    return {title,message};
  }
  if(result.level==='green') return {title:ot('greenStatus'),message:ot('greenMessage')};
  if(result.level==='yellow') return {title:ot('yellowStatus'),message:ot('yellowMessage')};
  const current=Number(result.currentSWrap);
  const suggested=Number(result.suggestedSWrap);
  const change=Number.isFinite(current)&&Number.isFinite(suggested)?suggested-current:0;
  const direction=change>0
    ? (state.language==='es'?'SUBIR':state.language==='fr'?'AUGMENTER':'INCREASE')
    : (state.language==='es'?'BAJAR':state.language==='fr'?'RÉDUIRE':'DECREASE');
  const label=state.language==='es'?'S-Wrap sugerido':state.language==='fr'?'S-Wrap suggéré':'Suggested S-Wrap';
  const amount=Math.abs(change);
  const maxNote=result.limitReached?` • MAX ${MAX_SWRAP_SPEED}`:'';
  return {title:ot('redStatus'),message:`${label}: ${fmt(suggested,1)} • ${direction} ${amount?fmt(amount,1):''}${maxNote}`.trim()};
}
function operatorSWrapInstruction(result){
  const suggested=fmt(result.suggestAdjustment?result.suggestedSWrap:result.currentSWrap,1);
  if(result.limitReached&&Number(result.suggestedSWrap)>=MAX_SWRAP_SPEED){
    return state.language==='es'?`S-Wrap sugerido ${MAX_SWRAP_SPEED} — límite máximo alcanzado. No exceder ${MAX_SWRAP_SPEED} ft/min.`:state.language==='fr'?`S-Wrap ${MAX_SWRAP_SPEED} — limite maximale atteinte.`:`Suggested S-Wrap ${MAX_SWRAP_SPEED} — maximum limit reached. Do not exceed ${MAX_SWRAP_SPEED} ft/min.`;
  }
  if(!result.suggestAdjustment) return state.language==='es'?`Mantén el S-Wrap en ${suggested}`:state.language==='fr'?`Gardez le S-Wrap à ${suggested}`:`Keep S-Wrap at ${suggested}`;
  if(result.direction==='increase') return state.language==='es'?`Súbele el S-Wrap a ${suggested}`:state.language==='fr'?`Augmentez le S-Wrap à ${suggested}`:`Increase S-Wrap to ${suggested}`;
  if(result.direction==='decrease') return state.language==='es'?`Bájale el S-Wrap a ${suggested}`:state.language==='fr'?`Réduisez le S-Wrap à ${suggested}`:`Decrease S-Wrap to ${suggested}`;
  return state.language==='es'?`Mantén el S-Wrap en ${suggested}`:state.language==='fr'?`Gardez le S-Wrap à ${suggested}`:`Keep S-Wrap at ${suggested}`;
}
function optimizerMarkup(result){
  return `<div class="chat-optimizer ${result.level}"><strong>${escapeHTML(operatorSWrapInstruction(result))}</strong></div>`;
}

function renderResultStatus(result){
  const statusBox=$('result-status');
  if(!statusBox) return;
  const status=optimizerStatus(result);
  statusBox.classList.remove('idle','green','yellow','red','status-pop','edge-preventive');
  statusBox.classList.add(result.level);
  statusBox.classList.toggle('edge-preventive',!!result.edgePreventive);
  void statusBox.offsetWidth;
  statusBox.classList.add('status-pop');
  $('result-status-title').textContent=status.title;
  $('result-status-message').textContent=status.message;
  statusBox.setAttribute('aria-label',`${status.title}. ${status.message}`);
}


function renderProcessPrioritySummary(result){
  const box=$('process-priority-summary');
  if(!box||!result)return;
  const status=optimizerStatus(result);
  box.classList.remove('hidden','green','yellow','red','status-pop','edge-preventive');
  box.classList.add(result.level);
  box.classList.toggle('edge-preventive',!!result.edgePreventive);
  void box.offsetWidth;box.classList.add('status-pop');
  $('priority-average-bw').textContent=fmt(result.actualBW,3);
  $('priority-target-bw').textContent=fmt(result.targetBW,2);
  $('priority-difference').textContent=result.difference>0?`+${fmt(result.difference,2)}`:fmt(result.difference,2);
  $('priority-status').textContent=status.title;
  $('priority-message').textContent=status.message;
  $('priority-current-swrap').textContent=fmt(result.currentSWrap,1);
  $('priority-suggested-swrap').textContent=result.suggestAdjustment?fmt(result.suggestedSWrap,1):fmt(result.currentSWrap,1);
  const outer=Number(result.warningTolerance)||0.25,low=result.targetBW-outer,high=result.targetBW+outer;
  if($('priority-range-low'))$('priority-range-low').textContent=Number(low).toFixed(2);
  if($('priority-range-target'))$('priority-range-target').textContent=Number(result.targetBW).toFixed(2);
  if($('priority-range-high'))$('priority-range-high').textContent=Number(high).toFixed(2);
  const priorityPos=Math.max(0,Math.min(100,((result.actualBW-low)/(high-low||1))*100));
  if($('priority-range-marker'))$('priority-range-marker').style.left=`${priorityPos}%`;
  const markerLevel=result.level==='red'?'red':(result.level==='yellow'||result.edgePreventive)?'yellow':'green';
  const markerLabel=$('priority-range-marker-label');if(markerLabel){markerLabel.style.left=`${priorityPos}%`;markerLabel.textContent=fmt(result.actualBW,3);markerLabel.classList.remove('green','yellow','red');markerLabel.classList.add(markerLevel);}
}

function renderOptimizerPanel(result){
  const panel=$('optimizer-panel');
  const status=optimizerStatus(result);
  panel.classList.remove('hidden','green','yellow','red','edge-preventive');
  panel.classList.add(result.level);
  panel.classList.toggle('edge-preventive',!!result.edgePreventive);
  $('bw-result-box').classList.remove('green','yellow','red','edge-preventive');
  $('bw-result-box').classList.add(result.level);
  $('bw-result-box').classList.toggle('edge-preventive',!!result.edgePreventive);
  $('optimizer-status').textContent=status.title;
  $('optimizer-message').textContent=status.message;
  $('optimizer-target').textContent=fmt(result.targetBW);
  $('optimizer-difference').textContent=result.difference>0?`+${fmt(result.difference)}`:fmt(result.difference);
  $('optimizer-current').textContent=fmt(result.currentSWrap,1);
  $('optimizer-suggested').textContent=result.suggestAdjustment?fmt(result.suggestedSWrap,1):'—';
  $('optimizer-action').textContent=optimizerAction(result);
  $('formula-suggestion').textContent=result.suggestAdjustment?fmt(result.formulaSuggestion,1):'—';
  $('learned-suggestion').textContent=result.suggestAdjustment?fmt(result.suggestedSWrap,1):'—';
  $('learning-confidence').textContent=`${result.learning.confidence}%`;
  $('learning-count').textContent=String(result.learning.count);
  state.latestOptimization=result;
  renderOptimizationSWrapContext(result);
  if($('record-result-toggle'))$('record-result-toggle').classList.add('hidden');
  $('learning-form').classList.add('hidden');
  $('applied-swrap').value=result.suggestAdjustment?fmt(result.suggestedSWrap,1):'';
  renderLearningDashboard();
  $('range-low').textContent=Number(result.targetBW-result.warningTolerance).toFixed(2);
  $('range-target').textContent=Number(result.targetBW).toFixed(2);
  $('range-high').textContent=Number(result.targetBW+result.warningTolerance).toFixed(2);
  const span=result.warningTolerance*2;
  const position=Math.max(0,Math.min(100,((result.actualBW-(result.targetBW-result.warningTolerance))/span)*100));
  $('range-marker').style.left=`${position}%`;
  const rangeLabel=$('range-marker-label');if(rangeLabel){rangeLabel.style.left=`${position}%`;rangeLabel.textContent=fmt(result.actualBW,3);rangeLabel.classList.remove('green','yellow','red');rangeLabel.classList.add(result.level==='red'?'red':(result.level==='yellow'||result.edgePreventive)?'yellow':'green');}
  renderResultStatus(result);
  renderProcessPrioritySummary(result);
  renderRecommendationDecision(result);
  runDangerFlash(result);
}

function sanitizeTrendHistory(){
  if(!Array.isArray(state.bwTrendHistory)) state.bwTrendHistory=[];
  state.bwTrendHistory=state.bwTrendHistory
    .map(item=>typeof item==='number'?{bw:item,time:new Date().toISOString()}:item)
    .filter(item=>item&&positive(Number(item.bw)))
    .slice(-250);
}
function saveTrendHistory(){
  sanitizeTrendHistory();
  lineSet(activeTrendHistoryKey(),JSON.stringify(state.bwTrendHistory));
}
const ACCEPTED_PREVENTIVE_TREND_KEY='viejitoAcceptedPreventiveTrendV1';
function acceptedPreventiveTrend(){
  try{return JSON.parse(lineGet(activeAcceptedPreventiveTrendKey(),'null')||'null');}catch(_){return null;}
}
function trendSignature(trend){
  if(!trend||!Array.isArray(trend.values))return '';
  const ctx=currentProcessContext();
  return [ctx.product,ctx.mandrel,ctx.extruder||'',fmt(Number(trend.targetBW||state.targetBW),3),trend.direction,fmt(Number(trend.projectedBW||0),3),trend.values.map(value=>fmt(Number(value),3)).join(',')].join('|');
}
function preventiveTrendAlreadyApplied(trend){
  const accepted=acceptedPreventiveTrend();
  return !!(accepted&&accepted.signature&&accepted.signature===trendSignature(trend));
}
function saveAcceptedPreventiveTrend(value){
  const key=activeAcceptedPreventiveTrendKey();
  if(value)lineSet(key,JSON.stringify(value));
  else lineRemove(key);
}
function trendDirectionLabel(direction){
  if(direction==='up') return ot('trendUpLabel');
  if(direction==='down') return ot('trendDownLabel');
  return ot('trendStableLabel');
}
function analyzeTrend(targetBW=state.targetBW,currentSWrap=state.currentSWrap){
  sanitizeTrendHistory();
  const predictor=new TrendPredictor({sampleSize:TREND_SAMPLE_SIZE,targetBW,tolerance:window.VIEJITO_TOLERANCES?.warning||0.25,preventiveStep:2});
  const context=currentProcessContext();
  const matching=state.bwTrendHistory.filter(item=>{
    const sameProduct=!context.product||String(item.product||'').toUpperCase()===context.product;
    const sameMandrel=!context.mandrel||Number(item.mandrel||48)===Number(context.mandrel);
    const sameExtruder=!context.extruder||Number(item.extruder||0)===Number(context.extruder);
    // Trend follows the last comparable rolls on this line/product/mandrel, even across changeovers.
    // Requiring the same run made the predictor restart too often and feel like it never activated.
    return sameProduct&&sameMandrel&&sameExtruder;
  }).slice(-TREND_SAMPLE_SIZE);
  state.latestTrend=predictor.analyze(matching.map(item=>Number(item.bw)),currentSWrap);
  return state.latestTrend;
}
function trendMessage(trend){
  if(!trend.ready) return ot('trendWaiting',{remaining:Math.max(0,trend.required-trend.count)});
  const accepted=acceptedPreventiveTrend();
  if(preventiveTrendAlreadyApplied(trend)&&positive(accepted?.appliedSWrap)) return ot('trendApplied',{speed:fmt(accepted.appliedSWrap,1)});
  if(!trend.recommendAdjustment) return ot('trendStable');
  const vars={slope:fmt(Math.abs(trend.slope),3),projected:fmt(trend.projectedBW,3),amount:Math.abs(trend.adjustment),current:fmt(trend.suggestedSWrap-trend.adjustment,1),suggested:fmt(trend.suggestedSWrap,1)};
  return trend.direction==='up'?ot('trendUp',vars):ot('trendDown',vars);
}
function trendMarkup(trend){
  const level=trend.level==='danger'?'red':trend.level==='warning'?'yellow':'green';
  const values=trend.values.map(value=>fmt(value,3)).join(' → ');
  return `<div class="chat-trend ${level}"><strong>${escapeHTML(ot('trendPredictor'))}</strong><small>${escapeHTML(trendMessage(trend))}</small>${trend.ready?`<div class="chat-trend-grid"><span>${escapeHTML(ot('trendProjected'))}: <b>${escapeHTML(fmt(trend.projectedBW,3))}</b></span><span>${escapeHTML(ot('trendDirection'))}: <b>${escapeHTML(trendDirectionLabel(trend.direction))}</b></span><span>${escapeHTML(ot('trendConsistency'))}: <b>${escapeHTML(trend.consistency+'%')}</b></span><span>${escapeHTML(ot('trendRolls'))}: <b>${escapeHTML(values)}</b></span></div>`:''}</div>`;
}
function targetForTrendRecord(item){
  const saved=Number(item?.targetBW);
  if(positive(saved))return saved;
  const fromProduct=targetFromProduct(item?.product||'');
  if(positive(fromProduct))return fromProduct;
  return null;
}
function todayLinePerformance(){
  sanitizeTrendHistory();
  const now=new Date();
  const dayKey=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  const rows=state.bwTrendHistory.map(item=>{
    const d=new Date(item.time||0);
    const key=Number.isFinite(d.getTime())?`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`:'';
    const target=targetForTrendRecord(item);
    const bw=Number(item.bw);
    return {item,key,target,bw,delta:positive(target,bw)?bw-target:null};
  }).filter(row=>row.key===dayKey&&Number.isFinite(row.delta));
  if(!rows.length)return {count:0,onTarget:0,warning:0,red:0,onTargetRate:0,avgDelta:0,avgAbs:0,last:null};
  const onTarget=rows.filter(r=>Math.abs(r.delta)<=0.17).length;
  const warning=rows.filter(r=>Math.abs(r.delta)>0.17&&Math.abs(r.delta)<0.25).length;
  const red=rows.filter(r=>Math.abs(r.delta)>=0.25).length;
  const avgDelta=rows.reduce((s,r)=>s+r.delta,0)/rows.length;
  const avgAbs=rows.reduce((s,r)=>s+Math.abs(r.delta),0)/rows.length;
  return {count:rows.length,onTarget,warning,red,onTargetRate:Math.round(onTarget*100/rows.length),avgDelta,avgAbs,last:rows[rows.length-1]};
}
function currentLineStatusFromPerformance(perf){
  const delta=Number(perf?.last?.delta);
  if(!Number.isFinite(delta))return 'waiting';
  const abs=Math.abs(delta);
  if(abs<=0.17)return 'green';
  if(abs<0.25)return 'yellow';
  return 'red';
}
function localizedTrendCopy(key){
  const copy={
    en:{building:'BUILDING',onTarget:'ON TARGET',warning:'WARNING',out:'OUT OF RANGE',todayNone:'Today: no completed cuts',today:'Today {rate}% on target • Avg Δ {delta}',stable:'Stable',rising:'Rising',falling:'Falling',waiting:'Waiting',noAction:'No action needed',watch:'Watch next cut',preventive:'Preventive',rolls:'{count}/{need} rolls',confidence:'{value}% confidence',action:'Preventive Action',applySuggestion:'Apply Suggestion',applyShort:'Apply',correctiveBelow:'Corrective action below',correctiveDeferred:'Preventive action deferred — current BW is out of range. Follow the corrective S-Wrap recommendation below, then wait for a new completed cut.',next:'Next BW'},
    es:{building:'FORMANDO',onTarget:'EN TARGET',warning:'ADVERTENCIA',out:'FUERA DE RANGO',todayNone:'Hoy: sin cortes completos',today:'Hoy {rate}% en target • Prom Δ {delta}',stable:'Estable',rising:'Subiendo',falling:'Bajando',waiting:'Esperando',noAction:'Sin acción preventiva',watch:'Vigila próximo corte',preventive:'Preventivo',rolls:'{count}/{need} rollos',confidence:'{value}% confianza',action:'Acción preventiva',applySuggestion:'Aplicar sugerencia',applyShort:'Aplicar',correctiveBelow:'Acción correctiva abajo',correctiveDeferred:'Acción preventiva en espera — el BW actual está fuera de rango. Sigue la corrección de S-Wrap de abajo y espera un nuevo corte completo.',next:'Próximo BW'},
    fr:{building:'EN COURS',onTarget:'SUR CIBLE',warning:'ATTENTION',out:'HORS PLAGE',todayNone:'Aujourd’hui : aucune coupe terminée',today:'Aujourd’hui {rate}% cible • Δ moy {delta}',stable:'Stable',rising:'En hausse',falling:'En baisse',waiting:'En attente',noAction:'Aucune action préventive',watch:'Surveiller prochaine coupe',preventive:'Préventif',rolls:'{count}/{need} rouleaux',confidence:'Confiance {value}%',action:'Action préventive',applySuggestion:'Appliquer suggestion',applyShort:'Appliquer',correctiveBelow:'Action corrective ci-dessous',correctiveDeferred:'Action préventive différée — le BW actuel est hors plage. Suivez la correction S-Wrap ci-dessous puis attendez une nouvelle coupe terminée.',next:'Prochain BW'}
  };
  return (copy[state.language]||copy.en)[key]||key;
}
function fillTemplate(value,vars={}){let out=String(value);Object.entries(vars).forEach(([k,v])=>out=out.replaceAll(`{${k}}`,String(v)));return out;}
function activeCorrectiveBWAction(){
  const result=state.latestOptimization;
  return !!(result&&result.level==='red'&&result.suggestAdjustment&&positive(result.suggestedSWrap));
}
function renderTrendPanel(trend=analyzeTrend()){

  const panel=$('trend-panel');
  if(!panel)return;
  const perf=todayLinePerformance();
  const currentStatus=currentLineStatusFromPerformance(perf);
  panel.classList.remove('waiting','green','yellow','red');
  panel.classList.add(currentStatus);
  if($('trend-title'))$('trend-title').textContent=ot('trendPredictor');
  if($('trend-action-label'))$('trend-action-label').textContent=localizedTrendCopy('action');
  if($('trend-projected-label'))$('trend-projected-label').textContent=localizedTrendCopy('next');
  if($('trend-direction-label'))$('trend-direction-label').textContent=ot('trendDirection');

  const statusText=currentStatus==='green'?localizedTrendCopy('onTarget'):currentStatus==='yellow'?localizedTrendCopy('warning'):currentStatus==='red'?localizedTrendCopy('out'):localizedTrendCopy('building');
  if($('trend-status'))$('trend-status').textContent=statusText;
  const correctiveActive=activeCorrectiveBWAction();
  if($('trend-message'))$('trend-message').textContent=correctiveActive?localizedTrendCopy('correctiveDeferred'):trendMessage(trend);
  if($('trend-day-summary')){
    const delta=perf.avgDelta>=0?`+${fmt(perf.avgDelta,3)}`:fmt(perf.avgDelta,3);
    $('trend-day-summary').textContent=perf.count?fillTemplate(localizedTrendCopy('today'),{rate:perf.onTargetRate,delta}):localizedTrendCopy('todayNone');
  }

  const direction=trend.ready?(trend.direction==='up'?localizedTrendCopy('rising'):trend.direction==='down'?localizedTrendCopy('falling'):localizedTrendCopy('stable')):localizedTrendCopy('waiting');
  if($('trend-direction'))$('trend-direction').textContent=direction;
  if($('trend-consistency'))$('trend-consistency').textContent=trend.ready?fillTemplate(localizedTrendCopy('confidence'),{value:trend.consistency}):fillTemplate(localizedTrendCopy('rolls'),{count:trend.count||0,need:trend.required||TREND_SAMPLE_SIZE});
  if($('trend-projected'))$('trend-projected').textContent=trend.ready?fmt(trend.projectedBW,3):'—';
  if($('trend-rolls'))$('trend-rolls').textContent=fillTemplate(localizedTrendCopy('rolls'),{count:trend.count||0,need:trend.required||TREND_SAMPLE_SIZE});

  renderLineQualityStrip(state.lastCompletedCut);
  renderTrendQualityCompact(state.lastCompletedCut);
  const applyButton=$('apply-preventive-swrap');
  const edge=state.latestOptimization;
  const edgeShow=!!(!correctiveActive&&edge?.edgePreventive&&edge?.suggestAdjustment&&positive(edge.suggestedSWrap)&&!recommendationAlreadyCurrent(edge));
  const trendShow=!!(!correctiveActive&&trend.ready&&trend.recommendAdjustment&&positive(trend.suggestedSWrap)&&!preventiveTrendAlreadyApplied(trend));
  const show=edgeShow||trendShow;
  const preventiveSuggested=edgeShow?Number(edge.suggestedSWrap):Number(trend.suggestedSWrap);
  if(applyButton){
    applyButton.classList.toggle('hidden',!show);
    applyButton.disabled=!show;
    if(show)applyButton.textContent=`${localizedTrendCopy('applyShort')} ${fmt(preventiveSuggested,1)}`;
  }
  if($('trend-action')){
    $('trend-action').classList.remove('hidden');
    if(show){
      const before=Number(state.currentSWrap)||Number(preventiveSuggested-(edgeShow?Number(edge.adjustment||0):Number(trend.adjustment||0)));
      $('trend-action').textContent=`S-Wrap ${fmt(before,1)} → ${fmt(preventiveSuggested,1)}`;
    }else if(correctiveActive)$('trend-action').textContent=localizedTrendCopy('correctiveBelow');
    else if(trend?.blockedByMax)$('trend-action').textContent=`MAX S-Wrap ${MAX_SWRAP_SPEED}`;
    else if(currentStatus==='yellow'||(trend.ready&&trend.level==='warning'))$('trend-action').textContent=localizedTrendCopy('watch');
    else $('trend-action').textContent=localizedTrendCopy('noAction');
  }
}

function acceptPreventiveSWrapChange(){
  if(!requireActiveShift({openStart:true}))return false;
  const edge=state.latestOptimization;
  if(edge?.edgePreventive&&edge?.suggestAdjustment&&positive(edge.suggestedSWrap)&&!recommendationAlreadyCurrent(edge)){acceptSWrapRecommendation();return true;}
  const trend=state.latestTrend||analyzeTrend();
  if(activeCorrectiveBWAction()){
    showToast(localizedTrendCopy('correctiveDeferred'));
    return false;
  }
  if(!trend?.ready||!trend.recommendAdjustment||!positive(trend.suggestedSWrap)||preventiveTrendAlreadyApplied(trend))return false;
  const before=Number(state.currentSWrap);
  const applied=Number(trend.suggestedSWrap);
  const ctx=currentProcessContext();
  if(!pendingRecommendation())savePreventiveRecommendationForLearning(trend,before,applied);
  saveAcceptedPreventiveTrend({
    signature:trendSignature(trend),acceptedAt:new Date().toISOString(),beforeSWrap:before,appliedSWrap:applied,
    targetBW:Number(trend.targetBW||state.targetBW),projectedBW:Number(trend.projectedBW),direction:trend.direction,
    consistency:Number(trend.consistency)||0,values:Array.isArray(trend.values)?trend.values.map(Number):[],
    product:ctx.product,mandrel:ctx.mandrel,extruder:ctx.extruder,shiftId:ctx.shiftId,runId:ctx.runId
  });
  const openRec=openRecommendationOpportunity();
  if(openRec?.recommendationType==='preventive')finalizeRecommendationOpportunity('accepted','apply_button');
  else recordQualityEvent('recommendation_accepted',{recommendationType:'preventive',suggestedSWrap:applied,beforeSWrap:before,targetBW:Number(trend.targetBW||state.targetBW),beforeBW:Number(state.lastCompletedCut?.averageBW)||null,reason:'apply_button'});
  recordSWrapChange(before,applied,'preventive_recommendation',{suggestedSWrap:applied});
  syncCurrentSWrap(applied,{save:true});
  if($('bw-current-swrap'))$('bw-current-swrap').value=fmt(applied,1);

  // Refresh the last BW decision using the newly accepted current S-Wrap so the
  // operator never sees the stale pre-change value (for example 180 after applying 178).
  const last=state.latestOptimization;
  if(last&&positive(Number(last.actualBW),Number(last.targetBW))){
    const refreshed=optimizeBasisWeight(Number(last.actualBW),Number(last.targetBW),applied);
    renderOptimizerPanel(refreshed);
  }
  const refreshedTrend=analyzeTrend(Number(trend.targetBW||state.targetBW),applied);
  renderTrendPanel(refreshedTrend);
  addHistory('Preventive S-Wrap',`${fmt(before,1)} → ${fmt(applied,1)} • ${trendDirectionLabel(trend.direction)} • Projected BW ${fmt(trend.projectedBW,3)} • Accepted`);
  showToast(ot('trendAppliedToast',{current:fmt(before,1),suggested:fmt(applied,1)}));
  return true;
}
function recordBWForTrend(bw,targetBW=state.targetBW,currentSWrap=state.currentSWrap,pair=null){
  // Chat what-if queries are read-only. Demo Mode writes only to its separate demo history.
  if(inChatQuery) return analyzeTrend(targetBW,currentSWrap);
  if(!positive(bw)) return analyzeTrend(targetBW,currentSWrap);
  sanitizeTrendHistory();
  const context=currentProcessContext();
  state.bwTrendHistory.push({bw:Number(bw),targetBW:Number(targetBW)||Number(state.targetBW)||null,currentSWrap:Number(currentSWrap)||Number(state.currentSWrap)||null,winder1:pair?.winder1??Number(bw),winder2:pair?.winder2??null,product:context.product,mandrel:context.mandrel,extruder:context.extruder,shiftId:context.shiftId,runId:context.runId,shiftCode:state.activeShift?.shiftCode||scheduledShiftCode(),shiftWorkDate:state.activeShift?.shiftWorkDate||scheduledShiftInfo()?.workDate||'',operator:state.activeShift?.operator||state.operator||'',time:new Date().toISOString()});
  state.bwTrendHistory=state.bwTrendHistory.slice(-250);
  saveTrendHistory();
  const trend=analyzeTrend(targetBW,currentSWrap);
  renderTrendPanel(trend);
  return trend;
}

function renderLearningDashboard(){
  // The engine itself is already isolated per line. This dashboard summarizes
  // the real accepted-learning records for the selected line, regardless of
  // which product is currently on screen, so it never falsely shows 0 after
  // Viejito has already learned from earlier products on this line.
  const records=(Array.isArray(state.learningEngine?.records)?state.learningEngine.records:[])
    .filter(r=>r && r.source!=='completed_cut' && Number.isFinite(Number(r.correction)));
  const count=records.length;
  let correction=0,successRate=0,confidence=0;
  if(count){
    let weighted=0,totalWeight=0;
    records.slice(-100).forEach((record,index,arr)=>{
      const recency=.35+.65*((index+1)/arr.length);
      const successWeight=record.success?1:.65;
      const weight=recency*successWeight;
      weighted+=Number(record.correction)*weight; totalWeight+=weight;
    });
    correction=totalWeight?weighted/totalWeight:0;
    const recent=records.slice(-100);
    const variance=recent.reduce((sum,r)=>sum+Math.pow(Number(r.correction)-correction,2),0)/recent.length;
    const spread=Math.sqrt(variance);
    confidence=Math.round(100*Math.min(1,recent.length/30)*Math.max(0,1-spread/5));
    successRate=Math.round(100*recent.filter(r=>r.success).length/recent.length);
  }
  $('dashboard-rolls').textContent=String(count);
  $('dashboard-correction').textContent=correction>0?`+${fmt(correction,1)}`:fmt(correction,1);
  $('dashboard-success').textContent=`${successRate}%`;
  $('dashboard-confidence').textContent=`${confidence}%`;
}

let postCutRecommendationDecision=null;
let postCutEscalationsPending=false;
function postCutRecommendationCandidate(result=state.latestOptimization,trend=state.latestTrend){
  if(result?.suggestAdjustment&&positive(Number(result.suggestedSWrap))&&!recommendationAlreadyCurrent(result)){
    const current=Number(state.currentSWrap)||Number(result.currentSWrap);
    const suggested=Number(result.suggestedSWrap);
    const actual=Number(result.actualBW),target=Number(result.targetBW);
    const delta=Number.isFinite(actual)&&Number.isFinite(target)?actual-target:null;
    const type=result.edgePreventive?'preventive_edge':'corrective';
    const reason=result.edgePreventive
      ?chatLang(`Average BW ${fmt(actual,3)} is near the limit. Preventive S-Wrap adjustment recommended.`,`Average BW ${fmt(actual,3)} está cerca del límite. Se recomienda un ajuste preventivo de S-Wrap.`,`Le BW moyen ${fmt(actual,3)} est près de la limite. Un ajustement préventif du S-Wrap est recommandé.`)
      :chatLang(`Average BW ${fmt(actual,3)} is OUT OF RANGE (${delta>=0?'+':''}${fmt(delta,3)} vs target ${fmt(target,2)}).`,`Average BW ${fmt(actual,3)} está FUERA DE RANGO (${delta>=0?'+':''}${fmt(delta,3)} vs objetivo ${fmt(target,2)}).`,`Le BW moyen ${fmt(actual,3)} est HORS PLAGE (${delta>=0?'+':''}${fmt(delta,3)} vs cible ${fmt(target,2)}).`);
    return {kind:'optimizer',type,current,suggested,reason,result};
  }
  if(trend?.ready&&trend?.recommendAdjustment&&positive(Number(trend.suggestedSWrap))&&!preventiveTrendAlreadyApplied(trend)&&!activeCorrectiveBWAction()){
    const current=Number(state.currentSWrap),suggested=Number(trend.suggestedSWrap);
    const reason=chatLang(`Trend Predictor projects the next BW at ${fmt(trend.projectedBW,3)}. Preventive S-Wrap adjustment recommended.`,`Trend Predictor proyecta el próximo BW en ${fmt(trend.projectedBW,3)}. Se recomienda un ajuste preventivo de S-Wrap.`,`Trend Predictor projette le prochain BW à ${fmt(trend.projectedBW,3)}. Un ajustement préventif du S-Wrap est recommandé.`);
    return {kind:'trend',type:'preventive',current,suggested,reason,trend};
  }
  return null;
}
function renderPostCutRecommendationDialog(candidate){
  const dialog=$('post-cut-recommendation-dialog');if(!dialog||!candidate)return false;
  postCutRecommendationDecision=candidate;
  if($('post-cut-recommendation-eyebrow'))$('post-cut-recommendation-eyebrow').textContent=chatLang('VIEJITO RECOMMENDATION','RECOMENDACIÓN DE VIEJITO','RECOMMANDATION VIEJITO');
  if($('post-cut-recommendation-title'))$('post-cut-recommendation-title').textContent=chatLang('S-Wrap decision','Decisión de S-Wrap','Décision S-Wrap');
  if($('post-cut-current-label'))$('post-cut-current-label').textContent=chatLang('Current S-Wrap','S-Wrap actual','S-Wrap actuel');
  if($('post-cut-suggested-label'))$('post-cut-suggested-label').textContent=chatLang('Suggested S-Wrap','S-Wrap sugerido','S-Wrap suggéré');
  if($('post-cut-current-swrap'))$('post-cut-current-swrap').textContent=fmt(candidate.current,1);
  if($('post-cut-suggested-swrap'))$('post-cut-suggested-swrap').textContent=fmt(candidate.suggested,1);
  if($('post-cut-recommendation-reason'))$('post-cut-recommendation-reason').textContent=candidate.reason;
  if($('post-cut-learning-note'))$('post-cut-learning-note').textContent=chatLang('If accepted, Viejito will wait for the next completed cut and compare the predicted BW with the actual BW to learn.','Si aceptas, Viejito esperará el siguiente corte completo y comparará el BW predicho con el BW real para aprender.','Si vous acceptez, Viejito attendra la prochaine coupe terminée et comparera le BW prévu au BW réel pour apprendre.');
  if($('post-cut-accept'))$('post-cut-accept').textContent=chatLang(`✓ Accept ${fmt(candidate.suggested,1)}`,`✓ Aceptar ${fmt(candidate.suggested,1)}`,`✓ Accepter ${fmt(candidate.suggested,1)}`);
  if($('post-cut-continue'))$('post-cut-continue').textContent=chatLang(`Continue running ${fmt(candidate.current,1)}`,`Seguir corriendo ${fmt(candidate.current,1)}`,`Continuer à ${fmt(candidate.current,1)}`);
  dialog.classList.remove('hidden');dialog.setAttribute('aria-hidden','false');
  return true;
}
function closePostCutRecommendationDialog(){
  const dialog=$('post-cut-recommendation-dialog');if(dialog){dialog.classList.add('hidden');dialog.setAttribute('aria-hidden','true');}
  postCutRecommendationDecision=null;
}
function savePreventiveRecommendationForLearning(trend,before,applied){
  if(!trend||!positive(before,applied))return null;
  const ctx=currentProcessContext(),beforeBW=Number(state.lastCompletedCut?.averageBW);
  const predicted=positive(beforeBW,before,applied)?beforeBW*before/applied:Number(trend.projectedBW);
  const pending={
    acceptedAt:new Date().toISOString(),beforeBW:Number(beforeBW),targetBW:Number(trend.targetBW||state.targetBW),
    beforeSWrap:Number(before),formulaSuggestion:Number(applied),appliedSWrap:Number(applied),predictedBW:Number(predicted),
    product:ctx.product,mandrel:ctx.mandrel,extruder:ctx.extruder,shiftId:ctx.shiftId,runId:ctx.runId,
    confidence:Number(trend.consistency)||0,recommendationType:'preventive'
  };
  savePendingRecommendation(pending);return pending;
}
function runPostCutEscalations(){
  if(!postCutEscalationsPending)return;
  postCutEscalationsPending=false;
  handleSheetBalanceEscalationAfterCut();
  if(!$('lead-confirm-dialog')||$('lead-confirm-dialog').classList.contains('hidden'))handleAverageBWEscalationAfterCut();
}
function openPostCutRecommendationDecision(result,trend){
  const candidate=postCutRecommendationCandidate(result,trend);
  if(!candidate){runPostCutEscalations();return false;}
  return renderPostCutRecommendationDialog(candidate);
}
function acceptPostCutRecommendation(){
  const c=postCutRecommendationDecision;if(!c)return;
  if(c.kind==='trend'){
    const before=Number(state.currentSWrap),applied=Number(c.suggested),trend=c.trend;
    savePreventiveRecommendationForLearning(trend,before,applied);
    acceptPreventiveSWrapChange();
  }else acceptSWrapRecommendation();
  closePostCutRecommendationDialog();
  runPostCutEscalations();
}
function continueRunningPostCut(){
  const c=postCutRecommendationDecision;if(!c)return;
  savePendingRecommendation(null);
  const open=openRecommendationOpportunity();
  if(open)finalizeRecommendationOpportunity('not_used','continue_running');
  else recordQualityEvent('recommendation_not_used',{recommendationType:c.type||'unknown',suggestedSWrap:Number(c.suggested)||null,beforeSWrap:Number(c.current)||null,targetBW:Number(c.result?.targetBW||c.trend?.targetBW||state.targetBW)||null,beforeBW:Number(c.result?.actualBW||state.lastCompletedCut?.averageBW)||null,reason:'continue_running'});
  showToast(chatLang(`Continuing at S-Wrap ${fmt(c.current,1)}. Recommendation recorded as not applied.`,`Siguiendo con S-Wrap ${fmt(c.current,1)}. La recomendación quedó registrada como no aplicada.`,`Poursuite au S-Wrap ${fmt(c.current,1)}. Recommandation enregistrée comme non appliquée.`));
  closePostCutRecommendationDialog();
  runPostCutEscalations();
}

const PENDING_RECOMMENDATION_KEY='viejitoPendingRecommendationV1';
function pendingRecommendation(){
  try{return JSON.parse(lineGet(activePendingRecommendationKey(),'null')||'null');}catch(_){return null;}
}
function savePendingRecommendation(value){
  const key=activePendingRecommendationKey();if(value)lineSet(key,JSON.stringify(value));else lineRemove(key);
}
function predictBWAfterSWrap(result,swrap){
  const applied=Number(swrap),current=Number(result.currentSWrap),actual=Number(result.actualBW);
  const profile=result.learning?.profile;
  if(profile&&Number(profile.confidence)>=45&&Number.isFinite(Number(profile.slope))&&Math.abs(Number(profile.slope))>=0.002){
    return actual+Number(profile.slope)*(applied-current);
  }
  return positive(actual,current,applied)?actual*current/applied:result.targetBW;
}
function optimizationUsesPreviousSWrap(result){
  const live=Number(state.currentSWrap),atCut=Number(result?.currentSWrap);
  return positive(live,atCut)&&Math.abs(live-atCut)>=0.05;
}
function recommendationAlreadyCurrent(result){
  const live=Number(state.currentSWrap),suggested=Number(result?.suggestedSWrap);
  return !!(result?.suggestAdjustment&&positive(live,suggested)&&Math.abs(live-suggested)<0.05);
}
function renderOptimizationSWrapContext(result=state.latestOptimization){
  const label=$('optimizer-current-label');
  if(label)label.textContent=result&&optimizationUsesPreviousSWrap(result)?ot('swrapAtCut'):ot('currentSWrap');
  const note=$('recommendation-note');
  if(result&&recommendationAlreadyCurrent(result)&&note){
    note.textContent=state.language==='es'
      ?`El S-Wrap actual ya es ${fmt(state.currentSWrap,1)}. Esperando el próximo corte completo para medir el resultado.`
      :state.language==='fr'
        ?`Le S-Wrap actuel est déjà ${fmt(state.currentSWrap,1)}. En attente de la prochaine coupe terminée.`
        :`Current S-Wrap is already ${fmt(state.currentSWrap,1)}. Waiting for the next completed cut to measure the result.`;
  }
}
function renderRecommendationDecision(result){
  const box=$('recommendation-decision');
  if(!box)return;
  const show=!!(result&&result.suggestAdjustment&&positive(result.suggestedSWrap)&&!recommendationAlreadyCurrent(result));
  box.classList.add('hidden');
  renderOptimizationSWrapContext(result);
  if(!show)return;
  const predicted=predictBWAfterSWrap(result,result.suggestedSWrap);
  $('decision-swrap').textContent=fmt(result.suggestedSWrap,1);
  $('decision-predicted-bw').textContent=fmt(predicted,3);
  $('decision-confidence').textContent=`${result.learning?.confidence||0}%`;
}
function acceptSWrapRecommendation(){
  if(!requireActiveShift({openStart:true}))return false;
  const r=state.latestOptimization;
  if(!r||!r.suggestAdjustment)return;
  const applied=Number(r.suggestedSWrap),predicted=predictBWAfterSWrap(r,applied),ctx=currentProcessContext();
  const pending={
    acceptedAt:new Date().toISOString(),beforeBW:Number(r.actualBW),targetBW:Number(r.targetBW),
    beforeSWrap:Number(r.currentSWrap),formulaSuggestion:Number(r.formulaSuggestion),
    appliedSWrap:applied,predictedBW:Number(predicted),product:ctx.product,mandrel:ctx.mandrel,
    extruder:ctx.extruder,shiftId:ctx.shiftId,runId:ctx.runId,
    confidence:Number(r.learning?.confidence)||0
  };
  savePendingRecommendation(pending);
  const openRec=openRecommendationOpportunity();
  const recommendationType=r.edgePreventive?'preventive_edge':'corrective';
  if(openRec&&['corrective','preventive_edge'].includes(openRec.recommendationType))finalizeRecommendationOpportunity('accepted','apply_button');
  else recordQualityEvent('recommendation_accepted',{recommendationType,suggestedSWrap:applied,beforeSWrap:Number(r.currentSWrap),targetBW:Number(r.targetBW),beforeBW:Number(r.actualBW),reason:'apply_button'});
  recordSWrapChange(Number(r.currentSWrap),applied,r.edgePreventive?'preventive_edge_recommendation':'corrective_recommendation',{suggestedSWrap:applied});
  syncCurrentSWrap(applied,{save:true});
  if($('bw-current-swrap'))$('bw-current-swrap').value=fmt(applied,1);
  if($('recommendation-note'))$('recommendation-note').textContent=chatLang(`Applied ${fmt(applied,1)}. Waiting for the next completed cut to compare predicted ${fmt(predicted,3)} BW with actual BW.`,`Aplicado ${fmt(applied,1)}. Esperando el siguiente corte completo para comparar BW predicho ${fmt(predicted,3)} con BW real.`,`Appliqué ${fmt(applied,1)}. En attente de la prochaine coupe terminée pour comparer le BW prévu ${fmt(predicted,3)} au BW réel.`);
  renderOptimizationSWrapContext(r);
  renderRecommendationDecision(r);
  renderTrendPanel(analyzeTrend(Number(r.targetBW||state.targetBW),applied));
  showToast(chatLang(`S-Wrap changed to ${fmt(applied,1)}. Viejito is waiting for the next BW to measure its prediction.`,`S-Wrap cambiado a ${fmt(applied,1)}. Viejito está esperando el siguiente BW para medir su predicción.`,`S-Wrap changé à ${fmt(applied,1)}. Viejito attend le prochain BW pour mesurer sa prédiction.`));
}
function rejectSWrapRecommendation(){
  savePendingRecommendation(null);
  const open=openRecommendationOpportunity();
  if(open&&['corrective','preventive_edge'].includes(open.recommendationType))finalizeRecommendationOpportunity('not_used','keep_current');
  else if(state.latestOptimization?.suggestAdjustment)recordQualityEvent('recommendation_not_used',{recommendationType:state.latestOptimization.edgePreventive?'preventive_edge':'corrective',suggestedSWrap:Number(state.latestOptimization.suggestedSWrap)||null,beforeSWrap:Number(state.currentSWrap)||null,targetBW:Number(state.latestOptimization.targetBW)||null,beforeBW:Number(state.latestOptimization.actualBW)||null,reason:'keep_current'});
  if($('recommendation-note'))$('recommendation-note').textContent='Recommendation not applied. Current S-Wrap was kept.';
  showToast('Recommendation not applied. Current S-Wrap kept.');
}
function learnFromPendingRecommendation(finalBW,pair,processContext){
  if(demoMode()){savePendingRecommendation(null);return false;}
  const pending=pendingRecommendation();
  if(!pending)return false;
  if(Number(pending.extruder)!==Number(processContext.extruder)||String(pending.runId||'')!==String(processContext.runId||''))return false;
  try{
    state.learningEngine.add({
      source:'accepted_prediction',initialBW:pending.beforeBW,targetBW:pending.targetBW,
      currentSWrap:pending.beforeSWrap,formulaSuggestion:pending.formulaSuggestion,
      appliedSWrap:pending.appliedSWrap,finalBW:Number(finalBW),predictedBW:pending.predictedBW,
      operatorAccepted:true,product:pending.product,mandrel:pending.mandrel,extruder:pending.extruder,
      winder1:pair?.winder1,winder2:pair?.winder2,averageBW:pending.beforeBW
    });
    const error=Number(finalBW)-Number(pending.predictedBW);
    state.lastPredictionOutcome={...pending,actualBW:Number(finalBW),predictionError:error,completedAt:new Date().toISOString()};
    const beforeError=Math.abs(Number(pending.beforeBW)-Number(pending.targetBW));
    const afterError=Math.abs(Number(finalBW)-Number(pending.targetBW));
    const followed=Math.abs(Number(pending.appliedSWrap)-Number(pending.suggestedSWrap||pending.appliedSWrap))<0.6;
    const event=afterError<=0.17?'excellent':afterError<beforeError?(followed?'improved':'ignored'):'worse';
    const comment=contextualSarcasm(event,{before:pending.beforeBW,after:finalBW,target:pending.targetBW});
    savePendingRecommendation(null);
    showToast(comment || `Viejito learned: predicted ${fmt(pending.predictedBW,3)}, actual ${fmt(finalBW,3)}, error ${error>=0?'+':''}${fmt(error,3)} BW.`);
    return true;
  }catch(_){return false;}
}

function saveLearningResult(){
  if(demoMode())return showToast(state.language==='es'?'Modo Demo: aprendizaje desactivado.':'Demo Mode: learning disabled.');
  const optimization=state.latestOptimization;
  if(!optimization) return showToast(t('invalidNumbers'));
  const requestedAppliedSWrap=Number($('applied-swrap').value);
  const appliedSWrap=clampSWrap(requestedAppliedSWrap);
  if(requestedAppliedSWrap>MAX_SWRAP_SPEED){$('applied-swrap').value=fmt(appliedSWrap,1);showToast(swrapLimitCopy());}
  const finalBW=Number($('final-bw').value);
  try{
    state.learningEngine.add({
      initialBW:optimization.actualBW,
      targetBW:optimization.targetBW,
      currentSWrap:optimization.currentSWrap,
      formulaSuggestion:optimization.formulaSuggestion,
      appliedSWrap,
      finalBW,
      ...currentProcessContext(),
      winder1:optimization.winder1,
      winder2:optimization.winder2,
      averageBW:optimization.actualBW
    });
    $('learning-form').classList.add('hidden');
    $('final-bw').value='';
    renderLearningDashboard();
    const refreshed=optimizeBasisWeight(optimization.actualBW,optimization.targetBW,optimization.currentSWrap);
    renderOptimizerPanel(refreshed);
    showToast(ot('learningSaved'));
  }catch(error){showToast(error.message);}
}

function parseSmartBWRequest(text){
  const vals=numbers(text);
  const lower=text.toLowerCase();
  const hasTarget=/\b(target|objetivo|cible)\b/.test(lower);
  const hasSpeed=/\b(sw\s*wrap|s[- ]?wrap|swrap|sw\s*\d|speed|velocidad|vitesse)\b/.test(lower);
  if(vals.length>=4 || (vals.length>=4 && hasTarget && hasSpeed)){
    return {weight:vals[0],length:vals[1],targetBW:vals[2],currentSWrap:vals[3]};
  }
  if(hasTarget && hasSpeed && vals.length>=4){
    return {weight:vals[0],length:vals[1],targetBW:vals[2],currentSWrap:vals[3]};
  }
  return null;
}
function handleSmartBW({weight,length,targetBW,currentSWrap},mandrel){
  const gate=activeShiftChatGate();if(gate)return gate;
  try{
    const result=calculateBW(weight,length,mandrel);
    const optimizer=optimizeBasisWeight(result,targetBW,currentSWrap);
    const trend=recordBWForTrend(result,targetBW,currentSWrap);
    state.context={intent:'bw',weight,length,mandrel,targetBW,currentSWrap,lastCalculation:true}; saveContext();
    addHistory('BW',`${fmt(result)} • Target ${fmt(targetBW)} • S-Wrap ${fmt(currentSWrap,1)} • ${optimizer.level.toUpperCase()}`);
    return {kind:'result',title:'Basis Weight',value:fmt(result),meta:ot('smartMeta',{target:fmt(targetBW),speed:fmt(currentSWrap,1)}),optimizer,trend,sarcasm:getSarcasmLine()};
  }catch(error){return {kind:'error',message:error.message};}
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


const CHAT_WORKFLOW_KEY='viejitoChatWorkflowV1';
let chatWorkflow=(()=>{try{return JSON.parse(lineGet(CHAT_WORKFLOW_KEY,'null')||'null')||null;}catch(_){return null;}})();
function saveChatWorkflow(){
  if(chatWorkflow) lineSet(CHAT_WORKFLOW_KEY,JSON.stringify(chatWorkflow));
  else lineRemove(CHAT_WORKFLOW_KEY);
}

function startLineChatWorkflow(line=ACTIVE_LINE){
  line=Number(line)||ACTIVE_LINE;
  if(line!==ACTIVE_LINE)switchLine(line);
  closeExpiredShiftForSchedule();
  if(state.activeShift)return {kind:'info',message:chatLang(`Line ${ACTIVE_LINE} is already running ${state.activeShift.product} on ${state.activeShift.shiftCode||scheduledShiftCode()||'the scheduled'} Shift.`,`Line ${ACTIVE_LINE} ya está corriendo ${state.activeShift.product} en Turno ${state.activeShift.shiftCode||scheduledShiftCode()||'programado'}.`,`Line ${ACTIVE_LINE} est déjà active.`)};
  const sched=scheduledShiftInfo();
  chatWorkflow={type:'start-line',stage:'operator',line:ACTIVE_LINE,shiftCode:sched?.code||null,shiftWorkDate:sched?.workDate||'',shiftType:sched?.type||'',language:['en','es'].includes(state.language)?state.language:'en',startedAt:new Date().toISOString()};
  saveChatWorkflow();
  return {kind:'info',title:chatLang(`Start Line ${ACTIVE_LINE} — ${sched?.code||'—'} Shift`,`Empezar Line ${ACTIVE_LINE} — Turno ${sched?.code||'—'}`,`Démarrer Line ${ACTIVE_LINE}`),message:chatLang(`The schedule says ${shiftDisplay(sched)}. What is your name?`,`El calendario marca ${shiftDisplay(sched)}. ¿Cuál es tu nombre?`,`Quel est votre nom ?`)};
}
function startLineWorkflowSummary(flow){
  const target=targetFromProduct(flow.product),mandrel=automaticMandrelForProduct(flow.product)||state.mandrel||DEFAULT_MANDREL;
  return chatLang(
    `Line ${flow.line} • ${flow.shiftCode} Shift • Operator ${flow.operator} • Job ${flow.product} • Target ${fmt(target,2)} • Mandrel ${mandrel}” • S-Wrap ${fmt(flow.swrap,1)}. Start the line? Reply yes or no.`,
    `Line ${flow.line} • Turno ${flow.shiftCode} • Operador ${flow.operator} • Trabajo ${flow.product} • Target ${fmt(target,2)} • Mandrel ${mandrel}” • S-Wrap ${fmt(flow.swrap,1)}. ¿Empiezo la línea? Responde sí o no.`,
    `Line ${flow.line} • Quart ${flow.shiftCode} • ${flow.product} • S-Wrap ${fmt(flow.swrap,1)}. Confirmer ?`
  );
}
function handleStartLineChatWorkflow(text){
  if(!chatWorkflow||chatWorkflow.type!=='start-line')return null;
  const q=normalizeKnowledgeQuery(text),flow=chatWorkflow;
  if(/\b(cancel|cancelar|cancela|no iniciar|stop)\b/.test(q)&&flow.stage!=='confirm'){
    chatWorkflow=null;saveChatWorkflow();return {kind:'info',message:chatLang('Line startup cancelled.','Inicio de línea cancelado.','Démarrage annulé.')};
  }
  // The shift is fixed by plant calendar/time. Refresh it in case the workflow crossed 07:00/19:00.
  const sched=scheduledShiftInfo();flow.shiftCode=sched?.code||flow.shiftCode;flow.shiftWorkDate=sched?.workDate||flow.shiftWorkDate;flow.shiftType=sched?.type||flow.shiftType;
  if(flow.stage==='operator'){
    const check=validateOperatorName(text);if(!check.ok)return {kind:'info',message:chatLang('Enter your operator name, for example Jose Esquivel.','Escribe tu nombre de operador, por ejemplo José Esquivel.','Entrez le nom de l’opérateur.')};
    flow.operator=check.name;flow.stage='product';saveChatWorkflow();
    return {kind:'info',message:chatLang(`Thanks, ${operatorFirstNameFrom(check.name)}. What job/product are you running? Example: 6.35/43.`,`Gracias, ${operatorFirstNameFrom(check.name)}. ¿Qué trabajo/producto vas a correr? Ejemplo: 6.35/43.`,`Quel produit ?`)};
  }
  if(flow.stage==='product'){
    const product=normalizeProduct(text);const target=targetFromProduct(product);
    if(!product||!positive(target))return {kind:'info',message:chatLang('I need a valid sheet type, for example 6.35/43.','Necesito un sheet type válido, por ejemplo 6.35/43.','Entrez un produit valide.')};
    flow.product=product;flow.targetBW=target;flow.mandrel=automaticMandrelForProduct(product)||DEFAULT_MANDREL;flow.stage='swrap';saveChatWorkflow();
    return {kind:'info',message:chatLang(`I found Target ${fmt(target,2)} and ${flow.mandrel}” mandrel. What is the current S-Wrap?`,`Detecté Target ${fmt(target,2)} y mandrel ${flow.mandrel}”. ¿Cuál es el S-Wrap actual?`,`Quel est le S-Wrap actuel ?`)};
  }
  if(flow.stage==='swrap'){
    const vals=numbers(text).filter(v=>positive(v)),v=vals[0];if(!positive(v))return {kind:'info',message:chatLang('Enter the current S-Wrap, for example 170.','Escribe el S-Wrap actual, por ejemplo 170.','Entrez le S-Wrap actuel.')};
    flow.swrap=clampSWrap(v);flow.stage='confirm';saveChatWorkflow();return {kind:'info',title:chatLang('Confirm startup','Confirma inicio','Confirmer'),message:startLineWorkflowSummary(flow)};
  }
  if(flow.stage==='confirm'){
    const yes=/^(yes|y|si|sí|correcto|ok|okay|dale|start|empieza|inicia)\b/.test(q),no=/^(no|cancel|cancelar|cancela)\b/.test(q);
    if(!yes&&!no)return {kind:'info',message:chatLang('Reply yes to start the line or no to cancel.','Responde sí para empezar la línea o no para cancelar.','Oui ou non ?')};
    if(no){chatWorkflow=null;saveChatWorkflow();return {kind:'info',message:chatLang('Line startup cancelled.','Inicio de línea cancelado.','Démarrage annulé.')};}
    const data={...flow};chatWorkflow=null;saveChatWorkflow();
    const ok=commitStartShift(data.product,data.line,data.swrap,data.language,data.operator);
    return ok===false?{kind:'error',message:chatLang('I could not start the line. Check the startup information.','No pude iniciar la línea. Revisa los datos de inicio.','Impossible de démarrer la ligne.')}:{kind:'result',title:`Line ${data.line} — ${data.shiftCode} Shift`,message:chatLang(`Line ${data.line} is running ${data.product} at S-Wrap ${fmt(data.swrap,1)}. Production calculations are now unlocked.`,`Line ${data.line} está corriendo ${data.product} a S-Wrap ${fmt(data.swrap,1)}. Los cálculos de producción ya están habilitados.`,`Line démarrée.`)};
  }
  return null;
}
function operatorFirstNameFrom(name){const v=String(name||'').trim();return v?v.split(/\s+/)[0]:'';}
function chatLang(en,es,fr){return state.language==='es'?es:state.language==='fr'?fr:en;}
function targetFromChatProduct(product){
  const match=String(product||'').match(/\d+(?:\.\d+)?/);
  return match?Number(match[0]):null;
}
function detectChatChangeover(text){
  const lower=String(text||'').toLowerCase();
  if(!/(cambiar|cambio|cámbiame|cambiame|change|switch|changeover|changer)/.test(lower)) return null;
  const exact=lower.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?:\s*(lam))?/i);
  if(exact){
    const raw=`${exact[1]}/${exact[2]}${exact[3]?' LAM':''}`.toUpperCase();
    const found=(typeof SHEET_TYPES!=='undefined'?SHEET_TYPES:[]).find(item=>item.replace(/\s+/g,'').toUpperCase()===raw.replace(/\s+/g,''));
    return {product:found||raw,target:Number(exact[1]),exact:true};
  }
  const values=numbers(lower);
  const target=values.find(value=>value>3&&value<20);
  if(!target) return null;
  const prefix=String(target);
  const matches=(typeof SHEET_TYPES!=='undefined'?SHEET_TYPES:[]).filter(item=>Math.abs(targetFromChatProduct(item)-target)<0.001);
  return {product:matches.length===1?matches[0]:prefix,target,exact:matches.length===1,matches};
}
function comparableLearningForChat({product,target,mandrel,extruder,formulaSuggestion}){
  const records=Array.isArray(state.learningEngine?.records)?state.learningEngine.records:[];
  const productUpper=String(product||'').trim().toUpperCase();
  const family=String(target);
  const matched=records.filter(record=>{
    if(mandrel&&Number(record.mandrel||48)!==Number(mandrel)) return false;
    if(extruder&&Number(record.extruder||0)!==Number(extruder)) return false;
    const recordProduct=String(record.product||'').toUpperCase();
    const exactProduct=productUpper.includes('/');
    if(exactProduct && recordProduct!==productUpper) return false;
    if(!exactProduct && !(recordProduct.startsWith(family+'/')||Math.abs(Number(record.targetBW)-Number(target))<0.01)) return false;
    return Number.isFinite(Number(record.correction));
  }).slice(-100);
  const count=matched.length;
  if(!count){const rawLearnedSuggestion=Math.round(formulaSuggestion);return {count:0,correction:0,confidence:0,successRate:0,spread:0,active:false,rawLearnedSuggestion,learnedSuggestion:clampSWrap(rawLearnedSuggestion)};}
  let weighted=0,totalWeight=0;
  matched.forEach((record,index)=>{
    const recencyWeight=.35+.65*((index+1)/count);
    const successWeight=record.success?1:.65;
    const weight=recencyWeight*successWeight;
    weighted+=Number(record.correction)*weight;
    totalWeight+=weight;
  });
  const correction=weighted/totalWeight;
  const variance=matched.reduce((sum,r)=>sum+Math.pow(Number(r.correction)-correction,2),0)/count;
  const spread=Math.sqrt(variance);
  const confidence=Math.round(100*Math.min(1,count/30)*Math.max(0,1-spread/5));
  const successRate=Math.round(100*matched.filter(r=>r.success).length/count);
  const active=count>=5;
  const rawLearnedSuggestion=Math.round(formulaSuggestion+(active?correction:0));
  return {count,correction:Number(correction.toFixed(1)),confidence,successRate,spread:Number(spread.toFixed(1)),active,minimumRequired:5,rawLearnedSuggestion,learnedSuggestion:clampSWrap(rawLearnedSuggestion),limitReached:rawLearnedSuggestion>MAX_SWRAP_SPEED};
}
function latestCompletedBWContext(){
  const activeShiftId=state.activeShift?.id||null;
  const activeRunId=state.activeShift?.runId||null;
  let cut=state.lastCompletedCut;
  if(cut&&positive(Number(cut.averageBW))){
    const age=Date.now()-new Date(cut.time||0).getTime();
    const sameShift=!activeShiftId||!cut.shiftId||String(cut.shiftId)===String(activeShiftId);
    if(age<=MAX_AUTO_CONTEXT_AGE_MS&&sameShift) return {...cut,source:'last-completed-cut',ageMs:age};
  }
  sanitizeTrendHistory();
  const candidates=state.bwTrendHistory.filter(item=>{
    if(!positive(Number(item.bw))) return false;
    if(activeShiftId&&item.shiftId&&String(item.shiftId)!==String(activeShiftId)) return false;
    return true;
  });
  const recent=candidates[candidates.length-1];
  if(!recent) return null;
  const age=Date.now()-new Date(recent.time||0).getTime();
  if(age>MAX_AUTO_CONTEXT_AGE_MS) return null;
  return {averageBW:Number(recent.bw),product:recent.product||'',mandrel:Number(recent.mandrel||48),extruder:Number(recent.extruder||0),shiftId:recent.shiftId||null,runId:recent.runId||null,time:recent.time,source:'trend-history',ageMs:age};
}
function currentSWrapForChat(){
  // IMPORTANT: do not pass `positive` directly to Array.find(). Array.find
  // supplies (value, index, array), while positive() validates every argument.
  // That made a valid screen value look invalid and forced the chat to ask again.
  const screen=Number($('bw-current-swrap')?.value);
  const shift=Number(state.activeShift?.currentSWrap);
  const run=state.activeShift?.runs?.find(item=>item.id===state.activeShift?.runId);
  const runSpeed=Number(run?.swrap);
  const stored=Number(state.currentSWrap);
  const persisted=Number(lineGet('viejitoCurrentSWrap'));
  const found=[screen,shift,runSpeed,stored,persisted].find(value=>positive(Number(value)))||null;
  return positive(found)?clampSWrap(found):null;
}

function sharedOperationalContextForChat(){
  // One source of truth shared by the main calculator and the chat.
  const swrap=currentSWrapForChat();
  const completed=latestCompletedBWContext();
  const liveAverage=Number($('bw-result')?.dataset?.averageBw || $('bw-result')?.dataset?.value || 0);
  const savedCut=(()=>{try{return JSON.parse(lineGet(LAST_COMPLETED_CUT_KEY,'null')||'null');}catch(_){return null;}})();
  const averageBW=positive(Number(completed?.averageBW))
    ? Number(completed.averageBW)
    : positive(liveAverage)
      ? liveAverage
      : positive(Number(savedCut?.averageBW))
        ? Number(savedCut.averageBW)
        : null;
  const cut=completed || (positive(Number(savedCut?.averageBW)) ? {...savedCut,source:'persistent-completed-cut',ageMs:Date.now()-new Date(savedCut.time||0).getTime()} : null);
  return {currentSWrap:swrap,averageBW,cut};
}
function formatContextAge(ageMs){
  const minutes=Math.max(0,Math.round(Number(ageMs||0)/60000));
  if(minutes<2) return chatLang('just now','hace un momento','à l’instant');
  if(minutes<60) return chatLang(`${minutes} minutes ago`,`hace ${minutes} minutos`,`il y a ${minutes} minutes`);
  const hours=Math.round(minutes/60);
  return chatLang(`${hours} hour(s) ago`,`hace ${hours} hora(s)`,`il y a ${hours} heure(s)`);
}
function buildAutomaticChangeoverResponse(flow,actual,contextInfo){
  const optimizer=buildChatChangeoverRecommendation(flow,actual);
  addHistory('Chat S-Wrap',`${flow.product} • Auto BW ${actual} • Target ${flow.target} • ${flow.currentSWrap} → ${optimizer.suggestedSWrap} • ${optimizer.learning.count} learned`);
  return {kind:'result',title:`${chatLang('Change to','Cambiar a','Changer à')} ${flow.product}`,message:operatorSWrapInstruction(optimizer),optimizer,product:flow.product};
}

function buildChatChangeoverRecommendation(flow,actualBW){
  const target=Number(flow.target),currentSWrap=Number(flow.currentSWrap),actual=Number(actualBW);
  if(!positive(target,currentSWrap,actual)) throw new Error(t('invalidNumbers'));
  const rawFormulaSuggestion=Math.round(currentSWrap*actual/target);
  const formulaSuggestion=clampSWrap(rawFormulaSuggestion);
  const context=currentProcessContext();
  const learning=comparableLearningForChat({product:flow.product,target,mandrel:context.mandrel,extruder:context.extruder,formulaSuggestion});
  const suggestedSWrap=clampSWrap(learning.active?learning.learnedSuggestion:formulaSuggestion);
  const rawDifference=actual-target;
  const difference=Number(rawDifference.toFixed(2));
  const absoluteDifference=Math.abs(rawDifference);
  const level=absoluteDifference<=.17?'green':absoluteDifference<.25?'yellow':'red';
  const adjustment=Number((suggestedSWrap-currentSWrap).toFixed(1));
  const direction=adjustment<0?'decrease':adjustment>0?'increase':'hold';
  return {actualBW:actual,targetBW:target,difference,absoluteDifference,level,suggestAdjustment:absoluteDifference>.17,currentSWrap,formulaSuggestion,rawFormulaSuggestion,suggestedSWrap,adjustment,direction,limitReached:rawFormulaSuggestion>MAX_SWRAP_SPEED||Number(learning.rawLearnedSuggestion)>MAX_SWRAP_SPEED,maxSWrap:MAX_SWRAP_SPEED,learning,greenTolerance:.17,warningTolerance:.25};
}
function handleChangeoverChat(text){
  const request=detectChatChangeover(text);
  if(request||chatWorkflow?.type==='changeover-advice'){const gate=activeShiftChatGate();if(gate)return gate;}
  if(request){
    const sharedContext=sharedOperationalContextForChat();
    const detectedSWrap=sharedContext.currentSWrap;
    const latestCut=sharedContext.cut;
    const detectedAverageBW=sharedContext.averageBW;
    const options=request.matches?.length>1?chatLang(` I found ${request.matches.join(', ')}; I will use target ${request.target.toFixed(2)} unless you name the full sheet type.`,` Encontré ${request.matches.join(', ')}; usaré target ${request.target.toFixed(2)} a menos que escribas el sheet type completo.`,` J’ai trouvé ${request.matches.join(', ')}; j’utiliserai la cible ${request.target.toFixed(2)} sauf si vous indiquez le type complet.`):'';
    if(positive(detectedSWrap)&&positive(Number(detectedAverageBW))){
      chatWorkflow=null;saveChatWorkflow();
      return buildAutomaticChangeoverResponse({type:'changeover-advice',product:request.product,target:request.target,matches:request.matches||[],currentSWrap:detectedSWrap},Number(detectedAverageBW),latestCut);
    }
    const stage=positive(detectedSWrap)?'actual-bw':'swrap';
    chatWorkflow={type:'changeover-advice',stage,product:request.product,target:request.target,matches:request.matches||[],currentSWrap:positive(detectedSWrap)?detectedSWrap:null,startedAt:new Date().toISOString()};
    saveChatWorkflow();
    if(stage==='actual-bw'){
      return {kind:'info',title:chatLang('Basis Weight needed','Falta el Basis Weight','Basis Weight requis'),message:chatLang(`Target detected: ${request.target.toFixed(2)}.${options} I found your current S-Wrap at ${fmt(detectedSWrap,1)}, but I do not have a recent completed average BW. What was the last complete average BW?`,`Target detectado: ${request.target.toFixed(2)}.${options} Encontré tu S-Wrap actual en ${fmt(detectedSWrap,1)}, pero no tengo un BW promedio completo reciente. ¿Cuál fue el último BW promedio completo?`,`Cible détectée : ${request.target.toFixed(2)}.${options} J’ai trouvé le S-Wrap actuel à ${fmt(detectedSWrap,1)}, mais aucun BW moyen complet récent. Quel était le dernier BW moyen complet ?`)};
    }
    return {kind:'info',title:chatLang('Changeover assistant','Asistente de cambio','Assistant de changement'),message:chatLang(`Target detected: ${request.target.toFixed(2)}.${options} I could not detect the current S-Wrap. What is your current S-Wrap speed?`,`Target detectado: ${request.target.toFixed(2)}.${options} No pude detectar el S-Wrap actual. ¿A qué velocidad está tu S-Wrap?`,`Cible détectée : ${request.target.toFixed(2)}.${options} Je n’ai pas pu détecter le S-Wrap actuel. Quelle est sa vitesse ?`)};
  }
  if(!chatWorkflow||chatWorkflow.type!=='changeover-advice') return null;
  const vals=numbers(text);
  if(/\b(cancel|cancelar|cancela|annuler)\b/i.test(text)){
    chatWorkflow=null;saveChatWorkflow();
    return {kind:'info',title:chatLang('Cancelled','Cancelado','Annulé'),message:chatLang('The changeover calculation was cancelled.','Se canceló el cálculo del cambio de producto.','Le calcul du changement a été annulé.')};
  }
  if(chatWorkflow.stage==='swrap'){
    const speed=vals.find(v=>v>=15&&v<=400);
    if(!speed) return {kind:'info',title:chatLang('Current S-Wrap','S-Wrap actual','S-Wrap actuel'),message:chatLang('Enter the current S-Wrap speed, for example 150.','Escribe la velocidad actual del S-Wrap, por ejemplo 150.','Entrez la vitesse actuelle du S-Wrap, par exemple 150.')};
    chatWorkflow.currentSWrap=speed;chatWorkflow.stage='actual-bw';saveChatWorkflow();
    return {kind:'info',title:chatLang('Basis Weight needed','Falta el Basis Weight','Basis Weight requis'),message:chatLang(`Current S-Wrap saved: ${speed}. What is your actual Basis Weight now?`,`S-Wrap actual guardado: ${speed}. ¿Cuál es tu Basis Weight actual?`,`S-Wrap actuel enregistré : ${speed}. Quel est votre Basis Weight actuel ?`)};
  }
  if(chatWorkflow.stage==='actual-bw'){
    const actual=vals.find(v=>v>3&&v<20);
    if(!actual) return {kind:'info',title:'Basis Weight',message:chatLang('Enter the actual BW, for example 6.25.','Escribe el BW actual, por ejemplo 6.25.','Entrez le BW actuel, par exemple 6.25.')};
    try{
      const flow={...chatWorkflow};
      const optimizer=buildChatChangeoverRecommendation(flow,actual);
      chatWorkflow=null;saveChatWorkflow();
      addHistory('Chat S-Wrap',`${flow.product} • Actual BW ${actual} • Target ${flow.target} • ${flow.currentSWrap} → ${optimizer.suggestedSWrap} • ${optimizer.learning.count} learned`);
      return {kind:'result',title:`${chatLang('Change to','Cambiar a','Changer à')} ${flow.product}`,message:operatorSWrapInstruction(optimizer),optimizer,product:flow.product};
    }catch(error){chatWorkflow=null;saveChatWorkflow();return {kind:'error',message:error.message};}
  }
  return null;
}



function smartChatBWPair(text){
  const raw=String(text||'');
  if(/[a-záéíóú]/i.test(raw.replace(/\b(lb|lbs|ft|feet|pie|pies|peso|weight|length|largo)\b/gi,''))) return null;
  const vals=numbers(raw);
  if(vals.length!==2)return null;
  const gate=activeShiftChatGate();if(gate)return gate;
  let weight=null,length=null;
  const a=vals[0],b=vals[1];
  // Explicit labels always win.
  const wm=raw.match(/(\d+(?:[.,]\d+)?)\s*(?:lb|lbs|pounds?)/i)||raw.match(/(?:peso|weight)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
  const fm=raw.match(/(\d+(?:[.,]\d+)?)\s*(?:ft|feet|pies?)/i)||raw.match(/(?:length|largo|pies?|ft)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
  if(wm)weight=Number(wm[1].replace(',','.')); if(fm)length=Number(fm[1].replace(',','.'));
  if(!weight&&!length){
    const normalWeight=v=>v>=300&&v<=1000;
    const obviousFeet=v=>v>2000;
    if(normalWeight(a)&&obviousFeet(b)){weight=a;length=b;}
    else if(normalWeight(b)&&obviousFeet(a)){weight=b;length=a;}
    else if(a>=1000&&a<=2000&&b>=1000&&b<=2000){
      return {kind:'question',title:state.language==='es'?'Necesito confirmar':'Need clarification',message:state.language==='es'?`Veo ${fmt(a,0)} y ${fmt(b,0)}. ¿Cuál es el peso del rollo y cuál es la longitud en pies?`:`I see ${fmt(a,0)} and ${fmt(b,0)}. Which one is roll weight and which one is length in feet?`};
    }
  }
  if(!positive(weight,length))return null;
  try{
    const bw=calculateBW(weight,length,state.mandrel||DEFAULT_MANDREL);
    return {kind:'result',title:'Basis Weight',message:state.language==='es'?`${fmt(weight,0)} lb × ${fmt(length,0)} ft = ${fmt(bw,3)} BW`:`${fmt(weight,0)} lb × ${fmt(length,0)} ft = ${fmt(bw,3)} BW`};
  }catch(_){return null;}
}


function requestedLineNumber(text){
  const q=String(text||'').toLowerCase();
  const m=q.match(/\b(?:line|línea|linea|extruder|extrusor|ext)\s*#?\s*(1|2|3|4|one|two|three|four|uno|una|dos|tres|cuatro)\b/i);
  if(!m)return null;
  const map={one:1,uno:1,una:1,two:2,dos:2,three:3,tres:3,four:4,cuatro:4};
  return Number(m[1])||map[m[1].toLowerCase()]||null;
}
function getLineJSON(base,line,fallback=null){
  const raw=localStorage.getItem(`${base}::line${line}`);
  if(raw==null)return fallback;
  try{return JSON.parse(raw)}catch(_){return fallback}
}
function getLineText(base,line,fallback=''){
  return localStorage.getItem(`${base}::line${line}`) ?? fallback;
}
function lineOperationalSnapshot(line){
  const shift=getLineJSON(SHIFT_KEY,line,null);
  const last=getLineJSON(LAST_COMPLETED_CUT_KEY,line,null);
  const records=getLineJSON('viejitoMachineLearningV3',line,[])||[];
  const trend=getLineJSON(activeTrendHistoryKey(),line,[])||[];
  const baseRunning=!!(shift && (shift.status==='running'||shift.running===true||shift.active===true||shift.startedAt||shift.startTime) && !shift.endedAt && !shift.endTime);
  const schedNow=scheduledShiftInfo(),shiftSched=shift?.shiftCode?{code:String(shift.shiftCode),workDate:String(shift.shiftWorkDate||'')}:scheduledShiftInfo(new Date(shift?.startedAt||shift?.startTime||0));
  const running=!!(baseRunning&&schedNow&&shiftSched&&String(shiftSched.code||'')===String(schedNow.code||'')&&String(shiftSched.workDate||'')===String(schedNow.workDate||''));
  const product=(shift?.product||shift?.runs?.find?.(r=>r.id===shift.runId)?.product||last?.product||getLineText('viejitoProduct',line,'')||'—');
  const sw=Number(shift?.currentSWrap ?? last?.currentSWrap ?? getLineText('viejitoCurrentSWrap',line,''));
  const target=Number(last?.targetBW ?? getLineText('viejitoTargetBW',line,''));
  const recentCuts=[];
  // Trend entries are the canonical completed-cut source in current versions.
  // Adaptive completed_cut records mirror those same cuts, so mixing both sources would
  // double-count sheet-balance streaks. Use learning records only as a legacy fallback.
  const trendDual=trend.filter(r=>Number.isFinite(Number(r?.winder1))&&Number.isFinite(Number(r?.winder2)));
  const sourceRows=trendDual.length?trendDual:records;
  for(const r of sourceRows){
    const w1=Number(r?.winder1),w2=Number(r?.winder2),avg=Number(r?.averageBW??r?.finalBW??r?.bw);
    if(Number.isFinite(w1)&&Number.isFinite(w2))recentCuts.push({winder1:w1,winder2:w2,averageBW:avg,time:r?.time||r?.timestamp||r?.completedAt||'',product:r?.product,runId:r?.runId,shiftId:r?.shiftId,shiftCode:r?.shiftCode,shiftWorkDate:r?.shiftWorkDate,operator:r?.operator,targetBW:r?.targetBW,currentSWrap:r?.currentSWrap});
  }
  if(last&&Number.isFinite(Number(last.winder1))&&Number.isFinite(Number(last.winder2))){
    const sig=`${last.time||''}|${last.winder1}|${last.winder2}`;
    if(!recentCuts.some(r=>`${r.time||''}|${r.winder1}|${r.winder2}`===sig))recentCuts.push(last);
  }
  return {line,shift,last,records,trend,running,product,swrap:sw,target,recentCuts:recentCuts.slice(-20)};
}
function sheetBalanceWatch(cuts){
  // Line-based streak: it intentionally survives product/changeover boundaries.
  // A balanced cut resets the incident. If the heavy side flips, the old streak ends
  // and a new streak begins on the opposite side.
  const rows=(cuts||[])
    .map(c=>({...c,balance:analyzeDieBalance(c.winder1,c.winder2)}))
    .filter(c=>Number.isFinite(Number(c.winder1))&&Number.isFinite(Number(c.winder2)))
    .sort((a,b)=>new Date(a.time||0)-new Date(b.time||0));
  const last=rows[rows.length-1];
  if(!last||last.balance.level==='balanced')return null;
  const side=last.balance.heavier,recentSame=[];
  let flipped=false,previous=null;
  for(let i=rows.length-1;i>=0;i--){
    const row=rows[i];
    if(row.balance.level==='balanced')break;
    if(row.balance.heavier!==side){flipped=true;previous=row;break;}
    recentSame.unshift(row);
  }
  const streak=recentSame.length;
  const firstDiff=Number(recentSame[0]?.balance?.difference)||0;
  const lastDiff=Number(recentSame[recentSame.length-1]?.balance?.difference)||0;
  const improving=streak>=2&&lastDiff<firstDiff-0.015;
  const worsening=streak>=2&&lastDiff>firstDiff+0.015;
  return {last,side,streak,flipped,improving,worsening,previous,recentSame,leadReview:streak>=4,persistent:streak>=3};
}
let pendingLeadPrompt=null;
function sheetBalanceIncidentKey(watch,line=ACTIVE_LINE){
  const start=watch?.recentSame?.[0]?.time||watch?.last?.time||'';
  return `${Number(line)}|${watch?.side||''}|${start}`;
}
function leadEventForIncident(incidentKey,type=null){
  const rows=qualityEventsForLine(ACTIVE_LINE);
  return [...rows].reverse().find(e=>e.incidentKey===incidentKey&&(!type||e.type===type))||null;
}
function openLeadConfirmationPrompt(watch){
  const dialog=$('lead-confirm-dialog');if(!dialog||!watch)return;
  const incidentKey=sheetBalanceIncidentKey(watch),side=watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet';
  if(leadEventForIncident(incidentKey,LEAD_PROMPT_EVENT))return;
  pendingLeadPrompt={incidentKey,side:watch.side,streak:watch.streak,difference:Number(watch.last?.balance?.difference)||0,products:[...new Set((watch.recentSame||[]).map(r=>r.product).filter(Boolean))]};
  if($('lead-confirm-message'))$('lead-confirm-message').textContent=state.language==='es'
    ?`${side} sigue pesado después de ${watch.streak} cortes consecutivos. Viejito pidió avisar al Lead en el tercer corte. ¿Ya avisaste al Lead?`
    :`${side} is still heavier after ${watch.streak} consecutive cuts. Viejito asked for Lead notification on the third cut. Did you notify your Lead?`;
  dialog.classList.remove('hidden');dialog.setAttribute('aria-hidden','false');
}
function saveLeadConfirmation(status){
  if(!pendingLeadPrompt)return;
  const p={...pendingLeadPrompt},isBW=p.kind==='bw';
  recordQualityEvent(isBW?'bw_lead_confirmation':'lead_confirmation',{incidentKey:p.incidentKey,status:status==='yes'?'yes':'no',streak:p.streak,heavySide:p.side||null,balanceDifference:p.difference??null,bwDirection:p.bwDirection||null,bwDelta:p.bwDelta??null,products:p.products,issue:isBW?'average_bw':'sheet_balance'});
  const dialog=$('lead-confirm-dialog');if(dialog){dialog.classList.add('hidden');dialog.setAttribute('aria-hidden','true');}
  pendingLeadPrompt=null;
  showToast(status==='yes'
    ?(state.language==='es'?'Confirmado: el Lead fue avisado/consultado.':state.language==='fr'?'Confirmé : le Lead a été avisé/consulté.':'Lead notification/consultation confirmed.')
    :(state.language==='es'?'Quedó registrado que todavía no se ha confirmado el aviso al Lead. Por favor avísale ahora.':state.language==='fr'?'La notification au Lead n’est pas encore confirmée. Veuillez l’aviser maintenant.':'Lead notification is not confirmed yet. Please notify the Lead now.'));
}
function handleSheetBalanceEscalationAfterCut(){
  const cuts=(state.bwTrendHistory||[]).filter(r=>Number.isFinite(Number(r?.winder1))&&Number.isFinite(Number(r?.winder2)));
  const watch=sheetBalanceWatch(cuts);if(!watch)return;
  const incidentKey=sheetBalanceIncidentKey(watch),side=watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet';
  if(watch.streak>=3&&!leadEventForIncident(incidentKey,'lead_notification_requested')){
    recordQualityEvent('lead_notification_requested',{incidentKey,streak:watch.streak,heavySide:watch.side,balanceDifference:Number(watch.last?.balance?.difference)||0,products:[...new Set((watch.recentSame||[]).map(r=>r.product).filter(Boolean))]});
    showToast(state.language==='es'?`⚠️ ${side} lleva 3 cortes consecutivos pesado. Avisa a tu Lead y continúa vigilando el balance.`:`⚠️ ${side} has been heavy for 3 consecutive cuts. Notify your Lead and keep monitoring the balance.`);
  }
  if(watch.streak>=4&&!leadEventForIncident(incidentKey,LEAD_PROMPT_EVENT))openLeadConfirmationPrompt(watch);
}
function averageBWFailureWatch(cuts){
  const rows=(cuts||[]).map(c=>({...c,average:Number(c?.averageBW??c?.bw),target:Number(c?.targetBW)}))
    .filter(c=>Number.isFinite(c.average)&&Number.isFinite(c.target))
    .sort((a,b)=>new Date(a.time||0)-new Date(b.time||0));
  const last=rows[rows.length-1];
  if(!last||Math.abs(last.average-last.target)<0.25)return null;
  const recent=[];
  for(let i=rows.length-1;i>=0;i--){
    const row=rows[i],delta=row.average-row.target;
    if(Math.abs(delta)<0.25)break;
    recent.unshift({...row,delta});
  }
  if(!recent.length)return null;
  const latest=recent[recent.length-1];
  return {last:latest,streak:recent.length,recent,direction:latest.delta>0?'heavy':'light'};
}
function averageBWIncidentKey(watch,line=ACTIVE_LINE){
  const start=watch?.recent?.[0]?.time||watch?.last?.time||'';
  return `${Number(line)}|average-bw|${start}`;
}
function openAverageBWLeadPrompt(watch){
  const dialog=$('lead-confirm-dialog');if(!dialog||!watch)return;
  const incidentKey=averageBWIncidentKey(watch);
  if(leadEventForIncident(incidentKey,BW_LEAD_PROMPT_EVENT))return;
  pendingLeadPrompt={kind:'bw',incidentKey,streak:watch.streak,bwDirection:watch.direction,bwDelta:Number(watch.last?.delta)||0,products:[...new Set((watch.recent||[]).map(r=>r.product).filter(Boolean))]};
  const direction=watch.direction==='heavy'?chatLang('heavy','pesado','lourd'):chatLang('light','liviano','léger');
  if($('lead-confirm-eyebrow'))$('lead-confirm-eyebrow').textContent=chatLang('AVERAGE BW ESCALATION','ESCALACIÓN DE BW PROMEDIO','ESCALADE BW MOYEN');
  if($('lead-confirm-title'))$('lead-confirm-title').textContent=chatLang('Lead consultation check','Confirmación de consulta al Lead','Confirmation de consultation du Lead');
  if($('lead-confirm-message'))$('lead-confirm-message').textContent=chatLang(
    `Average BW has been out of range for ${watch.streak} consecutive completed cuts (${direction}). Did you notify or consult your Lead?`,
    `El BW promedio lleva ${watch.streak} cortes completos consecutivos fuera de rango (${direction}). ¿Ya avisaste o consultaste al Lead?`,
    `Le BW moyen est hors plage depuis ${watch.streak} coupes complètes consécutives (${direction}). Avez-vous avisé ou consulté le Lead?`
  );
  if($('lead-confirm-yes'))$('lead-confirm-yes').textContent=chatLang('Yes — Lead consulted','Sí — Lead consultado','Oui — Lead consulté');
  if($('lead-confirm-no'))$('lead-confirm-no').textContent=chatLang('No — not yet','No — todavía no','Non — pas encore');
  if($('lead-confirm-note'))$('lead-confirm-note').textContent=chatLang('This check is recorded for follow-up. It is not used to blame the operator.','Esta confirmación queda registrada para seguimiento. No se usa para culpar al operador.','Cette confirmation est enregistrée pour le suivi. Elle ne sert pas à blâmer l’opérateur.');
  dialog.classList.remove('hidden');dialog.setAttribute('aria-hidden','false');
}
function handleAverageBWEscalationAfterCut(){
  const cuts=(state.bwTrendHistory||[]).filter(r=>Number.isFinite(Number(r?.averageBW??r?.bw))&&Number.isFinite(Number(r?.targetBW)));
  const watch=averageBWFailureWatch(cuts);if(!watch||watch.streak<3)return;
  const incidentKey=averageBWIncidentKey(watch);
  if(!leadEventForIncident(incidentKey,'bw_lead_notification_requested')){
    recordQualityEvent('bw_lead_notification_requested',{incidentKey,streak:watch.streak,bwDirection:watch.direction,bwDelta:Number(watch.last?.delta)||0,products:[...new Set((watch.recent||[]).map(r=>r.product).filter(Boolean))],issue:'average_bw'});
  }
  if(!leadEventForIncident(incidentKey,BW_LEAD_PROMPT_EVENT))openAverageBWLeadPrompt(watch);
}
function lineStatusAnswer(line){
  const s=lineOperationalSnapshot(line),es=state.language==='es',fr=state.language==='fr';
  if(!s.running){
    const msg=es?`La línea ${line} no está corriendo. No hay un turno/sesión activa iniciada por el operador.`:fr?`La ligne ${line} ne fonctionne pas actuellement. Aucun quart/session opérateur actif n’est démarré.`:`Line ${line} is not running. No active operator shift/session has been started.`;
    return {kind:'info',title:`Line ${line} — ${es?'NO CORRIENDO':fr?'ARRÊTÉE':'NOT RUNNING'}`,message:msg};
  }
  const last=s.last,parts=[];
  parts.push(es?`Producto ${s.product}.`:fr?`Produit ${s.product}.`:`Product ${s.product}.`);
  if(last){
    const avg=Number(last.averageBW),target=Number(last.targetBW??s.target),diff=Number.isFinite(avg)&&Number.isFinite(target)?avg-target:null;
    parts.push(es?`Último BW ${fmt(avg,3)}; target ${fmt(target,2)}; S-Wrap ${fmt(Number(last.currentSWrap??s.swrap),1)}.`:fr?`Dernier BW ${fmt(avg,3)} ; cible ${fmt(target,2)} ; S-Wrap ${fmt(Number(last.currentSWrap??s.swrap),1)}.`:`Last BW ${fmt(avg,3)}; target ${fmt(target,2)}; S-Wrap ${fmt(Number(last.currentSWrap??s.swrap),1)}.`);
    if(Number.isFinite(diff)){
      const ad=Math.abs(diff),level=ad<=0.17?'green':ad<0.25?'warning':'out';
      parts.push(es?(level==='green'?'BW dentro de rango.':level==='warning'?`BW en WARNING (${diff>=0?'+':''}${fmt(diff,3)}).`:`BW FUERA DE RANGO (${diff>=0?'+':''}${fmt(diff,3)}).`):fr?(level==='green'?'BW dans la plage.':level==='warning'?`BW en ALERTE (${diff>=0?'+':''}${fmt(diff,3)}).`:`BW HORS PLAGE (${diff>=0?'+':''}${fmt(diff,3)}).`):(level==='green'?'BW is in range.':level==='warning'?`BW WARNING (${diff>=0?'+':''}${fmt(diff,3)}).`:`BW OUT OF RANGE (${diff>=0?'+':''}${fmt(diff,3)}).`));
    }
    if(Number.isFinite(Number(last.winder1))&&Number.isFinite(Number(last.winder2))){
      const q1=completedWinderQuality(1,Number(last.winder1),target),q2=completedWinderQuality(2,Number(last.winder2),target);
      if(!q1.pass||!q2.pass){
        parts.push(es?`${q1.side}: ${q1.status} (${fmt(last.winder1,3)}). ${q2.side}: ${q2.status} (${fmt(last.winder2,3)}). El promedio no convierte rollos individuales fuera de rango en PASS.`:fr?`${q1.side}: ${q1.status} (${fmt(last.winder1,3)}). ${q2.side}: ${q2.status} (${fmt(last.winder2,3)}).`:`${q1.side}: ${q1.status} (${fmt(last.winder1,3)}). ${q2.side}: ${q2.status} (${fmt(last.winder2,3)}). A passing average does not make out-of-range individual rolls PASS.`);
      }
      const bal=analyzeDieBalance(last.winder1,last.winder2),copy=dieMoveCopy(bal);
      if(copy)parts.push(`${copy.title}: ${copy.message}`);
      else parts.push(es?'Sheet balance dentro del límite de 0.25 BW.':fr?'Équilibre des sheets dans la limite de 0,25 BW.':'Sheet balance is within the 0.25 BW limit.');
    }
  }
  const watch=sheetBalanceWatch(s.recentCuts);
  if(watch){
    const sideName=watch.side==='top'?'Top Sheet / Winder 2':'Bottom Sheet / Winder 1';
    if(watch.flipped){
      const bolt=watch.side==='top'?'top':'bottom';
      parts.push(es?`👀 Posible sobrecorrección: el desbalance cambió de lado. Creo que te pasaste de fuerte 😅. Ahora ${sideName} está más pesado por ${fmt(watch.last.balance.difference,2)} BW; toca cerrar el ${bolt} die bolt.`:`👀 Possible overcorrection: the imbalance flipped sides. Easy there, Hercules 😅. ${sideName} is now heavier by ${fmt(watch.last.balance.difference,2)} BW; close the ${bolt} die bolt.`);
    }else if(watch.streak>=4){
      parts.push(es?`🚩 Sheet Balance Escalation: ${sideName} lleva ${watch.streak} cortes consecutivos más pesado. En el tercer corte Viejito indicó avisar al Lead; confirma que el Lead fue avisado y continúa revisando la respuesta del ajuste.`:`🚩 Sheet Balance Escalation: ${sideName} has been heavier for ${watch.streak} consecutive cuts. Viejito requested Lead notification on the third cut; confirm the Lead was notified and continue reviewing the adjustment response.`);
    }else if(watch.streak>=3){
      parts.push(es?`⚠️ Sheet Balance persistente: ${sideName} lleva ${watch.streak} cortes consecutivos más pesado. Avisa a tu Lead y continúa verificando el Die Move y la respuesta de la máquina.`:`⚠️ Persistent Sheet Balance: ${sideName} has been heavier for ${watch.streak} consecutive cuts. Notify your Lead and continue verifying the Die Move and machine response.`);
    }else if(watch.improving){
      parts.push(es?'El desbalance está disminuyendo; el Die Move parece estar respondiendo. Sigue monitoreando.':'The imbalance is decreasing; the Die Move appears to be working. Keep monitoring.');
    }
  }
  return {kind:'result',title:`Line ${line} — ${es?'ESTADO ACTUAL':fr?'ÉTAT ACTUEL':'CURRENT STATUS'}`,message:parts.join(' ')};
}

const CHAT_LAST_RECOMMENDATION_KEY='viejitoChatLastRecommendationV1';
function rememberChatRecommendation(response){
  const r=response?.optimizer;
  if(!r||!Number.isFinite(Number(r.suggestedSWrap)))return;
  const product=String(response?.product||response?.title||state.product||'').replace(/^(Change to|Cambiar a|Changer à)\s*/i,'').trim();
  lineSet(CHAT_LAST_RECOMMENDATION_KEY,JSON.stringify({swrap:Number(r.suggestedSWrap),product:product||state.product||'',time:new Date().toISOString()}));
}
function lastChatRecommendation(){
  try{return JSON.parse(lineGet(CHAT_LAST_RECOMMENDATION_KEY,'null')||'null');}catch(_){return null;}
}
function chatWelcome(){
  const first=operatorFirstName();
  const name=first?` ${first}`:'';
  const pools={
    en:[`Hey${name}! Let’s have a good shift. I’m ready to help you on Line ${ACTIVE_LINE}.`,`Hello${name}! Let’s keep Line ${ACTIVE_LINE} running strong. I’m here if you need me.`,`Good to see you${name}. I’m ready to help on Line ${ACTIVE_LINE}.`],
    es:[`¡Hola${name}! Vamos a tener un buen turno. Estoy listo para ayudarte en Line ${ACTIVE_LINE}.`,`¡Qué tal${name}! Vamos con todo en Line ${ACTIVE_LINE}. Aquí estoy para ayudarte.`,`¡Hola${name}! Que sea un buen turno. Estoy pendiente de Line ${ACTIVE_LINE}.`],
    fr:[`Bonjour${name} ! Bon quart de travail. Je suis prêt à vous aider sur Line ${ACTIVE_LINE}.`]
  };
  const list=pools[state.language]||pools.en;
  return {kind:'info',message:list[Math.floor(Math.random()*list.length)]};
}
function ensureChatWelcome(){
  if($('chat-log')?.children?.length)return;
  const welcome=chatWelcome(); bubble('bot',welcome); saveChatMessage('bot',welcome);
}

function conversationalChat(text){
  const q=String(text||'').trim().toLowerCase();
  const first=operatorFirstName();
  if(/^(hi|hello|hey|hola|buenas|buenos días|buenos dias|buenas tardes|buenas noches|salut|bonjour)[!?. ]*$/.test(q)) return chatWelcome();
  if(/(what was my last set|what was my last setting|what did you tell me|last recommendation|última recomendación|ultima recomendacion|qué me dijiste|que me dijiste|cuánto me dijiste|cuanto me dijiste)/.test(q)){
    const last=lastChatRecommendation();
    if(!last)return {kind:'info',message:state.language==='es'?'Todavía no tengo una recomendación reciente guardada para esta línea.':'I do not have a recent recommendation saved for this line yet.'};
    const product=last.product?` ${state.language==='es'?'para':'for'} ${last.product}`:'';
    return {kind:'info',message:state.language==='es'?`La última recomendación fue S-Wrap ${fmt(last.swrap,1)}${product}.`:`Your last recommended S-Wrap was ${fmt(last.swrap,1)}${product}.`};
  }
  if(/^(thanks|thank you|gracias|merci)[!?. ]*$/.test(q))return {kind:'info',message:state.language==='es'?'De nada. Aquí estoy.':state.language==='fr'?`Avec plaisir. Je suis là.`:`You're welcome. I'm here.`};
  if(/(what can you do|qué puedes hacer|que puedes hacer|qué haces|que haces|help me|ayuda)/.test(q))return {kind:'info',title:state.language==='es'?'Puedo ayudarte con la línea':'Line assistant',message:state.language==='es'?`Puedo operar las funciones principales de Viejito desde el chat: BW/Feet/S-Wrap, winders y cortes, estado/tendencia por línea, Changeover, sugerencias preventivas, producción y Adaptive Learning. También tengo un cerebro separado de conocimiento Davis-Standard para proceso/troubleshooting y Process Performance Learning para aprender Primary RPM + Secondary RPM → output/presión, guardar corridas manuales de dos rollos y consultarlas después en el chat. Para cambios ocasionales e intencionales de velocidad, Tools → Speed Change Advisor calcula un starting point coordinado de Primary + Secondary + Secondary Heat usando Last BW y el output real de dos rollos. Para correcciones normales de BW, S-Wrap sigue siendo el control principal. El S-Wrap nunca se recomienda por encima de ${MAX_SWRAP_SPEED}. Settings y borrado de datos siguen protegidos.`:state.language==='fr'?`Je peux calculer BW et pieds, recommander le S-Wrap, revoir les derniers rouleaux, résumer la ligne et utiliser le cerveau Davis-Standard.`:`I can operate Viejito's main functions from chat: BW/Feet/S-Wrap, winders and cuts, per-line status/trend, Changeover, preventive suggestions, production and Adaptive Learning. I also have a separate Davis-Standard knowledge brain for process/troubleshooting and Process Performance Learning that learns Primary RPM + Secondary RPM → output/pressure behavior, stores manual two-roll process records you can query later in chat. For occasional intentional line-speed changes, Tools → Speed Change Advisor calculates a coordinated Primary + Secondary + Secondary Heat starting point from Last BW and actual two-roll output. Routine BW correction still uses S-Wrap first. S-Wrap is never recommended above ${MAX_SWRAP_SPEED}. Settings and destructive data actions remain protected.`};
  if(/(who.*operator|quién.*operador|quien.*operador|operador.*quién|operador.*quien)/.test(q)){
    const op=state.activeShift?.operator||state.operator||'';
    return {kind:'info',message:op?(state.language==='es'?`El operador de Line ${ACTIVE_LINE} es ${op}.`:`Line ${ACTIVE_LINE} operator is ${op}.`):(state.language==='es'?`No hay operador seleccionado para Line ${ACTIVE_LINE}.`:`No operator is selected for Line ${ACTIVE_LINE}.`)};
  }
  if(/(what product|qué producto|que producto|producto.*corriendo|what are we running)/.test(q))return {kind:'info',message:state.product?(state.language==='es'?`Line ${ACTIVE_LINE} está corriendo ${state.product}.`:`Line ${ACTIVE_LINE} is running ${state.product}.`):(state.language==='es'?`Line ${ACTIVE_LINE} no tiene producto activo.`:`Line ${ACTIVE_LINE} has no active product.`)};
  if(/(what mandrel|qué mandrel|que mandrel|mandrel.*usando)/.test(q))return {kind:'info',message:state.language==='es'?`Line ${ACTIVE_LINE} está usando mandrel de ${state.mandrel} pulgadas.`:`Line ${ACTIVE_LINE} is using the ${state.mandrel}-inch mandrel.`};
  if(/^(how are you|how're you|how are you doing|cómo estás|como estas|cómo andas|como andas|qué tal estás|que tal estas)[!?. ]*$/.test(q)){
    const name=first?` ${first}`:'';
    const pools=state.language==='es'?[`Muy bien${name}. Aquí pendiente de Line ${ACTIVE_LINE}. ¿Cómo va tu turno?`,`Todo bien${name}. Listo para ayudarte con Line ${ACTIVE_LINE}.`,`Bien${name} 😄. Aquí estoy contigo en Line ${ACTIVE_LINE}.`]:[`Doing good${name}. I’m here with you on Line ${ACTIVE_LINE}. How’s the shift going?`,`I’m doing well${name}. Ready to help on Line ${ACTIVE_LINE}.`,`Doing good${name} 😄. I’m keeping an eye on Line ${ACTIVE_LINE} with you.`];
    return {kind:'info',message:pools[Math.floor(Math.random()*pools.length)]};
  }
  // V5.32.2 — Natural short follow-up replies. These are intentionally
  // exact/short-message matches so process phrases such as "good quality" are not swallowed.
  if(/^(not bad|not too bad|pretty good|good|great|awesome|doing good|doing okay|doing ok|i'm good|i am good|i'm okay|i am okay|fine|all good|can't complain|cant complain|could be worse|no está mal|no esta mal|muy bien|todo bien|voy bien|vamos bien|pasable|ça va|ca va|pas mal|très bien|tres bien)[!?. ]*$/.test(q)){
    const name=first?` ${first}`:'';
    const pools=state.language==='es'
      ?[`Me alegra${name}. Vamos a mantener Line ${ACTIVE_LINE} tranquila y estable. 👍`,`Eso suena bien${name}. Aquí sigo pendiente por si necesitas algo en Line ${ACTIVE_LINE}.`,`Bien${name} 😄. Que siga así el turno.`]
      :state.language==='fr'
        ?[`Content de l’entendre${name}. Je reste avec vous sur Line ${ACTIVE_LINE}.`,`Très bien${name}. On garde Line ${ACTIVE_LINE} stable. 👍`]
        :[`Glad to hear it${name}. Let’s keep Line ${ACTIVE_LINE} running smooth. 👍`,`Not bad is a win${name} 😄. I’m right here if Line ${ACTIVE_LINE} needs anything.`,`Good${name}. Let’s keep the shift moving in the right direction.`];
    return {kind:'info',message:pools[Math.floor(Math.random()*pools.length)]};
  }
  if(/^(could be better|been better|i've been better|ive been better|tired|i'm tired|im tired|busy|very busy|rough|rough shift|bad|not good|stressful|long shift|long day|exhausted|más o menos|mas o menos|podría estar mejor|podria estar mejor|cansado|cansada|estoy cansado|estoy cansada|ocupado|ocupada|muy ocupado|muy ocupada|pesado|turno pesado|fatigué|fatigue|occupé|occupe|difficile)[!?. ]*$/.test(q)){
    const name=first?` ${first}`:'';
    const pools=state.language==='es'
      ?[`Te entiendo${name}. Aquí estoy para hacerte más fácil lo que pueda en Line ${ACTIVE_LINE}.`,`Turno pesado${name}. Dime qué necesitas de Line ${ACTIVE_LINE} y vamos directo al punto.`,`Entendido${name}. Vamos una cosa a la vez; yo te ayudo con los números de Line ${ACTIVE_LINE}.`]
      :state.language==='fr'
        ?[`Je comprends${name}. Dites-moi ce dont vous avez besoin sur Line ${ACTIVE_LINE}.`,`Courage${name}. Je peux vous aider avec les données de Line ${ACTIVE_LINE}.`]
        :[`I hear you${name}. Tell me what you need on Line ${ACTIVE_LINE} and I’ll keep it simple.`,`Sounds like a long shift${name}. I’m here to help with the numbers on Line ${ACTIVE_LINE}.`,`Got you${name}. Let me take some of the thinking off your plate on Line ${ACTIVE_LINE}.`];
    return {kind:'info',message:pools[Math.floor(Math.random()*pools.length)]};
  }
  if(/^(ok|okay|alright|got it|vale|está bien|esta bien|bueno|perfecto|bien)[!?. ]*$/.test(q))return {kind:'info',message:state.language==='es'?'Perfecto. Aquí sigo pendiente.':'Sounds good. I’m right here if you need me.'};
  if(/^(yes|yeah|yep|si|sí|no|nope)[!?. ]*$/.test(q))return {kind:'info',message:state.language==='es'?'Entendido.':'Got it.'};
  if(/^(bye|goodbye|see you|later|hasta luego|adiós|adios|nos vemos)[!?. ]*$/.test(q))return {kind:'info',message:state.language==='es'?`Nos vemos${first?`, ${first}`:''}. Que tengas buen turno.`:`See you${first?`, ${first}`:''}. Have a good shift.`};
  if(/(what do you think|qué piensas|que piensas|qué opinas|que opinas)/.test(q))return {kind:'info',message:state.language==='es'?'Dime qué quieres que revise y te doy mi mejor respuesta con los datos que tengo de la línea.':'Tell me what you want me to look at and I’ll give you my best answer from the line data I have.'};
  return null;
}


// V5.27 — Davis-Standard Knowledge Brain + chat command bridge.
// Keeps plant calculations deterministic while giving the chat a broad offline
// extrusion-process knowledge base. Dangerous or machine-specific operations
// always defer to the approved plant SOP and equipment manual.
function normalizeKnowledgeQuery(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9/#+.\- ]+/g,' ').replace(/\s+/g,' ').trim();
}
function knowledgeTokens(value){return normalizeKnowledgeQuery(value).split(' ').filter(token=>token.length>2);}
function extrusionSafetyGuard(text){
  const q=normalizeKnowledgeQuery(text);
  const bypass=/\b(bypass|defeat|disable|jump|override|anular|puentear|saltar|desactivar)\b/.test(q)&&/\b(interlock|e stop|estop|safety|guard|lockout|loto|alarma|seguridad)\b/.test(q);
  const hazardous=/\b(remove screw|pull screw|open die|disassemble die|purge procedure|screen change procedure|how to purge|remove screen|quitar tornillo|sacar tornillo|abrir die|desarmar die|procedimiento de purga|cambiar screen)\b/.test(q);
  const gas=/\b(set isobutane|isobutane setting|co2 setting|blowing agent setting|gas setting|ajustar isobutano|setting isobutano|setting co2|ajustar gas)\b/.test(q);
  if(!(bypass||hazardous||gas))return null;
  return {kind:'info',title:chatLang('Safety-controlled task','Tarea controlada por seguridad','Tâche contrôlée par sécurité'),message:chatLang(
    'I can explain the process principle and help diagnose symptoms, but I will not invent or bypass a machine-specific safety procedure. Use the approved SOP/equipment manual and trained-personnel procedure for this task.',
    'Puedo explicarte el principio del proceso y ayudarte a diagnosticar síntomas, pero no voy a inventar ni bypass un procedimiento de seguridad específico de la máquina. Para esta tarea usa el SOP/manual aprobado y el procedimiento para personal entrenado.',
    'Je peux expliquer le principe du procédé, mais cette tâche doit suivre la procédure de sécurité approuvée de la machine.'
  )};
}
function bestKnowledgeMatch(items,text){
  const q=normalizeKnowledgeQuery(text),tokens=new Set(knowledgeTokens(text));
  if(!q||!Array.isArray(items)||!items.length)return null;
  let best=null,bestScore=0;
  for(const item of items){
    let score=0;
    for(const raw of (item.keys||[])){
      const key=normalizeKnowledgeQuery(raw); if(!key)continue;
      if(q===key)score+=12;
      else if(q.includes(key))score+=key.includes(' ')?7:4;
      else{
        const kt=knowledgeTokens(key);
        const overlap=kt.filter(token=>tokens.has(token)).length;
        if(overlap===kt.length&&overlap)score+=Math.min(5,overlap*1.6);
        else if(overlap>=2)score+=overlap;
      }
    }
    if(score>bestScore){best=item;bestScore=score;}
  }
  return best&&bestScore>=4?{item:best,score:bestScore}:null;
}
function extrusionKnowledgeQuery(text){
  const safety=extrusionSafetyGuard(text); if(safety)return safety;
  // Plant-specific extrusion knowledge gets first priority for Primary/Secondary/melt behavior.
  // General equipment/process questions then default to the Davis-Standard knowledge brain.
  const plant=bestKnowledgeMatch(window.PLANT_PROCESS_KNOWLEDGE||[],text);
  const davis=bestKnowledgeMatch(window.DAVIS_STANDARD_KNOWLEDGE||window.EXTRUSION_KNOWLEDGE||[],text);
  const match=plant && (!davis||plant.score>=davis.score)?plant:davis;
  if(!match)return null;
  const lang=state.language==='es'?'es':'en';
  const item=match.item;
  const source=item.source==='plant'?chatLang('Plant process knowledge','Conocimiento de proceso de planta','Connaissance procédé usine'):
    item.source==='plant+davis'?chatLang('Plant + Davis-Standard process knowledge','Conocimiento de planta + Davis-Standard','Connaissance usine + Davis-Standard'):
    chatLang('Davis-Standard knowledge brain','Cerebro de conocimiento Davis-Standard','Cerveau Davis-Standard');
  return {kind:'info',title:item.title?.[lang]||item.title?.en||'Extrusion process',message:item[lang]||item.en,meta:source};
}

// V5.28 — Process Performance Learning + coordinated speed/BW recommendation.
function totalWebWidthForMandrel(mandrel=currentMandrel('bw')){return Number(mandrel)===51?102:96;}
function predictiveBWFromOutput(outputLbHr,swrapSpeed,mandrel=currentMandrel('bw')){
  const output=Number(outputLbHr),speed=Number(swrapSpeed),width=totalWebWidthForMandrel(mandrel);
  if(!positive(output,speed,width))return null;
  return (output*FACTOR_GRAMS_PER_LB*100)/(speed*60*12*width);
}
function predictiveSWrapForBW(outputLbHr,targetBW,mandrel=currentMandrel('bw')){
  const output=Number(outputLbHr),target=Number(targetBW),width=totalWebWidthForMandrel(mandrel);
  if(!positive(output,target,width))return null;
  return (output*FACTOR_GRAMS_PER_LB*100)/(target*60*12*width);
}
function labeledProcessNumber(text,label){
  const raw=String(text||'');
  const patterns={
    primary:/\b(?:primary|primario)\s*(?:rpm)?\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    secondary:/\b(?:secondary|secundario)\s*(?:rpm)?\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    w1:/\b(?:winder\s*1|w1|roll\s*1|rollo\s*1)\s*(?:weight|peso|lb|lbs)?\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    w2:/\b(?:winder\s*2|w2|roll\s*2|rollo\s*2)\s*(?:weight|peso|lb|lbs)?\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    minutes:/\b(?:time|tiempo|run|corrió|corrio)?\s*[:=@-]?\s*(\d+(?:\.\d+)?)\s*(?:min|mins|minutes|minutos)\b/i,
    swrap:/\b(?:s[- ]?wrap|swrap|line speed|velocidad)\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    melt:/\bmelt\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    heat:/\b(?:secondary heat|sec heat|heat secundario)\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    load:/\b(?:motor load|secondary load|load)\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    pressure:/\b(?:primary pressure|pressure primary|primary psi|presi[oó]n (?:del )?primary|presi[oó]n (?:del )?primario)\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i,
    output:/\b(?:output|rate|lbs\/?hr|lb\/?hr|libras por hora)\s*[:=@-]?\s*(\d+(?:\.\d+)?)/i
  };
  const m=raw.match(patterns[label]);return m?Number(m[1]):null;
}
function processLearningOutputMessage(primary,secondary,estimate,requestedSpeed=null){
  const mandrel=currentMandrel('bw'),product=state.activeShift?.product||state.product||'';
  const speeds=[];
  const addSpeed=v=>{v=Number(v);if(positive(v)){v=clampSWrap(v);if(!speeds.some(x=>Math.abs(x-v)<.01))speeds.push(v);}};
  if(positive(requestedSpeed))addSpeed(requestedSpeed);
  else{addSpeed(state.currentSWrap);addSpeed(150);addSpeed(200);}
  const parts=speeds.map(speed=>{
    const bw=predictiveBWFromOutput(estimate.outputLbHr,speed,mandrel);
    return `S-Wrap ${fmt(speed,1)} → BW ${fmt(bw,3)}`;
  });
  const target=Number(state.targetBW)||targetFromProduct(product);
  const rawTargetSpeed=positive(target)?predictiveSWrapForBW(estimate.outputLbHr,target,mandrel):null;
  let targetLine='';
  if(positive(rawTargetSpeed)){
    const capped=clampSWrap(rawTargetSpeed);
    targetLine=chatLang(` Expected S-Wrap for target ${fmt(target,2)}: ${fmt(capped,1)} ft/min${rawTargetSpeed>MAX_SWRAP_SPEED?' (MAX 228 reached)':''}.`,` S-Wrap esperado para target ${fmt(target,2)}: ${fmt(capped,1)} ft/min${rawTargetSpeed>MAX_SWRAP_SPEED?' (límite MAX 228)':''}.`,` S-Wrap attendu : ${fmt(capped,1)}.`);
  }
  const scope=estimate.scope==='product'&&product?` • ${product}`:'';
  const cautions=[];
  if(Number(secondary)>12.5)cautions.push(chatLang('Plant caution: Secondary above ~12.5 RPM can generate heavy friction/shear heat and challenge cooling.','Precaución de planta: Secondary arriba de ~12.5 RPM puede generar mucho friction/shear heat y superar la capacidad de cooling.','Attention usine : Secondary > ~12,5 RPM peut augmenter fortement le friction heat.'));
  if(Number(primary)<60||Number(primary)>128)cautions.push(chatLang('Primary is outside the usual plant production range of 60–128 RPM.','Primary está fuera del rango normal de producción de planta de 60–128 RPM.','Primary hors de la plage usine habituelle 60–128 RPM.'));
  if(Number(secondary)<5||Number(secondary)>13)cautions.push(chatLang('Secondary is outside the usual plant production range of 5–13 RPM.','Secondary está fuera del rango normal de producción de planta de 5–13 RPM.','Secondary hors de la plage usine habituelle 5–13 RPM.'));
  const cautionText=cautions.length?` ${cautions.join(' ')}`:'';
  const learningScope=estimate.scope==='product'?chatLang('same product','mismo producto','même produit'):estimate.scope==='mandrel'?chatLang('same mandrel / limited product history','mismo mandrel / historial de producto limitado','même mandrin'):chatLang('same line / limited product history','misma línea / historial de producto limitado','même ligne');
  return {kind:'result',title:chatLang('Process Performance Prediction','Predicción de desempeño del proceso','Prévision de performance'),message:chatLang(
    `Primary ${fmt(primary,1)} RPM + Secondary ${fmt(secondary,1)} RPM → predicted output ${fmt(estimate.outputLbHr,0)} lb/hr${scope}. ${parts.join(' • ')}.${targetLine}${cautionText}`,
    `Primary ${fmt(primary,1)} RPM + Secondary ${fmt(secondary,1)} RPM → output predicho ${fmt(estimate.outputLbHr,0)} lb/hr${scope}. ${parts.join(' • ')}.${targetLine}${cautionText}`,
    `Primary ${fmt(primary,1)} + Secondary ${fmt(secondary,1)} → débit prévu ${fmt(estimate.outputLbHr,0)} lb/h. ${parts.join(' • ')}.${cautionText}`
  ),meta:chatLang(`Predictive only — completed-roll measured BW remains final. Confidence ${estimate.confidence}% • ${estimate.count} comparable sample(s) • ${learningScope} • ${mandrel}” × 2 = ${totalWebWidthForMandrel(mandrel)}” total width`,`Solo predictivo — el BW medido del rollo completo sigue siendo el valor final. Confianza ${estimate.confidence}% • ${estimate.count} muestra(s) comparable(s) • ${learningScope} • ${mandrel}” × 2 = ${totalWebWidthForMandrel(mandrel)}” de ancho total`,`Prévision seulement — le BW mesuré reste final. Confiance ${estimate.confidence}% • ${estimate.count} échantillon(s) • ${learningScope}`) };
}
function saveProcessPerformanceSample(flow){
  const gate=activeShiftChatGate();if(gate)return gate;
  if(demoMode())return {kind:'info',message:chatLang('Demo Mode: process learning is disabled.','Modo Demo: el aprendizaje de proceso está desactivado.','Mode démo : apprentissage désactivé.')};
  const primary=Number(flow.primaryRPM),secondary=Number(flow.secondaryRPM),w1=Number(flow.w1),w2=Number(flow.w2),minutes=Number(flow.minutes),swrap=clampSWrap(flow.swrapSpeed||state.currentSWrap);
  if(!positive(primary,secondary,w1,w2,minutes,swrap))return {kind:'error',message:t('invalidNumbers')};
  const output=(w1+w2)*60/minutes;
  const mandrel=currentMandrel('bw'),product=state.activeShift?.product||state.product||'';
  const predictedBW=predictiveBWFromOutput(output,swrap,mandrel);
  const row=state.processLearning.add({primaryRPM:primary,secondaryRPM:secondary,outputLbHr:output,swrapSpeed:swrap,product,mandrel,totalWidth:totalWebWidthForMandrel(mandrel),line:ACTIVE_LINE,winder1Weight:w1,winder2Weight:w2,runMinutes:minutes,melt:flow.melt,secondaryHeat:flow.heat,motorLoad:flow.load,primaryPressure:flow.pressure,targetBW:state.targetBW,measuredBW:positive(flow.measuredBW)?Number(flow.measuredBW):null,winder1BW:positive(flow.winder1BW)?Number(flow.winder1BW):null,winder2BW:positive(flow.winder2BW)?Number(flow.winder2BW):null,entrySource:flow.entrySource||'chat',operator:flow.operator||state.activeShift?.operator||state.operator||''});
  return {kind:'result',recordId:row.id,record:row,title:chatLang('Process sample learned','Muestra de proceso aprendida','Échantillon appris'),message:chatLang(
    `Saved: Primary ${fmt(primary,1)} • Secondary ${fmt(secondary,1)} • ${fmt(output,0)} lb/hr • S-Wrap ${fmt(swrap,1)} • predictive BW ${fmt(predictedBW,3)}${positive(flow.pressure)?` • Primary Pressure ${fmt(Number(flow.pressure),0)}`:''}.`,
    `Guardado: Primary ${fmt(primary,1)} • Secondary ${fmt(secondary,1)} • ${fmt(output,0)} lb/hr • S-Wrap ${fmt(swrap,1)} • BW predictivo ${fmt(predictedBW,3)}${positive(flow.pressure)?` • Primary Pressure ${fmt(Number(flow.pressure),0)}`:''}.`,
    `Enregistré : Primary ${fmt(primary,1)} • Secondary ${fmt(secondary,1)} • ${fmt(output,0)} lb/h.`
  ),meta:chatLang(`${state.processLearning.records.length} process-performance sample(s) stored on Line ${ACTIVE_LINE}.`,` ${state.processLearning.records.length} muestra(s) de desempeño guardadas en Line ${ACTIVE_LINE}.`,` ${state.processLearning.records.length} échantillon(s).`) };
}
function processWorkflowNextStage(flow={}){
  if(!positive(flow.primaryRPM))return 'primary';
  if(!positive(flow.secondaryRPM))return 'secondary';
  if(!positive(flow.w1))return 'w1';
  if(!positive(flow.w2))return 'w2';
  if(!positive(flow.minutes))return 'minutes';
  if(!positive(flow.swrapSpeed))return 'swrap';
  return 'complete';
}
function processWorkflowPrompt(stage){
  if(stage==='primary')return chatLang('What was the Primary RPM?','¿A cuántos RPM estaba el Primary?','RPM Primary ?');
  if(stage==='secondary')return chatLang('What was the Secondary RPM?','¿A cuántos RPM estaba el Secondary?','RPM Secondary ?');
  if(stage==='w1')return chatLang('What was Winder 1 roll weight in lb?','¿Cuánto pesó el rollo de Winder 1 en lb?','Poids Winder 1 ?');
  if(stage==='w2')return chatLang('What was Winder 2 roll weight in lb?','¿Cuánto pesó el rollo de Winder 2 en lb?','Poids Winder 2 ?');
  if(stage==='minutes')return chatLang('How many minutes did the line run for those two rolls?','¿Cuántos minutos corrió la línea para esos dos rollos?','Combien de minutes ?');
  if(stage==='conditions')return chatLang('Optional process readings: type Primary Pressure, Melt, Secondary Heat and Motor Load in one message, or type “skip”. Example: Pressure 4200 Melt 303 Heat 190 Load 70.','Lecturas opcionales: escribe Primary Pressure, Melt, Secondary Heat y Motor Load en un solo mensaje, o escribe “skip”. Ejemplo: Pressure 4200 Melt 303 Heat 190 Load 70.','Lectures optionnelles : Pressure, Melt, Heat, Load, ou “skip”.');
  return chatLang(`What S-Wrap/line speed was used? Maximum is ${MAX_SWRAP_SPEED} ft/min.`,`¿Qué S-Wrap/velocidad de línea usaste? El máximo es ${MAX_SWRAP_SPEED} ft/min.`,`Quelle vitesse S-Wrap ? Maximum ${MAX_SWRAP_SPEED} ft/min.`);
}
function startProcessLearningWorkflow(seed={}){
  const gate=activeShiftChatGate();if(gate)return gate;
  chatWorkflow={type:'process-performance',...seed,startedAt:new Date().toISOString()};
  chatWorkflow.stage=processWorkflowNextStage(chatWorkflow);
  if(chatWorkflow.stage==='complete'){const result=saveProcessPerformanceSample(chatWorkflow);chatWorkflow=null;saveChatWorkflow();return result;}
  saveChatWorkflow();
  return {kind:'info',title:chatLang('Teach Process Performance','Enseñar desempeño del proceso','Apprentissage process'),message:processWorkflowPrompt(chatWorkflow.stage)};
}
function handleProcessPerformanceWorkflow(text){
  if(!chatWorkflow||chatWorkflow.type!=='process-performance')return null;
  const q=normalizeKnowledgeQuery(text);
  if(/\b(cancel|cancelar|cancela|annuler)\b/.test(q)){chatWorkflow=null;saveChatWorkflow();return {kind:'info',message:chatLang('Process learning cancelled.','Aprendizaje de proceso cancelado.','Apprentissage annulé.')};}
  const numericReply=numbers(text).some(v=>positive(v));
  const conditionsSkip=/\b(skip|saltar|omitir|no tengo|none|aucun)\b/.test(q);
  const hasWords=/[a-záéíóúñàèùâêîôûç]/i.test(String(text||''));
  // Do not trap normal conversation inside a numeric guided workflow.
  // If Viejito is waiting for a number and the operator asks a normal question,
  // release the workflow and let interpret() process the same message normally.
  if(chatWorkflow.stage!=='conditions'&&!numericReply&&hasWords){
    chatWorkflow=null;saveChatWorkflow();return null;
  }
  if(chatWorkflow.stage==='conditions'&&!numericReply&&!conditionsSkip&&hasWords){
    chatWorkflow=null;saveChatWorkflow();return null;
  }
  const first=numbers(text).find(v=>positive(v));
  if(chatWorkflow.stage==='primary'){
    const v=labeledProcessNumber(text,'primary')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the Primary RPM.','Escribe los RPM del Primary.','Entrez RPM Primary.')};
    chatWorkflow.primaryRPM=v;chatWorkflow.stage='secondary';saveChatWorkflow();return {kind:'info',message:chatLang('What was the Secondary RPM?','¿A cuántos RPM estaba el Secondary?','RPM Secondary ?')};
  }
  if(chatWorkflow.stage==='secondary'){
    const v=labeledProcessNumber(text,'secondary')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the Secondary RPM.','Escribe los RPM del Secondary.','Entrez RPM Secondary.')};
    chatWorkflow.secondaryRPM=v;chatWorkflow.stage='w1';saveChatWorkflow();return {kind:'info',message:chatLang('What was Winder 1 roll weight in lb?','¿Cuánto pesó el rollo de Winder 1 en lb?','Poids Winder 1 ?')};
  }
  if(chatWorkflow.stage==='w1'){
    const v=labeledProcessNumber(text,'w1')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter Winder 1 weight.','Escribe el peso de Winder 1.','Poids Winder 1.')};
    chatWorkflow.w1=v;chatWorkflow.stage='w2';saveChatWorkflow();return {kind:'info',message:chatLang('What was Winder 2 roll weight in lb?','¿Cuánto pesó el rollo de Winder 2 en lb?','Poids Winder 2 ?')};
  }
  if(chatWorkflow.stage==='w2'){
    const v=labeledProcessNumber(text,'w2')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter Winder 2 weight.','Escribe el peso de Winder 2.','Poids Winder 2.')};
    chatWorkflow.w2=v;chatWorkflow.stage='minutes';saveChatWorkflow();return {kind:'info',message:chatLang('How many minutes did the line run for those two rolls?','¿Cuántos minutos corrió la línea para esos dos rollos?','Combien de minutes ?')};
  }
  if(chatWorkflow.stage==='minutes'){
    const v=labeledProcessNumber(text,'minutes')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the run time in minutes.','Escribe el tiempo corrido en minutos.','Entrez le temps en minutes.')};
    chatWorkflow.minutes=v;chatWorkflow.stage='swrap';saveChatWorkflow();return {kind:'info',message:chatLang(`What S-Wrap speed was running? Current is ${fmt(state.currentSWrap,1)}.`,`¿A qué S-Wrap estaba corriendo? El actual es ${fmt(state.currentSWrap,1)}.`,`Vitesse S-Wrap ?`)};
  }
  if(chatWorkflow.stage==='swrap'){
    const v=labeledProcessNumber(text,'swrap')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the S-Wrap speed.','Escribe la velocidad del S-Wrap.','Entrez S-Wrap.')};
    chatWorkflow.swrapSpeed=clampSWrap(v);chatWorkflow.stage='conditions';saveChatWorkflow();return {kind:'info',message:processWorkflowPrompt('conditions')};
  }
  if(chatWorkflow.stage==='conditions'){
    if(!/\b(skip|saltar|omitir|no tengo|none|aucun)\b/.test(q)){
      chatWorkflow.pressure=labeledProcessNumber(text,'pressure')||((first&&first>=1000&&first<=6000)?first:null);
      chatWorkflow.melt=labeledProcessNumber(text,'melt');chatWorkflow.heat=labeledProcessNumber(text,'heat');chatWorkflow.load=labeledProcessNumber(text,'load');
    }
    const flow={...chatWorkflow};chatWorkflow=null;saveChatWorkflow();return saveProcessPerformanceSample(flow);
  }
  return null;
}
function parseCoordinatedSpeedRequest(text){
  const raw=String(text||'').replace(/,/g,'.');
  const q=normalizeKnowledgeQuery(raw);
  const keepsBW=/\b(same bw|same basis weight|maintain(?:ing)? (?:the )?(?:same )?(?:bw|basis weight)|keep(?:ing)? (?:the )?(?:same )?(?:bw|basis weight)|mantener|manteniendo|mantenido|mantenga|mismo bw|misma basis weight|mismo basis weight|sin cambiar (?:el )?bw|conservar (?:el )?bw)\b/.test(q);
  const speedIntent=/\b(baja|bajar|bajarlo|sube|subir|cambia|cambiar|cambio|ajusta|ajustar|reduce|reducir|lower|raise|increase|decrease|change|set)\b/.test(q)&&( /\b(speed|velocidad|s wrap|swrap)\b/.test(q) || /\d+(?:\.\d+)?\s*(?:ft(?:\/?min)?|fpm)\b/.test(q) );
  if(!keepsBW||!speedIntent)return null;
  let currentSpeed=Number(state.currentSWrap),targetSpeed=null;
  const pair=raw.match(/\b(?:de|from)\s*(\d+(?:\.\d+)?)\s*(?:ft(?:\/?min)?|fpm)?\s*(?:a|to)\s*(\d+(?:\.\d+)?)\s*(?:ft(?:\/?min)?|fpm)?/i);
  if(pair){currentSpeed=Number(pair[1]);targetSpeed=Number(pair[2]);}
  if(!positive(targetSpeed)){
    const change=raw.match(/\b(?:baja(?:r|lo)?|sube|subir|cambia(?:r)?|ajusta(?:r)?|reduce|reducir|lower|raise|increase|decrease|change|set)\b[^\d]{0,30}(?:a|to)?\s*(\d+(?:\.\d+)?)\s*(?:ft(?:\/?min)?|fpm)/i);
    if(change)targetSpeed=Number(change[1]);
  }
  if(!positive(targetSpeed)){
    const ft=[...raw.matchAll(/(\d+(?:\.\d+)?)\s*(?:ft(?:\/?min)?|fpm)\b/ig)].map(m=>Number(m[1])).filter(positive);
    if(ft.length)targetSpeed=ft[ft.length-1];
  }
  if(!positive(targetSpeed))return null;
  return {
    type:'coordinated-speed-bw',currentSWrap:currentSpeed,targetSWrap:clampSWrap(targetSpeed),
    primaryRPM:labeledProcessNumber(raw,'primary'),secondaryRPM:labeledProcessNumber(raw,'secondary'),
    currentOutputLbHr:labeledProcessNumber(raw,'output'),currentPrimaryPressure:labeledProcessNumber(raw,'pressure')
  };
}
function currentProductionOutputForRecommendation(){
  try{const stats=runStats(currentProductionRun());return positive(stats?.rate)?Number(stats.rate):null;}catch(_){return null;}
}
function coordinatedSpeedRecommendation(flow={}){
  const gate=activeShiftChatGate();if(gate)return gate;
  const primary=Number(flow.primaryRPM),secondary=Number(flow.secondaryRPM),currentSpeed=Number(flow.currentSWrap||state.currentSWrap),targetSpeed=clampSWrap(flow.targetSWrap);
  if(!positive(primary,secondary,currentSpeed,targetSpeed))return {kind:'error',message:t('invalidNumbers')};
  const product=state.activeShift?.product||state.product||'',mandrel=currentMandrel('bw');
  const liveOutput=positive(flow.currentOutputLbHr)?Number(flow.currentOutputLbHr):currentProductionOutputForRecommendation();
  const rec=state.processLearning.recommendForSpeedChange({currentPrimaryRPM:primary,currentSecondaryRPM:secondary,currentSWrap:currentSpeed,targetSWrap:targetSpeed,product,mandrel,currentOutputLbHr:liveOutput,currentPrimaryPressure:flow.currentPrimaryPressure});
  if(!rec.ready)return {kind:'info',message:chatLang('I need the current Primary RPM and Secondary RPM before I can coordinate this speed change.','Necesito los RPM actuales del Primary y Secondary antes de coordinar este cambio de velocidad.','J’ai besoin des RPM Primary et Secondary actuels.')};
  const heatText=positive(rec.secondaryHeat)?chatLang(`Secondary Heat start: ~${fmt(rec.secondaryHeat,0)} (${rec.secondaryHeatSource==='learned'?'learned from this line':'plant friction-heat starting curve'})`,`Secondary Heat inicial: ~${fmt(rec.secondaryHeat,0)} (${rec.secondaryHeatSource==='learned'?'aprendido de esta línea':'curva inicial de friction heat de planta'})`,`Secondary Heat initial : ~${fmt(rec.secondaryHeat,0)}`):chatLang('Secondary Heat: verify from melt/load.','Secondary Heat: verificar con melt/load.','Secondary Heat : vérifier melt/load.');
  const outputText=positive(rec.expectedOutputLbHr)?chatLang(`Expected output: ~${fmt(rec.expectedOutputLbHr,0)} lb/hr`,`Output esperado: ~${fmt(rec.expectedOutputLbHr,0)} lb/hr`,`Débit prévu : ~${fmt(rec.expectedOutputLbHr,0)} lb/h`):positive(rec.targetOutputLbHr)?chatLang(`Target output for same BW: ~${fmt(rec.targetOutputLbHr,0)} lb/hr`,`Output objetivo para conservar BW: ~${fmt(rec.targetOutputLbHr,0)} lb/hr`,`Débit cible : ~${fmt(rec.targetOutputLbHr,0)} lb/h`):chatLang('Output prediction: not learned yet','Predicción de output: todavía no aprendida','Débit : pas encore appris');
  const pressureText=positive(rec.expectedPrimaryPressure)?chatLang(`Expected Primary Pressure: ~${fmt(rec.expectedPrimaryPressure,0)} • margin to 5,500 shutdown: ~${fmt(rec.pressureMargin,0)}`,`Primary Pressure esperada: ~${fmt(rec.expectedPrimaryPressure,0)} • margen al shutdown de 5,500: ~${fmt(rec.pressureMargin,0)}`,`Pression Primary prévue : ~${fmt(rec.expectedPrimaryPressure,0)} • marge : ~${fmt(rec.pressureMargin,0)}`):chatLang('Primary Pressure prediction is not learned yet — verify pressure after the coordinated move; high-pressure shutdown is 5,500.','La predicción de Primary Pressure todavía no está aprendida — verifica la presión después del cambio coordinado; el high-pressure shutdown es 5,500.','La pression Primary n’est pas encore apprise — vérifier après le changement; shutdown 5 500.');
  const meltText=positive(rec.expectedMelt)?chatLang(`Expected melt: ~${fmt(rec.expectedMelt,1)} (plant target 300–305)`,`Melt esperado: ~${fmt(rec.expectedMelt,1)} (target de planta 300–305)`,`Melt prévu : ~${fmt(rec.expectedMelt,1)} (cible 300–305)`):chatLang('Melt target: 300–305; verify actual melt after the move.','Target de melt: 300–305; verifica el melt real después del cambio.','Cible melt : 300–305.');
  const method=rec.method==='learned-search'?chatLang(`learned search • ${rec.comparableSamples} comparable sample(s) • confidence ${rec.confidence}%`,`búsqueda aprendida • ${rec.comparableSamples} muestra(s) comparable(s) • confianza ${rec.confidence}%`,`recherche apprise • confiance ${rec.confidence}%`):chatLang('proportional starting point — keep teaching real process samples to improve it','punto inicial proporcional — sigue enseñando muestras reales para mejorarlo','point de départ proportionnel');
  const caution=rec.frictionHeatCaution?chatLang(' Secondary is near the 13 RPM quality cap: watch friction/shear heat closely.',' Secondary está cerca del límite de calidad de 13 RPM: vigila de cerca el friction/shear heat.',' Secondary près de 13 RPM : surveiller friction heat.') : '';
  if(rec.qualityLimited){
    const joke=speedChangeHumor(rec),jokeLine=joke?`\n${joke}`:'';
    const primaryLimited=rec.limitingComponent==='primary';
    const bothLimited=rec.limitingComponent==='both';
    const limiting=primaryLimited
      ?chatLang(`Primary reaches the machine-enforced maximum of ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM first. The machine will not allow Primary to run faster.`,`Primary llega primero al máximo real de la máquina de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM. La máquina no permite que Primary corra más rápido.`,`Primary atteint d'abord la limite réelle de la machine de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM. La machine ne permet pas d'aller plus vite.`)
      :bothLimited
        ?chatLang(`Primary reaches the machine maximum of ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM while Secondary reaches its 13.0 RPM quality cap.`,`Primary llega al máximo de máquina de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM al mismo tiempo que Secondary llega a su límite de calidad de 13.0 RPM.`,`Primary atteint sa limite machine pendant que Secondary atteint sa limite qualité.`)
        :chatLang(`Secondary would require ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, above the 13.0 RPM quality cap.`,`Secondary necesitaría ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, arriba del límite de calidad de 13.0 RPM.`,`Secondary demanderait ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, au-dessus de 13,0 RPM.`);
    const title=primaryLimited?chatLang('Machine limit reached','Límite de máquina alcanzado','Limite machine atteinte'):bothLimited?chatLang('Machine + quality limits reached','Límites de máquina + calidad alcanzados','Limites machine + qualité atteintes'):chatLang('Quality limit reached','Límite de calidad alcanzado','Limite qualité atteinte');
    const requestLine=primaryLimited
      ?chatLang(`Requested ${fmt(targetSpeed,1)} ft/min cannot be reached with this coordinated relationship because the theoretical Primary requirement is ${fmt(rec.theoreticalPrimaryRPM,1)} RPM, above the machine maximum.`,`No se puede llegar a ${fmt(targetSpeed,1)} ft/min con esta relación coordinada porque el Primary teórico sería ${fmt(rec.theoreticalPrimaryRPM,1)} RPM, por encima del máximo de la máquina.`,`La vitesse demandée ne peut pas être atteinte car le Primary théorique dépasse la limite machine.`)
      :chatLang(`Requested ${fmt(targetSpeed,1)} ft/min is NOT recommended for good roll quality.`,`No recomiendo ${fmt(targetSpeed,1)} ft/min si quieres mantener buena calidad.`,`La vitesse ${fmt(targetSpeed,1)} ft/min n’est pas recommandée pour maintenir la qualité.`);
    const theoreticalLabel=primaryLimited?chatLang('Theoretical requirement — ABOVE MACHINE LIMIT','Requerimiento teórico — ARRIBA DEL LÍMITE DE MÁQUINA','Besoin théorique — AU-DESSUS DE LA LIMITE MACHINE'):chatLang('Theoretical requirement — NOT RECOMMENDED','Requerimiento teórico — NO RECOMENDADO','Besoin théorique — NON RECOMMANDÉ');
    return {kind:'result',title,message:chatLang(
      `${limiting}\n${requestLine}\n${theoreticalLabel}: Primary ${fmt(rec.theoreticalPrimaryRPM,1)} RPM • Secondary ${fmt(rec.theoreticalSecondaryRPM,1)} RPM.\nMaximum coordinated starting point: S-Wrap ${fmt(rec.maxRecommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.\n${heatText}\n${pressureText}${jokeLine}`,
      `${limiting}\n${requestLine}\n${theoreticalLabel}: Primary ${fmt(rec.theoreticalPrimaryRPM,1)} RPM • Secondary ${fmt(rec.theoreticalSecondaryRPM,1)} RPM.\nMáximo starting point coordinado: S-Wrap ${fmt(rec.maxRecommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.\n${heatText}\n${pressureText}${jokeLine}`,
      `${limiting}\n${requestLine} Besoin théorique : Primary ${fmt(rec.theoreticalPrimaryRPM,1)} • Secondary ${fmt(rec.theoreticalSecondaryRPM,1)}. Maximum coordonné : S-Wrap ${fmt(rec.maxRecommendedSWrap,1)} • Primary ${fmt(rec.primaryRPM,1)} • Secondary ${fmt(rec.secondaryRPM,1)}.`
    ),meta:primaryLimited?chatLang('Primary 128 RPM is a machine-enforced maximum, not a friction-heat or quality recommendation. The theoretical value is shown only to explain what the requested speed would require.','Primary 128 RPM es un máximo impuesto por la máquina, no una recomendación de friction heat o calidad. El valor teórico solo explica lo que pediría la velocidad solicitada.','128 RPM Primary est une limite machine réelle.'):chatLang('The theoretical values explain what the requested speed would mathematically require; they are not approved setpoints. The first coordinated component limit determines the maximum recommended speed.','Los valores teóricos muestran lo que matemáticamente pediría la velocidad; no son setpoints aprobados. El primer componente coordinado que llega a su límite determina la velocidad máxima recomendada.','Les valeurs théoriques ne sont pas des réglages approuvés.')};
  }
  return {kind:'result',title:chatLang('Coordinated BW Speed Recommendation','Recomendación coordinada para mantener BW','Recommandation coordonnée'),message:chatLang(
    `Keep BW while changing line speed ${fmt(currentSpeed,1)} → ${fmt(targetSpeed,1)} ft/min:\nPrimary: ${fmt(rec.primaryRPM,1)} RPM\nSecondary: ${fmt(rec.secondaryRPM,1)} RPM\n${heatText}\n${outputText}\n${pressureText}\n${meltText}${caution}`,
    `Para mantener el mismo BW al cambiar la velocidad ${fmt(currentSpeed,1)} → ${fmt(targetSpeed,1)} ft/min:\nPrimary: ${fmt(rec.primaryRPM,1)} RPM\nSecondary: ${fmt(rec.secondaryRPM,1)} RPM\n${heatText}\n${outputText}\n${pressureText}\n${meltText}${caution}`,
    `Pour conserver le BW à ${fmt(targetSpeed,1)} ft/min :\nPrimary ${fmt(rec.primaryRPM,1)} RPM\nSecondary ${fmt(rec.secondaryRPM,1)} RPM\n${heatText}\n${outputText}\n${pressureText}\n${meltText}${caution}`
  ),meta:chatLang(`Viejito always coordinates Primary + Secondary; it will not issue a Secondary-only speed recommendation. ${method}. Predictive guidance only — actual pressure, melt, load and completed-roll BW remain authoritative.`,`Viejito siempre coordina Primary + Secondary; no dará una recomendación de velocidad solo para Secondary. ${method}. Guía predictiva solamente — presión, melt, load y BW real del rollo siguen siendo la autoridad.`,`Primary + Secondary sont toujours coordonnés. ${method}.`) };
}
function startCoordinatedSpeedWorkflow(seed={}){
  const gate=activeShiftChatGate();if(gate)return gate;
  chatWorkflow={type:'coordinated-speed-bw',...seed,startedAt:new Date().toISOString()};
  chatWorkflow.stage=positive(chatWorkflow.primaryRPM)?(positive(chatWorkflow.secondaryRPM)?'complete':'secondary'):'primary';
  if(chatWorkflow.stage==='complete'){const result=coordinatedSpeedRecommendation(chatWorkflow);chatWorkflow=null;saveChatWorkflow();return result;}
  saveChatWorkflow();
  return {kind:'info',title:chatLang('Coordinate Primary + Secondary','Coordinar Primary + Secondary','Coordonner Primary + Secondary'),message:chatWorkflow.stage==='primary'?chatLang(`What is the CURRENT Primary RPM at ${fmt(chatWorkflow.currentSWrap,1)} ft/min?`,`¿A cuántos RPM está el Primary AHORA a ${fmt(chatWorkflow.currentSWrap,1)} ft/min?`,`RPM Primary actuel ?`):chatLang('What is the CURRENT Secondary RPM?','¿A cuántos RPM está el Secondary AHORA?','RPM Secondary actuel ?')};
}
function handleCoordinatedSpeedWorkflow(text){
  if(!chatWorkflow||chatWorkflow.type!=='coordinated-speed-bw')return null;
  const q=normalizeKnowledgeQuery(text);
  if(/\b(cancel|cancelar|cancela|annuler)\b/.test(q)){chatWorkflow=null;saveChatWorkflow();return {kind:'info',message:chatLang('Speed recommendation cancelled.','Recomendación de velocidad cancelada.','Recommandation annulée.')};}
  const first=numbers(text).find(v=>positive(v));
  if(chatWorkflow.stage==='primary'){
    const v=labeledProcessNumber(text,'primary')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the current Primary RPM.','Escribe los RPM actuales del Primary.','Entrez RPM Primary.')};
    chatWorkflow.primaryRPM=v;chatWorkflow.stage='secondary';saveChatWorkflow();return {kind:'info',message:chatLang('What is the CURRENT Secondary RPM?','¿A cuántos RPM está el Secondary AHORA?','RPM Secondary actuel ?')};
  }
  if(chatWorkflow.stage==='secondary'){
    const v=labeledProcessNumber(text,'secondary')||first;if(!positive(v))return {kind:'info',message:chatLang('Enter the current Secondary RPM.','Escribe los RPM actuales del Secondary.','Entrez RPM Secondary.')};
    chatWorkflow.secondaryRPM=v;const flow={...chatWorkflow};chatWorkflow=null;saveChatWorkflow();return coordinatedSpeedRecommendation(flow);
  }
  return null;
}
function manualProcessCopy(key){
  const copy={
    en:{tool:'Process Record',eyebrow:'PROCESS PERFORMANCE',title:'Manual Process Record',hint:'Save a real two-roll run so Viejito can learn it and answer questions about it later in chat.',primary:'Primary RPM',secondary:'Secondary RPM',w1:'Roll 1 weight (lb)',w2:'Roll 2 weight (lb)',minutes:'Run time (minutes)',total:'Total weight',output:'Calculated output',note:'Line, product, S-Wrap, date/time and operator are saved automatically from the current Viejito context.',cancel:'Cancel',save:'Save Process Record',saved:'Process record saved.'},
    es:{tool:'Registro de proceso',eyebrow:'DESEMPEÑO DEL PROCESO',title:'Registro manual de proceso',hint:'Guarda una corrida real de dos rollos para que Viejito la aprenda y después puedas consultarla en el chat.',primary:'Primary RPM',secondary:'Secondary RPM',w1:'Peso Roll 1 (lb)',w2:'Peso Roll 2 (lb)',minutes:'Tiempo de corrida (minutos)',total:'Peso total',output:'Output calculado',note:'Line, producto, S-Wrap, fecha/hora y operador se guardan automáticamente del contexto actual de Viejito.',cancel:'Cancelar',save:'Guardar registro',saved:'Registro de proceso guardado.'},
    fr:{tool:'Journal procédé',eyebrow:'PERFORMANCE PROCÉDÉ',title:'Journal manuel du procédé',hint:'Enregistrez une production réelle de deux rouleaux pour que Viejito puisse l’apprendre et la retrouver dans le chat.',primary:'RPM Primary',secondary:'RPM Secondary',w1:'Poids rouleau 1 (lb)',w2:'Poids rouleau 2 (lb)',minutes:'Temps de production (minutes)',total:'Poids total',output:'Débit calculé',note:'Ligne, produit, S-Wrap, date/heure et opérateur sont enregistrés automatiquement.',cancel:'Annuler',save:'Enregistrer',saved:'Enregistrement du procédé sauvegardé.'}
  };
  return (copy[state.language]||copy.en)[key]||key;
}
function renderManualProcessLanguage(){
  const ids={tool:'manual-process-tool-label',eyebrow:'manual-process-eyebrow',title:'manual-process-title',hint:'manual-process-hint',primary:'manual-primary-label',secondary:'manual-secondary-label',w1:'manual-w1-label',w2:'manual-w2-label',minutes:'manual-minutes-label',total:'manual-total-label',output:'manual-output-label',note:'manual-process-note',cancel:'manual-process-cancel',save:'manual-process-save'};
  Object.entries(ids).forEach(([key,id])=>{if($(id))$(id).textContent=manualProcessCopy(key);});
}
function manualProcessContextText(){
  const product=state.activeShift?.product||state.product||'—';
  const sw=Number(state.currentSWrap);
  const operator=state.activeShift?.operator||state.operator||'';
  return chatLang(
    `Line ${ACTIVE_LINE} • Product ${product} • S-Wrap ${positive(sw)?fmt(sw,1):'—'}${operator?` • ${operator}`:''}`,
    `Line ${ACTIVE_LINE} • Producto ${product} • S-Wrap ${positive(sw)?fmt(sw,1):'—'}${operator?` • ${operator}`:''}`,
    `Line ${ACTIVE_LINE} • Produit ${product} • S-Wrap ${positive(sw)?fmt(sw,1):'—'}${operator?` • ${operator}`:''}`
  );
}
function manualProcessValues(){return {primaryRPM:Number($('manual-primary')?.value),secondaryRPM:Number($('manual-secondary')?.value),w1:Number($('manual-w1')?.value),w2:Number($('manual-w2')?.value),minutes:Number($('manual-minutes')?.value)};}
function updateManualProcessPreview(){
  const v=manualProcessValues(),complete=positive(v.w1,v.w2,v.minutes);
  const total=complete?v.w1+v.w2:null,output=complete?total*60/v.minutes:null;
  if($('manual-total'))$('manual-total').textContent=positive(total)?fmt(total,0):'—';
  if($('manual-output'))$('manual-output').textContent=positive(output)?fmt(output,0):'—';
}
function openManualProcessDialog(){
  if(!requireActiveShift({openStart:true}))return false;
  closeToolMenu();renderManualProcessLanguage();
  if($('manual-process-context'))$('manual-process-context').textContent=manualProcessContextText();
  ['manual-primary','manual-secondary','manual-w1','manual-w2','manual-minutes'].forEach(id=>{if($(id))$(id).value='';});
  updateManualProcessPreview();
  const box=$('manual-process-dialog');if(!box)return;box.classList.remove('hidden');box.setAttribute('aria-hidden','false');
  setTimeout(()=>$('manual-primary')?.focus(),60);
}
function closeManualProcessDialog(){const box=$('manual-process-dialog');if(!box)return;box.classList.add('hidden');box.setAttribute('aria-hidden','true');}
function saveManualProcessRecord(){
  const v=manualProcessValues();
  if(!positive(v.primaryRPM,v.secondaryRPM,v.w1,v.w2,v.minutes)){showToast(state.language==='es'?'Completa Primary, Secondary, los dos pesos y el tiempo.':'Enter Primary, Secondary, both roll weights and run time.');return;}
  const result=saveProcessPerformanceSample({...v,swrapSpeed:state.currentSWrap,entrySource:'manual',operator:state.activeShift?.operator||state.operator||''});
  if(result?.kind==='error'){showToast(result.message||t('invalidNumbers'));return;}
  const output=(v.w1+v.w2)*60/v.minutes;
  addHistory(chatLang('Process','Proceso','Procédé'),`P ${fmt(v.primaryRPM,1)} • S ${fmt(v.secondaryRPM,1)} • ${fmt(v.w1,0)} + ${fmt(v.w2,0)} lb • ${fmt(v.minutes,1)} min • ${fmt(output,0)} lb/hr`);
  closeManualProcessDialog();showToast(manualProcessCopy('saved'));
}
function speedChangeCopy(key){
  const copy={
    en:{tool:'Speed Change Advisor',eyebrow:'OCCASIONAL SPEED CHANGE',title:'Speed Change Advisor',hint:'Use this only when line speed is intentionally being changed. Viejito uses current line speed, Last BW and actual two-roll output. If the request exceeds the quality envelope, it shows the real theoretical RPM requirement but recommends only the maximum coordinated setpoints.',primary:'Current Primary RPM',secondary:'Current Secondary RPM',w1:'Roll 1 weight (lb)',w2:'Roll 2 weight (lb)',minutes:'Run time (minutes)',targetSpeed:'Desired line speed',targetBW:'Desired BW',currentOutput:'Current output',targetOutput:'Required output',result:'Recommended starting point',setSWrap:'SET S-WRAP',setPrimary:'SET PRIMARY',setSecondary:'SET SECONDARY',setHeat:'SECONDARY HEAT START',qualityTitle:'QUALITY LIMIT — REQUEST NOT RECOMMENDED',theoretical:'THEORETICAL REQUIREMENT — NOT RECOMMENDED',theoreticalPrimary:'Required Primary',theoreticalSecondary:'Required Secondary',theoreticalSWrap:'Requested S-Wrap',note:'Starting point only. Secondary 13.0 RPM is the recommended quality cap. Verify actual Primary Pressure, melt, motor load and the next completed-roll BW after the change.',close:'Close',suggest:'Suggestion'},
    es:{tool:'Cambio de velocidad',eyebrow:'CAMBIO OCASIONAL DE VELOCIDAD',title:'Speed Change Advisor',hint:'Úsalo solo cuando quieras cambiar intencionalmente la velocidad de línea. Viejito usa la velocidad actual, Last BW y el output real de dos rollos. Si lo pedido rebasa el rango de calidad, muestra los RPM teóricos reales pero recomienda solamente el máximo coordinado.',primary:'Primary RPM actual',secondary:'Secondary RPM actual',w1:'Peso Roll 1 (lb)',w2:'Peso Roll 2 (lb)',minutes:'Tiempo de los rollos (minutos)',targetSpeed:'Velocidad deseada',targetBW:'BW deseado',currentOutput:'Output actual',targetOutput:'Output necesario',result:'Starting point recomendado',setSWrap:'PON S-WRAP',setPrimary:'PON PRIMARY',setSecondary:'PON SECONDARY',setHeat:'SECONDARY HEAT INICIAL',qualityTitle:'LÍMITE DE CALIDAD — NO RECOMENDADO',theoretical:'REQUERIMIENTO TEÓRICO — NO RECOMENDADO',theoreticalPrimary:'Primary requerido',theoreticalSecondary:'Secondary requerido',theoreticalSWrap:'S-Wrap solicitado',note:'Solo es un starting point. 13.0 RPM de Secondary es el límite recomendado de calidad. Verifica Primary Pressure, melt, motor load y el BW de los siguientes rollos.',close:'Cerrar',suggest:'Suggestion'},
    fr:{tool:'Changement vitesse',eyebrow:'CHANGEMENT OCCASIONNEL',title:'Speed Change Advisor',hint:'À utiliser seulement pour un changement volontaire de vitesse. Si la demande dépasse la limite qualité, Viejito montre les RPM théoriques mais recommande seulement les réglages coordonnés sûrs.',primary:'RPM Primary actuel',secondary:'RPM Secondary actuel',w1:'Poids rouleau 1 (lb)',w2:'Poids rouleau 2 (lb)',minutes:'Temps (minutes)',targetSpeed:'Vitesse désirée',targetBW:'BW désiré',currentOutput:'Débit actuel',targetOutput:'Débit requis',result:'Point de départ recommandé',setSWrap:'RÉGLER S-WRAP',setPrimary:'RÉGLER PRIMARY',setSecondary:'RÉGLER SECONDARY',setHeat:'SECONDARY HEAT INITIAL',qualityTitle:'LIMITE QUALITÉ — NON RECOMMANDÉ',theoretical:'BESOIN THÉORIQUE — NON RECOMMANDÉ',theoreticalPrimary:'Primary requis',theoreticalSecondary:'Secondary requis',theoreticalSWrap:'S-Wrap demandé',note:'Point de départ seulement. 13,0 RPM Secondary est la limite qualité recommandée. Vérifiez pression, melt, charge et BW réel.',close:'Fermer',suggest:'Suggestion'}
  };
  return (copy[state.language]||copy.en)[key]||key;
}
function renderSpeedChangeLanguage(){
  const ids={tool:'speed-change-tool-label',eyebrow:'speed-change-eyebrow',title:'speed-change-title',hint:'speed-change-hint',primary:'speed-current-primary-label',secondary:'speed-current-secondary-label',w1:'speed-w1-label',w2:'speed-w2-label',minutes:'speed-minutes-label',targetSpeed:'speed-target-speed-label',targetBW:'speed-target-bw-label',currentOutput:'speed-current-output-label',targetOutput:'speed-target-output-label',result:'speed-result-title',setSWrap:'speed-set-swrap-label',setPrimary:'speed-set-primary-label',setSecondary:'speed-set-secondary-label',setHeat:'speed-set-heat-label',qualityTitle:'speed-quality-title',theoretical:'speed-theoretical-title',theoreticalPrimary:'speed-theoretical-primary-label',theoreticalSecondary:'speed-theoretical-secondary-label',theoreticalSWrap:'speed-theoretical-swrap-label',note:'speed-change-note',close:'speed-change-cancel',suggest:'speed-change-suggest'};
  Object.entries(ids).forEach(([key,id])=>{if($(id))$(id).textContent=speedChangeCopy(key);});
}
function currentLastBW(){
  const direct=Number(state.lastCompletedCut?.averageBW);
  if(positive(direct))return direct;
  try{const saved=JSON.parse(lineGet(LAST_COMPLETED_CUT_KEY)||'null');const bw=Number(saved?.averageBW);if(positive(bw))return bw;}catch(_){}
  const bw=Number($('bw-result')?.textContent);return positive(bw)?bw:null;
}
function speedChangeValues(){return {primaryRPM:Number($('speed-current-primary')?.value),secondaryRPM:Number($('speed-current-secondary')?.value),w1:Number($('speed-w1')?.value),w2:Number($('speed-w2')?.value),minutes:Number($('speed-minutes')?.value),targetSpeed:Number($('speed-target-speed')?.value),targetBW:Number($('speed-target-bw')?.value)};}
function speedChangeCurrentOutput(v=speedChangeValues()){return positive(v.w1,v.w2,v.minutes)?((v.w1+v.w2)*60/v.minutes):null;}
function speedChangeTargetOutput(v=speedChangeValues()){
  const currentOutput=speedChangeCurrentOutput(v),currentSpeed=Number(state.currentSWrap),lastBW=currentLastBW();
  if(!positive(currentOutput,currentSpeed,v.targetSpeed,lastBW,v.targetBW))return null;
  return currentOutput*(v.targetSpeed/currentSpeed)*(v.targetBW/lastBW);
}
function renderSpeedChangeContext(){
  const speed=Number(state.currentSWrap),lastBW=currentLastBW(),product=state.activeShift?.product||state.product||'—';
  if($('speed-change-context'))$('speed-change-context').textContent=chatLang(
    `Line ${ACTIVE_LINE} • Product ${product} • Current speed ${positive(speed)?fmt(speed,1):'—'} ft/min • Last BW ${positive(lastBW)?fmt(lastBW,3):'—'}`,
    `Line ${ACTIVE_LINE} • Producto ${product} • Velocidad actual ${positive(speed)?fmt(speed,1):'—'} ft/min • Last BW ${positive(lastBW)?fmt(lastBW,3):'—'}`,
    `Line ${ACTIVE_LINE} • Produit ${product} • Vitesse ${positive(speed)?fmt(speed,1):'—'} • Last BW ${positive(lastBW)?fmt(lastBW,3):'—'}`
  );
}
function updateSpeedChangePreview(){
  const v=speedChangeValues(),currentOutput=speedChangeCurrentOutput(v),targetOutput=speedChangeTargetOutput(v);
  if($('speed-current-output'))$('speed-current-output').textContent=positive(currentOutput)?fmt(currentOutput,0):'—';
  if($('speed-target-output'))$('speed-target-output').textContent=positive(targetOutput)?fmt(targetOutput,0):'—';
  $('speed-change-result')?.classList.add('hidden');
}
function openSpeedChangeDialog(){
  if(!requireActiveShift({openStart:true}))return false;
  closeToolMenu();renderSpeedChangeLanguage();renderSpeedChangeContext();
  ['speed-current-primary','speed-current-secondary','speed-w1','speed-w2','speed-minutes','speed-target-speed'].forEach(id=>{if($(id))$(id).value='';});
  const lastBW=currentLastBW();if($('speed-target-bw'))$('speed-target-bw').value=positive(lastBW)?String(Number(lastBW.toFixed(3))):'';
  updateSpeedChangePreview();
  const box=$('speed-change-dialog');if(!box)return;box.classList.remove('hidden');box.setAttribute('aria-hidden','false');
  setTimeout(()=>$('speed-current-primary')?.focus(),60);
}
function closeSpeedChangeDialog(){const box=$('speed-change-dialog');if(!box)return;box.classList.add('hidden');box.setAttribute('aria-hidden','true');}
function speedChangeHumor(rec){
  if(!rec?.qualityLimited||state.personality==='professional'||state.personality==='off')return '';
  if(rec.limitingComponent==='primary')return chatLang(
    `You can ask for ${fmt(rec.theoreticalPrimaryRPM,1)} RPM… but the Primary already gave you everything it has. 😅 The machine stops at ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`,
    `Puedes pedir ${fmt(rec.theoreticalPrimaryRPM,1)} RPM… pero el Primary ya dio todo lo que tiene. 😅 La máquina se queda en ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`,
    `Vous pouvez demander ${fmt(rec.theoreticalPrimaryRPM,1)} RPM… mais le Primary a déjà tout donné. 😅 La machine s'arrête à ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`
  );
  if(rec.limitingComponent==='both')return chatLang(
    `The math can keep asking for more… the machine and the Secondary have both called it a day. 😅`,
    `Las matemáticas pueden seguir pidiendo más… pero la máquina y el Secondary ya dijeron hasta aquí. 😅`,
    `Les maths peuvent demander davantage… la machine et le Secondary ont déjà dit stop. 😅`
  );
  return chatLang(
    `Mathematically, sure… if you can cool the material by blowing on it. 😁 The theoretical numbers are shown for reference, not as a quality-approved setpoint.`,
    `Matemáticamente sí… si puedes enfriar el material soplándole. 😁 Los números teóricos están ahí como referencia, no como setpoint aprobado para buena calidad.`,
    `Mathématiquement oui… si vous pouvez refroidir le matériau en soufflant dessus. 😁 Les valeurs théoriques sont seulement une référence.`
  );
}
function runSpeedChangeSuggestion(){
  const v=speedChangeValues(),currentSpeed=Number(state.currentSWrap),lastBW=currentLastBW(),currentOutput=speedChangeCurrentOutput(v);
  if(!positive(currentSpeed)){showToast(chatLang('Current line speed is missing. Start/set the line S-Wrap first.','Falta la velocidad actual de línea. Primero fija el S-Wrap de la línea.','Vitesse actuelle manquante.'));return;}
  if(!positive(lastBW)){showToast(chatLang('Last BW is missing. Complete a two-winder BW cut first.','Falta Last BW. Completa primero un BW de los dos winders.','Last BW manquant.'));return;}
  if(!positive(v.primaryRPM,v.secondaryRPM,v.w1,v.w2,v.minutes,v.targetSpeed,v.targetBW,currentOutput)){showToast(chatLang('Complete Primary, Secondary, both roll weights, run time, desired speed and Desired BW.','Completa Primary, Secondary, los dos pesos, el tiempo, la velocidad deseada y el BW deseado.','Complétez tous les champs.'));return;}
  const rec=state.processLearning.recommendForSpeedChange({currentPrimaryRPM:v.primaryRPM,currentSecondaryRPM:v.secondaryRPM,currentSWrap:currentSpeed,targetSWrap:v.targetSpeed,currentBW:lastBW,targetBW:v.targetBW,product:state.activeShift?.product||state.product||'',mandrel:currentMandrel('bw'),currentOutputLbHr:currentOutput});
  if(!rec.ready){showToast(chatLang('I could not calculate the speed-change starting point.','No pude calcular el starting point del cambio de velocidad.','Calcul impossible.'));return;}
  const recommendedSWrap=positive(rec.maxRecommendedSWrap)?Number(rec.maxRecommendedSWrap):Number(v.targetSpeed);
  $('speed-set-swrap').textContent=fmt(recommendedSWrap,1);
  $('speed-set-primary').textContent=fmt(rec.primaryRPM,1);$('speed-set-secondary').textContent=fmt(rec.secondaryRPM,1);$('speed-set-heat').textContent=positive(rec.secondaryHeat)?fmt(rec.secondaryHeat,0):'—';
  if($('speed-target-output'))$('speed-target-output').textContent=positive(rec.targetOutputLbHr)?fmt(rec.targetOutputLbHr,0):fmt(speedChangeTargetOutput(v),0);
  const qualityBox=$('speed-quality-alert'),theoreticalBox=$('speed-theoretical'),humorBox=$('speed-quality-humor');
  if(rec.qualityLimited){
    qualityBox?.classList.remove('hidden');theoreticalBox?.classList.remove('hidden');
    $('speed-theoretical-primary').textContent=fmt(rec.theoreticalPrimaryRPM,1);$('speed-theoretical-secondary').textContent=fmt(rec.theoreticalSecondaryRPM,1);$('speed-theoretical-swrap').textContent=fmt(v.targetSpeed,1);
    const primaryLimited=rec.limitingComponent==='primary',bothLimited=rec.limitingComponent==='both';
    const limitText=primaryLimited
      ?chatLang(`Primary reaches the machine-enforced maximum of ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM first. The machine will not allow Primary above ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`,`Primary llega primero al máximo real de la máquina de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM. La máquina no permite pasar de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`,`Primary atteint d'abord la limite réelle de la machine de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM.`)
      :bothLimited
        ?chatLang(`Primary reaches the machine maximum of ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM while Secondary reaches its 13.0 RPM quality cap.`,`Primary llega al máximo de máquina de ${fmt(rec.qualityMaxPrimaryRPM,0)} RPM al mismo tiempo que Secondary llega a su límite de calidad de 13.0 RPM.`,`Primary atteint sa limite machine pendant que Secondary atteint sa limite qualité.`)
        :chatLang(`Secondary would need ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, above the 13.0 RPM quality cap.`,`Secondary necesitaría ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, por encima del límite de calidad de 13.0 RPM.`,`Secondary demanderait ${fmt(rec.theoreticalSecondaryRPM,1)} RPM, au-dessus de la limite qualité de 13,0 RPM.`);
    if($('speed-quality-title'))$('speed-quality-title').textContent=primaryLimited?chatLang('MACHINE LIMIT — REQUEST NOT POSSIBLE','LÍMITE DE MÁQUINA — SOLICITUD NO POSIBLE','LIMITE MACHINE — DEMANDE IMPOSSIBLE'):bothLimited?chatLang('MACHINE + QUALITY LIMITS','LÍMITES DE MÁQUINA + CALIDAD','LIMITES MACHINE + QUALITÉ'):chatLang('QUALITY LIMIT — REQUEST NOT RECOMMENDED','LÍMITE DE CALIDAD — SOLICITUD NO RECOMENDADA','LIMITE QUALITÉ — DEMANDE NON RECOMMANDÉE');
    if($('speed-theoretical-title'))$('speed-theoretical-title').textContent=primaryLimited?chatLang('THEORETICAL REQUIREMENT — ABOVE MACHINE LIMIT','REQUERIMIENTO TEÓRICO — ARRIBA DEL LÍMITE DE MÁQUINA','BESOIN THÉORIQUE — AU-DESSUS DE LA LIMITE MACHINE'):chatLang('THEORETICAL REQUIREMENT — NOT RECOMMENDED','REQUERIMIENTO TEÓRICO — NO RECOMENDADO','BESOIN THÉORIQUE — NON RECOMMANDÉ');
    $('speed-quality-message').textContent=primaryLimited?chatLang(
      `${limitText} The requested ${fmt(v.targetSpeed,1)} ft/min would require Primary ${fmt(rec.theoreticalPrimaryRPM,1)} RPM, so it cannot be reached with this coordinated relationship. Maximum coordinated starting point: S-Wrap ${fmt(recommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.`,
      `${limitText} La velocidad solicitada de ${fmt(v.targetSpeed,1)} ft/min pediría Primary ${fmt(rec.theoreticalPrimaryRPM,1)} RPM, así que no se puede alcanzar con esta relación coordinada. Máximo starting point coordinado: S-Wrap ${fmt(recommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.`,
      `${limitText} La vitesse demandée nécessiterait Primary ${fmt(rec.theoreticalPrimaryRPM,1)} RPM. Maximum coordonné : S-Wrap ${fmt(recommendedSWrap,1)} • Primary ${fmt(rec.primaryRPM,1)} • Secondary ${fmt(rec.secondaryRPM,1)}.`
    ):chatLang(
      `${limitText} The requested ${fmt(v.targetSpeed,1)} ft/min is not recommended for maintaining good roll quality. Maximum coordinated starting point: S-Wrap ${fmt(recommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.`,
      `${limitText} No recomiendo correr a ${fmt(v.targetSpeed,1)} ft/min si quieres mantener buena calidad. Máximo starting point coordinado: S-Wrap ${fmt(recommendedSWrap,1)} ft/min • Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM.`,
      `${limitText} La vitesse ${fmt(v.targetSpeed,1)} ft/min n’est pas recommandée pour maintenir la qualité. Maximum coordonné : S-Wrap ${fmt(recommendedSWrap,1)} • Primary ${fmt(rec.primaryRPM,1)} • Secondary ${fmt(rec.secondaryRPM,1)}.`
    );
    const joke=speedChangeHumor(rec);if(joke){humorBox.textContent=joke;humorBox.classList.remove('hidden');}else{humorBox.textContent='';humorBox.classList.add('hidden');}
  }else{qualityBox?.classList.add('hidden');theoreticalBox?.classList.add('hidden');humorBox?.classList.add('hidden');}
  const secDelta=Number(rec.secondaryRPM)-Number(v.secondaryRPM);let heatGuide='';
  if(secDelta<-0.08)heatGuide=chatLang(`Secondary is slowing down, so friction/shear heat will decrease. Raise Secondary Heat toward ~${fmt(rec.secondaryHeat,0)}°F as a starting point, then verify melt/load.`,`El Secondary va a bajar, así que habrá menos friction/shear heat. Sube Secondary Heat hacia ~${fmt(rec.secondaryHeat,0)}°F como starting point y luego verifica melt/load.`,`Secondary ralentit : augmenter la chaleur vers ~${fmt(rec.secondaryHeat,0)}°F.`);
  else if(secDelta>0.08)heatGuide=chatLang(`Secondary is speeding up, so friction/shear heat will increase. Lower Secondary Heat toward ~${fmt(rec.secondaryHeat,0)}°F as a starting point, then verify melt/load.`,`El Secondary va a subir, así que habrá más friction/shear heat. Baja Secondary Heat hacia ~${fmt(rec.secondaryHeat,0)}°F como starting point y luego verifica melt/load.`,`Secondary accélère : réduire la chaleur vers ~${fmt(rec.secondaryHeat,0)}°F.`);
  else heatGuide=chatLang(`Secondary RPM changes very little. Keep Secondary Heat near ~${fmt(rec.secondaryHeat,0)}°F initially and verify melt/load.`,`El Secondary casi no cambia. Mantén Secondary Heat cerca de ~${fmt(rec.secondaryHeat,0)}°F inicialmente y verifica melt/load.`,`Peu de changement Secondary : maintenir la chaleur près de ~${fmt(rec.secondaryHeat,0)}°F.`);
  if(rec.frictionHeatCaution)heatGuide+=' '+chatLang('Secondary is near the 13 RPM quality cap; watch friction/shear heat closely.','Secondary está cerca del límite de calidad de 13 RPM; vigila de cerca el friction/shear heat.','Secondary près de 13 RPM : surveiller friction heat.');
  $('speed-heat-guidance').textContent=heatGuide;
  $('speed-pressure-note').textContent=positive(rec.expectedPrimaryPressure)?chatLang(`Expected Primary Pressure ~${fmt(rec.expectedPrimaryPressure,0)} • margin to 5,500 shutdown ~${fmt(rec.pressureMargin,0)}.`,`Primary Pressure esperada ~${fmt(rec.expectedPrimaryPressure,0)} • margen al shutdown de 5,500 ~${fmt(rec.pressureMargin,0)}.`,`Pression Primary prévue ~${fmt(rec.expectedPrimaryPressure,0)}.`):chatLang('Pressure prediction is not learned yet. Verify actual Primary Pressure after the change; high-pressure shutdown is 5,500.','La presión todavía no está aprendida. Verifica Primary Pressure real después del cambio; high-pressure shutdown = 5,500.','Pression non apprise; vérifier après le changement.');
  $('speed-result-method').textContent=rec.qualityLimited?(rec.limitingComponent==='primary'?chatLang('MACHINE LIMITED','LÍMITE DE MÁQUINA','LIMITE MACHINE'):rec.limitingComponent==='both'?chatLang('MACHINE + QUALITY LIMITED','MÁQUINA + CALIDAD','MACHINE + QUALITÉ'):chatLang('QUALITY LIMITED','LÍMITE DE CALIDAD','LIMITE QUALITÉ')):(rec.method==='learned-search'?chatLang('LEARNED','APRENDIDO','APPRIS'):chatLang('STARTING POINT','PUNTO INICIAL','POINT INITIAL'));
  const bwText=Math.abs(v.targetBW-lastBW)<0.005?chatLang('same BW','mismo BW','même BW'):chatLang(`BW ${fmt(lastBW,3)} → ${fmt(v.targetBW,3)}`,`BW ${fmt(lastBW,3)} → ${fmt(v.targetBW,3)}`,`BW ${fmt(lastBW,3)} → ${fmt(v.targetBW,3)}`);
  const maxOutputText=rec.qualityLimited&&positive(rec.maxRecommendedOutputLbHr)?(rec.limitingComponent==='primary'?chatLang(` Machine-limited output ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/hr.`,` Output limitado por máquina ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/hr.`,` Débit limité machine ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/h.`):chatLang(` Quality-limited output ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/hr.`,` Output limitado por calidad ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/hr.`,` Débit limité qualité ~${fmt(rec.maxRecommendedOutputLbHr,0)} lb/h.`)):'';
  $('speed-result-source').textContent=chatLang(`Current ${fmt(currentSpeed,1)} → requested ${fmt(v.targetSpeed,1)} ft/min • ${bwText} • current output ${fmt(currentOutput,0)} → requested output ${fmt(rec.targetOutputLbHr,0)} lb/hr.${maxOutputText} ${rec.qualityLimited?'The theoretical RPMs are reference only — do not use them as approved setpoints.':rec.method==='learned-search'?`Learned from ${rec.comparableSamples} comparable samples, confidence ${rec.confidence}%.`:'Proportional starting point; Viejito will improve with real process history.'}`,`Actual ${fmt(currentSpeed,1)} → solicitada ${fmt(v.targetSpeed,1)} ft/min • ${bwText} • output actual ${fmt(currentOutput,0)} → output solicitado ${fmt(rec.targetOutputLbHr,0)} lb/hr.${maxOutputText} ${rec.qualityLimited?'Los RPM teóricos son solo referencia — no los uses como setpoints aprobados.':rec.method==='learned-search'?`Aprendido de ${rec.comparableSamples} muestras comparables, confianza ${rec.confidence}%.`:'Starting point proporcional; Viejito mejorará con historial real.'}`,`Vitesse ${fmt(currentSpeed,1)} → demandée ${fmt(v.targetSpeed,1)} • débit ${fmt(currentOutput,0)} → ${fmt(rec.targetOutputLbHr,0)} lb/h.${maxOutputText}`);
  $('speed-change-result')?.classList.remove('hidden');
  addHistory(chatLang('Speed change','Cambio velocidad','Changement vitesse'),`${fmt(currentSpeed,1)}→${fmt(v.targetSpeed,1)} requested • max ${fmt(recommendedSWrap,1)} • BW ${fmt(lastBW,3)}→${fmt(v.targetBW,3)} • theoretical P ${fmt(rec.theoreticalPrimaryRPM,1)} S ${fmt(rec.theoreticalSecondaryRPM,1)} • recommended P ${fmt(rec.primaryRPM,1)} S ${fmt(rec.secondaryRPM,1)}`);
}

function formatProcessRecord(row){
  const locale=state.language==='es'?'es-US':state.language==='fr'?'fr-FR':'en-US';
  let when='';try{when=new Date(row.timestamp).toLocaleString(locale,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch(_){when=relativeTime(row.timestamp);}
  const product=row.product?` • ${row.product}`:'',pressure=positive(row.primaryPressure)?` • PSI ${fmt(row.primaryPressure,0)}`:'';
  const bw=positive(row.measuredBW)?` • BW avg ${fmt(row.measuredBW,3)}`:'';
  return `${when}${product} • Primary ${fmt(row.primaryRPM,1)} • Secondary ${fmt(row.secondaryRPM,1)} • Roll 1 ${fmt(row.winder1Weight,0)} lb • Roll 2 ${fmt(row.winder2Weight,0)} lb • ${fmt(row.runMinutes,1)} min • ${fmt(row.outputLbHr,0)} lb/hr • S-Wrap ${fmt(row.swrapSpeed,1)}${bw}${pressure}`;
}
function manualProcessHistoryChatQuery(text){
  const q=normalizeKnowledgeQuery(text),primary=labeledProcessNumber(text,'primary'),secondary=labeledProcessNumber(text,'secondary');
  const asksRecords=/\b(manual|record|records|registro|registros|corrida|corridas|run history|process history|historial de proceso|datos de proceso|process data|qué información|que informacion|what information|what data|tuve|tuvimos|hicimos|se hicieron|produje|produjimos|produced|did i make|did we make|pesaron|peso de los rollos|roll weights|tardaron|cuanto tiempo|how long)\b/.test(q);
  const asksBest=/\b(most output|highest output|best output|produced most|más output|mas output|más producción|mas produccion|produjo más|produjo mas|mayor producción|mayor produccion)\b/.test(q);
  const asksLatest=/\b(latest|last|recent|última|ultima|últimas|ultimas|reciente|recientes)\b/.test(q)&&/\b(record|registro|corrida|run|process|proceso)\b/.test(q);
  if(!asksRecords&&!asksBest&&!asksLatest)return null;
  let rows=(state.processLearning?.records||[]).filter(r=>r&&r.entrySource==='manual'&&positive(r.primaryRPM,r.secondaryRPM,r.outputLbHr));
  if(!rows.length)return {kind:'info',title:chatLang('Manual Process Records','Registros manuales de proceso','Journaux manuels'),message:chatLang(`Line ${ACTIVE_LINE} does not have manual process records yet. Open Tools → Process Record to save one.`,`Line ${ACTIVE_LINE} todavía no tiene registros manuales. Abre Tools → Registro de proceso para guardar uno.`,`Aucun journal manuel pour Line ${ACTIVE_LINE}.`)};
  if(positive(primary))rows=rows.filter(r=>Math.abs(Number(r.primaryRPM)-primary)<=0.6);
  if(positive(secondary))rows=rows.filter(r=>Math.abs(Number(r.secondaryRPM)-secondary)<=0.12);
  if(!rows.length)return {kind:'info',title:chatLang('No matching process record','No encontré una corrida igual','Aucun journal correspondant'),message:chatLang('I have manual records, but none match those Primary/Secondary settings on this line.','Tengo registros manuales, pero ninguno coincide con esos valores de Primary/Secondary en esta línea.','Aucun enregistrement ne correspond à ces réglages.')};
  if(asksBest){const best=[...rows].sort((x,y)=>Number(y.outputLbHr)-Number(x.outputLbHr))[0];return {kind:'result',title:chatLang('Highest manual output','Mayor output manual','Débit manuel maximal'),message:formatProcessRecord(best)};}
  const sorted=[...rows].sort((x,y)=>new Date(y.timestamp)-new Date(x.timestamp)),shown=sorted.slice(0,5);
  const avg=shown.reduce((sum,r)=>sum+Number(r.outputLbHr),0)/shown.length;
  const prefix=positive(primary)&&positive(secondary)
    ?chatLang(`${rows.length} matching manual run(s). Average output ${fmt(avg,0)} lb/hr.`,`${rows.length} corrida(s) manual(es) coinciden. Output promedio ${fmt(avg,0)} lb/hr.`,`${rows.length} production(s) correspondante(s). Débit moyen ${fmt(avg,0)} lb/h.`)
    :chatLang(`Latest ${shown.length} manual process record(s) on Line ${ACTIVE_LINE}.`,`Últimos ${shown.length} registro(s) manual(es) de Line ${ACTIVE_LINE}.`,`Derniers ${shown.length} journaux manuels de Line ${ACTIVE_LINE}.`);
  return {kind:'result',title:chatLang('Manual Process Records','Registros manuales de proceso','Journaux manuels'),message:`${prefix}\n${shown.map(formatProcessRecord).join('\n')}`};
}


function processProductKey(value){return String(value||'').trim().toUpperCase().replace(/\s+/g,' ');}
function findProcessRecordForCut({w1Weight=null,w2Weight=null,product='',swrap=null,recordId=null}={}){
  if(recordId&&state.processLearning?.byId){
    const direct=state.processLearning.byId(recordId);if(direct)return direct;
  }
  const rows=[...(state.processLearning?.records||[])].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  const pKey=processProductKey(product),a=Number(w1Weight),b=Number(w2Weight),speed=Number(swrap),now=Date.now();
  const sameContext=r=>{
    if(pKey&&processProductKey(r.product)&&processProductKey(r.product)!==pKey)return false;
    if(positive(speed)&&positive(r.swrapSpeed)&&Math.abs(Number(r.swrapSpeed)-speed)>1.1)return false;
    return true;
  };
  if(positive(a,b)){
    const exact=rows.find(r=>{
      if(!sameContext(r)||!positive(r.winder1Weight,r.winder2Weight))return false;
      const age=now-new Date(r.timestamp||0).getTime();if(!Number.isFinite(age)||age<0||age>12*60*60*1000)return false;
      const r1=Number(r.winder1Weight),r2=Number(r.winder2Weight);
      const directErr=Math.abs(r1-a)+Math.abs(r2-b),swapErr=Math.abs(r1-b)+Math.abs(r2-a);
      const tolerance=Math.max(4,(a+b)*0.008);
      return Math.min(directErr,swapErr)<=tolerance;
    });
    if(exact)return exact;
    return null;
  }
  return rows.find(r=>{
    if(!sameContext(r))return false;
    const age=now-new Date(r.timestamp||0).getTime();
    return Number.isFinite(age)&&age>=0&&age<=30*60*1000;
  })||null;
}
function bindProcessRecordToCompletedCut(cut={}){
  const record=findProcessRecordForCut({w1Weight:cut.winder1Weight,w2Weight:cut.winder2Weight,product:cut.product,swrap:cut.currentSWrap,recordId:cut.processRecordId});
  if(!record)return null;
  const updated=state.processLearning?.update?.(record.id,{measuredBW:cut.averageBW,winder1BW:cut.winder1,winder2BW:cut.winder2,targetBW:cut.targetBW})||record;
  return updated;
}
function buildBWProcessSetpointAdvisor(cut=state.lastCompletedCut||null){
  const actual=Number(cut?.averageBW),target=Number(cut?.targetBW||state.targetBW),swrap=Number(cut?.currentSWrap||state.currentSWrap);
  if(!positive(actual,target,swrap))return {ready:false,reason:'no-cut'};
  const record=findProcessRecordForCut({w1Weight:cut?.winder1Weight,w2Weight:cut?.winder2Weight,product:cut?.product||state.product,swrap,recordId:cut?.processRecordId});
  if(!record)return {ready:false,reason:'missing-process-record',actualBW:actual,targetBW:target,currentSWrap:swrap};
  const rec=state.processLearning.recommendForBWCorrection({
    currentPrimaryRPM:record.primaryRPM,currentSecondaryRPM:record.secondaryRPM,currentSWrap:swrap,
    actualBW:actual,targetBW:target,product:cut?.product||state.product||'',mandrel:cut?.mandrel||currentMandrel('bw'),
    currentOutputLbHr:record.outputLbHr,currentPrimaryPressure:record.primaryPressure,holdTolerance:.17
  });
  return rec.ready?{ready:true,record,rec,cut}:{ready:false,reason:rec.reason||'unavailable',record,cut};
}
function processSetpointChatResult(advisor=buildBWProcessSetpointAdvisor()){
  if(!advisor?.ready){
    if(advisor?.reason==='missing-process-record')return {kind:'info',title:chatLang('Primary + Secondary Setpoint','Setpoint Primary + Secondary','Setpoint Primary + Secondary'),message:chatLang(
      'The BW cut is complete, but I need the current Primary RPM, Secondary RPM, both roll weights and run time from Tools → Process Record before I can calculate coordinated setpoints.',
      'El BW ya está completo, pero necesito el Primary RPM, Secondary RPM, los dos pesos y el tiempo de esta corrida en Tools → Registro de proceso para calcular los setpoints coordinados.',
      'Le BW est complet, mais il manque le journal de procédé de cette coupe.'
    )};
    return {kind:'info',message:chatLang('Complete both winders first so I have the actual average BW.','Primero completa los dos winders para tener el BW promedio real.','Terminez les deux winders.')};
  }
  const {rec}=advisor;
  const action=rec.hold
    ?chatLang(`HOLD current settings: Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM. Keep S-Wrap ${fmt(rec.currentSWrap,1)} ft/min.`,`MANTÉN los ajustes actuales: Primary ${fmt(rec.primaryRPM,1)} RPM • Secondary ${fmt(rec.secondaryRPM,1)} RPM. Mantén S-Wrap ${fmt(rec.currentSWrap,1)} ft/min.`,`Garder Primary ${fmt(rec.primaryRPM,1)} / Secondary ${fmt(rec.secondaryRPM,1)}.`)
    :chatLang(`Keep S-Wrap ${fmt(rec.currentSWrap,1)} ft/min. Set Primary to ${fmt(rec.primaryRPM,1)} RPM and Secondary to ${fmt(rec.secondaryRPM,1)} RPM.`,`Mantén S-Wrap en ${fmt(rec.currentSWrap,1)} ft/min. Pon Primary en ${fmt(rec.primaryRPM,1)} RPM y Secondary en ${fmt(rec.secondaryRPM,1)} RPM.`,`Garder S-Wrap ${fmt(rec.currentSWrap,1)}. Régler Primary ${fmt(rec.primaryRPM,1)} / Secondary ${fmt(rec.secondaryRPM,1)}.`);
  const heat=positive(rec.secondaryHeat)?chatLang(` Secondary Heat start ~${fmt(rec.secondaryHeat,0)}.`,` Secondary Heat inicial ~${fmt(rec.secondaryHeat,0)}.`,` Secondary Heat ~${fmt(rec.secondaryHeat,0)}.`):'';
  const output=positive(rec.targetOutputLbHr)?chatLang(` Target output ~${fmt(rec.targetOutputLbHr,0)} lb/hr.`,` Output objetivo ~${fmt(rec.targetOutputLbHr,0)} lb/hr.`,` Débit cible ~${fmt(rec.targetOutputLbHr,0)} lb/h.`):'';
  const pressure=positive(rec.expectedPrimaryPressure)?chatLang(` Expected Primary Pressure ~${fmt(rec.expectedPrimaryPressure,0)}; margin to 5,500 ~${fmt(rec.pressureMargin,0)}.`,` Primary Pressure esperada ~${fmt(rec.expectedPrimaryPressure,0)}; margen a 5,500 ~${fmt(rec.pressureMargin,0)}.`,` Pression Primary prévue ~${fmt(rec.expectedPrimaryPressure,0)}.`):chatLang(' Verify actual Primary Pressure after the move; pressure prediction is not learned yet.',' Verifica la Primary Pressure real después del cambio; todavía no hay suficiente aprendizaje de presión.',' Vérifier la pression réelle.');
  return {kind:'result',title:chatLang('Primary + Secondary Setpoint','Setpoint Primary + Secondary','Setpoint Primary + Secondary'),message:`${action}${heat}${output}${pressure}`,meta:chatLang(`Actual BW ${fmt(rec.actualBW,3)} • Target ${fmt(rec.targetBW,3)} • ${rec.method==='learned-search'?`learned search, ${rec.comparableSamples} comparable sample(s), ${rec.confidence}% confidence`:'proportional starting point'}.`,`BW real ${fmt(rec.actualBW,3)} • Target ${fmt(rec.targetBW,3)} • ${rec.method==='learned-search'?`búsqueda aprendida, ${rec.comparableSamples} muestras, ${rec.confidence}% confianza`:'punto inicial proporcional'}.`,`BW réel ${fmt(rec.actualBW,3)} • Cible ${fmt(rec.targetBW,3)}.`)};
}
function renderBWProcessSetpointPanel(advisor=buildBWProcessSetpointAdvisor()){
  const box=$('process-setpoint-panel');if(!box)return;
  box.classList.remove('hidden','hold','adjust','missing');
  if(!advisor?.ready){
    if(advisor?.reason==='no-cut'){box.classList.add('hidden');return;}
    box.classList.add('missing');
    $('process-setpoint-badge').textContent=chatLang('NEED PROCESS RECORD','FALTA REGISTRO','JOURNAL REQUIS');
    $('process-setpoint-instruction').textContent=chatLang(
      'BW is complete. Save the current Primary, Secondary, both roll weights and run time in Tools → Process Record so Viejito can calculate the coordinated setpoints.',
      'El BW está completo. Guarda Primary, Secondary, los dos pesos y el tiempo en Tools → Registro de proceso para que Viejito calcule los setpoints coordinados.',
      'BW complet. Enregistrez Primary, Secondary, poids et temps.'
    );
    ['process-current-primary','process-current-secondary','process-set-primary','process-set-secondary','process-set-heat','process-target-output'].forEach(id=>{if($(id))$(id).textContent='—';});
    $('process-pressure-note').textContent=chatLang('Primary/Secondary recommendation unavailable until the process record is linked to this cut.','La recomendación de Primary/Secondary estará disponible cuando este corte quede ligado al registro de proceso.','Recommandation indisponible sans journal de procédé.');
    $('process-setpoint-source').textContent='';
    return;
  }
  const {rec}=advisor;
  box.classList.add(rec.hold?'hold':'adjust');
  $('process-setpoint-badge').textContent=rec.hold?chatLang('HOLD','MANTÉN','GARDER'):chatLang('SETPOINT CHANGE','CAMBIO DE SETPOINT','CHANGER SETPOINT');
  $('process-setpoint-instruction').textContent=rec.hold
    ?chatLang(`BW ${fmt(rec.actualBW,3)} is within ±0.17 of target ${fmt(rec.targetBW,3)}. Keep S-Wrap ${fmt(rec.currentSWrap,1)}, Primary ${fmt(rec.primaryRPM,1)} and Secondary ${fmt(rec.secondaryRPM,1)}.`,`BW ${fmt(rec.actualBW,3)} está dentro de ±0.17 del target ${fmt(rec.targetBW,3)}. Mantén S-Wrap ${fmt(rec.currentSWrap,1)}, Primary ${fmt(rec.primaryRPM,1)} y Secondary ${fmt(rec.secondaryRPM,1)}.`,`BW dans la plage. Garder les réglages.`)
    :chatLang(`Keep S-Wrap ${fmt(rec.currentSWrap,1)}. Set Primary to ${fmt(rec.primaryRPM,1)} RPM and Secondary to ${fmt(rec.secondaryRPM,1)} RPM to move average BW toward ${fmt(rec.targetBW,3)}.`,`Mantén S-Wrap ${fmt(rec.currentSWrap,1)}. Pon Primary en ${fmt(rec.primaryRPM,1)} RPM y Secondary en ${fmt(rec.secondaryRPM,1)} RPM para llevar el BW promedio hacia ${fmt(rec.targetBW,3)}.`,`Garder S-Wrap. Régler Primary ${fmt(rec.primaryRPM,1)} / Secondary ${fmt(rec.secondaryRPM,1)}.`);
  $('process-current-primary').textContent=fmt(rec.currentPrimaryRPM,1);
  $('process-current-secondary').textContent=fmt(rec.currentSecondaryRPM,1);
  $('process-set-primary').textContent=fmt(rec.primaryRPM,1);
  $('process-set-secondary').textContent=fmt(rec.secondaryRPM,1);
  $('process-set-heat').textContent=positive(rec.secondaryHeat)?`~${fmt(rec.secondaryHeat,0)}`:'—';
  $('process-target-output').textContent=positive(rec.targetOutputLbHr)?`~${fmt(rec.targetOutputLbHr,0)}`:'—';
  $('process-pressure-note').textContent=positive(rec.expectedPrimaryPressure)
    ?chatLang(`Expected Primary Pressure ~${fmt(rec.expectedPrimaryPressure,0)} • margin to 5,500 shutdown ~${fmt(rec.pressureMargin,0)}.`,`Primary Pressure esperada ~${fmt(rec.expectedPrimaryPressure,0)} • margen al shutdown de 5,500 ~${fmt(rec.pressureMargin,0)}.`,`Pression Primary prévue ~${fmt(rec.expectedPrimaryPressure,0)}.`)
    :chatLang('Pressure prediction is not learned yet. Verify actual Primary Pressure, melt and motor load after the coordinated change.','La presión todavía no está aprendida. Verifica Primary Pressure, melt y motor load reales después del cambio coordinado.','Pression non apprise; vérifier les valeurs réelles.');
  const source=rec.method==='learned-search'
    ?chatLang(`Learned from ${rec.comparableSamples} comparable sample(s) • confidence ${rec.confidence}%.`,`Aprendido de ${rec.comparableSamples} muestra(s) comparable(s) • confianza ${rec.confidence}%.`,`Appris de ${rec.comparableSamples} échantillons.`)
    :rec.hold?chatLang('Within the ±0.17 green BW band.','Dentro de la banda verde de BW ±0.17.','Dans la bande verte ±0,17.')
    :chatLang('Proportional starting point; Viejito will improve it as real process records accumulate.','Punto inicial proporcional; Viejito lo irá mejorando con registros reales de proceso.','Point de départ proportionnel.');
  const limits=(rec.primaryAtLimit||rec.secondaryAtLimit)?chatLang(' One setpoint reached the normal production range limit.',' Uno de los setpoints llegó al límite del rango normal de producción.',' Limite de plage atteinte.'):'';
  const friction=rec.frictionHeatCaution?chatLang(' Secondary >12.5 RPM: watch friction/shear heat.',' Secondary >12.5 RPM: vigila friction/shear heat.',' Secondary >12,5 RPM : surveiller friction heat.'):'';
  $('process-setpoint-source').textContent=source+limits+friction;
}
function processSetpointChatQuery(text){
  const q=normalizeKnowledgeQuery(text);
  const asks=/\b(set ?point|setpoint|primary.*secondary|primario.*secundario|primary.*secundario|primario.*secondary)\b/.test(q)&&/\b(what|que|qué|cuanto|cuánto|poner|set|recommended|recommend|debo|should|adjust|ajust)\b/.test(q);
  if(!asks)return null;
  return {kind:'info',title:chatLang('Use S-Wrap first','Primero usa S-Wrap','Utiliser S-Wrap d’abord'),message:chatLang(
    'For a routine BW correction at the current line speed, adjust S-Wrap first. Primary/Secondary changes affect pressure, friction heat, melt, load and output. If the line speed is intentionally being changed, open Tools → Speed Change Advisor for a coordinated starting point. If the required S-Wrap would exceed 228, a coordinated process change may be needed.',
    'Para una corrección normal de BW a la velocidad actual, ajusta primero el S-Wrap. Cambiar Primary/Secondary afecta presión, friction heat, melt, load y output. Si vas a cambiar la velocidad de línea intencionalmente, abre Tools → Speed Change Advisor para obtener un starting point coordinado. Si el S-Wrap requerido pasaría de 228, entonces puede ser necesario cambiar el proceso de forma coordinada.',
    'Pour une correction BW normale, utiliser S-Wrap d’abord. Pour un changement volontaire de vitesse, ouvrir Speed Change Advisor.'
  )};
}

function processPerformanceChatQuery(text){
  const setpoint=processSetpointChatQuery(text); if(setpoint)return setpoint;
  const history=manualProcessHistoryChatQuery(text); if(history)return history;
  const q=normalizeKnowledgeQuery(text);
  const coordinated=parseCoordinatedSpeedRequest(text);
  if(coordinated)return positive(coordinated.primaryRPM,coordinated.secondaryRPM)?coordinatedSpeedRecommendation(coordinated):startCoordinatedSpeedWorkflow(coordinated);
  const primary=labeledProcessNumber(text,'primary'),secondary=labeledProcessNumber(text,'secondary');
  const wantsLearn=/\b(learn output|teach output|record output|save output|learn process|teach process|aprender output|ensenar output|enseñar output|guardar output|aprender proceso|guardar proceso)\b/.test(q);
  if(wantsLearn){
    const seed={primaryRPM:primary,secondaryRPM:secondary,w1:labeledProcessNumber(text,'w1'),w2:labeledProcessNumber(text,'w2'),minutes:labeledProcessNumber(text,'minutes'),swrapSpeed:labeledProcessNumber(text,'swrap')||state.currentSWrap,melt:labeledProcessNumber(text,'melt'),heat:labeledProcessNumber(text,'heat'),load:labeledProcessNumber(text,'load'),pressure:labeledProcessNumber(text,'pressure')};
    if(positive(seed.primaryRPM,seed.secondaryRPM,seed.w1,seed.w2,seed.minutes,seed.swrapSpeed))return saveProcessPerformanceSample(seed);
    return startProcessLearningWorkflow(seed);
  }
  if(!(positive(primary)&&positive(secondary)))return null;
  const sampleW1=labeledProcessNumber(text,'w1'),sampleW2=labeledProcessNumber(text,'w2'),sampleMinutes=labeledProcessNumber(text,'minutes');
  if(positive(sampleW1,sampleW2,sampleMinutes))return saveProcessPerformanceSample({primaryRPM:primary,secondaryRPM:secondary,w1:sampleW1,w2:sampleW2,minutes:sampleMinutes,swrapSpeed:labeledProcessNumber(text,'swrap')||state.currentSWrap,melt:labeledProcessNumber(text,'melt'),heat:labeledProcessNumber(text,'heat'),load:labeledProcessNumber(text,'load'),pressure:labeledProcessNumber(text,'pressure')});
  const troubleshooting=/\b(why|porque|por que|trouble|problem|problema|melt|heat|load|pressure|presion|friction|friccion|hot|cold|caliente|frio|enfriar|cool)\b/.test(q);
  const predictionIntent=/\b(output|rate|lbs|lb hr|bw|basis weight|predict|prediction|predicho|cuanto produce|cuánto produce|que bw|qué bw|s wrap|swrap)\b/.test(q);
  if(troubleshooting&&!predictionIntent)return null;
  {const gate=activeShiftChatGate();if(gate)return gate;}
  const estimate=state.processLearning.estimate({primaryRPM:primary,secondaryRPM:secondary,product:state.activeShift?.product||state.product||'',mandrel:currentMandrel('bw')});
  if(!estimate.ready)return {kind:'info',title:chatLang('Process Performance Learning','Aprendizaje de desempeño del proceso','Apprentissage process'),message:chatLang(
    `I do not have enough real output history yet for Primary ${fmt(primary,1)} / Secondary ${fmt(secondary,1)}. Say “learn output” and I will ask for both roll weights and run time so I can calculate lb/hr and learn this line.`,
    `Todavía no tengo suficiente historial real de output para Primary ${fmt(primary,1)} / Secondary ${fmt(secondary,1)}. Dime “aprender output” y te preguntaré el peso de los dos rollos y cuánto tiempo corrió para calcular lb/hr y aprender esta línea.`,
    `Pas assez d’historique de débit. Dites “learn output”.`)};
  const requestedSpeed=labeledProcessNumber(text,'swrap');
  return processLearningOutputMessage(primary,secondary,estimate,requestedSpeed);
}


function outputRateResult(w1,w2,minutes){
  const gate=activeShiftChatGate();if(gate)return gate;
  const a=Number(w1),b=Number(w2),mins=Number(minutes);
  if(!positive(a,b,mins))return {kind:'error',message:t('invalidNumbers')};
  const output=(a+b)*60/mins;
  const mandrel=currentMandrel('bw');
  const speeds=[];const add=v=>{v=clampSWrap(v);if(positive(v)&&!speeds.includes(v))speeds.push(v);};
  add(state.currentSWrap);add(150);add(200);
  const predictions=speeds.map(speed=>`S-Wrap ${fmt(speed,1)} → BW ${fmt(predictiveBWFromOutput(output,speed,mandrel),3)}`).join(' • ');
  return {kind:'result',title:chatLang('Output calculation','Cálculo de output','Calcul du débit'),message:chatLang(
    `Both rolls: ${fmt(a+b,0)} lb in ${fmt(mins,1)} min → ${fmt(output,0)} lb/hr. ${predictions}.`,
    `Los dos rollos: ${fmt(a+b,0)} lb en ${fmt(mins,1)} min → ${fmt(output,0)} lb/hr. ${predictions}.`,
    `Deux rouleaux : ${fmt(a+b,0)} lb en ${fmt(mins,1)} min → ${fmt(output,0)} lb/h.`
  ),meta:chatLang(`${mandrel}” × 2 = ${totalWebWidthForMandrel(mandrel)}” total width • predictive BW only; completed-roll BW remains final.`,`${mandrel}” × 2 = ${totalWebWidthForMandrel(mandrel)}” de ancho total • BW predictivo; el BW del rollo terminado sigue siendo el valor final.`,`BW prédictif uniquement.`)};
}
function startOutputRateWorkflow(w1=null,w2=null){
  const gate=activeShiftChatGate();if(gate)return gate;
  chatWorkflow={type:'output-rate',stage:'weights',w1:positive(w1)?Number(w1):null,w2:positive(w2)?Number(w2):null,startedAt:new Date().toISOString()};
  if(positive(chatWorkflow.w1,chatWorkflow.w2))chatWorkflow.stage='minutes';
  saveChatWorkflow();
  return {kind:'info',title:chatLang('Output lb/hr','Output lb/hr','Débit lb/h'),message:chatWorkflow.stage==='minutes'?chatLang('How many minutes did those two rolls run?','¿Cuántos minutos corrieron esos dos rollos?','Combien de minutes ?'):chatLang('Give me Winder 1 and Winder 2 roll weights in lb.','Dame el peso de los rollos de Winder 1 y Winder 2 en lb.','Donnez les deux poids.')};
}
function handleOutputRateWorkflow(text){
  if(!chatWorkflow||chatWorkflow.type!=='output-rate')return null;
  const q=normalizeKnowledgeQuery(text);
  if(/\b(cancel|cancelar|cancela|annuler)\b/.test(q)){chatWorkflow=null;saveChatWorkflow();return {kind:'info',message:chatLang('Output calculation cancelled.','Cálculo de output cancelado.','Calcul annulé.')};}
  const vals=numbers(text).filter(positive);
  if(chatWorkflow.stage==='weights'){
    const w1=labeledProcessNumber(text,'w1')||vals[0],w2=labeledProcessNumber(text,'w2')||vals[1];
    if(!positive(w1,w2))return {kind:'info',message:chatLang('Enter both roll weights, for example 520 515.','Escribe los dos pesos, por ejemplo 520 515.','Entrez les deux poids.')};
    chatWorkflow.w1=w1;chatWorkflow.w2=w2;chatWorkflow.stage='minutes';saveChatWorkflow();
    return {kind:'info',message:chatLang('How many minutes did those two rolls run?','¿Cuántos minutos corrieron esos dos rollos?','Combien de minutes ?')};
  }
  if(chatWorkflow.stage==='minutes'){
    const mins=labeledProcessNumber(text,'minutes')||vals[0];
    if(!positive(mins))return {kind:'info',message:chatLang('Enter the run time in minutes.','Escribe el tiempo corrido en minutos.','Entrez le temps en minutes.')};
    const flow={...chatWorkflow};chatWorkflow=null;saveChatWorkflow();return outputRateResult(flow.w1,flow.w2,mins);
  }
  return null;
}
function standaloneOutputChatQuery(text){
  const q=normalizeKnowledgeQuery(text);
  // Questions about the already-tracked production rate belong to Production Status, not this calculator.
  if(/\b(current rate|target rate|production status|estado de produccion|estado produccion|rate actual|target de produccion)\b/.test(q))return null;
  const asks=/\b(calculate output|output calculation|calc output|output|lbs per hour|lb per hour|lbs hr|calcular output|calcula output|libras por hora|produccion por hora|producción por hora)\b/.test(q);
  if(!asks)return null;
  if(positive(labeledProcessNumber(text,'primary'),labeledProcessNumber(text,'secondary')))return null;
  const w1=labeledProcessNumber(text,'w1'),w2=labeledProcessNumber(text,'w2'),mins=labeledProcessNumber(text,'minutes');
  if(positive(w1,w2,mins))return outputRateResult(w1,w2,mins);
  const vals=numbers(text).filter(positive);
  if(positive(w1,w2))return startOutputRateWorkflow(w1,w2);
  if(vals.length>=3&&/\b(min|mins|minutes|minutos)\b/.test(q))return outputRateResult(vals[0],vals[1],vals[2]);
  if(vals.length>=2)return startOutputRateWorkflow(vals[0],vals[1]);
  return startOutputRateWorkflow();
}

function learningSnapshotForChat(){
  const records=(Array.isArray(state.learningEngine?.records)?state.learningEngine.records:[]).filter(r=>r&&r.source!=='completed_cut'&&Number.isFinite(Number(r.correction)));
  const count=records.length;
  if(!count)return {count:0,correction:0,success:0,confidence:0};
  const recent=records.slice(-100);
  const correction=recent.reduce((sum,r)=>sum+Number(r.correction||0),0)/recent.length;
  const success=Math.round(100*recent.filter(r=>r.success).length/recent.length);
  const variance=recent.reduce((sum,r)=>sum+Math.pow(Number(r.correction||0)-correction,2),0)/recent.length;
  const confidence=Math.round(100*Math.min(1,recent.length/30)*Math.max(0,1-Math.sqrt(variance)/5));
  return {count,correction:Number(correction.toFixed(1)),success,confidence};
}
function productionStatusForChat(){
  if(!state.activeShift)return {kind:'info',message:chatLang('There is no active shift on this line.','No hay turno activo en esta línea.','Aucun quart actif sur cette ligne.')};
  const run=currentProductionRun(),stats=runStats(run),target=Number(stats.target?.lbsPerHour)||0;
  if(!stats.material||stats.hours<0.25)return {kind:'info',title:chatLang('Production status','Estado de producción','État de production'),message:chatLang(`Product ${state.activeShift.product}. ${fmt(stats.material,0)} lb recorded. Add completed cuts to build a reliable lbs/hr rate.`,`Producto ${state.activeShift.product}. ${fmt(stats.material,0)} lb registradas. Completa más cortes para calcular un rate de lbs/hr confiable.`,`Produit ${state.activeShift.product}. Ajoutez des coupes terminées pour calculer le débit.`)};
  const forecast=productionForecastText(true,stats).text;
  return {kind:'result',title:chatLang('Production status','Estado de producción','État de production'),message:chatLang(`Current ${fmt(stats.rate,0)} lbs/hr${target?` • Target ${fmt(target,0)} lbs/hr`:''} • Projected end ${fmt(stats.projected,0)} lb. ${forecast}`,`Actual ${fmt(stats.rate,0)} lbs/hr${target?` • Target ${fmt(target,0)} lbs/hr`:''} • Proyección final ${fmt(stats.projected,0)} lb. ${forecast}`,`Actuel ${fmt(stats.rate,0)} lb/h. ${forecast}`)};
}
function chatActionCommand(text){
  const q=normalizeKnowledgeQuery(text);
  const requested=requestedLineNumber(text);
  const startVerb=/\b(start|begin|run|empezar|empieza|iniciar|inicia|arrancar|arranca|comenzar|comienza)\b/.test(q);
  const bareStart=q.match(/\b(?:start|begin|run|empezar|empieza|iniciar|inicia|arrancar|arranca|comenzar|comienza)\s+(?:(?:line|linea|la)\s*)?(1|2|3|4|one|two|three|four|uno|una|dos|tres|cuatro)\b/);
  const wordLine={one:1,two:2,three:3,four:4,uno:1,una:1,dos:2,tres:3,cuatro:4};
  const startLine=bareStart?(Number(bareStart[1])||wordLine[bareStart[1]]||null):null;
  if(startVerb&&(/\b(line|linea|shift|turno)\b/.test(q)||startLine))return startLineChatWorkflow(requested||startLine||ACTIVE_LINE);
  if(requested&&/\b(go to|switch to|change to|show|ve a|cambia a|cambiar a|muestra|selecciona)\b/.test(q)&&/\b(line|linea|extruder|extrusor)\b/.test(q)){
    if(requested!==ACTIVE_LINE)switchLine(requested);
    return lineStatusAnswer(requested);
  }
  if(/\b(end shift|end the shift|finish shift|fin de turno|terminar turno|cerrar turno)\b/.test(q)){
    if(!state.activeShift)return {kind:'info',message:chatLang('There is no active shift to end.','No hay un turno activo para terminar.','Aucun quart actif à terminer.')};
    const ok=confirm(chatLang(`End the active shift on Line ${ACTIVE_LINE}?`,`¿Terminar el turno activo de Line ${ACTIVE_LINE}?`,`Terminer le quart actif de Line ${ACTIVE_LINE} ?`));
    if(!ok)return {kind:'info',message:chatLang('Shift end cancelled.','Fin de turno cancelado.','Fin de quart annulée.')};
    endShift();
    return {kind:'info',message:chatLang(`Line ${ACTIVE_LINE} shift ended.`,`Turno de Line ${ACTIVE_LINE} terminado.`,`Quart de Line ${ACTIVE_LINE} terminé.`)};
  }
  if(/^(changeover|change product|product change|cambio de producto|cambiar producto|cambio)$/i.test(String(text||'').trim())){
    {const gate=activeShiftChatGate();if(gate)return gate;}
    changeProduct();
    return {kind:'info',message:chatLang('I opened Changeover. Select the destination product.','Abrí Changeover. Selecciona el producto destino.','Changement de produit ouvert.')};
  }
  if(/\b(open|show|go to|abre|muestra|ve a)\b/.test(q)&&/\b(basis weight|bw calculator|calculadora bw)\b/.test(q)){switchView('bw');return {kind:'info',message:chatLang('Basis Weight is open.','Abrí Basis Weight.','Basis Weight ouvert.')};}
  if(/\b(open|show|go to|abre|muestra|ve a)\b/.test(q)&&/\b(feet|ft calculator|calculadora ft|pies)\b/.test(q)){switchView('ft');return {kind:'info',message:chatLang('Feet calculator is open.','Abrí la calculadora de Feet.','Calculateur Feet ouvert.')};}
  if(/\b(open|show|go to|abre|muestra|ve a)\b/.test(q)&&/\b(s wrap|swrap|s-wrap)\b/.test(q)){switchView('swrap');return {kind:'info',message:chatLang('S-Wrap calculator is open.','Abrí la calculadora de S-Wrap.','Calculateur S-Wrap ouvert.')};}
  if(/\b(open|show|set|abre|muestra|configura)\b/.test(q)&&/\b(target lbs|production target|target rate|meta de produccion|target de produccion)\b/.test(q)){openProductionDialog();return {kind:'info',message:chatLang('Production target and shift details are open.','Abrí Target lbs y los detalles de producción.','Objectif de production ouvert.')};}
  if(/\b(open|show|abre|muestra)\b/.test(q)&&/\b(process record|manual process|registro de proceso|registro manual|corrida manual)\b/.test(q)){openManualProcessDialog();return {kind:'info',message:chatLang('Manual Process Record is open. Enter Primary, Secondary, both roll weights and run time.','Abrí Registro manual de proceso. Ingresa Primary, Secondary, los dos pesos y el tiempo.','Journal manuel du procédé ouvert.')};}
  if(/\b(open settings|settings|abre settings|abre ajustes|ajustes)\b/.test(q)){openSettings();return {kind:'info',message:chatLang('Settings is protected. Enter the Settings password to continue.','Settings está protegido. Ingresa la contraseña para continuar.','Réglages protégés par mot de passe.')};}
  const mandrel=requestedMandrel(text);
  if(mandrel&&/\b(set|use|change|select|pon|usa|cambia|selecciona|mandrel|mandril)\b/.test(q)){
    {const gate=activeShiftChatGate();if(gate)return gate;}
    selectMandrel('bw',mandrel);selectMandrel('ft',mandrel);saveSession();
    return {kind:'info',message:chatLang(`Line ${ACTIVE_LINE} mandrel set to ${mandrel} inches.`,`Mandrel de Line ${ACTIVE_LINE} cambiado a ${mandrel} pulgadas.`,`Mandrin réglé à ${mandrel} pouces.`)};
  }
  if(/\b(apply suggestion|apply preventive|accept suggestion|aplicar sugerencia|aplicar preventivo|aceptar sugerencia)\b/.test(q)){
    const trend=state.latestTrend||analyzeTrend();
    if(activeCorrectiveBWAction())return {kind:'info',message:chatLang('Preventive action is deferred because the current BW is out of range. Follow the corrective S-Wrap recommendation first and wait for the next completed cut.','La acción preventiva está en espera porque el BW actual está fuera de rango. Sigue primero la corrección de S-Wrap y espera el próximo corte completo.','L’action préventive est différée car le BW actuel est hors plage.')};
    if(!trend?.ready||!trend.recommendAdjustment||!positive(trend.suggestedSWrap)||preventiveTrendAlreadyApplied(trend))return {kind:'info',message:chatLang('There is no pending preventive S-Wrap suggestion to apply.','No hay una sugerencia preventiva de S-Wrap pendiente para aplicar.','Aucune suggestion préventive en attente.')};
    const before=Number(state.currentSWrap),after=Number(trend.suggestedSWrap);
    if(!acceptPreventiveSWrapChange())return {kind:'info',message:chatLang('The preventive change was not applied.','El cambio preventivo no fue aplicado.','Le changement préventif n’a pas été appliqué.')};
    return {kind:'result',title:chatLang('Preventive change applied','Cambio preventivo aplicado','Changement préventif appliqué'),message:`S-Wrap ${fmt(before,1)} → ${fmt(after,1)}`};
  }
  if(/\b(max(?:imum)? s ?wrap|max s-wrap|limite s ?wrap|límite s ?wrap|s ?wrap max)\b/.test(q))return {kind:'info',message:chatLang(`Maximum plant S-Wrap speed is ${MAX_SWRAP_SPEED} ft/min. Viejito will not recommend or apply a higher value.`,`El máximo S-Wrap de planta es ${MAX_SWRAP_SPEED} ft/min. Viejito no recomendará ni aplicará un valor mayor.`,`Le maximum S-Wrap est ${MAX_SWRAP_SPEED} ft/min.`)};
  const setSWrapMatch=q.match(/\b(?:set|change|put|pon|cambia|cambiar|ajusta|ajustar)\s+(?:current\s+)?s[ -]?wrap(?:\s+(?:to|a|en))?\s+(\d+(?:\.\d+)?)/);
  if(setSWrapMatch){
    const requestedSpeed=Number(setSWrapMatch[1]);
    if(!positive(requestedSpeed))return {kind:'error',message:t('invalidNumbers')};
    if(!requireActiveShift())return {kind:'info',message:chatLang(`Start ${scheduledShiftCode()||'the scheduled'} Shift before changing the live S-Wrap.`,`Primero empieza el Turno ${scheduledShiftCode()||'programado'} antes de cambiar el S-Wrap de la línea.`,`Démarrez le quart avant de modifier le S-Wrap.`)};
    const before=Number(state.currentSWrap),applied=clampSWrap(requestedSpeed);recordSWrapChange(before,applied,'chat_manual');syncCurrentSWrap(applied);saveSession();renderShiftPanel();renderTrendPanel(analyzeTrend());
    return {kind:'result',title:chatLang('Current S-Wrap updated','S-Wrap actual actualizado','S-Wrap mis à jour'),message:requestedSpeed>MAX_SWRAP_SPEED?chatLang(`Requested ${fmt(requestedSpeed,1)}. Plant maximum reached — Current S-Wrap set to ${MAX_SWRAP_SPEED} ft/min.`,`Pediste ${fmt(requestedSpeed,1)}. Se alcanzó el máximo de planta — S-Wrap actual quedó en ${MAX_SWRAP_SPEED} ft/min.`,`Maximum atteint : ${MAX_SWRAP_SPEED} ft/min.`):`S-Wrap ${fmt(applied,1)} ft/min`};
  }
  if(/\b(daily report|quality report|day report|reporte diario|reporte del dia|reporte del día|reporte de calidad)\b/.test(q)){
    openDailyReportDialog();
    return {kind:'info',message:chatLang('Daily Quality Report opened. Choose Current Line or All Lines, then print when ready.','Abrí el Reporte diario de calidad. Elige la línea actual o todas las líneas y luego imprime cuando esté listo.','Rapport quotidien ouvert.')};
  }
  if(/\b(process performance|process learning|performance learning|output learning|primary secondary learning|aprendizaje de proceso|aprendizaje de desempeño|aprendizaje de output)\b/.test(q)){
    const summary=state.processLearning?.summary?.()||{count:0,last:null};
    const last=summary.last;
    const lastText=last?chatLang(` Last sample: Primary ${fmt(last.primaryRPM,1)} + Secondary ${fmt(last.secondaryRPM,1)} → ${fmt(last.outputLbHr,0)} lb/hr.`,` Última muestra: Primary ${fmt(last.primaryRPM,1)} + Secondary ${fmt(last.secondaryRPM,1)} → ${fmt(last.outputLbHr,0)} lb/hr.`,` Dernier échantillon : ${fmt(last.outputLbHr,0)} lb/h.`):'';
    return {kind:'info',title:chatLang('Process Performance Learning','Aprendizaje de desempeño del proceso','Apprentissage performance'),message:chatLang(`Line ${ACTIVE_LINE} has ${summary.count} real process sample(s). At least 3 comparable samples are required before Primary + Secondary predictions activate.${lastText}`,`Line ${ACTIVE_LINE} tiene ${summary.count} muestra(s) reales de proceso. Se requieren al menos 3 muestras comparables antes de activar predicciones Primary + Secondary.${lastText}`,`Line ${ACTIVE_LINE}: ${summary.count} échantillon(s).${lastText}`)};
  }
  if(/\b(machine learning|adaptive learning|learning status|aprendizaje|machine learning status|como esta aprendiendo|cómo está aprendiendo)\b/.test(q)&&/\b(status|learning|aprendizaje|machine)\b/.test(q)){
    const s=learningSnapshotForChat();
    return {kind:'info',title:chatLang('Adaptive Machine Learning','Adaptive Machine Learning','Adaptive Machine Learning'),message:chatLang(`Line ${ACTIVE_LINE}: ${s.count} learned result(s) • Average correction ${s.correction>0?'+':''}${s.correction} • Success ${s.success}% • Confidence ${s.confidence}%.`,`Line ${ACTIVE_LINE}: ${s.count} resultado(s) aprendidos • Corrección promedio ${s.correction>0?'+':''}${s.correction} • Éxito ${s.success}% • Confianza ${s.confidence}%.`,`Line ${ACTIVE_LINE}: ${s.count} résultats appris • Confiance ${s.confidence}%.`)};
  }
  if(/\b(current rate|target rate|production rate|lbs per hour|lbs\/hr|rate de produccion|libras por hora|produccion por hora)\b/.test(q))return productionStatusForChat();
  if(/\b(calculate winder 1|calcula winder 1|calcular winder 1)\b/.test(q)){
    try{calculateSingleWinder(1);return {kind:'result',title:'Winder 1',message:`BW ${fmt(Number(pendingCut.winder1),3)}`};}catch(error){return {kind:'error',message:error.message};}
  }
  if(/\b(calculate winder 2|calcula winder 2|calcular winder 2)\b/.test(q)){
    try{calculateSingleWinder(2);return {kind:'result',title:'Winder 2',message:`BW ${fmt(Number(pendingCut.winder2),3)}`};}catch(error){return {kind:'error',message:error.message};}
  }
  if(/\b(complete cut|calculate average|complete the cut|completar corte|calcular promedio|completa el corte)\b/.test(q)){
    try{completeDualWinderCut();const avg=Number(state.lastCompletedCut?.averageBW);return {kind:'result',title:chatLang('Completed cut','Corte completado','Coupe terminée'),message:positive(avg)?`Average BW ${fmt(avg,3)}`:chatLang('Cut completed.','Corte completado.','Coupe terminée.')};}catch(error){return {kind:'error',message:error.message};}
  }
  return null;
}

function unsupportedChatResponse(){
  return {kind:'info',message:state.language==='es'?'Lo siento, todavía no tengo la capacidad de entender lo que me pides.':state.language==='fr'?`Désolé, je n’ai pas encore la capacité de comprendre cette demande.`:`Sorry, I don’t have the ability to understand that request yet.`};
}


// V5.34.6 — Viejito Local Brain orchestration layer.
// This is a deterministic offline brain: it never calls a cloud model and it never writes
// operational state while answering QUERY/SIMULATION requests. Existing calculators,
// optimizers and learning engines remain the source of truth; Brain decides which ones to combine.
const BRAIN_LAST_INSIGHT_KEY='viejitoBrainLastInsightV1';
const viejitoBrain=window.ViejitoLocalBrain?new window.ViejitoLocalBrain({version:'5.34.6'}):null;
let brainSkillsRegistered=false;

function brainLineSnapshot(line=ACTIVE_LINE){
  const n=Number(line);
  const stored=lineOperationalSnapshot(n);
  if(n!==ACTIVE_LINE)return stored;
  // Prefer live in-memory state for the active line without mutating it.
  const shift=state.activeShift||stored.shift;
  const last=state.lastCompletedCut||stored.last;
  const records=Array.isArray(state.learningEngine?.records)?state.learningEngine.records:stored.records;
  const trend=Array.isArray(state.bwTrendHistory)?state.bwTrendHistory:stored.trend;
  const running=!!(shift && !shift.endedAt && !shift.endTime);
  const product=shift?.product||last?.product||state.product||stored.product||'—';
  const swrap=Number(state.currentSWrap||shift?.currentSWrap||last?.currentSWrap||stored.swrap);
  const target=Number(state.targetBW||last?.targetBW||stored.target);
  const recentCuts=[];
  const trendDual=(trend||[]).filter(r=>Number.isFinite(Number(r?.winder1))&&Number.isFinite(Number(r?.winder2)));
  const sourceRows=trendDual.length?trendDual:(records||[]);
  for(const r of sourceRows){
    const w1=Number(r?.winder1),w2=Number(r?.winder2),avg=Number(r?.averageBW??r?.finalBW??r?.bw);
    if(Number.isFinite(w1)&&Number.isFinite(w2))recentCuts.push({winder1:w1,winder2:w2,averageBW:avg,time:r?.time||r?.timestamp||r?.completedAt||'',product:r?.product,runId:r?.runId,shiftId:r?.shiftId,shiftCode:r?.shiftCode,shiftWorkDate:r?.shiftWorkDate,operator:r?.operator,targetBW:r?.targetBW,currentSWrap:r?.currentSWrap});
  }
  if(last&&Number.isFinite(Number(last.winder1))&&Number.isFinite(Number(last.winder2)))recentCuts.push(last);
  return {...stored,shift,last,records,trend,running,product,swrap,target,recentCuts:recentCuts.slice(-20)};
}

function brainContext(line=ACTIVE_LINE){
  const s=brainLineSnapshot(line),last=s.last;
  const run=s.shift?.runs?.find?.(r=>r.id===s.shift?.runId)||null;
  const target=Number(last?.targetBW??run?.targetBW??s.target);
  const swrap=Number(s.swrap??last?.currentSWrap??run?.swrap);
  return {
    line:Number(line),running:!!s.running,operator:String(s.shift?.operator||''),product:String(s.product||'—'),
    targetBW:Number.isFinite(target)?target:null,currentSWrap:Number.isFinite(swrap)?swrap:null,
    mandrel:Number(last?.mandrel||run?.mandrel||48),shiftId:s.shift?.id||null,runId:s.shift?.runId||null,
    lastCut:last?{averageBW:Number(last.averageBW),winder1:Number(last.winder1),winder2:Number(last.winder2),targetBW:Number(last.targetBW??target),currentSWrap:Number(last.currentSWrap??swrap),time:last.time||null}:null,
    raw:s
  };
}

function brainBWSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),findings=[];
  if(!c.running)return {context:c,level:'info',findings:[{level:'info',message:chatLang(`Line ${line} is not running.`,`Line ${line} no está corriendo.`,`Line ${line} n’est pas en marche.`)}]};
  const avg=Number(c.lastCut?.averageBW),target=Number(c.lastCut?.targetBW??c.targetBW),sw=Number(c.currentSWrap);
  if(!positive(avg,target))return {context:c,level:'info',findings:[{level:'info',message:chatLang('No completed BW cut yet.','Todavía no hay un BW completo.','Aucune coupe BW terminée.')} ]};
  const delta=avg-target,abs=Math.abs(delta);
  let level=abs<=0.17?'green':abs<0.25?'yellow':'red';
  let suggested=null;
  if(level==='red'&&positive(sw)){
    if(Number(line)===ACTIVE_LINE&&window.SmartOptimizer){
      try{
        const ctx={product:String(c.product||'').toUpperCase(),mandrel:c.mandrel,extruder:Number(line),shiftId:c.shiftId,runId:c.runId};
        const optimizer=new window.SmartOptimizer({targetBW:target,currentSWrap:sw,roundMode:'nearest1',learningEngine:state.learningEngine,context:ctx});
        suggested=optimizer.evaluate(avg).suggestedSWrap;
      }catch(_){suggested=clampSWrap(Math.round(sw*avg/target));}
    }else suggested=clampSWrap(Math.round(sw*avg/target));
  }
  const deltaText=`${delta>=0?'+':''}${fmt(delta,3)}`;
  if(level==='red')findings.push({level:'corrective',message:chatLang(`BW ${fmt(avg,3)} vs target ${fmt(target,2)} (${deltaText}). Corrective S-Wrap has priority${positive(suggested)?`; suggested ${fmt(suggested,1)}`:''}.`,`BW ${fmt(avg,3)} vs target ${fmt(target,2)} (${deltaText}). La corrección de S-Wrap tiene prioridad${positive(suggested)?`; sugerido ${fmt(suggested,1)}`:''}.`,`BW ${fmt(avg,3)} vs cible ${fmt(target,2)} (${deltaText}). Correction S-Wrap prioritaire.`),data:{avg,target,delta,suggested}});
  else if(level==='yellow')findings.push({level:'warning',message:chatLang(`BW ${fmt(avg,3)} is in warning range (${deltaText}). Watch the next completed cut.`,`BW ${fmt(avg,3)} está en advertencia (${deltaText}). Vigila el próximo corte completo.`,`BW ${fmt(avg,3)} en zone d’attention.`),data:{avg,target,delta}});
  else findings.push({level:'info',message:chatLang(`BW ${fmt(avg,3)} is on target (target ${fmt(target,2)}).`,`BW ${fmt(avg,3)} está en target (objetivo ${fmt(target,2)}).`,`BW ${fmt(avg,3)} est sur cible.`),data:{avg,target,delta}});
  return {context:c,level,avg,target,delta,suggested,findings};
}

function brainTrendSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),s=c.raw,findings=[];
  if(!c.running)return {context:c,ready:false,findings:[]};
  const target=Number(c.targetBW),sw=Number(c.currentSWrap);
  const rows=(s.trend||[]).filter(item=>{
    const sameProduct=!c.product||c.product==='—'||String(item?.product||'').toUpperCase()===String(c.product).toUpperCase();
    const sameRun=!c.runId||String(item?.runId||'')===String(c.runId);
    return sameProduct&&sameRun;
  }).slice(-TREND_SAMPLE_SIZE);
  let trend=null;
  try{trend=new window.TrendPredictor({sampleSize:TREND_SAMPLE_SIZE,targetBW:target,tolerance:window.VIEJITO_TOLERANCES?.warning||0.25,preventiveStep:2}).analyze(rows.map(r=>Number(r.bw)),sw);}catch(_){trend=null;}
  if(!trend||!trend.ready){
    findings.push({level:'info',message:chatLang(`Trend is building (${trend?.count||rows.length}/${TREND_SAMPLE_SIZE} real cuts).`,`La tendencia se está formando (${trend?.count||rows.length}/${TREND_SAMPLE_SIZE} cortes reales).`,`Tendance en construction (${trend?.count||rows.length}/${TREND_SAMPLE_SIZE}).`)});
    return {context:c,trend,findings};
  }
  const bw=brainBWSkill({line});
  if(bw.level==='red')findings.push({level:'info',message:chatLang('Preventive trend is deferred while the current BW needs a corrective action.','La tendencia preventiva queda en espera mientras el BW actual necesita corrección.','Tendance préventive différée pendant la correction BW.')});
  else if(trend.recommendAdjustment)findings.push({level:'preventive',message:chatLang(`Trend is ${trend.direction==='up'?'rising':'falling'}; next BW ${fmt(trend.projectedBW,3)} (${trend.consistency}% consistency). Preventive S-Wrap ${fmt(sw,1)} → ${fmt(trend.suggestedSWrap,1)}.`,`La tendencia va ${trend.direction==='up'?'subiendo':'bajando'}; próximo BW ${fmt(trend.projectedBW,3)} (${trend.consistency}% consistencia). Preventivo S-Wrap ${fmt(sw,1)} → ${fmt(trend.suggestedSWrap,1)}.`,`Tendance ${trend.direction}; prochain BW ${fmt(trend.projectedBW,3)}.`),data:trend});
  else findings.push({level:'info',message:chatLang(`Trend is ${trend.direction==='stable'?'stable':trend.direction} — projected next BW ${fmt(trend.projectedBW,3)}. No preventive change now.`,`Tendencia ${trend.direction==='stable'?'estable':trend.direction==='up'?'subiendo':'bajando'} — próximo BW proyectado ${fmt(trend.projectedBW,3)}. Sin cambio preventivo ahora.`,`Tendance ${trend.direction}; prochain BW ${fmt(trend.projectedBW,3)}.`),data:trend});
  return {context:c,trend,findings};
}

function brainSheetSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),findings=[],last=c.lastCut;
  if(!last||!Number.isFinite(last.winder1)||!Number.isFinite(last.winder2))return {context:c,findings:[{level:'info',message:chatLang('No dual-winder cut is available for sheet balance.','No hay un corte de dos winders disponible para revisar Sheet Balance.','Aucune coupe double winder disponible.')} ]};
  const balance=analyzeDieBalance(last.winder1,last.winder2),watch=sheetBalanceWatch(c.raw.recentCuts||[]);
  const side=balance.heavier==='top'?'Winder 2 / Top Sheet':balance.heavier==='bottom'?'Winder 1 / Bottom Sheet':'balanced';
  if(balance.level==='required')findings.push({level:'balance',score:88,message:chatLang(`${side} is heavier by ${fmt(balance.difference,2)} BW. DIE MOVE REQUIRED.`,` ${side} está más pesado por ${fmt(balance.difference,2)} BW. DIE MOVE OBLIGATORIO.`.trim(),`${side} plus lourd de ${fmt(balance.difference,2)} BW.`),data:balance});
  else if(balance.level==='suggested')findings.push({level:'balance',message:chatLang(`${side} is heavier by ${fmt(balance.difference,2)} BW. Die move suggested.`,`${side} está más pesado por ${fmt(balance.difference,2)} BW. Die move sugerido.`,`${side} plus lourd de ${fmt(balance.difference,2)} BW.`),data:balance});
  else findings.push({level:'info',message:chatLang(`Sheet balance is within 0.25 BW (difference ${fmt(balance.difference,2)}).`,`Sheet Balance está dentro de 0.25 BW (diferencia ${fmt(balance.difference,2)}).`,`Équilibre dans 0,25 BW.`),data:balance});
  if(watch?.flipped)findings.push({level:'warning',message:chatLang('Sheet imbalance changed sides — the previous streak ended and a new streak has started on the opposite side. Verify the next adjustment before chasing it.','El desbalance cambió de lado — la racha anterior terminó y comenzó una nueva del lado opuesto. Verifica antes de seguir persiguiéndolo.','Le déséquilibre a changé de côté — une nouvelle série commence.')});
  else if(watch?.streak>=4)findings.push({level:'balance',score:96,message:chatLang(`${watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet'} has been heavier for ${watch.streak} consecutive cuts. The imbalance remains unresolved across the line, including product changes. Lead review is recommended now.`,`${watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet'} lleva ${watch.streak} cortes consecutivos más pesado. El desbalance sigue sin resolverse en la línea, incluso con cambios de producto. Se recomienda apoyo del Lead ahora.`,`Déséquilibre persistant pendant ${watch.streak} coupes. Révision du Lead recommandée.`),data:{streak:watch.streak,side:watch.side,leadReview:true}});
  else if(watch?.streak>=3)findings.push({level:'balance',score:90,message:chatLang(`${watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet'} has been heavier for ${watch.streak} consecutive cuts. Persistent imbalance: verify the die move and confirm the machine is responding.`,`${watch.side==='top'?'Winder 2 / Top Sheet':'Winder 1 / Bottom Sheet'} lleva ${watch.streak} cortes consecutivos más pesado. Desbalance persistente: verifica el Die Move y confirma que la máquina esté respondiendo.`,`Déséquilibre persistant pendant ${watch.streak} coupes.`),data:{streak:watch.streak,side:watch.side,persistent:true}});
  else if(watch?.improving)findings.push({level:'info',message:chatLang('The sheet imbalance is decreasing; the last die adjustment appears to be responding.','El desbalance está disminuyendo; el último ajuste parece estar respondiendo.','Le déséquilibre diminue.')});
  return {context:c,balance,watch,findings};
}

function brainProductionSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),findings=[],shift=c.raw.shift;
  if(!c.running||!shift)return {context:c,findings:[]};
  const run=shift.runs?.find?.(r=>r.id===shift.runId)||null;
  if(!run)return {context:c,findings:[]};
  const start=new Date(run.startedAt).getTime(),end=run.endedAt?new Date(run.endedAt).getTime():Date.now();
  const hours=Math.max(0,(end-start)/3600000),material=Number(run.materialLbs)||0,rate=hours>=0.25?material/hours:0;
  let targets={};
  try{targets=Number(line)===ACTIVE_LINE?(state.productionTargets||{}):(getLineJSON(PRODUCTION_TARGETS_KEY,line,{})||{});}catch(_){targets={};}
  const productKey=normalizeProduct(run.product||c.product||'');
  const targetRec=targets?.[productKey]||{};
  const targetRate=Number(targetRec.lbsPerHour)||0,shiftHours=Number(targetRec.shiftHours)||12;
  const projected=rate?rate*shiftHours:0,targetTotal=targetRate*shiftHours,difference=projected-targetTotal;
  if(!rate)findings.push({level:'info',message:chatLang(`Production has ${fmt(material,0)} lb recorded; wait at least 15 minutes for a stable lbs/hr projection.`,`Producción tiene ${fmt(material,0)} lb registradas; espera al menos 15 minutos para una proyección lbs/hr estable.`,`Production : ${fmt(material,0)} lb enregistrées.`)});
  else if(targetRate&&rate<targetRate*0.95)findings.push({level:'production',message:chatLang(`Production ${fmt(rate,0)} lbs/hr is below target ${fmt(targetRate,0)}; projected end ${fmt(projected,0)} lb (${fmt(Math.abs(difference),0)} lb below shift target).`,`Producción ${fmt(rate,0)} lbs/hr está debajo del target ${fmt(targetRate,0)}; proyección final ${fmt(projected,0)} lb (${fmt(Math.abs(difference),0)} lb debajo de la meta).`,`Production ${fmt(rate,0)} lb/h sous la cible ${fmt(targetRate,0)}.`)});
  else if(targetRate)findings.push({level:'info',message:chatLang(`Production ${fmt(rate,0)} lbs/hr vs target ${fmt(targetRate,0)}; projected end ${fmt(projected,0)} lb.`,`Producción ${fmt(rate,0)} lbs/hr vs target ${fmt(targetRate,0)}; proyección final ${fmt(projected,0)} lb.`,`Production ${fmt(rate,0)} lb/h.`)});
  else findings.push({level:'info',message:chatLang(`Production is ${fmt(rate,0)} lbs/hr. No target rate is saved for ${c.product}.`,`Producción está en ${fmt(rate,0)} lbs/hr. No hay target guardado para ${c.product}.`,`Production ${fmt(rate,0)} lb/h.`)});
  return {context:c,material,hours,rate,targetRate,projected,targetTotal,difference,findings};
}

function brainAdaptiveSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),records=c.raw.records||[];
  if(Number(line)===ACTIVE_LINE){
    const s=learningSnapshotForChat();
    return {context:c,count:s.count,confidence:s.confidence,success:s.success,findings:[{level:'learning',message:chatLang(`Adaptive Learning: ${s.count} result(s), ${s.confidence}% confidence, ${s.success}% success.`,`Adaptive Learning: ${s.count} resultado(s), ${s.confidence}% confianza, ${s.success}% éxito.`,`Adaptive Learning : ${s.count} résultats, confiance ${s.confidence}%.`)}]};
  }
  return {context:c,count:records.length,findings:[{level:'learning',message:chatLang(`Line ${line} has ${records.length} adaptive record(s).`,`Line ${line} tiene ${records.length} registro(s) Adaptive.`,`Line ${line}: ${records.length} enregistrements Adaptive.`)}]};
}

function brainProcessSkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line);let records=[];
  try{records=Number(line)===ACTIVE_LINE?(state.processLearning?.records||[]):(getLineJSON(PROCESS_PERFORMANCE_KEY,line,[])||[]);}catch(_){records=[];}
  const last=records[records.length-1]||null;
  return {context:c,count:records.length,last,findings:[{level:'learning',message:last?chatLang(`Process Learning: ${records.length} real sample(s). Last: Primary ${fmt(last.primaryRPM,1)} + Secondary ${fmt(last.secondaryRPM,1)} → ${fmt(last.outputLbHr,0)} lbs/hr.`,`Process Learning: ${records.length} muestra(s) reales. Última: Primary ${fmt(last.primaryRPM,1)} + Secondary ${fmt(last.secondaryRPM,1)} → ${fmt(last.outputLbHr,0)} lbs/hr.`,`Process Learning : ${records.length} échantillons.`):chatLang('Process Learning has no real samples yet.','Process Learning todavía no tiene muestras reales.','Aucun échantillon Process Learning.')} ]};
}

function brainHistorySkill({line=ACTIVE_LINE}={}){
  const c=brainContext(line),rows=(c.raw.trend||[]).filter(r=>!c.runId||String(r.runId||'')===String(c.runId)).slice(-5).reverse();
  return {context:c,rows,findings:[],message:rows.length?rows.map(r=>`BW ${fmt(Number(r.bw),3)} @ S-Wrap ${fmt(Number(r.currentSWrap||c.currentSWrap),1)}`).join(' • '):chatLang('No recent real BW cuts for this run.','No hay cortes BW reales recientes para este run.','Aucune coupe BW récente.')};
}

function brainLineScore(line){
  const c=brainContext(line);if(!c.running)return {line,score:-1,context:c,reasons:[chatLang('not running','no corriendo','arrêtée')]};
  const reasons=[];let score=0;
  const bw=brainBWSkill({line});if(bw.level==='red'){score+=100;reasons.push('BW');}else if(bw.level==='yellow'){score+=35;reasons.push('BW warning');}
  const sh=brainSheetSkill({line});if(sh.balance?.level==='required'){score+=85;reasons.push('die move');}else if(sh.balance?.level==='suggested'){score+=45;reasons.push('sheet balance');}if(sh.watch?.streak>=3)score+=20;
  const pr=brainProductionSkill({line});if(pr.rate&&pr.targetRate&&pr.rate<pr.targetRate*0.95){score+=25;reasons.push('production');}
  return {line,score,context:c,reasons,bw,sh,pr};
}

function brainCompareSkill(){
  const rows=[1,2,3,4].map(brainLineScore),running=rows.filter(r=>r.score>=0).sort((a,b)=>b.score-a.score),findings=[];
  if(!running.length)return {rows,findings:[{level:'info',message:chatLang('No lines have an active shift right now.','Ninguna línea tiene turno activo ahora.','Aucune ligne active.')} ]};
  const worst=running[0];
  const summary=running.map(r=>`Line ${r.line}: ${r.score===0?chatLang('stable','estable','stable'):`${r.score} pts${r.reasons.length?` (${r.reasons.join(', ')})`:''}`}`).join(' • ');
  findings.push({level:worst.score>=100?'corrective':worst.score>=60?'warning':'info',message:chatLang(`Line ${worst.line} needs the most attention. ${summary}`,`Line ${worst.line} necesita más atención. ${summary}`,`Line ${worst.line} demande le plus d’attention. ${summary}`)});
  return {rows,worst,summary,findings};
}

function registerBrainSkills(){
  if(!viejitoBrain||brainSkillsRegistered)return;
  viejitoBrain
    .registerSkill('context.snapshot',({requestedLine})=>({context:brainContext(requestedLine||ACTIVE_LINE),findings:[]}),{group:'context'})
    .registerSkill('bw.status',({requestedLine})=>brainBWSkill({line:requestedLine||ACTIVE_LINE}),{group:'quality'})
    .registerSkill('trend.status',({requestedLine})=>brainTrendSkill({line:requestedLine||ACTIVE_LINE}),{group:'quality'})
    .registerSkill('sheet.status',({requestedLine})=>brainSheetSkill({line:requestedLine||ACTIVE_LINE}),{group:'quality'})
    .registerSkill('production.status',({requestedLine})=>brainProductionSkill({line:requestedLine||ACTIVE_LINE}),{group:'production'})
    .registerSkill('adaptive.status',({requestedLine})=>brainAdaptiveSkill({line:requestedLine||ACTIVE_LINE}),{group:'learning'})
    .registerSkill('process.status',({requestedLine})=>brainProcessSkill({line:requestedLine||ACTIVE_LINE}),{group:'learning'})
    .registerSkill('history.recent',({requestedLine})=>brainHistorySkill({line:requestedLine||ACTIVE_LINE}),{group:'history'})
    .registerSkill('line.compare',()=>brainCompareSkill(),{group:'multi-line'})
    .registerSkill('brain.status',()=>({findings:[],skills:viejitoBrain.describeSkills()}),{group:'brain'});
  brainSkillsRegistered=true;
  window.VIEJITO_BRAIN=viejitoBrain;
}

function brainResultValue(run,skill){return run?.results?.find(r=>r.skill===skill)?.value||null;}
function brainComposeResponse(run,requestedLine=ACTIVE_LINE){
  const lang=state.language,es=lang==='es',fr=lang==='fr',intent=run.plan.intent;
  if(intent==='brain_status'){
    const count=viejitoBrain.skillNames().length,c=brainContext(requestedLine);
    return {kind:'info',title:es?'VIEJITO LOCAL BRAIN 🧠':fr?'CERVEAU LOCAL VIEJITO 🧠':'VIEJITO LOCAL BRAIN 🧠',message:es?`Brain 5.34.6 activo y 100% local. ${count} skills conectados. No usa LLM ni internet. Contexto actual: Line ${c.line}, ${c.running?`corriendo ${c.product} a S-Wrap ${fmt(c.currentSWrap,1)}`:'sin turno activo'}.`:fr?`Brain 5.34.6 local actif. ${count} skills connectés.`:`Brain 5.34.6 is active and fully local. ${count} connected skills. No LLM or internet. Current context: Line ${c.line}, ${c.running?`running ${c.product} at S-Wrap ${fmt(c.currentSWrap,1)}`:'no active shift'}.`,brain:{plan:run.plan}};
  }
  if(intent==='compare_lines'){
    const v=brainResultValue(run,'line.compare');return {kind:'result',title:es?'BRAIN — COMPARACIÓN DE LÍNEAS':'BRAIN — LINE COMPARISON',message:v?.findings?.[0]?.message||v?.summary||'',brain:{plan:run.plan}};
  }
  if(intent==='recent_history'){
    const v=brainResultValue(run,'history.recent');return {kind:'info',title:es?`Últimos cortes — Line ${requestedLine}`:`Recent cuts — Line ${requestedLine}`,message:v?.message||'',brain:{plan:run.plan}};
  }
  const c=brainResultValue(run,'context.snapshot')?.context||brainContext(requestedLine);
  if(!c.running)return {kind:'info',title:`Line ${requestedLine} — ${es?'NO CORRIENDO':'NOT RUNNING'}`,message:es?'No hay un turno activo. Brain no va a presentar datos viejos como si fueran actuales.':'No active shift. Brain will not present old measurements as current.',brain:{plan:run.plan}};
  const findings=run.findings||[];
  let selected=findings;
  if(intent==='full_review'||intent==='line_health')selected=findings.filter(f=>f.level!=='learning').slice(0,6);
  else selected=findings.slice(0,5);
  const message=selected.length?selected.map(f=>f.message).join(' '):(es?'No encontré una acción pendiente con los datos actuales.':'No pending action found from current data.');
  const priority=selected[0]?.level||'info';
  const titleMap={full_review:es?'BRAIN — REVISIÓN COMPLETA':'BRAIN — FULL REVIEW',line_health:es?'BRAIN — ESTADO DE LÍNEA':'BRAIN — LINE HEALTH',trend_analysis:es?'BRAIN — TENDENCIA':'BRAIN — TREND',sheet_balance:es?'BRAIN — SHEET BALANCE':'BRAIN — SHEET BALANCE',production_status:es?'BRAIN — PRODUCCIÓN':'BRAIN — PRODUCTION',learning_status:es?'BRAIN — APRENDIZAJE':'BRAIN — LEARNING'};
  return {kind:'result',title:titleMap[intent]||'VIEJITO BRAIN',message,meta:es?`Line ${requestedLine} • Prioridad: ${priority.toUpperCase()} • ${run.plan.skills.length} skills consultados`:`Line ${requestedLine} • Priority: ${priority.toUpperCase()} • ${run.plan.skills.length} skills consulted`,brain:{plan:run.plan,priority}};
}

function brainLocalQuery(text){
  if(!viejitoBrain)return null;
  registerBrainSkills();
  const requested=requestedLineNumber(text)||ACTIVE_LINE;
  const plan=viejitoBrain.makePlan(text);
  // Operational commands remain with the existing deterministic action workflows.
  // Brain owns analysis/query orchestration and never turns a what-if question into a write.
  if(!plan.handled||plan.mode==='action'||plan.mode==='training')return null;
  const run=viejitoBrain.run(text,{requestedLine:requested});
  return run?brainComposeResponse(run,requested):null;
}

function refreshBrainInsightAfterCut(){
  if(!viejitoBrain||inChatQuery||demoMode())return;
  registerBrainSkills();
  try{
    const run=viejitoBrain.run(state.language==='es'?'revisa todo':'full review',{requestedLine:ACTIVE_LINE});
    if(!run)return;
    const top=run.findings?.[0]||null;
    const payload={time:new Date().toISOString(),line:ACTIVE_LINE,priority:top?.level||'info',score:Number(top?.score)||0,message:top?.message||''};
    lineSet(BRAIN_LAST_INSIGHT_KEY,JSON.stringify(payload));
  }catch(error){console.warn('Brain insight refresh failed',error);}
}



// V5.34.6 — Daily Quality + Operator Action Report (English output by design).
let lastDailyReport=null;
function dailyReportCopy(){
  return {
    tool:'Daily Quality Report',kicker:'QUALITY & SHIFT REVIEW',title:'Daily Quality Report',
    help:'Review real completed cuts, BW trend, sheet balance, S-Wrap changes and recommendation use. Print one line or all four lines.',
    period:'Period',last24:'Last 24 hours',calendar:'Calendar day',date:'Date',lines:'Lines',current:`Line ${ACTIVE_LINE}`,all:'All lines',shift:'Shift',allShifts:'All Shifts',
    generate:'Generate report',print:'Print report',noData:'No real completed cuts or operator-action events are stored for this selection.',generated:'Generated',cuts:'Cuts',products:'Products',
    bwTrend:'BW trend vs target',balanceTrend:'Sheet-balance trend',inTarget:'Average on target',outRange:'Average out of range',imbalance:'Imbalanced cuts',maxImbalance:'Max imbalance',lead:'Lead review',
    incident:'Sheet Balance incidents',detail:'Cut detail',productTrend:'Trend by product',swrapChanges:'S-Wrap changes',recommendApplied:'Recommendations applied',recommendNotApplied:'Recommendations not applied',operatorActions:'S-Wrap & recommendation actions'
  };
}
function renderDailyReportLabels(){
  const c=dailyReportCopy();
  if($('daily-report-tool-label'))$('daily-report-tool-label').textContent=c.tool;
  if($('daily-report-kicker'))$('daily-report-kicker').textContent=c.kicker;
  if($('daily-report-title'))$('daily-report-title').textContent=c.title;
  if($('daily-report-help'))$('daily-report-help').textContent=c.help;
  if($('daily-report-period-label'))$('daily-report-period-label').textContent=c.period;
  if($('daily-report-date-label'))$('daily-report-date-label').textContent=c.date;
  if($('daily-report-scope-label'))$('daily-report-scope-label').textContent=c.lines;
  if($('daily-report-shift-label'))$('daily-report-shift-label').textContent=c.shift;
  const period=$('daily-report-period');if(period){period.options[0].text=c.last24;period.options[1].text=c.calendar;}
  const scope=$('daily-report-scope');if(scope){scope.options[0].text=c.current;scope.options[1].text=c.all;}
  const shift=$('daily-report-shift');if(shift){shift.options[0].text=c.allShifts;for(const code of ['A','B','C','D']){const opt=[...shift.options].find(x=>x.value===code);if(opt)opt.text=`${code} Shift`;}}
  if($('daily-report-refresh'))$('daily-report-refresh').textContent=c.generate;
  if($('daily-report-print'))$('daily-report-print').textContent=c.print;
}
function dailyReportCutsForLine(line){
  const n=Number(line),rows=n===ACTIVE_LINE?(Array.isArray(state.bwTrendHistory)?state.bwTrendHistory:[]):(getLineJSON(activeTrendHistoryKey(),n,[])||[]);
  return rows.filter(r=>Number.isFinite(Number(r?.winder1))&&Number.isFinite(Number(r?.winder2))&&Number.isFinite(Number(r?.bw??r?.averageBW)));
}
function dailyReportEventsForLine(line){return qualityEventsForLine(Number(line));}
function dailyReportPeriod(){
  const type=$('daily-report-period')?.value||'last24';
  if(type==='calendar')return {type:'calendar',date:$('daily-report-date')?.value||window.ViejitoDailyReport?.localDayKey?.(new Date())};
  return {type:'last24',end:new Date().toISOString()};
}
function dailyReportScopeLines(){return $('daily-report-scope')?.value==='all'?[1,2,3,4]:[ACTIVE_LINE];}
function dailyReportShift(){return String($('daily-report-shift')?.value||'all').toUpperCase();}
function formatReportDateTime(v){
  const d=new Date(v);if(Number.isNaN(d.getTime()))return '—';
  return d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
}
function formatReportPeriod(period,generatedAt,shift='ALL'){
  const code=String(shift||'ALL').toUpperCase();
  if(period?.type==='calendar'){
    if(code!=='ALL'){
      const win=window.ViejitoShiftSchedule?.shiftWindow?.(period.date,code);
      if(win)return `${period.date} • ${code} Shift • ${win.type==='day'?'7:00 AM–7:00 PM':'7:00 PM–7:00 AM'}`;
    }
    return `Calendar day ${period.date}${code!=='ALL'?` • ${code} Shift`:''}`;
  }
  const end=new Date(period?.end||generatedAt),start=new Date(end.getTime()-24*3600000);
  return `${formatReportDateTime(start)} → ${formatReportDateTime(end)}${code!=='ALL'?` • ${code} Shift only`:' • All Shifts'}`;
}
function reportDirectionLabel(direction){return direction==='rising'?'Rising':direction==='falling'?'Falling':'Stable';}
function reportSideLabel(side){return side==='top'?'Winder 2 / Top Sheet':side==='bottom'?'Winder 1 / Bottom Sheet':'Balanced';}
function reportChartSvg(values,{zero=0,thresholds=[],kind='delta'}={}){
  const pts=(values||[]).map(Number).filter(Number.isFinite),w=620,h=150,pad=18;if(!pts.length)return `<div class="report-empty">—</div>`;
  const refs=[...pts,zero,...thresholds.flatMap(t=>[Number(t),-Number(t)])].filter(Number.isFinite);let min=Math.min(...refs),max=Math.max(...refs);if(min===max){min-=1;max+=1;}const extra=(max-min)*.12;min-=extra;max+=extra;
  const x=i=>pad+(pts.length===1?(w-2*pad)/2:i*(w-2*pad)/(pts.length-1)),y=v=>h-pad-(v-min)*(h-2*pad)/(max-min),poly=pts.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '),lines=[];
  if(zero>=min&&zero<=max)lines.push(`<line x1="${pad}" y1="${y(zero).toFixed(1)}" x2="${w-pad}" y2="${y(zero).toFixed(1)}" class="report-zero"/>`);
  for(const t of thresholds){const n=Number(t);if(n>=min&&n<=max)lines.push(`<line x1="${pad}" y1="${y(n).toFixed(1)}" x2="${w-pad}" y2="${y(n).toFixed(1)}" class="report-threshold"/>`);if(kind==='delta'&&-n>=min&&-n<=max)lines.push(`<line x1="${pad}" y1="${y(-n).toFixed(1)}" x2="${w-pad}" y2="${y(-n).toFixed(1)}" class="report-threshold"/>`);}
  return `<svg viewBox="0 0 ${w} ${h}" role="img">${lines.join('')}<polyline points="${poly}" class="report-polyline"/>${pts.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" class="report-dot"/>`).join('')}</svg>`;
}
function leadConfirmationForStreak(line,streak){
  if(!streak)return null;
  return [...(line.actions?.leadRows||[])].reverse().find(e=>e.type==='lead_confirmation'&&e.incidentKey===streak.incidentKey)||null;
}
function dailyReportAssessment(line){
  const streak=line.balance.activeStreak,lead=leadConfirmationForStreak(line,streak);
  if(streak?.count>=4){
    const status=lead?.status==='yes'?'Lead notification confirmed.':lead?.status==='no'?'Lead notification was NOT confirmed by the operator.':'No Lead-notification confirmation was recorded.';
    return {cls:'lead',title:'🚩 LEAD FOLLOW-UP REQUIRED',text:`${reportSideLabel(streak.side)} has been heavier for ${streak.count} consecutive cuts across ${streak.products?.join(' → ')||'the current work'}. ${status} The line-based streak continues until balance returns within 0.25 BW or the heavy side flips.`};
  }
  if(streak?.count>=3)return {cls:'lead',title:'⚠️ NOTIFY LEAD — PERSISTENT IMBALANCE',text:`${reportSideLabel(streak.side)} has been heavier for ${streak.count} consecutive cuts. The operator should notify the Lead and continue monitoring the response to the Die Move.`};
  if(streak)return {cls:'persistent',title:'Active Sheet Balance issue',text:`${reportSideLabel(streak.side)} is heavier by ${fmt(streak.lastDifference,2)} BW. Current streak: ${streak.count}.`};
  return {cls:'good',title:'✓ No active persistent imbalance',text:'The latest stored cut does not maintain an active streak outside the 0.25 BW balance limit.'};
}
function recommendationOutcomeText(e){
  if(e.type==='recommendation_accepted')return 'Applied';
  if(e.reason==='keep_current')return 'Not applied — Keep current selected';
  if(e.reason==='continue_running')return 'Not applied — Continue running selected';
  if(e.reason==='shift_end'||e.reason==='shift_boundary')return 'Not applied before shift ended';
  if(e.reason==='changeover')return 'Not applied before product change';
  return 'Not applied before next cut';
}
function swrapSourceLabel(source){
  const map={corrective_recommendation:'Corrective recommendation',preventive_recommendation:'Preventive recommendation',preventive_edge_recommendation:'Near-limit preventive recommendation',manual_input:'Manual input',chat_manual:'Chat manual change',changeover:'Changeover'};return map[source]||String(source||'Change');
}
function renderDailyReportLine(line){
  const c=dailyReportCopy(),hasActions=(line.actions?.events?.length||0)>0;
  if(!line.totalCuts&&!hasActions)return `<section class="report-sheet"><div class="report-sheet-head"><div><small>LINE</small><h4>Line ${line.line}</h4></div></div><div class="report-empty">${escapeHTML(c.noData)}</div></section>`;
  const assess=dailyReportAssessment(line),bwRows=line.cuts.filter(x=>Number.isFinite(x.delta)),bwVals=bwRows.map(x=>x.delta),balVals=line.cuts.map(x=>x.balanceDifference),inPct=line.bw.withTarget?Math.round(line.bw.green*100/line.bw.withTarget):0;
  const productRows=line.productTrends.map(p=>`<tr><td>${escapeHTML(p.product)}</td><td>${p.count}</td><td>${Number.isFinite(p.targetBW)?fmt(p.targetBW,2):'—'}</td><td>${Number.isFinite(p.firstBW)?fmt(p.firstBW,3):'—'} → ${Number.isFinite(p.lastBW)?fmt(p.lastBW,3):'—'}</td><td>${escapeHTML(reportDirectionLabel(p.direction))}</td></tr>`).join('');
  const incidentRows=line.balance.incidents.slice(-12).map(i=>`<tr><td>${formatReportDateTime(i.startTime)}</td><td>${escapeHTML(reportSideLabel(i.side))}</td><td>${i.count}</td><td>${escapeHTML((i.shifts||[]).join(', ')||'—')}</td><td>${escapeHTML((i.products||[]).join(' → '))}</td><td>${fmt(i.firstDifference,2)} → ${fmt(i.lastDifference,2)}</td><td class="${i.leadReview?'bad':''}">${i.count>=4?'LEAD FOLLOW-UP':i.count>=3?'NOTIFY LEAD':i.maxLevel==='required'?'DIE MOVE REQUIRED':'DIE MOVE'}</td></tr>`).join('');
  const detailRows=line.cuts.slice(-40).reverse().map(x=>`<tr><td>${formatReportDateTime(x.time)}</td><td>${escapeHTML(x.shiftCode||'—')}</td><td>${escapeHTML(x.product)}</td><td>${fmt(x.winder1,3)}</td><td>${fmt(x.winder2,3)}</td><td>${fmt(x.averageBW,3)}</td><td>${Number.isFinite(x.targetBW)?fmt(x.targetBW,2):'—'}</td><td>${Number.isFinite(x.delta)?`${x.delta>=0?'+':''}${fmt(x.delta,3)}`:'—'}</td><td class="${x.balanceLevel!=='balanced'?'bad':''}">${fmt(x.balanceDifference,2)}</td><td>${escapeHTML(reportSideLabel(x.heavySide))}</td></tr>`).join('');
  const swRows=(line.actions?.swrapRows||[]).slice(-30).reverse().map(e=>`<tr><td>${formatReportDateTime(e.time)}</td><td>${escapeHTML(e.shiftCode||'—')}</td><td>${escapeHTML(e.product||'—')}</td><td>${fmt(e.beforeSWrap,1)} → ${fmt(e.afterSWrap,1)}</td><td>${escapeHTML(swrapSourceLabel(e.source))}</td></tr>`).join('');
  const recRows=(line.actions?.recommendationRows||[]).slice(-30).reverse().map(e=>`<tr><td>${formatReportDateTime(e.time)}</td><td>${escapeHTML(e.shiftCode||'—')}</td><td>${escapeHTML(e.product||'—')}</td><td>${escapeHTML(e.recommendationType||'corrective')}</td><td>${Number.isFinite(Number(e.suggestedSWrap))?fmt(e.suggestedSWrap,1):'—'}</td><td class="${e.type==='recommendation_not_used'?'bad':''}">${escapeHTML(recommendationOutcomeText(e))}</td></tr>`).join('');
  const leadSummary=`Lead notification requests: ${line.actions?.leadRequests||0} • Confirmed: ${line.actions?.leadConfirmed||0} • Not confirmed: ${line.actions?.leadNotConfirmed||0}`;
  return `<section class="report-sheet">
    <div class="report-sheet-head"><div><small>INDUSTRIAL IA • QUALITY & SHIFT REVIEW</small><h4>Line ${line.line}</h4></div><div><small>Products</small><br><strong>${escapeHTML(line.products.join(' • ')||'—')}</strong><br><small>Shifts: ${escapeHTML(line.shifts.join(', ')||'—')}</small></div></div>
    <div class="report-summary-grid">
      <div class="report-stat"><span>${c.cuts}</span><strong>${line.totalCuts}</strong></div><div class="report-stat"><span>${c.inTarget}</span><strong>${line.bw.green}/${line.bw.withTarget} (${inPct}%)</strong></div><div class="report-stat"><span>${c.outRange}</span><strong>${line.bw.out}</strong></div><div class="report-stat"><span>${c.imbalance}</span><strong>${line.balance.imbalanceCuts}</strong></div><div class="report-stat"><span>${c.maxImbalance}</span><strong>${fmt(line.balance.maxDifference,2)} BW</strong></div><div class="report-stat"><span>${c.swrapChanges}</span><strong>${line.actions?.swrapChanges||0}</strong></div><div class="report-stat"><span>${c.recommendApplied}</span><strong>${line.actions?.recommendationsApplied||0}</strong></div><div class="report-stat"><span>${c.recommendNotApplied}</span><strong>${line.actions?.recommendationsNotApplied||0}</strong></div>
    </div>
    <div class="report-alert ${assess.cls}"><strong>${escapeHTML(assess.title)}</strong><p>${escapeHTML(assess.text)}</p><p>${escapeHTML(leadSummary)}</p></div>
    ${line.totalCuts?`<div class="report-chart-grid"><div class="report-chart-card"><h5>${c.bwTrend}</h5>${reportChartSvg(bwVals,{zero:0,thresholds:[0.17,0.25],kind:'delta'})}<div class="report-chart-caption"><span>First ${Number.isFinite(line.bw.firstDelta)?`${line.bw.firstDelta>=0?'+':''}${fmt(line.bw.firstDelta,3)}`:'—'}</span><strong>${escapeHTML(reportDirectionLabel(line.bw.direction))}</strong><span>Last ${Number.isFinite(line.bw.lastDelta)?`${line.bw.lastDelta>=0?'+':''}${fmt(line.bw.lastDelta,3)}`:'—'}</span></div></div><div class="report-chart-card"><h5>${c.balanceTrend}</h5>${reportChartSvg(balVals,{zero:0,thresholds:[0.25,1.0],kind:'balance'})}<div class="report-chart-caption"><span>0.25 Die Move suggested</span><strong>${line.balance.requiredCuts} ≥ 1.00</strong><span>1.00 required</span></div></div></div>`:''}
    ${line.productTrends.length?`<div><div class="report-subtitle"><h5>${c.productTrend}</h5><small>${line.productTrends.length}</small></div><div class="report-table-wrap"><table class="report-table"><thead><tr><th>Product</th><th>Cuts</th><th>Target</th><th>Average BW</th><th>Trend</th></tr></thead><tbody>${productRows}</tbody></table></div></div>`:''}
    <div><div class="report-subtitle"><h5>${c.operatorActions}</h5><small>${line.actions?.events?.length||0} events</small></div><div class="report-table-wrap"><table class="report-table report-actions-table"><thead><tr><th colspan="5">S-Wrap changes</th></tr><tr><th>Time</th><th>Shift</th><th>Product</th><th>S-Wrap</th><th>Source</th></tr></thead><tbody>${swRows||'<tr><td colspan="5">No S-Wrap changes recorded.</td></tr>'}</tbody></table></div><div class="report-table-wrap"><table class="report-table report-actions-table"><thead><tr><th colspan="6">Recommendation decisions</th></tr><tr><th>Time</th><th>Shift</th><th>Product</th><th>Type</th><th>Suggested S-Wrap</th><th>Outcome</th></tr></thead><tbody>${recRows||'<tr><td colspan="6">No recommendation decisions recorded.</td></tr>'}</tbody></table></div></div>
    ${line.totalCuts?`<div><div class="report-subtitle"><h5>${c.incident}</h5><small>${line.balance.incidents.length}</small></div><div class="report-table-wrap"><table class="report-table"><thead><tr><th>Start</th><th>Heavy side</th><th>Cuts</th><th>Shift(s)</th><th>Products</th><th>Difference</th><th>Level</th></tr></thead><tbody>${incidentRows||'<tr><td colspan="7">No incidents in period.</td></tr>'}</tbody></table></div></div><div><div class="report-subtitle"><h5>${c.detail}</h5><small>Last 40 in selection</small></div><div class="report-table-wrap"><table class="report-table"><thead><tr><th>Time</th><th>Shift</th><th>Product</th><th>W1</th><th>W2</th><th>Avg</th><th>Target</th><th>Δ BW</th><th>Balance Δ</th><th>Heavy side</th></tr></thead><tbody>${detailRows}</tbody></table></div></div>`:''}
  </section>`;
}
function buildDailyReportFromControls(){
  if(!window.ViejitoDailyReport)return null;
  const lines=dailyReportScopeLines().map(line=>({line,cuts:dailyReportCutsForLine(line),events:dailyReportEventsForLine(line)}));
  const report=window.ViejitoDailyReport.buildReport(lines,dailyReportPeriod(),new Date(),{shift:dailyReportShift()});if(report)report.demo=demoMode();return report;
}
function renderDailyReportPreview(){
  const report=buildDailyReportFromControls(),box=$('daily-report-preview'),c=dailyReportCopy();if(!report||!box)return null;lastDailyReport=report;
  const demoNote=report.demo?' • DEMO DATA — NOT PRODUCTION':'';
  const header=`<section class="report-sheet"><div class="report-sheet-head"><div><small>INDUSTRIAL IA 5.34.6${demoNote}</small><h4>${escapeHTML(c.title)}</h4></div><div><small>${c.generated}</small><br><strong>${formatReportDateTime(report.generatedAt)}</strong></div></div><div class="report-alert ${report.leadReviewLines.length?'lead':'good'}"><strong>${escapeHTML(formatReportPeriod(report.period,report.generatedAt,report.shift))}</strong><p>${report.totalCuts} cuts • ${report.totalSWrapChanges} S-Wrap changes • ${report.totalRecommendationsApplied} recommendations applied • ${report.totalRecommendationsNotApplied} not applied${report.leadReviewLines.length?` • Lead follow-up: Line ${report.leadReviewLines.join(', ')}`:''}</p></div></section>`;
  box.innerHTML=header+report.lines.map(renderDailyReportLine).join('');return report;
}
function openDailyReportDialog(){
  const d=$('daily-report-dialog');if(!d)return;renderDailyReportLabels();const date=$('daily-report-date');if(date&&!date.value)date.value=window.ViejitoDailyReport?.localDayKey?.(new Date())||'';if($('daily-report-scope'))$('daily-report-scope').value='current';if($('daily-report-shift'))$('daily-report-shift').value='all';if($('daily-report-period'))$('daily-report-period').value='last24';updateDailyReportPeriodUI();renderDailyReportPreview();d.classList.remove('hidden');d.setAttribute('aria-hidden','false');closeToolMenu();
}
function closeDailyReportDialog(){const d=$('daily-report-dialog');if(d){d.classList.add('hidden');d.setAttribute('aria-hidden','true');}}
function updateDailyReportPeriodUI(){const calendar=$('daily-report-period')?.value==='calendar';if($('daily-report-date-wrap'))$('daily-report-date-wrap').classList.toggle('hidden',!calendar);}
function dailyReportPrintableDocument(report){
  const c=dailyReportCopy(),demoNote=report.demo?' • DEMO DATA — NOT PRODUCTION':'',body=`<header class="print-head"><div><strong>INDUSTRIAL IA 5.34.6${demoNote}</strong><h1>${escapeHTML(c.title)}</h1><p>${escapeHTML(formatReportPeriod(report.period,report.generatedAt,report.shift))}</p></div><div><small>${c.generated}</small><br>${formatReportDateTime(report.generatedAt)}</div></header>${report.lines.map(renderDailyReportLine).join('')}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHTML(c.title)}</title><style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:22px;background:#fff}.print-head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.print-head h1{margin:4px 0;font-size:24px}.print-head p{margin:0}.report-sheet{page-break-inside:avoid;border:1px solid #bbb;border-radius:10px;padding:14px;margin:0 0 16px}.report-sheet-head{display:flex;justify-content:space-between;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:10px}.report-sheet-head h4{margin:3px 0;font-size:20px}.report-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.report-stat{border:1px solid #ccc;border-radius:7px;padding:7px}.report-stat span{display:block;font-size:8px;text-transform:uppercase}.report-stat strong{font-size:14px}.report-alert{border:1px solid #aaa;border-left:5px solid #555;padding:9px;margin:10px 0}.report-alert.lead{border-left-color:#b00020}.report-alert.persistent{border-left-color:#a46600}.report-alert.good{border-left-color:#087a45}.report-alert p{margin:3px 0 0;font-size:10px}.report-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.report-chart-card{border:1px solid #ccc;border-radius:7px;padding:8px}.report-chart-card h5{margin:0 0 5px}.report-chart-card svg{width:100%;height:120px}.report-zero{stroke:#333;stroke-width:1}.report-threshold{stroke:#999;stroke-width:1;stroke-dasharray:4 4}.report-polyline{fill:none;stroke:#111;stroke-width:2}.report-dot{fill:#111}.report-chart-caption{display:flex;justify-content:space-between;font-size:8px}.report-subtitle{display:flex;justify-content:space-between;margin-top:12px}.report-subtitle h5{margin:0 0 5px}.report-table-wrap{overflow:visible;margin-bottom:7px}.report-table{width:100%;border-collapse:collapse;font-size:8px}.report-table th,.report-table td{border:1px solid #ccc;padding:4px;text-align:left}.report-table th{background:#eee}.bad{font-weight:bold}.report-empty{padding:15px;border:1px dashed #aaa;text-align:center}@media print{body{padding:0}.report-sheet{break-inside:avoid}.report-chart-grid{break-inside:avoid}@page{margin:.35in}}</style></head><body>${body}</body></html>`;
}
function printDailyReport(){const report=renderDailyReportPreview()||lastDailyReport;if(!report)return;const win=window.open('','_blank');if(!win){showToast('The browser blocked the print window.');return;}win.document.open();win.document.write(dailyReportPrintableDocument(report));win.document.close();setTimeout(()=>{try{win.focus();win.print();}catch(_){}},250);}

const SHIFT_CALENDAR_MONTHS=Object.freeze({
  january:0,jan:0,enero:0,
  february:1,feb:1,febrero:1,
  march:2,mar:2,marzo:2,
  april:3,apr:3,abril:3,
  may:4,mayo:4,
  june:5,jun:5,junio:5,
  july:6,jul:6,julio:6,
  august:7,aug:7,agosto:7,
  september:8,sep:8,sept:8,septiembre:8,setiembre:8,
  october:9,oct:9,octubre:9,
  november:10,nov:10,noviembre:10,
  december:11,dec:11,diciembre:11
});
function validCalendarDate(year,month,day){
  const y=Number(year),m=Number(month),d=Number(day);if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d))return null;
  const out=new Date(y,m,d,12,0,0,0);return out.getFullYear()===y&&out.getMonth()===m&&out.getDate()===d?out:null;
}
function upcomingCalendarYear(month,day,now=new Date()){
  let y=now.getFullYear(),candidate=validCalendarDate(y,month,day);if(!candidate)return y;
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0);
  if(candidate<today)y+=1;return y;
}
function parseCalendarClock(q){
  let m=q.match(/\b(?:at|a\s+las?)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if(m){let h=Number(m[1]),min=Number(m[2]||0);if(h>=1&&h<=12&&min>=0&&min<60){if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0;return {hour:h,minute:min};}}
  m=q.match(/\b(?:at|a\s+las?)\s*(\d{1,2})(?::(\d{2}))\b/);
  if(m){const h=Number(m[1]),min=Number(m[2]);if(h>=0&&h<=23&&min>=0&&min<60)return {hour:h,minute:min};}
  return null;
}
function parseShiftCalendarDate(text,now=new Date()){
  const q=normalizeKnowledgeQuery(text),schedule=window.ViejitoShiftSchedule;if(!schedule)return null;
  const yearMatch=q.match(/\b(20\d{2}|21\d{2})\b/);let year=yearMatch?Number(yearMatch[1]):null,date=null,label='date';
  if(/\b(thanksgiving|thanksgiving day|accion de gracias|dia de accion de gracias)\b/.test(q)){
    if(!year){let y=now.getFullYear(),t=schedule.thanksgivingDate?.(y);const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0);if(t&&t<today)y+=1;year=y;}
    date=schedule.thanksgivingDate?.(year)||null;label='Thanksgiving';
  }
  if(!date&&/\b(today|hoy)\b/.test(q))date=validCalendarDate(now.getFullYear(),now.getMonth(),now.getDate());
  if(!date&&/\b(day after tomorrow|pasado manana)\b/.test(q)){const d=new Date(now);d.setDate(d.getDate()+2);date=validCalendarDate(d.getFullYear(),d.getMonth(),d.getDate());}
  if(!date&&/\b(tomorrow|manana)\b/.test(q)){const d=new Date(now);d.setDate(d.getDate()+1);date=validCalendarDate(d.getFullYear(),d.getMonth(),d.getDate());}
  if(!date){
    let m=q.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:de\s+)?(january|jan|enero|february|feb|febrero|march|mar|marzo|april|apr|abril|may|mayo|june|jun|junio|july|jul|julio|august|aug|agosto|september|sep|sept|septiembre|setiembre|october|oct|octubre|november|nov|noviembre|december|dec|diciembre)(?:\s+(?:de|del)?\s*(20\d{2}|21\d{2}))?\b/);
    if(m){const day=Number(m[1]),month=SHIFT_CALENDAR_MONTHS[m[2]],y=Number(m[3])||year||upcomingCalendarYear(month,day,now);date=validCalendarDate(y,month,day);}
  }
  if(!date){
    let m=q.match(/\b(january|jan|enero|february|feb|febrero|march|mar|marzo|april|apr|abril|may|mayo|june|jun|junio|july|jul|julio|august|aug|agosto|september|sep|sept|septiembre|setiembre|october|oct|octubre|november|nov|noviembre|december|dec|diciembre)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(20\d{2}|21\d{2}))?\b/);
    if(m){const month=SHIFT_CALENDAR_MONTHS[m[1]],day=Number(m[2]),y=Number(m[3])||year||upcomingCalendarYear(month,day,now);date=validCalendarDate(y,month,day);}
  }
  if(!date){
    const m=q.match(/\b(20\d{2}|21\d{2})-(\d{1,2})-(\d{1,2})\b/);if(m)date=validCalendarDate(Number(m[1]),Number(m[2])-1,Number(m[3]));
  }
  if(!date)return null;
  const clock=parseCalendarClock(q);if(clock)date=new Date(date.getFullYear(),date.getMonth(),date.getDate(),clock.hour,clock.minute,0,0);
  return {date,clock,label};
}
function formatShiftCalendarDate(date){
  const locale=state.language==='es'?'es-US':state.language==='fr'?'fr-FR':'en-US';
  return date.toLocaleDateString(locale,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
}
function shiftCalendarChatQuery(text){
  const q=normalizeKnowledgeQuery(text);
  const asksShift=/\b(shift|turno|turnos|who works|who is working|works|working|quien trabaja|quien va a trabajar|trabaja|trabajara|trabajar)\b/.test(q);
  if(!asksShift)return null;
  const parsed=parseShiftCalendarDate(text);if(!parsed)return null;
  const schedule=window.ViejitoShiftSchedule;if(!schedule)return null;
  const dateLabel=formatShiftCalendarDate(parsed.date);
  if(parsed.clock){
    const info=schedule.shiftAt(parsed.date);if(!info)return null;
    const timeLabel=parsed.date.toLocaleTimeString(state.language==='es'?'es-US':'en-US',{hour:'numeric',minute:'2-digit'});
    return {kind:'result',title:chatLang('Shift calendar','Calendario de turnos','Calendrier des quarts'),message:chatLang(
      `${dateLabel} at ${timeLabel}: ${info.code} Shift is working (${info.type==='day'?'day shift':'night shift'}). The schedule pair for the shift workday is ${info.pair}.`,
      `${dateLabel} a las ${timeLabel}: trabaja el Turno ${info.code} (${info.type==='day'?'turno de día':'turno de noche'}). La pareja programada para ese turno es ${info.pair}.`,
      `${dateLabel} à ${timeLabel} : quart ${info.code}.`
    )};
  }
  const info=schedule.dateSchedule?.(parsed.date);if(!info)return null;
  const holiday=parsed.label==='Thanksgiving'?chatLang('Thanksgiving — ','Thanksgiving — ','Thanksgiving — '):'';
  return {kind:'result',title:chatLang('Shift calendar','Calendario de turnos','Calendrier des quarts'),message:chatLang(
    `${holiday}${dateLabel} is an ${info.pair} workday. ${info.dayShift} Shift works 7:00 AM–7:00 PM, and ${info.nightShift} Shift works 7:00 PM–7:00 AM the next morning.`,
    `${holiday}${dateLabel} corresponde a ${info.pair}. Turno ${info.dayShift} trabaja de 7:00 AM a 7:00 PM y Turno ${info.nightShift} de 7:00 PM a 7:00 AM del día siguiente.`,
    `${holiday}${dateLabel} correspond à ${info.pair}. Quart ${info.dayShift} de 7 h à 19 h et quart ${info.nightShift} de 19 h à 7 h.`
  )};
}

function localIntelligenceQuery(text){
  const calendarResponse=shiftCalendarChatQuery(text); if(calendarResponse)return calendarResponse;
  const brainResponse=brainLocalQuery(text); if(brainResponse)return brainResponse;
  const q=String(text||'').toLowerCase();
  if(/\b(how are we|how is line|status|como vamos|cómo vamos|estado|comment va|cómo está|como esta|running|corriendo)\b/.test(q)){
    const requested=requestedLineNumber(text);
    return lineStatusAnswer(requested||ACTIVE_LINE);
  }
  if(/\b(last|recent|history|historial|últimos|ultimos)\b/.test(q)&&/\b(roll|rolls|bw|cortes?|history|historial)\b/.test(q)){
    const rows=(state.learningEngine.records||[]).slice(-5).reverse();
    return {kind:'info',title:state.language==='es'?'Últimos datos aprendidos':'Recent learned data',message:rows.length?rows.map(r=>`${r.product}: BW ${fmt(r.finalBW,3)} @ ${fmt(r.appliedSWrap,1)}`).join(' | '):(state.language==='es'?'No hay datos aprendidos para esta línea.':'No learned data for this line.')};
  }
  return null;
}

function interpret(text){
  // Finish an active guided workflow before generic numeric parsing.
  if(chatWorkflow?.type==='start-line'){
    const startFlow=handleStartLineChatWorkflow(text); if(startFlow)return startFlow;
  }
  if(chatWorkflow?.type==='coordinated-speed-bw'){
    const speedWorkflow=handleCoordinatedSpeedWorkflow(text); if(speedWorkflow)return speedWorkflow;
  }
  if(chatWorkflow?.type==='process-performance'){
    const processWorkflow=handleProcessPerformanceWorkflow(text); if(processWorkflow)return processWorkflow;
  }
  if(chatWorkflow?.type==='output-rate'){
    const outputWorkflow=handleOutputRateWorkflow(text); if(outputWorkflow)return outputWorkflow;
  }
  if(chatWorkflow?.type==='changeover-advice'){
    const changeoverWorkflow=handleChangeoverChat(text); if(changeoverWorkflow)return changeoverWorkflow;
  }
  // Primary/Secondary questions belong to Process Performance Learning, not BW numeric parsing.
  const processPerformance=processPerformanceChatQuery(text); if(processPerformance)return processPerformance;
  const outputRate=standaloneOutputChatQuery(text); if(outputRate)return outputRate;
  const conversation=conversationalChat(text); if(conversation)return conversation;
  const intelligence=localIntelligenceQuery(text); if(intelligence)return intelligence;
  const action=chatActionCommand(text); if(action)return action;
  const smartPair=smartChatBWPair(text); if(smartPair)return smartPair;
  const workflowResponse=handleChangeoverChat(text);
  if(workflowResponse) return workflowResponse;
  const knowledge=extrusionKnowledgeQuery(text); if(knowledge)return knowledge;
  const mandrel=requestedMandrel(text) || state.context.mandrel || state.mandrel || DEFAULT_MANDREL;
  const smartRequest=parseSmartBWRequest(text);
  if(smartRequest) return handleSmartBW(smartRequest,mandrel);
  const explicit=explicitIntent(text);
  let vals=stripMandrelValue(numbers(text),text);
  if((explicit||vals.length)){const gate=activeShiftChatGate();if(gate)return gate;}
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
      else if(n<=MAX_SWRAP_SPEED) intent='swrap';
      else intent='ft';
    }
  }

  if(!intent) return unsupportedChatResponse();

  try{
    if(intent==='bw'){
      if(vals.length>=2){
        const [weight,length]=vals;
        const result=calculateBW(weight,length,mandrel);
        state.context={intent:'bw',weight,length,mandrel,lastCalculation:true}; saveContext();
        addHistory('BW',`${fmt(result)} • ${weight} lb / ${length} ft • ${mandrel}”`);
        const optimizer=optimizeBasisWeight(result);
        const trend=recordBWForTrend(result,state.targetBW,state.currentSWrap);
        return {kind:'result',title:'Basis Weight',value:fmt(result),meta:mandrel===48?t('defaultMandrel',{m:mandrel}):t('mandrelOnly',{m:mandrel}),optimizer,trend,sarcasm:getSarcasmLine()};
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
        const rawResult=rawSWrapCalculation(currentWeight,currentSpeed,targetWeight);
        const result=clampSWrap(rawResult);
        state.context={intent:'swrap',currentWeight,currentSpeed,targetWeight,lastCalculation:true}; saveContext();
        addHistory('S-Wrap',`${fmt(result,1)} speed • ${currentWeight} × ${currentSpeed} ÷ ${targetWeight}`);
        return {kind:'result',title:'S-Wrap Speed',value:fmt(result,1),meta:rawResult>MAX_SWRAP_SPEED?`${t('newRecommendedSpeed')} • ${swrapLimitCopy()}`:t('newRecommendedSpeed'),sarcasm:getSarcasmLine()};
      }
      const n=vals[0];
      state.context={...state.context,intent:'swrap',currentSpeed:n}; saveContext();
      return {kind:'info',title:'S-Wrap Speed',message:t('swSingle',{n:fmt(n,1)})};
    }
  }catch(error){return {kind:'error',message:error.message};}
}

function recalculateWithMandrel(mandrel){
  if(!VALID_MANDRELS.includes(mandrel)) return {kind:'error',message:t('onlyMandrels')};
  state.mandrel=mandrel; lineSet('viejitoMandrel',String(mandrel));
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

function saveContext(){lineSet('viejitoContext',JSON.stringify(state.context));}
function addHistory(type,detail){
  if(inChatQuery || demoMode()) return; // Chat questions never enter operational history/learning.
  state.history.unshift({type,detail,time:new Date().toISOString(),line:ACTIVE_LINE});
  state.history=state.history.slice(0,20);
  lineSet('viejitoHistory',JSON.stringify(state.history));
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
  else div.innerHTML=`${content.title?`<span class="title">${escapeHTML(content.title)}</span>`:''}${content.value?`<strong style="font-size:1.55rem">${escapeHTML(content.value)}</strong>`:''}${content.message?escapeHTML(content.message):''}${content.meta?`<small style="display:block;margin-top:5px;opacity:.72">${escapeHTML(content.meta)}</small>`:''}${content.optimizer?optimizerMarkup(content.optimizer):''}${content.trend?trendMarkup(content.trend):''}${content.sarcasm?`<div class="sarcasm-line">${escapeHTML(content.sarcasm)}</div>`:''}`;
  $('chat-log').appendChild(div); $('chat-log').scrollTop=$('chat-log').scrollHeight;
}
function showToast(msg){const toast=$('toast');toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
function setChatOpen(open){
  const chat=$('floating-chat');
  const fab=$('chat-fab');
  const backdrop=$('chat-backdrop');
  chat.classList.toggle('open',open);
  chat.setAttribute('aria-hidden',String(!open));
  fab.setAttribute('aria-expanded',String(open));
  fab.setAttribute('aria-label',open?t('closeChat'):t('openChat'));
  document.body.classList.toggle('chat-open',open);
  backdrop.hidden=!open;
  if(open){
    if(!$('chat-log').children.length){if(!restoreChatMessages())ensureChatWelcome();}
    requestAnimationFrame(()=>$('chat-input').focus({preventScroll:true}));
  }
}
function toggleChat(){setChatOpen(!$('floating-chat').classList.contains('open'));}
function closeToolMenu(){
  const menu=$('tool-menu-popover'),toggle=$('tool-menu-toggle');
  if(menu)menu.classList.add('hidden');
  if(toggle)toggle.setAttribute('aria-expanded','false');
}
function toggleToolMenu(){
  const menu=$('tool-menu-popover'),toggle=$('tool-menu-toggle');
  if(!menu||!toggle)return;
  const open=menu.classList.contains('hidden');
  menu.classList.toggle('hidden',!open);
  toggle.setAttribute('aria-expanded',String(open));
}
function switchView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.quick-card').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  $(`view-${view}`).classList.add('active');
  const activeButton=document.querySelector(`.quick-card[data-view="${view}"] strong`);
  if($('active-tool-label')&&activeButton)$('active-tool-label').textContent=activeButton.textContent;
  closeToolMenu();
}
function updateToolMandrelButtons(value){
  document.querySelectorAll('.tool-mandrel').forEach(button=>button.classList.toggle('active',Number(button.dataset.value)===Number(value)));
}
function selectMandrel(target,value){
  const numeric=Number(value)||DEFAULT_MANDREL;
  state.mandrel=numeric;
  lineSet('viejitoMandrel',String(numeric));
  document.querySelectorAll(`.mandrel[data-target="${target}"]`).forEach(button=>button.classList.toggle('active',Number(button.dataset.value)===numeric));
  updateToolMandrelButtons(numeric);
  updateMetaText();
}
function currentMandrel(target){
  const active=document.querySelector(`.mandrel[data-target="${target}"].active`);
  return active?Number(active.dataset.value):(Number(state.mandrel)||DEFAULT_MANDREL);
}
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
  lineSet('viejitoLanguage',state.language);
  localStorage.setItem('viejitoLanguage',state.language); // legacy/default fallback for lines not configured yet
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
  if($('hero-eyebrow')) $('hero-eyebrow').textContent=t('plantMode');
  if($('hero-title')) $('hero-title').textContent=t('heroTitle');
  if($('hero-description')) $('hero-description').textContent=t('heroDescription');
  $('quick-grid').setAttribute('aria-label',t('quickTools'));
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $('chat-fab').setAttribute('aria-label',$('floating-chat').classList.contains('open')?t('closeChat'):t('openChat'));
  $('chat-close').setAttribute('aria-label',t('closeChat'));
  $('floating-chat-status').textContent=t('assistantOnline');
  $('chat-fab').querySelector('.chat-fab-label').textContent=t('chat');
  $('chat-input').placeholder=t('chatPlaceholder');
  $('chat-input').setAttribute('aria-label',t('chatAria'));
  $('send-button').textContent=t('send');
  $('winder1-title').textContent=t('winder1');
  $('winder2-title').textContent=t('winder2');
  $('winder1-required').textContent=t('required');
  $('winder2-optional').textContent=t('winder2Optional');
  $('average-bw-label').textContent=t('averageBW');
  $('winder1-result-label').textContent=t('winder1');
  $('winder2-result-label').textContent=t('winder2');
  $('winder1-calc').textContent=winderButtonText(1);
  $('winder2-calc').textContent=winderButtonText(2);
  $('bw-calc').textContent=completeCutText();
  $('ft-calc').textContent=t('calculateFT');
  $('sw-calc').textContent=t('calculateSWrap');
  $('sw-formula').textContent=t('swFormula');
  $('clear-history').textContent=t('clear');
  $('footer-text').textContent=t('footer');
  $('target-bw-label').textContent=ot('targetBW');
  $('current-swrap-label').textContent=ot('currentSWrap');
  $('optimizer-target-label').textContent=ot('targetBW');
  $('optimizer-difference-label').textContent=ot('difference');
  $('optimizer-current-label').textContent=ot('currentSWrap'); renderOptimizationSWrapContext(state.latestOptimization);
  $('optimizer-suggested-label').textContent=ot('suggestedSWrap');
  $('formula-label').textContent=ot('formulaSuggestion');
  $('learned-label').textContent=ot('learnedSuggestion');
  $('confidence-label').textContent=ot('confidence');
  $('rolls-label').textContent=ot('rollsLearned');
  if($('record-result-toggle'))$('record-result-toggle').textContent=ot('recordResult');
  $('learning-question').textContent=ot('learningQuestion');
  $('applied-swrap-label').textContent=ot('appliedSWrap');
  $('final-bw-label').textContent=ot('finalBW');
  $('save-learning').textContent=ot('saveLearn');
  $('cancel-learning').textContent=ot('cancel');
  $('machine-learning-title').textContent=ot('machineLearning');
  if($('clear-learning'))$('clear-learning').textContent=state.language==='es'?'Borrar aprendizaje adaptativo':state.language==='fr'?'Effacer l’apprentissage adaptatif':'Reset Adaptive Learning';
  $('dashboard-rolls-label').textContent=ot('rollsLearned');
  $('dashboard-correction-label').textContent=ot('averageCorrection');
  $('dashboard-success-label').textContent=ot('successRate');
  $('dashboard-confidence-label').textContent=ot('confidence');
  $('learning-note').textContent=ot('deviceOnly');
  if($('clear-trend'))$('clear-trend').textContent=state.language==='es'?'Borrar historial de tendencia':state.language==='fr'?'Effacer l’historique de tendance':'Clear Trend History';
  if($('clear-process-learning'))$('clear-process-learning').textContent=state.language==='es'?'Borrar aprendizaje de desempeño':state.language==='fr'?'Effacer l’apprentissage de performance':'Clear Process Performance Learning';
  renderManualProcessLanguage();
  renderSpeedChangeLanguage();
  if($('learning-help-popover'))$('learning-help-popover').textContent=state.language==='es'
    ?'Adaptive Machine Learning — Función: compara cambios de S-Wrap aceptados con el BW real de los cortes siguientes. Aprende por línea y usa contexto comparable de producto, mandrel y cambios de producto para mejorar futuras recomendaciones. Rolls Learned son resultados confirmados; Average Correction es la corrección aprendida sobre la fórmula; Success Rate mide resultados dentro de ±0.17; Confidence aumenta con datos suficientes y consistentes.'
    :state.language==='fr'
      ?'Adaptive Machine Learning — Fonction : compare les changements S-Wrap acceptés avec le BW réel des coupes suivantes et apprend par ligne, produit et mandrin pour améliorer les recommandations futures. Rolls Learned = résultats confirmés; Average Correction = correction apprise; Success Rate = résultats dans ±0,17; Confidence augmente avec des données cohérentes.'
      :'Adaptive Machine Learning — Function: compares accepted S-Wrap changes with the actual BW of following completed cuts, then learns line, product, mandrel and changeover behavior to improve future recommendations. Rolls Learned = confirmed results; Average Correction = learned correction to the formula; Success Rate = results within ±0.17; Confidence grows with enough consistent data.';
  if($('trend-help-popover'))$('trend-help-popover').textContent=state.language==='es'
    ?'IA Predictor — Función: analiza los cortes completos comparables más recientes de esta línea, producto y mandrel para proyectar hacia dónde va el próximo BW y detectar si conviene una corrección preventiva de S-Wrap. El resumen de Hoy compara cada corte válido con el target de su producto: verde ±0.17, warning >0.17 y <0.25, rojo ≥0.25.'
    :state.language==='fr'
      ?'IA Predictor — Fonction : analyse les coupes comparables les plus récentes de cette ligne, produit et mandrin pour prévoir le prochain BW et détecter si une correction préventive du S-Wrap est utile. Le résumé du jour compare chaque coupe valide à sa cible : vert ±0,17, attention >0,17 et <0,25, rouge ≥0,25.'
      :'AI Predictor — Function: analyzes the most recent comparable completed cuts from this line, product and mandrel to project where the next BW is heading and detect when a preventive S-Wrap adjustment may help. Today’s summary compares each valid cut with its own product target: green ±0.17, warning >0.17 and <0.25, red ≥0.25.';

  $('too-light-label').textContent=ot('tooLight');
  $('too-heavy-label').textContent=ot('tooHeavy');
  renderDailyReportLabels();
  renderPendingCut();
  renderDemoModeBanner();
  if(state.latestOptimization)renderRecommendationDecision(state.latestOptimization);
  if(typeof renderShiftPanel==='function') renderShiftPanel();
  updateMetaText();
  updateConnection();
  renderHistory();
  renderTrendPanel(analyzeTrend());
  if(announce){
    // Language is per-line; changing it must not erase this line's chat history.
    showToast(state.language==='es'?'Idioma guardado para esta línea.':state.language==='fr'?'Langue enregistrée pour cette ligne.':'Language saved for this line.');
  }
}


const SHEET_TYPES = Object.freeze([
  '5.3/36','5.3/43','6.1/36','6.1/43','6.1/60','6.35/36','6.35/43','6.4/55',
  '6.5/36','6.5/43','6.5/70','7.1/36','7.1/45','8.0/60','8.5/50 LAM','8.6/60',
  '8.6/80','9.0/80','9.1/55','9.3/50','9.3/90','9.75/50 LAM','9.75/75','9.75/80',
  '9.8/80','10.25/90','10.8/65','10.9/55'
]);
function normalizeProduct(value){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,' ');
}
function automaticMandrelForProduct(product){
  const normalized=normalizeProduct(product).replace(/\s+/g,'');
  return (normalized==='9.0/80'||normalized==='10.25/90')?51:48;
}
function applyAutomaticMandrelForProduct(product,{forceDefault=true}={}){
  const normalized=normalizeProduct(product);
  if(!normalized)return state.mandrel;
  const isSpecial=['9.0/80','10.25/90'].includes(normalized.replace(/\s+/g,''));
  if(!isSpecial&&!forceDefault)return state.mandrel;
  const mandrel=isSpecial?51:48;
  state.mandrel=mandrel;
  lineSet('viejitoMandrel',String(mandrel));
  selectMandrel('bw',mandrel);
  selectMandrel('ft',mandrel);
  updateMetaText();
  return mandrel;
}
function targetFromProduct(value){
  const raw=normalizeProduct(value).replace(',','.');
  let match=raw.match(/^0?(\d{1,2})[./](\d{1,2})(?:[./]|$)/);
  if(!match) match=raw.match(/^0?(\d{1,2})(?:\.(\d{1,2}))?/);
  if(!match) return null;
  const whole=Number(match[1]);
  const frac=match[2]||'0';
  const target=Number(`${whole}.${frac}`);
  return Number.isFinite(target)&&target>0?target:null;
}
function syncTargetFromProduct(product,{save=true}={}){
  const target=targetFromProduct(product);
  if(!target) return null;
  const input=$('bw-target');
  if(input) input.value=String(target);
  state.targetBW=target;
  if(save) lineSet('viejitoTargetBW',String(target));
  return target;
}
let productDialogMode='change';
let selectedExtruder=ACTIVE_LINE;
function productDialogText(key){
  const copy={
    en:{start:'Start shift',change:'Changeover',title:'Select sheet type',hint:'Type 8.6 to show only 8.6 sheet types.',target:'Target BW updates automatically',swrap:'Current S-Wrap',extruder:'Select extruder',operator:'Operator',operatorPrompt:'Enter operator name',language:'Language',languagePrompt:'Select language',confirmStart:'Start shift',confirmChange:'Start changeover',cancel:'Cancel'},
    es:{start:'Empezar turno',change:'Cambio de producto',title:'Selecciona el sheet type',hint:'Escribe 8.6 para mostrar solamente los sheet types 8.6.',target:'El Target BW cambia automáticamente',swrap:'S-Wrap actual',extruder:'Selecciona el extruder',operator:'Operador',operatorPrompt:'Escribe el nombre del operador',language:'Idioma',languagePrompt:'Selecciona idioma',confirmStart:'Empezar turno',confirmChange:'Iniciar cambio',cancel:'Cancelar'},
    fr:{start:'Démarrer le quart',change:'Changement de produit',title:'Sélectionnez le type de feuille',hint:'Tapez 8.6 pour afficher uniquement les types 8.6.',target:'Le BW cible est mis à jour automatiquement',swrap:'S-Wrap actuel',extruder:'Sélectionnez l’extrudeuse',operator:'Opérateur',operatorPrompt:'Saisissez le nom de l’opérateur',language:'Langue',languagePrompt:'Choisir la langue',confirmStart:'Démarrer',confirmChange:'Changer',cancel:'Annuler'}
  };
  return (copy[state.language]||copy.en)[key]||key;
}
function renderProductChoices(query=''){
  const box=$('product-choice-list'); if(!box)return;
  const q=normalizeProduct(query).replace(/\s+/g,'');
  const matches=SHEET_TYPES.filter(item=>!q||item.replace(/\s+/g,'').includes(q)).slice(0,20);
  box.innerHTML=matches.map(item=>`<button type="button" class="product-choice" data-product="${escapeHTML(item)}"><strong>${escapeHTML(item)}</strong><small>Target ${escapeHTML(String(targetFromProduct(item)))}</small></button>`).join('')||`<p class="empty">${state.language==='es'?'No encontré ese sheet type. Puedes escribirlo manualmente.':state.language==='fr'?"Aucun type trouvé. Vous pouvez le saisir manuellement.":'No matching sheet type. You can enter it manually.'}</p>`;
  box.querySelectorAll('.product-choice').forEach(button=>button.addEventListener('click',()=>{
    $('product-search').value=button.dataset.product;
    updateProductDialogPreview();
    box.querySelectorAll('.product-choice').forEach(b=>b.classList.toggle('selected',b===button));
  }));
}
function changeoverHistoryRecommendation(product){
  const normalized=normalizeProduct(product||'');
  const newTarget=targetFromProduct(normalized);
  if(!normalized||!newTarget)return null;
  const context={product:normalized.toUpperCase(),mandrel:currentMandrel('bw'),extruder:ACTIVE_LINE,targetBW:newTarget};
  const profile=state.learningEngine.processProfile(context,newTarget);
  const last=state.lastCompletedCut && Number(state.lastCompletedCut.extruder||ACTIVE_LINE)===ACTIVE_LINE ? state.lastCompletedCut : null;
  const actualBW=Number(last?.averageBW);
  const currentSWrap=Number(last?.currentSWrap||state.currentSWrap||$('bw-current-swrap')?.value||170);
  const referenceBW=positive(actualBW)?actualBW:Number(state.targetBW);
  const rawFormula=positive(referenceBW,currentSWrap,newTarget)?currentSWrap*referenceBW/newTarget:currentSWrap;
  const formula=clampSWrap(rawFormula);
  let recommendation=formula,weight=0;
  if(profile.count>=5&&positive(profile.recommendedSWrap)){
    weight=Math.min(.65,Math.max(.15,(profile.confidence||0)/140));
    recommendation=formula*(1-weight)+Number(profile.recommendedSWrap)*weight;
  }
  const rawRecommendation=recommendation;
  recommendation=clampSWrap(recommendation);
  return {profile,referenceBW,currentSWrap,formula:Math.round(formula),rawFormula:Math.round(rawFormula),recommendation:Math.round(recommendation),rawRecommendation:Math.round(rawRecommendation),limitReached:rawFormula>MAX_SWRAP_SPEED||rawRecommendation>MAX_SWRAP_SPEED,maxSWrap:MAX_SWRAP_SPEED,historyWeight:weight};
}
function renderJobHistoryPreview(product){
  const box=$('job-history-preview'); if(!box)return;
  const result=changeoverHistoryRecommendation(product);
  if(!result){box.innerHTML='';box.classList.add('hidden');return;}
  const p=result.profile;
  const lang=state.language;
  const title=lang==='es'?`Historial Línea ${ACTIVE_LINE}`:lang==='fr'?`Historique Ligne ${ACTIVE_LINE}`:`Line ${ACTIVE_LINE} history`;
  const noData=lang==='es'?'Todavía no hay suficiente historial comparable. Viejito usará la fórmula matemática.':lang==='fr'?"Pas encore assez d’historique comparable. Viejito utilisera la formule mathématique.":'Not enough comparable history yet. Viejito will use the mathematical formula.';
  box.classList.remove('hidden');
  if(!p.count){box.innerHTML=`<strong>${title}</strong><small>${noData}</small>`;return;}
  const variation=p.bwSpread!=null?`±${fmt(p.bwSpread,3)}`:'—';
  const effect=p.slope!=null?`${p.slope>0?'+':''}${fmt(p.slope,5)} BW / S-Wrap point`:'Learning…';
  box.innerHTML=`<strong>${title}</strong><div class="job-history-grid"><span>Rolls <b>${p.count}</b></span><span>Typical S-Wrap <b>${p.typicalSWrap??'—'}</b></span><span>BW variation <b>${variation}</b></span><span>Confidence <b>${p.confidence}%</b></span><span class="job-effect">Learned effect <b>${effect}</b></span></div><p>Math ${result.formula} → <b>Recommended start ${result.recommendation}</b>${result.limitReached?` • MAX ${MAX_SWRAP_SPEED}`:''}</p>`;
}
function updateProductDialogPreview(){
  const value=$('product-search')?.value||'';
  const target=targetFromProduct(value);
  $('product-target-preview').textContent=target?String(target):'—';
  renderProductChoices(value);
  renderJobHistoryPreview(value);
  if(productDialogMode==='change' && target){
    const recommendation=changeoverHistoryRecommendation(value);
    if(recommendation&&$('product-swrap')){
      $('product-swrap').value=String(recommendation.recommendation);
      $('product-swrap').readOnly=true;
      $('changeover-auto-box')?.classList.remove('hidden');
      if($('changeover-last-bw'))$('changeover-last-bw').textContent=fmt(recommendation.referenceBW,3);
      if($('changeover-last-swrap'))$('changeover-last-swrap').textContent=fmt(recommendation.currentSWrap,1);
      if($('changeover-new-swrap'))$('changeover-new-swrap').textContent=fmt(recommendation.recommendation,1);
      if($('changeover-auto-note')){
        const base=recommendation.profile.count>=5
          ? `Formula ${recommendation.formula} + Line ${ACTIVE_LINE} history (${recommendation.profile.count} comparable rolls, ${recommendation.profile.confidence}% confidence).`
          : `Formula uses last actual BW ${fmt(recommendation.referenceBW,3)} at S-Wrap ${fmt(recommendation.currentSWrap,1)}.`;
        $('changeover-auto-note').textContent=base+(recommendation.limitReached?` Maximum S-Wrap ${MAX_SWRAP_SPEED} reached.`:'');
      }
    }
  }else{
    if($('product-swrap'))$('product-swrap').readOnly=false;
    $('changeover-auto-box')?.classList.add('hidden');
  }
}
function openProductDialog(mode='change'){
  productDialogMode=mode;
  const dialog=$('product-dialog');
  $('product-dialog-title').textContent=productDialogText('title');
  $('product-dialog-hint').textContent=productDialogText('hint');
  $('product-target-copy').textContent=productDialogText('target');
  if($('product-swrap-copy')) $('product-swrap-copy').textContent=productDialogText('swrap');
  $('product-dialog-confirm').textContent=productDialogText(mode==='start'?'confirmStart':'confirmChange');
  $('product-dialog-cancel').textContent=productDialogText('cancel');
  const operatorRow=$('operator-picker');
  if(operatorRow){
    operatorRow.classList.toggle('hidden',mode!=='start');
    const label=$('operator-picker-label'); if(label)label.textContent=productDialogText('operator');
    const input=$('product-operator');
    if(input){
      input.placeholder=productDialogText('operatorPrompt');
      input.value=state.operator||'';
    }
  }
  const scheduledRow=$('scheduled-shift-preview');
  if(scheduledRow){
    scheduledRow.classList.toggle('hidden',mode!=='start');
    if(mode==='start'&&$('scheduled-shift-value'))$('scheduled-shift-value').textContent=shiftDisplay(scheduledShiftInfo());
  }
  const languageRow=$('shift-language-picker');
  if(languageRow){
    languageRow.classList.toggle('hidden',mode!=='start');
    const label=$('shift-language-picker-label'); if(label)label.textContent=state.language==='es'?'Idioma / Language':'Language / Idioma';
    const select=$('product-language');
    if(select){
      select.options[0].text=state.language==='es'?'Selecciona idioma / Select language':'Select language / Selecciona idioma';
      select.value='';
    }
  }
  const picker=$('extruder-picker');
  picker?.classList.add('hidden');
  if($('extruder-picker-label')) $('extruder-picker-label').textContent=`Line ${ACTIVE_LINE}`;
  selectedExtruder=ACTIVE_LINE;
  document.querySelectorAll('.extruder-option').forEach(button=>button.classList.toggle('selected',Number(button.dataset.extruder)===selectedExtruder));
  $('product-search').value=mode==='start'?($('bw-product').value||state.product||''):'';
  if($('product-swrap')){$('product-swrap').readOnly=false;$('product-swrap').value=fmt(Number($('bw-current-swrap').value||state.currentSWrap||180),1);}
  updateProductDialogPreview();
  dialog.classList.remove('hidden'); dialog.setAttribute('aria-hidden','false');
  setTimeout(()=>$('product-search').focus(),50);
}
function closeProductDialog(){
  const dialog=$('product-dialog'); dialog.classList.add('hidden'); dialog.setAttribute('aria-hidden','true');
}


const PRODUCTION_TARGETS_KEY='viejitoProductionTargetsV1';
function productionCopy(key){
  const copy={
    en:{current:'Current rate',material:'Target rate',projected:'Projected end',target:'Shift target',start:'Start a shift to begin production tracking.',waiting:'Add completed cuts to calculate a realistic rate.',above:'If you continue at this rate, you will finish {diff} lbs ABOVE target.',below:'If you continue at this rate, you will finish {diff} lbs BELOW target.',on:'You are projected to finish on target.',targetButton:'Target lbs',hour:'Target lbs per hour',hours:'Shift hours',total:'Target per shift',save:'Save target',history:'Products run today',none:'No completed product runs yet.',active:'RUNNING',complete:'COMPLETE',avg:'Average',used:'Material used',duration:'Run time',shiftAvg:'Shift average'},
    es:{current:'Libras por hora',material:'Target lbs/hr',projected:'Proyección final',target:'Meta del turno',start:'Empieza el turno para iniciar el seguimiento.',waiting:'Completa cortes para calcular un ritmo realista.',above:'Si sigues a este ritmo, terminarás {diff} lbs ARRIBA de la meta.',below:'Si sigues a este ritmo, terminarás {diff} lbs ABAJO de la meta.',on:'La proyección indica que terminarás en la meta.',targetButton:'Target lbs',hour:'Target lbs por hora',hours:'Horas del turno',total:'Target por turno',save:'Guardar target',history:'Productos corridos hoy',none:'Todavía no hay productos completados.',active:'CORRIENDO',complete:'TERMINADO',avg:'Promedio',used:'Material usado',duration:'Tiempo corrido',shiftAvg:'Promedio del turno'},
    fr:{current:'Livres par heure',material:'Cible lb/h',projected:'Projection finale',target:'Objectif du quart',start:'Démarrez un quart pour commencer le suivi.',waiting:'Terminez des coupes pour calculer un rythme réaliste.',above:'À ce rythme, vous finirez {diff} lb AU-DESSUS de la cible.',below:'À ce rythme, vous finirez {diff} lb SOUS la cible.',on:'La projection indique que vous finirez sur la cible.',targetButton:'Cible lb',hour:'Cible lb par heure',hours:'Heures du quart',total:'Cible par quart',save:'Enregistrer',history:'Produits exécutés aujourd’hui',none:'Aucune série terminée.',active:'EN COURS',complete:'TERMINÉ',avg:'Moyenne',used:'Matériau utilisé',duration:'Durée',shiftAvg:'Moyenne du quart'}
  };
  return (copy[state.language]||copy.en)[key]||key;
}
function productionTargetFor(product){
  const key=normalizeProduct(product||'');
  const saved=state.productionTargets?.[key];
  return {lbsPerHour:Number(saved?.lbsPerHour)||0,shiftHours:Number(saved?.shiftHours)||12};
}
function saveProductionTargets(){lineSet(PRODUCTION_TARGETS_KEY,JSON.stringify(state.productionTargets||{}));}
function runStats(run,now=Date.now()){
  if(!run)return {material:0,hours:0,rate:0,projected:0,targetTotal:0,difference:0};
  const start=new Date(run.startedAt).getTime();
  const end=run.endedAt?new Date(run.endedAt).getTime():now;
  const hours=Math.max(0,(end-start)/3600000);
  const material=Number(run.materialLbs)||0;
  const rate=hours>=0.25?material/hours:0; // wait 15 min before projecting to avoid unstable early-shift numbers
  const target=productionTargetFor(run.product);
  const targetTotal=target.lbsPerHour*target.shiftHours;
  const projected=rate*target.shiftHours;
  return {material,hours,rate,projected,targetTotal,difference:projected-targetTotal,target};
}
function currentProductionRun(){return state.activeShift?.runs?.find(r=>r.id===state.activeShift.runId)||null;}
function formatHours(hours){
  if(!Number.isFinite(hours)||hours<=0)return '0m';
  const h=Math.floor(hours),m=Math.round((hours-h)*60);
  return h?`${h}h ${m}m`:`${m}m`;
}
function allTodayRuns(){
  const today=new Date().toDateString();
  const shifts=[...(state.shiftArchive||[]),...(state.activeShift?[state.activeShift]:[])];
  return shifts.filter(s=>new Date(s.startedAt).toDateString()===today).flatMap(s=>(s.runs||[]).map(r=>({...r,shiftId:s.id,shiftStartedAt:s.startedAt,shiftEndedAt:s.endedAt||null})));
}
function renderProductionDashboard(){
  const active=!!state.activeShift,run=currentProductionRun();
  const stats=runStats(run);
  $('prod-current-label').textContent=productionCopy('current');
  $('prod-total-label').textContent=productionCopy('material');
  $('prod-project-label').textContent=productionCopy('projected');
  $('prod-target-label').textContent=productionCopy('target');
  $('production-target').querySelector('strong').textContent=productionCopy('targetButton');
  $('prod-current-rate').textContent=active&&stats.rate?fmt(stats.rate,0):'—';
  $('prod-current-material').textContent=active&&stats.target?.lbsPerHour?fmt(stats.target.lbsPerHour,0):'—';
  if($('prod-produced-material'))$('prod-produced-material').textContent=active?fmt(stats.material,0):'0';
  $('prod-projected-end').textContent=active&&stats.rate?fmt(stats.projected,0):'—';
  $('prod-shift-target').textContent=active&&stats.targetTotal?fmt(stats.targetTotal,0):'—';
  renderProductionDetails(active,run,stats);
  const forecast=$('production-forecast');
  forecast.className='production-forecast';
  if(!active){forecast.textContent=productionCopy('start');return;}
  if(!stats.material||stats.hours<0.25){forecast.textContent=productionCopy('waiting');return;}
  if(!stats.targetTotal){forecast.textContent=state.language==='es'?'Guarda un target lbs/hour para este producto.':'Save a target lbs/hour for this product.';return;}
  const diff=Math.round(Math.abs(stats.difference));
  if(diff<=50){forecast.textContent=productionCopy('on');forecast.classList.add('on');}
  else if(stats.difference>0){forecast.textContent=productionCopy('above').replace('{diff}',diff.toLocaleString());forecast.classList.add('above');}
  else{forecast.textContent=productionCopy('below').replace('{diff}',diff.toLocaleString());forecast.classList.add('below');}
}

function productionForecastText(active,stats){
  if(!active) return {text:productionCopy('start'),level:''};
  if(!stats.material||stats.hours<0.25) return {text:productionCopy('waiting'),level:''};
  if(!stats.targetTotal) return {text:state.language==='es'?'Guarda un target lbs/hour para este producto.':'Save a target lbs/hour for this product.',level:''};
  const diff=Math.round(Math.abs(stats.difference));
  if(diff<=50) return {text:productionCopy('on'),level:'on'};
  if(stats.difference>0) return {text:productionCopy('above').replace('{diff}',diff.toLocaleString()),level:'above'};
  return {text:productionCopy('below').replace('{diff}',diff.toLocaleString()),level:'below'};
}
function renderProductionDetails(active,run,stats){
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
  set('detail-current-rate',active&&stats.rate?fmt(stats.rate,0):'—');
  set('detail-target-rate',active&&stats.target?.lbsPerHour?fmt(stats.target.lbsPerHour,0):'—');
  set('detail-produced',active?fmt(stats.material,0):'0');
  set('detail-projected',active&&stats.rate?fmt(stats.projected,0):'—');
  set('detail-shift-target',active&&stats.targetTotal?fmt(stats.targetTotal,0):'—');
  const forecast=productionForecastText(active,stats);
  const box=$('detail-production-forecast');
  if(box){box.textContent=forecast.text;box.className='production-detail-forecast'+(forecast.level?' '+forecast.level:'');}
  renderProductionTrendChart(run,stats);
}
function productionRateSamples(run){
  if(!run||!Array.isArray(run.samples)||!run.samples.length)return [];
  const start=new Date(run.startedAt).getTime();
  return run.samples.map((sample,index)=>{
    const elapsed=(new Date(sample.time).getTime()-start)/3600000;
    const cumulative=Number(sample.cumulative)||0;
    return {index:index+1,rate:elapsed>0?cumulative/elapsed:0};
  }).filter(item=>Number.isFinite(item.rate)&&item.rate>0);
}
function renderProductionTrendChart(run,stats){
  const line=$('production-chart-line'),dots=$('production-chart-dots'),empty=$('production-chart-empty');
  if(!line||!dots||!empty)return;
  const samples=productionRateSamples(run),target=Number(stats?.target?.lbsPerHour)||0;
  if($('production-trend-points'))$('production-trend-points').textContent=`${samples.length} cut${samples.length===1?'':'s'}`;
  if(!samples.length){
    line.setAttribute('points','');dots.innerHTML='';empty.classList.remove('hidden');
    if($('production-chart-target-label'))$('production-chart-target-label').textContent=target?`Target ${fmt(target,0)}`:'Target —';
    return;
  }
  empty.classList.add('hidden');
  const values=samples.map(s=>s.rate).concat(target?[target]:[]);
  const max=Math.max(...values,1),min=Math.min(...values,0),pad=Math.max(50,(max-min)*0.16);
  const low=Math.max(0,min-pad),high=max+pad,x0=34,x1=582,y0=20,y1=162;
  const xFor=i=>samples.length===1?(x0+x1)/2:x0+(i/(samples.length-1))*(x1-x0);
  const yFor=value=>y1-((value-low)/(high-low||1))*(y1-y0);
  line.setAttribute('points',samples.map((s,i)=>`${xFor(i).toFixed(1)},${yFor(s.rate).toFixed(1)}`).join(' '));
  dots.innerHTML=samples.map((s,i)=>`<circle class="production-chart-dot" cx="${xFor(i).toFixed(1)}" cy="${yFor(s.rate).toFixed(1)}" r="4"><title>Cut ${s.index}: ${fmt(s.rate,0)} lbs/hr</title></circle>`).join('');
  const targetLine=$('production-chart-target');
  if(targetLine){const ty=target?yFor(target):y1;targetLine.setAttribute('y1',ty);targetLine.setAttribute('y2',ty);targetLine.classList.toggle('hidden',!target);}
  if($('production-chart-high'))$('production-chart-high').textContent=fmt(high,0);
  if($('production-chart-low'))$('production-chart-low').textContent=fmt(low,0);
  if($('production-chart-target-label')){
    $('production-chart-target-label').textContent=target?`Target ${fmt(target,0)}`:'Target —';
    $('production-chart-target-label').setAttribute('y',String(Math.max(24,(target?yFor(target):95)-6)));
  }
}

function renderProductionHistory(){
  const currentProduct=state.activeShift?.product||state.product||'';
  const target=productionTargetFor(currentProduct);
  $('target-lbs-hour').value=target.lbsPerHour||'';
  $('target-shift-hours').value=target.shiftHours||12;
  updateProductionTargetPreview();
  $('target-hour-label').textContent=productionCopy('hour');$('shift-hours-label').textContent=productionCopy('hours');$('target-total-label').textContent=productionCopy('total');$('save-production-target').textContent=productionCopy('save');$('product-history-title').textContent=productionCopy('history');
  const rawRuns=allTodayRuns();
  const grouped=new Map();
  rawRuns.forEach(run=>{
    const key=normalizeProduct(run.product||'UNSPECIFIED');
    if(!grouped.has(key))grouped.set(key,{...run,product:key,segments:[],materialLbs:0,samples:[],startedAt:run.startedAt,endedAt:run.endedAt});
    const g=grouped.get(key);g.segments.push(run);g.materialLbs+=Number(run.materialLbs)||0;g.samples.push(...(run.samples||[]));
    if(new Date(run.startedAt)<new Date(g.startedAt))g.startedAt=run.startedAt;
    if(!run.endedAt)g.endedAt=null; else if(g.endedAt&&new Date(run.endedAt)>new Date(g.endedAt))g.endedAt=run.endedAt;
  });
  const runs=[...grouped.values()];
  const box=$('product-run-history');
  if(!runs.length){box.innerHTML=`<p class="empty">${productionCopy('none')}</p>`;$('product-history-summary').textContent='';return;}
  let totalMaterial=0,totalHours=0;
  box.innerHTML=runs.map(run=>{
    const s=runStats(run); totalMaterial+=s.material; totalHours+=s.hours;
    const status=run.endedAt?productionCopy('complete'):productionCopy('active');
    return `<article class="product-run-card ${run.endedAt?'complete':'active'}"><div class="product-run-title"><strong>${escapeHTML(run.product||'—')}</strong><span>${status}</span></div><div class="product-run-grid"><div><small>${productionCopy('duration')}</small><b>${formatHours(s.hours)}</b></div><div><small>${productionCopy('used')}</small><b>${fmt(s.material,0)} lbs</b></div><div><small>${productionCopy('avg')}</small><b>${s.rate?fmt(s.rate,0):'—'} lbs/hr</b></div><div><small>${productionCopy('target')}</small><b>${s.target.lbsPerHour?fmt(s.target.lbsPerHour,0):'—'} lbs/hr</b></div></div></article>`;
  }).join('');
  $('product-history-summary').textContent=`${fmt(totalMaterial,0)} lbs • ${productionCopy('shiftAvg')}: ${totalHours?fmt(totalMaterial/totalHours,0):'—'} lbs/hr`;
}
function updateProductionTargetPreview(){
  const perHour=Number($('target-lbs-hour')?.value)||0,hours=Number($('target-shift-hours')?.value)||12;
  $('target-shift-total').textContent=perHour?fmt(perHour*hours,0):'—';
}
function openProductionDialog(){renderProductionDashboard();renderProductionHistory();$('production-dialog').classList.remove('hidden');$('production-dialog').setAttribute('aria-hidden','false');}
function closeProductionDialog(){$('production-dialog').classList.add('hidden');$('production-dialog').setAttribute('aria-hidden','true');}
function saveCurrentProductionTarget(){
  const product=normalizeProduct(state.activeShift?.product||$('bw-product')?.value||state.product||'');
  const lbsPerHour=Number($('target-lbs-hour').value),shiftHours=Number($('target-shift-hours').value);
  if(!product)return showToast(shiftText('needProduct'));
  if(!positive(lbsPerHour,shiftHours))return showToast(t('invalidNumbers'));
  state.productionTargets[product]={lbsPerHour,shiftHours,updatedAt:new Date().toISOString()};saveProductionTargets();renderProductionDashboard();renderProductionHistory();showToast(state.language==='es'?'Target guardado.':'Target saved.');
}
function recordProductionMaterial(weight1,weight2){
  if(!state.activeShift)return;
  const run=currentProductionRun();if(!run)return;
  const added=(Number(weight1)||0)+(Number(weight2)||0);if(added<=0)return;
  run.materialLbs=(Number(run.materialLbs)||0)+added;
  run.cutCount=(Number(run.cutCount)||0)+1;
  run.lastMaterialAt=new Date().toISOString();
  run.samples=Array.isArray(run.samples)?run.samples:[];
  run.samples.push({time:run.lastMaterialAt,lbs:added,cumulative:run.materialLbs});
  run.samples=run.samples.slice(-200);
  state.activeShift.materialLbs=(Number(state.activeShift.materialLbs)||0)+added;
  saveShift();renderProductionDashboard();
}

const SESSION_KEY='viejitoSessionV50';
function shiftText(key,vars={}){
  const text={
    en:{inactive:'No active shift',inactiveMeta:'Start a shift to separate products and predictions.',active:'Shift active',start:'Start shift',change:'Changeover',end:'End of shift',productPrompt:'Product running now:',targetPrompt:'Target BW:',swrapPrompt:'Current S-Wrap:',started:'Shift started on Line {extruder} for {product}.',changed:'Product changed to {product}. Same shift, new prediction run.',ended:'Shift ended. Learning was saved.',needProduct:'Enter a product first.',confirmChange:'Product changed from {old} to {next}. Start a new product run in the same shift?',pendingDiscard:'A winder is pending. Changing product will clear that incomplete cut. Continue?'},
    es:{inactive:'Sin turno activo',inactiveMeta:'Empieza el turno para separar productos y predicciones.',active:'Turno activo',start:'Empezar turno',change:'Cambio de producto',end:'Fin de turno',productPrompt:'Producto que estás corriendo:',targetPrompt:'Target BW:',swrapPrompt:'S-Wrap actual:',started:'Turno iniciado en Línea {extruder} para {product}.',changed:'Producto cambiado a {product}. Mismo turno, nueva corrida y predicción.',ended:'Turno finalizado. El aprendizaje quedó guardado.',needProduct:'Escribe el producto primero.',confirmChange:'Cambiaste de {old} a {next}. ¿Iniciar una nueva corrida dentro del mismo turno?',pendingDiscard:'Hay un winder pendiente. Cambiar producto borrará ese corte incompleto. ¿Continuar?'},
    fr:{inactive:'Aucun quart actif',inactiveMeta:'Démarrez un quart pour séparer les produits et les prévisions.',active:'Quart actif',start:'Démarrer le quart',change:'Changement de produit',end:'Fin du quart',productPrompt:'Produit en cours :',targetPrompt:'BW cible :',swrapPrompt:'S-Wrap actuel :',started:'Quart démarré sur Ligne {extruder} pour {product}.',changed:'Produit changé pour {product}. Même quart, nouvelle série de prévisions.',ended:'Quart terminé. L’apprentissage a été enregistré.',needProduct:'Entrez d’abord un produit.',confirmChange:'Produit changé de {old} à {next}. Démarrer une nouvelle série dans le même quart ?',pendingDiscard:'Un winder est en attente. Changer de produit effacera cette coupe incomplète. Continuer ?'}
  };
  let value=(text[state.language]||text.en)[key]||key;
  Object.entries(vars).forEach(([k,v])=>value=value.replaceAll(`{${k}}`,v));
  return value;
}
function newId(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}
function saveShift(){
  if(state.activeShift)lineSet(SHIFT_KEY,JSON.stringify(state.activeShift));
  else lineRemove(SHIFT_KEY);
  lineSet(SHIFT_ARCHIVE_KEY,JSON.stringify((state.shiftArchive||[]).slice(-100)));
}

function closeExpiredShiftForSchedule(){
  if(!state.activeShift)return false;
  const current=scheduledShiftInfo();if(!current)return false;
  if(!state.activeShift.shiftCode){
    const inferred=scheduledShiftInfo(new Date(state.activeShift.startedAt||Date.now()));
    if(inferred){state.activeShift.shiftCode=inferred.code;state.activeShift.shiftType=inferred.type;state.activeShift.shiftWorkDate=inferred.workDate;state.activeShift.scheduledStart=inferred.start;state.activeShift.scheduledEnd=inferred.end;saveShift();}
  }
  if(String(state.activeShift.shiftCode||'')===String(current.code||'')&&String(state.activeShift.shiftWorkDate||'')===String(current.workDate||''))return false;
  finalizeRecommendationOpportunity('not_used','shift_boundary');
  recordQualityEvent('shift_boundary_closed',{previousShiftCode:state.activeShift.shiftCode,nextShiftCode:current.code,product:state.activeShift.product,operator:state.activeShift.operator});
  const currentRun=state.activeShift.runs?.find(r=>r.id===state.activeShift.runId);if(currentRun&&!currentRun.endedAt)currentRun.endedAt=new Date().toISOString();
  state.shiftArchive.push({...state.activeShift,endedAt:new Date().toISOString(),autoClosedBySchedule:true,cuts:state.bwTrendHistory.filter(x=>x.shiftId===state.activeShift.id).length});
  state.activeShift=null;clearPendingCutForRun();saveShift();saveSession();
  return true;
}
function hasActiveScheduledShift(){closeExpiredShiftForSchedule();return !!state.activeShift;}
function requireActiveShift({openStart=false}={}){
  if(hasActiveScheduledShift())return true;
  const sched=scheduledShiftInfo();
  showToast(state.language==='es'?`Debes empezar el Turno ${sched?.code||''} antes de usar cálculos de producción.`:`Start ${sched?.code||'the scheduled'} Shift before using production calculations.`);
  if(openStart)startShift();
  return false;
}

function activeShiftChatGate(){
  if(hasActiveScheduledShift())return null;
  const sched=scheduledShiftInfo();
  return {kind:'info',title:chatLang('START SHIFT REQUIRED','DEBES EMPEZAR EL TURNO','QUART REQUIS'),message:chatLang(`Production calculations are locked until ${sched?.code||'the scheduled'} Shift is started. Say “start Line ${ACTIVE_LINE}”.`,`Los cálculos de producción están bloqueados hasta empezar el Turno ${sched?.code||'programado'}. Dime “empezar línea ${ACTIVE_LINE}”.`,`Démarrez le quart programmé.`)};
}
function renderShiftPanel(){
  closeExpiredShiftForSchedule();
  renderOperatorGreeting();
  renderLastWinderBW();
  if($('active-line-label'))$('active-line-label').textContent=`LINE ${ACTIVE_LINE}`;
  const panel=$('shift-control-panel'),active=!!state.activeShift;
  panel?.classList.toggle('active',active);
  $('running-swrap')?.classList.toggle('running',active);
  $('running-swrap')?.classList.toggle('stopped',!active);
  $('shift-status-title').innerHTML=active?`<span class="shift-title-prefix">${shiftText('active')}</span><span class="shift-title-line">LINE ${ACTIVE_LINE}</span><span class="shift-title-date">${state.activeShift.name||'—'}</span>`:shiftText('inactive');
  const sched=scheduledShiftInfo();
  $('shift-status-meta').textContent=active?`${state.activeShift.shiftCode||sched?.code||'—'} Shift • ${state.activeShift.product} • Target ${fmt(targetFromProduct(state.activeShift.product)||state.targetBW)} • S-Wrap ${fmt(state.currentSWrap,1)}`:`${shiftText('inactiveMeta')} ${sched?`Scheduled now: ${sched.code} Shift.`:''}`;
  const shiftButton=$('start-shift');
  if(shiftButton){
    shiftButton.querySelector('strong').textContent=active?shiftText('end'):shiftText('start');
    const icon=shiftButton.querySelector('span'); if(icon)icon.textContent=active?'■':'▶';
    shiftButton.classList.toggle('start',!active);
    shiftButton.classList.toggle('end',active);
    shiftButton.disabled=false;
  }
  $('change-product').querySelector('strong').textContent=shiftText('change');
  $('change-product').disabled=!active;
  if($('end-shift'))$('end-shift').disabled=!active;
  if($('change-line-button'))$('change-line-button').textContent=scopy('changeLine');
  if($('settings-open')?.querySelector('strong'))$('settings-open').querySelector('strong').textContent=scopy('settings');
  renderProductionDashboard();
}
function clearPendingCutForRun(){
  pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null};
  renderPendingCut();
}
function commitStartShift(product,extruder=selectedExtruder,dialogSWrap=null,shiftLanguage=null,operatorName=null){
  const sched=scheduledShiftInfo();
  if(!sched)return showToast(state.language==='es'?'No pude determinar el turno programado. Revisa la fecha y hora del dispositivo.':'Unable to determine the scheduled shift. Check the device date and time.');
  const name=`${sched.code} Shift • ${sched.workDate}`;
  product=normalizeProduct(product);
  if(!product)return showToast(shiftText('needProduct'));
  const operatorCheck=validateOperatorName(operatorName||$('product-operator')?.value||state.operator||'');
  if(!operatorCheck.ok){showToast(state.language==='es'?'Ingresa un nombre de operador válido.':state.language==='fr'?"Saisissez un nom d’opérateur valide.":'Please enter a valid operator name.');return false;}
  const operator=operatorCheck.name;
  shiftLanguage=String(shiftLanguage||$('product-language')?.value||state.language||'en').trim();
  if(!['en','es'].includes(shiftLanguage))shiftLanguage='en';
  if(state.language!==shiftLanguage)applyLanguage(shiftLanguage,false);
  state.operator=operator;
  lineSet(OPERATOR_KEY,operator);
  lineSet('viejitoLanguage',shiftLanguage);
  applyAutomaticMandrelForProduct(product,{forceDefault:true});
  const target=syncTargetFromProduct(product);
  const requestedSWrap=Number(dialogSWrap ?? $('bw-current-swrap').value ?? state.currentSWrap);
  if(!positive(target,requestedSWrap)){showToast(t('invalidNumbers'));return false;}
  const swrap=clampSWrap(requestedSWrap);
  if(requestedSWrap>MAX_SWRAP_SPEED)showToast(swrapLimitCopy());
  extruder=ACTIVE_LINE;
  const now=new Date().toISOString();
  state.activeShift={id:newId('shift'),name,operator,language:shiftLanguage,shiftCode:sched.code,shiftType:sched.type,shiftWorkDate:sched.workDate,scheduledStart:sched.start,scheduledEnd:sched.end,extruder,startedAt:now,product,currentSWrap:swrap,runId:newId('run'),runs:[{id:null,extruder,operator,language:shiftLanguage,shiftCode:sched.code,shiftType:sched.type,shiftWorkDate:sched.workDate,product,targetBW:target,swrap,startedAt:now,materialLbs:0,cutCount:0}]};
  state.activeShift.runs[0].id=state.activeShift.runId;
  $('bw-product').value=product; $('bw-target').value=String(target); $('bw-current-swrap').value=fmt(swrap,1);
  state.product=product; saveOptimizerSettings(target,swrap); clearPendingCutForRun(); saveShift(); saveSession();
  recordQualityEvent('shift_started',{shiftCode:sched.code,shiftWorkDate:sched.workDate,product,operator,initialSWrap:swrap,targetBW:target});
  renderShiftPanel(); renderTrendPanel(analyzeTrend()); renderLearningDashboard(); showToast(shiftText('started',{product,extruder})+` • ${sched.code} Shift`);
  closeProductDialog();
  return true;
}
function startShift(){ openProductDialog('start'); }
function commitProductChange(product,dialogSWrap=null){
  if(!state.activeShift)return commitStartShift(product,selectedExtruder,dialogSWrap);
  finalizeRecommendationOpportunity('not_used','changeover');
  if((Number.isFinite(pendingCut.winder1)||Number.isFinite(pendingCut.winder2))&&!confirm(shiftText('pendingDiscard')))return false;
  product=normalizeProduct(product);
  if(!product)return false;
  const old=state.activeShift.product;
  applyAutomaticMandrelForProduct(product,{forceDefault:true});
  const target=syncTargetFromProduct(product);
  if(!target)return showToast(shiftText('needProduct'));
  const beforeSWrap=Number(state.currentSWrap);
  const requestedSWrap=Number(dialogSWrap ?? $('bw-current-swrap').value ?? state.currentSWrap);
  if(!positive(requestedSWrap)) return showToast(t('invalidNumbers'));
  const swrap=clampSWrap(requestedSWrap);
  if(requestedSWrap>MAX_SWRAP_SPEED)showToast(swrapLimitCopy());
  $('bw-current-swrap').value=fmt(swrap,1); state.currentSWrap=swrap;
  recordSWrapChange(beforeSWrap,swrap,'changeover',{fromProduct:old,toProduct:product});
  if(product===old){$('bw-product').value=product;saveOptimizerSettings(target,swrap);renderShiftPanel();closeProductDialog();return true;}
  const currentRun=state.activeShift.runs.find(r=>r.id===state.activeShift.runId);if(currentRun)currentRun.endedAt=new Date().toISOString();
  const run={id:newId('run'),extruder:state.activeShift.extruder,operator:state.activeShift.operator,language:state.activeShift.language,shiftCode:state.activeShift.shiftCode,shiftType:state.activeShift.shiftType,shiftWorkDate:state.activeShift.shiftWorkDate,product,targetBW:target,swrap,startedAt:new Date().toISOString(),materialLbs:0,cutCount:0};
  state.activeShift.product=product;state.activeShift.runId=run.id;state.activeShift.runs.push(run);
  state.product=product;$('bw-product').value=product;$('bw-target').value=String(target);
  saveOptimizerSettings(target,swrap);
  clearPendingCutForRun();saveShift();saveSession();
  renderShiftPanel();renderTrendPanel(analyzeTrend());renderLearningDashboard();showToast(shiftText('changed',{product}));closeProductDialog();return true;
}
function changeProduct(nextProduct=null){
  if(nextProduct)return commitProductChange(nextProduct);
  if(!state.activeShift)return openProductDialog('start');
  openProductDialog('change');
}
function endShift(){
  if(!state.activeShift)return;
  finalizeRecommendationOpportunity('not_used','shift_end');
  recordQualityEvent('shift_ended',{shiftCode:state.activeShift.shiftCode,shiftWorkDate:state.activeShift.shiftWorkDate,product:state.activeShift.product,operator:state.activeShift.operator});
  const currentRun=state.activeShift.runs.find(r=>r.id===state.activeShift.runId);if(currentRun)currentRun.endedAt=new Date().toISOString();
  const completed={...state.activeShift,endedAt:new Date().toISOString(),cuts:state.bwTrendHistory.filter(x=>x.shiftId===state.activeShift.id).length};
  state.shiftArchive.push(completed);state.activeShift=null;clearPendingCutForRun();saveShift();saveSession();renderShiftPanel();renderTrendPanel(analyzeTrend());showToast(shiftText('ended'));
}

const SESSION_FIELDS=['bw-weight','bw-length','bw2-weight','bw2-length','bw-product','bw-target','bw-current-swrap','ft-bw','ft-weight','sw-current','sw-speed','sw-target'];
let pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null};
function safeJSON(value,fallback){try{return JSON.parse(value)||fallback;}catch{return fallback;}}
function saveSession(){
  const fields={}; SESSION_FIELDS.forEach(id=>{
    const el=$(id);if(!el)return;
    if(id==='bw-product'&&state.activeShift){fields[id]=state.activeShift.product||state.product||'';return;}
    fields[id]=el.value;
  });
  lineSet(SESSION_KEY,JSON.stringify({fields,pendingCut,mandrel:state.mandrel,updatedAt:Date.now()}));
}
function restoreSession(){
  const saved=safeJSON(lineGet(SESSION_KEY),{});
  Object.entries(saved.fields||{}).forEach(([id,value])=>{
    const el=$(id);if(!el||value===undefined)return;
    // The session draft is not allowed to overwrite the line's live S-Wrap source of truth.
    if(id==='bw-current-swrap')return;
    const safeValue=id==='sw-speed'&&positive(Number(value))?clampSWrap(value):value;
    el.value=safeValue;
  });
  if($('bw-current-swrap'))$('bw-current-swrap').value=fmt(state.currentSWrap,1);
  if(saved.pendingCut&&typeof saved.pendingCut==='object') pendingCut=saved.pendingCut;
  renderPendingCut();
}
function winderButtonText(index){
  const lang=state.language;
  if(lang==='es') return `Calcular Winder ${index}`;
  if(lang==='fr') return `Calculer Winder ${index}`;
  return `Calculate Winder ${index}`;
}
function completeCutText(){
  if(state.language==='es') return 'Completar corte / BW';
  if(state.language==='fr') return 'Terminer coupe / BW';
  return 'Complete cut / BW';
}
function waitingSecondMessage(){
  if(state.language==='es') return 'Winder guardado. Esperando el otro winder; todavía no se registra tendencia ni se da sugerencia.';
  if(state.language==='fr') return "Winder enregistré. En attente de l’autre winder; aucune tendance ni suggestion pour le moment.";
  return 'Winder saved. Waiting for the other winder; no trend or recommendation is recorded yet.';
}
function individualWinderStatus(value,index=1){
  if(!Number.isFinite(value)) return {level:'idle',label:'',difference:null};
  const target=Number($('bw-target')?.value||state.targetBW);
  if(!positive(target)) return {level:'idle',label:'',difference:null};
  const q=completedWinderQuality(index,value,target);
  return {level:q.level,label:q.status,difference:Math.abs(q.delta),delta:q.delta};
}
function completedWinderQuality(index,value,targetBW){
  const target=Number(targetBW),actual=Number(value);
  if(!Number.isFinite(actual)||!positive(target)) return {level:'idle',pass:null,delta:null,status:'—',detail:'—',side:''};
  const delta=actual-target,abs=Math.abs(delta);
  const level=abs<=0.17?'green':abs<0.25?'yellow':'red';
  const pass=level==='green';
  const side=index===1?'Winder 1 / Bottom Sheet':'Winder 2 / Top Sheet';
  let status='';
  if(level==='green')status=chatLang('PASS','PASA','CONFORME');
  else if(level==='yellow')status=delta>0
    ?chatLang('HEAVY — WARNING','PESADO — ADVERTENCIA','LOURD — AVERTISSEMENT')
    :chatLang('LIGHT — WARNING','LIGERO — ADVERTENCIA','LÉGER — AVERTISSEMENT');
  else status=delta>0
    ?chatLang('HEAVY — NOT PASS','PESADO — NO PASA','LOURD — NON CONFORME')
    :chatLang('LIGHT — NOT PASS','LIGERO — NO PASA','LÉGER — NON CONFORME');
  const detail=level==='green'
    ?chatLang(`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} • within ±0.17`,`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} • dentro de ±0.17`,`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} • dans ±0,17`)
    :chatLang(`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} vs target ${fmt(target,2)}`,`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} vs objetivo ${fmt(target,2)}`,`BW ${fmt(actual,3)} • Δ ${delta>=0?'+':''}${fmt(delta,3)} vs cible ${fmt(target,2)}`);
  return {level,pass,delta,status,detail,side};
}
function renderCompletedWinderQuality(cut=state.lastCompletedCut){
  const box=$('individual-winder-quality');
  if(box)box.classList.add('hidden');
}
function renderLineQualityStrip(cut=state.lastCompletedCut){
  const wrap=$('line-quality-strip'); if(!wrap)return;
  const target=Number(cut?.targetBW||state.targetBW),w1=Number(cut?.winder1),w2=Number(cut?.winder2);
  if(!Number.isFinite(w1)||!Number.isFinite(w2)||!positive(target)){wrap.classList.add('hidden');return;}
  const q1=completedWinderQuality(1,w1,target),q2=completedWinderQuality(2,w2,target),balance=analyzeDieBalance(w1,w2);
  const setCard=(base,{label,title,detail,level})=>{
    const el=$(base); if(!el)return;
    el.classList.remove('green','yellow','red');
    el.classList.add(level||'green');
    if($(base+'-label'))$(base+'-label').textContent=label;
    if($(base+'-title'))$(base+'-title').textContent=title;
    if($(base+'-detail'))$(base+'-detail').textContent=detail;
  };
  setCard('line-quality-w1',{
    label:chatLang('WINDER 1','WINDER 1','BOBINEUSE 1'),
    title:`BW ${fmt(w1,3)} • ${q1.status}`,
    detail:q1.level==='green'
      ?chatLang('Bottom Sheet within range', 'Bottom Sheet dentro de rango', 'Bottom Sheet dans la plage')
      :chatLang(`Δ ${q1.delta>=0?'+':''}${fmt(q1.delta,3)} vs target`, `Δ ${q1.delta>=0?'+':''}${fmt(q1.delta,3)} vs objetivo`, `Δ ${q1.delta>=0?'+':''}${fmt(q1.delta,3)} vs cible`),
    level:q1.level
  });
  setCard('line-quality-w2',{
    label:chatLang('WINDER 2','WINDER 2','BOBINEUSE 2'),
    title:`BW ${fmt(w2,3)} • ${q2.status}`,
    detail:q2.level==='green'
      ?chatLang('Top Sheet within range', 'Top Sheet dentro de rango', 'Top Sheet dans la plage')
      :chatLang(`Δ ${q2.delta>=0?'+':''}${fmt(q2.delta,3)} vs target`, `Δ ${q2.delta>=0?'+':''}${fmt(q2.delta,3)} vs objetivo`, `Δ ${q2.delta>=0?'+':''}${fmt(q2.delta,3)} vs cible`),
    level:q2.level
  });
  let balanceTitle='—',balanceDetail='—',balanceLevel='green';
  if(balance.level==='required'){
    balanceTitle=chatLang('DIE MOVE REQUIRED','DIE MOVE REQUERIDO','DIE MOVE REQUIS');
    balanceDetail=balance.heavier==='top'
      ?chatLang(`Top Sheet heavier by ${fmt(balance.difference,2)} BW`,`Top Sheet más pesado por ${fmt(balance.difference,2)} BW`,`Top Sheet plus lourd de ${fmt(balance.difference,2)} BW`)
      :chatLang(`Bottom Sheet heavier by ${fmt(balance.difference,2)} BW`,`Bottom Sheet más pesado por ${fmt(balance.difference,2)} BW`,`Bottom Sheet plus lourd de ${fmt(balance.difference,2)} BW`);
    balanceLevel='red';
  }else if(balance.level==='suggested'){
    balanceTitle=chatLang('DIE MOVE SUGGESTED','DIE MOVE SUGERIDO','DIE MOVE SUGGÉRÉ');
    balanceDetail=balance.heavier==='top'
      ?chatLang(`Top Sheet heavier by ${fmt(balance.difference,2)} BW`,`Top Sheet más pesado por ${fmt(balance.difference,2)} BW`,`Top Sheet plus lourd de ${fmt(balance.difference,2)} BW`)
      :chatLang(`Bottom Sheet heavier by ${fmt(balance.difference,2)} BW`,`Bottom Sheet más pesado por ${fmt(balance.difference,2)} BW`,`Bottom Sheet plus lourd de ${fmt(balance.difference,2)} BW`);
    balanceLevel='yellow';
  }else{
    balanceTitle=chatLang('NO DIE MOVE REQUIRED','NO REQUIERE DIE MOVE','PAS DE DIE MOVE REQUIS');
    balanceDetail=chatLang('Sheet balance within 0.25 BW','Balance de sheet dentro de 0.25 BW','Équilibre sheet dans 0.25 BW');
    balanceLevel='green';
  }
  setCard('line-quality-balance',{
    label:chatLang('SHEET BALANCE','BALANCE DE SHEET','ÉQUILIBRE SHEET'),
    title:balanceTitle,
    detail:balanceDetail,
    level:balanceLevel
  });
  wrap.classList.remove('hidden');
}
function renderTrendQualityCompact(cut=state.lastCompletedCut){
  const box=$('trend-quality-compact');if(box)box.classList.add('hidden');
}

function renderWinderSaved(index,value){
  const block=document.querySelector(index===1?'#bw-weight':'#bw2-weight')?.closest('.winder-block');
  const label=$(index===1?'winder1-required':'winder2-optional');
  const valueEl=$(index===1?'winder1-saved-bw':'winder2-saved-bw');
  const stateEl=$(index===1?'winder1-state':'winder2-state');
  const currentStatus=individualWinderStatus(value,index);
  const lastValue=Number(index===1?state.lastCompletedCut?.winder1:state.lastCompletedCut?.winder2);
  const lastStatus=individualWinderStatus(lastValue,index);
  block?.classList.remove('measured','green','yellow','red');
  if(Number.isFinite(value)) block?.classList.add('measured',currentStatus.level);
  else if(Number.isFinite(lastValue))block?.classList.add(lastStatus.level);
  label.textContent=Number.isFinite(value)?chatLang('Saved BW','BW guardado','BW enregistré'):t('required');
  valueEl.textContent=Number.isFinite(value)?fmt(value):'—';
  valueEl.classList.toggle('visible',Number.isFinite(value));
  stateEl.textContent=Number.isFinite(value)?currentStatus.label:'';
}
function renderPendingCut(){
  renderWinderSaved(1,pendingCut.winder1);
  renderWinderSaved(2,pendingCut.winder2);
  $('winder-results').classList.toggle('hidden',!(Number.isFinite(pendingCut.winder1)||Number.isFinite(pendingCut.winder2)));
  $('bw1-result').textContent=Number.isFinite(pendingCut.winder1)?fmt(pendingCut.winder1):'—';
  $('bw2-result').textContent=Number.isFinite(pendingCut.winder2)?fmt(pendingCut.winder2):'—';
}

function confirmWinderEntry(index,weight,length){
  const lang=state.language;
  if(weight<300||weight>1000){
    let suggestion=null;
    if(weight>=2000&&weight<3000){
      const candidate=weight-2000;if(candidate>=300&&candidate<=1000)suggestion=candidate;
    }
    const msg=suggestion
      ? (lang==='es'?`El peso ${fmt(weight,0)} lb está fuera del rango normal de 300–1000 lb. ¿Quisiste decir ${fmt(suggestion,0)} lb?\n\nOK = usar ${fmt(suggestion,0)} lb\nCancelar = regresar y corregir.`:`Weight ${fmt(weight,0)} lb is outside the normal 300–1000 lb range. Did you mean ${fmt(suggestion,0)} lb?\n\nOK = use ${fmt(suggestion,0)} lb\nCancel = go back and correct it.`)
      : (lang==='es'?`El peso ${fmt(weight,0)} lb está fuera del rango normal de 300–1000 lb. ¿Es correcto?\n\nOK = usarlo\nCancelar = corregirlo.`:`Weight ${fmt(weight,0)} lb is outside the normal 300–1000 lb range. Is it correct?\n\nOK = use it\nCancel = correct it.`);
    if(!confirm(msg))return null;
    if(suggestion){weight=suggestion;const joke=contextualSarcasm('typo');if(joke)setTimeout(()=>showToast(joke),150);}
  }
  if(length<1000||length>12000){
    const msg=lang==='es'?`La longitud ${fmt(length,0)} ft está fuera del rango normal de 1,000–12,000 ft. ¿Es correcta?\n\nOK = usarla y calcular\nCancelar = corregirla.`:`Length ${fmt(length,0)} ft is outside the normal 1,000–12,000 ft range. Is this correct?\n\nOK = use it and calculate\nCancel = correct it.`;
    if(!confirm(msg))return null;
  }
  return {weight,length};
}

function calculateSingleWinder(index){
  if(!requireActiveShift({openStart:true}))return false;
  let weight=Number($(index===1?'bw-weight':'bw2-weight').value);
  let length=Number($(index===1?'bw-length':'bw2-length').value);
  if(!positive(weight,length))return showToast(t('invalidNumbers'));
  const checked=confirmWinderEntry(index,weight,length); if(!checked)return;
  weight=checked.weight;length=checked.length;
  $(index===1?'bw-weight':'bw2-weight').value=String(weight);
  $(index===1?'bw-length':'bw2-length').value=String(length);
  const mandrel=currentMandrel('bw');
  const result=calculateBW(weight,length,mandrel);
  pendingCut[`winder${index}`]=result; pendingCut[`winder${index}Input`]={weight,length}; pendingCut.mandrel=mandrel;
  $('bw-result').textContent=fmt(result);
  $('bw-meta').textContent=`${t(index===1?'winder1':'winder2')} • ${mandrel}” • ${state.language==='es'?'resultado provisional':state.language==='fr'?'résultat provisoire':'provisional result'}`;
  $('optimizer-panel').classList.add('hidden');
  $('process-setpoint-panel')?.classList.add('hidden');
  renderPendingCut(); saveSession();
  const bothReady=Number.isFinite(pendingCut.winder1)&&Number.isFinite(pendingCut.winder2);
  showToast(bothReady
    ?chatLang('Both winders are saved. Press “Complete cut / BW” to calculate the average and S-Wrap guidance.','Los dos winders están guardados. Presiona “Completar corte / BW” para calcular el promedio y la recomendación de S-Wrap.','Les deux winders sont enregistrés. Terminez la coupe pour calculer la moyenne et le S-Wrap.')
    :waitingSecondMessage());
}

function analyzeDieBalance(w1,w2){
  const difference=Math.abs(Number(w2)-Number(w1));
  const heavier=Number(w2)>Number(w1)?'top':Number(w1)>Number(w2)?'bottom':'balanced';
  const level=difference>=1?'required':difference>=0.25?'suggested':'balanced';
  return {difference,heavier,level};
}
function dieMoveCopy(result){
  if(result.level==='balanced')return null;
  const required=result.level==='required';
  if(state.language==='es'){
    if(result.heavier==='top')return {title:required?'DIE MOVE OBLIGATORIO':'DIE MOVE SUGERIDO',message:`Winder 2 / Top Sheet está más pesado que Winder 1 / Bottom Sheet por ${fmt(result.difference,2)} BW. ${required?'El operador debe hacer un die move.':'Se recomienda hacer un die move.'} Cierra el top die bolt.`};
    return {title:required?'DIE MOVE OBLIGATORIO':'DIE MOVE SUGERIDO',message:`Winder 1 / Bottom Sheet está más pesado que Winder 2 / Top Sheet por ${fmt(result.difference,2)} BW. ${required?'El operador debe hacer un die move.':'Se recomienda hacer un die move.'} Sigue el ajuste estándar del lado bottom.`};
  }
  if(state.language==='fr'){
    if(result.heavier==='top')return {title:required?'DIE MOVE OBLIGATOIRE':'DIE MOVE SUGGÉRÉ',message:`Winder 2 / Top Sheet est plus lourd que Winder 1 / Bottom Sheet de ${fmt(result.difference,2)} BW. ${required?'L’opérateur doit effectuer un die move.':'Un die move est recommandé.'} Fermez le top die bolt.`};
    return {title:required?'DIE MOVE OBLIGATOIRE':'DIE MOVE SUGGÉRÉ',message:`Winder 1 / Bottom Sheet est plus lourd que Winder 2 / Top Sheet de ${fmt(result.difference,2)} BW. ${required?'L’opérateur doit effectuer un die move.':'Un die move est recommandé.'} Suivez le réglage standard côté bottom.`};
  }
  if(result.heavier==='top')return {title:required?'DIE MOVE REQUIRED':'DIE MOVE SUGGESTED',message:`Winder 2 / Top Sheet is heavier than Winder 1 / Bottom Sheet by ${fmt(result.difference,2)} BW. ${required?'Operator must make a die move.':'A die move is suggested.'} Close the top die bolt.`};
  return {title:required?'DIE MOVE REQUIRED':'DIE MOVE SUGGESTED',message:`Winder 1 / Bottom Sheet is heavier than Winder 2 / Top Sheet by ${fmt(result.difference,2)} BW. ${required?'Operator must make a die move.':'A die move is suggested.'} Follow the standard bottom-side die adjustment.`};
}
function renderDieMoveAlert(w1,w2){
  const box=$('die-move-alert'); if(!box)return;
  const result=analyzeDieBalance(w1,w2),copy=dieMoveCopy(result);
  box.classList.toggle('hidden',!copy); box.classList.toggle('required',result.level==='required'); box.classList.toggle('suggested',result.level==='suggested');
  if(copy){$('die-move-title').textContent=copy.title;$('die-move-message').textContent=copy.message;$('die-move-kicker').textContent=state.language==='es'?'BALANCE DE SHEET':state.language==='fr'?'ÉQUILIBRE DES SHEETS':'SHEET BALANCE';}
  return result;
}

function completeDualWinderCut(){
  if(!requireActiveShift({openStart:true}))return false;
  // If the previous actionable recommendation reached the next cut without Apply/Keep Current,
  // count it as a recommendation the operator did not use.
  finalizeRecommendationOpportunity('not_used','next_cut');
  if(!Number.isFinite(pendingCut.winder1)||!Number.isFinite(pendingCut.winder2)){
    throw new Error(state.language==='es'?'Calcula y guarda los dos winders antes de sacar el promedio.':state.language==='fr'?'Calculez et enregistrez les deux winders avant la moyenne.':'Calculate and save both winders before averaging.');
  }
  const target=Number($('bw-target').value),currentSWrap=Number($('bw-current-swrap').value);
  const average=(pendingCut.winder1+pendingCut.winder2)/2;
  const difference=Math.abs(pendingCut.winder1-pendingCut.winder2);
  const optimizer=optimizeBasisWeight(average,target,currentSWrap);
  optimizer.winder1=pendingCut.winder1; optimizer.winder2=pendingCut.winder2; optimizer.mandrel=pendingCut.mandrel; optimizer.product=currentProcessContext().product;
  const pair={winder1:pendingCut.winder1,winder2:pendingCut.winder2,average,hasWinder2:true,difference};
  const trend=recordBWForTrend(average,target,currentSWrap,pair);
  $('bw-result').textContent=fmt(average);
  $('bw-meta').textContent=`${pendingCut.mandrel||currentMandrel('bw')}” • ${t('averageBW')}`;
  $('winder-imbalance').textContent=`${t('imbalance')}: ${fmt(difference,2)}`;
  $('winder-imbalance').classList.toggle('warning',difference>=0.25);
  const dieBalance=analyzeDieBalance(pair.winder1,pair.winder2);
  renderLineQualityStrip({winder1:pair.winder1,winder2:pair.winder2,targetBW:target});
  renderOptimizerPanel(optimizer); renderTrendPanel(trend);
  addHistory('BW',`${t('winder1')} ${fmt(pair.winder1)} + ${t('winder2')} ${fmt(pair.winder2)} → Avg ${fmt(average)} • Target ${fmt(target)} • S-Wrap ${fmt(currentSWrap,1)} • ${optimizer.level.toUpperCase()} • ${pendingCut.mandrel||48}”`);
  const processContext=currentProcessContext();
  const cutDraft={averageBW:average,winder1:pair.winder1,winder2:pair.winder2,targetBW:target,currentSWrap,product:processContext.product,mandrel:pendingCut.mandrel||currentMandrel('bw'),extruder:processContext.extruder,shiftId:processContext.shiftId,runId:processContext.runId,shiftCode:state.activeShift?.shiftCode||scheduledShiftCode(),shiftWorkDate:state.activeShift?.shiftWorkDate||scheduledShiftInfo()?.workDate||'',operator:state.activeShift?.operator||state.operator||'',time:new Date().toISOString(),winder1Weight:Number(pendingCut.winder1Input?.weight)||null,winder2Weight:Number(pendingCut.winder2Input?.weight)||null,winder1Length:Number(pendingCut.winder1Input?.length)||null,winder2Length:Number(pendingCut.winder2Input?.length)||null};
  const linkedProcessRecord=bindProcessRecordToCompletedCut(cutDraft);
  state.lastCompletedCut={...cutDraft,processRecordId:linkedProcessRecord?.id||null};
  renderLastWinderBW();
  renderCompletedWinderQuality(state.lastCompletedCut);
  $('process-setpoint-panel')?.classList.add('hidden');
  // Last BW is operational line state and must persist even in Demo Mode.
  // Learning/production records remain disabled in Demo Mode below.
  lineSet(LAST_COMPLETED_CUT_KEY,JSON.stringify(state.lastCompletedCut));
  registerRecommendationOpportunity(optimizer,trend);
  postCutEscalationsPending=true;
  if(!demoMode()){
    const learnedPrediction=learnFromPendingRecommendation(average,pair,processContext);
    if(!learnedPrediction)state.learningEngine.addObservation({targetBW:target,appliedSWrap:currentSWrap,finalBW:average,...processContext,winder1:pair.winder1,winder2:pair.winder2});
    recordProductionMaterial(pendingCut.winder1Input?.weight,pendingCut.winder2Input?.weight);
  }
  renderLearningDashboard();
  refreshBrainInsightAfterCut();
  pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null}; saveSession(); renderPendingCut(); renderLastWinderBW(); renderLineQualityStrip(state.lastCompletedCut); renderTrendQualityCompact(state.lastCompletedCut);
  openPostCutRecommendationDecision(optimizer,trend);
}


function syncCurrentSWrap(value,{save=true}={}){
  const requested=Number(value);
  if(!positive(requested)) return false;
  const swrap=clampSWrap(requested);
  if($('bw-current-swrap'))$('bw-current-swrap').value=fmt(swrap,1);
  if(requested>MAX_SWRAP_SPEED) showToast(swrapLimitCopy());
  // Single source of truth for the line's LIVE S-Wrap.
  state.currentSWrap=swrap;
  if(state.activeShift){
    state.activeShift.currentSWrap=swrap;
    const run=state.activeShift.runs?.find(item=>item.id===state.activeShift.runId);
    if(run) run.swrap=swrap;
    if(save) saveShift();
  }
  if(save){ saveOptimizerSettings(Number($('bw-target').value||state.targetBW),swrap); saveSession(); }
  renderShiftPanel();
  renderOptimizationSWrapContext(state.latestOptimization);
  if(state.latestOptimization)renderRecommendationDecision(state.latestOptimization);
  renderTrendPanel(analyzeTrend(Number(state.targetBW)||DEFAULT_TARGET_BW,swrap));
  return true;
}
let dangerFlashTimer=null;
let dangerFlashInterval=null;
function runDangerFlash(result){
  const targets=[$('optimizer-panel'),$('result-status'),$('optimizer-suggested'),$('process-priority-summary')].filter(Boolean);
  if(dangerFlashTimer) clearTimeout(dangerFlashTimer);
  if(dangerFlashInterval) clearInterval(dangerFlashInterval);
  targets.forEach(el=>el.classList.remove('danger-flash','flash-on'));
  if(result.level!=='red'||!result.suggestAdjustment) return;
  let on=false;
  const toggle=()=>{on=!on;targets.forEach(el=>el.classList.toggle('flash-on',on));};
  targets.forEach(el=>el.classList.add('danger-flash'));
  toggle();
  dangerFlashInterval=setInterval(toggle,300);
  dangerFlashTimer=setTimeout(()=>{
    clearInterval(dangerFlashInterval); dangerFlashInterval=null;
    targets.forEach(el=>el.classList.remove('danger-flash','flash-on'));
  },5000);
}


const SETTINGS_DRAFT_KEY='viejitoSettingsDraftV1';
let settingsDraft=null;

const settingsCopy={
  en:{settings:'Settings',languageK:'LANGUAGE',language:'Application language',appearanceK:'APPEARANCE',appearance:'Display mode',personalityK:'CHAT PERSONALITY',personality:'Sarcasm',bwK:'BASIS WEIGHT',bw:'BW calculation factor',bwHelp:'450 matches the current plant system. 453.59237 uses the exact lb-to-gram conversion. BW and Feet use the selected factor automatically.',save:'Save Changes',saveNote:'Changes are applied only after Save Changes.',saved:'Settings saved.',changeLine:'Change line',demoK:'DEMO / TRAINING',demo:'Demo Mode — Do Not Learn',demoHelp:'Use fake values with a separate demo trend and report history. Demo data never enters real production history, real learning, or production totals.',learningK:'LEARNING DATA',learning:'Learning Data Manager',learningHelp:'Review recent learning records for this line and remove incorrect test data.',resetHelp:'Protected maintenance actions. Use only when you intentionally want to erase Adaptive Learning, Trend history, or Process Performance Learning for the selected line.'},
  es:{settings:'Ajustes',languageK:'IDIOMA',language:'Idioma de la aplicación',appearanceK:'APARIENCIA',appearance:'Modo de pantalla',personalityK:'PERSONALIDAD DEL CHAT',personality:'Sarcasmo',bwK:'BASIS WEIGHT',bw:'Factor de cálculo BW',bwHelp:'450 coincide con el sistema actual de la planta. 453.59237 usa la conversión exacta de libras a gramos. BW y Feet usan automáticamente el factor seleccionado.',save:'Guardar cambios',saveNote:'Los cambios se aplican solamente después de Guardar cambios.',saved:'Ajustes guardados.',changeLine:'Cambiar línea',demoK:'DEMO / ENTRENAMIENTO',demo:'Modo Demo — No aprender',demoHelp:'Usa valores falsos con historial de tendencia y reporte separado para Demo. Los datos Demo nunca entran al historial real, aprendizaje real ni totales de producción.',learningK:'DATOS DE APRENDIZAJE',learning:'Administrador de aprendizaje',learningHelp:'Revisa los registros recientes de esta línea y elimina datos de prueba incorrectos.',resetHelp:'Acciones de mantenimiento protegidas. Úsalas solo cuando realmente quieras borrar Adaptive Learning, el historial de tendencia o Process Performance Learning de la línea seleccionada.'},
  fr:{settings:'Réglages',languageK:'LANGUE',language:"Langue de l’application",appearanceK:'APPARENCE',appearance:"Mode d’affichage",personalityK:'PERSONNALITÉ DU CHAT',personality:'Sarcasme',bwK:'BASIS WEIGHT',bw:'Facteur de calcul BW',bwHelp:'450 correspond au système actuel de l’usine. 453.59237 utilise la conversion exacte livre-gramme. BW et Feet utilisent automatiquement le facteur sélectionné.',save:'Enregistrer',saveNote:'Les modifications sont appliquées uniquement après Enregistrer.',saved:'Réglages enregistrés.',changeLine:'Changer de ligne',demoK:'DÉMO / FORMATION',demo:'Mode Démo — Ne pas apprendre',demoHelp:'Utilisez des valeurs fictives sans les ajouter à l’historique, aux tendances, à l’apprentissage ou aux totaux de production.',learningK:'DONNÉES D’APPRENTISSAGE',learning:'Gestion des données d’apprentissage',learningHelp:'Consultez les données récentes de cette ligne et supprimez les données de test incorrectes.',resetHelp:'Actions de maintenance protégées. Utilisez-les uniquement pour effacer volontairement les données d’apprentissage de la ligne sélectionnée.'}
};
function scopy(key,lang=state.language){return (settingsCopy[lang]||settingsCopy.en)[key]||key;}

function readCurrentSettings(){
  return {
    language:state.language,
    theme:localStorage.getItem('viejitoTheme')==='light'?'light':'dark',
    personality:state.personality,
    bwFactor:Number(FACTOR_GRAMS_PER_LB)||450,
    demo:demoMode()?'on':'off'
  };
}
function renderSettingsDraft(){
  if(!settingsDraft)settingsDraft=readCurrentSettings();
  const lang=settingsDraft.language||state.language;
  if($('settings-dialog-title'))$('settings-dialog-title').textContent=scopy('settings',lang);
  if($('settings-language-kicker'))$('settings-language-kicker').textContent=scopy('languageK',lang);
  if($('settings-language-title'))$('settings-language-title').textContent=scopy('language',lang);
  if($('settings-appearance-kicker'))$('settings-appearance-kicker').textContent=scopy('appearanceK',lang);
  if($('settings-appearance-title'))$('settings-appearance-title').textContent=scopy('appearance',lang);
  if($('settings-personality-kicker'))$('settings-personality-kicker').textContent=scopy('personalityK',lang);
  if($('settings-personality-title'))$('settings-personality-title').textContent=scopy('personality',lang);
  if($('settings-bw-kicker'))$('settings-bw-kicker').textContent=scopy('bwK',lang);
  if($('settings-bw-title'))$('settings-bw-title').textContent=scopy('bw',lang);
  if($('settings-bw-help'))$('settings-bw-help').textContent=scopy('bwHelp',lang);
  if($('settings-save'))$('settings-save').textContent=scopy('save',lang);
  if($('settings-save-note'))$('settings-save-note').textContent=scopy('saveNote',lang);
  if($('settings-demo-kicker'))$('settings-demo-kicker').textContent=scopy('demoK',lang);
  if($('settings-demo-title'))$('settings-demo-title').textContent=scopy('demo',lang);
  if($('settings-demo-help'))$('settings-demo-help').textContent=scopy('demoHelp',lang);
  if($('settings-learning-kicker'))$('settings-learning-kicker').textContent=scopy('learningK',lang);
  if($('settings-learning-title'))$('settings-learning-title').textContent=scopy('learning',lang);
  if($('settings-learning-help'))$('settings-learning-help').textContent=scopy('learningHelp',lang);
  if($('settings-reset-help'))$('settings-reset-help').textContent=scopy('resetHelp',lang);
  document.querySelectorAll('[data-draft-demo]').forEach(b=>b.classList.toggle('selected',b.dataset.draftDemo===settingsDraft.demo));
  if($('settings-language-select'))$('settings-language-select').value=settingsDraft.language;
  document.querySelectorAll('[data-draft-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.draftTheme===settingsDraft.theme));
  document.querySelectorAll('[data-draft-personality]').forEach(b=>b.classList.toggle('selected',b.dataset.draftPersonality===settingsDraft.personality));
  document.querySelectorAll('[data-draft-bw-factor]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.draftBwFactor)===Number(settingsDraft.bwFactor)));
}
function actuallyOpenSettings(){
  settingsDraft=readCurrentSettings(); renderSettingsDraft();
  $('settings-dialog')?.classList.remove('hidden'); $('settings-dialog')?.setAttribute('aria-hidden','false');
}
function openSettings(){
  const hasPassword=!!localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
  $('settings-password-title').textContent=hasPassword?(state.language==='es'?'Ajustes protegidos':'Settings protected'):(state.language==='es'?'Crear contraseña de Ajustes':'Create Settings password');
  $('settings-password-help').textContent=hasPassword?(state.language==='es'?'Ingresa la contraseña para cambiar Ajustes.':'Enter the password to change Settings.'):(state.language==='es'?'Primera vez: crea una contraseña para proteger los cambios.':'First use: create a password to protect changes.');
  $('settings-password-confirm').textContent=hasPassword?(state.language==='es'?'Desbloquear Ajustes':'Unlock Settings'):(state.language==='es'?'Crear contraseña':'Create Password');
  $('settings-password-input').value='';
  $('settings-password-dialog').classList.remove('hidden'); $('settings-password-dialog').setAttribute('aria-hidden','false');
  setTimeout(()=>$('settings-password-input')?.focus(),80);
}
function confirmSettingsPassword(){
  const value=$('settings-password-input').value;
  if(String(value).length<4){showToast(state.language==='es'?'Usa por lo menos 4 caracteres.':'Use at least 4 characters.');return;}
  const saved=localStorage.getItem(ADMIN_PASSWORD_HASH_KEY),hash=hashAdminPassword(value);
  if(saved&&saved!==hash){showToast(state.language==='es'?'Contraseña incorrecta.':'Incorrect password.');return;}
  if(!saved)localStorage.setItem(ADMIN_PASSWORD_HASH_KEY,hash);
  $('settings-password-dialog').classList.add('hidden'); $('settings-password-dialog').setAttribute('aria-hidden','true');
  actuallyOpenSettings();
}
function closeSettings(){
  settingsDraft=null;
  $('settings-dialog')?.classList.add('hidden');
  $('settings-dialog')?.setAttribute('aria-hidden','true');
}
function saveSettingsDraft(){
  if(!settingsDraft)return;
  const language=VALID_LANGUAGES.includes(settingsDraft.language)?settingsDraft.language:DEFAULT_LANGUAGE;
  const personality=VALID_PERSONALITIES.includes(settingsDraft.personality)?settingsDraft.personality:DEFAULT_PERSONALITY;
  const theme=settingsDraft.theme==='light'?'light':'dark';
  const factor=[450,453.59237].includes(Number(settingsDraft.bwFactor))?Number(settingsDraft.bwFactor):450;
  lineSet('viejitoLanguage',language);
  localStorage.setItem('viejitoLanguage',language); // fallback for lines with no saved preference
  localStorage.setItem('viejitoPersonality',personality);
  localStorage.setItem('viejitoTheme',theme);
  localStorage.setItem(BW_FACTOR_KEY,String(factor));
  localStorage.setItem(DEMO_MODE_KEY,settingsDraft.demo==='on'?'on':'off');
  persistLineOperationalState();
  location.reload();
}


function openLearningManager(){
  const box=$('learning-manager-list'); const rows=[...(state.learningEngine.records||[])].slice(-80).reverse();
  if(!rows.length){box.innerHTML=`<p class="empty">${state.language==='es'?'No hay registros de aprendizaje para esta línea.':'No learning records for this line.'}</p>`;}
  else box.innerHTML=rows.map(r=>`<article class="learning-record"><div><strong>${escapeHTML(r.product||'—')} • BW ${fmt(r.finalBW,3)}</strong><small>${new Date(r.timestamp||Date.now()).toLocaleString()} • S-Wrap ${fmt(r.appliedSWrap,1)} • W1 ${r.winder1?fmt(r.winder1):'—'} / W2 ${r.winder2?fmt(r.winder2):'—'}</small></div><button type="button" data-delete-learning="${escapeHTML(r.id)}">${state.language==='es'?'Eliminar del aprendizaje':'Delete from learning'}</button></article>`).join('');
  box.querySelectorAll('[data-delete-learning]').forEach(btn=>btn.addEventListener('click',()=>deleteLearningRecord(btn.dataset.deleteLearning)));
  $('learning-manager-dialog').classList.remove('hidden'); $('learning-manager-dialog').setAttribute('aria-hidden','false');
}
function deleteLearningRecord(id){
  const row=(state.learningEngine.records||[]).find(r=>String(r.id)===String(id)); if(!row)return;
  const ok=confirm(state.language==='es'?`¿Eliminar ${row.product||''} BW ${fmt(row.finalBW,3)} del aprendizaje de Line ${ACTIVE_LINE}?`:`Delete ${row.product||''} BW ${fmt(row.finalBW,3)} from Line ${ACTIVE_LINE} learning?`);
  if(!ok)return;
  state.learningEngine.records=state.learningEngine.records.filter(r=>String(r.id)!==String(id)); state.learningEngine.save(); renderLearningDashboard(); openLearningManager();
}
function renderDemoModeBanner(){
  const b=$('demo-mode-banner'); if(!b)return; b.classList.toggle('hidden',!demoMode());
  b.textContent=state.language==='es'?'MODO DEMO — DATOS DEMO AISLADOS • PRODUCCIÓN Y APRENDIZAJE REAL DESACTIVADOS':state.language==='fr'?'MODE DÉMO — DONNÉES DÉMO ISOLÉES • PRODUCTION ET APPRENTISSAGE RÉELS DÉSACTIVÉS':'DEMO MODE — ISOLATED DEMO DATA • REAL PRODUCTION & LEARNING DISABLED';
}

function chatMemoryMode(){return 'separate';}
function saveChatMessage(role,content){
  const key=lineKey(CHAT_HISTORY_KEY);
  let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]');}catch(_){items=[];}
  items.push({role,content,time:new Date().toISOString()});
  localStorage.setItem(key,JSON.stringify(items.slice(-80)));
}
function restoreChatMessages(){
  let items=[];try{items=JSON.parse(localStorage.getItem(lineKey(CHAT_HISTORY_KEY))||'[]');}catch(_){return false;}
  if(!items.length)return false;
  $('chat-log').innerHTML='';items.forEach(item=>bubble(item.role,item.content));return true;
}

function persistLineOperationalState(){
  try{
    // Operational UI/session state must persist per line even in Demo Mode.
    // Demo Mode disables learning/production recording, not line isolation.
    if(state.activeShift){
      state.activeShift.product=state.product||state.activeShift.product;
      state.activeShift.currentSWrap=Number(state.currentSWrap)||state.activeShift.currentSWrap;
      const run=state.activeShift.runs?.find(r=>r.id===state.activeShift.runId);
      if(run){
        run.product=state.activeShift.product;
        run.targetBW=Number(state.targetBW)||run.targetBW;
        run.swrap=Number(state.currentSWrap)||run.swrap;
      }
    }
    lineSet('viejitoTargetBW',String(Number(state.targetBW)||DEFAULT_TARGET_BW));
    lineSet('viejitoCurrentSWrap',String(Number(state.currentSWrap)||DEFAULT_CURRENT_SWRAP));
    lineSet('viejitoProduct',String(state.product||state.activeShift?.product||''));
    if(state.operator)lineSet(OPERATOR_KEY,state.operator);
    saveShift();
    saveSession();
    return true;
  }catch(error){
    console.error('Unable to persist line state',error);
    return false;
  }
}

function updateLineSelector(){
  document.querySelectorAll('[data-line-quick]').forEach(button=>{
    const active=Number(button.dataset.lineQuick)===ACTIVE_LINE;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}
function hydrateLineState(){
  const savedLanguage=lineGet('viejitoLanguage',DEFAULT_LANGUAGE);
  state.language=VALID_LANGUAGES.includes(savedLanguage)?savedLanguage:DEFAULT_LANGUAGE;
  state.operator=lineGet(OPERATOR_KEY,'')||'';
  state.mandrel=Number(lineGet('viejitoMandrel'))||DEFAULT_MANDREL;
  if(!VALID_MANDRELS.includes(state.mandrel))state.mandrel=DEFAULT_MANDREL;
  state.context=safeJSON(lineGet('viejitoContext','{}'),{});
  state.history=safeJSON(lineGet('viejitoHistory','[]'),[]);
  state.targetBW=Number(lineGet('viejitoTargetBW'))||DEFAULT_TARGET_BW;
  state.currentSWrap=clampSWrap(Number(lineGet('viejitoCurrentSWrap'))||DEFAULT_CURRENT_SWRAP);
  state.product=lineGet('viejitoProduct','')||'';
  state.activeShift=safeJSON(lineGet(SHIFT_KEY,'null'),null);
  state.shiftArchive=safeJSON(lineGet(SHIFT_ARCHIVE_KEY,'[]'),[]);
  state.productionTargets=safeJSON(lineGet('viejitoProductionTargetsV1','{}'),{});
  state.latestOptimization=null;
  state.bwTrendHistory=safeJSON(lineGet(activeTrendHistoryKey(),'[]'),[]);
  state.latestTrend=null;
  state.lastCompletedCut=safeJSON(lineGet(LAST_COMPLETED_CUT_KEY,'null'),null);
  state.selectedLine=ACTIVE_LINE;
  state.learningEngine=new AdaptiveLearningEngine(window.localStorage,lineKey('viejitoMachineLearningV3'));
  state.processLearning=new ProcessPerformanceLearning(window.localStorage,lineKey(PROCESS_PERFORMANCE_KEY));
  chatWorkflow=safeJSON(lineGet(CHAT_WORKFLOW_KEY,'null'),null);
  pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null};
}
function operatorFirstName(){
  const full=String(state.activeShift?.operator||state.operator||'').trim();
  return full?full.split(/\s+/)[0]:'';
}
function renderOperatorGreeting(){
  const el=$('operator-greeting'); if(!el)return;
  const first=operatorFirstName();
  if(!first){el.textContent='';el.classList.add('hidden');return;}
  el.textContent=state.language==='es'?`Hola ${first}`:state.language==='fr'?`Bonjour ${first}`:`Hello ${first}`;
  el.classList.remove('hidden');
}
function renderLastWinderBW(){
  const last=state.lastCompletedCut||null;
  const target=Number(last?.targetBW||state.targetBW),w1=Number(last?.winder1),w2=Number(last?.winder2);
  [[1,w1],[2,w2]].forEach(([index,value])=>{
    const el=$(`winder${index}-last-bw`);
    const block=document.querySelector(index===1?'#bw-weight':'#bw2-weight')?.closest('.winder-block');
    if(!Number.isFinite(value)||!positive(target)){
      if(el)el.textContent='BW —';
      if(!Number.isFinite(index===1?pendingCut?.winder1:pendingCut?.winder2))block?.classList.remove('green','yellow','red');
      return;
    }
    const q=completedWinderQuality(index,value,target);
    if(el){el.textContent=`BW ${fmt(value,3)} • ${q.status}`;el.classList.remove('green','yellow','red');el.classList.add(q.level);}
    const hasPending=Number.isFinite(index===1?pendingCut?.winder1:pendingCut?.winder2);
    if(block&&!hasPending){block.classList.remove('green','yellow','red');block.classList.add(q.level);}
  });
}

// Keep every visible BW/result/recommendation panel synchronized with the selected line.
// Previously only the inputs and Last BW changed; the red/green result cards could keep
// the previous line's target/S-Wrap recommendation on screen.
function renderSelectedLineResult(){
  const last=state.lastCompletedCut||null;
  const avg=Number(last?.averageBW);
  const resultBox=$('bw-result-box');
  const optimizerPanel=$('optimizer-panel');
  const priority=$('process-priority-summary');
  const statusBox=$('result-status');

  if(!Number.isFinite(avg)||avg<=0){
    state.latestOptimization=null;
    if($('bw-result')){ $('bw-result').textContent='—'; delete $('bw-result').dataset.averageBw; delete $('bw-result').dataset.value; }
    if($('bw-meta'))$('bw-meta').textContent='';
    if(resultBox){ resultBox.classList.remove('green','yellow','red'); }
    if(optimizerPanel){ optimizerPanel.classList.add('hidden'); optimizerPanel.classList.remove('green','yellow','red'); }
    if(priority){ priority.classList.add('hidden'); priority.classList.remove('green','yellow','red'); }
    $('process-setpoint-panel')?.classList.add('hidden');
    if(statusBox){
      statusBox.classList.remove('green','yellow','red','status-pop');
      statusBox.classList.add('idle');
      if($('result-status-title'))$('result-status-title').textContent='';
      if($('result-status-message'))$('result-status-message').textContent='';
    }
    $('individual-winder-quality')?.classList.add('hidden');
    $('die-move-alert')?.classList.add('hidden');
    $('line-quality-strip')?.classList.add('hidden');
    return;
  }

  const product=state.activeShift?.product||state.product||last.product||'';
  const target=Number(last.targetBW)||Number(targetFromProduct(product))||Number(state.targetBW)||DEFAULT_TARGET_BW;
  const swrap=Number(last.currentSWrap)||Number(state.currentSWrap)||DEFAULT_CURRENT_SWRAP;
  const mandrel=Number(last.mandrel)||Number(state.mandrel)||DEFAULT_MANDREL;
  const result=optimizeBasisWeight(avg,target,swrap,{persist:false});

  if($('bw-result')){
    $('bw-result').textContent=fmt(avg);
    $('bw-result').dataset.averageBw=String(avg);
    $('bw-result').dataset.value=String(avg);
  }
  if($('bw-meta'))$('bw-meta').textContent=`${mandrel}” • ${t('averageBW')}`;
  renderOptimizerPanel(result);
  renderCompletedWinderQuality(last);
  if(Number.isFinite(Number(last.winder1))&&Number.isFinite(Number(last.winder2)))renderDieMoveAlert(Number(last.winder1),Number(last.winder2));
  else $('die-move-alert')?.classList.add('hidden');
  $('process-setpoint-panel')?.classList.add('hidden');
}

function renderSelectedLineState(){
  SESSION_FIELDS.forEach(id=>{const el=$(id);if(el)el.value='';});
  selectMandrel('bw',state.mandrel);
  selectMandrel('ft',state.mandrel);
  $('bw-target').value=fmt(state.targetBW);
  $('bw-current-swrap').value=fmt(state.currentSWrap,1);
  $('bw-product').value=state.product;
  restoreSession();
  if(state.activeShift?.product){
    state.product=state.activeShift.product;
    const activeRun=state.activeShift.runs?.find(r=>r.id===state.activeShift.runId);
    const restoredSWrap=Number(state.activeShift.currentSWrap||activeRun?.swrap||state.currentSWrap);
    const restoredTarget=Number(activeRun?.targetBW||targetFromProduct(state.activeShift.product)||state.targetBW);
    if(positive(restoredSWrap))state.currentSWrap=clampSWrap(restoredSWrap);
    if(positive(restoredTarget))state.targetBW=restoredTarget;
    applyAutomaticMandrelForProduct(state.product,{forceDefault:false});
    $('bw-product').value=state.product;
    $('bw-target').value=fmt(state.targetBW);
    $('bw-current-swrap').value=fmt(state.currentSWrap,1);
  }
  updateLineSelector();
  applyLanguage(state.language);
  renderOperatorGreeting();
  renderLastWinderBW();
  renderSelectedLineResult();
  renderShiftPanel();
  renderHistory();
  renderLearningDashboard();
  renderTrendPanel(analyzeTrend());
  renderProductionDashboard();
  $('chat-log').innerHTML='';
  if(!restoreChatMessages())ensureChatWelcome();
}
function switchLine(line){
  line=Number(line);if(![1,2,3,4].includes(line)||line===ACTIVE_LINE)return;
  persistLineOperationalState();
  ACTIVE_LINE=line;
  localStorage.setItem(ACTIVE_LINE_KEY,String(line));
  localStorage.setItem('viejitoLastViewedLineV1',String(line));
  sessionStorage.setItem('viejitoLineChosenSession','1');
  hydrateLineState();
  renderSelectedLineState();
  showToast(`Line ${line}`);
}
function openLinePicker(){}
function closeLinePicker(){}

// 5.34.6 — random hydration/blade reminders removed by operator request.


$('chat-form').addEventListener('submit',event=>{
  event.preventDefault();
  const input=$('chat-input');
  const text=input.value.trim();
  if(!text)return;
  bubble('user',text);
  saveChatMessage('user',text);
  input.value='';
  setTimeout(()=>{
    inChatQuery=true;
    const response=interpret(text);
    rememberChatRecommendation(response);
    inChatQuery=false;
    if(response?.kind==='result' && !response.sarcasm && (state.personality==='light' || state.personality==='heavy')){
      response.sarcasm=getSarcasmLine();
    }
    bubble('bot',response);
    saveChatMessage('bot',response);
  },120);
});
document.querySelectorAll('.example').forEach(button=>button.addEventListener('click',()=>{$('chat-input').value=button.dataset.example;$('chat-form').requestSubmit();}));
let aiMatrixTimer=null;
function activateAIMatrix(duration=950){
  document.querySelectorAll('.ai-matrix-badge').forEach(badge=>badge.classList.add('thinking'));
  if(aiMatrixTimer)clearTimeout(aiMatrixTimer);
  aiMatrixTimer=setTimeout(()=>{document.querySelectorAll('.ai-matrix-badge').forEach(badge=>badge.classList.remove('thinking'));aiMatrixTimer=null;},Math.max(350,Number(duration)||950));
}
function setupInfoHelp(buttonId,popoverId){
  const button=$(buttonId),popover=$(popoverId);if(!button||!popover)return;
  const close=()=>{button.setAttribute('aria-expanded','false');button.closest('.help-wrap')?.classList.remove('open');};
  button.addEventListener('click',event=>{event.stopPropagation();const wrap=button.closest('.help-wrap');const open=!wrap?.classList.contains('open');document.querySelectorAll('.help-wrap.open').forEach(el=>el.classList.remove('open'));wrap?.classList.toggle('open',open);button.setAttribute('aria-expanded',open?'true':'false');});
  button.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
}
setupInfoHelp('learning-help','learning-help-popover');
setupInfoHelp('trend-help','trend-help-popover');
document.addEventListener('click',event=>{if(!event.target.closest('.help-wrap'))document.querySelectorAll('.help-wrap.open').forEach(el=>{el.classList.remove('open');el.querySelector('.info-help')?.setAttribute('aria-expanded','false');});});
document.addEventListener('input',event=>{
  const el=event.target;
  if(!(el instanceof HTMLInputElement)&&!(el instanceof HTMLTextAreaElement))return;
  const numeric=el.type==='number'||el.inputMode==='decimal'||/\d/.test(el.value||'');
  if(numeric&&/\d/.test(el.value||''))activateAIMatrix(900);
},true);
document.addEventListener('click',event=>{if(event.target.closest('#winder1-calc,#winder2-calc,#bw-calc,#ft-calc,#sw-calc,#product-dialog-confirm,#apply-preventive-swrap'))activateAIMatrix(1500);},true);
document.querySelectorAll('.quick-card').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
$('tool-menu-toggle')?.addEventListener('click',event=>{event.stopPropagation();toggleToolMenu();});
$('tool-menu-popover')?.addEventListener('click',event=>event.stopPropagation());
document.addEventListener('click',closeToolMenu);
$('chat-fab').addEventListener('click',toggleChat);
$('chat-close').addEventListener('click',()=>setChatOpen(false));
$('chat-backdrop').addEventListener('click',()=>setChatOpen(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){setChatOpen(false);closeToolMenu();closeManualProcessDialog();closeDailyReportDialog();}});
document.querySelectorAll('.mandrel').forEach(button=>button.addEventListener('click',()=>selectMandrel(button.dataset.target,Number(button.dataset.value))));
document.querySelectorAll('.tool-mandrel').forEach(button=>button.addEventListener('click',()=>{const value=Number(button.dataset.value);selectMandrel('bw',value);selectMandrel('ft',value);showToast(`${value}” mandrel`);}));
$('language-select').addEventListener('change',event=>applyLanguage(event.target.value,true));
$('settings-open')?.addEventListener('click',openSettings);
$('settings-password-confirm')?.addEventListener('click',confirmSettingsPassword);
$('settings-password-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')confirmSettingsPassword();});
$('settings-password-close')?.addEventListener('click',()=>{$('settings-password-dialog')?.classList.add('hidden');});
document.querySelectorAll('[data-draft-demo]').forEach(b=>b.addEventListener('click',()=>{if(settingsDraft){settingsDraft.demo=b.dataset.draftDemo;renderSettingsDraft();}}));
$('learning-manager-open')?.addEventListener('click',openLearningManager);
$('learning-manager-close')?.addEventListener('click',()=>{$('learning-manager-dialog')?.classList.add('hidden');});

$('settings-close')?.addEventListener('click',closeSettings);
$('settings-dialog')?.addEventListener('click',e=>{if(e.target===$('settings-dialog'))closeSettings();});
$('settings-language-select')?.addEventListener('change',e=>{if(settingsDraft){settingsDraft.language=e.target.value;renderSettingsDraft();}});
document.querySelectorAll('[data-draft-theme]').forEach(b=>b.addEventListener('click',()=>{if(settingsDraft){settingsDraft.theme=b.dataset.draftTheme;renderSettingsDraft();}}));
document.querySelectorAll('[data-draft-personality]').forEach(b=>b.addEventListener('click',()=>{if(settingsDraft){settingsDraft.personality=b.dataset.draftPersonality;renderSettingsDraft();}}));
document.querySelectorAll('[data-draft-bw-factor]').forEach(b=>b.addEventListener('click',()=>{if(settingsDraft){settingsDraft.bwFactor=Number(b.dataset.draftBwFactor);renderSettingsDraft();}}));
$('settings-save')?.addEventListener('click',saveSettingsDraft);
$('post-cut-accept')?.addEventListener('click',acceptPostCutRecommendation);
$('post-cut-continue')?.addEventListener('click',continueRunningPostCut);
$('accept-swrap-recommendation')?.addEventListener('click',acceptSWrapRecommendation);
$('reject-swrap-recommendation')?.addEventListener('click',rejectSWrapRecommendation);

$('personality-select').addEventListener('change',event=>{
  state.personality=VALID_PERSONALITIES.includes(event.target.value)?event.target.value:DEFAULT_PERSONALITY;
  localStorage.setItem('viejitoPersonality',state.personality);
  showToast(t('personalityChanged',{mode:personalityLabel()}));
});
$('winder1-calc').addEventListener('click',()=>{try{calculateSingleWinder(1);}catch(e){showToast(e.message);}});
$('winder2-calc').addEventListener('click',()=>{try{calculateSingleWinder(2);}catch(e){showToast(e.message);}});
$('bw-calc').addEventListener('click',()=>{try{completeDualWinderCut();}catch(e){showToast(e.message);}});
$('ft-calc').addEventListener('click',()=>{if(!requireActiveShift({openStart:true}))return;try{const bw=Number($('ft-bw').value),w=Number($('ft-weight').value),m=currentMandrel('ft'),r=calculateFT(bw,w,m);$('ft-result').textContent=`${fmt(r,0)} ft`;$('ft-meta').textContent=m===48?t('defaultMandrel',{m}):t('mandrelOnly',{m});addHistory('FT',`${fmt(r,0)} ft • BW ${bw} / ${w} lb • ${m}”`);}catch(e){showToast(e.message);}});
$('sw-calc').addEventListener('click',()=>{if(!requireActiveShift({openStart:true}))return;try{const a=Number($('sw-current').value),s=Number($('sw-speed').value),target=Number($('sw-target').value),raw=rawSWrapCalculation(a,s,target),r=clampSWrap(raw);$('sw-result').textContent=fmt(r,1);if(raw>MAX_SWRAP_SPEED)showToast(swrapLimitCopy());addHistory('S-Wrap',`${fmt(r,1)} speed • ${a} × ${s} ÷ ${target}${raw>MAX_SWRAP_SPEED?' • MAX 228':''}`);}catch(e){showToast(e.message);}});

$('record-result-toggle').addEventListener('click',()=>{$('learning-form').classList.toggle('hidden');});
$('cancel-learning').addEventListener('click',()=>{$('learning-form').classList.add('hidden');});
$('save-learning').addEventListener('click',saveLearningResult);
$('clear-learning')?.addEventListener('click',()=>{
  const ok=confirm(state.language==='es'?`¿Borrar TODO el aprendizaje adaptativo guardado de Line ${ACTIVE_LINE}? Esta acción no se puede deshacer.`:state.language==='fr'?`Effacer TOUT l’apprentissage adaptatif enregistré de Line ${ACTIVE_LINE} ? Cette action est irréversible.`:`Erase ALL saved adaptive learning for Line ${ACTIVE_LINE}? This cannot be undone.`);
  if(!ok)return;
  state.learningEngine.clear();renderLearningDashboard();showToast(ot('resetDone'));
});
$('clear-trend')?.addEventListener('click',()=>{
  const ok=confirm(state.language==='es'?`¿Borrar TODO el historial de tendencia de Line ${ACTIVE_LINE}? Esta acción no se puede deshacer.`:state.language==='fr'?`Effacer TOUT l’historique de tendance de Line ${ACTIVE_LINE} ? Cette action est irréversible.`:`Erase ALL trend history for Line ${ACTIVE_LINE}? This cannot be undone.`);
  if(!ok)return;
  state.bwTrendHistory=[];lineRemove(activeTrendHistoryKey());saveAcceptedPreventiveTrend(null);renderTrendPanel(analyzeTrend());showToast(ot('trendCleared'));
});
$('clear-process-learning')?.addEventListener('click',()=>{
  const ok=confirm(state.language==='es'?`¿Borrar TODO el aprendizaje de Primary/Secondary/output de Line ${ACTIVE_LINE}? Esta acción no se puede deshacer.`:state.language==='fr'?`Effacer TOUT l’apprentissage process de Line ${ACTIVE_LINE} ? Cette action est irréversible.`:`Erase ALL Primary/Secondary/output process learning for Line ${ACTIVE_LINE}? This cannot be undone.`);
  if(!ok)return;
  state.processLearning.clear();
  showToast(state.language==='es'?'Aprendizaje de desempeño del proceso borrado.':'Process Performance Learning cleared.');
});
$('clear-history').addEventListener('click',()=>{state.history=[];lineRemove('viejitoHistory');renderHistory();showToast(t('historyCleared'));});
$('production-target')?.addEventListener('click',openProductionDialog);
$('manual-process-open')?.addEventListener('click',openManualProcessDialog);
$('manual-process-close')?.addEventListener('click',closeManualProcessDialog);
$('manual-process-cancel')?.addEventListener('click',closeManualProcessDialog);
$('manual-process-dialog')?.addEventListener('click',event=>{if(event.target===$('manual-process-dialog'))closeManualProcessDialog();});
['manual-primary','manual-secondary','manual-w1','manual-w2','manual-minutes'].forEach(id=>$(id)?.addEventListener('input',updateManualProcessPreview));
$('manual-process-save')?.addEventListener('click',saveManualProcessRecord);
$('speed-change-open')?.addEventListener('click',openSpeedChangeDialog);
$('speed-change-close')?.addEventListener('click',closeSpeedChangeDialog);
$('speed-change-cancel')?.addEventListener('click',closeSpeedChangeDialog);
$('speed-change-dialog')?.addEventListener('click',event=>{if(event.target===$('speed-change-dialog'))closeSpeedChangeDialog();});
['speed-current-primary','speed-current-secondary','speed-w1','speed-w2','speed-minutes','speed-target-speed','speed-target-bw'].forEach(id=>$(id)?.addEventListener('input',updateSpeedChangePreview));
$('speed-change-suggest')?.addEventListener('click',runSpeedChangeSuggestion);
$('daily-report-open')?.addEventListener('click',openDailyReportDialog);
$('daily-report-close')?.addEventListener('click',closeDailyReportDialog);
$('daily-report-dialog')?.addEventListener('click',event=>{if(event.target===$('daily-report-dialog'))closeDailyReportDialog();});
$('daily-report-period')?.addEventListener('change',()=>{updateDailyReportPeriodUI();renderDailyReportPreview();});
$('daily-report-date')?.addEventListener('change',renderDailyReportPreview);
$('daily-report-scope')?.addEventListener('change',renderDailyReportPreview);
$('daily-report-shift')?.addEventListener('change',renderDailyReportPreview);
$('daily-report-refresh')?.addEventListener('click',renderDailyReportPreview);
$('daily-report-print')?.addEventListener('click',printDailyReport);
$('lead-confirm-yes')?.addEventListener('click',()=>saveLeadConfirmation('yes'));
$('lead-confirm-no')?.addEventListener('click',()=>saveLeadConfirmation('no'));
$('production-summary-toggle')?.addEventListener('click',openProductionDialog);
$('production-dialog-close')?.addEventListener('click',closeProductionDialog);
$('production-dialog')?.addEventListener('click',event=>{if(event.target===$('production-dialog'))closeProductionDialog();});
$('target-lbs-hour')?.addEventListener('input',updateProductionTargetPreview);
$('target-shift-hours')?.addEventListener('input',updateProductionTargetPreview);
$('save-production-target')?.addEventListener('click',saveCurrentProductionTarget);
setInterval(()=>{const closed=closeExpiredShiftForSchedule();if(closed){renderShiftPanel();renderTrendPanel(analyzeTrend());}else if(state.activeShift)renderProductionDashboard();},30000);
$('start-shift').addEventListener('click',()=>{if(state.activeShift)endShift();else startShift();});
$('change-product').addEventListener('click',()=>changeProduct());
$('end-shift')?.addEventListener('click',endShift);
let confirmedProduct=String(state.activeShift?.product||state.product||'').toUpperCase();
let confirmedTargetBW=Number(state.activeShift?.runs?.find(r=>r.id===state.activeShift?.runId)?.targetBW||state.targetBW);
$('bw-product').addEventListener('focus',()=>{
  confirmedProduct=String(state.activeShift?.product||$('bw-product').value||'').toUpperCase();
  confirmedTargetBW=Number(state.activeShift?.runs?.find(r=>r.id===state.activeShift?.runId)?.targetBW||state.targetBW);
});
$('bw-product').addEventListener('blur',()=>{
  const next=String($('bw-product').value||'').trim().toUpperCase();
  if(state.activeShift&&next&&next!==state.activeShift.product){
    if(confirm(shiftText('confirmChange',{old:state.activeShift.product,next}))) changeProduct(next);
    else{
      $('bw-product').value=state.activeShift.product||confirmedProduct;
      const liveTarget=Number(state.activeShift?.runs?.find(r=>r.id===state.activeShift?.runId)?.targetBW||confirmedTargetBW||state.targetBW);
      if(positive(liveTarget)){$('bw-target').value=String(liveTarget);state.targetBW=liveTarget;lineSet('viejitoTargetBW',String(liveTarget));}
      saveSession();
    }
  }
});
$('product-search')?.addEventListener('input',updateProductDialogPreview);
document.querySelectorAll('.extruder-option').forEach(button=>button.addEventListener('click',()=>{
  selectedExtruder=Number(button.dataset.extruder)||1;
  document.querySelectorAll('.extruder-option').forEach(item=>item.classList.toggle('selected',item===button));
}));
$('product-dialog-cancel')?.addEventListener('click',closeProductDialog);
$('product-dialog')?.addEventListener('click',event=>{if(event.target===$('product-dialog'))closeProductDialog();});
$('product-dialog-confirm')?.addEventListener('click',()=>{
  const product=normalizeProduct($('product-search').value);
  const swrap=Number($('product-swrap')?.value);
  if(productDialogMode==='start')commitStartShift(product,selectedExtruder,swrap,$('product-language')?.value);else commitProductChange(product,swrap);
});
$('bw-product').addEventListener('input',()=>{
  // While a shift is running, typing a different product is only a draft until the operator confirms changeover.
  const typed=String($('bw-product').value||'').trim().toUpperCase();
  const live=String(state.activeShift?.product||'').trim().toUpperCase();
  if(!state.activeShift||typed===live)syncTargetFromProduct($('bw-product').value);
  saveSession();
});
let manualSWrapEditStart=null;
$('bw-current-swrap').addEventListener('focus',()=>{manualSWrapEditStart=Number(state.currentSWrap);});
$('bw-current-swrap').addEventListener('input',()=>{if(!hasActiveScheduledShift())return;syncCurrentSWrap($('bw-current-swrap').value);});
$('bw-current-swrap').addEventListener('change',()=>{
  if(!state.activeShift)return;
  const before=Number(manualSWrapEditStart),after=Number(state.currentSWrap);recordSWrapChange(before,after,'manual_input');manualSWrapEditStart=after;
});
$('theme-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('viejitoTheme',document.documentElement.classList.contains('light')?'light':'dark');});
window.addEventListener('online',updateConnection);
window.addEventListener('offline',updateConnection);
SESSION_FIELDS.forEach(id=>$(id)?.addEventListener('input',saveSession));
$('bw-target')?.addEventListener('input',renderPendingCut);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSession();});
window.addEventListener('pagehide',saveSession);

document.querySelectorAll('[data-line-select]').forEach(button=>button.addEventListener('click',()=>switchLine(button.dataset.lineSelect)));
document.querySelectorAll('[data-line-quick]').forEach(button=>button.addEventListener('click',()=>switchLine(button.dataset.lineQuick)));
$('change-line-button')?.addEventListener('click',openLinePicker);
$('line-picker-close')?.addEventListener('click',closeLinePicker);
if($('chat-memory-select'))$('chat-memory-select').value='separate';
if(!localStorage.getItem(ACTIVE_LINE_KEY))localStorage.setItem(ACTIVE_LINE_KEY,String(ACTIVE_LINE));
sessionStorage.setItem('viejitoLineChosenSession','1');
updateLineSelector();

window.addEventListener('pagehide',persistLineOperationalState);
window.addEventListener('beforeunload',persistLineOperationalState);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistLineOperationalState();});

if(localStorage.getItem('viejitoTheme')==='light')document.documentElement.classList.add('light');
selectMandrel('bw',state.mandrel);
selectMandrel('ft',state.mandrel);
$('bw-target').value=fmt(state.targetBW);
$('bw-current-swrap').value=fmt(state.currentSWrap,1);
$('bw-product').value=state.product;
restoreSession();
if(state.activeShift?.product){
  state.product=state.activeShift.product;
  applyAutomaticMandrelForProduct(state.product,{forceDefault:false});
  const activeRun=state.activeShift.runs?.find(r=>r.id===state.activeShift.runId);
  const restoredSWrap=Number(state.activeShift.currentSWrap||activeRun?.swrap||state.currentSWrap);
  const restoredTarget=Number(activeRun?.targetBW||targetFromProduct(state.activeShift.product)||state.targetBW);
  if(positive(restoredSWrap))state.currentSWrap=clampSWrap(restoredSWrap);
  if(positive(restoredTarget))state.targetBW=restoredTarget;
  $('bw-product').value=state.product;
  $('bw-target').value=fmt(state.targetBW);
  $('bw-current-swrap').value=fmt(state.currentSWrap,1);
  lineSet('viejitoProduct',state.product);
  lineSet('viejitoTargetBW',String(state.targetBW));
  lineSet('viejitoCurrentSWrap',String(state.currentSWrap));
}
applyLanguage(state.language);
renderOperatorGreeting();
renderLastWinderBW();
renderDemoModeBanner();
renderShiftPanel();
renderHistory();
renderLearningDashboard();
renderTrendPanel(analyzeTrend());
if(!restoreChatMessages()) ensureChatWelcome();
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js?v=5.34.6',{updateViaCache:'none'});
      await registration.update();
    }catch(error){
      console.error(error);
    }
  });
}
