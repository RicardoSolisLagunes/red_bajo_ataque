# UI / UX — Estructura y Navegación

> **Estado: ✅ Completado** — `index.html`, `css/styles.css`, `js/app.js`
> Ver también [`main.md`](./main.md) y [`memory.md`](./memory.md).

## 1. Layout general (single-page)

```
┌───────────────────────────────────────────────────────────────┐
│ HEADER:  Red Bajo Ataque  [📚 Docs]       [👤 Nombre ✎]      │
│ TABS:  [Inicio] [El cable perdido ✓] [La intrusa]             │
│        [Identifica la red] [Anti-phishing ✓] [Scoreboard]     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   MAIN  (sección de la tab activa)                            │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ FOOTER:  Curso de Redes · Red Bajo Ataque                     │
└───────────────────────────────────────────────────────────────┘
```

- Una sola `index.html` con varias `<section>`; solo la activa es visible
  (clase `active`, las demás `hidden`).
- El header tiene **posición sticky** (`top:0`). Las tabs también sticky (`top:49px`).
- El botón **📚 Docs** en el header abre la sección de documentación directamente,
  sin ocupar espacio en la barra de tabs.
- El botón **✎** junto al nombre del jugador reabre el modal de nickname.

## 2. Router de tabs

```js
// app.js — _initRouter()
tab.addEventListener('click', () => {
  challenges[activeChallenge]?.reset();   // limpia progreso si había reto activo
  /* oculta todas las secciones, muestra la elegida */
  if (tab.dataset.challenge) challenges[key].init(section);
  else if (targetId === '#sec-scoreboard') _renderScoreboard();
});
```

- `data-challenge` en la tab identifica el módulo de reto.
- Al salir de un reto **se pierde el progreso** (requisito): `reset()` cancela timer,
  animaciones y limpia el DOM del reto.
- Solo los intentos **terminados** registran puntaje.

### Checkmarks de completado

- Una tab de reto muestra **✓** si el jugador actual completó ese reto.
- Se actualiza con `refrescarChecks()` al terminar un reto y al cambiar de jugador.

## 3. Flujo de inicio

```
Abrir página
   └─> ¿hay rba_current_player en sessionStorage/localStorage?
         ├─ No  → MODAL "Ingresa tu nickname" (input + botón Empezar)
         │         └─> guarda nombre → muestra Inicio
         └─ Sí  → muestra Inicio directamente
```

El botón **✎** en el header limpia el input y reabre el modal para crear un nuevo
jugador (el progreso anterior se conserva en localStorage por nombre).

## 4. Anatomía de una pantalla de reto

```
┌──────────────────────────────────────────────────┐
│ Título del reto          ⏱ 00:00   ✗ Errores: 0 │
├──────────────────────────────────────────────────┤
│  Indicador de ronda (round N de M)               │
│  Enunciado / pregunta del round                  │
│                                                  │
│  [ Diagrama SVG / tarjetas / opciones ]           │
│                                                  │
│  [Retroalimentación inline al acertar/fallar]    │
├──────────────────────────────────────────────────┤
│  RESULTADO (al terminar):                        │
│   Estadísticas (score, errores, tiempo)          │
│   Solución comentada de cada round               │
│   [ Reintentar ]   [ Volver a Inicio ]           │
└──────────────────────────────────────────────────┘
```

## 5. Pantalla de Scoreboard

- Tabla `#` · **Nombre** · **Score** · **Tiempo (s)**, ordenada por Score descendente.
- La fila del jugador actual se resalta en azul acento.
- Sin botón de exportar (la persistencia se maneja via `server.js` o edición manual).

## 6. Sección de Documentación

Accesible vía el botón **📚 Docs** en el header. Contiene dos sub-paneles:

| Sub-panel | Contenido |
|-----------|-----------|
| **Manual del Facilitador** | Puesta en marcha, ficha de actividad, guía reto a reto, modos de facilitación, sistema de puntuación, personalización. |
| **Especificación Técnica** | Investigación profunda por reto: IEEE 802.3/802.5/802.11, CSMA/CD, BFS, 802.1X, SPF/DKIM/DMARC, WPA3, tipos de red, etc. |

Los sub-paneles se activan con `.doc-tab` buttons (`.doc-panel.hidden { display:none }`).
Cada sección es un `<details>` colapsable con `<summary>` como título.

## 7. Estilos

- CSS plano en `css/styles.css`; layout con flexbox/grid.
- Paleta oscura tipo ciberseguridad: fondo `#0a0e1a`, acentos `#00c8ff` (cyan), `#00e87a` (verde), `#ff4455` (rojo), `#ffd700` (amarillo).
- Variables CSS en `:root` para colores, fuentes y bordes.
- Objetivo: **PC local** (no se requiere responsividad extrema).
