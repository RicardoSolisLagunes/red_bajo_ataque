# Reto: El cable perdido

> Implementación objetivo: `js/challenges/cable_perdido.js`.
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **identificar el cable/segmento defectuoso** dentro de distintas
**topologías** de red, reconociendo cómo el fallo se manifiesta según la topología.

**Temas de redes cubiertos:**
- Medios de transmisión: par trenzado (UTP/STP), coaxial, fibra óptica, inalámbrico.
- Topologías: bus, estrella, anillo, malla.
- Cómo un cable defectuoso afecta a cada topología (alcance del fallo).

## 2. Investigación técnica (lo que enseña el reto)

- **Topología en estrella:** todos los nodos van a un switch central. Si falla **un**
  cable, **solo ese nodo** pierde conexión → el cable defectuoso es el del único host
  caído. Pista visual: un nodo sin conexión, el resto OK.
- **Topología en bus:** todos comparten un único medio (coaxial con terminadores). Una
  ruptura del bus puede tumbar **todo el segmento**; el defecto está en el tramo troncal,
  no en una bajada de nodo.
- **Topología en anillo:** los datos circulan nodo a nodo; un corte interrumpe el anillo
  (en anillo simple cae toda la red; pista: el corte está entre dos nodos del anillo).
- **Topología en malla:** redundancia; si un enlace cae, hay rutas alternas. El defecto
  es el enlace por el que ya no pasa tráfico aunque la red siga operando.
- **Medios:** la fibra no sufre EMI (interferencia electromagnética); el UTP sí; el
  coaxial es típico del bus clásico. Estos hechos refuerzan la solución comentada.

## 3. Mecánica de juego

- Se presentan varios **rounds** (p. ej. 4), cada uno con un **diagrama de topología**.
- Uno o más nodos/enlaces muestran síntoma de fallo (ícono de "sin conexión").
- El jugador **hace clic en el cable/segmento** que cree defectuoso.
- **Acierto:** avanza al siguiente round. **Error:** suma 1 a errores, el cable se marca
  como incorrecto y puede reintentar el mismo round.
- **Condición de victoria:** resolver todos los rounds. Al terminar se muestra la
  **solución comentada** de cada uno y el puntaje (motor compartido con
  `mistakes` total y `seconds` total).

## 4. Modelo de datos (data-driven)

```js
const CABLE_PERDIDO_ROUNDS = [
  {
    id: "estrella-1",
    topologia: "estrella",
    enunciado: "Un solo equipo perdió conexión. ¿Qué cable está dañado?",
    asset: "src/topologia_estrella.svg",          // placeholder
    cables: [
      { id: "c1", desde: "switch", hasta: "PC1", defectuoso: false },
      { id: "c2", desde: "switch", hasta: "PC2", defectuoso: true  },
      { id: "c3", desde: "switch", hasta: "PC3", defectuoso: false }
    ],
    solucion: "En estrella cada host tiene su propio cable al switch. Como solo PC2 " +
              "quedó sin red, el cable defectuoso es el de PC2; los demás siguen OK."
  },
  // ... rounds para bus, anillo, malla
];
```

> El contenido vive en este array para agregar/editar rounds sin tocar la lógica.

## 5. Assets requeridos (`/src`, placeholders)

- `topologia_estrella.svg`, `topologia_bus.svg`, `topologia_anillo.svg`,
  `topologia_malla.svg`.
- Íconos: `pc.svg`, `switch.svg`, `cable_ok.svg`, `cable_falla.svg`, `nodo_sin_red.svg`.
- Cada cable es un elemento clicable (`<line>`/`<path>` SVG o zona con `data-id`).

## 6. Enganche con el puntaje

- Inicia timer al entrar al reto; acumula `mistakes` por cada clic incorrecto.
- Al terminar: `registrarIntento(nombre, "cable_perdido", mistakes, seconds)`.

## 7. Pasos de implementación

1. `init(seccion)` — render del primer round; arranca timer y contador de errores.
2. Manejar clic en cable → comparar `defectuoso`; marcar OK/error.
3. Avanzar rounds; al final mostrar bloque de resultado + soluciones comentadas.
4. `reset()` — limpiar al salir del reto (requisito de pérdida de progreso).
