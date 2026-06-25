# Reto: El cable perdido

> **Estado: ✅ Completado** — `js/challenges/cable_perdido.js`
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **identificar el cable/segmento defectuoso** dentro de distintas
**topologías** de red, reconociendo cómo el fallo se manifiesta según la topología.

**Temas de redes cubiertos:**
- Topologías: estrella, bus, anillo, malla.
- Cómo un cable defectuoso afecta a cada topología (alcance del fallo).
- Enrutamiento alternativo (anillo y malla): la red sigue funcionando por otra ruta.

## 2. Mecánica implementada

El reto tiene **4 rounds** (uno por topología), jugados en orden. El cable roto
**cambia en cada ejecución** (se elige al azar en `init()`).

| Topología | Mecánica |
|-----------|----------|
| **Estrella** | Un PC muestra "sin red". El jugador hace clic en el cable roto. |
| **Bus** | Un segmento del bus está roto; los PCs a la derecha quedan sin red. El jugador hace clic en el segmento roto. |
| **Anillo** | El jugador elige PC origen y PC destino; se anima un paquete via BFS por la ruta alternativa. Luego hace clic en el enlace roto. |
| **Malla** | Igual que anillo: paquete animado via BFS por ruta alternativa, luego clic en el enlace roto. |

**Flujo de anillo/malla:**
1. Instrucción de modo paquete mostrada (`packet-hint`).
2. Clic en PC origen → se resalta.
3. Clic en PC destino → BFS calcula ruta sobre el grafo de enlaces activos → círculo SVG
   animado recorre los segmentos a 420 ms/segmento via `requestAnimationFrame`.
4. Al terminar la animación, el jugador hace clic en el enlace roto.

## 3. Modelo de datos implementado

Patrón **TEMPLATES → `_makeRound(tmpl)`**: los templates son fijos; `_makeRound` elige
el cable roto al azar y genera `enunciado` y `solucion` dinámicamente.

```js
const TEMPLATES = [
  { id: 'estrella', tipo: 'estrella', pcs: ['PC1','PC2','PC3','PC4'] },
  { id: 'bus', tipo: 'bus',
    segments: [{id:'s1',li:0,ri:1},{id:'s2',li:1,ri:2},{id:'s3',li:2,ri:3}] },
  { id: 'anillo', tipo: 'anillo',
    nodes: ['PC1','PC2','PC3','PC4'],
    allLinks: [{id:'l1',a:'PC1',b:'PC2'},{id:'l2',a:'PC2',b:'PC3'},
               {id:'l3',a:'PC3',b:'PC4'},{id:'l4',a:'PC4',b:'PC1'}] },
  { id: 'malla', tipo: 'malla',
    nodes: ['PC1','PC2','PC3','PC4'],
    allLinks: [ /* K4: 6 enlaces */ ] }
];

// En init():
const rounds = TEMPLATES.map(_makeRound);
```

`_makeRound(tmpl)` retorna `{ ...tmpl, brokenId, enunciado, solucion, links? }`.

**Bus**: `offlineLiThreshold = seg.li` → PCs en índice `> li` quedan offline.
**Anillo/Malla**: `_buildGraph(links)` construye lista de adyacencia solo con enlaces
`broken:false`; `_bfs(graph, start, end)` retorna el path de nodos.

## 4. SVG

Generado **100% inline** en JS (sin archivos en `/src/`):
- `_svgEstrella(r)`, `_svgBus(r)` — renderizan el diagrama completo.
- Cada cable tiene dos elementos: `data-role="vis"` (línea visible) y
  `data-role="hit"` (línea transparente ancha, clicable).
- El highlighting en hover se aplica via JS (`mouseenter`/`mouseleave`) porque
  los selectores CSS `~` no funcionan entre hermanos SVG en diferente orden.

## 5. Enganche con el puntaje

- Timer inicia al entrar al reto; `mistakes` por cada clic incorrecto.
- Al terminar: `memory.registrarIntento(nombre, "cable_perdido", mistakes, seconds)`.
- `reset()` cancela la animación en curso (`cancelAnimationFrame`) y limpia el DOM.
