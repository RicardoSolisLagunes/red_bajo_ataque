# Reto: Identifica la red

> **Estado: ✅ Completado** — `js/challenges/identifica_red.js`
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

Dados los **componentes de un escenario**, el jugador debe identificar **qué tipo de red**
es y su **topología**, reconociendo qué piezas componen cada clasificación.

**Temas cubiertos:**
- Clasificación por alcance: **PAN, LAN, MAN, WAN, WLAN**.
- Topologías: bus, estrella, anillo, malla.
- Qué componentes son típicos de cada tipo (AP → WLAN; enlaces entre ciudades → WAN).

## 2. Mecánica implementada

El reto tiene **múltiples rounds** con distintos escenarios. Cada round muestra:
- Un bloque de descripción del escenario (`ir-scenario`).
- Una lista de componentes como chips (`comp-chip`).
- **Dos preguntas** con grupos de botones de opción: (a) tipo de red, (b) topología.

**Flujo:**
1. El jugador selecciona una opción para cada pregunta.
2. Cada selección incorrecta se marca en rojo y suma +1 error; puede corregir y continuar.
3. Una vez ambas respuestas son correctas, avanza al siguiente round.
4. Al terminar todos: bloque de resultado con soluciones comentadas + puntaje.

**Decisión de diseño:** cada selección equivocada cuenta como 1 error independiente
(tipo incorrecto y topología incorrecta pueden ser 2 errores distintos en el mismo round).

## 3. Modelo de datos implementado

```js
const ROUNDS = [
  {
    id: 'wlan-oficina',
    enunciado: 'Una oficina con 10 laptops conectadas por Wi-Fi a 2 access points y un router.',
    componentes: ['Router', 'Access Point ×2', '10 laptops Wi-Fi'],
    tipoCorrecto: 'WLAN',
    topologiaCorrecta: 'estrella',
    solucion: 'Es WLAN: los clientes se conectan de forma inalámbrica vía APs dentro del mismo local. La topología es estrella porque todos los clientes se asocian a un punto central.'
  },
  { id: 'lan-cableada', tipoCorrecto: 'LAN',  topologiaCorrecta: 'estrella', /* ... */ },
  { id: 'wan-multisitio', tipoCorrecto: 'WAN', topologiaCorrecta: 'malla',   /* ... */ },
  { id: 'pan-bluetooth', tipoCorrecto: 'PAN',  topologiaCorrecta: 'estrella', /* ... */ },
  { id: 'man-campus',   tipoCorrecto: 'MAN',  topologiaCorrecta: 'anillo',   /* ... */ },
];
```

## 4. Assets

Sin archivos en `/src/`. Los escenarios se renderizan **solo con HTML y texto**:
- Componentes como chips `.comp-chip` con color acento.
- Botones `.opt-btn` para las opciones de tipo y topología.

## 5. Enganche con el puntaje

- Timer inicia al entrar; `mistakes` por cada botón incorrecto (tipo o topología).
- Al terminar: `memory.registrarIntento(nombre, "identifica_red", mistakes, seconds)`.
- `reset()` limpia el DOM y reinicia timer/errores.
