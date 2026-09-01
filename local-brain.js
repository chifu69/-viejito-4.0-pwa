/* Industrial IA 5.34.6 — Viejito Local Brain
   Deterministic offline orchestration layer. No LLM, no network calls.
   It plans which existing Viejito skills to use and ranks findings by operational priority.
*/
(function(root){
  'use strict';

  const LEVEL_SCORE=Object.freeze({
    critical:100,
    corrective:90,
    balance:80,
    warning:70,
    preventive:60,
    production:50,
    learning:30,
    info:10
  });

  function normalize(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9/#+.\- ]+/g,' ')
      .replace(/\s+/g,' ').trim();
  }

  class ViejitoLocalBrain{
    constructor({version='5.34.6',name='Viejito Local Brain'}={}){
      this.version=version;
      this.name=name;
      this.skills=new Map();
      this.lastPlan=null;
      this.lastRun=null;
    }

    registerSkill(name,handler,meta={}){
      if(!name||typeof handler!=='function')throw new Error('Brain skill requires a name and handler.');
      this.skills.set(String(name),{name:String(name),handler,meta:{readOnly:true,...meta}});
      return this;
    }

    hasSkill(name){return this.skills.has(String(name));}
    skillNames(){return [...this.skills.keys()];}
    describeSkills(){return [...this.skills.values()].map(s=>({name:s.name,...s.meta}));}

    classifyMode(text){
      const q=normalize(text);
      if(/\b(what if|what would|if i|if we|simulate|simulation|hypothetical|que pasa si|como saldria|como saldría|si pongo|si subo|si bajo|podriamos|podriamos|podria|podría)\b/.test(q))return 'simulation';
      if(/\b(save sample|save record|record process|learn this|train|guardar muestra|guardar registro|registrar proceso|aprende esto|entrenar)\b/.test(q))return 'training';
      if(/\b(set|apply|accept|start|end|change|switch|open|clear|reset|pon|aplica|acepta|empieza|inicia|termina|cambia|abre|borra|reinicia)\b/.test(q))return 'action';
      return 'query';
    }

    detectIntent(text){
      const q=normalize(text);
      const candidates=[];
      const hit=(intent,score,reason)=>candidates.push({intent,score,reason});

      if(/\b(brain status|brain skills|local brain|cerebro local|estado del brain|estado del cerebro|que sabe el brain|que sabe el cerebro)\b/.test(q))hit('brain_status',100,'explicit brain request');
      if(/\b(compare|comparison|which line|best line|worst line|compare lines|compara|comparar|cual linea|que linea|mejor linea|peor linea|las cuatro lineas|4 lineas)\b/.test(q))hit('compare_lines',96,'cross-line comparison');
      if(/\b(review everything|full review|analyze everything|check everything|overall health|what should i watch|what needs attention|revisa todo|analiza todo|checa todo|revision completa|salud de la linea|que debo vigilar|que necesita atencion|como ves la linea)\b/.test(q))hit('full_review',94,'composite line review');
      if(/\b(how are we|how is line|line status|current status|status line|what happened with|what happened to|como vamos|estado de la linea|como esta la linea|como va la linea|que paso con|que pasa con|running|corriendo)\b/.test(q) || (/\b(status|estado|como va|como esta|how is|que paso|what happened)\b/.test(q)&&/\b(line|linea|extruder|extrusor|la)\s*[1-4]?\b/.test(q)))hit('line_health',90,'line health');
      if(/\b(sheet balance|die move|winder 1|winder 2|w1|w2|top sheet|bottom sheet|heavier|heavy side|balance de sheet|desbalance|lado pesado|pesado)\b/.test(q))hit('sheet_balance',86,'sheet balance');
      if(/\b(trend|tendency|projected bw|next bw|rising|falling|going up|going down|tendencia|proximo bw|próximo bw|subiendo|bajando)\b/.test(q))hit('trend_analysis',84,'BW trend');
      if(/\b(production|current rate|target rate|lbs per hour|lbs\/hr|forecast|projected end|produccion|producción|libras por hora|ritmo|proyeccion final|proyección final)\b/.test(q))hit('production_status',82,'production');
      if(/\b(adaptive learning|machine learning|learning status|process learning|process performance|aprendizaje|como esta aprendiendo|cómo está aprendiendo|aprendizaje de proceso)\b/.test(q))hit('learning_status',80,'learning');
      if(/\b(last rolls|recent rolls|recent cuts|last cuts|ultimos rollos|últimos rollos|ultimos cortes|últimos cortes|historial de bw)\b/.test(q))hit('recent_history',76,'recent history');

      candidates.sort((a,b)=>b.score-a.score);
      return candidates[0]||{intent:'unknown',score:0,reason:'no brain-owned intent'};
    }

    makePlan(text){
      const mode=this.classifyMode(text);
      const detected=this.detectIntent(text);
      const map={
        brain_status:['context.snapshot','brain.status'],
        compare_lines:['line.compare'],
        full_review:['context.snapshot','bw.status','trend.status','sheet.status','production.status','adaptive.status','process.status'],
        line_health:['context.snapshot','bw.status','trend.status','sheet.status','production.status'],
        sheet_balance:['context.snapshot','sheet.status'],
        trend_analysis:['context.snapshot','bw.status','trend.status'],
        production_status:['context.snapshot','production.status'],
        learning_status:['context.snapshot','adaptive.status','process.status'],
        recent_history:['context.snapshot','history.recent']
      };
      const skills=(map[detected.intent]||[]).filter(name=>this.hasSkill(name));
      const plan={version:this.version,text:String(text||''),mode,intent:detected.intent,confidence:detected.score,reason:detected.reason,skills,handled:skills.length>0};
      this.lastPlan=plan;
      return plan;
    }

    run(text,extra={}){
      const plan=this.makePlan(text);
      if(!plan.handled)return null;
      const results=[];
      for(const name of plan.skills){
        const skill=this.skills.get(name);
        try{
          const value=skill.handler({text:String(text||''),plan,mode:plan.mode,intent:plan.intent,...extra});
          if(value!==undefined&&value!==null)results.push({skill:name,value,meta:skill.meta});
        }catch(error){
          results.push({skill:name,error:String(error?.message||error),meta:skill.meta});
        }
      }
      const run={plan,results,findings:this.rankFindings(results)};
      this.lastRun=run;
      return run;
    }

    rankFindings(results){
      const findings=[];
      for(const result of results||[]){
        const source=result?.skill||'unknown';
        const value=result?.value;
        const rows=Array.isArray(value?.findings)?value.findings:[];
        for(const row of rows){
          const level=String(row?.level||'info').toLowerCase();
          findings.push({...row,source,level,score:Number(row?.score)||LEVEL_SCORE[level]||0});
        }
      }
      return findings.sort((a,b)=>b.score-a.score);
    }
  }

  root.ViejitoLocalBrain=ViejitoLocalBrain;
  root.VIEJITO_BRAIN_PRIORITY=LEVEL_SCORE;
  if(typeof module!=='undefined'&&module.exports)module.exports={ViejitoLocalBrain,LEVEL_SCORE,normalize};
})(typeof window!=='undefined'?window:globalThis);
