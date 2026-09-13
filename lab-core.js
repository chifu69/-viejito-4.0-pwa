/*
  Viejito Lab Core 1.0 — local/offline experimental learning primitives.
  No network calls. No production writes. The public .fit() API is intentional:
  Lab models train in isolation and are compared against held-out data before promotion.
*/
(function(root){
  'use strict';

  const EPS=1e-8;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const finite=v=>Number.isFinite(Number(v));
  const mean=a=>a.length?a.reduce((s,v)=>s+Number(v),0)/a.length:0;
  const std=a=>{if(!a.length)return 1;const m=mean(a);const v=mean(a.map(x=>(Number(x)-m)**2));return Math.sqrt(v)||1;};
  const deepCopy=v=>JSON.parse(JSON.stringify(v));

  class SeededRandom{
    constructor(seed=0x5EED1234){this.state=(Number(seed)>>>0)||0x5EED1234;}
    next(){let x=this.state;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x>>>0;return this.state/4294967296;}
    normal(){let u=0,v=0;while(!u)u=this.next();while(!v)v=this.next();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  }

  function softmax(values){
    const max=Math.max(...values);const exps=values.map(v=>Math.exp(v-max));const total=exps.reduce((a,b)=>a+b,0)||1;return exps.map(v=>v/total);
  }

  class DenseFitModel{
    constructor({inputSize,hidden=[16,8],outputSize=1,task='regression',seed=1337,learningRate=0.01}={}){
      if(!(inputSize>0))throw new Error('inputSize is required');
      this.inputSize=Number(inputSize);this.hidden=hidden.map(Number).filter(n=>n>0);this.outputSize=Number(outputSize)||1;
      this.task=task==='classification'?'classification':'regression';this.seed=Number(seed)||1337;this.learningRate=Number(learningRate)||0.01;
      this.layers=[];this.step=0;this.xStats=null;this.yStats=null;this.labels=null;this._init();
    }
    _init(){
      const rng=new SeededRandom(this.seed),dims=[this.inputSize,...this.hidden,this.outputSize];
      this.layers=[];
      for(let l=0;l<dims.length-1;l++){
        const input=dims[l],output=dims[l+1],scale=Math.sqrt(2/Math.max(1,input));
        const W=Array.from({length:input},()=>Array.from({length:output},()=>rng.normal()*scale));
        const b=Array(output).fill(0);
        this.layers.push({W,b,mW:W.map(r=>r.map(()=>0)),vW:W.map(r=>r.map(()=>0)),mb:b.map(()=>0),vb:b.map(()=>0)});
      }
    }
    architecture(){return [this.inputSize,...this.hidden,this.outputSize];}
    parameterCount(){return this.layers.reduce((sum,l)=>sum+l.W.length*l.W[0].length+l.b.length,0);}
    _fitXStats(X){
      const cols=this.inputSize;const means=[],stds=[];
      for(let j=0;j<cols;j++){const col=X.map(r=>finite(r[j])?Number(r[j]):0);means.push(mean(col));stds.push(std(col));}
      this.xStats={mean:means,std:stds};
    }
    _normXRow(row){return Array.from({length:this.inputSize},(_,j)=>((finite(row[j])?Number(row[j]):0)-this.xStats.mean[j])/(this.xStats.std[j]||1));}
    _fitYStats(y){if(this.task!=='regression')return;const vals=y.map(Number);this.yStats={mean:mean(vals),std:std(vals)};}
    _normY(v){return this.task==='regression'?(Number(v)-this.yStats.mean)/(this.yStats.std||1):Number(v);}
    _denormY(v){return this.task==='regression'?Number(v)*(this.yStats.std||1)+this.yStats.mean:Number(v);}
    _forward(row){
      let a=row.slice();const cache=[];
      for(let li=0;li<this.layers.length;li++){
        const layer=this.layers[li],z=Array(layer.b.length).fill(0);
        for(let j=0;j<z.length;j++){let s=layer.b[j];for(let i=0;i<a.length;i++)s+=a[i]*layer.W[i][j];z[j]=s;}
        const last=li===this.layers.length-1;
        const next=last?(this.task==='classification'?softmax(z):z.slice()):z.map(v=>v>0?v:0);
        cache.push({input:a.slice(),z:z.slice(),output:next.slice()});a=next;
      }
      return {output:a,cache};
    }
    _batchGrad(X,y,indices){
      const grads=this.layers.map(l=>({W:l.W.map(r=>r.map(()=>0)),b:l.b.map(()=>0)}));let loss=0,correct=0;
      for(const idx of indices){
        const row=this._normXRow(X[idx]),target=this.task==='classification'?Number(y[idx]):this._normY(y[idx]);
        const {output,cache}=this._forward(row);let delta;
        if(this.task==='classification'){
          const p=clamp(output[target]||EPS,EPS,1);loss+=-Math.log(p);const pred=output.indexOf(Math.max(...output));if(pred===target)correct++;
          delta=output.slice();delta[target]-=1;
        }else{
          const err=output[0]-target;loss+=err*err;delta=[2*err];
        }
        for(let li=this.layers.length-1;li>=0;li--){
          const layer=this.layers[li],c=cache[li],g=grads[li];
          for(let j=0;j<delta.length;j++){g.b[j]+=delta[j];for(let i=0;i<c.input.length;i++)g.W[i][j]+=c.input[i]*delta[j];}
          if(li>0){
            const prev=Array(c.input.length).fill(0);
            for(let i=0;i<prev.length;i++){let s=0;for(let j=0;j<delta.length;j++)s+=layer.W[i][j]*delta[j];const prevZ=cache[li-1].z[i];prev[i]=prevZ>0?s:0;}
            delta=prev;
          }
        }
      }
      const n=Math.max(1,indices.length);for(const g of grads){for(let i=0;i<g.W.length;i++)for(let j=0;j<g.W[i].length;j++)g.W[i][j]/=n;for(let j=0;j<g.b.length;j++)g.b[j]/=n;}
      return {grads,loss:loss/n,accuracy:this.task==='classification'?correct/n:null};
    }
    _apply(grads,lr){
      this.step++;const b1=.9,b2=.999,b1t=1-Math.pow(b1,this.step),b2t=1-Math.pow(b2,this.step);
      for(let li=0;li<this.layers.length;li++){
        const layer=this.layers[li],g=grads[li];
        for(let i=0;i<layer.W.length;i++)for(let j=0;j<layer.W[i].length;j++){
          const grad=clamp(g.W[i][j],-10,10);layer.mW[i][j]=b1*layer.mW[i][j]+(1-b1)*grad;layer.vW[i][j]=b2*layer.vW[i][j]+(1-b2)*grad*grad;
          layer.W[i][j]-=lr*(layer.mW[i][j]/b1t)/(Math.sqrt(layer.vW[i][j]/b2t)+EPS);
        }
        for(let j=0;j<layer.b.length;j++){
          const grad=clamp(g.b[j],-10,10);layer.mb[j]=b1*layer.mb[j]+(1-b1)*grad;layer.vb[j]=b2*layer.vb[j]+(1-b2)*grad*grad;
          layer.b[j]-=lr*(layer.mb[j]/b1t)/(Math.sqrt(layer.vb[j]/b2t)+EPS);
        }
      }
    }
    async fit(X,y,{epochs=120,batchSize=32,learningRate=this.learningRate,validationData=null,patience=18,minDelta=1e-5,onEpochEnd=null,shuffle=true}={}){
      if(!Array.isArray(X)||!X.length||X.length!==y.length)throw new Error('Training X/y are required');
      if(!this.xStats)this._fitXStats(X);if(this.task==='regression'&&!this.yStats)this._fitYStats(y);
      let best=Infinity,bestState=null,wait=0;const history={loss:[],valLoss:[],accuracy:[],valAccuracy:[],epochs:0};const rng=new SeededRandom(this.seed+91);
      for(let epoch=0;epoch<epochs;epoch++){
        const indices=Array.from({length:X.length},(_,i)=>i);if(shuffle){for(let i=indices.length-1;i>0;i--){const j=Math.floor(rng.next()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}}
        let totalLoss=0,totalAcc=0,batches=0;
        for(let s=0;s<indices.length;s+=batchSize){const batch=indices.slice(s,s+batchSize);const out=this._batchGrad(X,y,batch);this._apply(out.grads,learningRate);totalLoss+=out.loss;if(out.accuracy!=null)totalAcc+=out.accuracy;batches++;}
        const trainLoss=totalLoss/Math.max(1,batches),trainAcc=this.task==='classification'?totalAcc/Math.max(1,batches):null;
        let valLoss=trainLoss,valAcc=trainAcc;if(validationData?.[0]?.length){const e=this.evaluate(validationData[0],validationData[1]);valLoss=e.loss;valAcc=e.accuracy;}
        history.loss.push(trainLoss);history.valLoss.push(valLoss);if(trainAcc!=null){history.accuracy.push(trainAcc);history.valAccuracy.push(valAcc);}history.epochs=epoch+1;
        if(valLoss<best-minDelta){best=valLoss;bestState=this.toJSON();wait=0;}else wait++;
        if(onEpochEnd)await onEpochEnd(epoch,{loss:trainLoss,valLoss,accuracy:trainAcc,valAccuracy:valAcc});
        if(epoch%8===0)await new Promise(r=>setTimeout(r,0));
        if(wait>=patience)break;
      }
      if(bestState){const restored=DenseFitModel.fromJSON(bestState);this.layers=restored.layers;this.xStats=restored.xStats;this.yStats=restored.yStats;this.step=restored.step;}
      return history;
    }
    predict(X){
      if(!this.xStats)throw new Error('Model is not fitted');const rows=Array.isArray(X[0])?X:[X];
      return rows.map(r=>{const out=this._forward(this._normXRow(r)).output;if(this.task==='classification'){const idx=out.indexOf(Math.max(...out));return {index:idx,confidence:out[idx],probabilities:out};}return this._denormY(out[0]);});
    }
    evaluate(X,y){
      if(!X?.length)return {loss:Infinity,mae:Infinity,accuracy:null};let loss=0,mae=0,correct=0;
      for(let i=0;i<X.length;i++){
        const out=this._forward(this._normXRow(X[i])).output;
        if(this.task==='classification'){const target=Number(y[i]),p=clamp(out[target]||EPS,EPS,1);loss+=-Math.log(p);if(out.indexOf(Math.max(...out))===target)correct++;}
        else{const pred=this._denormY(out[0]),err=pred-Number(y[i]);mae+=Math.abs(err);const ne=out[0]-this._normY(y[i]);loss+=ne*ne;}
      }
      return {loss:loss/X.length,mae:this.task==='regression'?mae/X.length:null,accuracy:this.task==='classification'?correct/X.length:null};
    }
    toJSON(){return {format:'viejito-fit-v1',inputSize:this.inputSize,hidden:this.hidden,outputSize:this.outputSize,task:this.task,seed:this.seed,learningRate:this.learningRate,step:this.step,xStats:this.xStats,yStats:this.yStats,layers:this.layers.map(l=>({W:l.W,b:l.b,mW:l.mW,vW:l.vW,mb:l.mb,vb:l.vb}))};}
    static fromJSON(data){const m=new DenseFitModel(data);m.step=Number(data.step)||0;m.xStats=data.xStats||null;m.yStats=data.yStats||null;m.layers=deepCopy(data.layers||m.layers);return m;}
  }

  function timeSplit(rows,{train=.70,validation=.15,minTrain=6}={}){
    const sorted=rows.slice().sort((a,b)=>new Date(a.timestamp||a.time||0)-new Date(b.timestamp||b.time||0));const n=sorted.length;
    if(n<Math.max(8,minTrain+2))return {train:sorted,validation:[],test:[]};
    let nTrain=Math.max(minTrain,Math.floor(n*train)),nVal=Math.max(1,Math.floor(n*validation));if(nTrain+nVal>=n)nVal=Math.max(1,n-nTrain-1);
    return {train:sorted.slice(0,nTrain),validation:sorted.slice(nTrain,nTrain+nVal),test:sorted.slice(nTrain+nVal)};
  }

  function processFeatureRow(r){
    return [
      Number(r.initialBW)||Number(r.averageBW)||Number(r.finalBW)||0,
      Number(r.targetBW)||0,
      Number(r.currentSWrap)||Number(r.appliedSWrap)||0,
      Number(r.formulaSuggestion)||Number(r.currentSWrap)||Number(r.appliedSWrap)||0,
      Number(r.mandrel)||48,
      Number(r.extruder)||Number(r.line)||0,
      Number(r.winder1)||Number(r.winder1BW)||0,
      Number(r.winder2)||Number(r.winder2BW)||0
    ];
  }
  function processTarget(r){
    if(finite(r.idealSWrap)&&Number(r.idealSWrap)>0)return Number(r.idealSWrap);
    if(finite(r.appliedSWrap)&&finite(r.finalBW)&&finite(r.targetBW)&&Number(r.targetBW)>0)return Number(r.appliedSWrap)*Number(r.finalBW)/Number(r.targetBW);
    return NaN;
  }
  function cleanProcessRows(rows){return (rows||[]).filter(r=>r&&finite(processTarget(r))&&processTarget(r)>0&&finite(r.targetBW)&&finite(r.appliedSWrap)&&(r.source!=='completed_cut'||r.success===true));}
  function regressionMetrics(pred,actual){
    if(!pred.length)return {count:0,mae:null,rmse:null,maxError:null};const errors=pred.map((p,i)=>Number(p)-Number(actual[i]));
    return {count:pred.length,mae:mean(errors.map(Math.abs)),rmse:Math.sqrt(mean(errors.map(e=>e*e))),maxError:Math.max(...errors.map(Math.abs))};
  }
  function adaptiveBaseline(trainRows,testRows){
    const usable=cleanProcessRows(trainRows).filter(r=>r.source!=='completed_cut');
    function correctionFor(row){
      let pool=usable.filter(r=>String(r.product||'').toUpperCase()===String(row.product||'').toUpperCase()&&Number(r.mandrel||48)===Number(row.mandrel||48)&&Number(r.extruder||0)===Number(row.extruder||0));
      if(pool.length<5)pool=usable;
      pool=pool.slice(-100);if(pool.length<3)return 0;let weighted=0,total=0;
      pool.forEach((r,i)=>{const rw=.35+.65*((i+1)/pool.length),sw=r.success?1:.65,w=rw*sw;weighted+=(Number(r.correction)||0)*w;total+=w;});return total?weighted/total:0;
    }
    return testRows.map(r=>Math.round((Number(r.formulaSuggestion)||Number(r.appliedSWrap)||0)+correctionFor(r)));
  }

  const CHAT_INTENTS=['greeting','thanks','bw_status','winder_heavy','winder_light','trend','balance','production','process','swrap_change','start_shift','changeover','continue','cancel','other'];
  const CHAT_SEED_EXAMPLES=[
    ['hola','greeting'],['buenas','greeting'],['que onda viejito','greeting'],['hello','greeting'],['hi','greeting'],
    ['gracias','thanks'],['muchas gracias','thanks'],['thanks','thanks'],['perfecto gracias','thanks'],
    ['como va el bw','bw_status'],['como esta el gramaje','bw_status'],['bw status','bw_status'],['que paso con el bw','bw_status'],
    ['w2 sigue pesado','winder_heavy'],['la dos sigue pesada','winder_heavy'],['esa madre sigue arriba','winder_heavy'],['winder 1 esta pesado','winder_heavy'],['w2 is still heavy','winder_heavy'],
    ['w1 esta liviano','winder_light'],['la uno esta ligera','winder_light'],['winder 2 sigue bajo','winder_light'],['w2 is light','winder_light'],
    ['sigue subiendo','trend'],['esa madre sigue subiendo','trend'],['va bajando','trend'],['como va la tendencia','trend'],['is it still rising','trend'],
    ['como esta el balance','balance'],['hay desbalance','balance'],['que lado esta pesado','balance'],['sheet balance','balance'],
    ['como vamos de produccion','production'],['cuanto output llevamos','production'],['lbs por hora','production'],['production status','production'],
    ['primary y secondary','process'],['como esta la presion','process'],['process status','process'],['melt y motor load','process'],
    ['bajale dos','swrap_change'],['subela a 180','swrap_change'],['pon swrap 170','swrap_change'],['deja el swrap en 168','swrap_change'],['set swrap to 175','swrap_change'],
    ['empieza linea 2','start_shift'],['inicia el turno','start_shift'],['start line 3','start_shift'],['start shift','start_shift'],
    ['cambio de producto','changeover'],['haz changeover','changeover'],['vamos a cambiar producto','changeover'],['changeover','changeover'],
    ['continua','continue'],['seguimos','continue'],['retoma','continue'],['continue','continue'],
    ['cancela','cancel'],['olvida eso','cancel'],['cancel','cancel'],['no hagas eso','cancel'],
    ['que paso con la 2','other'],['y la otra','other'],['dejala asi','other'],['cuanto le bajo','other']
  ];
  const normalizeText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!,.;:()\[\]{}]/g,' ').replace(/\s+/g,' ').trim();
  function fnv1a(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function chatFeatures(text,buckets=96){
    const q=normalizeText(text),tokens=q.split(/\s+/).filter(Boolean),v=Array(buckets+8).fill(0);
    const grams=tokens.concat(tokens.slice(0,-1).map((t,i)=>`${t}_${tokens[i+1]}`));for(const token of grams){const idx=fnv1a(token)%buckets;v[idx]+=1;}
    const scale=Math.max(1,Math.sqrt(grams.length));for(let i=0;i<buckets;i++)v[i]/=scale;
    v[buckets]=Math.min(1,tokens.length/16);v[buckets+1]=/\d/.test(q)?1:0;v[buckets+2]=/\b(?:w1|w2|winder|rollo|roll)\b/.test(q)?1:0;
    v[buckets+3]=/\b(?:linea|line)\s*[1-4]\b/.test(q)?1:0;v[buckets+4]=/\b(?:pesad|heavy|arriba|alto)\w*/.test(q)?1:0;v[buckets+5]=/\b(?:livian|light|bajo|liger)\w*/.test(q)?1:0;
    v[buckets+6]=/\b(?:subiendo|rising|bajando|falling|trend|tendencia)\b/.test(q)?1:0;v[buckets+7]=/[?¿]/.test(String(text))?1:0;return v;
  }
  function resolveChatReferences(text,session={}){
    const q=normalizeText(text);let line=null,winder=null,ambiguous=false;
    let m=q.match(/\b(?:linea|line)\s*([1-4])\b/);if(m)line=Number(m[1]);
    m=q.match(/\b(?:winder|w|rollo|roll)\s*([12])\b/);if(m)winder=Number(m[1]);
    if(!winder&&/\b(?:la|el)\s+(?:otra|otro)\b|\bthe other\b/.test(q)&&[1,2].includes(Number(session.lastWinder)))winder=Number(session.lastWinder)===1?2:1;
    if(!line&&!winder){m=q.match(/\b(?:la|el)\s+(?:uno|una|1|dos|2)\b/);if(m){const n=/dos|2/.test(m[0])?2:1;if(/\b(?:pesad|livian|light|heavy|winder|rollo|roll|arriba|bajo)\w*/.test(q)||session.lastEntityType==='winder')winder=n;else ambiguous=true;}}
    if(!winder&&[1,2].includes(Number(session.lastWinder))&&/\b(?:sigue|todavia|aun|still|esa|esta|la misma|it)\b/.test(q))winder=Number(session.lastWinder);
    return {line,winder,ambiguous};
  }
  function ruleIntent(text){
    const q=normalizeText(text);
    if(/^(hola|buenas|hello|hi|que onda)\b/.test(q))return 'greeting';if(/\b(gracias|thanks|thank you)\b/.test(q))return 'thanks';
    if(/\b(cancel|cancela|olvida eso|no hagas eso)\b/.test(q))return 'cancel';if(/\b(continua|seguimos|retoma|continue|resume)\b/.test(q))return 'continue';
    if(/\b(changeover|cambio de producto|cambiar producto)\b/.test(q))return 'changeover';if(/\b(start|empieza|inicia|comienza)\b.*\b(shift|turno|line|linea)\b/.test(q))return 'start_shift';
    if(/\b(?:baja|bajale|sube|subela|pon|set|deja)\b.*\b(?:s[- ]?wrap|\d+)\b/.test(q))return 'swrap_change';
    if(/\b(?:pesad|heavy|arriba|alto)\w*/.test(q)&&/\b(?:w\s*[12]|winder|la uno|la dos|sigue|todavia)\b/.test(q))return 'winder_heavy';
    if(/\b(?:livian|light|liger|bajo)\w*/.test(q)&&/\b(?:w\s*[12]|winder|la uno|la dos|sigue|todavia)\b/.test(q))return 'winder_light';
    if(/\b(tendencia|trend|subiendo|bajando|rising|falling)\b/.test(q))return 'trend';if(/\b(balance|desbalance|die|sheet)\b/.test(q))return 'balance';
    if(/\b(produccion|production|output|lbs\/?hr|lbs por hora)\b/.test(q))return 'production';if(/\b(primary|secondary|primario|secundario|pressure|presion|melt|motor load)\b/.test(q))return 'process';
    if(/\b(bw|gramaje)\b/.test(q))return 'bw_status';return 'other';
  }

  class ChatFitBrain{
    constructor({seed=2026,hidden=[16,8]}={}){this.seed=seed;this.hidden=hidden;this.model=null;this.trained=false;this.sessionByLine=new Map();}
    session(line=1){const n=Number(line)||1;if(!this.sessionByLine.has(n))this.sessionByLine.set(n,{lastIntent:null,lastWinder:null,lastEntityType:null,lastText:null,turns:0});return this.sessionByLine.get(n);}
    async fit(extraExamples=[],options={}){
      const rows=CHAT_SEED_EXAMPLES.concat((extraExamples||[]).filter(x=>Array.isArray(x)&&CHAT_INTENTS.includes(x[1])));
      const byIntent=new Map();rows.forEach(r=>{if(!byIntent.has(r[1]))byIntent.set(r[1],[]);byIntent.get(r[1]).push(r);});
      const trainRows=[],valRows=[];for(const intent of CHAT_INTENTS){const group=byIntent.get(intent)||[];if(group.length>=3){const hold=Math.min(group.length-1,Math.floor(group.length/2));valRows.push(group[hold]);trainRows.push(...group.filter((_,i)=>i!==hold));}else trainRows.push(...group);}
      const trainX=trainRows.map(r=>chatFeatures(r[0])),trainY=trainRows.map(r=>CHAT_INTENTS.indexOf(r[1])),valX=valRows.map(r=>chatFeatures(r[0])),valY=valRows.map(r=>CHAT_INTENTS.indexOf(r[1]));
      this.model=new DenseFitModel({inputSize:trainX[0].length,hidden:this.hidden,outputSize:CHAT_INTENTS.length,task:'classification',seed:this.seed,learningRate:.012});
      const history=await this.model.fit(trainX,trainY,{epochs:options.epochs||180,batchSize:16,validationData:valX.length?[valX,valY]:null,patience:28,onEpochEnd:options.onEpochEnd});this.trained=true;
      const evalRows=valRows.length?valRows:trainRows;let hybridCorrect=0;for(const row of evalRows){const rule=ruleIntent(row[0]),p=this.model.predict([chatFeatures(row[0])])[0],learnedIntent=CHAT_INTENTS[p.index]||'other';let predicted=rule;if(p.confidence>=.72&&(rule==='other'||learnedIntent===rule))predicted=learnedIntent;if(predicted===row[1])hybridCorrect++;}const accuracy=evalRows.length?hybridCorrect/evalRows.length:0;return {history,accuracy,count:rows.length,heldOutCount:valRows.length};
    }
    analyze(text,{line=1,context={}}={}){
      const session=this.session(line),rule=ruleIntent(text);let learned=null;
      if(this.trained&&this.model){const p=this.model.predict([chatFeatures(text)])[0];learned={intent:CHAT_INTENTS[p.index]||'other',confidence:p.confidence};}
      let intent=rule;if(learned&&learned.confidence>=.72&&(rule==='other'||learned.intent===rule))intent=learned.intent;
      const previousIntent=session.lastIntent;const refs=resolveChatReferences(text,session);
      if(intent==='other'&&refs.winder&&['winder_heavy','winder_light','bw_status','balance'].includes(previousIntent))intent=previousIntent;
      else if(intent==='other'&&normalizeText(text).split(/\s+/).length<=4&&['trend','production','process'].includes(previousIntent))intent=previousIntent;
      if(refs.winder){session.lastWinder=refs.winder;session.lastEntityType='winder';}else if(refs.line){session.lastEntityType='line';}
      session.lastIntent=intent;session.lastText=String(text);session.turns++;
      return {intent,ruleIntent:rule,learnedIntent:learned?.intent||null,confidence:learned?.confidence||0,references:refs,contextUsed:{line:Number(line),product:context?.product||null,targetBW:context?.targetBW??null,currentSWrap:context?.currentSWrap??null,lastCut:context?.lastCut||null},session:{...session}};
    }
    toJSON(){return {format:'viejito-chat-fit-v1',seed:this.seed,hidden:this.hidden,trained:this.trained,model:this.model?.toJSON()||null};}
    static fromJSON(data){const b=new ChatFitBrain(data||{});if(data?.model){b.model=DenseFitModel.fromJSON(data.model);b.trained=true;}return b;}
  }

  root.ViejitoLabCore={DenseFitModel,ChatFitBrain,CHAT_INTENTS,CHAT_SEED_EXAMPLES,chatFeatures,resolveChatReferences,ruleIntent,timeSplit,processFeatureRow,processTarget,cleanProcessRows,regressionMetrics,adaptiveBaseline};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ViejitoLabCore;
})(typeof window!=='undefined'?window:globalThis);
