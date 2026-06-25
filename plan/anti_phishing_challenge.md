# Reto: Anti-phishing

> **Estado: ✅ Completado** — `js/challenges/anti_phishing.js`
> Comparte motor de puntaje y timer (ver [`memory.md`](./memory.md), [`main.md`](./main.md)).

## 1. Objetivo de aprendizaje y temas

El jugador aprende a **reconocer correos de phishing** distinguiéndolos de correos
legítimos, identificando los **indicadores** típicos de un intento de fraude.

**Temas cubiertos:**
- Ingeniería social y seguridad de correo electrónico.
- Indicadores de phishing: remitente/dominio falso, urgencia, enlaces/URLs engañosas,
  adjuntos sospechosos, saludos genéricos, errores de ortografía, solicitud de credenciales.
- SPF / DKIM / DMARC (cubiertos en la Especificación Técnica de la sección Docs).

## 2. Mecánica implementada

- `memory/emails.txt` contiene un banco de **14 correos** (7 legítimos + 7 de phishing).
- En cada partida se eligen **5 correos al azar**, garantizando al menos **2 legítimos**.
- La bandeja muestra las tarjetas de correo (`email-card`) con remitente, asunto y cuerpo.
- Para cada correo el jugador elige **Phishing** o **Legítimo** (dos botones).
- Cada clasificación incorrecta suma +1 error; puede corregir antes de finalizar.
- Al clasificar los 5, se muestra el bloque de resultado con la **solución comentada**
  de cada correo (indicadores resaltados) y el puntaje.

### Selección aleatoria (5 correos, ≥2 legítimos)

```js
function _seleccionar(banco, total = 5, minLeg = 2) {
  const barajar = arr => [...arr].sort(() => Math.random() - 0.5);
  const leg  = barajar(banco.filter(c => !c.esPhishing)).slice(0, minLeg);
  const rest = barajar(banco.filter(c => !leg.includes(c))).slice(0, total - minLeg);
  return barajar([...leg, ...rest]);
}
```

## 3. Modelo de datos (`memory/emails.txt`)

Archivo JSON estricto cargado con `fetch` + `JSON.parse`:

```json
[
  {
    "id": "phish-banco",
    "remitente": "Soporte <seguridad@banco-segur0.com>",
    "asunto": "¡Acción urgente! Tu cuenta será suspendida",
    "cuerpo": "Estimado cliente, detectamos actividad inusual...",
    "esPhishing": true,
    "indicadores": ["Dominio falso (typosquatting)", "Urgencia artificial", "Pide credenciales"],
    "solucion": "Es PHISHING: dominio typosquatted, presión de tiempo, solicita contraseña."
  },
  {
    "id": "legit-rrhh",
    "remitente": "Recursos Humanos <rrhh@miempresa.com>",
    "asunto": "Recordatorio: capacitación de redes el viernes",
    "cuerpo": "Hola Ricardo, te recordamos la sesión del viernes...",
    "esPhishing": false,
    "indicadores": ["Dominio corporativo correcto", "Dirigido por nombre", "Sin enlaces sospechosos"],
    "solucion": "Es LEGÍTIMO: dominio interno correcto, te nombra, no pide credenciales."
  }
  // ... 12 correos más
]
```

## 4. Assets

Iconos SVG en `/src/` usados en la bandeja y en los botones de resultado:
- `correo.svg` — sobre genérico.
- `correo_phishing.svg` — sobre con alerta.
- `correo_seguro.svg` — sobre con check.
- `anzuelo.svg` — ícono de phishing.
- `alerta.svg` — ícono de alerta.

## 5. Enganche con el puntaje

- Timer inicia al entrar; `mistakes` por cada clasificación incorrecta.
- Al terminar: `memory.registrarIntento(nombre, "anti_phishing", mistakes, seconds)`.
- `reset()` vuelve a cargar y seleccionar 5 correos al azar al reintentar.
