/*
  Viejito Adaptive Process Intelligence — Sprint 2.2
  Global tolerances for every product:
  GREEN  : |actual - target| <= 0.20 (no change)
  YELLOW : 0.20 < |actual - target| < 0.30 (warning)
  RED    : |actual - target| >= 0.30 (change S-Wrap now)

  Learning stays on this device. Every confirmed result contributes a
  correction to the standard S-Wrap formula. The engine uses a recent,
  weighted average and reports confidence from sample count and consistency.
*/
(() => {
  'use strict';

  const GREEN_TOLERANCE = 0.20;
  const WARNING_TOLERANCE = 0.30;
  const LEARNING_KEY = 'viejitoMachineLearningV2';
  const LEGACY_LEARNING_KEY = 'viejitoMachineLearningV1';
  const MAX_RECORDS = 1000;
  const MIN_CONTEXT_RECORDS = 5;

  const finitePositive = value => Number.isFinite(Number(value)) && Number(value) > 0;
  const round1 = value => Number(Number(value).toFixed(1));

  class AdaptiveLearningEngine {
    constructor(storage = window.localStorage, storageKey = LEARNING_KEY) {
      this.storage = storage;
      this.storageKey = storageKey || LEARNING_KEY;
      this.records = this.load();
    }

    load() {
      try {
        const raw = this.storage.getItem(this.storageKey) || (this.storageKey === LEARNING_KEY ? this.storage.getItem(LEGACY_LEARNING_KEY) : null) || '[]';
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(r => r && finitePositive(r.targetBW) && finitePositive(r.appliedSWrap) && finitePositive(r.finalBW)) : [];
      } catch (_) {
        return [];
      }
    }

    save() {
      this.records = this.records.slice(-MAX_RECORDS);
      this.storage.setItem(this.storageKey, JSON.stringify(this.records));
    }

    add(record) {
      const required = ['initialBW','targetBW','currentSWrap','formulaSuggestion','appliedSWrap','finalBW'];
      if (!required.every(key => finitePositive(record[key]))) throw new Error('All learning values must be greater than zero.');
      const idealSWrap = Number(record.appliedSWrap) * Number(record.finalBW) / Number(record.targetBW);
      const correction = idealSWrap - Number(record.formulaSuggestion);
      const saved = {
        id: Date.now(),
        source: record.source || 'confirmed_adjustment',
        timestamp: new Date().toISOString(),
        initialBW: Number(record.initialBW),
        targetBW: Number(record.targetBW),
        currentSWrap: Number(record.currentSWrap),
        formulaSuggestion: Number(record.formulaSuggestion),
        appliedSWrap: Number(record.appliedSWrap),
        finalBW: Number(record.finalBW),
        idealSWrap: round1(idealSWrap),
        correction: round1(correction),
        product: String(record.product || 'UNSPECIFIED').trim().toUpperCase(),
        mandrel: finitePositive(record.mandrel) ? Number(record.mandrel) : 48,
        extruder: [1,2,3,4].includes(Number(record.extruder)) ? Number(record.extruder) : null,
        winder1: finitePositive(record.winder1) ? Number(record.winder1) : null,
        winder2: finitePositive(record.winder2) ? Number(record.winder2) : null,
        averageBW: finitePositive(record.averageBW) ? Number(record.averageBW) : Number(record.initialBW),
        success: Math.abs(Number(record.finalBW) - Number(record.targetBW)) <= GREEN_TOLERANCE
      };
      this.records.push(saved);
      this.save();
      return saved;
    }

    addObservation(record) {
      if (!finitePositive(record.targetBW) || !finitePositive(record.appliedSWrap) || !finitePositive(record.finalBW)) return null;
      const saved = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        source: 'completed_cut',
        timestamp: new Date().toISOString(),
        initialBW: Number(record.finalBW),
        targetBW: Number(record.targetBW),
        currentSWrap: Number(record.appliedSWrap),
        formulaSuggestion: Number(record.appliedSWrap),
        appliedSWrap: Number(record.appliedSWrap),
        finalBW: Number(record.finalBW),
        idealSWrap: Number(record.appliedSWrap),
        correction: 0,
        product: String(record.product || 'UNSPECIFIED').trim().toUpperCase(),
        mandrel: finitePositive(record.mandrel) ? Number(record.mandrel) : 48,
        extruder: [1,2,3,4].includes(Number(record.extruder)) ? Number(record.extruder) : null,
        winder1: finitePositive(record.winder1) ? Number(record.winder1) : null,
        winder2: finitePositive(record.winder2) ? Number(record.winder2) : null,
        averageBW: Number(record.finalBW),
        success: Math.abs(Number(record.finalBW) - Number(record.targetBW)) <= GREEN_TOLERANCE
      };
      this.records.push(saved);
      this.save();
      return saved;
    }

    processProfile(context = {}, targetBW = null) {
      const rows = this.matchingRecords(context)
        .filter(r => finitePositive(r.appliedSWrap) && finitePositive(r.finalBW))
        .slice(-200);
      const count = rows.length;
      if (!count) return {count:0, confidence:0, typicalSWrap:null, bwMean:null, bwSpread:null, stableRate:0, regressionSuggestion:null, recommendedSWrap:null};
      const target = finitePositive(targetBW) ? Number(targetBW) : (finitePositive(rows[rows.length-1]?.targetBW) ? Number(rows[rows.length-1].targetBW) : null);
      const weights = rows.map((_,i)=>0.25 + 0.75*((i+1)/count));
      const weightedMean=(field, filter=()=>true)=>{
        let sum=0,w=0; rows.forEach((r,i)=>{ if(filter(r) && finitePositive(r[field])){sum+=Number(r[field])*weights[i];w+=weights[i];} });
        return w?sum/w:null;
      };
      const stableRows = rows.filter(r => target && Math.abs(Number(r.finalBW)-target) <= GREEN_TOLERANCE);
      const typicalSWrap = stableRows.length
        ? (()=>{let sum=0,w=0; rows.forEach((r,i)=>{if(target && Math.abs(Number(r.finalBW)-target)<=GREEN_TOLERANCE){sum+=Number(r.appliedSWrap)*weights[i];w+=weights[i];}}); return w?sum/w:null;})()
        : weightedMean('appliedSWrap');
      const bwMean = weightedMean('finalBW');
      const variance = rows.reduce((acc,r)=>acc+Math.pow(Number(r.finalBW)-bwMean,2),0)/count;
      const bwSpread = Math.sqrt(variance);
      const stableRate = target ? stableRows.length/count : 0;

      let regressionSuggestion=null, slope=null, r2=0;
      if(count>=6){
        const xs=rows.map(r=>Number(r.appliedSWrap)), ys=rows.map(r=>Number(r.finalBW));
        const mx=xs.reduce((a,b)=>a+b,0)/count, my=ys.reduce((a,b)=>a+b,0)/count;
        let num=0,den=0; for(let i=0;i<count;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=Math.pow(xs[i]-mx,2);}
        if(den>0){
          slope=num/den; const intercept=my-slope*mx;
          const range=Math.max(...xs)-Math.min(...xs);
          let ssRes=0,ssTot=0; for(let i=0;i<count;i++){const pred=intercept+slope*xs[i];ssRes+=Math.pow(ys[i]-pred,2);ssTot+=Math.pow(ys[i]-my,2);}
          r2=ssTot>0?Math.max(0,1-ssRes/ssTot):0;
          if(target && range>=2 && Math.abs(slope)>=0.002){
            const candidate=(target-intercept)/slope;
            if(candidate>=15 && candidate<=230) regressionSuggestion=candidate;
          }
        }
      }
      const sampleScore=Math.min(1,count/35);
      const consistencyScore=Math.max(0,1-bwSpread/0.45);
      const confidence=Math.round(100*sampleScore*(0.55*consistencyScore+0.25*stableRate+0.20*r2));
      const recommendedSWrap = regressionSuggestion!=null && confidence>=45 ? regressionSuggestion : typicalSWrap;
      return {
        count,
        confidence:Math.max(0,Math.min(99,confidence)),
        typicalSWrap:typicalSWrap==null?null:round1(typicalSWrap),
        bwMean:bwMean==null?null:Number(bwMean.toFixed(3)),
        bwSpread:Number(bwSpread.toFixed(3)),
        stableRate:Math.round(stableRate*100),
        slope:slope==null?null:Number(slope.toFixed(5)),
        r2:Math.round(r2*100),
        regressionSuggestion:regressionSuggestion==null?null:round1(regressionSuggestion),
        recommendedSWrap:recommendedSWrap==null?null:round1(recommendedSWrap)
      };
    }

    clear() {
      this.records = [];
      this.storage.removeItem(this.storageKey);
    }

    matchingRecords(context = {}) {
      const product = String(context.product || '').trim().toUpperCase();
      const mandrel = finitePositive(context.mandrel) ? Number(context.mandrel) : null;
      const extruder = [1,2,3,4].includes(Number(context.extruder)) ? Number(context.extruder) : null;
      return this.records.filter(record => {
        if (product && String(record.product || '').toUpperCase() !== product) return false;
        if (mandrel && Number(record.mandrel || 48) !== mandrel) return false;
        if (extruder && Number(record.extruder || 0) !== extruder) return false;
        return true;
      });
    }

    stats(context = {}) {
      const records = this.matchingRecords(context).filter(r => r.source !== 'completed_cut').slice(-100);
      const count = records.length;
      if (!count) return {count:0, correction:0, confidence:0, successRate:0, spread:0, contextMatched:true};

      let weighted = 0, totalWeight = 0;
      records.forEach((record, index) => {
        const recencyWeight = 0.35 + 0.65 * ((index + 1) / count);
        const successWeight = record.success ? 1 : 0.65;
        const weight = recencyWeight * successWeight;
        weighted += Number(record.correction) * weight;
        totalWeight += weight;
      });
      const correction = weighted / totalWeight;
      const variance = records.reduce((sum, r) => sum + Math.pow(Number(r.correction) - correction, 2), 0) / count;
      const spread = Math.sqrt(variance);
      const sampleScore = Math.min(1, count / 30);
      const consistencyScore = Math.max(0, 1 - spread / 5);
      const confidence = Math.round(100 * sampleScore * consistencyScore);
      const successRate = Math.round(100 * records.filter(r => r.success).length / count);
      return {count, correction:round1(correction), confidence, successRate, spread:round1(spread), contextMatched:true};
    }

    recommend(formulaSuggestion, roundMode = 'nearest1', context = {}) {
      const stats = this.stats(context);
      const profile = this.processProfile(context, context.targetBW);
      let learned = Number(formulaSuggestion);
      if (stats.count >= MIN_CONTEXT_RECORDS) learned += stats.correction;
      let historyWeight = 0;
      if (profile.count >= MIN_CONTEXT_RECORDS && finitePositive(profile.recommendedSWrap)) {
        historyWeight = Math.min(0.65, Math.max(0.15, profile.confidence / 140));
        learned = learned * (1-historyWeight) + Number(profile.recommendedSWrap) * historyWeight;
      }
      if (roundMode === 'nearest5') learned = Math.round(learned / 5) * 5;
      else if (roundMode === 'exact') learned = round1(learned);
      else learned = Math.round(learned);
      const active = stats.count >= MIN_CONTEXT_RECORDS || profile.count >= MIN_CONTEXT_RECORDS;
      const confidence = Math.max(stats.confidence, profile.confidence || 0);
      return {...stats, count:Math.max(stats.count, profile.count || 0), confidence, profile, historyWeight:Number(historyWeight.toFixed(2)), learnedSuggestion: learned, active, minimumRequired:MIN_CONTEXT_RECORDS};
    }
  }


  class TrendPredictor {
    constructor({ sampleSize = 5, targetBW = 6.35, tolerance = WARNING_TOLERANCE, preventiveStep = 2 } = {}) {
      this.sampleSize = Math.max(3, Number(sampleSize) || 5);
      this.targetBW = Number(targetBW);
      this.tolerance = Number(tolerance);
      this.preventiveStep = Math.max(1, Number(preventiveStep) || 2);
    }

    analyze(values, currentSWrap = 170) {
      const rolls = (Array.isArray(values) ? values : [])
        .map(Number)
        .filter(finitePositive)
        .slice(-this.sampleSize);
      const speed = Number(currentSWrap);
      const empty = {
        ready:false, count:rolls.length, required:this.sampleSize, values:rolls, direction:'stable',
        slope:0, projectedBW:null, consistency:0, level:'waiting', recommendAdjustment:false,
        adjustment:0, suggestedSWrap:finitePositive(speed) ? speed : null
      };
      if (rolls.length < this.sampleSize) return empty;

      const n = rolls.length;
      const meanX = (n - 1) / 2;
      const meanY = rolls.reduce((sum, value) => sum + value, 0) / n;
      let numerator = 0, denominator = 0;
      rolls.forEach((value, index) => {
        numerator += (index - meanX) * (value - meanY);
        denominator += Math.pow(index - meanX, 2);
      });
      const slope = denominator ? numerator / denominator : 0;
      const intercept = meanY - slope * meanX;
      const projectedBW = intercept + slope * n;
      const residualTotal = rolls.reduce((sum, value, index) => {
        const fitted = intercept + slope * index;
        return sum + Math.pow(value - fitted, 2);
      }, 0);
      const totalVariation = rolls.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0);
      const rSquared = totalVariation > 0 ? Math.max(0, 1 - residualTotal / totalVariation) : 1;
      const direction = slope > 0.005 ? 'up' : slope < -0.005 ? 'down' : 'stable';
      const projectedDifference = projectedBW - this.targetBW;
      const projectedAbsoluteDifference = Math.abs(projectedDifference);
      const movingAway = (direction === 'up' && projectedDifference > 0) || (direction === 'down' && projectedDifference < 0);
      const consistent = rSquared >= 0.55;
      const nearOrOutside = projectedAbsoluteDifference > GREEN_TOLERANCE;
      const recommendAdjustment = finitePositive(speed) && direction !== 'stable' && movingAway && consistent && nearOrOutside;
      const adjustment = recommendAdjustment ? (direction === 'up' ? this.preventiveStep : -this.preventiveStep) : 0;
      const suggestedSWrap = finitePositive(speed) ? Math.max(1, Math.round(speed + adjustment)) : null;
      let level = 'stable';
      if (recommendAdjustment) level = projectedAbsoluteDifference >= this.tolerance ? 'danger' : 'warning';

      return {
        ready:true, count:n, required:this.sampleSize, values:rolls, direction,
        slope:Number(slope.toFixed(3)), projectedBW:Number(projectedBW.toFixed(3)),
        projectedDifference:Number(projectedDifference.toFixed(3)), consistency:Math.round(rSquared * 100),
        level, recommendAdjustment, adjustment, suggestedSWrap, targetBW:this.targetBW,
        tolerance:this.tolerance
      };
    }
  }

  class SmartOptimizer {
    constructor({ targetBW = 6.35, currentSWrap = 170, roundMode = 'nearest1', learningEngine = null, context = {} } = {}) {
      this.targetBW = Number(targetBW);
      this.currentSWrap = Number(currentSWrap);
      this.roundMode = roundMode;
      this.learningEngine = learningEngine || new AdaptiveLearningEngine();
      this.context = {...(context || {}), targetBW:Number(targetBW)};
      if (!finitePositive(this.targetBW)) throw new Error('Target BW must be greater than zero.');
      if (!finitePositive(this.currentSWrap)) throw new Error('Current S-Wrap must be greater than zero.');
    }

    roundSpeed(speed) {
      if (this.roundMode === 'nearest5') return Math.round(speed / 5) * 5;
      if (this.roundMode === 'exact') return round1(speed);
      return Math.round(speed);
    }

    evaluate(actualBW) {
      const actual = Number(actualBW);
      if (!finitePositive(actual)) throw new Error('Actual BW must be greater than zero.');
      const difference = Number((actual - this.targetBW).toFixed(2));
      const absoluteDifference = Math.abs(difference);
      let level = 'red', suggestAdjustment = true;
      if (absoluteDifference <= GREEN_TOLERANCE) { level = 'green'; suggestAdjustment = false; }
      else if (absoluteDifference < WARNING_TOLERANCE) level = 'yellow';

      const rawSuggested = this.currentSWrap * actual / this.targetBW;
      const formulaSuggestion = this.roundSpeed(rawSuggested);
      const learning = this.learningEngine.recommend(formulaSuggestion, this.roundMode, this.context);
      const suggestedSWrap = learning.active ? learning.learnedSuggestion : formulaSuggestion;
      const adjustment = Number((suggestedSWrap - this.currentSWrap).toFixed(1));
      const direction = adjustment < 0 ? 'decrease' : adjustment > 0 ? 'increase' : 'hold';

      return {
        actualBW: actual, targetBW: this.targetBW, difference, absoluteDifference,
        level, suggestAdjustment, currentSWrap: this.currentSWrap,
        formulaSuggestion, suggestedSWrap, adjustment, direction,
        learning, greenTolerance: GREEN_TOLERANCE, warningTolerance: WARNING_TOLERANCE
      };
    }
  }

  window.AdaptiveLearningEngine = AdaptiveLearningEngine;
  window.SmartOptimizer = SmartOptimizer;
  window.TrendPredictor = TrendPredictor;
  window.VIEJITO_TOLERANCES = Object.freeze({green: GREEN_TOLERANCE, warning: WARNING_TOLERANCE});
})();
