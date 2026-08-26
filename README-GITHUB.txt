Industrial IA 5.32.2 — Natural Chat Follow-up Fix

GitHub Pages build.

LATEST FEATURES
- Speed Change Advisor is a separate occasional-use tool for intentional line-speed changes.
- Uses current line S-Wrap/Last BW plus Primary RPM, Secondary RPM, both roll weights, and elapsed minutes.
- Calculates real output lb/hr from both rolls and run time.
- Desired BW defaults to Last BW and can be changed for simultaneous speed + BW changes.
- Shows theoretical Primary/Secondary requirements and a separate quality/machine-limited recommended starting point.
- Secondary 13.0 RPM is the quality cap; higher theoretical values are shown as NOT RECOMMENDED because of friction/shear heat / roll-quality risk.
- Primary 128 RPM is the machine-enforced maximum; higher theoretical values are shown as NOT POSSIBLE.
- The first limiting component caps the coordinated Primary + Secondary + S-Wrap increase.
- Secondary Heat guidance follows the Secondary RPM change and learned line data when available.
- Primary Pressure prediction/margin to 5,500 is shown only after enough learned samples exist.

NORMAL BW CONTROL
- Routine BW corrections remain S-Wrap-first to avoid chasing the process with Primary/Secondary changes.
- Primary/Secondary recommendations are reserved for intentional speed changes or when normal S-Wrap control is outside the practical range.

AI HELP / CHAT
- Main dashboard label remains Trend Predictor.
- In English, the ? help describes it as “AI Predictor — Function…”. Spanish/French help uses IA.
- Natural short follow-up replies such as “not bad”, “pretty good”, “busy”, “tired”, and Spanish/French equivalents are recognized without intercepting technical phrases.

PROCESS PERFORMANCE LEARNING
- Independent per-line learning store: Primary RPM + Secondary RPM -> real output lb/hr.
- Real output = (Winder 1 lb + Winder 2 lb) × 60 / elapsed minutes.
- Manual Process Record supports Primary, Secondary, both roll weights, and run time.
- Samples can preserve S-Wrap, product, mandrel, Primary Pressure, melt, Secondary Heat, motor load, target BW, and measured BW.
- At least 3 comparable samples are required before learned predictions activate.

PRESERVED
- BW status bands: green |ΔBW| <= 0.17; warning > 0.17 and < 0.25; red >= 0.25.
- Displayed BW range: Target ±0.25.
- Preventive S-Wrap workflow, per-line state, per-line learning, chat isolation, changeover behavior, and persistent data architecture.
