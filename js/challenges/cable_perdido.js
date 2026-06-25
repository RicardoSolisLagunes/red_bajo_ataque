/* El cable perdido
   TEMPLATES definen la topología; _makeRound() elige el cable roto al azar.
   - Estrella / Bus : clic en el cable
   - Anillo / Malla : simulación de paquete + clic en el cable
*/
const cablePerdido = (() => {

  // ---- Round templates (sin cable roto fijo) ----

  const TEMPLATES = [
    {
      topologia: 'Estrella',
      mode: 'click',
      swPos: { x: 250, y: 150 },
      pcs: [
        { id: 'c1', label: 'PC1', x: 80,  y: 60  },
        { id: 'c2', label: 'PC2', x: 420, y: 60  },
        { id: 'c3', label: 'PC3', x: 420, y: 240 },
        { id: 'c4', label: 'PC4', x: 80,  y: 240 }
      ]
    },
    {
      topologia: 'Bus',
      mode: 'click',
      pcs: [
        { label: 'PC1', x: 90  },
        { label: 'PC2', x: 195 },
        { label: 'PC3', x: 300 },
        { label: 'PC4', x: 405 }
      ],
      // Segmentos inter-PC clickeables (entre taps adyacentes)
      segments: [
        { id: 's1', li: 0, ri: 1 },   // PC1-PC2
        { id: 's2', li: 1, ri: 2 },   // PC2-PC3
        { id: 's3', li: 2, ri: 3 }    // PC3-PC4
      ]
    },
    {
      topologia: 'Anillo',
      mode: 'packet',
      vbW: 500, vbH: 340,
      nodes: {
        PC1: { x: 250, y: 55  },
        PC2: { x: 445, y: 175 },
        PC3: { x: 250, y: 295 },
        PC4: { x: 55,  y: 175 }
      },
      allLinks: [
        { id: 'la', from: 'PC1', to: 'PC2' },
        { id: 'lb', from: 'PC2', to: 'PC3' },
        { id: 'lc', from: 'PC3', to: 'PC4' },
        { id: 'ld', from: 'PC4', to: 'PC1' }
      ]
    },
    {
      topologia: 'Malla',
      mode: 'packet',
      vbW: 500, vbH: 305,
      nodes: {
        PC1: { x: 90,  y: 80  },
        PC2: { x: 410, y: 80  },
        PC3: { x: 90,  y: 225 },
        PC4: { x: 410, y: 225 }
      },
      allLinks: [
        { id: 'm1', from: 'PC1', to: 'PC2' },
        { id: 'm2', from: 'PC1', to: 'PC3' },
        { id: 'm3', from: 'PC1', to: 'PC4' },
        { id: 'm4', from: 'PC2', to: 'PC3' },
        { id: 'm5', from: 'PC2', to: 'PC4' },
        { id: 'm6', from: 'PC3', to: 'PC4' }
      ]
    }
  ];

  // ---- Genera un round concreto con cable roto al azar ----

  function _makeRound(tmpl) {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    if (tmpl.topologia === 'Estrella') {
      const broken = pick(tmpl.pcs);
      return {
        ...tmpl,
        brokenId: broken.id,
        enunciado: 'Un solo equipo perdió su conexión al switch. ¿Cuál cable está dañado?',
        solucion: `En topología estrella cada equipo tiene su propio cable directo al switch. Solo ${broken.label} quedó sin red, por lo que únicamente el cable de ${broken.label} está dañado; el resto sigue funcionando con normalidad.`
      };
    }

    if (tmpl.topologia === 'Bus') {
      const seg     = pick(tmpl.segments);
      const online  = tmpl.pcs.filter((_, i) => i <= seg.li);
      const offline = tmpl.pcs.filter((_, i) => i >  seg.li);
      const count   = offline.length;
      return {
        ...tmpl,
        brokenId:   seg.id,
        offlineLiThreshold: seg.li,  // PCs at index > li are offline
        enunciado: `${count === 1 ? 'Un equipo perdió' : count + ' equipos perdieron'} conexión. Localiza el tramo roto del cable coaxial.`,
        solucion: `Una ruptura divide el bus en dos segmentos. ${online.map(p => p.label).join(' y ')} ${online.length === 1 ? 'sigue conectada' : 'siguen conectadas'} al segmento izquierdo, mientras ${offline.map(p => p.label).join(' y ')} ${offline.length === 1 ? 'quedó aislada' : 'quedaron aisladas'}. El tramo roto es el segmento entre ${tmpl.pcs[seg.li].label} y ${tmpl.pcs[seg.ri].label}.`
      };
    }

    // Anillo / Malla
    const broken = pick(tmpl.allLinks);
    const links  = tmpl.allLinks.map(l => ({ ...l, broken: l.id === broken.id }));
    const isAnillo = tmpl.topologia === 'Anillo';
    return {
      ...tmpl,
      links,
      brokenId: broken.id,
      enunciado: isAnillo
        ? 'Todas las PCs tienen conexión (el anillo es bidireccional). Envía paquetes entre equipos para descubrir qué enlace está dañado y haz clic en él.'
        : 'La red tiene rutas redundantes. Envía paquetes para detectar el enlace caído y haz clic en él.',
      solucion: isAnillo
        ? `En un anillo bidireccional, aunque un enlace falle, los datos circulan en sentido contrario. El enlace roto era ${broken.from}–${broken.to}: cualquier paquete entre esos nodos tomaba el camino largo rodeando el anillo en lugar de la ruta directa.`
        : `En malla la redundancia permite enrutar alrededor de un enlace caído. El enlace ${broken.from}–${broken.to} estaba roto: los paquetes tomaban rutas alternativas (p. ej. a través de otras PCs) en lugar de la ruta directa.`
    };
  }

  // ---- Estado ----

  let _sec       = null;
  let _roundIdx  = 0;
  let _mistakes  = 0;
  let _rounds    = [];   // live rounds generados en init()
  let _packetSrc = null;
  let _animating = false;
  let _animRaf   = null;

  // ---- Helpers ----

  function _fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function _buildGraph(links) {
    const g = {};
    links.forEach(l => {
      if (!g[l.from]) g[l.from] = [];
      if (!g[l.to])   g[l.to]   = [];
      if (!l.broken) {
        g[l.from].push(l.to);
        g[l.to].push(l.from);
      }
    });
    return g;
  }

  function _bfs(graph, start, end) {
    if (start === end) return [start];
    const queue   = [[start, [start]]];
    const visited = new Set([start]);
    while (queue.length) {
      const [node, path] = queue.shift();
      for (const nb of (graph[node] || [])) {
        if (visited.has(nb)) continue;
        const p = [...path, nb];
        if (nb === end) return p;
        visited.add(nb);
        queue.push([nb, p]);
      }
    }
    return null;
  }

  // ---- Shell ----

  function _renderShell() {
    return `
      <div class="ch-header">
        <h2><span class="ch-icon">🔌</span> El cable perdido</h2>
        <div class="ch-stats">
          <span>⏱ <span class="timer-disp">00:00</span></span>
          <span>✗ Errores: <span class="err-cnt">0</span></span>
        </div>
      </div>
      <div id="cp-content"></div>
      <div id="cp-result" class="result-block hidden"></div>
    `;
  }

  function _renderRound() {
    _packetSrc = null;
    _animating = false;
    if (_animRaf) { cancelAnimationFrame(_animRaf); _animRaf = null; }

    const r       = _rounds[_roundIdx];
    const content = _sec.querySelector('#cp-content');
    if (r.mode === 'click') _renderClickRound(r, content);
    else                    _renderPacketRound(r, content);
  }

  // ---- Modo click (estrella, bus) ----

  function _renderClickRound(r, content) {
    content.innerHTML = `
      <div class="round-indicator">Round ${_roundIdx + 1} / ${_rounds.length} — Topología: <strong>${r.topologia}</strong></div>
      <p class="ch-desc">${r.enunciado}</p>
      <div class="topology-wrap" id="topo-svg"></div>
      <div id="cp-fb" class="round-feedback hidden"></div>
    `;
    content.querySelector('#topo-svg').innerHTML =
      r.topologia === 'Estrella' ? _svgEstrella(r) : _svgBus(r);
    _attachCableHandlers();
  }

  function _attachCableHandlers() {
    _sec.querySelectorAll('[data-cable-id][data-role="hit"]').forEach(hit => {
      const id = hit.dataset.cableId;
      hit.addEventListener('click', () => _onCableClick(id));
      hit.addEventListener('mouseenter', () => {
        const vis = _sec.querySelector(`[data-cable-id="${id}"][data-role="vis"]`);
        if (vis) vis.setAttribute('stroke', '#ffd700');
      });
      hit.addEventListener('mouseleave', () => {
        const vis = _sec.querySelector(`[data-cable-id="${id}"][data-role="vis"]`);
        if (vis && vis.getAttribute('stroke') === '#ffd700')
          vis.setAttribute('stroke', vis.dataset.origStroke || '#4a9eca');
      });
    });
  }

  // ---- Modo packet (anillo, malla) ----

  function _renderPacketRound(r, content) {
    content.innerHTML = `
      <div class="round-indicator">Round ${_roundIdx + 1} / ${_rounds.length} — Topología: <strong>${r.topologia}</strong></div>
      <p class="ch-desc">${r.enunciado}</p>
      <p class="packet-hint" id="pkt-hint">Haz clic en una PC para seleccionarla como origen del paquete</p>
      <div class="topology-wrap" id="topo-svg"></div>
      <div id="cp-fb" class="round-feedback hidden"></div>
    `;
    content.querySelector('#topo-svg').innerHTML = _buildPacketSvg(r);

    Object.keys(r.nodes).forEach(pcId => {
      const el = _sec.querySelector(`[data-pc-id="${pcId}"]`);
      if (el) el.addEventListener('click', () => _onPcClick(r, pcId));
    });
    _attachCableHandlers();
  }

  function _buildPacketSvg(r) {
    const textY = r.vbH - 15;
    let svg = `<svg viewBox="0 0 ${r.vbW} ${r.vbH}" class="topo-svg" id="packet-svg">`;

    r.links.forEach(l => {
      const f = r.nodes[l.from], t = r.nodes[l.to];
      svg += _cable(f.x, f.y, t.x, t.y, l.id, l.broken);
    });

    Object.entries(r.nodes).forEach(([id, n]) => {
      svg += `
        <rect x="${n.x - 28}" y="${n.y - 18}" width="56" height="36" rx="6"
              fill="#1a2a3a" stroke="#4a9eca" stroke-width="2"
              data-pc-id="${id}" style="cursor:pointer"/>
        <text x="${n.x}" y="${n.y + 5}" text-anchor="middle"
              fill="#e2e8f0" font-size="11" font-family="monospace"
              pointer-events="none">${id}</text>
      `;
    });

    svg += `<text x="${r.vbW / 2}" y="${textY}" text-anchor="middle" fill="#475569" font-size="10">Clic en PC → enviar paquete · Clic en cable → marcar como dañado</text>`;
    svg += `</svg>`;
    return svg;
  }

  // ---- Interacción PC (modo packet) ----

  function _onPcClick(r, pcId) {
    if (_animating) return;

    if (!_packetSrc) {
      _packetSrc = pcId;
      _highlightPc(pcId, true);
      _setHint(`Origen: ${pcId} — Selecciona el destino`);
    } else if (pcId === _packetSrc) {
      _highlightPc(_packetSrc, false);
      _packetSrc = null;
      _setHint('Haz clic en una PC para seleccionarla como origen del paquete');
    } else {
      const src = _packetSrc;
      _highlightPc(src, false);
      _packetSrc = null;

      const path = _bfs(_buildGraph(r.links), src, pcId);
      if (!path) return;

      _animating = true;
      _setHint(`📦 ${path.join(' → ')}`);

      const svgEl = _sec.querySelector('#packet-svg');
      _animatePacket(r.nodes, path, svgEl, () => {
        _animating = false;
        _setHint('Paquete entregado. Sigue enviando o haz clic en el cable dañado.');
      });
    }
  }

  function _highlightPc(pcId, on) {
    const el = _sec.querySelector(`[data-pc-id="${pcId}"]`);
    if (!el) return;
    el.setAttribute('fill',         on ? '#0a3050' : '#1a2a3a');
    el.setAttribute('stroke',       on ? '#00c8ff' : '#4a9eca');
    el.setAttribute('stroke-width', on ? '3' : '2');
  }

  function _setHint(txt) {
    const el = _sec.querySelector('#pkt-hint');
    if (el) el.textContent = txt;
  }

  // ---- Animación del paquete ----

  function _animatePacket(nodes, path, svgEl, onDone) {
    const NS     = 'http://www.w3.org/2000/svg';
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('r', '9');
    circle.setAttribute('fill', '#00c8ff');
    circle.setAttribute('stroke', '#0a0e1a');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('cx', String(nodes[path[0]].x));
    circle.setAttribute('cy', String(nodes[path[0]].y));
    circle.style.pointerEvents = 'none';
    svgEl.appendChild(circle);

    let segIdx   = 0;
    let progress = 0;
    const SEG_MS = 420;
    let lastTs   = null;

    function step(ts) {
      if (!lastTs) lastTs = ts;
      progress += (ts - lastTs) / SEG_MS;
      lastTs = ts;

      if (progress >= 1) {
        progress -= 1;
        segIdx++;
        if (segIdx >= path.length - 1) {
          if (svgEl.contains(circle)) svgEl.removeChild(circle);
          _animRaf = null;
          onDone();
          return;
        }
      }

      const from = nodes[path[segIdx]];
      const to   = nodes[path[segIdx + 1]];
      circle.setAttribute('cx', String(from.x + (to.x - from.x) * progress));
      circle.setAttribute('cy', String(from.y + (to.y - from.y) * progress));
      _animRaf = requestAnimationFrame(step);
    }

    _animRaf = requestAnimationFrame(step);
  }

  // ---- Clic en cable (ambos modos) ----

  function _onCableClick(cableId) {
    const visEl  = _sec.querySelector(`[data-cable-id="${cableId}"][data-role="vis"]`);
    const fb     = _sec.querySelector('#cp-fb');
    const broken = visEl && visEl.dataset.defectuoso === 'true';

    if (broken) {
      if (visEl) visEl.setAttribute('stroke', '#00ff88');
      _sec.querySelectorAll('[data-cable-id][data-role="hit"]').forEach(e => e.style.pointerEvents = 'none');
      _sec.querySelectorAll('[data-pc-id]').forEach(e => e.style.pointerEvents = 'none');
      fb.classList.remove('hidden', 'fb-error');
      fb.classList.add('fb-ok');
      fb.innerHTML = `✅ ¡Correcto! Ese es el cable dañado.`;
      setTimeout(() => _nextRound(), 1200);
    } else {
      _mistakes++;
      _sec.querySelector('.err-cnt').textContent = _mistakes;
      if (visEl) {
        visEl.setAttribute('stroke', '#ff4455');
        setTimeout(() => visEl.setAttribute('stroke', visEl.dataset.origStroke || '#4a9eca'), 600);
      }
      fb.classList.remove('hidden', 'fb-ok');
      fb.classList.add('fb-error');
      fb.innerHTML = `✗ Ese cable está bien. Sigue buscando.`;
    }
  }

  function _nextRound() {
    _roundIdx++;
    if (_roundIdx >= _rounds.length) _showResult(); else _renderRound();
  }

  // ---- Resultado ----

  function _showResult() {
    timer.stop();
    const secs   = timer.getSeconds();
    const nombre = memory.getNombreActual();
    const score  = memory.registrarIntento(nombre, 'cable_perdido', _mistakes, secs);

    const result = _sec.querySelector('#cp-result');
    result.classList.remove('hidden');
    _sec.querySelector('#cp-content').innerHTML = '';
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
      ${_rounds.map(r => `
        <div class="sol-item sol-ok">
          <div class="sol-hdr"><strong>${r.topologia}</strong></div>
          <p class="sol-texto">${r.solucion}</p>
        </div>
      `).join('')}
      <div class="result-actions">
        <button class="btn-primary" id="cp-retry">Reintentar</button>
        <button class="btn-secondary" id="cp-inicio">Volver al Inicio</button>
      </div>
    `;
    result.querySelector('#cp-retry').addEventListener('click', reintentar);
    result.querySelector('#cp-inicio').addEventListener('click', () => app.goTo('#sec-inicio'));
    app.refrescarChecks();
    result.scrollIntoView({ behavior: 'smooth' });
  }

  // ---- SVG primitivos ----

  function _cable(x1, y1, x2, y2, id, broken) {
    const color = '#4a9eca';
    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="${color}" stroke-width="4" stroke-linecap="round"
            data-cable-id="${id}" data-role="vis"
            data-defectuoso="${broken}" data-orig-stroke="${color}"
            style="pointer-events:none"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="transparent" stroke-width="18" style="cursor:pointer"
            data-cable-id="${id}" data-role="hit"/>
    `;
  }

  function _node(x, y, label, noConn) {
    const fill   = noConn ? '#3a1a1a' : '#1a2a3a';
    const border = noConn ? '#ff4455' : '#4a9eca';
    return `
      <rect x="${x - 28}" y="${y - 18}" width="56" height="36" rx="6"
            fill="${fill}" stroke="${border}" stroke-width="2"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle"
            fill="#e2e8f0" font-size="11" font-family="monospace">${label}</text>
      ${noConn ? `<text x="${x}" y="${y + 26}" text-anchor="middle" fill="#ff4455" font-size="9">sin red</text>` : ''}
    `;
  }

  function _switch(x, y) {
    return `
      <rect x="${x - 30}" y="${y - 22}" width="60" height="44" rx="8"
            fill="#0d2a3a" stroke="#00c8ff" stroke-width="2"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#00c8ff"
            font-size="12" font-family="monospace" font-weight="bold">SW</text>
    `;
  }

  // ---- SVG generadores (usan el round live) ----

  function _svgEstrella(r) {
    const sw = r.swPos;
    let svg = `<svg viewBox="0 0 500 300" class="topo-svg">`;
    r.pcs.forEach(pc => {
      svg += _cable(sw.x, sw.y, pc.x, pc.y, pc.id, pc.id === r.brokenId);
    });
    svg += _switch(sw.x, sw.y);
    r.pcs.forEach(pc => {
      svg += _node(pc.x, pc.y, pc.label, pc.id === r.brokenId);
    });
    svg += `<text x="250" y="285" text-anchor="middle" fill="#64748b" font-size="11">Haz clic en el cable defectuoso</text>`;
    svg += `</svg>`;
    return svg;
  }

  function _svgBus(r) {
    const busY = 190, pcY = 105;
    const { pcs, segments, brokenId, offlineLiThreshold } = r;
    let svg = `<svg viewBox="0 0 500 260" class="topo-svg">`;

    // Terminadores
    svg += `<circle cx="50"  cy="${busY}" r="8" fill="#0d2a3a" stroke="#4a9eca" stroke-width="2"/>`;
    svg += `<circle cx="450" cy="${busY}" r="8" fill="#0d2a3a" stroke="#4a9eca" stroke-width="2"/>`;

    // Segmentos no clickeables (extremos del bus)
    svg += `<line x1="50" y1="${busY}" x2="${pcs[0].x}" y2="${busY}"
                  stroke="#4a9eca" stroke-width="4" stroke-linecap="round"
                  style="pointer-events:none"/>`;
    svg += `<line x1="${pcs[pcs.length-1].x}" y1="${busY}" x2="450" y2="${busY}"
                  stroke="#4a9eca" stroke-width="4" stroke-linecap="round"
                  style="pointer-events:none"/>`;

    // Segmentos inter-PC clickeables
    segments.forEach(seg => {
      svg += _cable(pcs[seg.li].x, busY, pcs[seg.ri].x, busY, seg.id, seg.id === brokenId);
    });

    // Derivaciones y nodos PC
    pcs.forEach((p, i) => {
      const offline = i > offlineLiThreshold;
      svg += `<line x1="${p.x}" y1="${busY}" x2="${p.x}" y2="${pcY + 18}"
                    stroke="#4a9eca" stroke-width="2"/>`;
      svg += _node(p.x, pcY, p.label, offline);
    });

    svg += `<text x="250" y="245" text-anchor="middle" fill="#64748b" font-size="11">Haz clic en el tramo roto</text>`;
    svg += `</svg>`;
    return svg;
  }

  // ---- API pública ----

  async function init(sec) {
    _sec      = sec;
    _roundIdx = 0;
    _mistakes = 0;
    _packetSrc = null;
    _animating = false;
    if (_animRaf) { cancelAnimationFrame(_animRaf); _animRaf = null; }

    // Generar todos los rounds con cables rotos al azar
    _rounds = TEMPLATES.map(_makeRound);

    _sec.innerHTML = _renderShell();
    _renderRound();
    timer.start(s => {
      const d = _sec.querySelector('.timer-disp');
      if (d) d.textContent = _fmt(s);
    });
  }

  function reset() {
    timer.stop();
    if (_animRaf) { cancelAnimationFrame(_animRaf); _animRaf = null; }
    _animating = false;
    _packetSrc = null;
    _roundIdx  = 0;
    _mistakes  = 0;
    _rounds    = [];
  }

  function reintentar() { reset(); init(_sec); }

  return { init, reset, reintentar };
})();
