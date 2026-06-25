const memory = (() => {
  const K = {
    player: 'rba_current_player',
    players: 'rba_players',
    scoreboard: 'rba_scoreboard'
  };

  function calcularPuntaje(mistakes, seconds) {
    const extra = Math.max(0, seconds - 25);
    const penalTiempo = Math.min(50, Math.floor(extra / 10) * 10);
    return Math.max(0, 100 - mistakes * 20 - penalTiempo);
  }

  function _getPlayers() {
    const raw = localStorage.getItem(K.players);
    return raw ? JSON.parse(raw) : {};
  }

  function _setPlayers(p) {
    localStorage.setItem(K.players, JSON.stringify(p));
  }

  function _getRawScoreboard() {
    const raw = localStorage.getItem(K.scoreboard);
    return raw ? JSON.parse(raw) : [];
  }

  function _upsertScoreboard(name, players) {
    const ch = (players[name] || {}).challenges || {};
    let totalScore = 0, totalTime = 0;
    Object.values(ch).forEach(c => { totalScore += c.score; totalTime += c.time; });
    const sb = _getRawScoreboard();
    const idx = sb.findIndex(e => e.name === name);
    const entry = { name, score: totalScore, time: totalTime };
    if (idx >= 0) sb[idx] = entry; else sb.push(entry);
    localStorage.setItem(K.scoreboard, JSON.stringify(sb));
  }

  async function cargarScoreboard() {
    if (_getRawScoreboard().length) return;
    try {
      const r = await fetch('memory/scoreboard.txt');
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (!_getRawScoreboard().length) {
        localStorage.setItem(K.scoreboard, JSON.stringify(data));
      }
    } catch { /* file:// fallback — start with empty scoreboard */ }
  }

  function registrarIntento(name, challenge, mistakes, seconds) {
    const score = calcularPuntaje(mistakes, seconds);
    const players = _getPlayers();
    if (!players[name]) players[name] = { challenges: {} };
    const prev = players[name].challenges[challenge];
    if (!prev || score > prev.score) {
      players[name].challenges[challenge] = { score, time: seconds };
    }
    _setPlayers(players);
    _upsertScoreboard(name, _getPlayers());
    return score;
  }

  function obtenerScoreboardOrdenado() {
    return [..._getRawScoreboard()].sort((a, b) => b.score - a.score);
  }

  function getNombreActual() {
    return sessionStorage.getItem(K.player) || localStorage.getItem(K.player) || '';
  }

  function setNombreActual(name) {
    sessionStorage.setItem(K.player, name);
    localStorage.setItem(K.player, name);
  }

  function estaCompletado(challenge) {
    const name = getNombreActual();
    const players = _getPlayers();
    return !!(players[name] && players[name].challenges && players[name].challenges[challenge]);
  }

  return {
    calcularPuntaje,
    cargarScoreboard,
    registrarIntento,
    obtenerScoreboardOrdenado,
    getNombreActual,
    setNombreActual,
    estaCompletado
  };
})();
