const app = (() => {
  const _challenges = {
    cable_perdido:  cablePerdido,
    la_intrusa:     laIntrusa,
    identifica_red: identificaRed,
    anti_phishing:  antiPhishing
  };
  let _activeChallenge = null;

  // ---- Router ----

  function _initRouter() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Reset current challenge on tab leave
        if (_activeChallenge && _challenges[_activeChallenge]) {
          _challenges[_activeChallenge].reset();
        }

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('main > section').forEach(s => {
          s.classList.add('hidden');
          s.classList.remove('active');
        });

        const targetId = tab.dataset.target;
        const section = document.querySelector(targetId);
        section.classList.remove('hidden');
        section.classList.add('active');

        const key = tab.dataset.challenge;
        if (key) {
          _activeChallenge = key;
          _challenges[key].init(section);
        } else {
          _activeChallenge = null;
          if (targetId === '#sec-scoreboard') _renderScoreboard();
        }
      });
    });
  }

  function goTo(targetId) {
    const tab = document.querySelector(`.tab[data-target="${targetId}"]`);
    if (tab) tab.click();
  }

  // ---- Name modal ----

  function _initNombre() {
    const modal = document.getElementById('modal-nombre');
    const input = document.getElementById('input-nombre');
    const btn   = document.getElementById('btn-empezar');

    const saved = memory.getNombreActual();
    if (saved) {
      modal.classList.add('hidden');
      document.getElementById('display-nombre').textContent = saved;
    } else {
      modal.classList.remove('hidden');
    }

    function confirmar() {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      memory.setNombreActual(name);
      document.getElementById('display-nombre').textContent = name;
      modal.classList.add('hidden');
      refrescarChecks();
    }

    btn.addEventListener('click', confirmar);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') confirmar(); });

    document.getElementById('btn-nuevo-jugador').addEventListener('click', () => {
      input.value = '';
      modal.classList.remove('hidden');
      setTimeout(() => input.focus(), 50);
    });
  }

  // ---- Checkmarks on tabs ----

  function refrescarChecks() {
    document.querySelectorAll('.tab[data-challenge]').forEach(tab => {
      const key = tab.dataset.challenge;
      const span = tab.querySelector('.check-mark');
      if (span) span.textContent = memory.estaCompletado(key) ? ' ✓' : '';
    });
  }

  // ---- Scoreboard ----

  function _renderScoreboard() {
    const data = memory.obtenerScoreboardOrdenado();
    const current = memory.getNombreActual();
    const tbody = document.getElementById('cuerpo-scoreboard');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#64748b">Sin datos aún</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((row, i) => `
      <tr class="${row.name === current ? 'current-player' : ''}">
        <td>${i + 1}</td>
        <td>${row.name}</td>
        <td>${row.score}</td>
        <td>${row.time}</td>
      </tr>
    `).join('');
  }

  // ---- Docs button in header ----

  function _initDocsBtn() {
    document.getElementById('btn-docs').addEventListener('click', () => {
      if (_activeChallenge && _challenges[_activeChallenge]) {
        _challenges[_activeChallenge].reset();
      }
      _activeChallenge = null;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('main > section').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
      });
      const sec = document.getElementById('sec-docs');
      sec.classList.remove('hidden');
      sec.classList.add('active');
    });
  }

  // ---- Docs sub-panel switching ----

  function _initDocs() {
    document.querySelectorAll('.doc-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.doc-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.doc-panel').forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        const panel = document.getElementById('doc-panel-' + btn.dataset.panel);
        if (panel) panel.classList.remove('hidden');
      });
    });
  }

  // ---- Home card navigation ----

  function _initHomeCards() {
    const map = {
      'card-cable':    '#sec-cable-perdido',
      'card-intrusa':  '#sec-la-intrusa',
      'card-identifica': '#sec-identifica-red',
      'card-phishing': '#sec-anti-phishing'
    };
    Object.entries(map).forEach(([id, target]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => goTo(target));
    });
  }

  // ---- Init ----

  async function init() {
    await memory.cargarScoreboard();
    _initNombre();
    _initRouter();
    _initHomeCards();
    _initDocsBtn();
    _initDocs();
    refrescarChecks();
  }

  return { init, goTo, refrescarChecks };
})();

document.addEventListener('DOMContentLoaded', app.init);
