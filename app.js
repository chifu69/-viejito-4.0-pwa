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
const TREND_HISTORY_KEY = 'viejitoBWTrendHistoryV3';
const SHIFT_KEY = 'viejitoActiveShiftV1';
const SHIFT_ARCHIVE_KEY = 'viejitoShiftArchiveV1';
const TREND_SAMPLE_SIZE = 5;
const LAST_COMPLETED_CUT_KEY = 'viejitoLastCompletedCutV1';
const MAX_AUTO_CONTEXT_AGE_MS = 12 * 60 * 60 * 1000;
const ACTIVE_LINE_KEY = 'viejitoSelectedLineV1';
const ACTIVE_LINE = [1,2,3,4].includes(Number(localStorage.getItem(ACTIVE_LINE_KEY))) ? Number(localStorage.getItem(ACTIVE_LINE_KEY)) : 1;
const lineKey = base => `${base}::line${ACTIVE_LINE}`;
const lineGet = (base, fallback=null) => localStorage.getItem(lineKey(base)) ?? fallback;
const lineSet = (base, value) => localStorage.setItem(lineKey(base), value);
const lineRemove = base => localStorage.removeItem(lineKey(base));
let inChatQuery = false;
const CHAT_MEMORY_MODE_KEY='viejitoChatMemoryModeV1';
const CHAT_HISTORY_KEY='viejitoChatHistoryV1';


const translations = {
  en: {
    personality: 'Personality', chatPersonality: 'Chat personality', professional: 'Professional',
    lightSarcasm: 'Light sarcasm', heavySarcasm: 'Heavy sarcasm', off: 'Off',
    personalityChanged: 'Personality changed to {mode}.',
    language: 'Language', preferredLanguage: 'Preferred language', online: 'Online', offline: 'No signal',
    changeTheme: 'Change theme', plantMode: 'PLANT MODE', heroTitle: 'What do you need to calculate?',
    heroDescription: 'Works without a signal for BW, FT and S-Wrap.', quickTools: 'Quick tools',
    chat: 'Chat', chatSubtitle: 'Type naturally', openChat: 'Open chat', closeChat: 'Close chat', assistantOnline: 'Online assistant', bwSubtitle: '48” or 51” mandrel',
    ftSubtitle: 'Calculate length', swrapSubtitle: 'Adjust speed', calculator: 'CALCULATOR',
    weightLb: 'Weight (lb)', lengthFt: 'Length (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Required', winder2Optional: 'Required', averageBW: 'Average Basis Weight', imbalance: 'Winder difference', mandrel: 'Mandrel', length: 'Length',
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
    introTitle: 'Industrial IA 5.14',
    intro: 'Ready. Without commands: two numbers calculate BW using the 48” mandrel; 15 through 230 is interpreted as S-Wrap Speed; more than 230 is interpreted as FT. You can force BW, FT or S-Wrap by typing it.',
    footer: 'Industrial IA 5.14 • Plant Assistant'
  },
  es: {
    personality: 'Personalidad', chatPersonality: 'Personalidad del chat', professional: 'Profesional',
    lightSarcasm: 'Sarcasmo ligero', heavySarcasm: 'Sarcasmo pesado', off: 'Apagado',
    personalityChanged: 'Personalidad cambiada a {mode}.',
    language: 'Idioma', preferredLanguage: 'Idioma preferido', online: 'En línea', offline: 'Sin señal',
    changeTheme: 'Cambiar tema', plantMode: 'MODO PLANTA', heroTitle: '¿Qué necesitas calcular?',
    heroDescription: 'Funciona sin señal para BW, FT y S-Wrap.', quickTools: 'Herramientas rápidas',
    chat: 'Chat', chatSubtitle: 'Escribe como hablas', openChat: 'Abrir chat', closeChat: 'Cerrar chat', assistantOnline: 'Asistente en línea', bwSubtitle: 'Mandrel 48” o 51”',
    ftSubtitle: 'Calcula longitud', swrapSubtitle: 'Ajusta velocidad', calculator: 'CALCULADORA',
    weightLb: 'Peso (lb)', lengthFt: 'Longitud (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Obligatorio', winder2Optional: 'Obligatorio', averageBW: 'Promedio de Basis Weight', imbalance: 'Diferencia entre winders', mandrel: 'Mandrel', length: 'Longitud',
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
    introTitle: 'Industrial IA 5.14',
    intro: 'Listo. Sin comandos: dos números calculan BW con mandrel 48”; de 15 a 230 interpreto S-Wrap Speed; más de 230 interpreto FT. Puedes forzar BW, FT o S-Wrap escribiéndolo.',
    footer: 'Industrial IA 5.14 • Asistente de planta'
  },
  fr: {
    personality: 'Personnalité', chatPersonality: 'Personnalité du chat', professional: 'Professionnel',
    lightSarcasm: 'Sarcasme léger', heavySarcasm: 'Sarcasme appuyé', off: 'Désactivé',
    personalityChanged: 'Personnalité changée : {mode}.',
    language: 'Langue', preferredLanguage: 'Langue préférée', online: 'En ligne', offline: 'Pas de réseau',
    changeTheme: 'Changer le thème', plantMode: 'MODE USINE', heroTitle: 'Que devez-vous calculer ?',
    heroDescription: 'Fonctionne sans réseau pour BW, FT et S-Wrap.', quickTools: 'Outils rapides',
    chat: 'Discussion', chatSubtitle: 'Écrivez naturellement', openChat: 'Ouvrir le chat', closeChat: 'Fermer le chat', assistantOnline: 'Assistant en ligne', bwSubtitle: 'Mandrin 48” ou 51”',
    ftSubtitle: 'Calculer la longueur', swrapSubtitle: 'Régler la vitesse', calculator: 'CALCULATRICE',
    weightLb: 'Poids (lb)', lengthFt: 'Longueur (ft)', winder1: 'Winder 1', winder2: 'Winder 2', required: 'Obligatoire', winder2Optional: 'Obligatoire', averageBW: 'Moyenne Basis Weight', imbalance: 'Écart entre winders', mandrel: 'Mandrin', length: 'Longueur',
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
    introTitle: 'Industrial IA 5.14',
    intro: 'Prêt. Sans commande : deux nombres calculent BW avec le mandrin de 48”; de 15 à 230 est interprété comme la vitesse S-Wrap; plus de 230 est interprété comme FT. Vous pouvez forcer BW, FT ou S-Wrap en l’écrivant.',
    footer: 'Industrial IA 5.14 • Assistant industriel'
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


const DEMO_MODE_KEY='viejitoDemoModeV1';
const ADMIN_PASSWORD_HASH_KEY='viejitoAdminPasswordHashV1';
const MIGRATION_514_KEY='viejitoMigration514Done';
function demoMode(){return localStorage.getItem(DEMO_MODE_KEY)==='on';}
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

const state = {
  language: VALID_LANGUAGES.includes(localStorage.getItem('viejitoLanguage')) ? localStorage.getItem('viejitoLanguage') : DEFAULT_LANGUAGE,
  personality: VALID_PERSONALITIES.includes(localStorage.getItem('viejitoPersonality')) ? localStorage.getItem('viejitoPersonality') : DEFAULT_PERSONALITY,
  mandrel: Number(localStorage.getItem('viejitoMandrel')) || DEFAULT_MANDREL,
  context: JSON.parse(lineGet('viejitoContext','{}') || '{}'),
  history: JSON.parse(lineGet('viejitoHistory','[]') || '[]'),
  targetBW: Number(lineGet('viejitoTargetBW')) || DEFAULT_TARGET_BW,
  currentSWrap: Number(lineGet('viejitoCurrentSWrap')) || DEFAULT_CURRENT_SWRAP,
  product: lineGet('viejitoProduct','') || '',
  activeShift: JSON.parse(lineGet(SHIFT_KEY,'null') || 'null'),
  shiftArchive: JSON.parse(lineGet(SHIFT_ARCHIVE_KEY,'[]') || '[]'),
  productionTargets: JSON.parse(lineGet('viejitoProductionTargetsV1','{}') || '{}'),
  latestOptimization: null,
  bwTrendHistory: JSON.parse(lineGet(TREND_HISTORY_KEY,'[]') || '[]'),
  latestTrend: null,
  lastCompletedCut: JSON.parse(lineGet(LAST_COMPLETED_CUT_KEY,'null') || 'null'),
  selectedLine: ACTIVE_LINE,
  learningEngine: new AdaptiveLearningEngine(window.localStorage, lineKey('viejitoMachineLearningV3'))
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
function calculateSWrap(currentWeight,currentSpeed,targetWeight){
  if(!positive(currentWeight,currentSpeed,targetWeight)) throw new Error(t('invalidNumbers'));
  return currentWeight * currentSpeed / targetWeight;
}


const optimizerText = {
  en: {
    targetBW:'Target BW', currentSWrap:'Current S-Wrap', difference:'Difference', suggestedSWrap:'Suggested S-Wrap',
    tooLight:'Too light', tooHeavy:'Too heavy', greenStatus:'ON TARGET', yellowStatus:'NEAR LIMIT', redStatus:'OUT OF RANGE',
    greenMessage:'Within ±0.17. No adjustment needed.', yellowMessage:'Between 0.17 and 0.30 from target. Warning — watch the next cut and prepare an S-Wrap correction.',
    redMessage:'Adjust the S-Wrap now.', noChange:'Keep S-Wrap at {speed}. No change recommended.',
    decrease:'Decrease S-Wrap by {amount}, from {current} to {suggested}.', increase:'Increase S-Wrap by {amount}, from {current} to {suggested}.',
    hold:'Keep S-Wrap at {speed}.', smartMeta:'Target {target} • Current S-Wrap {speed}', formulaSuggestion:'Formula suggestion', learnedSuggestion:'Learned suggestion', confidence:'Confidence', rollsLearned:'Rolls learned', recordResult:'Record actual result', learningQuestion:'After making the change, enter the S-Wrap you used and the final BW.', appliedSWrap:'Applied S-Wrap', finalBW:'Final BW', saveLearn:'Save and learn', cancel:'Cancel', learningSaved:'Result saved. Viejito learned from this roll.', machineLearning:'Machine learning', resetLearning:'Reset learning', averageCorrection:'Average correction', successRate:'Success rate', deviceOnly:'Learning is stored only on this device.', resetDone:'Machine learning was reset.', trendPredictor:'Trend Predictor', trendWaiting:'Add {remaining} more BW roll(s) to activate the prediction.', trendStable:'The last 5 rolls are stable. No preventive change is recommended.', trendUp:'BW is increasing by about {slope} per roll. The next roll is projected at {projected}. Increase S-Wrap by {amount} points now, from {current} to {suggested}.', trendDown:'BW is decreasing by about {slope} per roll. The next roll is projected at {projected}. Decrease S-Wrap by {amount} points now, from {current} to {suggested}.', trendProjected:'Projected next BW', trendDirection:'Direction', trendConsistency:'Consistency', trendRolls:'Last rolls', trendClear:'Clear trend', trendCleared:'BW trend history cleared.', trendUpLabel:'Increasing', trendDownLabel:'Decreasing', trendStableLabel:'Stable'
  },
  es: {
    targetBW:'BW objetivo', currentSWrap:'S-Wrap actual', difference:'Diferencia', suggestedSWrap:'S-Wrap sugerido',
    tooLight:'Muy liviano', tooHeavy:'Muy pesado', greenStatus:'DENTRO DEL OBJETIVO', yellowStatus:'CERCA DEL LÍMITE', redStatus:'FUERA DE RANGO',
    greenMessage:'Dentro de ±0.17. No se necesita ajuste.', yellowMessage:'Entre 0.17 y menos de 0.30 del objetivo. ADVERTENCIA: vigila el próximo corte y prepárate para corregir el S-Wrap.',
    redMessage:'FUERA DE RANGO. Ajusta el S-Wrap ahora.', noChange:'Mantén el S-Wrap en {speed}. No se recomienda cambio.',
    decrease:'Baja el S-Wrap {amount}, de {current} a {suggested}.', increase:'Sube el S-Wrap {amount}, de {current} a {suggested}.',
    hold:'Mantén el S-Wrap en {speed}.', smartMeta:'Objetivo {target} • S-Wrap actual {speed}', formulaSuggestion:'Sugerencia por fórmula', learnedSuggestion:'Sugerencia aprendida', confidence:'Confianza', rollsLearned:'Rollos aprendidos', recordResult:'Registrar resultado real', learningQuestion:'Después del cambio, escribe el S-Wrap que usaste y el BW final.', appliedSWrap:'S-Wrap aplicado', finalBW:'BW final', saveLearn:'Guardar y aprender', cancel:'Cancelar', learningSaved:'Resultado guardado. Viejito aprendió de este rollo.', machineLearning:'Aprendizaje de la máquina', resetLearning:'Borrar aprendizaje', averageCorrection:'Corrección promedio', successRate:'Porcentaje de éxito', deviceOnly:'El aprendizaje se guarda solamente en este dispositivo.', resetDone:'Se borró el aprendizaje de la máquina.', trendPredictor:'Predictor de tendencia', trendWaiting:'Agrega {remaining} rollo(s) de BW para activar la predicción.', trendStable:'Los últimos 5 rollos están estables. No se recomienda ningún cambio preventivo.', trendUp:'El BW está aumentando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Sube el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendDown:'El BW está bajando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Baja el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendProjected:'Próximo BW proyectado', trendDirection:'Dirección', trendConsistency:'Consistencia', trendRolls:'Últimos rollos', trendClear:'Borrar tendencia', trendCleared:'Se borró el historial de tendencia de BW.', trendUpLabel:'Aumentando', trendDownLabel:'Bajando', trendStableLabel:'Estable'
  },
  fr: {
    targetBW:'BW cible', currentSWrap:'S-Wrap actuel', difference:'Différence', suggestedSWrap:'S-Wrap suggéré',
    tooLight:'Trop léger', tooHeavy:'Trop lourd', greenStatus:'DANS LA CIBLE', yellowStatus:'PRÈS DE LA LIMITE', redStatus:'HORS PLAGE',
    greenMessage:'Dans ±0,20. Aucun réglage nécessaire.', yellowMessage:'Entre 0,20 et moins de 0,30 de la cible. Attention : surveillez la prochaine coupe et préparez une correction du S-Wrap.',
    redMessage:'Modifiez le S-Wrap maintenant.', noChange:'Gardez le S-Wrap à {speed}. Aucun changement recommandé.',
    decrease:'Réduisez le S-Wrap de {amount}, de {current} à {suggested}.', increase:'Augmentez le S-Wrap de {amount}, de {current} à {suggested}.',
    hold:'Gardez le S-Wrap à {speed}.', smartMeta:'Cible {target} • S-Wrap actuel {speed}', formulaSuggestion:'Suggestion par formule', learnedSuggestion:'Suggestion apprise', confidence:'Confiance', rollsLearned:'Rouleaux appris', recordResult:'Enregistrer le résultat réel', learningQuestion:'Après le changement, saisissez le S-Wrap utilisé et le BW final.', appliedSWrap:'S-Wrap appliqué', finalBW:'BW final', saveLearn:'Enregistrer et apprendre', cancel:'Annuler', learningSaved:'Résultat enregistré. Viejito a appris de ce rouleau.', machineLearning:'Apprentissage machine', resetLearning:'Réinitialiser', averageCorrection:'Correction moyenne', successRate:'Taux de réussite', deviceOnly:'Les données restent uniquement sur cet appareil.', resetDone:'Apprentissage réinitialisé.', trendPredictor:'Prédicteur de tendance', trendWaiting:'Ajoutez encore {remaining} rouleau(x) BW pour activer la prévision.', trendStable:'Les 5 derniers rouleaux sont stables. Aucun changement préventif recommandé.', trendUp:'Le BW augmente d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Augmentez le S-Wrap de {amount} points, de {current} à {suggested}.', trendDown:'Le BW diminue d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Réduisez le S-Wrap de {amount} points, de {current} à {suggested}.', trendProjected:'Prochain BW estimé', trendDirection:'Direction', trendConsistency:'Cohérence', trendRolls:'Derniers rouleaux', trendClear:'Effacer la tendance', trendCleared:'Historique de tendance BW effacé.', trendUpLabel:'En hausse', trendDownLabel:'En baisse', trendStableLabel:'Stable'
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
  state.currentSWrap=Number(currentSWrap);
  lineSet('viejitoTargetBW',String(state.targetBW));
  lineSet('viejitoCurrentSWrap',String(state.currentSWrap));
}
function currentProcessContext(){
  const product=String($('bw-product')?.value||state.activeShift?.product||state.product||'').trim();
  const mandrel=currentMandrel('bw');
  state.product=product;
  lineSet('viejitoProduct',product);
  return {
    product:product.toUpperCase(),
    mandrel,
    extruder:Number(state.activeShift?.extruder)||null,
    shiftId:state.activeShift?.id||null,
    runId:state.activeShift?.runId||null
  };
}
function optimizeBasisWeight(actualBW,targetBW=state.targetBW,currentSWrap=state.currentSWrap){
  saveOptimizerSettings(targetBW,currentSWrap);
  const optimizer=new SmartOptimizer({targetBW:state.targetBW,currentSWrap:state.currentSWrap,roundMode:'nearest1',learningEngine:state.learningEngine,context:currentProcessContext()});
  return optimizer.evaluate(actualBW);
}
function optimizerAction(result){
  if(!result.suggestAdjustment) return ot('noChange',{speed:fmt(result.currentSWrap,1)});
  const amount=fmt(Math.abs(result.adjustment),1);
  if(result.direction==='decrease') return ot('decrease',{amount,current:fmt(result.currentSWrap,1),suggested:fmt(result.suggestedSWrap,1)});
  if(result.direction==='increase') return ot('increase',{amount,current:fmt(result.currentSWrap,1),suggested:fmt(result.suggestedSWrap,1)});
  return ot('hold',{speed:fmt(result.currentSWrap,1)});
}
function optimizerStatus(result){
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
  return {title:ot('redStatus'),message:`${label}: ${fmt(suggested,1)} • ${direction} ${amount?fmt(amount,1):''}`.trim()};
}
function optimizerMarkup(result){
  const status=optimizerStatus(result);
  return `<div class="chat-optimizer ${result.level}"><strong>${escapeHTML(status.title)}</strong><small>${escapeHTML(status.message)}</small><div class="chat-optimizer-grid"><span>${escapeHTML(ot('targetBW'))}: <b>${escapeHTML(fmt(result.targetBW))}</b></span><span>${escapeHTML(ot('difference'))}: <b>${escapeHTML(result.difference>0?`+${fmt(result.difference)}`:fmt(result.difference))}</b></span><span>${escapeHTML(ot('formulaSuggestion'))}: <b>${escapeHTML(result.suggestAdjustment?fmt(result.formulaSuggestion,1):'—')}</b></span><span>${escapeHTML(ot('learnedSuggestion'))}: <b>${escapeHTML(result.suggestAdjustment?fmt(result.suggestedSWrap,1):'—')}</b></span><span>${escapeHTML(ot('confidence'))}: <b>${escapeHTML(result.learning.confidence+'%')}</b></span><span>${escapeHTML(ot('rollsLearned'))}: <b>${escapeHTML(result.learning.count)}</b></span></div><p>${escapeHTML(optimizerAction(result))}</p></div>`;
}

function renderResultStatus(result){
  const statusBox=$('result-status');
  if(!statusBox) return;
  const status=optimizerStatus(result);
  statusBox.classList.remove('idle','green','yellow','red','status-pop');
  statusBox.classList.add(result.level);
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
  box.classList.remove('hidden','green','yellow','red','status-pop');
  box.classList.add(result.level);
  void box.offsetWidth;box.classList.add('status-pop');
  $('priority-average-bw').textContent=fmt(result.actualBW,3);
  $('priority-target-bw').textContent=fmt(result.targetBW,2);
  $('priority-difference').textContent=result.difference>0?`+${fmt(result.difference,2)}`:fmt(result.difference,2);
  $('priority-status').textContent=status.title;
  $('priority-message').textContent=status.message;
  $('priority-current-swrap').textContent=fmt(result.currentSWrap,1);
  $('priority-suggested-swrap').textContent=result.suggestAdjustment?fmt(result.suggestedSWrap,1):fmt(result.currentSWrap,1);
  const outer=Number(result.warningTolerance)||0.30,low=result.targetBW-outer,high=result.targetBW+outer;
  if($('priority-range-low'))$('priority-range-low').textContent=fmt(low,2);
  if($('priority-range-target'))$('priority-range-target').textContent=fmt(result.targetBW,2);
  if($('priority-range-high'))$('priority-range-high').textContent=fmt(high,2);
  if($('priority-range-marker'))$('priority-range-marker').style.left=`${Math.max(0,Math.min(100,((result.actualBW-low)/(high-low||1))*100))}%`;
}

function renderOptimizerPanel(result){
  const panel=$('optimizer-panel');
  const status=optimizerStatus(result);
  panel.classList.remove('hidden','green','yellow','red');
  panel.classList.add(result.level);
  $('bw-result-box').classList.remove('green','yellow','red');
  $('bw-result-box').classList.add(result.level);
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
  $('record-result-toggle').classList.toggle('hidden',!result.suggestAdjustment);
  $('learning-form').classList.add('hidden');
  $('applied-swrap').value=result.suggestAdjustment?fmt(result.suggestedSWrap,1):'';
  renderLearningDashboard();
  $('range-low').textContent=fmt(result.targetBW-result.warningTolerance);
  $('range-target').textContent=fmt(result.targetBW);
  $('range-high').textContent=fmt(result.targetBW+result.warningTolerance);
  const span=result.warningTolerance*2;
  const position=Math.max(0,Math.min(100,((result.actualBW-(result.targetBW-result.warningTolerance))/span)*100));
  $('range-marker').style.left=`${position}%`;
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
  lineSet(TREND_HISTORY_KEY,JSON.stringify(state.bwTrendHistory));
}
function trendDirectionLabel(direction){
  if(direction==='up') return ot('trendUpLabel');
  if(direction==='down') return ot('trendDownLabel');
  return ot('trendStableLabel');
}
function analyzeTrend(targetBW=state.targetBW,currentSWrap=state.currentSWrap){
  sanitizeTrendHistory();
  const predictor=new TrendPredictor({sampleSize:TREND_SAMPLE_SIZE,targetBW,tolerance:window.VIEJITO_TOLERANCES?.warning||0.30,preventiveStep:2});
  const context=currentProcessContext();
  const matching=state.bwTrendHistory.filter(item=>{
    const sameProduct=!context.product||String(item.product||'').toUpperCase()===context.product;
    const sameMandrel=!context.mandrel||Number(item.mandrel||48)===Number(context.mandrel);
    const sameExtruder=!context.extruder||Number(item.extruder||0)===Number(context.extruder);
    const sameRun=!context.runId||String(item.runId||'')===String(context.runId);
    return sameProduct&&sameMandrel&&sameExtruder&&sameRun;
  }).slice(-TREND_SAMPLE_SIZE);
  state.latestTrend=predictor.analyze(matching.map(item=>Number(item.bw)),currentSWrap);
  return state.latestTrend;
}
function trendMessage(trend){
  if(!trend.ready) return ot('trendWaiting',{remaining:Math.max(0,trend.required-trend.count)});
  if(!trend.recommendAdjustment) return ot('trendStable');
  const vars={slope:fmt(Math.abs(trend.slope),3),projected:fmt(trend.projectedBW,3),amount:Math.abs(trend.adjustment),current:fmt(trend.suggestedSWrap-trend.adjustment,1),suggested:fmt(trend.suggestedSWrap,1)};
  return trend.direction==='up'?ot('trendUp',vars):ot('trendDown',vars);
}
function trendMarkup(trend){
  const level=trend.level==='danger'?'red':trend.level==='warning'?'yellow':'green';
  const values=trend.values.map(value=>fmt(value,3)).join(' → ');
  return `<div class="chat-trend ${level}"><strong>${escapeHTML(ot('trendPredictor'))}</strong><small>${escapeHTML(trendMessage(trend))}</small>${trend.ready?`<div class="chat-trend-grid"><span>${escapeHTML(ot('trendProjected'))}: <b>${escapeHTML(fmt(trend.projectedBW,3))}</b></span><span>${escapeHTML(ot('trendDirection'))}: <b>${escapeHTML(trendDirectionLabel(trend.direction))}</b></span><span>${escapeHTML(ot('trendConsistency'))}: <b>${escapeHTML(trend.consistency+'%')}</b></span><span>${escapeHTML(ot('trendRolls'))}: <b>${escapeHTML(values)}</b></span></div>`:''}</div>`;
}
function renderTrendPanel(trend=analyzeTrend()){
  const panel=$('trend-panel');
  if(!panel) return;
  panel.classList.remove('waiting','green','yellow','red');
  const level=!trend.ready?'waiting':trend.level==='danger'?'red':trend.level==='warning'?'yellow':'green';
  panel.classList.add(level);
  $('trend-title').textContent=ot('trendPredictor');
  $('trend-message').textContent=trendMessage(trend);
  $('trend-projected-label').textContent=ot('trendProjected');
  $('trend-direction-label').textContent=ot('trendDirection');
  $('trend-consistency-label').textContent=ot('trendConsistency');
  $('trend-rolls-label').textContent=ot('trendRolls');
  $('clear-trend').textContent=ot('trendClear');
  $('trend-projected').textContent=trend.ready?fmt(trend.projectedBW,3):'—';
  $('trend-direction').textContent=trend.ready?trendDirectionLabel(trend.direction):'—';
  $('trend-consistency').textContent=trend.ready?`${trend.consistency}%`:'—';
  $('trend-rolls').textContent=trend.values.length?trend.values.map(value=>fmt(value,3)).join(' → '):'—';
}
function recordBWForTrend(bw,targetBW=state.targetBW,currentSWrap=state.currentSWrap,pair=null){
  if(inChatQuery) return analyzeTrend(targetBW,currentSWrap);
  if(!positive(bw)) return analyzeTrend(targetBW,currentSWrap);
  sanitizeTrendHistory();
  const context=currentProcessContext();
  state.bwTrendHistory.push({bw:Number(bw),winder1:pair?.winder1??Number(bw),winder2:pair?.winder2??null,product:context.product,mandrel:context.mandrel,extruder:context.extruder,shiftId:context.shiftId,runId:context.runId,time:new Date().toISOString()});
  state.bwTrendHistory=state.bwTrendHistory.slice(-250);
  saveTrendHistory();
  const trend=analyzeTrend(targetBW,currentSWrap);
  renderTrendPanel(trend);
  return trend;
}

function renderLearningDashboard(){
  const stats=state.learningEngine.stats(currentProcessContext());
  $('dashboard-rolls').textContent=String(stats.count);
  $('dashboard-correction').textContent=stats.correction>0?`+${fmt(stats.correction,1)}`:fmt(stats.correction,1);
  $('dashboard-success').textContent=`${stats.successRate}%`;
  $('dashboard-confidence').textContent=`${stats.confidence}%`;
}

const PENDING_RECOMMENDATION_KEY='viejitoPendingRecommendationV1';
function pendingRecommendation(){
  try{return JSON.parse(lineGet(PENDING_RECOMMENDATION_KEY,'null')||'null');}catch(_){return null;}
}
function savePendingRecommendation(value){
  if(value)lineSet(PENDING_RECOMMENDATION_KEY,JSON.stringify(value));else lineRemove(PENDING_RECOMMENDATION_KEY);
}
function predictBWAfterSWrap(result,swrap){
  const applied=Number(swrap),current=Number(result.currentSWrap),actual=Number(result.actualBW);
  const profile=result.learning?.profile;
  if(profile&&Number(profile.confidence)>=45&&Number.isFinite(Number(profile.slope))&&Math.abs(Number(profile.slope))>=0.002){
    return actual+Number(profile.slope)*(applied-current);
  }
  return positive(actual,current,applied)?actual*current/applied:result.targetBW;
}
function renderRecommendationDecision(result){
  const box=$('recommendation-decision');
  if(!box)return;
  const show=!!(result&&result.suggestAdjustment&&positive(result.suggestedSWrap));
  box.classList.toggle('hidden',!show);
  if(!show)return;
  const predicted=predictBWAfterSWrap(result,result.suggestedSWrap);
  $('decision-swrap').textContent=fmt(result.suggestedSWrap,1);
  $('decision-predicted-bw').textContent=fmt(predicted,3);
  $('decision-confidence').textContent=`${result.learning?.confidence||0}%`;
}
function acceptSWrapRecommendation(){
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
  syncCurrentSWrap(applied,{save:true});
  if($('bw-current-swrap'))$('bw-current-swrap').value=fmt(applied,1);
  if($('recommendation-note'))$('recommendation-note').textContent=`Applied ${fmt(applied,1)}. Waiting for the next completed cut to compare predicted ${fmt(predicted,3)} BW with actual BW.`;
  showToast(`S-Wrap changed to ${fmt(applied,1)}. Viejito is waiting for the next BW to measure its prediction.`);
}
function rejectSWrapRecommendation(){
  savePendingRecommendation(null);
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
    savePendingRecommendation(null);
    showToast(`Viejito learned: predicted ${fmt(pending.predictedBW,3)}, actual ${fmt(finalBW,3)}, error ${error>=0?'+':''}${fmt(error,3)} BW.`);
    return true;
  }catch(_){return false;}
}

function saveLearningResult(){
  if(demoMode())return showToast(state.language==='es'?'Modo Demo: aprendizaje desactivado.':'Demo Mode: learning disabled.');
  const optimization=state.latestOptimization;
  if(!optimization) return showToast(t('invalidNumbers'));
  const appliedSWrap=Number($('applied-swrap').value);
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
  if(!count) return {count:0,correction:0,confidence:0,successRate:0,spread:0,active:false,learnedSuggestion:Math.round(formulaSuggestion)};
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
  return {count,correction:Number(correction.toFixed(1)),confidence,successRate,spread:Number(spread.toFixed(1)),active,minimumRequired:5,learnedSuggestion:Math.round(formulaSuggestion+(active?correction:0))};
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
  return [screen,shift,runSpeed,stored,persisted].find(value=>positive(Number(value)))||null;
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
  const learned=optimizer.learning.active
    ? chatLang(`Viejito used ${optimizer.learning.count} comparable results from this extruder, destination product and mandrel, adjusting the formula by ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} S-Wrap point(s).`,`Viejito usó ${optimizer.learning.count} resultados comparables de este extruder, producto destino y mandrel, ajustando la fórmula ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} punto(s) de S-Wrap.`,`Viejito a utilisé ${optimizer.learning.count} résultats comparables de cette extrudeuse, du produit cible et du mandrin, en corrigeant la formule de ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} point(s).`)
    : chatLang(`Only ${optimizer.learning.count} comparable result(s) are available, so the safe formula is being used until at least 5 are collected.`,`Solo hay ${optimizer.learning.count} resultado(s) comparable(s), así que usaré la fórmula segura hasta reunir al menos 5.`,`Seulement ${optimizer.learning.count} résultat(s) comparable(s), donc la formule sûre est utilisée jusqu’à 5 résultats.`);
  const autoMeta=chatLang(
    `Auto-detected S-Wrap ${fmt(flow.currentSWrap,1)} and last completed average BW ${fmt(actual,3)} (${formatContextAge(contextInfo?.ageMs)}). Formula: ${fmt(optimizer.formulaSuggestion,1)} • Final: ${fmt(optimizer.suggestedSWrap,1)} • Confidence: ${optimizer.learning.confidence}%`,
    `Detecté automáticamente S-Wrap ${fmt(flow.currentSWrap,1)} y el último BW promedio completo ${fmt(actual,3)} (${formatContextAge(contextInfo?.ageMs)}). Fórmula: ${fmt(optimizer.formulaSuggestion,1)} • Final: ${fmt(optimizer.suggestedSWrap,1)} • Confianza: ${optimizer.learning.confidence}%`,
    `S-Wrap ${fmt(flow.currentSWrap,1)} et dernier BW moyen complet ${fmt(actual,3)} détectés automatiquement (${formatContextAge(contextInfo?.ageMs)}). Formule : ${fmt(optimizer.formulaSuggestion,1)} • Final : ${fmt(optimizer.suggestedSWrap,1)} • Confiance : ${optimizer.learning.confidence}%`
  );
  addHistory('Chat S-Wrap',`${flow.product} • Auto BW ${actual} • Target ${flow.target} • ${flow.currentSWrap} → ${optimizer.suggestedSWrap} • ${optimizer.learning.count} learned`);
  return {kind:'result',title:`${chatLang('Change to','Cambiar a','Changer à')} ${flow.product}`,value:fmt(optimizer.suggestedSWrap,1),message:learned,meta:autoMeta,optimizer};
}

function buildChatChangeoverRecommendation(flow,actualBW){
  const target=Number(flow.target),currentSWrap=Number(flow.currentSWrap),actual=Number(actualBW);
  if(!positive(target,currentSWrap,actual)) throw new Error(t('invalidNumbers'));
  const formulaSuggestion=Math.round(currentSWrap*actual/target);
  const context=currentProcessContext();
  const learning=comparableLearningForChat({product:flow.product,target,mandrel:context.mandrel,extruder:context.extruder,formulaSuggestion});
  const suggestedSWrap=learning.active?learning.learnedSuggestion:formulaSuggestion;
  const difference=Number((actual-target).toFixed(2));
  const absoluteDifference=Math.abs(difference);
  const level=absoluteDifference<=.20?'green':absoluteDifference<.30?'yellow':'red';
  const adjustment=Number((suggestedSWrap-currentSWrap).toFixed(1));
  const direction=adjustment<0?'decrease':adjustment>0?'increase':'hold';
  return {actualBW:actual,targetBW:target,difference,absoluteDifference,level,suggestAdjustment:absoluteDifference>.20,currentSWrap,formulaSuggestion,suggestedSWrap,adjustment,direction,learning,greenTolerance:.20,warningTolerance:.30};
}
function handleChangeoverChat(text){
  const request=detectChatChangeover(text);
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
      const learned=optimizer.learning.active
        ? chatLang(`Based on ${optimizer.learning.count} comparable results from this extruder/product context, Viejito adjusted the formula by ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} S-Wrap point(s).`,`Basado en ${optimizer.learning.count} resultados comparables de este extruder/producto, Viejito ajustó la fórmula ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} punto(s) de S-Wrap.`,`D’après ${optimizer.learning.count} résultats comparables, Viejito a corrigé la formule de ${optimizer.learning.correction>0?'+':''}${optimizer.learning.correction} point(s).`)
        : chatLang(`Only ${optimizer.learning.count} comparable result(s) are available; the safe formula is being used until at least 5 are collected.`,`Solo hay ${optimizer.learning.count} resultado(s) comparable(s); usaré la fórmula segura hasta reunir al menos 5.`,`Seulement ${optimizer.learning.count} résultat(s) comparable(s) ; la formule sûre est utilisée jusqu’à 5 résultats.`);
      addHistory('Chat S-Wrap',`${flow.product} • Actual BW ${actual} • Target ${flow.target} • ${flow.currentSWrap} → ${optimizer.suggestedSWrap} • ${optimizer.learning.count} learned`);
      return {kind:'result',title:`${chatLang('Change to','Cambiar a','Changer à')} ${flow.product}`,value:fmt(optimizer.suggestedSWrap,1),message:learned,meta:chatLang(`Formula: ${fmt(optimizer.formulaSuggestion,1)} • Final recommendation: ${fmt(optimizer.suggestedSWrap,1)} • Confidence: ${optimizer.learning.confidence}%`,`Fórmula: ${fmt(optimizer.formulaSuggestion,1)} • Recomendación final: ${fmt(optimizer.suggestedSWrap,1)} • Confianza: ${optimizer.learning.confidence}%`,`Formule : ${fmt(optimizer.formulaSuggestion,1)} • Recommandation finale : ${fmt(optimizer.suggestedSWrap,1)} • Confiance : ${optimizer.learning.confidence}%`),optimizer};
    }catch(error){chatWorkflow=null;saveChatWorkflow();return {kind:'error',message:error.message};}
  }
  return null;
}


function localIntelligenceQuery(text){
  const q=String(text||'').toLowerCase();
  if(/\b(how are we|how is line|status|como vamos|cómo vamos|estado|comment va)\b/.test(q)){
    const ctx=currentProcessContext(),rows=(state.learningEngine.records||[]).filter(r=>Number(r.extruder)===ACTIVE_LINE&&(!ctx.product||normalizeProduct(r.product)===normalizeProduct(ctx.product))).slice(-5);
    const last=state.lastCompletedCut;
    if(!last&&!rows.length)return {kind:'info',title:`Line ${ACTIVE_LINE}`,message:state.language==='es'?'Todavía no tengo suficientes datos reales para evaluar esta línea.':'I do not have enough real data yet to evaluate this line.'};
    const vals=rows.map(r=>Number(r.finalBW)).filter(Number.isFinite),trend=vals.length>=2?vals[vals.length-1]-vals[0]:0;
    const msg=state.language==='es'?`Producto ${ctx.product||'—'}. Último BW ${last?fmt(last.averageBW,3):'—'} a S-Wrap ${last?fmt(last.currentSWrap,1):fmt(state.currentSWrap,1)}. ${vals.length?`Analicé ${vals.length} cortes recientes; cambio neto ${trend>=0?'+':''}${fmt(trend,3)} BW.`:'Aún no hay suficientes cortes comparables.'}`:`Product ${ctx.product||'—'}. Last BW ${last?fmt(last.averageBW,3):'—'} at S-Wrap ${last?fmt(last.currentSWrap,1):fmt(state.currentSWrap,1)}. ${vals.length?`I analyzed ${vals.length} recent comparable cuts; net change ${trend>=0?'+':''}${fmt(trend,3)} BW.`:'Not enough comparable cuts yet.'}`;
    return {kind:'result',title:`Line ${ACTIVE_LINE} Process Analysis`,message:msg};
  }
  if(/\b(last|recent|history|historial|últimos|ultimos)\b/.test(q)&&/\b(roll|rolls|bw|cortes?|history|historial)\b/.test(q)){
    const rows=(state.learningEngine.records||[]).slice(-5).reverse();
    return {kind:'info',title:state.language==='es'?'Últimos datos aprendidos':'Recent learned data',message:rows.length?rows.map(r=>`${r.product}: BW ${fmt(r.finalBW,3)} @ ${fmt(r.appliedSWrap,1)}`).join(' | '):(state.language==='es'?'No hay datos aprendidos para esta línea.':'No learned data for this line.')};
  }
  return null;
}

function interpret(text){
  const intelligence=localIntelligenceQuery(text); if(intelligence)return intelligence;
  const workflowResponse=handleChangeoverChat(text);
  if(workflowResponse) return workflowResponse;
  const mandrel=requestedMandrel(text) || state.context.mandrel || state.mandrel || DEFAULT_MANDREL;
  const smartRequest=parseSmartBWRequest(text);
  if(smartRequest) return handleSmartBW(smartRequest,mandrel);
  const explicit=explicitIntent(text);
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
    requestAnimationFrame(()=>$('chat-input').focus({preventScroll:true}));
  }
}
function toggleChat(){setChatOpen(!$('floating-chat').classList.contains('open'));}
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
  $('optimizer-current-label').textContent=ot('currentSWrap');
  $('optimizer-suggested-label').textContent=ot('suggestedSWrap');
  $('formula-label').textContent=ot('formulaSuggestion');
  $('learned-label').textContent=ot('learnedSuggestion');
  $('confidence-label').textContent=ot('confidence');
  $('rolls-label').textContent=ot('rollsLearned');
  $('record-result-toggle').textContent=ot('recordResult');
  $('learning-question').textContent=ot('learningQuestion');
  $('applied-swrap-label').textContent=ot('appliedSWrap');
  $('final-bw-label').textContent=ot('finalBW');
  $('save-learning').textContent=ot('saveLearn');
  $('cancel-learning').textContent=ot('cancel');
  $('machine-learning-title').textContent=ot('machineLearning');
  $('clear-learning').textContent=ot('resetLearning');
  $('dashboard-rolls-label').textContent=ot('rollsLearned');
  $('dashboard-correction-label').textContent=ot('averageCorrection');
  $('dashboard-success-label').textContent=ot('successRate');
  $('dashboard-confidence-label').textContent=ot('confidence');
  $('learning-note').textContent=ot('deviceOnly');
  $('too-light-label').textContent=ot('tooLight');
  $('too-heavy-label').textContent=ot('tooHeavy');
  renderPendingCut();
  renderDemoModeBanner();
  if(state.latestOptimization)renderRecommendationDecision(state.latestOptimization);
  if(typeof renderShiftPanel==='function') renderShiftPanel();
  updateMetaText();
  updateConnection();
  renderHistory();
  if(announce){
    $('chat-log').innerHTML='';
    bubble('bot',{title:t('introTitle'),message:t('intro')});
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
    en:{start:'Start shift',change:'Changeover',title:'Select sheet type',hint:'Type 8.6 to show only 8.6 sheet types.',target:'Target BW updates automatically',swrap:'Current S-Wrap',extruder:'Select extruder',confirmStart:'Start shift',confirmChange:'Start changeover',cancel:'Cancel'},
    es:{start:'Empezar turno',change:'Cambio de producto',title:'Selecciona el sheet type',hint:'Escribe 8.6 para mostrar solamente los sheet types 8.6.',target:'El Target BW cambia automáticamente',swrap:'S-Wrap actual',extruder:'Selecciona el extruder',confirmStart:'Empezar turno',confirmChange:'Iniciar cambio',cancel:'Cancelar'},
    fr:{start:'Démarrer le quart',change:'Changement de produit',title:'Sélectionnez le type de feuille',hint:'Tapez 8.6 pour afficher uniquement les types 8.6.',target:'Le BW cible est mis à jour automatiquement',swrap:'S-Wrap actuel',extruder:'Sélectionnez l’extrudeuse',confirmStart:'Démarrer',confirmChange:'Changer',cancel:'Annuler'}
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
  const formula=positive(referenceBW,currentSWrap,newTarget)?currentSWrap*referenceBW/newTarget:currentSWrap;
  let recommendation=formula,weight=0;
  if(profile.count>=5&&positive(profile.recommendedSWrap)){
    weight=Math.min(.65,Math.max(.15,(profile.confidence||0)/140));
    recommendation=formula*(1-weight)+Number(profile.recommendedSWrap)*weight;
  }
  return {profile,referenceBW,currentSWrap,formula:Math.round(formula),recommendation:Math.round(recommendation),historyWeight:weight};
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
  box.innerHTML=`<strong>${title}</strong><div class="job-history-grid"><span>Rolls <b>${p.count}</b></span><span>Typical S-Wrap <b>${p.typicalSWrap??'—'}</b></span><span>BW variation <b>${variation}</b></span><span>Confidence <b>${p.confidence}%</b></span><span class="job-effect">Learned effect <b>${effect}</b></span></div><p>Math ${result.formula} → <b>Recommended start ${result.recommendation}</b></p>`;
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
      if($('changeover-auto-note'))$('changeover-auto-note').textContent=recommendation.profile.count>=5
        ? `Formula ${recommendation.formula} + Line ${ACTIVE_LINE} history (${recommendation.profile.count} comparable rolls, ${recommendation.profile.confidence}% confidence).`
        : `Formula uses last actual BW ${fmt(recommendation.referenceBW,3)} at S-Wrap ${fmt(recommendation.currentSWrap,1)}.`;
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
function renderShiftPanel(){
  if($('active-line-label'))$('active-line-label').textContent=`LINE ${ACTIVE_LINE}`;
  const panel=$('shift-control-panel'),active=!!state.activeShift;
  panel?.classList.toggle('active',active);
  $('running-swrap')?.classList.toggle('running',active);
  $('running-swrap')?.classList.toggle('stopped',!active);
  $('shift-status-title').innerHTML=active?`<span class="shift-title-prefix">${shiftText('active')}</span><span class="shift-title-line">LINE ${ACTIVE_LINE}</span><span class="shift-title-date">${state.activeShift.name||'—'}</span>`:shiftText('inactive');
  $('shift-status-meta').textContent=active?`${state.activeShift.product} • Target ${fmt(targetFromProduct(state.activeShift.product)||state.targetBW)} • ${state.activeShift.startedAt.slice(0,10)} • S-Wrap ${fmt(state.currentSWrap,1)}`:shiftText('inactiveMeta');
  $('start-shift').querySelector('strong').textContent=shiftText('start');
  $('change-product').querySelector('strong').textContent=shiftText('change');
  $('end-shift').querySelector('strong').textContent=shiftText('end');
  $('change-product').disabled=!active;
  $('end-shift').disabled=!active;
  $('start-shift').disabled=active;
  if($('change-line-button'))$('change-line-button').textContent=scopy('changeLine');
  if($('settings-open')?.querySelector('strong'))$('settings-open').querySelector('strong').textContent=scopy('settings');
  renderProductionDashboard();
}
function clearPendingCutForRun(){
  pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null};
  renderPendingCut();
}
function commitStartShift(product,extruder=selectedExtruder,dialogSWrap=null){
  const name=new Date().toLocaleDateString();
  product=normalizeProduct(product);
  if(!product)return showToast(shiftText('needProduct'));
  const target=syncTargetFromProduct(product);
  const swrap=Number(dialogSWrap ?? $('bw-current-swrap').value ?? state.currentSWrap);
  if(!positive(target,swrap))return showToast(t('invalidNumbers'));
  extruder=ACTIVE_LINE;
  const now=new Date().toISOString();
  state.activeShift={id:newId('shift'),name,extruder,startedAt:now,product,runId:newId('run'),runs:[{id:null,extruder,product,targetBW:target,swrap,startedAt:now,materialLbs:0,cutCount:0}]};
  state.activeShift.runs[0].id=state.activeShift.runId;
  $('bw-product').value=product; $('bw-target').value=String(target); $('bw-current-swrap').value=fmt(swrap,1);
  state.product=product; saveOptimizerSettings(target,swrap); clearPendingCutForRun(); saveShift(); saveSession();
  renderShiftPanel(); renderTrendPanel(analyzeTrend()); renderLearningDashboard(); showToast(shiftText('started',{product,extruder}));
  closeProductDialog();
}
function startShift(){ openProductDialog('start'); }
function commitProductChange(product,dialogSWrap=null){
  if(!state.activeShift)return commitStartShift(product,selectedExtruder,dialogSWrap);
  if((Number.isFinite(pendingCut.winder1)||Number.isFinite(pendingCut.winder2))&&!confirm(shiftText('pendingDiscard')))return false;
  product=normalizeProduct(product);
  if(!product)return false;
  const old=state.activeShift.product;
  const target=syncTargetFromProduct(product);
  if(!target)return showToast(shiftText('needProduct'));
  const swrap=Number(dialogSWrap ?? $('bw-current-swrap').value ?? state.currentSWrap);
  if(!positive(swrap)) return showToast(t('invalidNumbers'));
  $('bw-current-swrap').value=fmt(swrap,1); state.currentSWrap=swrap;
  if(product===old){$('bw-product').value=product;saveOptimizerSettings(target,swrap);renderShiftPanel();closeProductDialog();return true;}
  const currentRun=state.activeShift.runs.find(r=>r.id===state.activeShift.runId);if(currentRun)currentRun.endedAt=new Date().toISOString();
  const run={id:newId('run'),extruder:state.activeShift.extruder,product,targetBW:target,swrap,startedAt:new Date().toISOString(),materialLbs:0,cutCount:0};
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
  const currentRun=state.activeShift.runs.find(r=>r.id===state.activeShift.runId);if(currentRun)currentRun.endedAt=new Date().toISOString();
  const completed={...state.activeShift,endedAt:new Date().toISOString(),cuts:state.bwTrendHistory.filter(x=>x.shiftId===state.activeShift.id).length};
  state.shiftArchive.push(completed);state.activeShift=null;clearPendingCutForRun();saveShift();saveSession();renderShiftPanel();renderTrendPanel(analyzeTrend());showToast(shiftText('ended'));
}

const SESSION_FIELDS=['bw-weight','bw-length','bw2-weight','bw2-length','bw-product','bw-target','bw-current-swrap','ft-bw','ft-weight','sw-current','sw-speed','sw-target'];
let pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null};
function safeJSON(value,fallback){try{return JSON.parse(value)||fallback;}catch{return fallback;}}
function saveSession(){
  const fields={}; SESSION_FIELDS.forEach(id=>{const el=$(id);if(el)fields[id]=el.value;});
  lineSet(SESSION_KEY,JSON.stringify({fields,pendingCut,mandrel:state.mandrel,updatedAt:Date.now()}));
}
function restoreSession(){
  const saved=safeJSON(lineGet(SESSION_KEY),{});
  Object.entries(saved.fields||{}).forEach(([id,value])=>{const el=$(id);if(el&&value!==undefined)el.value=value;});
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
  if(state.language==='es') return 'Completar corte / Calcular promedio';
  if(state.language==='fr') return 'Terminer la coupe / Calculer la moyenne';
  return 'Complete cut / Calculate average';
}
function waitingSecondMessage(){
  if(state.language==='es') return 'Winder guardado. Esperando el otro winder; todavía no se registra tendencia ni se da sugerencia.';
  if(state.language==='fr') return "Winder enregistré. En attente de l’autre winder; aucune tendance ni suggestion pour le moment.";
  return 'Winder saved. Waiting for the other winder; no trend or recommendation is recorded yet.';
}
function individualWinderStatus(value){
  if(!Number.isFinite(value)) return {level:'idle',label:'',difference:null};
  const target=Number($('bw-target')?.value||state.targetBW);
  if(!positive(target)) return {level:'idle',label:'',difference:null};
  const difference=Math.abs(value-target);
  if(difference<=0.17) return {level:'green',label:state.language==='es'?'EN OBJETIVO':state.language==='fr'?'DANS LA CIBLE':'ON TARGET',difference};
  if(difference<0.30) return {level:'yellow',label:state.language==='es'?'ADVERTENCIA':state.language==='fr'?'ATTENTION':'WARNING',difference};
  return {level:'red',label:state.language==='es'?'FUERA DE RANGO':state.language==='fr'?'HORS PLAGE':'OUT OF RANGE',difference};
}
function renderWinderSaved(index,value){
  const block=document.querySelector(index===1?'#bw-weight':'#bw2-weight')?.closest('.winder-block');
  const label=$(index===1?'winder1-required':'winder2-optional');
  const valueEl=$(index===1?'winder1-saved-bw':'winder2-saved-bw');
  const stateEl=$(index===1?'winder1-state':'winder2-state');
  const status=individualWinderStatus(value);
  block?.classList.remove('measured','green','yellow','red');
  if(Number.isFinite(value)) block?.classList.add('measured',status.level);
  label.textContent=Number.isFinite(value)?'Saved BW':t('required');
  valueEl.textContent=Number.isFinite(value)?fmt(value):'—';
  valueEl.classList.toggle('visible',Number.isFinite(value));
  stateEl.textContent=Number.isFinite(value)?status.label:'';
}
function renderPendingCut(){
  renderWinderSaved(1,pendingCut.winder1);
  renderWinderSaved(2,pendingCut.winder2);
  $('winder-results').classList.toggle('hidden',!(Number.isFinite(pendingCut.winder1)||Number.isFinite(pendingCut.winder2)));
  $('bw1-result').textContent=Number.isFinite(pendingCut.winder1)?fmt(pendingCut.winder1):'—';
  $('bw2-result').textContent=Number.isFinite(pendingCut.winder2)?fmt(pendingCut.winder2):'—';
}
function calculateSingleWinder(index){
  const weight=Number($(index===1?'bw-weight':'bw2-weight').value);
  const length=Number($(index===1?'bw-length':'bw2-length').value);
  const mandrel=currentMandrel('bw');
  const result=calculateBW(weight,length,mandrel);
  pendingCut[`winder${index}`]=result; pendingCut[`winder${index}Input`]={weight,length}; pendingCut.mandrel=mandrel;
  $('bw-result').textContent=fmt(result);
  $('bw-meta').textContent=`${t(index===1?'winder1':'winder2')} • ${mandrel}” • ${state.language==='es'?'resultado provisional':state.language==='fr'?'résultat provisoire':'provisional result'}`;
  $('optimizer-panel').classList.add('hidden');
  renderPendingCut(); saveSession(); showToast(waitingSecondMessage());
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
  const dieBalance=renderDieMoveAlert(pair.winder1,pair.winder2);
  renderOptimizerPanel(optimizer); renderTrendPanel(trend);
  addHistory('BW',`${t('winder1')} ${fmt(pair.winder1)} + ${t('winder2')} ${fmt(pair.winder2)} → Avg ${fmt(average)} • Target ${fmt(target)} • S-Wrap ${fmt(currentSWrap,1)} • ${optimizer.level.toUpperCase()} • ${pendingCut.mandrel||48}”`);
  const processContext=currentProcessContext();
  state.lastCompletedCut={averageBW:average,winder1:pair.winder1,winder2:pair.winder2,targetBW:target,currentSWrap,product:processContext.product,mandrel:pendingCut.mandrel||currentMandrel('bw'),extruder:processContext.extruder,shiftId:processContext.shiftId,runId:processContext.runId,time:new Date().toISOString()};
  if(!demoMode()){
    lineSet(LAST_COMPLETED_CUT_KEY,JSON.stringify(state.lastCompletedCut));
    const learnedPrediction=learnFromPendingRecommendation(average,pair,processContext);
    if(!learnedPrediction)state.learningEngine.addObservation({targetBW:target,appliedSWrap:currentSWrap,finalBW:average,...processContext,winder1:pair.winder1,winder2:pair.winder2});
    recordProductionMaterial(pendingCut.winder1Input?.weight,pendingCut.winder2Input?.weight);
  }
  renderLearningDashboard();
  pendingCut={winder1:null,winder2:null,mandrel:null,winder1Input:null,winder2Input:null}; saveSession(); renderPendingCut();
}


function syncCurrentSWrap(value,{save=true}={}){
  const swrap=Number(value);
  if(!positive(swrap)) return false;
  state.currentSWrap=swrap;
  if(state.activeShift){
    state.activeShift.currentSWrap=swrap;
    const run=state.activeShift.runs?.find(item=>item.id===state.activeShift.runId);
    if(run) run.swrap=swrap;
    if(save) saveShift();
  }
  if(save){ saveOptimizerSettings(Number($('bw-target').value||state.targetBW),swrap); saveSession(); }
  renderShiftPanel();
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
  en:{settings:'Settings',languageK:'LANGUAGE',language:'Application language',appearanceK:'APPEARANCE',appearance:'Display mode',personalityK:'CHAT PERSONALITY',personality:'Sarcasm',bwK:'BASIS WEIGHT',bw:'BW calculation factor',bwHelp:'450 matches the current plant system. 453.59237 uses the exact lb-to-gram conversion. BW and Feet use the selected factor automatically.',save:'Save Changes',saveNote:'Changes are applied only after Save Changes.',saved:'Settings saved.',changeLine:'Change line',demoK:'DEMO / TRAINING',demo:'Demo Mode — Do Not Learn',demoHelp:'Use fake values without adding them to production history, trends, learning, or production totals.',learningK:'LEARNING DATA',learning:'Learning Data Manager',learningHelp:'Review recent learning records for this line and remove incorrect test data.'},
  es:{settings:'Ajustes',languageK:'IDIOMA',language:'Idioma de la aplicación',appearanceK:'APARIENCIA',appearance:'Modo de pantalla',personalityK:'PERSONALIDAD DEL CHAT',personality:'Sarcasmo',bwK:'BASIS WEIGHT',bw:'Factor de cálculo BW',bwHelp:'450 coincide con el sistema actual de la planta. 453.59237 usa la conversión exacta de libras a gramos. BW y Feet usan automáticamente el factor seleccionado.',save:'Guardar cambios',saveNote:'Los cambios se aplican solamente después de Guardar cambios.',saved:'Ajustes guardados.',changeLine:'Cambiar línea',demoK:'DEMO / ENTRENAMIENTO',demo:'Modo Demo — No aprender',demoHelp:'Usa valores falsos sin agregarlos al historial, tendencias, aprendizaje ni totales reales de producción.',learningK:'DATOS DE APRENDIZAJE',learning:'Administrador de aprendizaje',learningHelp:'Revisa los registros recientes de esta línea y elimina datos de prueba incorrectos.'},
  fr:{settings:'Réglages',languageK:'LANGUE',language:"Langue de l’application",appearanceK:'APPARENCE',appearance:"Mode d’affichage",personalityK:'PERSONNALITÉ DU CHAT',personality:'Sarcasme',bwK:'BASIS WEIGHT',bw:'Facteur de calcul BW',bwHelp:'450 correspond au système actuel de l’usine. 453.59237 utilise la conversion exacte livre-gramme. BW et Feet utilisent automatiquement le facteur sélectionné.',save:'Enregistrer',saveNote:'Les modifications sont appliquées uniquement après Enregistrer.',saved:'Réglages enregistrés.',changeLine:'Changer de ligne',demoK:'DÉMO / FORMATION',demo:'Mode Démo — Ne pas apprendre',demoHelp:'Utilisez des valeurs fictives sans les ajouter à l’historique, aux tendances, à l’apprentissage ou aux totaux de production.',learningK:'DONNÉES D’APPRENTISSAGE',learning:'Gestion des données d’apprentissage',learningHelp:'Consultez les données récentes de cette ligne et supprimez les données de test incorrectes.'}
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
  localStorage.setItem('viejitoLanguage',language);
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
  b.textContent=state.language==='es'?'MODO DEMO — APRENDIZAJE Y DATOS DE PRODUCCIÓN DESACTIVADOS':state.language==='fr'?'MODE DÉMO — APPRENTISSAGE ET DONNÉES DE PRODUCTION DÉSACTIVÉS':'DEMO MODE — LEARNING & PRODUCTION DATA DISABLED';
}

function chatMemoryMode(){return $('chat-memory-select')?.value||localStorage.getItem(CHAT_MEMORY_MODE_KEY)||'off';}
function saveChatMessage(role,content){
  if(chatMemoryMode()!=='separate') return;
  const key=lineKey(CHAT_HISTORY_KEY);
  let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]');}catch(_){items=[];}
  items.push({role,content,time:new Date().toISOString()});
  localStorage.setItem(key,JSON.stringify(items.slice(-80)));
}
function restoreChatMessages(){
  if(chatMemoryMode()!=='separate') return false;
  let items=[];try{items=JSON.parse(localStorage.getItem(lineKey(CHAT_HISTORY_KEY))||'[]');}catch(_){return false;}
  if(!items.length)return false;
  $('chat-log').innerHTML='';items.forEach(item=>bubble(item.role,item.content));return true;
}

function persistLineOperationalState(){
  if(demoMode()) return true;
  try{
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
    saveShift();
    saveSession();
    return true;
  }catch(error){
    console.error('Unable to persist line state',error);
    return false;
  }
}

function switchLine(line){
  line=Number(line);if(![1,2,3,4].includes(line))return;
  persistLineOperationalState();
  localStorage.setItem(ACTIVE_LINE_KEY,String(line));
  localStorage.setItem('viejitoLastViewedLineV1',String(line));
  sessionStorage.setItem('viejitoLineChosenSession','1');
  location.reload();
}
function openLinePicker(){const d=$('line-picker-dialog');if(d){d.classList.remove('hidden');d.setAttribute('aria-hidden','false');}}
function closeLinePicker(){const d=$('line-picker-dialog');if(d){d.classList.add('hidden');d.setAttribute('aria-hidden','true');}}

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
    inChatQuery=false;
    if(response?.kind==='result' && !response.sarcasm && (state.personality==='light' || state.personality==='heavy')){
      response.sarcasm=getSarcasmLine();
    }
    bubble('bot',response);
    saveChatMessage('bot',response);
  },120);
});
document.querySelectorAll('.example').forEach(button=>button.addEventListener('click',()=>{$('chat-input').value=button.dataset.example;$('chat-form').requestSubmit();}));
document.querySelectorAll('.quick-card').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
$('chat-fab').addEventListener('click',toggleChat);
$('chat-close').addEventListener('click',()=>setChatOpen(false));
$('chat-backdrop').addEventListener('click',()=>setChatOpen(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setChatOpen(false);});
document.querySelectorAll('.mandrel').forEach(button=>button.addEventListener('click',()=>selectMandrel(button.dataset.target,Number(button.dataset.value))));
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
$('ft-calc').addEventListener('click',()=>{try{const bw=Number($('ft-bw').value),w=Number($('ft-weight').value),m=currentMandrel('ft'),r=calculateFT(bw,w,m);$('ft-result').textContent=`${fmt(r,0)} ft`;$('ft-meta').textContent=m===48?t('defaultMandrel',{m}):t('mandrelOnly',{m});addHistory('FT',`${fmt(r,0)} ft • BW ${bw} / ${w} lb • ${m}”`);}catch(e){showToast(e.message);}});
$('sw-calc').addEventListener('click',()=>{try{const a=Number($('sw-current').value),s=Number($('sw-speed').value),target=Number($('sw-target').value),r=calculateSWrap(a,s,target);$('sw-result').textContent=fmt(r,1);addHistory('S-Wrap',`${fmt(r,1)} speed • ${a} × ${s} ÷ ${target}`);}catch(e){showToast(e.message);}});

$('record-result-toggle').addEventListener('click',()=>{$('learning-form').classList.toggle('hidden');});
$('cancel-learning').addEventListener('click',()=>{$('learning-form').classList.add('hidden');});
$('save-learning').addEventListener('click',saveLearningResult);
$('clear-learning').addEventListener('click',()=>{state.learningEngine.clear();renderLearningDashboard();showToast(ot('resetDone'));});
$('clear-trend').addEventListener('click',()=>{state.bwTrendHistory=[];lineRemove(TREND_HISTORY_KEY);renderTrendPanel(analyzeTrend());showToast(ot('trendCleared'));});
$('clear-history').addEventListener('click',()=>{state.history=[];lineRemove('viejitoHistory');renderHistory();showToast(t('historyCleared'));});
$('production-target')?.addEventListener('click',openProductionDialog);
$('production-summary-toggle')?.addEventListener('click',openProductionDialog);
$('production-dialog-close')?.addEventListener('click',closeProductionDialog);
$('production-dialog')?.addEventListener('click',event=>{if(event.target===$('production-dialog'))closeProductionDialog();});
$('target-lbs-hour')?.addEventListener('input',updateProductionTargetPreview);
$('target-shift-hours')?.addEventListener('input',updateProductionTargetPreview);
$('save-production-target')?.addEventListener('click',saveCurrentProductionTarget);
setInterval(()=>{if(state.activeShift)renderProductionDashboard();},30000);
$('start-shift').addEventListener('click',startShift);
$('change-product').addEventListener('click',()=>changeProduct());
$('end-shift').addEventListener('click',endShift);
let confirmedProduct=String(state.activeShift?.product||state.product||'').toUpperCase();
$('bw-product').addEventListener('focus',()=>{confirmedProduct=String(state.activeShift?.product||$('bw-product').value||'').toUpperCase();});
$('bw-product').addEventListener('blur',()=>{
  const next=String($('bw-product').value||'').trim().toUpperCase();
  if(state.activeShift&&next&&next!==state.activeShift.product){
    if(confirm(shiftText('confirmChange',{old:state.activeShift.product,next}))) changeProduct(next);
    else $('bw-product').value=state.activeShift.product;
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
  if(productDialogMode==='start')commitStartShift(product,selectedExtruder,swrap);else commitProductChange(product,swrap);
});
$('bw-product').addEventListener('input',()=>{syncTargetFromProduct($('bw-product').value);saveSession();});
$('bw-current-swrap').addEventListener('input',()=>syncCurrentSWrap($('bw-current-swrap').value));
$('theme-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('viejitoTheme',document.documentElement.classList.contains('light')?'light':'dark');});
window.addEventListener('online',updateConnection);
window.addEventListener('offline',updateConnection);
SESSION_FIELDS.forEach(id=>$(id)?.addEventListener('input',saveSession));
$('bw-target')?.addEventListener('input',renderPendingCut);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSession();});
window.addEventListener('pagehide',saveSession);

document.querySelectorAll('[data-line-select]').forEach(button=>button.addEventListener('click',()=>switchLine(button.dataset.lineSelect)));
$('change-line-button')?.addEventListener('click',openLinePicker);
$('line-picker-close')?.addEventListener('click',closeLinePicker);
$('chat-memory-select')?.addEventListener('change',event=>{localStorage.setItem(CHAT_MEMORY_MODE_KEY,event.target.value);if(event.target.value!=='separate'){$('chat-log').innerHTML='';bubble('bot',{title:t('introTitle'),message:t('intro')});}else restoreChatMessages();});
if($('chat-memory-select'))$('chat-memory-select').value=localStorage.getItem(CHAT_MEMORY_MODE_KEY)||'off';
if(!localStorage.getItem(ACTIVE_LINE_KEY)){
  openLinePicker();
}else{
  sessionStorage.setItem('viejitoLineChosenSession','1');
}

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
  const activeRun=state.activeShift.runs?.find(r=>r.id===state.activeShift.runId);
  const restoredSWrap=Number(state.activeShift.currentSWrap||activeRun?.swrap||state.currentSWrap);
  const restoredTarget=Number(activeRun?.targetBW||targetFromProduct(state.activeShift.product)||state.targetBW);
  if(positive(restoredSWrap))state.currentSWrap=restoredSWrap;
  if(positive(restoredTarget))state.targetBW=restoredTarget;
  $('bw-product').value=state.product;
  $('bw-target').value=fmt(state.targetBW);
  $('bw-current-swrap').value=fmt(state.currentSWrap,1);
  lineSet('viejitoProduct',state.product);
  lineSet('viejitoTargetBW',String(state.targetBW));
  lineSet('viejitoCurrentSWrap',String(state.currentSWrap));
}
applyLanguage(state.language);
renderDemoModeBanner();
renderShiftPanel();
renderHistory();
renderLearningDashboard();
renderTrendPanel(analyzeTrend());
if(!restoreChatMessages()) bubble('bot',{title:t('introTitle'),message:t('intro')});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js?v=5.14.0',{updateViaCache:'none'});
      await registration.update();
    }catch(error){
      console.error(error);
    }
  });
}
