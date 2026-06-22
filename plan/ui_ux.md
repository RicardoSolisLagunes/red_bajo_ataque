# UI / UX — Estructura y Navegación

Estructura de la página, navegación por pestañas y flujo de pantallas.
Implementación objetivo: `index.html`, `css/styles.css`, `js/app.js`.
Ver también [`main.md`](./main.md) y [`memory.md`](./memory.md).

## 1. Layout general (single-page)

```
┌───────────────────────────────────────────────────────────┐
│ HEADER:  Red Bajo Ataque        [👤 Nombre]             │
│ TABS:  [Inicio] [El cable perdido ✓] [La intrusa]         │
│        [Identifica la red] [Anti-phishing ✓] [Scoreboard] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   MAIN  (se muestra solo la sección de la tab activa)     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER:  curso de Redes · créditos                        │
└──────────────────────────────────────────────────────────┘
```

- Una sola `index.html` con varias `<section>` (una por tab); solo la activa es visible.
- Todas las imágenes/íconos provienen de `/src` (placeholders hasta tener los assets).
- Cada tab de reto muestra un **✓** cuando el jugador actual ya **completó** ese reto
  (ver router, abajo). Hay cuatro retos: El cable perdido, La intrusa, Identifica la red
  y Anti-phishing.

## 2. Router de tabs (vanilla)

- Cada tab tiene `data-target="#seccion"`. `app.js` escucha clicks, oculta todas las
  secciones (`.hidden`) y muestra la elegida; marca la tab activa.
- **Al salir de un reto se pierde el progreso en curso** (requisito): al cambiar de tab
  desde un reto en juego, se llama `reset()` del reto (limpia timer, errores, estado del
  DOM). No se guarda nada del intento incompleto.
- Solo los intentos **terminados** registran puntaje (ver `memory.md`).

### Checkmark de completado en las tabs
- Una tab de reto se marca con **✓** si el jugador actual ya **completó** ese reto, es
  decir, existe `rba_players[nombre].challenges[claveReto]` (aunque el score sea 0).
- El ✓ se **actualiza al terminar** un reto y se **recalcula al cambiar de jugador**
  (función `refrescarChecks()` que recorre las cuatro tabs de reto).
- Claves de reto: `cable_perdido`, `la_intrusa`, `identifica_red`, `anti_phishing`.

## 3. Flujo de inicio

```
Abrir página
   └─> ¿hay rba_current_player en la sesión?
         ├─ No  → MODAL "¿Cuál es tu nombre?" (input + botón Empezar)
         │         └─> guarda nombre → muestra tab Inicio
         └─ Sí  → muestra tab Inicio
```

- El modal bloquea la interacción hasta ingresar un nombre no vacío.
- Tab **Inicio**: breve descripción del juego, objetivo, y accesos a los cuatro retos.

## 4. Anatomía de una pantalla de reto

```
┌──────────────────────────────────────────────┐
│ Título del reto            ⏱ 00:00   ✗ Errores: 0 │
├──────────────────────────────────────────────┤
│  Enunciado / pregunta del round               │
│                                              │
│  [ Diagrama / opciones interactivas ]         │
│   (clic en cable / dispositivo / opción)      │
│                                              │
├──────────────────────────────────────────────┤
│  RESULTADO (al terminar):                     │
│   ✓/✗ + Solución comentada                    │
│   Puntaje obtenido: NN                         │
│   [ Reintentar ]   [ Volver a Inicio ]        │
└──────────────────────────────────────────────┘
```

Elementos comunes a los cuatro retos:
- **Cronómetro** visible (de `timer.js`), inicia al entrar al reto.
- **Contador de errores** visible.
- **Bloque de resultado** con la **solución comentada** (siempre se muestra, acierte o
  falle) — requisito pedagógico.
- Botones **Reintentar** (resetea) y **Volver a Inicio**.

## 5. Pantalla de Scoreboard

- Tabla **Name / Score / Time**, ordenada por Score desc (ver `memory.md`).
- Botón **"Exportar scoreboard.txt"** (esquina superior de la sección).
- Resalta la fila del jugador actual si está presente.

## 6. Estilos

- CSS plano en `css/styles.css`; layout con flexbox/grid.
- Paleta sencilla tipo "ciberseguridad" (oscuro + acentos).
- Objetivo: **PC local** únicamente (no se requiere legibilidad en proyector ni móvil).
- Puntos de inserción de íconos `/src` documentados por reto en sus respectivos docs.

## 7. Pasos de implementación (app.js)

1. Construir secciones y tabs en `index.html`.
2. `initRouter()` — manejo de clicks, mostrar/ocultar, reset del reto al salir.
3. `initNombre()` — modal y `rba_current_player`.
4. Registrar cada reto (`cable_perdido.init(seccion)`, etc.) al activar su tab.
5. `refrescarChecks()` — pinta el ✓ en las tabs de retos completados por el jugador
   actual; invocar al iniciar, al terminar un reto y al cambiar de jugador.
6. Render de Scoreboard al activar su tab.
