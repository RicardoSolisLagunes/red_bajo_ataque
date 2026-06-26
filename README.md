# Red Bajo Ataque

Videojuego web educativo sobre redes y ciberseguridad. Corre completamente en el navegador — basta con abrir `index.html`.

## Cómo ejecutar

Abrir `index.html` en cualquier navegador moderno (Chrome 90+, Firefox 88+, Edge 90+). El scoreboard se guarda en `localStorage`.

## Retos

| # | Nombre | Tema |
|---|--------|------|
| 1 | **El cable perdido** | Topologías (estrella, bus, anillo, malla) y diagnóstico de fallos de cableado. Incluye animación de paquetes BFS en anillo y malla. |
| 2 | **La intrusa** | Identificar el dispositivo no autorizado (Rogue AP, bypass de firewall) en un diagrama de red. |
| 3 | **Anti-phishing** | Distinguir correos legítimos de phishing usando indicadores técnicos y de contenido. Se muestra un correo a la vez con avance automático al acertar. Banco de 14 correos con selección aleatoria de 5. |

## Puntuación

- Cada reto parte de **100 puntos**.
- **−20** por cada respuesta incorrecta.
- Tiempo: los primeros 25 s son gratuitos; luego **−10 pts** cada 10 s adicionales (tope −50).
- Mínimo 0 pts. El sistema guarda únicamente el **mejor intento** por reto.
- Total máximo: 300 pts (3 retos × 100).

## Estructura de archivos

```
red_bajo_ataque/
├── index.html                  # Página única del juego
├── css/styles.css              # Tema oscuro cybersecurity
├── js/
│   ├── app.js                  # Router, modal de nombre, botón Docs
│   ├── memory.js               # localStorage, motor de puntaje, scoreboard
│   ├── timer.js                # Cronómetro reutilizable
│   └── challenges/
│       ├── cable_perdido.js    # Reto 1 (SVG inline + BFS)
│       ├── la_intrusa.js       # Reto 2
│       └── anti_phishing.js    # Reto 3 (un correo a la vez, banco de 14)
├── src/                        # Iconos SVG para anti-phishing
├── memory/
│   ├── scoreboard.txt          # JSON del scoreboard
│   └── emails.txt              # Banco de correos del reto 4
└── server.js                   # Servidor Node.js opcional (persistencia de archivo)
```

## Documentación integrada

La página incluye una sección **Docs** (botón en el header) con:
- **Manual del Facilitador**: puesta en marcha, guía reto a reto, modos de facilitación, sistema de puntuación, personalización.
- **Especificación Técnica**: investigación profunda de los temas de cada reto (IEEE 802.3/802.5/802.11, 802.1X, SPF/DKIM/DMARC, topologías, WPA3, etc.).

## Entregables del proyecto

- [x] Juego completo listo para jugarse
- [x] Manual del facilitador (integrado en la página)
- [x] Especificación técnica de los temas (integrada en la página)
- [x] Presentación en video (máx. 15 min)
- [x] Métricas de sesión de prueba
- [x] Documento PDF con manual y objetivos