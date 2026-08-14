# Industrial IA V5.16 — Line Learning Intelligence

## What changed
- Shared-computer line selector for Line 1–4. Each line keeps independent shifts, products, BW trend history, S-Wrap learning, production targets and run history.
- Chat is isolated from operational learning. Chat calculations do not enter BW trend history, machine learning or operational history. Chat memory can be Off, Session Only, or Saved Separately.
- Production dashboard now shows Actual lbs/hr and Target lbs/hr separately. Actual rate waits 15 minutes before projecting to prevent unstable early-run numbers; completed-cut samples are retained with the run.
- Every completed dual-winder cut becomes a process-learning observation for that exact Line + Product + Mandrel context.
- Changeover dialog analyzes the destination job history and shows roll count, typical S-Wrap, BW variation, confidence, mathematical starting point and learned starting recommendation.
- Learning combines the established mathematical S-Wrap formula with recent, comparable historical behavior. History receives more influence only when sample count and consistency support it.

## Safety / trust model
Viejito does not learn from chat questions. It learns from structured, completed production results and confirmed adjustment results. Low-history jobs fall back to the mathematical formula.


## V5.16 — Plant BW Alignment
- BW factor changed from the exact 453.59237 g/lb conversion to the plant/system convention of **450**.
- Reverse length calculations use the same factor for consistency.
- Verification example: **535 lb × 7051 ft × 48 in = 5.93 BW**.
- This is intentionally a plant/system calculation convention, not the exact physical lb-to-gram conversion.


## V5.16 — Lbs/hr display fix
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


## V5.16 — Operator Priority UI
- Production summary is compact and tappable; full production details open on tap.
- Full production detail includes rate, target, produced, projection, shift target, forecast, and Actual-vs-Target trend chart from completed cuts.
- Average BW, Target, BW difference, status, and S-Wrap action are surfaced at the top after a completed two-winder cut.
- Existing green/yellow/red thresholds and 5-second red flash are unchanged.
- BW factor 450 and V5.10.1 integer display fix are preserved.


## V5.16 — Adaptive Recommendation Learning
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


## V5.16 — Persistent Lines & Saved Settings
- Each extrusion line now explicitly persists its active shift, product, target BW, current S-Wrap, active run, production samples, pending cut, and session inputs before switching lines, closing the PWA, backgrounding iOS, or reloading.
- Reopening the app restores the selected line automatically instead of forcing a new line selection.
- Returning to a line restores its RUNNING state and active product/S-Wrap without requiring Start Shift again.
- Added a spinning S-Wrap/roll indicator that animates only while the selected line has an active shift.
- Settings no longer apply immediately.
- Language is now a dropdown list.
- Language, Light/Dark, Sarcasm, and BW Factor are staged inside Settings and applied only after Save Changes.
- Save Changes persists all settings and reloads the UI to guarantee a complete language/theme rerender.
- Fixed the language-change render interruption caused by the removed Plant Mode element.
- BW factor remains selectable between 450 and 453.59237.

## V5.16 — Production Intelligence & Protected Demo
- One-time backward-compatible migration classifies legacy learning/history by extruder into Line 1–4 without deleting legacy keys.
- Demo Mode prevents fake demonstration cuts from entering operational history, learning, production totals, or persisted line state.
- Settings are password protected. On first use, an administrator creates a Settings password; subsequent access requires it.
- Learning Data Manager allows removal of individual incorrect/test learning records with confirmation.
- Production history groups repeated segments of the same sheet type into one displayed product entry while retaining segments internally.
- Winder balance is evaluated independently from Average BW:
  - difference < 0.25: balanced/no die-move alert
  - 0.25–0.99: DIE MOVE SUGGESTED
  - >= 1.00: DIE MOVE REQUIRED
- When Winder 2 / Top Sheet is heavier, Viejito explicitly instructs to close the top die bolt.
- Added local non-LLM process-intelligence queries for current line status and recent learned data.
- Fixed stale V5.1 footer and additional dynamic-language rerender behavior.

## V5.16 — Smart Entry & Context Personality
- Chat-only BW parser identifies normal roll weight (300–1000 lb) and obvious footage (>2000 ft) regardless of entry order.
- If two chat numbers are both 1000–2000, Viejito asks which is weight and which is feet instead of guessing.
- Winder 1/2 weight validation: normal 300–1000 lb; suspicious values require confirmation. 2xxx entries can suggest the likely missing 300–1000 lb value.
- Winder 1/2 footage validation: normal 1,000–12,000 ft; outside values require operator confirmation before calculation.
- No BW/S-Wrap/die-move formulas were changed.
- Expanded contextual sarcasm banks with anti-repeat memory. Comments react to successful recommendations, near-target results, worse predictions, ignored recommendations that improved, and likely typos.

## V5.16 — Cross-Line Status & Sheet Balance Watch
- Chat can answer status for Line 1–4 explicitly without switching the active UI line.
- A non-running line reports that no active operator shift/session is running instead of presenting stale data as current.
- Running-line status includes product, latest BW, target, S-Wrap, BW range condition, current Die Move recommendation/requirement, and sheet-balance observations.
- Die Move thresholds remain unchanged: <0.25 BW balanced; 0.25–0.99 suggested; >=1.00 required.
- Persistent same-side imbalance is detected from consecutive dual-winder cuts.
- Side flips above the 0.25 threshold are treated as possible overcorrection and Viejito recommends the newly required die-bolt side with contextual sarcasm.
- The system reports observations without accusing the operator; persistence may mean no adjustment was made or the machine did not respond.
