# Industrial IA V5.11 — Line Learning Intelligence

## What changed
- Shared-computer line selector for Line 1–4. Each line keeps independent shifts, products, BW trend history, S-Wrap learning, production targets and run history.
- Chat is isolated from operational learning. Chat calculations do not enter BW trend history, machine learning or operational history. Chat memory can be Off, Session Only, or Saved Separately.
- Production dashboard now shows Actual lbs/hr and Target lbs/hr separately. Actual rate waits 15 minutes before projecting to prevent unstable early-run numbers; completed-cut samples are retained with the run.
- Every completed dual-winder cut becomes a process-learning observation for that exact Line + Product + Mandrel context.
- Changeover dialog analyzes the destination job history and shows roll count, typical S-Wrap, BW variation, confidence, mathematical starting point and learned starting recommendation.
- Learning combines the established mathematical S-Wrap formula with recent, comparable historical behavior. History receives more influence only when sample count and consistency support it.

## Safety / trust model
Viejito does not learn from chat questions. It learns from structured, completed production results and confirmed adjustment results. Low-history jobs fall back to the mathematical formula.


## V5.11 — Plant BW Alignment
- BW factor changed from the exact 453.59237 g/lb conversion to the plant/system convention of **450**.
- Reverse length calculations use the same factor for consistency.
- Verification example: **535 lb × 7051 ft × 48 in = 5.93 BW**.
- This is intentionally a plant/system calculation convention, not the exact physical lb-to-gram conversion.


## V5.11 — Lbs/hr display fix
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


## V5.11 — Operator Priority UI
- Production summary is compact and tappable; full production details open on tap.
- Full production detail includes rate, target, produced, projection, shift target, forecast, and Actual-vs-Target trend chart from completed cuts.
- Average BW, Target, BW difference, status, and S-Wrap action are surfaced at the top after a completed two-winder cut.
- Existing green/yellow/red thresholds and 5-second red flash are unchanged.
- BW factor 450 and V5.10.1 integer display fix are preserved.


## V5.13 — Operator Flow & Settings
- Settings replaces the visible language selector.
- Settings includes language plus selectable BW factor 450 / 453.59237.
- Selected factor persists and drives both BW and Feet calculations.
- Active Line strip removed; Change line moved to the shift card and LINE number is emphasized.
- Green early-warning boundary changed to ±0.17; yellow runs from >0.17 to <0.30; red remains ≥0.30.
- Range bar moved into the top operator-priority BW/S-Wrap summary.
- Changeover formula now starts from the last completed actual average BW and last/current S-Wrap. Existing learned job history can still refine that mathematical starting point.
- The recommended changeover S-Wrap is automatically loaded into the changeover dialog and becomes Current S-Wrap when confirmed.
