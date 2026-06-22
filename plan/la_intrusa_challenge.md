# Reto: La intrusa

> Implementación objetivo: `js/challenges/la_intrusa.js`.
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **identificar un dispositivo no autorizado/malicioso** en un
diagrama de red, distinguiéndolo de los dispositivos legítimos.

**Temas de redes cubiertos:**
- Dispositivos de red legítimos: router, switch, access point (AP), firewall, servidor,
  PC, impresora.
- Amenazas: **rogue AP** (punto de acceso no autorizado), dispositivo con MAC/IP no
  registrada, sniffer conectado a un puerto espejo, equipo conectado fuera del firewall.
- Conceptos básicos: segmentación, qué dispositivos "deberían" estar y dónde.

## 2. Investigación técnica (lo que enseña el reto)

- **Rogue AP:** un AP conectado sin autorización crea una puerta inalámbrica que
  bypassa controles; pista: un AP extra colgando de un switch interno o con SSID
  desconocido.
- **Dispositivo no autorizado por MAC/IP:** en un inventario, el equipo cuya MAC/IP no
  aparece en la lista aprobada es el intruso.
- **Ubicación indebida:** un host conectado **antes** del firewall, o un equipo en una
  VLAN que no le corresponde, indica intrusión.
- **Sniffer/duplicado:** un dispositivo conectado a un puerto donde no debería haber
  tráfico replicado.
- La solución comentada explica *por qué* el resto de dispositivos sí son legítimos.

## 3. Mecánica de juego

- Se muestra un **diagrama de red** con varios dispositivos (íconos clicables).
- El enunciado da el contexto (p. ej. "lista de equipos autorizados" o "algo no encaja").
- El jugador **hace clic en el dispositivo intruso**.
- **Acierto:** resuelto. **Error:** +1 error, el dispositivo se marca como legítimo y
  puede seguir intentando.
- Puede haber varios **rounds** con distintos tipos de intrusión.
- Al terminar: **solución comentada** + puntaje (motor compartido).

## 4. Modelo de datos (data-driven)

```js
const LA_INTRUSA_ROUNDS = [
  {
    id: "rogue-ap-1",
    enunciado: "Esta red corporativa tiene un equipo que no debería estar. ¿Cuál es?",
    asset: "src/diagrama_red.svg",                // placeholder
    dispositivos: [
      { id: "router", tipo: "router",   intruso: false },
      { id: "sw1",    tipo: "switch",   intruso: false },
      { id: "fw",     tipo: "firewall", intruso: false },
      { id: "ap_x",   tipo: "ap",       intruso: true,  motivo: "AP no autorizado (rogue AP)" },
      { id: "pc1",    tipo: "pc",       intruso: false }
    ],
    solucion: "El AP 'ap_x' fue conectado sin autorización al switch interno: crea una " +
              "entrada inalámbrica que evade el firewall. Router, switch, firewall y PC " +
              "son parte del diseño aprobado."
  },
  // ... rounds: MAC no autorizada, host fuera del firewall, sniffer
];
```

## 5. Assets requeridos (`/src`, placeholders)

- `router.svg`, `switch.svg`, `firewall.svg`, `access_point.svg`, `pc.svg`,
  `servidor.svg`, `impresora.svg`, `dispositivo_intruso.svg`.
- Marcadores: `marca_correcto.svg`, `marca_incorrecto.svg`.
- Cada dispositivo es clicable con `data-id`.

## 6. Enganche con el puntaje

- Timer al entrar; `mistakes` por cada clic en dispositivo legítimo.
- Al terminar: `registrarIntento(nombre, "la_intrusa", mistakes, seconds)`.

## 7. Pasos de implementación

1. `init(seccion)` — render del diagrama del round; arranca timer/errores.
2. Clic en dispositivo → comparar `intruso`; marcar.
3. Avanzar rounds; al final, resultado + soluciones comentadas.
4. `reset()` — limpiar al salir del reto.
