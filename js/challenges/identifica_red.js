/* Identifica la red — classify network type (PAN/LAN/MAN/WAN/WLAN) and topology */
const identificaRed = (() => {
  const ROUNDS = [
    {
      id: 'wlan-oficina',
      escenario: 'Una oficina con 10 laptops conectadas por Wi-Fi a 2 access points. Los APs están cableados a un router central que da salida a Internet.',
      componentes: ['Router', 'Access Point ×2', '10 Laptops (Wi-Fi)'],
      tipoCorrecto: 'WLAN',
      topologiaCorrecta: 'estrella',
      solucion: 'Es una WLAN (Wireless LAN): los clientes se conectan de forma inalámbrica vía access points dentro de un mismo local. La topología es en estrella porque todos los clientes se asocian a un punto central (los APs/router); si un AP falla, solo sus clientes pierden conexión.'
    },
    {
      id: 'lan-cableada',
      escenario: 'Un laboratorio universitario con 20 PCs conectadas por cable UTP a un switch central. El switch se conecta a un servidor de archivos local.',
      componentes: ['Switch central', '20 PCs (cable UTP)', 'Servidor de archivos'],
      tipoCorrecto: 'LAN',
      topologiaCorrecta: 'estrella',
      solucion: 'Es una LAN (Local Area Network) cableada: abarca un único edificio, usa switch + PCs + servidor con cable UTP. La topología es en estrella: todos los equipos se conectan al switch central. Si un cable falla, solo ese equipo pierde acceso; el resto sigue funcionando.'
    },
    {
      id: 'wan-multi',
      escenario: 'La empresa tiene oficinas en Ciudad de México, Monterrey y Guadalajara. Cada oficina tiene su propia LAN. Los routers de cada ciudad se interconectan mediante enlaces de fibra del operador.',
      componentes: ['3 oficinas en distintas ciudades', 'Router por ciudad', 'Enlace de fibra (operador)', 'LAN interna en cada oficina'],
      tipoCorrecto: 'WAN',
      topologiaCorrecta: 'malla',
      solucion: 'Es una WAN (Wide Area Network): enlaza múltiples sitios distantes (ciudades) a través de la infraestructura de un operador de telecomunicaciones. La topología es en malla porque cada ciudad puede comunicarse directamente con las otras dos, proporcionando redundancia si un enlace falla.'
    },
    {
      id: 'pan-bluetooth',
      escenario: 'Un usuario en su escritorio tiene una laptop, un ratón Bluetooth, unos audífonos Bluetooth y un teléfono celular emparejado vía Bluetooth.',
      componentes: ['Laptop (maestro Bluetooth)', 'Ratón Bluetooth', 'Audífonos Bluetooth', 'Teléfono (Bluetooth)'],
      tipoCorrecto: 'PAN',
      topologiaCorrecta: 'estrella',
      solucion: 'Es una PAN (Personal Area Network): red de alcance personal (pocos metros) formada por dispositivos de un solo usuario vía Bluetooth. La topología es en estrella: la laptop actúa como maestro (piconet) y los periféricos son esclavos, todos conectados al dispositivo central.'
    }
  ];

  const TIPOS = ['PAN', 'LAN', 'WLAN', 'MAN', 'WAN'];
  const TOPOLOGIAS = ['bus', 'estrella', 'anillo', 'malla'];

  let _sec = null;
  let _round = 0;
  let _mistakes = 0;
  // Per-round state
  let _tipoSel = null;
  let _topoSel = null;
  let _tipoOk = false;
  let _topoOk = false;

  function _fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function _renderShell() {
    return `
      <div class="ch-header">
        <h2><span class="ch-icon">🌐</span> Identifica la red</h2>
        <div class="ch-stats">
          <span>⏱ <span class="timer-disp">00:00</span></span>
          <span>✗ Errores: <span class="err-cnt">0</span></span>
        </div>
      </div>
      <div id="ir-content"></div>
      <div id="ir-result" class="result-block hidden"></div>
    `;
  }

  function _renderRound() {
    _tipoSel = null;
    _topoSel = null;
    _tipoOk = false;
    _topoOk = false;

    const r = ROUNDS[_round];
    const content = _sec.querySelector('#ir-content');
    content.innerHTML = `
      <div class="round-indicator">Round ${_round + 1} / ${ROUNDS.length}</div>
      <div class="ir-scenario">
        <p class="ch-desc">${r.escenario}</p>
        <div class="component-list">
          <strong>Componentes:</strong>
          ${r.componentes.map(c => `<span class="comp-chip">${c}</span>`).join('')}
        </div>
      </div>
      <div class="ir-questions">
        <div class="ir-question" id="ir-tipo-q">
          <p><strong>¿Qué tipo de red es?</strong></p>
          <div class="option-row" id="ir-tipo-opts">
            ${TIPOS.map(t => `<button class="opt-btn" data-val="${t}" data-q="tipo">${t}</button>`).join('')}
          </div>
          <div class="q-feedback hidden" id="ir-tipo-fb"></div>
        </div>
        <div class="ir-question" id="ir-topo-q">
          <p><strong>¿Cuál es su topología?</strong></p>
          <div class="option-row" id="ir-topo-opts">
            ${TOPOLOGIAS.map(t => `<button class="opt-btn" data-val="${t}" data-q="topo">${t}</button>`).join('')}
          </div>
          <div class="q-feedback hidden" id="ir-topo-fb"></div>
        </div>
      </div>
      <div id="ir-next" class="ch-actions hidden">
        <button id="ir-next-btn" class="btn-primary">
          ${_round + 1 < ROUNDS.length ? 'Siguiente →' : 'Ver resultado'}
        </button>
      </div>
    `;

    content.querySelectorAll('.opt-btn').forEach(btn => {
      btn.addEventListener('click', () => _onSelect(btn));
    });
  }

  function _onSelect(btn) {
    const r = ROUNDS[_round];
    const q = btn.dataset.q;
    const val = btn.dataset.val;

    if (q === 'tipo' && _tipoOk) return;
    if (q === 'topo' && _topoOk) return;

    const correct = q === 'tipo'
      ? val.toLowerCase() === r.tipoCorrecto.toLowerCase()
      : val.toLowerCase() === r.topologiaCorrecta.toLowerCase();

    const opts = _sec.querySelector(q === 'tipo' ? '#ir-tipo-opts' : '#ir-topo-opts');
    const fb = _sec.querySelector(q === 'tipo' ? '#ir-tipo-fb' : '#ir-topo-fb');

    opts.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('opt-sel', 'opt-wrong'));
    btn.classList.add(correct ? 'opt-sel' : 'opt-wrong');

    fb.classList.remove('hidden');
    if (correct) {
      fb.className = 'q-feedback fb-ok';
      fb.textContent = '✓ Correcto';
      if (q === 'tipo') _tipoOk = true; else _topoOk = true;
      opts.querySelectorAll('.opt-btn').forEach(b => { if (b !== btn) b.disabled = true; });
    } else {
      _mistakes++;
      _sec.querySelector('.err-cnt').textContent = _mistakes;
      fb.className = 'q-feedback fb-error';
      fb.textContent = '✗ Incorrecto, intenta de nuevo';
    }

    if (_tipoOk && _topoOk) {
      _sec.querySelector('#ir-next').classList.remove('hidden');
      _sec.querySelector('#ir-next-btn').addEventListener('click', _nextRound, { once: true });
    }
  }

  function _nextRound() {
    _round++;
    if (_round >= ROUNDS.length) _showResult(); else _renderRound();
  }

  function _showResult() {
    timer.stop();
    const secs = timer.getSeconds();
    const nombre = memory.getNombreActual();
    const score = memory.registrarIntento(nombre, 'identifica_red', _mistakes, secs);
    const result = _sec.querySelector('#ir-result');
    result.classList.remove('hidden');
    _sec.querySelector('#ir-content').innerHTML = '';
    result.innerHTML = `
      <div class="result-summary">
        <h3>🏁 Resultado</h3>
        <div class="result-stats">
          <span class="stat-box">Puntaje<br><strong>${score}</strong></span>
          <span class="stat-box">Errores<br><strong>${_mistakes}</strong></span>
          <span class="stat-box">Tiempo<br><strong>${secs}s</strong></span>
        </div>
      </div>
      <h4>Soluciones comentadas</h4>
      ${ROUNDS.map(r => `
        <div class="sol-item sol-ok">
          <div class="sol-hdr">
            <strong>Tipo: ${r.tipoCorrecto}</strong> · <strong>Topología: ${r.topologiaCorrecta}</strong>
          </div>
          <p class="sol-texto">${r.solucion}</p>
        </div>
      `).join('')}
      <div class="result-actions">
        <button class="btn-primary" id="ir-retry">Reintentar</button>
        <button class="btn-secondary" id="ir-inicio">Volver al Inicio</button>
      </div>
    `;
    result.querySelector('#ir-retry').addEventListener('click', reintentar);
    result.querySelector('#ir-inicio').addEventListener('click', () => app.goTo('#sec-inicio'));
    app.refrescarChecks();
    result.scrollIntoView({ behavior: 'smooth' });
  }

  async function init(sec) {
    _sec = sec;
    _round = 0;
    _mistakes = 0;
    _sec.innerHTML = _renderShell();
    _renderRound();
    timer.start(s => {
      const d = _sec.querySelector('.timer-disp');
      if (d) d.textContent = _fmt(s);
    });
  }

  function reset() {
    timer.stop();
    _round = 0;
    _mistakes = 0;
    _tipoSel = null;
    _topoSel = null;
    _tipoOk = false;
    _topoOk = false;
  }

  function reintentar() { reset(); init(_sec); }

  return { init, reset, reintentar };
})();
