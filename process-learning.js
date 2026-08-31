/*
  Industrial IA 5.32.4 — Process Performance Learning (restored 5.32 engine)
  Learns empirical Primary RPM + Secondary RPM -> output/pressure/process behavior from real plant samples.
  This module is intentionally separate from the Davis-Standard Knowledge Brain and from
  the S-Wrap/BW control optimizer. It predicts; measured roll BW remains authoritative.
*/
(function(){
  const finitePositive=v=>Number.isFinite(Number(v))&&Number(v)>0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const normProduct=v=>String(v||'').trim().toUpperCase().replace(/\s+/g,' ');
  const PRIMARY_MIN=60,PRIMARY_MAX=128,SECONDARY_MIN=5,SECONDARY_MAX=13,PRESSURE_SHUTDOWN=5500;
  const roundTo=(v,step)=>Math.round(Number(v)/step)*step;

  class ProcessPerformanceLearning{
    constructor(storage=window.localStorage,key='viejitoProcessPerformanceV1'){
      this.storage=storage; this.key=key; this.records=this.load();
    }
    load(){
      try{
        const rows=JSON.parse(this.storage?.getItem?.(this.key)||'[]');
        return Array.isArray(rows)?rows.filter(r=>r&&finitePositive(r.primaryRPM)&&finitePositive(r.secondaryRPM)&&finitePositive(r.outputLbHr)).slice(-600):[];
      }catch(_){return [];}
    }
    save(){try{this.storage?.setItem?.(this.key,JSON.stringify(this.records.slice(-600)));}catch(_){} }
    clear(){this.records=[];this.save();}
    add(record={}){
      const primaryRPM=Number(record.primaryRPM),secondaryRPM=Number(record.secondaryRPM),outputLbHr=Number(record.outputLbHr);
      if(!finitePositive(primaryRPM)||!finitePositive(secondaryRPM)||!finitePositive(outputLbHr))throw new Error('Primary RPM, Secondary RPM and output must be greater than zero.');
      const row={
        id:record.id||`ppl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        timestamp:record.timestamp||new Date().toISOString(),
        primaryRPM:Number(primaryRPM.toFixed(2)),secondaryRPM:Number(secondaryRPM.toFixed(2)),outputLbHr:Number(outputLbHr.toFixed(1)),
        swrapSpeed:finitePositive(record.swrapSpeed)?Number(Number(record.swrapSpeed).toFixed(2)):null,
        product:normProduct(record.product),mandrel:finitePositive(record.mandrel)?Number(record.mandrel):null,
        totalWidth:finitePositive(record.totalWidth)?Number(record.totalWidth):null,line:finitePositive(record.line)?Number(record.line):null,
        winder1Weight:finitePositive(record.winder1Weight)?Number(record.winder1Weight):null,winder2Weight:finitePositive(record.winder2Weight)?Number(record.winder2Weight):null,
        runMinutes:finitePositive(record.runMinutes)?Number(record.runMinutes):null,
        melt:finitePositive(record.melt)?Number(record.melt):null,secondaryHeat:finitePositive(record.secondaryHeat)?Number(record.secondaryHeat):null,
        motorLoad:finitePositive(record.motorLoad)?Number(record.motorLoad):null,primaryPressure:finitePositive(record.primaryPressure)?Number(record.primaryPressure):null,
        targetBW:finitePositive(record.targetBW)?Number(record.targetBW):null,
        measuredBW:finitePositive(record.measuredBW)?Number(record.measuredBW):null,
        winder1BW:finitePositive(record.winder1BW)?Number(record.winder1BW):null,
        winder2BW:finitePositive(record.winder2BW)?Number(record.winder2BW):null,
        entrySource:String(record.entrySource||'chat').trim().toLowerCase(),
        operator:String(record.operator||'').trim().slice(0,60)
      };
      this.records.push(row);this.records=this.records.slice(-600);this.save();return row;
    }
    update(id,patch={}){
      const index=this.records.findIndex(r=>r&&r.id===id);
      if(index<0)return null;
      const current=this.records[index];
      const next={...current};
      const numericFields=['primaryRPM','secondaryRPM','outputLbHr','swrapSpeed','mandrel','totalWidth','line','winder1Weight','winder2Weight','runMinutes','melt','secondaryHeat','motorLoad','primaryPressure','targetBW','measuredBW','winder1BW','winder2BW'];
      numericFields.forEach(key=>{
        if(Object.prototype.hasOwnProperty.call(patch,key)){
          const value=Number(patch[key]);
          next[key]=finitePositive(value)?value:null;
        }
      });
      if(Object.prototype.hasOwnProperty.call(patch,'product'))next.product=normProduct(patch.product);
      if(Object.prototype.hasOwnProperty.call(patch,'entrySource'))next.entrySource=String(patch.entrySource||current.entrySource||'chat').trim().toLowerCase();
      if(Object.prototype.hasOwnProperty.call(patch,'operator'))next.operator=String(patch.operator||'').trim().slice(0,60);
      this.records[index]=next;this.save();return next;
    }
    byId(id){return this.records.find(r=>r&&r.id===id)||null;}
    _pool({product='',mandrel=null}={}){
      const requestedProduct=normProduct(product);const m=Number(mandrel)||null;
      let pool=this.records.filter(r=>finitePositive(r.outputLbHr));
      const exactProduct=requestedProduct?pool.filter(r=>normProduct(r.product)===requestedProduct):[];
      let scope='line';
      if(exactProduct.length>=3){pool=exactProduct;scope='product';}
      else if(m){const sameMandrel=pool.filter(r=>Number(r.mandrel)===m);if(sameMandrel.length>=3){pool=sameMandrel;scope='mandrel';}}
      return {pool,scope,requestedProduct};
    }
    _metric(selected,key){
      const rows=selected.filter(x=>finitePositive(x.r?.[key]));
      if(!rows.length)return {value:null,spread:null,count:0};
      const tw=rows.reduce((sum,x)=>sum+x.weight,0)||1;
      const value=rows.reduce((sum,x)=>sum+Number(x.r[key])*x.weight,0)/tw;
      const variance=rows.reduce((sum,x)=>sum+Math.pow(Number(x.r[key])-value,2)*x.weight,0)/tw;
      return {value:Number(value.toFixed(1)),spread:Number(Math.sqrt(Math.max(0,variance)).toFixed(1)),count:rows.length};
    }
    estimate({primaryRPM,secondaryRPM,product='',mandrel=null}={}){
      const p=Number(primaryRPM),s=Number(secondaryRPM);if(!finitePositive(p)||!finitePositive(s))return {ready:false,count:0};
      const {pool:initialPool,scope,requestedProduct}=this._pool({product,mandrel});
      let pool=initialPool;
      if(!pool.length)return {ready:false,count:0,scope};
      const scored=pool.map((r,index)=>{
        const dp=Math.abs(Number(r.primaryRPM)-p),ds=Math.abs(Number(r.secondaryRPM)-s);
        const distance=(dp/12)+(ds/1.5);
        const ageWeight=.55+.45*((index+1)/pool.length);
        const weight=ageWeight/Math.pow(.45+distance,2);
        return {r,dp,ds,distance,weight};
      }).sort((a,b)=>a.distance-b.distance).slice(0,24);
      let selected=scored.filter(x=>x.dp<=22&&x.ds<=3.5);
      if(selected.length<3)selected=scored.slice(0,Math.min(12,scored.length));
      const totalWeight=selected.reduce((sum,x)=>sum+x.weight,0)||1;
      const output=selected.reduce((sum,x)=>sum+Number(x.r.outputLbHr)*x.weight,0)/totalWeight;
      const variance=selected.reduce((sum,x)=>sum+Math.pow(Number(x.r.outputLbHr)-output,2)*x.weight,0)/totalWeight;
      const spread=Math.sqrt(Math.max(0,variance));
      const avgDistance=selected.reduce((sum,x)=>sum+x.distance*x.weight,0)/totalWeight;
      const sampleScore=Math.min(1,selected.length/12);
      const proximityScore=clamp(1-avgDistance/5,0,1);
      const consistencyScore=clamp(1-spread/Math.max(350,output*.25),0,1);
      let confidence=Math.round(100*(.5*sampleScore+.3*proximityScore+.2*consistencyScore));
      if(scope!=='product'&&requestedProduct)confidence=Math.max(0,confidence-12);
      const min=Math.max(0,output-spread),max=output+spread;
      const pressure=this._metric(selected,'primaryPressure');
      const melt=this._metric(selected,'melt');
      const heat=this._metric(selected,'secondaryHeat');
      const load=this._metric(selected,'motorLoad');
      return {
        ready:selected.length>=3,count:selected.length,totalRecords:this.records.length,
        outputLbHr:Number(output.toFixed(1)),spread:Number(spread.toFixed(1)),min:Number(min.toFixed(1)),max:Number(max.toFixed(1)),
        confidence:clamp(confidence,0,99),scope,avgDistance:Number(avgDistance.toFixed(2)),
        primaryPressure:pressure.value,primaryPressureSpread:pressure.spread,primaryPressureCount:pressure.count,
        melt:melt.value,meltSpread:melt.spread,meltCount:melt.count,
        secondaryHeat:heat.value,secondaryHeatSpread:heat.spread,secondaryHeatCount:heat.count,
        motorLoad:load.value,motorLoadSpread:load.spread,motorLoadCount:load.count
      };
    }
    secondaryHeatStart(secondaryRPM,estimate=null){
      const s=Number(secondaryRPM);
      if(!finitePositive(s))return {value:null,source:'unavailable'};
      if(estimate&&finitePositive(estimate.secondaryHeat)&&Number(estimate.secondaryHeatCount)>=3){
        return {value:roundTo(estimate.secondaryHeat,5),source:'learned'};
      }
      // Plant anchor examples: ~230 near 6 RPM and ~160 near 12.5 RPM.
      // Interpolate only as a starting recommendation; actual melt/load remains authoritative.
      const lowRPM=6,highRPM=12.5,lowHeat=230,highHeat=160;
      const x=clamp(s,lowRPM,highRPM);
      const interpolated=lowHeat+(highHeat-lowHeat)*((x-lowRPM)/(highRPM-lowRPM));
      return {value:roundTo(interpolated,5),source:'plant-interpolation'};
    }
    recommendForSpeedChange({currentPrimaryRPM,currentSecondaryRPM,currentSWrap,targetSWrap,currentBW=null,targetBW=null,product='',mandrel=null,currentOutputLbHr=null,currentPrimaryPressure=null}={}){
      const cp=Number(currentPrimaryRPM),cs=Number(currentSecondaryRPM),currentSpeed=Number(currentSWrap),targetSpeed=Number(targetSWrap);
      if(!finitePositive(cp)||!finitePositive(cs)||!finitePositive(currentSpeed)||!finitePositive(targetSpeed))return {ready:false,reason:'missing-input'};
      const speedRatio=targetSpeed/currentSpeed;
      const bwRatio=finitePositive(currentBW)&&finitePositive(targetBW)?Number(targetBW)/Number(currentBW):1;
      const requestedRatio=speedRatio*bwRatio;

      // Always preserve the real unconstrained proportional requirement. These values are useful
      // for explaining what the requested speed would mathematically demand, even when the request
      // exceeds the recommended quality envelope and must NOT be used as a setpoint.
      const theoreticalPrimary=cp*requestedRatio;
      const theoreticalSecondary=cs*requestedRatio;

      // Quality/operating envelope for an intentional speed increase. Primary and Secondary are
      // coordinated: whichever component reaches its recommended upper limit first determines the
      // maximum common percentage increase. Secondary 13.0 RPM is a hard recommended quality cap.
      const primaryUpperFactor=PRIMARY_MAX/cp;
      const secondaryUpperFactor=SECONDARY_MAX/cs;
      const maxIncreaseFactor=Math.min(primaryUpperFactor,secondaryUpperFactor);
      const qualityLimited=requestedRatio>1+1e-6 && requestedRatio>maxIncreaseFactor+1e-6;
      const allowedRatio=qualityLimited?Math.max(0,maxIncreaseFactor):requestedRatio;
      const limitingComponent=qualityLimited
        ? (Math.abs(primaryUpperFactor-secondaryUpperFactor)<.002?'both':(secondaryUpperFactor<primaryUpperFactor?'secondary':'primary'))
        : null;

      const maxRecommendedSWrap=qualityLimited
        ? currentSpeed*(allowedRatio/Math.max(.0001,bwRatio))
        : targetSpeed;
      const basePrimary=clamp(cp*allowedRatio,PRIMARY_MIN,PRIMARY_MAX);
      const baseSecondary=clamp(cs*allowedRatio,SECONDARY_MIN,SECONDARY_MAX);
      const currentEstimate=this.estimate({primaryRPM:cp,secondaryRPM:cs,product,mandrel});
      const baselineOutput=finitePositive(currentOutputLbHr)?Number(currentOutputLbHr):(currentEstimate.ready?Number(currentEstimate.outputLbHr):null);
      const requestedTargetOutput=finitePositive(baselineOutput)?baselineOutput*requestedRatio:null;
      const maxRecommendedOutput=finitePositive(baselineOutput)?baselineOutput*allowedRatio:null;

      let best=null;
      // If the requested change exceeds the quality envelope, do not let learned search invent an
      // alternate route around the cap. The cap owns the recommendation and the theoretical values
      // remain visible only as NOT RECOMMENDED reference numbers.
      if(!qualityLimited&&finitePositive(requestedTargetOutput)&&this.records.length>=3){
        const pMin=Math.max(PRIMARY_MIN,Math.floor(basePrimary-10)),pMax=Math.min(PRIMARY_MAX,Math.ceil(basePrimary+10));
        const sMin=Math.max(SECONDARY_MIN,Math.floor((baseSecondary-1.5)*10)/10),sMax=Math.min(SECONDARY_MAX,Math.ceil((baseSecondary+1.5)*10)/10);
        const baselinePressure=finitePositive(currentPrimaryPressure)?Number(currentPrimaryPressure):(finitePositive(currentEstimate.primaryPressure)?Number(currentEstimate.primaryPressure):null);
        for(let p=pMin;p<=pMax+1e-9;p+=1){
          for(let s=sMin;s<=sMax+1e-9;s+=.1){
            const estimate=this.estimate({primaryRPM:p,secondaryRPM:Number(s.toFixed(1)),product,mandrel});
            if(!estimate.ready)continue;
            const pressure=Number(estimate.primaryPressure);
            if(finitePositive(pressure)&&pressure>=PRESSURE_SHUTDOWN)continue;
            const outputError=Math.abs(Number(estimate.outputLbHr)-requestedTargetOutput)/Math.max(1,requestedTargetOutput);
            const proximity=(Math.abs(p-basePrimary)/20)+(Math.abs(s-baseSecondary)/3);
            let pressurePenalty=0;
            if(finitePositive(pressure))pressurePenalty=.035*Math.pow(pressure/PRESSURE_SHUTDOWN,6);
            if(finitePositive(pressure)&&finitePositive(baselinePressure))pressurePenalty+=.015*Math.abs(pressure-baselinePressure)/1500;
            const score=outputError+(.025*proximity)+pressurePenalty;
            if(!best||score<best.score)best={score,primaryRPM:p,secondaryRPM:Number(s.toFixed(1)),estimate};
          }
        }
      }
      const primaryRPM=best?best.primaryRPM:Number(basePrimary.toFixed(1));
      const secondaryRPM=best?best.secondaryRPM:Number(baseSecondary.toFixed(1));
      const estimate=best?best.estimate:this.estimate({primaryRPM,secondaryRPM,product,mandrel});
      const heat=this.secondaryHeatStart(secondaryRPM,estimate);
      const pressure=estimate.ready&&Number(estimate.primaryPressureCount)>=3&&finitePositive(estimate.primaryPressure)?Number(estimate.primaryPressure):null;
      return {
        ready:true,method:qualityLimited?'quality-limited':(best?'learned-search':'proportional-start'),
        ratio:Number(requestedRatio.toFixed(4)),speedRatio:Number(speedRatio.toFixed(4)),bwRatio:Number(bwRatio.toFixed(4)),allowedRatio:Number(allowedRatio.toFixed(4)),
        currentPrimaryRPM:cp,currentSecondaryRPM:cs,currentSWrap:currentSpeed,targetSWrap:targetSpeed,currentBW:finitePositive(currentBW)?Number(currentBW):null,targetBW:finitePositive(targetBW)?Number(targetBW):null,
        theoreticalPrimaryRPM:Number(theoreticalPrimary.toFixed(1)),theoreticalSecondaryRPM:Number(theoreticalSecondary.toFixed(1)),
        qualityLimited,limitingComponent,qualityMaxPrimaryRPM:PRIMARY_MAX,qualityMaxSecondaryRPM:SECONDARY_MAX,
        maxRecommendedSWrap:Number(maxRecommendedSWrap.toFixed(1)),maxRecommendedPrimaryRPM:Number((cp*allowedRatio).toFixed(1)),maxRecommendedSecondaryRPM:Number((cs*allowedRatio).toFixed(1)),
        primaryRPM:Number(primaryRPM.toFixed(1)),secondaryRPM:Number(secondaryRPM.toFixed(1)),secondaryHeat:heat.value,secondaryHeatSource:heat.source,
        currentOutputLbHr:finitePositive(baselineOutput)?Number(baselineOutput.toFixed(1)):null,
        targetOutputLbHr:finitePositive(requestedTargetOutput)?Number(requestedTargetOutput.toFixed(1)):null,
        maxRecommendedOutputLbHr:finitePositive(maxRecommendedOutput)?Number(maxRecommendedOutput.toFixed(1)):null,
        expectedOutputLbHr:estimate.ready&&finitePositive(estimate.outputLbHr)?Number(estimate.outputLbHr.toFixed(1)):null,
        expectedPrimaryPressure:pressure,pressureMargin:finitePositive(pressure)?Number((PRESSURE_SHUTDOWN-pressure).toFixed(0)):null,pressureShutdown:PRESSURE_SHUTDOWN,
        expectedMelt:estimate.ready&&Number(estimate.meltCount)>=3&&finitePositive(estimate.melt)?Number(estimate.melt.toFixed(1)):null,expectedMotorLoad:estimate.ready&&Number(estimate.motorLoadCount)>=3&&finitePositive(estimate.motorLoad)?Number(estimate.motorLoad.toFixed(1)):null,
        confidence:Number(estimate.confidence)||0,comparableSamples:Number(estimate.count)||0,
        primaryInRange:primaryRPM>=PRIMARY_MIN&&primaryRPM<=PRIMARY_MAX,secondaryInRange:secondaryRPM>=SECONDARY_MIN&&secondaryRPM<=SECONDARY_MAX,
        frictionHeatCaution:secondaryRPM>12.5,theoreticalFrictionHeatRisk:theoreticalSecondary>12.5
      };
    }
    recommendForBWCorrection({currentPrimaryRPM,currentSecondaryRPM,currentSWrap,actualBW,targetBW,product='',mandrel=null,currentOutputLbHr=null,currentPrimaryPressure=null,holdTolerance=.17}={}){
      const cp=Number(currentPrimaryRPM),cs=Number(currentSecondaryRPM),speed=Number(currentSWrap),actual=Number(actualBW),target=Number(targetBW);
      if(!finitePositive(cp)||!finitePositive(cs)||!finitePositive(speed)||!finitePositive(actual)||!finitePositive(target))return {ready:false,reason:'missing-input'};
      const deviation=actual-target;
      const hold=Math.abs(deviation)<=Math.max(0,Number(holdTolerance)||0);
      const ratio=hold?1:(target/actual);
      const rawBasePrimary=cp*ratio,rawBaseSecondary=cs*ratio;
      const basePrimary=clamp(rawBasePrimary,PRIMARY_MIN,PRIMARY_MAX);
      const baseSecondary=clamp(rawBaseSecondary,SECONDARY_MIN,SECONDARY_MAX);
      const currentEstimate=this.estimate({primaryRPM:cp,secondaryRPM:cs,product,mandrel});
      const baselineOutput=finitePositive(currentOutputLbHr)?Number(currentOutputLbHr):(currentEstimate.ready?Number(currentEstimate.outputLbHr):null);
      const targetOutput=finitePositive(baselineOutput)?baselineOutput*ratio:null;
      let best=null;
      if(!hold&&finitePositive(targetOutput)&&this.records.length>=3){
        const pMin=Math.max(PRIMARY_MIN,Math.floor(basePrimary-10)),pMax=Math.min(PRIMARY_MAX,Math.ceil(basePrimary+10));
        const sMin=Math.max(SECONDARY_MIN,Math.floor((baseSecondary-1.5)*10)/10),sMax=Math.min(SECONDARY_MAX,Math.ceil((baseSecondary+1.5)*10)/10);
        const baselinePressure=finitePositive(currentPrimaryPressure)?Number(currentPrimaryPressure):(finitePositive(currentEstimate.primaryPressure)?Number(currentEstimate.primaryPressure):null);
        for(let p=pMin;p<=pMax+1e-9;p+=1){
          for(let s=sMin;s<=sMax+1e-9;s+=.1){
            const roundedS=Number(s.toFixed(1));
            const estimate=this.estimate({primaryRPM:p,secondaryRPM:roundedS,product,mandrel});
            if(!estimate.ready)continue;
            const pressure=Number(estimate.primaryPressure);
            if(finitePositive(pressure)&&pressure>=PRESSURE_SHUTDOWN)continue;
            const outputError=Math.abs(Number(estimate.outputLbHr)-targetOutput)/Math.max(1,targetOutput);
            const proximity=(Math.abs(p-basePrimary)/20)+(Math.abs(roundedS-baseSecondary)/3);
            let pressurePenalty=0;
            if(finitePositive(pressure))pressurePenalty=.035*Math.pow(pressure/PRESSURE_SHUTDOWN,6);
            if(finitePositive(pressure)&&finitePositive(baselinePressure))pressurePenalty+=.015*Math.abs(pressure-baselinePressure)/1500;
            const score=outputError+(.025*proximity)+pressurePenalty;
            if(!best||score<best.score)best={score,primaryRPM:p,secondaryRPM:roundedS,estimate};
          }
        }
      }
      const primaryRPM=hold?cp:(best?best.primaryRPM:Number(basePrimary.toFixed(1)));
      const secondaryRPM=hold?cs:(best?best.secondaryRPM:Number(baseSecondary.toFixed(1)));
      const estimate=best?best.estimate:this.estimate({primaryRPM,secondaryRPM,product,mandrel});
      const heat=this.secondaryHeatStart(secondaryRPM,estimate);
      const pressure=estimate.ready&&Number(estimate.primaryPressureCount)>=3&&finitePositive(estimate.primaryPressure)?Number(estimate.primaryPressure):null;
      return {
        ready:true,hold,method:hold?'hold-within-tolerance':(best?'learned-search':'proportional-start'),ratio:Number(ratio.toFixed(4)),
        actualBW:actual,targetBW:target,deviation:Number(deviation.toFixed(4)),holdTolerance:Number(holdTolerance)||0,
        currentPrimaryRPM:cp,currentSecondaryRPM:cs,currentSWrap:speed,
        primaryRPM:Number(primaryRPM.toFixed(1)),secondaryRPM:Number(secondaryRPM.toFixed(1)),secondaryHeat:heat.value,secondaryHeatSource:heat.source,
        currentOutputLbHr:finitePositive(baselineOutput)?Number(baselineOutput.toFixed(1)):null,targetOutputLbHr:finitePositive(targetOutput)?Number(targetOutput.toFixed(1)):null,
        expectedOutputLbHr:estimate.ready&&finitePositive(estimate.outputLbHr)?Number(estimate.outputLbHr.toFixed(1)):null,
        expectedPrimaryPressure:pressure,pressureMargin:finitePositive(pressure)?Number((PRESSURE_SHUTDOWN-pressure).toFixed(0)):null,pressureShutdown:PRESSURE_SHUTDOWN,
        expectedMelt:estimate.ready&&Number(estimate.meltCount)>=3&&finitePositive(estimate.melt)?Number(estimate.melt.toFixed(1)):null,expectedMotorLoad:estimate.ready&&Number(estimate.motorLoadCount)>=3&&finitePositive(estimate.motorLoad)?Number(estimate.motorLoad.toFixed(1)):null,
        confidence:Number(estimate.confidence)||0,comparableSamples:Number(estimate.count)||0,
        primaryAtLimit:rawBasePrimary<PRIMARY_MIN||rawBasePrimary>PRIMARY_MAX,secondaryAtLimit:rawBaseSecondary<SECONDARY_MIN||rawBaseSecondary>SECONDARY_MAX,
        frictionHeatCaution:secondaryRPM>12.5
      };
    }
    summary(){return {count:this.records.length,last:this.records[this.records.length-1]||null};}
  }
  window.ProcessPerformanceLearning=ProcessPerformanceLearning;
})();
