# Viejito 4.0 — Sprint 2.2

## Trend Predictor

This version keeps the Sprint 2.1 Adaptive Process Intelligence and adds preventive BW trend prediction.

- Stores the five most recent BW calculations locally.
- Uses linear regression to identify increasing, decreasing, or stable movement.
- Projects the next BW and measures trend consistency.
- Warns before the next roll is likely to approach or exceed tolerance.
- For a consistent rising BW trend, recommends lowering S-Wrap by 2 points now.
- For a consistent falling BW trend, recommends raising S-Wrap by 2 points now.
- Shows the prediction in the calculator and in chat.
- Includes a control to clear trend history independently of machine learning.
- Works offline and stores all data only on the device.

Upload every file in this folder to the root of the GitHub Pages repository, replacing the older files.


## Viejito 4.3
- Animated process puppy in the Basis Weight result card.
- Happy in green, concerned in yellow, and very sad with animated tears in red.
- Puppy status follows the existing Smart Optimizer tolerances.


## Industrial IA 4.4
- Replaced Viejito branding with a damaged industrial robot and INDUSTRIAL IA.
- Removed the animated puppy completely.
- Added compact color-coded result status.
- Preserved calculators, optimizer, trend predictor, learning, chat, languages and offline support.
