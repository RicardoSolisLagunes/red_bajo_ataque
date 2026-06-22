# Reto: Anti-phishing

> Implementación objetivo: `js/challenges/anti_phishing.js`.
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **reconocer correos de phishing** distinguiéndolos de correos
legítimos, identificando los **indicadores** típicos de un intento de fraude.

**Temas cubiertos:**
- Ingeniería social y seguridad de correo electrónico.
- Indicadores de phishing: remitente/dominio falso, sentido de urgencia, enlaces/URLs
  engañosas, adjuntos sospechosos, saludos genéricos, errores de ortografía, solicitud
  de credenciales o datos sensibles.

## 2. Investigación técnica (lo que enseña el reto)

- **Remitente/dominio falso:** el dominio no coincide con la organización real o usa
  *typosquatting* (p. ej. `banco-segur0.com`, `paypa1.com`, subdominios engañosos como
  `secure.banco.com.fraude.net`).
- **URL engañosa:** el texto del enlace dice una cosa pero el destino real es otro;
  enseñar a "pasar el cursor" para ver la URL verdadera y a leer el dominio de derecha
  a izquierda.
- **Urgencia/amenaza:** "tu cuenta será suspendida en 24 h", presión para actuar sin
  pensar.
- **Solicitud de credenciales:** ninguna entidad seria pide contraseñas/OTP por correo.
- **Saludo genérico y errores:** "Estimado cliente", faltas de ortografía, formato pobre.
- **Adjuntos inesperados:** `.zip`/`.exe`/macros que no se solicitaron.
- Un correo **legítimo** usa el dominio correcto, se dirige a ti por tu nombre, no exige
  credenciales y no presiona; el reto incluye estos casos para evitar falsos positivos.

## 3. Mecánica de juego

- `memory/emails.txt` contiene un banco de **al menos 14 correos** (mínimo 7 legítimos y
  7 sospechosos).
- En cada partida se eligen **5 correos al azar** del banco, **garantizando al menos 2
  legítimos** (y por tanto a lo más 3 de phishing). Así varía la bandeja entre intentos.
- Se presenta una **lista de correos** (bandeja de entrada). Cada correo muestra
  remitente, asunto y un cuerpo/preview.
- Para cada correo el jugador elige **Phishing** o **Legítimo** (dos botones).
- Cada **clasificación incorrecta** suma 1 error (motor de puntaje compartido); puede
  corregir antes de finalizar.
- **Condición de victoria:** clasificar los 5 correos. Al terminar se muestra la
  **solución comentada** de cada correo, resaltando sus indicadores, y el puntaje.

### Selección aleatoria (5 correos, ≥2 legítimos)

```js
function seleccionarCorreos(banco, total = 5, minLegitimos = 2) {
  const legitimos  = banco.filter(c => !c.esPhishing);
  const phishing   = banco.filter(c =>  c.esPhishing);
  const baraja = arr => [...arr].sort(() => Math.random() - 0.5);
  const elegidosLegit = baraja(legitimos).slice(0, minLegitimos);   // garantiza ≥2 legítimos
  const resto = baraja([...phishing, ...legitimos.filter(c => !elegidosLegit.includes(c))]);
  const seleccion = [...elegidosLegit, ...resto.slice(0, total - minLegitimos)];
  return baraja(seleccion);  // mezclar para que los legítimos no queden siempre primero
}
```

## 4. Modelo de datos (data-driven)

**Fuente de datos:** los correos viven en **`memory/emails.txt`** (no en código), como
**JSON estricto**, y se cargan con `fetch` al iniciar el reto (igual que la semilla del
scoreboard; ver [`memory.md`](./memory.md)). Es un archivo de **solo lectura**: agregar o
editar correos no requiere tocar la lógica.

Esquema de cada correo y ejemplo del contenido de `memory/emails.txt`:

```json
[
  {
    "id": "phish-banco",
    "remitente": "Soporte <seguridad@banco-segur0.com>",
    "asunto": "¡Acción urgente! Tu cuenta será suspendida",
    "cuerpo": "Estimado cliente, detectamos actividad inusual. Verifica tu contraseña aquí: http://banco-seguro.cuenta-verifica.net en las próximas 24 horas.",
    "esPhishing": true,
    "indicadores": ["dominio falso (banco-segur0.com)", "urgencia", "URL engañosa", "saludo genérico", "pide contraseña"],
    "solucion": "Es PHISHING: el dominio del remitente no es el del banco (typosquatting), el enlace lleva a otro dominio, presiona con urgencia y pide tu contraseña."
  },
  {
    "id": "legit-rrhh",
    "remitente": "Recursos Humanos <rrhh@miempresa.com>",
    "asunto": "Recordatorio: capacitación de redes el viernes",
    "cuerpo": "Hola Ricardo, te recordamos la sesión del viernes a las 10:00 en la sala 3. Cualquier duda, responde a este correo.",
    "esPhishing": false,
    "indicadores": ["dominio corporativo correcto", "te nombra", "sin enlaces ni urgencia"],
    "solucion": "Es LEGÍTIMO: viene del dominio interno correcto, se dirige a ti por tu nombre, no pide credenciales ni incluye enlaces sospechosos."
  }
]
```

> El banco mezcla correos de phishing y legítimos (≥7 de cada uno). El campo
> `esPhishing` es la respuesta correcta; `indicadores` y `solucion` alimentan la solución
> comentada. Cada partida muestra solo 5 (ver "Selección aleatoria").

## 5. Assets requeridos (`/src`, placeholders)

- `correo.svg` (sobre genérico), `correo_phishing.svg`, `correo_seguro.svg`.
- `anzuelo.svg` (gancho de phishing), `alerta.svg`.
- Marcadores: `marca_correcto.svg`, `marca_incorrecto.svg`.
- La lista de correos puede ser principalmente HTML; los íconos acompañan cada fila.

## 6. Enganche con el puntaje

- Inicia timer al entrar al reto; acumula `mistakes` por cada clasificación incorrecta.
- Al terminar: `registrarIntento(nombre, "anti_phishing", mistakes, seconds)`.

## 7. Pasos de implementación

1. `cargarCorreos()` — `fetch` de `memory/emails.txt`, `JSON.parse` (se puede cachear).
2. `seleccionarCorreos(banco)` — elige 5 al azar garantizando ≥2 legítimos (ver §3).
3. `init(seccion)` — render de la bandeja con los 5 correos elegidos; arranca timer y
   contador de errores.
4. Por cada correo, manejar la elección Phishing/Legítimo → comparar `esPhishing`; marcar.
5. Al clasificar todos, mostrar bloque de resultado + soluciones comentadas (indicadores).
6. `reset()` — limpiar al salir del reto; vuelve a elegir 5 correos al azar al reintentar.
