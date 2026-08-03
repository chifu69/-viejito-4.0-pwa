const FACTOR_GRAMS_PER_LB = 453.59237;
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
    introTitle: 'Industrial IA 5.6',
    intro: 'Ready. Without commands: two numbers calculate BW using the 48” mandrel; 15 through 230 is interpreted as S-Wrap Speed; more than 230 is interpreted as FT. You can force BW, FT or S-Wrap by typing it.',
    footer: 'Industrial IA 5.6 • Plant Assistant'
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
    introTitle: 'Industrial IA 5.6',
    intro: 'Listo. Sin comandos: dos números calculan BW con mandrel 48”; de 15 a 230 interpreto S-Wrap Speed; más de 230 interpreto FT. Puedes forzar BW, FT o S-Wrap escribiéndolo.',
    footer: 'Industrial IA 5.6 • Asistente de planta'
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
    introTitle: 'Industrial IA 5.6',
    intro: 'Prêt. Sans commande : deux nombres calculent BW avec le mandrin de 48”; de 15 à 230 est interprété comme la vitesse S-Wrap; plus de 230 est interprété comme FT. Vous pouvez forcer BW, FT ou S-Wrap en l’écrivant.',
    footer: 'Industrial IA 5.6 • Assistant industriel'
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
  history: JSON.parse(localStorage.getItem('viejitoHistory') || '[]'),
  targetBW: Number(localStorage.getItem('viejitoTargetBW')) || DEFAULT_TARGET_BW,
  currentSWrap: Number(localStorage.getItem('viejitoCurrentSWrap')) || DEFAULT_CURRENT_SWRAP,
  product: localStorage.getItem('viejitoProduct') || '',
  activeShift: JSON.parse(localStorage.getItem(SHIFT_KEY) || 'null'),
  shiftArchive: JSON.parse(localStorage.getItem(SHIFT_ARCHIVE_KEY) || '[]'),
  latestOptimization: null,
  bwTrendHistory: JSON.parse(localStorage.getItem(TREND_HISTORY_KEY) || '[]'),
  latestTrend: null,
  lastCompletedCut: JSON.parse(localStorage.getItem(LAST_COMPLETED_CUT_KEY) || 'null'),
  learningEngine: new AdaptiveLearningEngine()
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
    greenMessage:'Within ±0.20. No adjustment needed.', yellowMessage:'Between 0.20 and 0.30 from target. Warning — watch the next cut and prepare an S-Wrap correction.',
    redMessage:'Adjust the S-Wrap now.', noChange:'Keep S-Wrap at {speed}. No change recommended.',
    decrease:'Decrease S-Wrap by {amount}, from {current} to {suggested}.', increase:'Increase S-Wrap by {amount}, from {current} to {suggested}.',
    hold:'Keep S-Wrap at {speed}.', smartMeta:'Target {target} • Current S-Wrap {speed}', formulaSuggestion:'Formula suggestion', learnedSuggestion:'Learned suggestion', confidence:'Confidence', rollsLearned:'Rolls learned', recordResult:'Record actual result', learningQuestion:'After making the change, enter the S-Wrap you used and the final BW.', appliedSWrap:'Applied S-Wrap', finalBW:'Final BW', saveLearn:'Save and learn', cancel:'Cancel', learningSaved:'Result saved. Viejito learned from this roll.', machineLearning:'Machine learning', resetLearning:'Reset learning', averageCorrection:'Average correction', successRate:'Success rate', deviceOnly:'Learning is stored only on this device.', resetDone:'Machine learning was reset.', trendPredictor:'Trend Predictor', trendWaiting:'Add {remaining} more BW roll(s) to activate the prediction.', trendStable:'The last 5 rolls are stable. No preventive change is recommended.', trendUp:'BW is increasing by about {slope} per roll. The next roll is projected at {projected}. Lower S-Wrap by {amount} points now, from {current} to {suggested}.', trendDown:'BW is decreasing by about {slope} per roll. The next roll is projected at {projected}. Raise S-Wrap by {amount} points now, from {current} to {suggested}.', trendProjected:'Projected next BW', trendDirection:'Direction', trendConsistency:'Consistency', trendRolls:'Last rolls', trendClear:'Clear trend', trendCleared:'BW trend history cleared.', trendUpLabel:'Increasing', trendDownLabel:'Decreasing', trendStableLabel:'Stable'
  },
  es: {
    targetBW:'BW objetivo', currentSWrap:'S-Wrap actual', difference:'Diferencia', suggestedSWrap:'S-Wrap sugerido',
    tooLight:'Muy liviano', tooHeavy:'Muy pesado', greenStatus:'DENTRO DEL OBJETIVO', yellowStatus:'CERCA DEL LÍMITE', redStatus:'FUERA DE RANGO',
    greenMessage:'Dentro de ±0.20. No se necesita ajuste.', yellowMessage:'Entre 0.20 y menos de 0.30 del objetivo. ADVERTENCIA: vigila el próximo corte y prepárate para corregir el S-Wrap.',
    redMessage:'FUERA DE RANGO. Ajusta el S-Wrap ahora.', noChange:'Mantén el S-Wrap en {speed}. No se recomienda cambio.',
    decrease:'Baja el S-Wrap {amount}, de {current} a {suggested}.', increase:'Sube el S-Wrap {amount}, de {current} a {suggested}.',
    hold:'Mantén el S-Wrap en {speed}.', smartMeta:'Objetivo {target} • S-Wrap actual {speed}', formulaSuggestion:'Sugerencia por fórmula', learnedSuggestion:'Sugerencia aprendida', confidence:'Confianza', rollsLearned:'Rollos aprendidos', recordResult:'Registrar resultado real', learningQuestion:'Después del cambio, escribe el S-Wrap que usaste y el BW final.', appliedSWrap:'S-Wrap aplicado', finalBW:'BW final', saveLearn:'Guardar y aprender', cancel:'Cancelar', learningSaved:'Resultado guardado. Viejito aprendió de este rollo.', machineLearning:'Aprendizaje de la máquina', resetLearning:'Borrar aprendizaje', averageCorrection:'Corrección promedio', successRate:'Porcentaje de éxito', deviceOnly:'El aprendizaje se guarda solamente en este dispositivo.', resetDone:'Se borró el aprendizaje de la máquina.', trendPredictor:'Predictor de tendencia', trendWaiting:'Agrega {remaining} rollo(s) de BW para activar la predicción.', trendStable:'Los últimos 5 rollos están estables. No se recomienda ningún cambio preventivo.', trendUp:'El BW está aumentando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Baja el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendDown:'El BW está bajando aproximadamente {slope} por rollo. El siguiente se proyecta en {projected}. Sube el S-Wrap {amount} puntos ahora, de {current} a {suggested}.', trendProjected:'Próximo BW proyectado', trendDirection:'Dirección', trendConsistency:'Consistencia', trendRolls:'Últimos rollos', trendClear:'Borrar tendencia', trendCleared:'Se borró el historial de tendencia de BW.', trendUpLabel:'Aumentando', trendDownLabel:'Bajando', trendStableLabel:'Estable'
  },
  fr: {
    targetBW:'BW cible', currentSWrap:'S-Wrap actuel', difference:'Différence', suggestedSWrap:'S-Wrap suggéré',
    tooLight:'Trop léger', tooHeavy:'Trop lourd', greenStatus:'DANS LA CIBLE', yellowStatus:'PRÈS DE LA LIMITE', redStatus:'HORS PLAGE',
    greenMessage:'Dans ±0,20. Aucun réglage nécessaire.', yellowMessage:'Entre 0,20 et moins de 0,30 de la cible. Attention : surveillez la prochaine coupe et préparez une correction du S-Wrap.',
    redMessage:'Modifiez le S-Wrap maintenant.', noChange:'Gardez le S-Wrap à {speed}. Aucun changement recommandé.',
    decrease:'Réduisez le S-Wrap de {amount}, de {current} à {suggested}.', increase:'Augmentez le S-Wrap de {amount}, de {current} à {suggested}.',
    hold:'Gardez le S-Wrap à {speed}.', smartMeta:'Cible {target} • S-Wrap actuel {speed}', formulaSuggestion:'Suggestion par formule', learnedSuggestion:'Suggestion apprise', confidence:'Confiance', rollsLearned:'Rouleaux appris', recordResult:'Enregistrer le résultat réel', learningQuestion:'Après le changement, saisissez le S-Wrap utilisé et le BW final.', appliedSWrap:'S-Wrap appliqué', finalBW:'BW final', saveLearn:'Enregistrer et apprendre', cancel:'Annuler', learningSaved:'Résultat enregistré. Viejito a appris de ce rouleau.', machineLearning:'Apprentissage machine', resetLearning:'Réinitialiser', averageCorrection:'Correction moyenne', successRate:'Taux de réussite', deviceOnly:'Les données restent uniquement sur cet appareil.', resetDone:'Apprentissage réinitialisé.', trendPredictor:'Prédicteur de tendance', trendWaiting:'Ajoutez encore {remaining} rouleau(x) BW pour activer la prévision.', trendStable:'Les 5 derniers rouleaux sont stables. Aucun changement préventif recommandé.', trendUp:'Le BW augmente d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Réduisez le S-Wrap de {amount} points, de {current} à {suggested}.', trendDown:'Le BW diminue d’environ {slope} par rouleau. Le prochain est estimé à {projected}. Augmentez le S-Wrap de {amount} points, de {current} à {suggested}.', trendProjected:'Prochain BW estimé', trendDirection:'Direction', trendConsistency:'Cohérence', trendRolls:'Derniers rouleaux', trendClear:'Effacer la tendance', trendCleared:'Historique de tendance BW effacé.', trendUpLabel:'En hausse', trendDownLabel:'En baisse', trendStableLabel:'Stable'
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
  localStorage.setItem('viejitoTargetBW',String(state.targetBW));
  localStorage.setItem('viejitoCurrentSWrap',String(state.currentSWrap));
}
function currentProcessContext(){
  const product=String($('bw-product')?.value||state.activeShift?.product||state.product||'').trim();
  const mandrel=currentMandrel('bw');
  state.product=product;
  localStorage.setItem('viejitoProduct',product);
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
  localStorage.setItem(TREND_HISTORY_KEY,JSON.stringify(state.bwTrendHistory));
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
function saveLearningResult(){
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
let chatWorkflow=(()=>{try{return JSON.parse(localStorage.getItem(CHAT_WORKFLOW_KEY)||'null')||null;}catch(_){return null;}})();
function saveChatWorkflow(){
  if(chatWorkflow) localStorage.setItem(CHAT_WORKFLOW_KEY,JSON.stringify(chatWorkflow));
  else localStorage.removeItem(CHAT_WORKFLOW_KEY);
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
  const persisted=Number(localStorage.getItem('viejitoCurrentSWrap'));
  return [screen,shift,runSpeed,stored,persisted].find(value=>positive(Number(value)))||null;
}

function sharedOperationalContextForChat(){
  // One source of truth shared by the main calculator and the chat.
  const swrap=currentSWrapForChat();
  const completed=latestCompletedBWContext();
  const liveAverage=Number($('bw-result')?.dataset?.averageBw || $('bw-result')?.dataset?.value || 0);
  const savedCut=(()=>{try{return JSON.parse(localStorage.getItem(LAST_COMPLETED_CUT_KEY)||'null');}catch(_){return null;}})();
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

function interpret(text){
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
  $('hero-eyebrow').textContent=t('plantMode');
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
  $('footer-text').textContent='Industrial IA 5.1 • Extruder Learning Engine';
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
  if(save) localStorage.setItem('viejitoTargetBW',String(target));
  return target;
}
let productDialogMode='change';
let selectedExtruder=1;
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
function updateProductDialogPreview(){
  const value=$('product-search')?.value||'';
  const target=targetFromProduct(value);
  $('product-target-preview').textContent=target?String(target):'—';
  renderProductChoices(value);
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
  picker?.classList.toggle('hidden',mode!=='start');
  if($('extruder-picker-label')) $('extruder-picker-label').textContent=productDialogText('extruder');
  selectedExtruder=Number(state.activeShift?.extruder)||selectedExtruder||1;
  document.querySelectorAll('.extruder-option').forEach(button=>button.classList.toggle('selected',Number(button.dataset.extruder)===selectedExtruder));
  $('product-search').value=mode==='start'?($('bw-product').value||state.product||''):'';
  if($('product-swrap')) $('product-swrap').value=fmt(Number($('bw-current-swrap').value||state.currentSWrap||180),1);
  updateProductDialogPreview();
  dialog.classList.remove('hidden'); dialog.setAttribute('aria-hidden','false');
  setTimeout(()=>$('product-search').focus(),50);
}
function closeProductDialog(){
  const dialog=$('product-dialog'); dialog.classList.add('hidden'); dialog.setAttribute('aria-hidden','true');
}

const SESSION_KEY='viejitoSessionV50';
function shiftText(key,vars={}){
  const text={
    en:{inactive:'No active shift',inactiveMeta:'Start a shift to separate products and predictions.',active:'Shift active',start:'Start shift',change:'Changeover',end:'End of shift',productPrompt:'Product running now:',targetPrompt:'Target BW:',swrapPrompt:'Current S-Wrap:',started:'Shift started on Extruder {extruder} for {product}.',changed:'Product changed to {product}. Same shift, new prediction run.',ended:'Shift ended. Learning was saved.',needProduct:'Enter a product first.',confirmChange:'Product changed from {old} to {next}. Start a new product run in the same shift?',pendingDiscard:'A winder is pending. Changing product will clear that incomplete cut. Continue?'},
    es:{inactive:'Sin turno activo',inactiveMeta:'Empieza el turno para separar productos y predicciones.',active:'Turno activo',start:'Empezar turno',change:'Cambio de producto',end:'Fin de turno',productPrompt:'Producto que estás corriendo:',targetPrompt:'Target BW:',swrapPrompt:'S-Wrap actual:',started:'Turno iniciado en Extruder {extruder} para {product}.',changed:'Producto cambiado a {product}. Mismo turno, nueva corrida y predicción.',ended:'Turno finalizado. El aprendizaje quedó guardado.',needProduct:'Escribe el producto primero.',confirmChange:'Cambiaste de {old} a {next}. ¿Iniciar una nueva corrida dentro del mismo turno?',pendingDiscard:'Hay un winder pendiente. Cambiar producto borrará ese corte incompleto. ¿Continuar?'},
    fr:{inactive:'Aucun quart actif',inactiveMeta:'Démarrez un quart pour séparer les produits et les prévisions.',active:'Quart actif',start:'Démarrer le quart',change:'Changement de produit',end:'Fin du quart',productPrompt:'Produit en cours :',targetPrompt:'BW cible :',swrapPrompt:'S-Wrap actuel :',started:'Quart démarré sur Extrudeuse {extruder} pour {product}.',changed:'Produit changé pour {product}. Même quart, nouvelle série de prévisions.',ended:'Quart terminé. L’apprentissage a été enregistré.',needProduct:'Entrez d’abord un produit.',confirmChange:'Produit changé de {old} à {next}. Démarrer une nouvelle série dans le même quart ?',pendingDiscard:'Un winder est en attente. Changer de produit effacera cette coupe incomplète. Continuer ?'}
  };
  let value=(text[state.language]||text.en)[key]||key;
  Object.entries(vars).forEach(([k,v])=>value=value.replaceAll(`{${k}}`,v));
  return value;
}
function newId(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}
function saveShift(){
  if(state.activeShift)localStorage.setItem(SHIFT_KEY,JSON.stringify(state.activeShift));
  else localStorage.removeItem(SHIFT_KEY);
  localStorage.setItem(SHIFT_ARCHIVE_KEY,JSON.stringify((state.shiftArchive||[]).slice(-100)));
}
function renderShiftPanel(){
  const panel=$('shift-control-panel'),active=!!state.activeShift;
  panel?.classList.toggle('active',active);
  $('shift-status-title').textContent=active?`${shiftText('active')} • Extruder ${state.activeShift.extruder||'—'} • ${state.activeShift.name||'—'}`:shiftText('inactive');
  $('shift-status-meta').textContent=active?`${state.activeShift.product} • Target ${fmt(targetFromProduct(state.activeShift.product)||state.targetBW)} • ${state.activeShift.startedAt.slice(0,10)} • S-Wrap ${fmt(state.currentSWrap,1)}`:shiftText('inactiveMeta');
  $('start-shift').textContent=shiftText('start');
  $('change-product').textContent=shiftText('change');
  $('end-shift').textContent=shiftText('end');
  $('change-product').disabled=!active;
  $('end-shift').disabled=!active;
  $('start-shift').disabled=active;
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
  extruder=Number(extruder);
  if(![1,2,3,4].includes(extruder)) extruder=1;
  const now=new Date().toISOString();
  state.activeShift={id:newId('shift'),name,extruder,startedAt:now,product,runId:newId('run'),runs:[{id:null,extruder,product,targetBW:target,swrap,startedAt:now}]};
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
  const run={id:newId('run'),extruder:state.activeShift.extruder,product,targetBW:target,swrap,startedAt:new Date().toISOString()};
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
  localStorage.setItem(SESSION_KEY,JSON.stringify({fields,pendingCut,mandrel:state.mandrel,updatedAt:Date.now()}));
}
function restoreSession(){
  const saved=safeJSON(localStorage.getItem(SESSION_KEY),{});
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
  if(difference<=0.20) return {level:'green',label:state.language==='es'?'EN OBJETIVO':state.language==='fr'?'DANS LA CIBLE':'ON TARGET',difference};
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
  $('winder-imbalance').classList.toggle('warning',difference>0.30);
  renderOptimizerPanel(optimizer); renderTrendPanel(trend);
  addHistory('BW',`${t('winder1')} ${fmt(pair.winder1)} + ${t('winder2')} ${fmt(pair.winder2)} → Avg ${fmt(average)} • Target ${fmt(target)} • S-Wrap ${fmt(currentSWrap,1)} • ${optimizer.level.toUpperCase()} • ${pendingCut.mandrel||48}”`);
  const processContext=currentProcessContext();
  state.lastCompletedCut={averageBW:average,winder1:pair.winder1,winder2:pair.winder2,targetBW:target,currentSWrap,product:processContext.product,mandrel:pendingCut.mandrel||currentMandrel('bw'),extruder:processContext.extruder,shiftId:processContext.shiftId,runId:processContext.runId,time:new Date().toISOString()};
  localStorage.setItem(LAST_COMPLETED_CUT_KEY,JSON.stringify(state.lastCompletedCut));
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
  const targets=[$('optimizer-panel'),$('result-status'),$('optimizer-suggested')].filter(Boolean);
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
$('chat-fab').addEventListener('click',toggleChat);
$('chat-close').addEventListener('click',()=>setChatOpen(false));
$('chat-backdrop').addEventListener('click',()=>setChatOpen(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setChatOpen(false);});
document.querySelectorAll('.mandrel').forEach(button=>button.addEventListener('click',()=>selectMandrel(button.dataset.target,Number(button.dataset.value))));
$('language-select').addEventListener('change',event=>applyLanguage(event.target.value,true));
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
$('clear-trend').addEventListener('click',()=>{state.bwTrendHistory=[];localStorage.removeItem(TREND_HISTORY_KEY);renderTrendPanel(analyzeTrend());showToast(ot('trendCleared'));});
$('clear-history').addEventListener('click',()=>{state.history=[];localStorage.removeItem('viejitoHistory');renderHistory();showToast(t('historyCleared'));});
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

if(localStorage.getItem('viejitoTheme')==='light')document.documentElement.classList.add('light');
selectMandrel('bw',state.mandrel);
selectMandrel('ft',state.mandrel);
$('bw-target').value=fmt(state.targetBW);
$('bw-current-swrap').value=fmt(state.currentSWrap,1);
$('bw-product').value=state.product;
restoreSession();
if(state.activeShift?.product){$('bw-product').value=state.activeShift.product;state.product=state.activeShift.product;syncTargetFromProduct(state.activeShift.product);}
applyLanguage(state.language);
renderShiftPanel();
renderHistory();
renderLearningDashboard();
renderTrendPanel(analyzeTrend());
bubble('bot',{title:t('introTitle'),message:t('intro')});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js?v=5.6.0',{updateViaCache:'none'});
      await registration.update();
    }catch(error){
      console.error(error);
    }
  });
}
