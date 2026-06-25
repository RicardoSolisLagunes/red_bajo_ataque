# Reto: La intrusa

> **Estado: ✅ Completado** — `js/challenges/la_intrusa.js`
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **identificar un dispositivo no autorizado/malicioso** en un
diagrama de red, distinguiéndolo de los dispositivos legítimos por su posición en
la arquitectura, sus credenciales y el contexto.

**Temas cubiertos:**
- Rogue AP, bypass de firewall, dispositivo con MAC/IP no registrada.
- Segmentación: la posición del dispositivo importa tanto como su tipo.
- Comparar lo detectado vs. un inventario de activos aprobados.

## 2. Mecánica implementada

El reto tiene **múltiples rounds** con distintos tipos de intrusión. Cada round muestra:
- Un **diagrama de red** con dispositivos renderizados como tarjetas HTML clicables
  (`dev-card`), organizadas en capas (Internet → firewall → switch → LAN).
- Una **tabla de inventario** con las IPs y MACs autorizadas, para que el jugador compare.

**Flujo:**
1. El jugador hace clic en el dispositivo que cree intruso.
2. **Acierto:** el dispositivo se resalta en rojo (`dev-intruso-found`) y avanza al siguiente round.
3. **Error:** destello amarillo (`dev-wrong-flash`) y +1 error; puede seguir intentando.
4. Al terminar todos los rounds: bloque de resultado con soluciones comentadas + puntaje.

**Decisión de diseño:** los dispositivos intrusos tienen nombres neutros (p. ej. `AP-03`,
`Laptop-07`) sin tooltips ni etiquetas que delaten su naturaleza, para que el jugador
deba analizar la topología en lugar de buscar el nombre "más raro".

## 3. Modelo de datos implementado

```js
const ROUNDS = [
  {
    id: 'rogue-ap',
    enunciado: '...',
    dispositivos: [
      { id: 'internet', tipo: 'internet', label: 'Internet', role: 'Acceso externo', intruso: false },
      { id: 'router',   tipo: 'router',   label: 'Router',   role: 'Gateway',        intruso: false },
      { id: 'fw',       tipo: 'firewall', label: 'Firewall', role: 'Perímetro',       intruso: false },
      { id: 'sw',       tipo: 'switch',   label: 'Switch',   role: 'Distribución',    intruso: false },
      { id: 'ap03',     tipo: 'ap',       label: 'AP-03',    role: 'Punto de acceso', intruso: true  },
      // ...
    ],
    inventario: [
      { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:01', dispositivo: 'Router', autorizado: true },
      // ...
    ],
    solucion: '...'
  },
  // ... otros rounds: MAC no registrada, host fuera del firewall, etc.
];
```

## 4. Assets

Sin archivos en `/src/`. Los dispositivos se renderizan con **emojis + HTML** en las
tarjetas `dev-card`. Los íconos por tipo de dispositivo son emojis estándar (🌐 🔒 🔌 💻 etc.).

## 5. Enganche con el puntaje

- Timer inicia al entrar; `mistakes` por cada clic en dispositivo legítimo.
- Al terminar: `memory.registrarIntento(nombre, "la_intrusa", mistakes, seconds)`.
- `reset()` limpia el DOM y reinicia timer/errores.
