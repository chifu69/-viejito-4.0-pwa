/*
  Viejito Adaptive Process Intelligence — Sprint 2.1
  Global tolerances for every product:
  GREEN  : |actual - target| <= 0.25 (no change)
  YELLOW : 0.25 < |actual - target| <= 0.30 (preventive adjustment)
  RED    : |actual - target| > 0.30 (adjust S-Wrap)

  Learning stays on this device. Every confirmed result contributes a
  correction to the standard S-Wrap formula. The engine uses a recent,
  weighted average and reports confidence from sample count and consistency.
*/
(() => {
  'use strict';

  const GREEN_TOLERANCE = 0.25;
  const WARNING_TOLERANCE = 0.30;
  const LEARNING_KEY = 'viejitoMachineLearningV1';
  const MAX_RECORDS = 300;

  const finitePositive = value => Number.isFinite(Number(value)) && Number(value) > 0;
  const round1 = value => Number(Number(value).toFixed(1));

  class AdaptiveLearningEngine {
    constructor(storage = window.localStorage) {
      this.storage = storage;
      this.records = this.load();
    }

    load() {
      try {
        const parsed = JSON.parse(this.storage.getItem(LEARNING_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(r => r && finitePositive(r.targetBW) && finitePositive(r.appliedSWrap) && finitePositive(r.finalBW)) : [];
      } catch (_) {
        return [];
      }
    }

    save() {
      this.records = this.records.slice(-MAX_RECORDS);
      this.storage.setItem(LEARNING_KEY, JSON.stringify(this.records));
    }

    add(record) {
      const required = ['initialBW','targetBW','currentSWrap','formulaSuggestion','appliedSWrap','finalBW'];
      if (!required.every(key => finitePositive(record[key]))) throw new Error('All learning values must be greater than zero.');
      const idealSWrap = Number(record.appliedSWrap) * Number(record.finalBW) / Number(record.targetBW);
      const correction = idealSWrap - Number(record.formulaSuggestion);
      const saved = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        initialBW: Number(record.initialBW),
        targetBW: Number(record.targetBW),
        currentSWrap: Number(record.currentSWrap),
        formulaSuggestion: Number(record.formulaSuggestion),
        appliedSWrap: Number(record.appliedSWrap),
        finalBW: Number(record.finalBW),
        idealSWrap: round1(idealSWrap),
        correction: round1(correction),
        success: Math.abs(Number(record.finalBW) - Number(record.targetBW)) <= GREEN_TOLERANCE
      };
      this.records.push(saved);
      this.save();
      return saved;
    }

    clear() {
      this.records = [];
      this.storage.removeItem(LEARNING_KEY);
    }

    stats() {
      const records = this.records.slice(-100);
      const count = records.length;
      if (!count) return {count:0, correction:0, confidence:0, successRate:0, spread:0};

      // More recent rolls receive more weight, but older evidence still matters.
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
      const sampleScore = Math.min(1, count / 25);
      const consistencyScore = Math.max(0, 1 - spread / 6);
      const confidence = Math.round(100 * sampleScore * consistencyScore);
      const successRate = Math.round(100 * records.filter(r => r.success).length / count);
      return {count, correction:round1(correction), confidence, successRate, spread:round1(spread)};
    }

    recommend(formulaSuggestion, roundMode = 'nearest1') {
      const stats = this.stats();
      let learned = Number(formulaSuggestion);
      if (stats.count >= 3) learned += stats.correction;
      if (roundMode === 'nearest5') learned = Math.round(learned / 5) * 5;
      else if (roundMode === 'exact') learned = round1(learned);
      else learned = Math.round(learned);
      return {...stats, learnedSuggestion: learned, active: stats.count >= 3};
    }
  }

  class SmartOptimizer {
    constructor({ targetBW = 6.35, currentSWrap = 170, roundMode = 'nearest1', learningEngine = null } = {}) {
      this.targetBW = Number(targetBW);
      this.currentSWrap = Number(currentSWrap);
      this.roundMode = roundMode;
      this.learningEngine = learningEngine || new AdaptiveLearningEngine();
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
      else if (absoluteDifference <= WARNING_TOLERANCE) level = 'yellow';

      const rawSuggested = this.currentSWrap * actual / this.targetBW;
      const formulaSuggestion = this.roundSpeed(rawSuggested);
      const learning = this.learningEngine.recommend(formulaSuggestion, this.roundMode);
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
  window.VIEJITO_TOLERANCES = Object.freeze({green: GREEN_TOLERANCE, warning: WARNING_TOLERANCE});
})();
