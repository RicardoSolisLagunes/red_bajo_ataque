# Red Bajo Ataque — Plan de Implementación (main)

## 1. Resumen

*Red Bajo Ataque* es un videojuego web educativo para un curso introductorio de
**Redes**. Enseña conceptos de redes y seguridad a través de **tres retos**. Cada reto
muestra una **solución comentada** al terminar, para que el jugador aprenda aun cuando
falle. El juego es una página HTML local que se abre directamente en el navegador
(no requiere servidor).

**Objetivo pedagógico:** al terminar, el jugador sabe (1) identificar un cable
defectuoso en distintas topologías, (2) qué piezas componen distintos tipos de red, y
(3) identificar un componente malicioso/no autorizado en una red.

## 2. Decisiones técnicas (fijas)

| Tema | Decisión |
|------|----------|
| Stack | **HTML/CSS/JS vanilla**, sin framework, sin build. Se abre `index.html`. |
| Assets | SVG/vectores en `/src` (se agregan después; usar placeholders mientras tanto). |
| Persistencia | `localStorage` como almacén vivo; `memory/scoreboard.txt` como **semilla** de solo lectura; botón **"Exportar scoreboard.txt"** para descargar el JSON actualizado. |
| Navegación | Menú de **pestañas (tabs)** arriba. Al salir de un reto se **pierde el progreso** en curso. |
| Puntaje | Inicia en **100** por reto; **−20 por error**; tiempo: 25 s gratis, luego −10 por cada 10 s, tope −50; mínimo 0. |
| Idioma del juego | Español (texto visible al jugador). |

## 3. Estructura de archivos propuesta (del juego)

```
red_bajo_ataque/
├── index.html              # shell de la página (header con tabs + secciones)
├── css/
│   └── styles.css          # estilos planos
├── js/
│   ├── app.js              # arranque, router de tabs, modal de nombre
│   ├── memory.js           # almacenamiento, motor de puntaje, scoreboard, export
│   ├── timer.js            # cronómetro reutilizable por reto
│   └── challenges/
│       ├── cable_perdido.js
│       ├── la_intrusa.js
│       └── identifica_red.js
├── src/                    # assets SVG (existente; se llenará después)
└── memory/
    └── scoreboard.txt      # semilla JSON (existente)
```

> Nota: la implementación del juego es una **tarea futura**. Este documento y sus
> hermanos en `/plan/` solo especifican *cómo* construirlo.

## 4. Grafo de dependencias / orden de construcción

```
         ┌──────────────┐
         │  core (shell │
         │  + router +  │   index.html, js/app.js, css/styles.css
         │  estado)     │   → ver ui_ux.md
         └──────┬───────┘
                │ habilita todo
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐   ┌──────────────────────────┐
│  memory.js   │   │  timer.js (cronómetro)    │
│  puntaje +   │   └──────────┬───────────────┘
│  scoreboard  │              │
│ → memory.md  │              │
└──────┬───────┘              │
       │ habilita puntaje     │
       └──────────┬───────────┘
                  ▼
   ┌──────────────────────────────────────┐
   │  Retos (independientes entre sí):     │
   │  • cable_perdido  → cable_perdido_challenge.md
   │  • la_intrusa     → la_intrusa_challenge.md
   │  • identifica_red → identifica_red_challenge.md
   └───────────────────┬──────────────────┘
                       ▼
            ┌────────────────────┐
            │ vista Scoreboard + │
            │ botón Exportar     │ → memory.md + ui_ux.md
            └────────────────────┘
```

**Reglas de dependencia**
- `core` bloquea todo lo demás.
- `memory.js` y `timer.js` dependen solo de `core`.
- Cada reto depende de `core`, `timer.js` y del motor de puntaje de `memory.js`,
  pero **no** depende de los otros retos (se pueden construir en cualquier orden).
- La vista de Scoreboard depende de `core` + `memory.js`.

## 5. Documentos relacionados en `/plan/`

- [`memory.md`](./memory.md) — almacenamiento, esquemas de datos, motor de puntaje, export.
- [`ui_ux.md`](./ui_ux.md) — estructura de la página, navegación por tabs, flujo de inicio.
- [`cable_perdido_challenge.md`](./cable_perdido_challenge.md) — reto "El cable perdido".
- [`la_intrusa_challenge.md`](./la_intrusa_challenge.md) — reto "La intrusa".
- [`identifica_red_challenge.md`](./identifica_red_challenge.md) — reto "Identifica la red".

## 6. Lista de hitos (checklist de implementación futura)

- [ ] **M1 — Shell:** `index.html` + tabs + router + modal de nombre (ui_ux.md).
- [ ] **M2 — Memoria/Puntaje:** `memory.js` (carga semilla, localStorage, motor de
      puntaje, upsert de scoreboard) + `timer.js`.
- [ ] **M3 — Reto 1:** El cable perdido.
- [ ] **M4 — Reto 2:** La intrusa.
- [ ] **M5 — Reto 3:** Identifica la red.
- [ ] **M6 — Scoreboard + Export:** tabla ordenada por Score y botón Exportar.
- [ ] **M7 — Pulido:** integrar assets de `/src`, estilos, accesibilidad básica.

## 7. Mapa de contenidos (tema de redes por reto)

| Reto | Temas de redes cubiertos |
|------|--------------------------|
| El cable perdido | Medios de transmisión (UTP/STP, coaxial, fibra, inalámbrico), topologías (bus, estrella, anillo, malla), fallos de cableado. |
| La intrusa | Dispositivos de red (router, switch, AP, firewall) vs. dispositivo no autorizado; conceptos básicos de seguridad (rogue AP, MAC no autorizada). |
| Identifica la red | Clasificación de redes (PAN/LAN/MAN/WAN/WLAN) y reconocimiento de topología a partir de componentes. |
