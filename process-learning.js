/*
  Industrial IA 5.27 — Process Performance Learning
  Learns empirical Primary RPM + Secondary RPM -> output behavior from real plant samples.
  This module is intentionally separate from the Davis-Standard Knowledge Brain and from
  the S-Wrap/BW control optimizer. It predicts; measured roll BW remains authoritative.
*/
(function(){
  const finitePositive=v=>Number.isFinite(Number(v))&&Number(v)>0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const normProduct=v=>String(v||'').trim().toUpperCase().replace(/\s+/g,' ');

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
        motorLoad:finitePositive(record.motorLoad)?Number(record.motorLoad):null,targetBW:finitePositive(record.targetBW)?Number(record.targetBW):null,
        measuredBW:finitePositive(record.measuredBW)?Number(record.measuredBW):null
      };
      this.records.push(row);this.records=this.records.slice(-600);this.save();return row;
    }
    estimate({primaryRPM,secondaryRPM,product='',mandrel=null}={}){
      const p=Number(primaryRPM),s=Number(secondaryRPM);if(!finitePositive(p)||!finitePositive(s))return {ready:false,count:0};
      const requestedProduct=normProduct(product);const m=Number(mandrel)||null;
      let pool=this.records.filter(r=>finitePositive(r.outputLbHr));
      const exactProduct=requestedProduct?pool.filter(r=>normProduct(r.product)===requestedProduct):[];
      let scope='line';
      if(exactProduct.length>=3){pool=exactProduct;scope='product';}
      else if(m){const sameMandrel=pool.filter(r=>Number(r.mandrel)===m);if(sameMandrel.length>=3){pool=sameMandrel;scope='mandrel';}}
      if(!pool.length)return {ready:false,count:0,scope};
      const scored=pool.map((r,index)=>{
        const dp=Math.abs(Number(r.primaryRPM)-p),ds=Math.abs(Number(r.secondaryRPM)-s);
        const distance=(dp/12)+(ds/1.5);
        const ageWeight=.55+.45*((index+1)/pool.length);
        const weight=ageWeight/Math.pow(.45+distance,2);
        return {r,dp,ds,distance,weight};
      }).sort((a,b)=>a.distance-b.distance).slice(0,24);
      // Prefer genuinely nearby observations. Fall back to nearest samples only when necessary.
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
      return {ready:selected.length>=3,count:selected.length,totalRecords:this.records.length,outputLbHr:Number(output.toFixed(1)),spread:Number(spread.toFixed(1)),min:Number(min.toFixed(1)),max:Number(max.toFixed(1)),confidence:clamp(confidence,0,99),scope,avgDistance:Number(avgDistance.toFixed(2))};
    }
    summary(){return {count:this.records.length,last:this.records[this.records.length-1]||null};}
  }
  window.ProcessPerformanceLearning=ProcessPerformanceLearning;
})();
