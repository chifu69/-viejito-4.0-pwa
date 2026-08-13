# Industrial IA V5.9 — Line Learning Intelligence

## What changed
- Shared-computer line selector for Line 1–4. Each line keeps independent shifts, products, BW trend history, S-Wrap learning, production targets and run history.
- Chat is isolated from operational learning. Chat calculations do not enter BW trend history, machine learning or operational history. Chat memory can be Off, Session Only, or Saved Separately.
- Production dashboard now shows Actual lbs/hr and Target lbs/hr separately. Actual rate waits 15 minutes before projecting to prevent unstable early-run numbers; completed-cut samples are retained with the run.
- Every completed dual-winder cut becomes a process-learning observation for that exact Line + Product + Mandrel context.
- Changeover dialog analyzes the destination job history and shows roll count, typical S-Wrap, BW variation, confidence, mathematical starting point and learned starting recommendation.
- Learning combines the established mathematical S-Wrap formula with recent, comparable historical behavior. History receives more influence only when sample count and consistency support it.

## Safety / trust model
Viejito does not learn from chat questions. It learns from structured, completed production results and confirmed adjustment results. Low-history jobs fall back to the mathematical formula.
