# Viejito 4.0 PWA — Sprint 1.3.1 Sarcasm Hotfix

## Problema corregido

El selector de personalidad aparecía, pero algunos iPhone seguían usando una copia anterior de `app.js` guardada por el modo offline. Por eso el resultado aparecía sin comentario sarcástico.

## Correcciones

- Nueva versión de caché offline.
- `app.js` y `styles.css` ahora usan identificadores de versión.
- El Service Worker busca inmediatamente la versión nueva.
- Los archivos principales usan prioridad de red cuando hay conexión.
- Se agregó una verificación adicional que garantiza el comentario sarcástico después de un cálculo cuando está seleccionado Light o Heavy sarcasm.

## Archivos para reemplazar en GitHub

- `index.html`
- `app.js`
- `sw.js`
- `README.md`

Mensaje sugerido:

`Fix sarcasm cache on iPhone`
