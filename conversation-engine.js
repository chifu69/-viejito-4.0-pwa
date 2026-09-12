/* Local dialogue state and language routing. No model, dependencies or network. */
(function(root){
  'use strict';
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!]/g,' ').replace(/\s+/g,' ').trim();
  const actionWords='cambi(?:a|ar|es)|ajust(?:a|ar|es)|pon(?:er)?|aplic(?:a|ar|ar|ues)|guard(?:a|ar|es)|registr(?:a|ar|es)|inici(?:a|ar|es)|empieza|termin(?:a|ar|es)|borr(?:a|ar|es)|set|change|apply|save|record|start|end|clear|reset';
  function mode(text){
    const q=normalize(text);
    if(new RegExp("\\b(?:no|nunca|don't|do not|never|sin)\\b.{0,45}\\b(?:"+actionWords+")\\b").test(q))return 'negated';
    if(/\b(que pasa si|que pasaria|y si|what if|simulate|simula|simular|simulation|simulacion|hypothetical|hipotetico|si subo|si bajo|si pongo|si cambio)\b/.test(q))return 'simulation';
    if(/[¿?]/.test(String(text))||/^(?:y )?(?:por que|porque|why|what|how|que|cual|cuanto|como|explica|explicame|explain|necesito ayuda|ayudame|help me)\b/.test(q))return 'query';
    if(/^(?:(?:por favor|please)\s+)?(?:quiero\s+)?(?:guardar|guarda|registrar|registra|aprender|aprende|ensenar|ensena|save|record|learn|teach)\b/.test(q))return 'training';
    if(new RegExp('^(?:(?:por favor|please)\\s+)?(?:quiero\\s+)?(?:'+actionWords+'|empezar|arranca|arrancar|comienza|comenzar|abre|abrir|muestra|selecciona|usa|open|show|switch|go to|ve a|run|begin|finish|accept|acepta|calcula|calcular|complete|completa|completar|calculate)\\b').test(q))return 'action';
    return 'query';
  }
  function topic(text){
    const q=normalize(text);
    if(/\b(desbalance|balance|die|winder|lado pesado|sheet)\b/.test(q))return 'balance';
    if(/\b(tendencia|trend|subiendo|bajando|rising|falling)\b/.test(q))return 'trend';
    if(/\b(produccion|production|output|lbs|lb\/hr)\b/.test(q))return 'production';
    if(/\b(bw|gramaje|s[- ]?wrap)\b/.test(q))return 'bw';
    if(/\b(primary|secondary|primario|secundario|melt|presion|pressure)\b/.test(q))return 'process';
    if(/\b(linea|line|estado|status)\b/.test(q))return 'line';
    return null;
  }
  function entities(text){
    const q=normalize(text).replace(/,/g,'.');
    const patterns={
      primaryRPM:/\b(?:primary|primario)(?:\s+rpm)?\s*(?:es|era|a|at|=|:)?\s*(\d+(?:\.\d+)?)/,
      secondaryRPM:/\b(?:secondary|secundario)(?:\s+rpm)?\s*(?:es|era|a|at|=|:)?\s*(\d+(?:\.\d+)?)/,
      w1:/\b(?:winder\s*1|w1|rollo\s*1|roll\s*1)(?:\s+(?:peso|weight|pesa|was))?\s*[:=]?\s*(\d+(?:\.\d+)?)/,
      w2:/\b(?:winder\s*2|w2|rollo\s*2|roll\s*2)(?:\s+(?:peso|weight|pesa|was))?\s*[:=]?\s*(\d+(?:\.\d+)?)/,
      minutes:/\b(\d+(?:\.\d+)?)\s*(?:min|mins|minutes|minutos)\b/,
      swrapSpeed:/\b(?:s[- ]?wrap|velocidad|speed)\s*(?:es|era|a|at|=|:)?\s*(\d+(?:\.\d+)?)/,
      actualBW:/\b(?:bw|gramaje)(?:\s+(?:actual|real))?\s*(?:es|era|a|at|=|:)?\s*(\d+(?:\.\d+)?)/,
      weight:/\b(\d+(?:\.\d+)?)\s*(?:lb|lbs|libras)\b/,
      length:/\b(\d+(?:\.\d+)?)\s*(?:ft|feet|pies)\b/,
      mandrel:/\b(?:mandrel|mandril)\s*[:=]?\s*(48|51)\b/,
      pressure:/\b(?:pressure|presion)\s*[:=]?\s*(\d+(?:\.\d+)?)/,
      melt:/\bmelt\s*[:=]?\s*(\d+(?:\.\d+)?)/,
      heat:/\b(?:secondary heat|heat|calor)\s*[:=]?\s*(\d+(?:\.\d+)?)/,
      load:/\b(?:motor load|load|carga)\s*[:=]?\s*(\d+(?:\.\d+)?)/
    };
    const result={};
    for(const [key,re] of Object.entries(patterns)){const m=q.match(re);if(m&&Number(m[1])>0)result[key]=Number(m[1]);}
    return result;
  }
  function isQuestion(text){return /[¿?]/.test(String(text))||/^(?:y )?(?:por que|why|what|how|que|cual|cuanto|como|explica|explicame|explain)\b/.test(normalize(text));}
  class ConversationEngine{
    constructor(storage=null){this.storage=storage;this.sessions=new Map();}
    session(key){
      if(!this.sessions.has(key)){
        let saved=null;try{saved=JSON.parse(this.storage?.getItem('viejitoDialogueV1::'+key)||'null');}catch(_){}
        // A historical answer may be recalled, but only recent dialogue can resolve implicit references.
        const fresh=saved&&saved.version===1&&Date.now()-Number(saved.updatedAt)<12*60*60*1000;
        this.sessions.set(key,fresh?saved:{version:1,topic:null,line:null,lastAnswer:null,lastRequest:null,calculator:null});
      }
      return this.sessions.get(key);
    }
    save(key){const s=this.session(key);s.updatedAt=Date.now();try{this.storage?.setItem('viejitoDialogueV1::'+key,JSON.stringify(s));}catch(_){} }
    remember(key,text,response,line){
      const s=this.session(key);
      if(response?.dialogueTransient)return;
      s.topic=response?.dialogueTopic||topic(text)||s.topic;
      s.line=line;s.lastRequest=String(text).slice(0,1500);
      s.lastAnswer={message:String(response?.message||response?.value||'').slice(0,5000),title:response?.title||'',explanation:response?.explanation||null,time:Date.now()};
      this.save(key);
    }
  }
  root.ViejitoConversation={ConversationEngine,normalize,mode,topic,entities,isQuestion};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ViejitoConversation;
})(typeof window!=='undefined'?window:globalThis);
