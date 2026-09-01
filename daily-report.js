/* Industrial IA 5.34.6 — Daily Quality + Operator Action Report Engine
   Pure local analysis. No network calls.
   Reports are built from the active isolated data stream: real completed cuts in Production Mode or separate demo cuts/events in Demo Mode.
   Sheet-balance incidents persist across product/changeover boundaries on the same line
   until balance returns within tolerance or the heavy side flips.
*/
(function(root){
  'use strict';

  const DEFAULTS=Object.freeze({
    bwGreen:0.17,
    bwRed:0.25,
    balanceLimit:0.25,
    dieRequired:1.00,
    persistentCuts:3,
    leadCuts:4,
    stableSlope:0.01
  });

  function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
  function timeMs(v){const n=new Date(v||0).getTime();return Number.isFinite(n)?n:0;}
  function localDayKey(value){
    const d=value instanceof Date?value:new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function scheduleInfo(value){
    try{return root.ViejitoShiftSchedule?.shiftAt?.(new Date(value))||null;}catch(_){return null;}
  }
  function sideLabel(side){return side==='top'?'Winder 2 / Top Sheet':side==='bottom'?'Winder 1 / Bottom Sheet':'Balanced';}

  function normalizeCut(raw,line){
    const w1=num(raw?.winder1),w2=num(raw?.winder2),avg=num(raw?.averageBW??raw?.bw??raw?.finalBW);
    const target=num(raw?.targetBW);
    const t=timeMs(raw?.time??raw?.timestamp??raw?.completedAt);
    if(w1===null||w2===null||avg===null||!t)return null;
    const diff=Math.abs(w2-w1);
    const side=w2>w1?'top':w1>w2?'bottom':'balanced';
    const scheduled=scheduleInfo(t);
    return {
      line:Number(line),time:new Date(t).toISOString(),timeMs:t,
      product:String(raw?.product||'—').trim()||'—',runId:raw?.runId||null,shiftId:raw?.shiftId||null,
      shiftCode:String(raw?.shiftCode||scheduled?.code||'').toUpperCase()||null,
      shiftWorkDate:String(raw?.shiftWorkDate||scheduled?.workDate||''),
      operator:String(raw?.operator||''),
      winder1:w1,winder2:w2,averageBW:avg,targetBW:target,currentSWrap:num(raw?.currentSWrap),
      balanceDifference:diff,heavySide:side,
      balanceLevel:diff>=DEFAULTS.dieRequired?'required':diff>=DEFAULTS.balanceLimit?'suggested':'balanced',
      delta:target===null?null:avg-target
    };
  }

  function normalizeEvent(raw,line){
    const t=timeMs(raw?.time??raw?.timestamp);
    if(!t||!raw?.type)return null;
    const scheduled=scheduleInfo(t);
    return {
      ...raw,
      line:Number(line),
      type:String(raw.type),
      time:new Date(t).toISOString(),timeMs:t,
      shiftCode:String(raw?.shiftCode||scheduled?.code||'').toUpperCase()||null,
      shiftWorkDate:String(raw?.shiftWorkDate||scheduled?.workDate||'')
    };
  }

  function filterPeriod(rows,period,now=new Date()){
    const data=[...(rows||[])].sort((a,b)=>a.timeMs-b.timeMs);
    if(!period||period.type==='all')return data;
    if(period.type==='last24'){
      const end=period.end?timeMs(period.end):now.getTime();
      const start=end-24*3600000;
      return data.filter(c=>c.timeMs>=start&&c.timeMs<=end);
    }
    if(period.type==='calendar'){
      const key=String(period.date||localDayKey(now));
      return data.filter(c=>localDayKey(c.timeMs)===key);
    }
    if(period.type==='range'){
      const start=timeMs(period.start),end=timeMs(period.end);
      return data.filter(c=>(!start||c.timeMs>=start)&&(!end||c.timeMs<=end));
    }
    return data;
  }

  function filterShift(rows,shift,period){
    const code=String(shift||'all').toUpperCase();
    if(!code||code==='ALL')return [...(rows||[])];
    if(period?.type==='calendar'){
      // A selected night shift belongs to the work date on which it began at 19:00,
      // so its 00:00–06:59 cuts on the following date remain in the same shift report.
      const key=String(period.date||'');
      return (rows||[]).filter(r=>r.shiftCode===code&&r.shiftWorkDate===key);
    }
    return (rows||[]).filter(r=>r.shiftCode===code);
  }

  function slope(values){
    const pts=(values||[]).map(Number).filter(Number.isFinite);
    const n=pts.length;if(n<2)return 0;
    const xMean=(n-1)/2,yMean=pts.reduce((a,b)=>a+b,0)/n;
    let top=0,bottom=0;
    for(let i=0;i<n;i++){const dx=i-xMean;top+=dx*(pts[i]-yMean);bottom+=dx*dx;}
    return bottom?top/bottom:0;
  }
  function trendLabel(s,stable=DEFAULTS.stableSlope){return s>stable?'rising':s<-stable?'falling':'stable';}

  function finalizeIncident(incident){
    if(!incident)return null;
    const diffs=incident.cuts.map(c=>c.balanceDifference);
    const s=slope(diffs);
    incident.count=incident.cuts.length;
    incident.startTime=incident.cuts[0]?.time||null;
    incident.endTime=incident.cuts[incident.cuts.length-1]?.time||null;
    incident.maxDifference=Math.max(...diffs);
    incident.firstDifference=diffs[0]||0;
    incident.lastDifference=diffs[diffs.length-1]||0;
    incident.balanceTrend=trendLabel(s,0.015);
    incident.improving=incident.lastDifference<incident.firstDifference-0.015;
    incident.worsening=incident.lastDifference>incident.firstDifference+0.015;
    incident.products=[...new Set(incident.cuts.map(c=>c.product).filter(Boolean))];
    incident.shifts=[...new Set(incident.cuts.map(c=>c.shiftCode).filter(Boolean))];
    incident.persistent=incident.count>=DEFAULTS.persistentCuts;
    incident.leadReview=incident.count>=DEFAULTS.leadCuts;
    incident.maxLevel=incident.maxDifference>=DEFAULTS.dieRequired?'required':'suggested';
    incident.incidentKey=`${incident.line}|${incident.side}|${incident.startTime||''}`;
    return incident;
  }

  function balanceIncidents(cuts){
    const rows=[...(cuts||[])].sort((a,b)=>a.timeMs-b.timeMs);
    const incidents=[];let active=null;
    for(const cut of rows){
      if(cut.balanceLevel==='balanced'){
        if(active){incidents.push(finalizeIncident(active));active=null;}
        continue;
      }
      if(!active||active.side!==cut.heavySide){
        if(active)incidents.push(finalizeIncident(active));
        active={line:cut.line,side:cut.heavySide,cuts:[]};
      }
      active.cuts.push(cut);
    }
    if(active)incidents.push(finalizeIncident(active));
    return incidents;
  }

  function activeBalanceStreak(cuts){
    const rows=[...(cuts||[])].sort((a,b)=>a.timeMs-b.timeMs);
    const last=rows[rows.length-1];
    if(!last||last.balanceLevel==='balanced')return null;
    const side=last.heavySide,same=[];
    let flipped=false;
    for(let i=rows.length-1;i>=0;i--){
      const row=rows[i];
      if(row.balanceLevel==='balanced')break;
      if(row.heavySide!==side){flipped=true;break;}
      same.unshift(row);
    }
    const inc=finalizeIncident({line:last.line,side,cuts:same});
    inc.flipped=flipped;inc.last=last;
    return inc;
  }

  function productTrends(cuts){
    const groups=new Map();
    for(const c of cuts||[]){const key=c.product||'—';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
    return [...groups.entries()].map(([product,rows])=>{
      rows.sort((a,b)=>a.timeMs-b.timeMs);
      const deltas=rows.map(r=>r.delta).filter(Number.isFinite),s=slope(deltas);
      return {product,count:rows.length,slope:s,direction:trendLabel(s),firstBW:rows[0]?.averageBW,lastBW:rows[rows.length-1]?.averageBW,targetBW:rows[rows.length-1]?.targetBW,firstDelta:deltas[0]??null,lastDelta:deltas[deltas.length-1]??null};
    }).sort((a,b)=>b.count-a.count);
  }

  function actionSummary(events){
    const rows=[...(events||[])].sort((a,b)=>a.timeMs-b.timeMs);
    const swrapChanges=rows.filter(e=>e.type==='swrap_change');
    const applied=rows.filter(e=>e.type==='recommendation_accepted');
    const notApplied=rows.filter(e=>e.type==='recommendation_not_used');
    const leadRequests=rows.filter(e=>e.type==='lead_notification_requested'||e.type==='bw_lead_notification_requested');
    const leadAnswers=rows.filter(e=>e.type==='lead_confirmation'||e.type==='bw_lead_confirmation');
    return {
      events:rows,
      swrapChanges:swrapChanges.length,
      recommendationsApplied:applied.length,
      recommendationsNotApplied:notApplied.length,
      recommendationOpportunities:applied.length+notApplied.length,
      keptCurrent:notApplied.filter(e=>e.reason==='keep_current').length,
      noResponse:notApplied.filter(e=>['next_cut','shift_end','shift_boundary','changeover'].includes(e.reason)).length,
      leadRequests:leadRequests.length,
      leadConfirmed:leadAnswers.filter(e=>e.status==='yes').length,
      leadNotConfirmed:leadAnswers.filter(e=>e.status==='no').length,
      swrapRows:swrapChanges,
      recommendationRows:[...applied,...notApplied].sort((a,b)=>a.timeMs-b.timeMs),
      leadRows:[...leadRequests,...leadAnswers].sort((a,b)=>a.timeMs-b.timeMs)
    };
  }

  function summarizeLine(line,cuts,events=[],options={}){
    const cfg={...DEFAULTS,...options};
    const rows=[...(cuts||[])].sort((a,b)=>a.timeMs-b.timeMs);
    const incidents=balanceIncidents(rows),activeStreak=activeBalanceStreak(rows);
    const withTarget=rows.filter(c=>Number.isFinite(c.delta));
    const green=withTarget.filter(c=>Math.abs(c.delta)<=cfg.bwGreen).length;
    const warning=withTarget.filter(c=>Math.abs(c.delta)>cfg.bwGreen&&Math.abs(c.delta)<cfg.bwRed).length;
    const out=withTarget.filter(c=>Math.abs(c.delta)>=cfg.bwRed).length;
    const imbalance=rows.filter(c=>c.balanceDifference>=cfg.balanceLimit).length;
    const required=rows.filter(c=>c.balanceDifference>=cfg.dieRequired).length;
    const maxBalance=rows.length?Math.max(...rows.map(c=>c.balanceDifference)):0;
    const deltaSlope=slope(withTarget.map(c=>c.delta));
    const products=[...new Set(rows.map(c=>c.product).filter(Boolean))];
    const shifts=[...new Set(rows.map(c=>c.shiftCode).filter(Boolean))];
    return {
      line:Number(line),cuts:rows,totalCuts:rows.length,products,shifts,
      bw:{withTarget:withTarget.length,green,warning,out,slope:deltaSlope,direction:trendLabel(deltaSlope),firstDelta:withTarget[0]?.delta??null,lastDelta:withTarget[withTarget.length-1]?.delta??null},
      balance:{imbalanceCuts:imbalance,requiredCuts:required,maxDifference:maxBalance,incidents,persistentIncidents:incidents.filter(i=>i.persistent),leadReviewIncidents:incidents.filter(i=>i.leadReview),activeStreak},
      actions:actionSummary(events),
      productTrends:productTrends(rows)
    };
  }

  function periodEndMs(period,now=new Date(),shift='all'){
    if(period?.type==='calendar'&&shift&&String(shift).toUpperCase()!=='ALL'){
      try{
        const window=root.ViejitoShiftSchedule?.shiftWindow?.(period.date,String(shift).toUpperCase());
        if(window)return timeMs(window.end);
      }catch(_){}
    }
    if(!period||period.type==='last24')return period?.end?timeMs(period.end):now.getTime();
    if(period.type==='calendar')return new Date(`${String(period.date||localDayKey(now))}T23:59:59.999`).getTime();
    if(period.type==='range')return timeMs(period.end)||now.getTime();
    return now.getTime();
  }

  function buildReport(lines,period,now=new Date(),options={}){
    const results=[],shift=String(options.shift||'all').toUpperCase(),endMs=periodEndMs(period,now,shift);
    for(const entry of lines||[]){
      const normalized=(entry.cuts||[]).map(c=>normalizeCut(c,entry.line)).filter(Boolean).sort((a,b)=>a.timeMs-b.timeMs);
      const normalizedEvents=(entry.events||[]).map(e=>normalizeEvent(e,entry.line)).filter(Boolean).sort((a,b)=>a.timeMs-b.timeMs);
      let filtered=filterPeriod(normalized,period,now);
      let filteredEvents=filterPeriod(normalizedEvents,period,now);
      if(shift!=='ALL'){
        if(period?.type==='calendar'){
          filtered=filterShift(normalized,shift,period);
          filteredEvents=filterShift(normalizedEvents,shift,period);
        }else{
          filtered=filterShift(filtered,shift,period);
          filteredEvents=filterShift(filteredEvents,shift,period);
        }
      }
      const summary=summarizeLine(entry.line,filtered,filteredEvents,options);
      // The unresolved balance streak is line-based across products and shifts. It is intentionally
      // not reset by report filtering; the report can show that the selected shift inherited an issue.
      summary.balance.activeStreak=activeBalanceStreak(normalized.filter(c=>c.timeMs<=endMs));
      results.push(summary);
    }
    return {
      generatedAt:now.toISOString(),period,shift,lines:results,
      totalCuts:results.reduce((n,r)=>n+r.totalCuts,0),
      totalSWrapChanges:results.reduce((n,r)=>n+r.actions.swrapChanges,0),
      totalRecommendationsApplied:results.reduce((n,r)=>n+r.actions.recommendationsApplied,0),
      totalRecommendationsNotApplied:results.reduce((n,r)=>n+r.actions.recommendationsNotApplied,0),
      leadReviewLines:results.filter(r=>r.balance.leadReviewIncidents.length||r.balance.activeStreak?.leadReview).map(r=>r.line)
    };
  }

  root.ViejitoDailyReport={DEFAULTS,localDayKey,sideLabel,normalizeCut,normalizeEvent,filterPeriod,filterShift,slope,trendLabel,balanceIncidents,activeBalanceStreak,productTrends,actionSummary,summarizeLine,periodEndMs,buildReport};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ViejitoDailyReport;
})(typeof window!=='undefined'?window:globalThis);
