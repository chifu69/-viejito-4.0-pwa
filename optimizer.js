/*
  Viejito Smart Process Optimizer — Sprint 2.0
  Global tolerances for every product:
  GREEN  : |actual - target| <= 0.25 (no change)
  YELLOW : 0.25 < |actual - target| <= 0.30 (preventive adjustment)
  RED    : |actual - target| > 0.30 (adjust S-Wrap)
*/
(() => {
  'use strict';

  const GREEN_TOLERANCE = 0.25;
  const WARNING_TOLERANCE = 0.30;

  class SmartOptimizer {
    constructor({ targetBW = 6.35, currentSWrap = 170, roundMode = 'nearest1' } = {}) {
      this.targetBW = Number(targetBW);
      this.currentSWrap = Number(currentSWrap);
      this.roundMode = roundMode;

      if (!Number.isFinite(this.targetBW) || this.targetBW <= 0) {
        throw new Error('Target BW must be greater than zero.');
      }
      if (!Number.isFinite(this.currentSWrap) || this.currentSWrap <= 0) {
        throw new Error('Current S-Wrap must be greater than zero.');
      }
    }

    roundSpeed(speed) {
      if (this.roundMode === 'nearest5') return Math.round(speed / 5) * 5;
      if (this.roundMode === 'exact') return Number(speed.toFixed(1));
      return Math.round(speed);
    }

    evaluate(actualBW) {
      const actual = Number(actualBW);
      if (!Number.isFinite(actual) || actual <= 0) {
        throw new Error('Actual BW must be greater than zero.');
      }

      const difference = Number((actual - this.targetBW).toFixed(2));
      const absoluteDifference = Math.abs(difference);
      let level = 'red';
      let suggestAdjustment = true;

      if (absoluteDifference <= GREEN_TOLERANCE) {
        level = 'green';
        suggestAdjustment = false;
      } else if (absoluteDifference <= WARNING_TOLERANCE) {
        level = 'yellow';
      }

      const rawSuggested = this.currentSWrap * actual / this.targetBW;
      const suggestedSWrap = this.roundSpeed(rawSuggested);
      const adjustment = Number((suggestedSWrap - this.currentSWrap).toFixed(1));
      const direction = adjustment < 0 ? 'decrease' : adjustment > 0 ? 'increase' : 'hold';

      return {
        actualBW: actual,
        targetBW: this.targetBW,
        difference,
        absoluteDifference,
        level,
        suggestAdjustment,
        currentSWrap: this.currentSWrap,
        suggestedSWrap,
        adjustment,
        direction,
        greenTolerance: GREEN_TOLERANCE,
        warningTolerance: WARNING_TOLERANCE
      };
    }
  }

  window.SmartOptimizer = SmartOptimizer;
  window.VIEJITO_TOLERANCES = Object.freeze({
    green: GREEN_TOLERANCE,
    warning: WARNING_TOLERANCE
  });
})();
