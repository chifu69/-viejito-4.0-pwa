# Industrial IA V5.12 — Line Learning Intelligence

## What changed
- Shared-computer line selector for Line 1–4. Each line keeps independent shifts, products, BW trend history, S-Wrap learning, production targets and run history.
- Chat is isolated from operational learning. Chat calculations do not enter BW trend history, machine learning or operational history. Chat memory can be Off, Session Only, or Saved Separately.
- Production dashboard now shows Actual lbs/hr and Target lbs/hr separately. Actual rate waits 15 minutes before projecting to prevent unstable early-run numbers; completed-cut samples are retained with the run.
- Every completed dual-winder cut becomes a process-learning observation for that exact Line + Product + Mandrel context.
- Changeover dialog analyzes the destination job history and shows roll count, typical S-Wrap, BW variation, confidence, mathematical starting point and learned starting recommendation.
- Learning combines the established mathematical S-Wrap formula with recent, comparable historical behavior. History receives more influence only when sample count and consistency support it.

## Safety / trust model
Viejito does not learn from chat questions. It learns from structured, completed production results and confirmed adjustment results. Low-history jobs fall back to the mathematical formula.


## V5.12 — Plant BW Alignment
- BW factor changed from the exact 453.59237 g/lb conversion to the plant/system convention of **450**.
- Reverse length calculations use the same factor for consistency.
- Verification example: **535 lb × 7051 ft × 48 in = 5.93 BW**.
- This is intentionally a plant/system calculation convention, not the exact physical lb-to-gram conversion.


## V5.12 — Lbs/hr display fix
The live target calculation was mathematically correct, but the shared number-formatting function removed trailing zeroes from whole numbers when `d=0`.

Example of the bug:
- 122 × 12 = 1,464 → displayed correctly as 1464
- 1220 × 12 = 14,640 → incorrectly displayed as 1464 because the final zero was stripped

Fixed behavior:
- 122 × 12 = **1,464**
- 1,220 × 12 = **14,640**
- 1,300 × 12 = **15,600**

The existing live input listeners are preserved, so `Target per shift` updates while typing.
The plant BW factor of **450** is unchanged.


## V5.12 — Operator Priority UI
- Production summary is compact and tappable; full production details open on tap.
- Full production detail includes rate, target, produced, projection, shift target, forecast, and Actual-vs-Target trend chart from completed cuts.
- Average BW, Target, BW difference, status, and S-Wrap action are surfaced at the top after a completed two-winder cut.
- Existing green/yellow/red thresholds and 5-second red flash are unchanged.
- BW factor 450 and V5.10.1 integer display fix are preserved.


## V5.12 — Adaptive Recommendation Learning
- Settings now contains Language, Light/Dark appearance, Sarcasm level, and selectable BW factor.
- BW factor can switch between 450 (plant/system convention) and 453.59237 (exact lb-to-gram conversion) without changing other process logic.
- Plant Mode label removed.
- Active Line strip removed; Change Line moved into the shift card and LINE 1–4 is emphasized in the shift header.
- Early-warning green range changed from ±0.20 to ±0.17. Yellow is >0.17 and <0.30. Red remains ≥0.30 with the existing flashing alert.
- Range visualization moved into the top BW/S-Wrap priority summary.
- Smart Changeover now starts from the last completed Average BW and the S-Wrap actually used on that cut, then combines that mathematical baseline with comparable line/product history when available.
- Changeover automatically updates Current S-Wrap to the recommended starting value.
- S-Wrap recommendations now have Apply Recommendation / Keep Current actions.
- When an operator applies a recommendation, Viejito records:
  - BW before the change
  - Current S-Wrap
  - Formula and learned recommendation
  - S-Wrap actually applied
  - Predicted next BW
  - Next actual BW
  - Prediction error
  - Line, product, mandrel, run, and confidence
- The next completed dual-winder cut closes the prediction loop automatically and feeds the real outcome back into the line/product learning engine.
- Chat remains isolated from operational learning.
