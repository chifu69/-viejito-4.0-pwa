# Viejito 4.0 — Sprint 2.0 Smart Process Optimizer

## New in this version

- Target BW and Current S-Wrap fields in the BW calculator.
- Global tolerance for every product:
  - Green: difference up to ±0.25; no S-Wrap change.
  - Yellow: difference from 0.26 through 0.30; preventive S-Wrap adjustment.
  - Red: difference greater than 0.30; S-Wrap adjustment recommended.
- Suggested S-Wrap formula: `current S-Wrap × actual BW ÷ target BW`.
- Visual range indicator and colored BW result.
- Smart chat format: `520 6578 6.35 170`.
- Target BW and current S-Wrap are saved locally.
- Works offline after the first load.

## Upload to GitHub Pages

Upload all files and the `icons` folder, replacing the previous files. Wait about one minute, then reopen the site. The new service worker cache is versioned to force the update.
