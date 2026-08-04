# Industrial IA V5.7 — Shared Context Chat Fix

The changeover chat now automatically uses the current S-Wrap shown in the app and the most recent completed dual-winder average BW. If either value is missing or stale, it asks only for the missing value. Recommendations combine the safe formula with comparable learned results for the active extruder, destination product, and mandrel.


## Version 5.8 — Production Intelligence
- Target lbs/hour and configurable shift duration (default 12 hours).
- Live material total, current lbs/hour, projected end-of-shift total, and target comparison.
- Tracking begins at Start Shift and creates a separate run at every Changeover.
- Product history stores run time, material used, average lbs/hour, and target for each product.
- Production data persists locally on the device and remains available after closing or backgrounding the PWA.
