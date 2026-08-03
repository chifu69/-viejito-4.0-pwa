# Industrial IA 5.3 — Winder Status & Operator Alert

This update keeps the V5.2 shift, changeover, extruder, learning, and persistent-session features.

## Changes
- Each winder is evaluated immediately against Target BW.
- Green: difference ≤ 0.20.
- Yellow: difference > 0.20 and < 0.30.
- Red: difference ≥ 0.30.
- Winder cards show a large Saved BW value and ON TARGET / WARNING / OUT OF RANGE.
- Winder 2 is treated as required; optional wording was removed.
- Red average alert shows the suggested S-Wrap and increase/decrease amount instead of Danger text.
- Five-second red flashing uses JavaScript toggling for better iPhone/Safari reliability.
- Active-shift text contrast is corrected in Light Mode.
