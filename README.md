## Sprint 1.1

- Corregido el teclado del chat en iPhone para mostrar la barra espaciadora.
- El campo acepta entradas como `658 6728`, `520 6578 51` y `FT 10 520`.
- Actualizada la caché offline para distribuir el cambio.

# Viejito 4.0 PWA — Sprint 1

Primera versión funcional de la PWA industrial de Viejito.

## Incluye

- Interfaz instalable en iPhone, Android, Mac y Windows.
- Funcionamiento sin conexión mediante Service Worker.
- Calculadoras locales de Basis Weight, FT y S-Wrap.
- Chat inteligente con las reglas de planta acordadas.
- Mandrel de 48 pulgadas por defecto; 51 pulgadas cuando se solicita.
- Historial local en el dispositivo.
- Tema oscuro/claro.

## Reglas automáticas

1. Una instrucción explícita (`BW`, `Basis Weight`, `FT`, `S-Wrap`) siempre tiene prioridad.
2. Dos números se interpretan como peso y longitud para calcular BW.
3. Un número menor de 15 se interpreta como Basis Weight.
4. Un número entre 15 y 230 se interpreta como S-Wrap Speed.
5. Un número mayor de 230 se interpreta como FT.
6. Tres números se interpretan como peso actual, velocidad actual y peso objetivo para S-Wrap.
7. Mandrel predeterminado: 48 pulgadas. Alternativo: 51 pulgadas.

## Probar localmente

No abras `index.html` directamente si quieres probar la instalación y el modo offline. Inicia un servidor local:

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Publicar gratis

Puedes subir el contenido de esta carpeta a GitHub Pages, Cloudflare Pages o Netlify. Railway también puede servir estos archivos.

## Próximo sprint

- Conectar la PWA con el backend existente de Railway.
- Añadir cámara/OCR y búsqueda SDS cuando haya conexión.
- Añadir voz y sincronización opcional.
