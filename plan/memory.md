# Memoria y Puntaje — Especificación

> **Estado: ✅ Completado** — `js/memory.js`
> Ver también [`main.md`](./main.md) y [`ui_ux.md`](./ui_ux.md).

## 1. Modelo de almacenamiento implementado

| Almacén | Uso |
|---------|-----|
| `sessionStorage` | Nombre del jugador de la sesión actual (`rba_current_player`). |
| `localStorage` | Almacén vivo: datos de jugadores (`rba_players`) y scoreboard (`rba_scoreboard`). |
| `memory/scoreboard.txt` | JSON del scoreboard; leído al inicio si localStorage está vacío; actualizado via `server.js` cuando está disponible. |
| `memory/emails.txt` | Banco de correos del reto Anti-phishing (solo lectura). |

**`server.js` (opcional):** servidor Node.js sin dependencias. Expone:
- `GET /api/scoreboard` → devuelve `scoreboard.txt`
- `POST /api/scoreboard` → escribe `scoreboard.txt`

El juego intenta el servidor primero y cae de forma silenciosa a localStorage cuando
no está corriendo. El código usa `fetch(...).catch(() => {})` para el fire-and-forget.

**Export:** el botón "Exportar" fue **eliminado**. La persistencia se maneja a través de
`server.js` o manualmente editando `memory/scoreboard.txt`.

### Claves de localStorage

| Clave | Contenido |
|-------|-----------|
| `rba_current_player` | `string` — nombre del jugador (también en `sessionStorage`). |
| `rba_players` | Objeto con los mejores resultados por reto de cada jugador. |
| `rba_scoreboard` | Array `[{ name, score, time }]` mostrado en la tabla. |

## 2. Esquemas de datos

```js
// rba_players
{
  "Rick": {
    challenges: {
      cable_perdido:  { score: 80, time: 42 },
      la_intrusa:     { score: 100, time: 18 },
      identifica_red: { score: 60, time: 70 },
      anti_phishing:  { score: 80, time: 35 }
    }
  }
}

// rba_scoreboard
[ { name: "Rick", score: 320, time: 165 }, ... ]
```

### Regla de mejor intento

```js
const prev = players[name].challenges[challenge];
if (!prev || score > prev.score) {
  players[name].challenges[challenge] = { score, time: seconds };
}
```

### Totales (derivados al hacer upsert)

- `score` total = suma de scores de retos jugados.
- `time` total = suma de los tiempos de esos mejores scores.

## 3. Motor de puntaje

```js
function calcularPuntaje(mistakes, seconds) {
  const extra = Math.max(0, seconds - 25);
  const penalTiempo = Math.min(50, Math.floor(extra / 10) * 10);
  return Math.max(0, 100 - mistakes * 20 - penalTiempo);
}
```

| mistakes | seconds | score |
|---------:|--------:|------:|
| 0 | 20 | 100 |
| 2 | 40 | 50 |
| 1 | 75 | 30 |
| 5 | 90 | 0 |

## 4. API pública de `memory.js`

```js
memory.cargarScoreboard()           // async; intenta GET /api/scoreboard, luego fetch archivo, luego localStorage
memory.registrarIntento(name, challenge, mistakes, seconds) // → score
memory.obtenerScoreboardOrdenado()  // → [...] orden Score desc
memory.calcularPuntaje(mistakes, seconds)
memory.getNombreActual()            // sessionStorage || localStorage
memory.setNombreActual(name)        // escribe en ambos
memory.estaCompletado(challenge)    // → boolean
```

## 5. Vista Scoreboard

- Tabla columnas: **#** · **Nombre** · **Score** · **Tiempo (s)**.
- Ordenada por Score descendente.
- La fila del jugador actual se resalta (`.current-player`).
- Se renderiza al activar la tab Scoreboard.

## 6. Flujo de nombre

1. Al abrir la página: si no hay `rba_current_player` en sesión → modal de nickname.
2. El modal se puede reabrir con el botón **✎** en el header para crear un nuevo jugador.
3. Al confirmar: se guarda en `sessionStorage` + `localStorage`; se refresca el ✓ en tabs.

## 7. Archivos en `/memory`

**`memory/scoreboard.txt`** — JSON del scoreboard:
```json
[
    { "name": "Rick",   "score": 320, "time": 165 },
    { "name": "Arturo", "score": 200, "time": 95  }
]
```

**`memory/emails.txt`** — fuente de datos del reto Anti-phishing (solo lectura):
```json
[
    { "id": "...", "remitente": "...", "asunto": "...", "cuerpo": "...",
      "esPhishing": true, "indicadores": ["..."], "solucion": "..." }
]
```
