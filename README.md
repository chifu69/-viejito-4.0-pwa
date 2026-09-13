Industrial IA 5.35.0 — Experimental Lab 🧪

NEW IN 5.35.0
- Adds Experimental Lab as an isolated Tools entry. Lab is read-only toward production controls.
- Process FIT model starts at 16 → 8 → 1 and trains locally/offline using the existing Viejito learning records.
- Uses chronological train / validation / test separation so reported test performance is not measured on the same examples used to fit the model.
- Auto Compare tests a smaller/current/larger architecture on the SAME held-out data and keeps the smallest model within 1.5% of best performance; a larger model is promoted only when it gives at least ~2% meaningful improvement over the current champion.
- Keeps champion/challenger experiment history and model rollback data locally.
- Adds Chat Brain Lab with a local FIT intent classifier, multi-turn Winder/Line reference memory, current line/product/BW context, shadow observation of normal chat, and approved corrections as future training examples.
- Chat Lab playground never executes production actions.
- Normal Viejito formula, Adaptive Machine Learning, process learning, chat, shift controls and production logic remain the source of truth and are not replaced by Lab.
- No cloud AI, external API, or network service is required.

LAB SAFETY BOUNDARY
Lab may read shared learning data and chat context. It may train, predict, compare and save experimental models. It cannot apply S-Wrap, Primary/Secondary, shift, changeover or other production changes.

Safe USB updater package uses product "Industrial IA" and updaterFormat 1.
VERSION: 5.35.0
