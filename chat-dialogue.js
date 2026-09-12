/* Conversation bridge. Operational calculations stay in app.js; dialogue memory is separate. */
const dialogueEngine=new window.ViejitoConversation.ConversationEngine(window.localStorage);
const dialogueLanguage=()=>state.language==='es';
function dialogueText(es,en){return dialogueLanguage()?es:en;}
function dialogueInfo(es,en,extra={}){return {kind:'info',message:dialogueText(es,en),...extra};}
function dialogueKey(){return `${demoMode()?'demo':'real'}::line${ACTIVE_LINE}`;}
function dialogueWorkflowPrompt(flow=chatWorkflow){
  if(!flow)return dialogueText('¿Qué quieres revisar: BW, desbalance, producción o proceso?','What would you like to review: BW, balance, production or process?');
  if(flow.type==='process-performance')return processWorkflowPrompt(flow.stage);
  const prompts={
    operator:['¿Cuál es tu nombre de operador?','What is your operator name?'],
    product:['¿Qué producto vas a correr?','Which product will you run?'],
    swrap:['¿Cuál es el S-Wrap actual?','What is the current S-Wrap?'],
    'actual-bw':['¿Cuál fue el último BW promedio completo?','What was the last completed average BW?'],
    primary:['¿Cuáles son los RPM actuales del Primary?','What is the current Primary RPM?'],
    secondary:['¿Cuáles son los RPM actuales del Secondary?','What is the current Secondary RPM?'],
    weights:['Dame los dos pesos, por ejemplo 520 515.','Give me both weights, for example 520 515.'],
    minutes:['¿Cuántos minutos tardaron esos dos rollos?','How many minutes did those two rolls take?']
  };
  if(flow.stage==='confirm'&&flow.type==='start-line')return startLineWorkflowSummary(flow);
  const p=prompts[flow.stage];return p?dialogueText(...p):dialogueText('Puedes continuar con el dato pendiente o cancelar.','You can supply the pending value or cancel.');
}
function dialogueExplanation(memory){
  if(chatWorkflow){
    const stage=chatWorkflow.stage;
    let reason=dialogueText('Ese dato completa el contexto de esta operación.','That value completes the context for this operation.');
    if(stage==='minutes')reason=dialogueText('Calculo lb/h como (peso 1 + peso 2) × 60 ÷ minutos. Necesito el tiempo correspondiente a esos mismos rollos.','I calculate lb/h as (weight 1 + weight 2) × 60 ÷ minutes. I need the time for those same rolls.');
    if(['primary','secondary'].includes(stage))reason=dialogueText('Los RPM identifican las condiciones del proceso para comparar muestras; no se pueden deducir solo del peso de los rollos.','RPM identifies the process conditions for comparing samples; roll weights alone do not determine it.');
    return {kind:'info',message:reason+' '+dialogueWorkflowPrompt(),dialogueTransient:true};
  }
  const last=memory.lastAnswer;
  if(last?.explanation)return {kind:'info',message:last.explanation,dialogueTransient:true};
  if(last?.message)return dialogueInfo(`Estábamos revisando ${memory.topic||'la línea'}. Mi respuesta anterior fue: ${last.message} ¿Qué parte quieres aclarar: los datos, el cálculo o la recomendación?`,`We were reviewing ${memory.topic||'the line'}. My previous answer was: ${last.message} Which part should I explain: the data, calculation or recommendation?`,{dialogueTransient:true});
  return dialogueInfo('¿Qué quieres que explique? Todavía no tengo una respuesta anterior en esta conversación.','What should I explain? There is no previous answer in this conversation.',{dialogueTransient:true});
}
function dialogueWorkflowInput(text){
  const api=window.ViejitoConversation,q=api.normalize(text);
  if(chatWorkflow?.type==='start-line'&&chatWorkflow.stage==='confirm')return /^(si|yes|y|no|ok|okay|dale|correcto|empieza|inicia|cancelar|cancel)[.! ]*$/.test(q);
  if(api.isQuestion(text)||['simulation','action','training'].includes(api.mode(text)))return false;
  if(/^(cancel|cancelar|cancela|annuler|skip|saltar|omitir|no tengo|none|aucun)\b/.test(q))return true;
  if(chatWorkflow?.type==='start-line'&&['operator','product','confirm'].includes(chatWorkflow.stage)){
    return !/\b(estado|status|ayuda|help|revisa|muestra|hola|gracias|pause|pausa)\b/.test(q);
  }
  return Object.keys(api.entities(text)).length>0||/^(?:(?:eran?|fue|son|es|was|it was|actually|perdon|corrijo)\s+)?\d+(?:[.,]\d+)?(?:\s+\d+(?:[.,]\d+)?)*(?:\s*(?:rpm|lb|lbs|min|minutos|minutes|ft))?[.!]?$/.test(q);
}
function dialogueMergeWorkflow(text){
  if(!chatWorkflow)return null;
  const flow=chatWorkflow,e=window.ViejitoConversation.entities(text);
  if(flow.type==='process-performance'){
    const allowed=['primaryRPM','secondaryRPM','w1','w2','minutes','swrapSpeed','pressure','melt','heat','load'];
    const fields=allowed.filter(k=>e[k]!=null);
    if(fields.length){
      fields.forEach(k=>flow[k]=e[k]);
      const next=processWorkflowNextStage(flow);
      // Optional conditions always get their own review/skip turn before a real record is saved.
      if(flow.stage!=='conditions'||next!=='complete'){
        flow.stage=next==='complete'?'conditions':next;saveChatWorkflow();
        return {kind:'info',message:dialogueWorkflowPrompt(flow)};
      }
      chatWorkflow=null;saveChatWorkflow();return saveProcessPerformanceSample(flow);
    }
  }
  if(flow.type==='coordinated-speed-bw'&&(e.primaryRPM||e.secondaryRPM)){
    for(const k of ['primaryRPM','secondaryRPM'])if(e[k])flow[k]=e[k];
    if(positive(flow.primaryRPM,flow.secondaryRPM)){chatWorkflow=null;saveChatWorkflow();return coordinatedSpeedRecommendation(flow);}
    flow.stage=positive(flow.primaryRPM)?'secondary':'primary';saveChatWorkflow();return {kind:'info',message:dialogueWorkflowPrompt(flow)};
  }
  if(flow.type==='output-rate'&&(e.w1||e.w2||e.minutes)){
    for(const k of ['w1','w2','minutes'])if(e[k])flow[k]=e[k];
    if(positive(flow.w1,flow.w2,flow.minutes)){chatWorkflow=null;saveChatWorkflow();return outputRateResult(flow.w1,flow.w2,flow.minutes);}
    flow.stage=positive(flow.w1,flow.w2)?'minutes':'weights';saveChatWorkflow();return {kind:'info',message:dialogueWorkflowPrompt(flow)};
  }
  return null;
}
function dialogueCalculator(text,memory){
  const api=window.ViejitoConversation,q=api.normalize(text),e=api.entities(text);
  const start=/\b(calcula|calcular|calculate|calculo)\b/.test(q)&&/\b(bw|gramaje|basis weight)\b/.test(q);
  const correction=/\b(perdon|corrijo|correction|actually|en realidad|era|eran|me equivoque)\b/.test(q);
  const newMandrel=q.match(/^(?:y |and )?(?:con|with)\s+(48|51)[.! ]*$/);
  if(!memory.calculator&&memory.lastCalculation&&(correction||newMandrel))memory.calculator={...memory.lastCalculation};
  if(newMandrel)e.mandrel=Number(newMandrel[1]);
  if(!start&&!memory.calculator)return null;
  if(api.isQuestion(text)&&!start&&!e.weight&&!e.length&&!e.mandrel)return null;
  if(!start&&!Object.keys(e).length&&!/^\d+(?:[.,]\d+)?$/.test(q))return null;
  if(start)memory.calculator={type:'bw',mandrel:state.mandrel||48};
  const calc=memory.calculator;
  for(const k of ['weight','length','mandrel'])if(e[k])calc[k]=e[k];
  const vals=numbers(text);
  if(!e.weight&&!e.length){
    if(vals.length===2&&!e.mandrel){
      const weight=vals.find(v=>v>=300&&v<=1000),length=vals.find(v=>v>2000);
      if(!positive(weight,length))return dialogueInfo('¿Cuál número es el peso y cuál es la longitud? Escríbelos con lb y ft para evitar confundirlos.','Which number is the weight and which is the length? Label them with lb and ft to avoid mixing them up.');
      calc.weight=weight;calc.length=length;
    }
    else if(vals.length===1&&!e.mandrel){if(!calc.weight)calc.weight=vals[0];else if(!calc.length)calc.length=vals[0];}
  }
  if(!positive(calc.weight))return dialogueInfo('¿Cuánto pesa el rollo en lb?','What is the roll weight in lb?');
  if(!positive(calc.length))return dialogueInfo(`Tengo ${fmt(calc.weight)} lb. ¿Cuántos pies tiene ese rollo?`,`I have ${fmt(calc.weight)} lb. How many feet are on that roll?`);
  const result=calculateBW(calc.weight,calc.length,calc.mandrel);
  memory.lastCalculation={...calc,result};memory.calculator=null;
  return {kind:'result',title:'Basis Weight',value:fmt(result),message:`${fmt(calc.weight)} lb / ${fmt(calc.length)} ft • ${calc.mandrel}”`,dialogueTopic:'bw',explanation:dialogueText(`Usé ${calc.weight} lb, ${calc.length} ft, ancho ${calc.mandrel} pulgadas y factor ${FACTOR_GRAMS_PER_LB}. BW = peso × factor × 100 ÷ (pies × 12 × ancho). Es un cálculo del chat.`,`I used ${calc.weight} lb, ${calc.length} ft, width ${calc.mandrel} inches and factor ${FACTOR_GRAMS_PER_LB}. BW = weight × factor × 100 ÷ (feet × 12 × width). This is a chat calculation.`)};
}
function dialogueSimulation(text,memory,line){
  const e=window.ViejitoConversation.entities(text),q=window.ViejitoConversation.normalize(text);
  if(/\b(primary|secondary|rpm|producto|product|mandrel|mandril)\b/.test(q))return dialogueInfo('Para esa simulación necesito una petición explícita con las variables y el objetivo. Puedo simular S-Wrap manteniendo el output constante; los cambios coordinados están en Speed Change Advisor.','For that simulation I need explicit variables and a target. I can simulate S-Wrap at constant output; coordinated changes are available in Speed Change Advisor.',{dialogueTransient:true});
  const c=brainContext(line),last=c.lastCut;
  const number=q.match(/\b(?:a|to|en|at)\s*(\d+(?:[.,]\d+)?)/);
  const speed=e.swrapSpeed||(number?Number(number[1].replace(',','.')):null);
  if(!speed){memory.pendingSimulation={line};return dialogueInfo('¿A qué S-Wrap quieres simular el cambio? Por ejemplo: «¿y si pongo S-Wrap a 175?».','What S-Wrap should I simulate? For example: “what if I set S-Wrap to 175?”.',{dialogueTransient:true});}
  memory.pendingSimulation=null;
  const bw=Number(last?.averageBW),before=Number(last?.currentSWrap),age=Date.now()-new Date(last?.time||0).getTime();
  if(!c.running||!positive(bw,before)||age<0||age>MAX_AUTO_CONTEXT_AGE_MS)return dialogueInfo('Necesito un corte completo reciente de esa línea, con su BW y el S-Wrap usado. No voy a asumirlos.','I need a recent completed cut for that line, including BW and S-Wrap used. I will not assume those values.',{dialogueTransient:true});
  if(speed>MAX_SWRAP_SPEED)return dialogueInfo(`Ese valor supera el máximo configurado de ${MAX_SWRAP_SPEED}.`,`That exceeds the configured maximum of ${MAX_SWRAP_SPEED}.`,{dialogueTransient:true});
  const predicted=bw*before/speed;
  return {kind:'result',title:dialogueText('Simulación — sin aplicar','Simulation — not applied'),message:dialogueText(`Line ${line}: con BW ${fmt(bw,3)} a S-Wrap ${fmt(before,1)}, a ${fmt(speed,1)} resultaría aproximadamente BW ${fmt(predicted,3)}, suponiendo output constante. No es una medición ni una orden de cambio.`,`Line ${line}: BW ${fmt(bw,3)} at S-Wrap ${fmt(before,1)} would become approximately BW ${fmt(predicted,3)} at ${fmt(speed,1)}, assuming constant output. This is not a measurement or a change command.`),dialogueTopic:'bw',explanation:`BW = ${bw} × ${before} ÷ ${speed}. `+dialogueText('La relación supone output constante; si cambian otras condiciones no permite predecir por sí sola el resultado.','The relationship assumes constant output; other condition changes can invalidate it.')};
}
function dialogueRead(text,memory,line){
  const api=window.ViejitoConversation,q=api.normalize(text);
  const currentTopic=api.topic(text)||memory.topic;
  if(memory.diagnostic&&memory.diagnostic.line!==line)memory.diagnostic=null;
  // A line-only follow-up reuses the previous question without switching operational lines.
  const lineOnly=/^(?:y |no[,]? |no[,]? (?:era|es) |and |not that[,]? )?(?:en |la |linea |line |la linea )*[1-4][.! ]*$/.test(q);
  const topicQueries={balance:'sheet balance',trend:'trend',production:'production status',bw:'line status',line:'line status',process:'process learning'};
  if(lineOnly&&line)return brainLocalQuery(`${topicQueries[currentTopic]||'line status'} line ${line}`);
  const specific=/\b(desbalance|balance|tendencia|trend|subiendo|bajando|estado|status)\b/.test(q);
  const definition=/\b(que es|que significa|what is|what does|define|explica|explain)\b/.test(q);
  if(definition){const knowledge=extrusionKnowledgeQuery(text);if(knowledge)return knowledge;}
  if(specific){
    const query=topicQueries[currentTopic]||'line status';
    const result=brainLocalQuery(`${query} line ${line}`);
    if(result){
      result.dialogueTopic=currentTopic;
      const c=brainContext(line);
      if(c.lastCut)result.explanation=dialogueText(`Comparo las mediciones guardadas de Line ${line}: W1 ${fmt(c.lastCut.winder1,3)}, W2 ${fmt(c.lastCut.winder2,3)}, BW promedio ${fmt(c.lastCut.averageBW,3)}, objetivo ${fmt(c.targetBW,3)}. El desbalance es |W1 − W2|; la tendencia usa varios cortes. Estos datos muestran qué ocurrió, pero no prueban la causa.`,`I compare stored Line ${line} measurements: W1 ${fmt(c.lastCut.winder1,3)}, W2 ${fmt(c.lastCut.winder2,3)}, average BW ${fmt(c.lastCut.averageBW,3)}, target ${fmt(c.targetBW,3)}. Balance is |W1 − W2|; trends use several cuts. These measurements show what happened, but do not prove its cause.`);
      if(c.running&&/\b(sigue|problema|problem|keeps|ayuda|help)\b/.test(q)&&['trend','balance'].includes(currentTopic)){
        memory.diagnostic={stage:'change',line,topic:currentTopic};
        result.message+=' '+dialogueText('¿Cambiaste algún ajuste entre esos cortes? Puedes decirme cuál y el valor, o responder no.','Did you change any setting between those cuts? Tell me which one and its value, or say no.');
      }
      return result;
    }
  }
  return null;
}
function dialogueDiagnostic(text,memory){
  const d=memory.diagnostic;if(!d)return null;
  const q=window.ViejitoConversation.normalize(text),yes=/^(si|yes|yeah|correcto)\b/.test(q),no=/^(no|nope)\b/.test(q);
  if(window.ViejitoConversation.isQuestion(text)||['action','training'].includes(window.ViejitoConversation.mode(text)))return null;
  if(d.stage==='change'){
    if(no){memory.diagnostic=null;return dialogueInfo('Queda como observación de esta conversación: no reportas cambios. Podemos revisar si cambió el output, el material o las condiciones de proceso. ¿Qué síntoma adicional observaste?','Conversation observation: you report no changes. We can review output, material or process conditions. What additional symptom did you observe?');}
    const e=window.ViejitoConversation.entities(text);
    if(yes&&!Object.keys(e).length)return dialogueInfo('¿Qué ajuste cambiaste y a qué valor? Lo tomaré como dato reportado, sin modificar la línea.','Which setting did you change, and to what value? I will treat it as reported information without changing the line.',{dialogueTransient:true});
    if(Object.keys(e).length){d.reported=e;d.stage='timing';return dialogueInfo('Tomo ese cambio como dato reportado, no como una medición verificada. ¿El último corte se produjo completo después del ajuste?','I will treat that change as reported information, not a verified measurement. Was the entire last cut produced after the adjustment?');}
  }
  if(d.stage==='timing'&&(yes||no)){
    memory.diagnostic=null;
    return dialogueInfo(no?'Entonces ese corte mezcla condiciones anteriores y posteriores. En este análisis lo tratamos como transición; no permite atribuir el resultado al ajuste. Espera un corte completo bajo las mismas condiciones para compararlo.':'Eso permite una comparación más útil. Aun así, hay que comprobar si cambiaron output, material u otras condiciones antes de atribuir el resultado solo a ese ajuste.',no?'That cut mixes conditions before and after the change. In this analysis it is a transition cut and cannot isolate the adjustment’s effect. Compare a complete cut under the same conditions.':'That makes the comparison more useful. Still check whether output, material or other conditions changed before attributing the result solely to that adjustment.');
  }
  return null;
}
function interpret(text){
  const api=window.ViejitoConversation,key=dialogueKey(),memory=dialogueEngine.session(key),q=api.normalize(text),mode=api.mode(text);
  const explicitLine=requestedLineNumber(text)||((/^(?:y |no[,]? |and )?(?:la |linea |line )+[1-4][.! ]*$/.test(q))?Number(q.match(/[1-4]/)[0]):null);
  const line=explicitLine||memory.line||ACTIVE_LINE;
  if(explicitLine&&memory.diagnostic?.line!==explicitLine)memory.diagnostic=null;
  let response;
  try{
    if(mode==='negated')response=dialogueInfo('Entendido: no aplicaré ese cambio. Si quieres evaluar una alternativa, escribe «¿qué pasa si…?».','Understood: I will not apply that change. To evaluate an alternative, ask “what if…?”.',{dialogueTransient:true});
    else if(mode==='action'&&line!==ACTIVE_LINE&&/\b(s[- ]?wrap|winder|cut|corte|shift|turno)\b/.test(q)&&!(/\b(start|empezar|empieza|iniciar|inicia)\b/.test(q)&&explicitLine))response=dialogueInfo(`Estabas consultando Line ${line}, pero la línea activa es ${ACTIVE_LINE}. Selecciona primero la línea que quieres modificar; no voy a aplicar la orden a otra línea.`,`You were reviewing Line ${line}, but the active line is ${ACTIVE_LINE}. Select the line you want to modify first; I will not apply the command to another line.`,{dialogueTransient:true});
    else if(/^(cancel|cancelar|cancela|annuler|olvida eso|forget that)[.! ]*$/.test(q)){
      chatWorkflow=null;memory.pausedWorkflow=null;memory.calculator=null;memory.diagnostic=null;memory.pendingSimulation=null;saveChatWorkflow();
      response=dialogueInfo('Cancelé lo pendiente en el chat. ¿Qué quieres revisar ahora?','I cancelled the pending chat task. What would you like to review now?',{dialogueTransient:true});
    }else if(/^(pausa|pause|espera|un momento|wait)[.! ]*$/.test(q)){
      if(chatWorkflow){memory.pausedWorkflow=chatWorkflow;chatWorkflow=null;saveChatWorkflow();}
      response=dialogueInfo('Conservo los datos. Puedes hacer otra pregunta y escribir «continuar» para retomar.','I will keep the values. Ask another question and say “continue” to resume.',{dialogueTransient:true});
    }else if(/^(continua|continuar|sigamos|retoma|resume|continue|seguimos)[.! ]*$/.test(q)){
      if(!chatWorkflow&&memory.pausedWorkflow){chatWorkflow=memory.pausedWorkflow;memory.pausedWorkflow=null;saveChatWorkflow();}
      response={kind:'info',message:dialogueWorkflowPrompt(),dialogueTransient:true};
    }else if(/^(?:y )?(por que|porque|why|explicame|explica eso|explain|explain that|como lo calculaste|how did you calculate that)[.! ]*$/.test(q)){
      response=memory.diagnostic?.stage==='timing'?dialogueInfo('Importa porque un corte producido a mitad de un cambio mezcla dos condiciones. Seguimos pendientes de saber si el corte completo fue posterior al ajuste.','A cut spanning an adjustment mixes two conditions. We still need to know whether the entire cut was produced after the change.',{dialogueTransient:true}):dialogueExplanation(memory);
    }else if(mode==='simulation')response=dialogueSimulation(text,memory,line);
    else if(memory.pendingSimulation&&/^\d+(?:[.,]\d+)?$/.test(q))response=dialogueSimulation(`S-Wrap ${q}`,memory,memory.pendingSimulation.line);
    else if(/^(?:y |and )?(?:la otra|el otro|the other)(?: linea| line)?[.! ]*$/.test(q))response=dialogueInfo('Tenemos cuatro líneas. ¿Cuál quieres revisar: 1, 2, 3 o 4?','There are four lines. Which one should I review: 1, 2, 3 or 4?',{dialogueTransient:true});
    else if((response=dialogueDiagnostic(text,memory))){}
    else if(chatWorkflow&&dialogueWorkflowInput(text))response=dialogueMergeWorkflow(text)||interpretLegacy(text);
    else if(chatWorkflow?.type==='start-line'&&chatWorkflow.stage==='confirm'&&!api.isQuestion(text)){
      const e=api.entities(text),product=q.match(/\b\d+(?:\.\d+)?\/\d+(?:\s+lam)?\b/);
      if(e.swrapSpeed)chatWorkflow.swrap=clampSWrap(e.swrapSpeed);
      if(product)chatWorkflow.product=normalizeProduct(product[0]);
      saveChatWorkflow();
      response={kind:'info',message:startLineWorkflowSummary(chatWorkflow),dialogueTransient:true};
    }
    else if(!chatWorkflow&&!memory.diagnostic&&/^(si|yes|no|nope|yeah)[.! ]*$/.test(q))response=dialogueInfo('¿A qué pregunta te refieres? No tengo una confirmación pendiente.','Which question are you answering? There is no pending confirmation.',{dialogueTransient:true});
    else{
      // Suspend the form for a side question. Restore it even if the answer throws.
      const held=chatWorkflow;chatWorkflow=null;
      try{
        response=dialogueCalculator(text,memory)||dialogueRead(text,memory,line);
        if(!response)response=interpretLegacy(text);
      }finally{
        if(held){
          if(chatWorkflow)memory.pausedWorkflow=held;
          else chatWorkflow=held;
          saveChatWorkflow();
        }
      }
      if(held&&chatWorkflow===held&&response)response={...response,message:(response.message||response.value||'')+' '+dialogueText('Conservo los datos pendientes. ','I kept the pending values. ')+dialogueWorkflowPrompt(held),dialogueTransient:true};
    }
    response=response||unsupportedChatResponse();
    if(/^(hola|hi|hello|gracias|thanks|thank you|merci|ok|okay|vale|perfecto)[.! ]*$/.test(q))response={...response,dialogueTransient:true};
    dialogueEngine.remember(key,text,response,mode==='action'?ACTIVE_LINE:line);
    dialogueEngine.save(key);
    return response;
  }catch(error){
    console.error('Chat turn failed',error);
    return dialogueInfo('No pude completar esa respuesta. Los datos pendientes siguen disponibles; puedes escribir «continuar» o reformular la pregunta.','I could not complete that answer. Pending values remain available; say “continue” or rephrase the question.',{dialogueTransient:true});
  }
}
