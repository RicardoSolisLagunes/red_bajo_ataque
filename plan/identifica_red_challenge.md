# Reto: Identifica la red

> Implementación objetivo: `js/challenges/identifica_red.js`.
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

Dados los **componentes de una oficina/escenario**, el jugador debe identificar **qué
tipo de red** es y su **topología**, reconociendo qué piezas componen cada tipo de red.

**Temas de redes cubiertos:**
- Clasificación por alcance: **PAN, LAN, MAN, WAN, WLAN**.
- Topologías: bus, estrella, anillo, malla.
- Qué componentes son típicos de cada tipo (p. ej. AP → WLAN; enlaces entre ciudades → WAN).

## 2. Investigación técnica (lo que enseña el reto)

- **PAN (Personal Area Network):** alcance personal (Bluetooth, USB); pocos dispositivos.
- **LAN (Local Area Network):** un edificio/oficina; switch + PCs + servidor; cableada.
- **WLAN (Wireless LAN):** LAN inalámbrica; presencia de **access points** y clientes Wi-Fi.
- **MAN (Metropolitan Area Network):** abarca una ciudad; enlaza varias LAN.
- **WAN (Wide Area Network):** áreas amplias/países; routers enlazando sitios remotos,
  enlaces de operador. Internet es la WAN por excelencia.
- **Topología:** se deduce del patrón de conexión (todo a un switch central → estrella;
  un troncal compartido → bus; circular → anillo; muchos enlaces redundantes → malla).
- La solución comentada justifica tipo **y** topología a partir de los componentes dados.

## 3. Mecánica de juego

- Cada **round** describe un escenario + lista/diagrama de **componentes**.
- El jugador responde **dos preguntas**: (a) **tipo de red** y (b) **topología**
  (opciones tipo selección/botones).
- Cada selección incorrecta suma 1 error; debe corregir para avanzar.
- Al terminar: **solución comentada** explicando ambas respuestas + puntaje.

> Nota de puntaje: cada selección equivocada (tipo o topología) cuenta como 1 error y
> alimenta el `mistakes` del motor compartido.

## 4. Modelo de datos (data-driven)

```js
const IDENTIFICA_RED_ROUNDS = [
  {
    id: "oficina-wlan",
    enunciado: "Una oficina con 10 laptops conectadas por Wi-Fi a 2 access points y un router.",
    asset: "src/escenario_oficina.svg",           // placeholder
    componentes: ["router", "access point x2", "10 laptops Wi-Fi"],
    opcionesTipo: ["PAN", "LAN", "WLAN", "MAN", "WAN"],
    tipoCorrecto: "WLAN",
    opcionesTopologia: ["bus", "estrella", "anillo", "malla"],
    topologiaCorrecta: "estrella",
    solucion: "Es una WLAN: los clientes se conectan de forma inalámbrica vía access " +
              "points dentro de un mismo local. La topología es en estrella porque todos " +
              "los clientes se asocian a un punto central (los AP/router)."
  },
  // ... rounds para LAN cableada, WAN multi-sitio, PAN Bluetooth
];
```

## 5. Assets requeridos (`/src`, placeholders)

- `escenario_oficina.svg`, `escenario_wan.svg`, `escenario_pan.svg`.
- Íconos de componentes: `router.svg`, `switch.svg`, `ap.svg`, `laptop.svg`,
  `servidor.svg`, `pc.svg`, `bluetooth.svg`, `ciudad.svg`.
- Botones/opciones de selección (HTML, no necesariamente SVG).

## 6. Enganche con el puntaje

- Timer al entrar; `mistakes` por cada selección incorrecta (tipo o topología).
- Al terminar: `registrarIntento(nombre, "identifica_red", mistakes, seconds)`.

## 7. Pasos de implementación

1. `init(seccion)` — render del escenario + dos grupos de opciones; arranca timer/errores.
2. Validar selección de tipo y de topología; marcar incorrectas.
3. Avanzar rounds; al final, resultado + soluciones comentadas.
4. `reset()` — limpiar al salir del reto.
