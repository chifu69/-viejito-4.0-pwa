Industrial IA 5.33.1 — Daily Quality Report + Persistent Sheet Balance Intelligence

Viejito remains fully local/offline. No LLM and no internet are required.

NEW IN 5.33.1
- Tools → Daily Quality Report.
- Report scope: Current Line or All Lines 1-4.
- Report period: Last 24 Hours (morning handoff friendly) or a selected Calendar Day.
- Printable report preview with per-line BW-vs-target trend, sheet-balance trend, product trend, incident history, and cut detail.
- Morning report highlights Lead Review when a same-side imbalance reaches 4+ consecutive cuts.
- Sheet-balance streak is line-based and intentionally continues across product/changeover boundaries.
- Balanced cut resets the streak. If the heavy side flips, the old streak ends and a new streak begins for the opposite side.
- 1st bad cut keeps the normal Die Move warning; 3rd same-side cut is Persistent Imbalance; 4th same-side cut recommends Lead review using neutral, non-blaming language.
- Report uses only stored real completed dual-winder cuts; Demo/what-if chat calculations remain excluded from real Trend history.
- Active unresolved streak can carry into a report even when it began before the selected 24-hour/report window.
- Chat command “daily report” / “reporte diario” opens the report tool.

PRESERVED FROM 5.33
- Viejito Local Brain, Context Snapshot, Mode Gate, Skill Registry, Priority Engine, multi-skill line review, and cross-line comparison.
- Existing Changeover, Speed Change Advisor, Process Record, Production, Adaptive Learning, Process Learning, calculators, Davis-Standard knowledge brain, reminders and settings.

PRESERVED FROM 5.32.4 / 5.32.3
- Process Performance Learning integrity fixes.
- Demo Mode excluded from real Trend history.
- Product draft protection until confirmed changeover.
- Corrupted JSON storage recovery.
- Live S-Wrap synchronization and corrective-priority behavior.

VERSION: 5.33.1
