/* La intrusa — identify the unauthorized device in the network */
const laIntrusa = (() => {
  const ROUNDS = [
    {
      id: 'rogue-ap',
      enunciado: 'Esta red corporativa tiene un dispositivo no autorizado. ¿Cuál es el intruso?',
      solucion: 'El dispositivo AP-03 es un rogue AP (punto de acceso no autorizado) conectado al switch interno sin aprobación. Crea una puerta inalámbrica que evade el firewall y permite que atacantes externos entren a la red sin controles. Router, Firewall, Switch, Servidor y las PCs son parte del diseño aprobado.',
      dispositivosHtml: _buildRogueAP
    },
    {
      id: 'fuera-firewall',
      enunciado: 'Un equipo está conectado en un lugar donde no debería estar. ¿Cuál es el intruso?',
      solucion: 'PC-Admin (192.168.0.50) está conectado directamente al router, antes del firewall, en el segmento expuesto a Internet. Su tráfico nunca pasa por el firewall, saltándose todas las políticas de seguridad. Los equipos PC1, PC2 y el Servidor sí están correctamente ubicados detrás del firewall.',
      dispositivosHtml: _buildFueraFirewall
    },
    {
      id: 'mac-desconocida',
      enunciado: 'Solo los dispositivos del inventario están autorizados. ¿Cuál no aparece en el inventario?',
      solucion: 'Equipo-5 (192.168.1.99) no aparece en el inventario de dispositivos autorizados y su MAC es desconocida. Puede tratarse de un equipo externo conectado físicamente a un puerto libre del switch. Los otros cuatro dispositivos tienen su IP y MAC registradas en el inventario aprobado.',
      dispositivosHtml: _buildMacDesconocida
    }
  ];

  let _sec = null;
  let _round = 0;
  let _mistakes = 0;

  function _fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function _renderShell() {
    return `
      <div class="ch-header">
        <h2><span class="ch-icon">🔍</span> La intrusa</h2>
        <div class="ch-stats">
          <span>⏱ <span class="timer-disp">00:00</span></span>
          <span>✗ Errores: <span class="err-cnt">0</span></span>
        </div>
      </div>
      <div id="li-content"></div>
      <div id="li-result" class="result-block hidden"></div>
    `;
  }

  function _renderRound() {
    const r = ROUNDS[_round];
    const content = _sec.querySelector('#li-content');
    content.innerHTML = `
      <div class="round-indicator">Round ${_round + 1} / ${ROUNDS.length}</div>
      <p class="ch-desc">${r.enunciado}</p>
      <div id="li-diagram" class="diagram-wrap"></div>
      <div id="li-fb" class="round-feedback hidden"></div>
    `;
    const diagram = content.querySelector('#li-diagram');
    diagram.innerHTML = r.dispositivosHtml();
    diagram.querySelectorAll('[data-device-id]').forEach(el => {
      el.addEventListener('click', () => _onDeviceClick(el.dataset.deviceId, el.dataset.intruso === 'true'));
    });
  }

  function _onDeviceClick(deviceId, isIntruso) {
    const fb = _sec.querySelector('#li-fb');
    if (isIntruso) {
      const card = _sec.querySelector(`[data-device-id="${deviceId}"]`);
      card.classList.add('dev-intruso-found');
      _sec.querySelectorAll('[data-device-id]').forEach(el => el.style.pointerEvents = 'none');
      fb.classList.remove('hidden', 'fb-error');
      fb.classList.add('fb-ok');
      fb.innerHTML = `✅ ¡Correcto! Ese es el dispositivo intruso.`;
      setTimeout(() => _nextRound(), 1400);
    } else {
      _mistakes++;
      _sec.querySelector('.err-cnt').textContent = _mistakes;
      const card = _sec.querySelector(`[data-device-id="${deviceId}"]`);
      card.classList.add('dev-wrong-flash');
      setTimeout(() => card.classList.remove('dev-wrong-flash'), 600);
      fb.classList.remove('hidden', 'fb-ok');
      fb.classList.add('fb-error');
      fb.innerHTML = `✗ Ese dispositivo es legítimo. Sigue buscando.`;
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
    const score = memory.registrarIntento(nombre, 'la_intrusa', _mistakes, secs);
    const result = _sec.querySelector('#li-result');
    result.classList.remove('hidden');
    _sec.querySelector('#li-content').innerHTML = '';
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
          <div class="sol-hdr"><strong>Round: ${r.id}</strong></div>
          <p class="sol-texto">${r.solucion}</p>
        </div>
      `).join('')}
      <div class="result-actions">
        <button class="btn-primary" id="li-retry">Reintentar</button>
        <button class="btn-secondary" id="li-inicio">Volver al Inicio</button>
      </div>
    `;
    result.querySelector('#li-retry').addEventListener('click', reintentar);
    result.querySelector('#li-inicio').addEventListener('click', () => app.goTo('#sec-inicio'));
    app.refrescarChecks();
    result.scrollIntoView({ behavior: 'smooth' });
  }

  // ---- Diagram builders ----

  function _devCard(id, icon, label, role, intruso) {
    return `
      <div class="dev-card" data-device-id="${id}" data-intruso="${intruso}" title="${role}">
        <div class="dev-icon">${icon}</div>
        <div class="dev-label">${label}</div>
        <div class="dev-role">${role}</div>
      </div>
    `;
  }

  function _arrow(label) {
    return `<div class="net-arrow">↕<br><small>${label}</small></div>`;
  }

  function _buildRogueAP() {
    return `
      <div class="net-diagram">
        <div class="net-row">
          ${_devCard('internet', '🌐', 'Internet', 'WAN', false)}
        </div>
        ${_arrow('')}
        <div class="net-row">
          ${_devCard('router', '📡', 'Router', 'Router de borde', false)}
        </div>
        ${_arrow('')}
        <div class="net-row">
          ${_devCard('firewall', '🛡️', 'Firewall', 'Cortafuegos', false)}
        </div>
        ${_arrow('')}
        <div class="net-row">
          ${_devCard('switch', '🔀', 'Switch', 'Switch central', false)}
        </div>
        <div class="net-row">
          ${_devCard('servidor', '🖥️', 'Servidor', 'Servidor web interno', false)}
          ${_devCard('pc1', '💻', 'PC1', 'Estación de trabajo', false)}
          ${_devCard('pc2', '💻', 'PC2', 'Estación de trabajo', false)}
          ${_devCard('ap-x', '📶', 'AP-03', 'Punto de acceso Wi-Fi', true)}
        </div>
      </div>
    `;
  }

  function _buildFueraFirewall() {
    return `
      <div class="net-diagram">
        <div class="net-row">
          ${_devCard('internet', '🌐', 'Internet', 'WAN', false)}
        </div>
        ${_arrow('')}
        <div class="net-row">
          ${_devCard('router', '📡', 'Router', 'Router de borde', false)}
          ${_devCard('laptop-bad', '💻', 'PC-Admin', '192.168.0.50', true)}
        </div>
        ${_arrow('↓ segmento protegido')}
        <div class="net-row">
          ${_devCard('firewall', '🛡️', 'Firewall', 'Cortafuegos', false)}
        </div>
        ${_arrow('')}
        <div class="net-row">
          ${_devCard('switch', '🔀', 'Switch', 'Switch interno', false)}
        </div>
        <div class="net-row">
          ${_devCard('pc1', '💻', 'PC1', 'Estación interna', false)}
          ${_devCard('pc2', '💻', 'PC2', 'Estación interna', false)}
          ${_devCard('servidor', '🖥️', 'Servidor', 'Servidor interno', false)}
        </div>
      </div>
    `;
  }

  function _buildMacDesconocida() {
    return `
      <div class="inventory-wrap">
        <div class="inventory-label">📋 Inventario de dispositivos autorizados</div>
        <table class="inventory-table">
          <thead><tr><th>Dispositivo</th><th>IP</th><th>MAC</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Servidor</td><td>192.168.1.1</td><td>AA:BB:CC:11:22:33</td><td class="auth-ok">✓ Autorizado</td></tr>
            <tr><td>PC1</td><td>192.168.1.10</td><td>AA:BB:CC:44:55:66</td><td class="auth-ok">✓ Autorizado</td></tr>
            <tr><td>PC2</td><td>192.168.1.11</td><td>AA:BB:CC:77:88:99</td><td class="auth-ok">✓ Autorizado</td></tr>
            <tr><td>Impresora</td><td>192.168.1.20</td><td>AA:BB:CC:AA:BB:CC</td><td class="auth-ok">✓ Autorizado</td></tr>
          </tbody>
        </table>
        <div class="inventory-label">🖥️ Dispositivos detectados en la red ahora mismo</div>
        <div class="net-row" style="margin-top:12px">
          ${_devCard('servidor-d', '🖥️', 'Servidor', '192.168.1.1', false)}
          ${_devCard('pc1-d', '💻', 'PC1', '192.168.1.10', false)}
          ${_devCard('pc2-d', '💻', 'PC2', '192.168.1.11', false)}
          ${_devCard('impresora-d', '🖨️', 'Impresora', '192.168.1.20', false)}
          ${_devCard('laptop-unk', '💻', 'Equipo-5', '192.168.1.99 / MAC: ?', true)}
        </div>
      </div>
    `;
  }

  // ---- Public API ----

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
  }

  function reintentar() { reset(); init(_sec); }

  return { init, reset, reintentar };
})();
