# Memoria y Puntaje — Especificación

Especifica cómo se almacenan nombre, puntajes y scoreboard, y el motor de puntaje
compartido. Implementación objetivo: `js/memory.js`. Ver también
[`main.md`](./main.md) y [`ui_ux.md`](./ui_ux.md).

## 1. Modelo de almacenamiento

- **Almacén vivo:** `localStorage` del navegador (persiste entre sesiones/refrescos en
  el mismo navegador).
- **Semilla:** `memory/scoreboard.txt` se lee **una sola vez** (en el primer arranque,
  cuando el scoreboard de localStorage está vacío) para precargar entradas históricas.
- **Contenido de reto:** `memory/emails.txt` es la **fuente de datos de solo lectura**
  del reto Anti-phishing: un banco de **≥14 correos** (≥7 legítimos y ≥7 sospechosos) en
  JSON estricto. Se carga con `fetch` al iniciar el reto, que muestra **5 al azar** (≥2
  legítimos garantizados); ver `anti_phishing_challenge.md`.
- **Export:** botón **"Exportar scoreboard.txt"** descarga el scoreboard actual como
  JSON estricto (para recolectar métricas de la sesión de prueba).

### Claves de localStorage

| Clave | Contenido |
|-------|-----------|
| `rba_current_player` | `string` — nombre del jugador de la sesión actual. |
| `rba_players` | objeto con los **mejores resultados por reto** de cada jugador (fuente autoritativa de este dispositivo). |
| `rba_scoreboard` | array mostrado en la tabla: `[{ name, score, time }]` (semilla + jugadores locales fusionados). |

## 2. Esquemas de datos

```js
// rba_players  (detalle por jugador y por reto)
{
  "Rick": {
    challenges: {
      cable_perdido:  { score: 80, time: 42 },   // mejor score y SU tiempo
      la_intrusa:     { score: 100, time: 18 },
      identifica_red: { score: 60, time: 70 },
      anti_phishing:  { score: 80, time: 35 }
    }
  }
}

// Resultado de un intento (entrada al motor de puntaje, no se persiste tal cual)
{ challenge: "cable_perdido", mistakes: 2, seconds: 40, score: 50 }

// rba_scoreboard  (lo que ve la tabla; total por jugador)
[ { name: "Rick", score: 240, time: 130 }, ... ]
```

### Regla de "mejor intento"
Si un jugador repite un reto, se conserva **solo el score más alto** y **el tiempo de
ese intento** (no el mejor tiempo por separado). Pseudocódigo:

```js
const prev = players[name].challenges[challenge];
if (!prev || result.score > prev.score) {
  players[name].challenges[challenge] = { score: result.score, time: result.seconds };
}
```

### Totales (derivados)
- `score` total del jugador = **suma** de los `score` de sus retos jugados.
- `time` total del jugador = **suma** de los `time` asociados a esos mejores scores.
- Tras cada intento se recalcula el total y se hace **upsert** en `rba_scoreboard`.

## 3. Motor de puntaje (compartido)

Función única usada por los cuatro retos:

```js
function calcularPuntaje(mistakes, seconds) {
  const START = 100;
  const PENAL_ERROR = 20;
  // Tiempo: 25 s gratis; luego -10 por cada bloque completo de 10 s; tope -50.
  const extra = Math.max(0, seconds - 25);
  const penalTiempo = Math.min(50, Math.floor(extra / 10) * 10);
  const penalErrores = mistakes * PENAL_ERROR;
  return Math.max(0, START - penalErrores - penalTiempo); // piso 0
}
```

**Ejemplos de verificación (trazar antes de codificar):**
| mistakes | seconds | penal errores | penal tiempo | score |
|---------:|--------:|--------------:|-------------:|------:|
| 0 | 20 | 0 | 0 | 100 |
| 2 | 40 | 40 | 10 | **50** |
| 1 | 75 | 20 | 50 | 30 |
| 5 | 90 | 100 | 50 (tope) | **0** (piso) |

## 4. Vista Scoreboard

- Tabla con columnas: **Name** (string) · **Score** (int total) · **Time** (int, seg total).
- Ordenada **solo por Score**, descendente.
- Fuente: `rba_scoreboard`.
- Se actualiza al terminar cualquier reto y al cambiar de jugador.

## 5. Flujo de nombre

1. Al abrir la página por primera vez en la sesión, se muestra un **modal** pidiendo el
   nombre (ver `ui_ux.md`).
2. Se guarda en `rba_current_player` y se recuerda durante la sesión.
3. Si el nombre ya existe en `rba_players`, se continúan acumulando sus mejores scores.

## 6. Archivos en `/memory` (formato)

Todos los archivos de `/memory` son **JSON estricto** (claves entre comillas, sin coma
final) y se cargan con `fetch` + `JSON.parse`.

**`memory/scoreboard.txt`** — semilla del scoreboard:

```json
[
    { "name": "Rick",   "score": 240, "time": 90 },
    { "name": "Arturo", "score": 200, "time": 95 }
]
```

**`memory/emails.txt`** — fuente de datos (solo lectura) del reto Anti-phishing; lista de
correos a clasificar (esquema completo en `anti_phishing_challenge.md`):

```json
[
    { "id": "phish-banco", "remitente": "...", "asunto": "...", "cuerpo": "...",
      "esPhishing": true, "indicadores": ["..."], "solucion": "..." }
]
```

- El cargador parsea ambos directamente con `JSON.parse(...)`.
- El **export** escribe `scoreboard.txt` en el mismo formato (JSON estricto) para que sea
  reutilizable como semilla. `emails.txt` no se exporta (es contenido de solo lectura).

## 7. Pasos de implementación (memory.js)

1. `cargarScoreboard()` — lee `rba_scoreboard`; si vacío, hace `fetch` de
   `memory/scoreboard.txt`, lo parsea con `JSON.parse` y siembra.
2. `calcularPuntaje(mistakes, seconds)` — motor anterior.
3. `registrarIntento(name, challenge, mistakes, seconds)` — calcula score, aplica regla
   de mejor intento en `rba_players`, recalcula total, upsert en `rba_scoreboard`.
4. `obtenerScoreboardOrdenado()` — devuelve copia ordenada por score desc.
5. `exportarScoreboard()` — descarga `scoreboard.txt` (JSON estricto) vía Blob + enlace.
6. `get/setNombreActual()`.
