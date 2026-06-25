# Red Bajo Ataque — Plan de Implementación (main)

## 1. Resumen

*Red Bajo Ataque* es un videojuego web educativo para un curso introductorio de
**Redes**. Enseña conceptos de redes y seguridad a través de **cuatro retos**. Cada reto
muestra una **solución comentada** al terminar, para que el jugador aprenda aun cuando
falle. El juego es una página HTML local que se abre directamente en el navegador
(no requiere servidor).

**Objetivo pedagógico:** al terminar, el jugador sabe (1) identificar un cable
defectuoso en distintas topologías, (2) qué piezas componen distintos tipos de red,
(3) identificar un componente malicioso/no autorizado en una red, y (4) reconocer
correos de phishing por sus indicadores.

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
│       ├── identifica_red.js
│       └── anti_phishing.js
├── src/                    # assets SVG (existente; se llenará después)
└── memory/
    ├── scoreboard.txt      # semilla JSON del scoreboard (existente)
    └── emails.txt          # datos del reto Anti-phishing (JSON, solo lectura)
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
│  memory.js   │   │  timer.js (cronómetro)   │
│  puntaje +   │   └──────────┬───────────────┘
│  scoreboard  │              │
│ → memory.md  │              │
└──────┬───────┘              │
       │ habilita puntaje     │
       └──────────┬───────────┘
                  ▼
   ┌────────────────────────────────────────────────┐
   │  Retos (independientes entre sí):              │
   │  • cable_perdido  → cable_perdido_challenge.md │
   │  • la_intrusa     → la_intrusa_challenge.md    │
   │  • identifica_red → identifica_red_challenge.md│
   │  • anti_phishing  → anti_phishing_challenge.md │
   └───────────────────┬────────────────────────────┘
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
- [`anti_phishing_challenge.md`](./anti_phishing_challenge.md) — reto "Anti-phishing".

## 6. Lista de hitos (checklist de implementación futura)

- [x] **M1 — Shell:** `index.html` + tabs + router + modal de nombre (ui_ux.md).
- [x] **M2 — Memoria/Puntaje:** `memory.js` (carga semilla, localStorage, motor de
      puntaje, upsert de scoreboard) + `timer.js`.
- [x] **M3 — Reto 1:** El cable perdido (estrella, bus, anillo, malla + animación BFS).
- [x] **M4 — Reto 2:** La intrusa.
- [x] **M5 — Reto 3:** Identifica la red.
- [x] **M6 — Reto 4:** Anti-phishing.
- [x] **M7 — Scoreboard:** tabla ordenada por Score. Exportar reemplazado por persistencia via server.js.
- [x] **M8 — Pulido:** SVG inline en challenges, iconos `/src` para anti-phishing, tema oscuro completo.

## 7. Mapa de contenidos (tema de redes por reto)

| Reto | Temas de redes cubiertos |
|------|--------------------------|
| El cable perdido | Medios de transmisión (UTP/STP, coaxial, fibra, inalámbrico), topologías (bus, estrella, anillo, malla), fallos de cableado. |
| La intrusa | Dispositivos de red (router, switch, AP, firewall) vs. dispositivo no autorizado; conceptos básicos de seguridad (rogue AP, MAC no autorizada). |
| Identifica la red | Clasificación de redes (PAN/LAN/MAN/WAN/WLAN) y reconocimiento de topología a partir de componentes. |
| Anti-phishing | Ingeniería social y seguridad de correo: indicadores de phishing (dominio/remitente falso, urgencia, URLs engañosas, adjuntos, solicitud de credenciales). |

## 8. Seguimiento / Pendientes

Tareas abiertas antes y durante la construcción del juego.

| # | Pendiente | Estado | Notas |
|---|-----------|--------|-------|
| P1 | **Recursos SVG para los retos.** | ✅ resuelto | Las topologías y dispositivos se generan como SVG inline en JS. Los iconos de anti-phishing (`correo`, `anzuelo`, etc.) están en `/src/`. |
| P2 | Integrar los assets en cada reto. | ✅ resuelto | SVG inline en `cable_perdido.js`; iconos `/src` cargados en `anti_phishing.js`. |
| P3 | Construir el juego (shell + memory + 4 retos + scoreboard). | ✅ completado | Ver hitos M1–M8. |
| P4 | **Poblar `memory/emails.txt`** con los correos del reto Anti-phishing (JSON). | ✅ completado | 14 correos (7 phishing + 7 legítimos). |
| P5 | Entregables no-juego (manual del facilitador, video, PDF, métricas). | 🔶 parcial | Manual del facilitador y especificación técnica integrados en la página (tab Docs). Pendiente: video de presentación, PDF, métricas de sesión de prueba. |

### 8.1 Recursos `/src/` requeridos

Lista consolidada de los assets que necesito crear/colocar en `/src/`. Nombres en
**snake_case de 1 a 3 palabras** (sin extensión; serán `.svg`). Cada reto los referencia
como placeholders hasta que existan.

**Topologías y escenarios (diagramas):**
- `topologia_estrella`
- `topologia_bus`
- `topologia_anillo`
- `topologia_malla`
- `diagrama_red`
- `escenario_oficina`
- `escenario_wan`
- `escenario_pan`

**Dispositivos:**
- `router`
- `switch`
- `firewall`
- `access_point`
- `pc`
- `laptop`
- `servidor`
- `impresora`
- `bluetooth`
- `ciudad`
- `dispositivo_intruso`

**Cables y estados:**
- `cable_ok`
- `cable_falla`
- `nodo_sin_red`

**Anti-phishing:**
- `correo`
- `correo_phishing`
- `correo_seguro`
- `anzuelo`
- `alerta`

**UI común / marcadores:**
- `marca_correcto`
- `marca_incorrecto`
- `check_completado`
- `icono_usuario`
- `icono_reloj`
- `icono_exportar`
- `logo_juego`
