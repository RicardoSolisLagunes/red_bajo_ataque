/* Anti-phishing challenge — classify each email as Phishing or Legítimo */
const antiPhishing = (() => {
  // Embedded fallback — mirrors memory/emails.txt exactly (used when fetch fails on file://)
  const EMAILS_FALLBACK = [
    {
      id: 'phish-banco',
      remitente: 'Soporte <seguridad@banco-segur0.com>',
      asunto: '¡Acción urgente! Tu cuenta será suspendida',
      cuerpo: 'Estimado cliente, detectamos actividad inusual. Verifica tu contraseña aquí: http://banco-seguro.cuenta-verifica.net en las próximas 24 horas o tu cuenta será bloqueada.',
      esPhishing: true,
      indicadores: ['dominio falso (banco-segur0.com)', 'urgencia', 'URL engañosa', 'saludo genérico', 'pide contraseña'],
      solucion: 'Es PHISHING: el dominio del remitente no es el del banco (typosquatting con un cero), el enlace lleva a otro dominio, presiona con urgencia y pide tu contraseña.'
    },
    {
      id: 'phish-premio',
      remitente: 'Promociones <ganador@sorteo-nacional.info>',
      asunto: '¡Felicidades! Has ganado un iPhone 15',
      cuerpo: 'Eres el ganador del sorteo del mes. Para reclamar tu premio ingresa tus datos y un pago de envío de $9.99 en este enlace: http://reclama-tu-premio.info',
      esPhishing: true,
      indicadores: ['premio inesperado', 'demasiado bueno para ser verdad', 'pide datos y pago', 'dominio desconocido'],
      solucion: 'Es PHISHING: nunca participaste en ese sorteo, ofrece un premio irreal y pide un pago anticipado y tus datos personales en un dominio desconocido.'
    },
    {
      id: 'phish-paqueteria',
      remitente: 'Paquetería Express <aviso@entregas-mx.online>',
      asunto: 'Tu paquete está retenido en aduana',
      cuerpo: 'No pudimos entregar tu envío. Paga la tarifa de aduana de $3.50 en las próximas 12 horas para liberarlo: http://pago-aduana-entregas.online/track',
      esPhishing: true,
      indicadores: ['dominio sospechoso (.online)', 'urgencia', 'pago pequeño para no levantar sospechas', 'enlace de pago externo'],
      solucion: 'Es PHISHING: usa un dominio falso, presiona con un plazo corto y pide un pago en un enlace externo; las paqueterías reales no cobran aduana por correo así.'
    },
    {
      id: 'phish-office',
      remitente: 'Microsoft 365 <no-reply@office365-soporte.com>',
      asunto: 'Tu buzón será desactivado',
      cuerpo: 'Hemos detectado que tu almacenamiento está lleno. Vuelve a validar tu correo y contraseña aquí para no perder tus mensajes: http://office365-revalidar.com',
      esPhishing: true,
      indicadores: ['dominio no oficial', 'amenaza de perder datos', 'pide credenciales', 'URL de revalidación falsa'],
      solucion: 'Es PHISHING: el dominio no pertenece a Microsoft, amenaza con desactivar el buzón y pide volver a ingresar usuario y contraseña en un sitio falso.'
    },
    {
      id: 'phish-ceo',
      remitente: 'Director General <ceo.miempresa@gmail.com>',
      asunto: 'Necesito que hagas una transferencia ahora',
      cuerpo: 'Estoy en una reunión y no puedo hablar. Necesito que transfieras $4,500 a este proveedor de inmediato y me confirmes. Es confidencial, no comentes con nadie.',
      esPhishing: true,
      indicadores: ['remitente Gmail en vez del dominio corporativo', 'urgencia y confidencialidad', 'solicitud de dinero', 'evita verificación'],
      solucion: 'Es PHISHING (fraude del CEO): el jefe escribe desde un Gmail, no del dominio de la empresa, exige una transferencia urgente y pide secreto para evitar que verifiques.'
    },
    {
      id: 'phish-netflix',
      remitente: 'Netflix <facturacion@netflix-pagos.com>',
      asunto: 'Problema con tu método de pago',
      cuerpo: 'No pudimos procesar tu último pago. Actualiza tu tarjeta en las próximas horas para no perder tu suscripción: http://netflix-pagos.com/actualizar',
      esPhishing: true,
      indicadores: ['dominio falso (netflix-pagos.com)', 'urgencia', 'pide datos de tarjeta', 'enlace externo'],
      solucion: 'Es PHISHING: el dominio no es netflix.com, presiona con perder la cuenta y pide actualizar la tarjeta en un sitio que no es el oficial.'
    },
    {
      id: 'phish-nomina',
      remitente: 'Recursos Humanos <rh-portal@miempresa-rh.net>',
      asunto: 'Actualiza tus datos de nómina hoy',
      cuerpo: 'Para recibir tu próximo pago debes confirmar tu cuenta bancaria iniciando sesión en el nuevo portal: http://miempresa-rh.net/login con tu usuario y contraseña.',
      esPhishing: true,
      indicadores: ['dominio parecido pero distinto al corporativo', 'urgencia ligada al sueldo', 'pide credenciales', 'portal externo'],
      solucion: 'Es PHISHING: el dominio imita al de la empresa pero no es el real, usa el incentivo del pago para que ingreses usuario y contraseña en un portal falso.'
    },
    {
      id: 'legit-rrhh',
      remitente: 'Recursos Humanos <rrhh@miempresa.com>',
      asunto: 'Recordatorio: capacitación de redes el viernes',
      cuerpo: 'Hola Ricardo, te recordamos la sesión del viernes a las 10:00 en la sala 3. Cualquier duda, responde a este correo.',
      esPhishing: false,
      indicadores: ['dominio corporativo correcto', 'te nombra', 'sin enlaces ni urgencia', 'no pide datos'],
      solucion: 'Es LEGÍTIMO: viene del dominio interno correcto, se dirige a ti por tu nombre, no pide credenciales ni incluye enlaces sospechosos.'
    },
    {
      id: 'legit-it',
      remitente: 'Soporte TI <it@miempresa.com>',
      asunto: 'Mantenimiento programado del servidor el sábado',
      cuerpo: 'Estimado equipo, el sábado de 22:00 a 23:00 el correo estará en mantenimiento. No necesitas hacer nada. Avisamos para tu planeación.',
      esPhishing: false,
      indicadores: ['dominio interno correcto', 'informativo', 'no pide acciones ni datos', 'sin enlaces'],
      solucion: 'Es LEGÍTIMO: es un aviso informativo del área de TI desde el dominio correcto, no solicita credenciales ni que hagas clic en nada.'
    },
    {
      id: 'legit-ticket',
      remitente: 'Mesa de ayuda <soporte@miempresa.com>',
      asunto: 'Tu ticket #4821 ha sido resuelto',
      cuerpo: 'Hola Ricardo, el problema con tu impresora fue resuelto. Si el inconveniente continúa, responde a este correo para reabrir el ticket.',
      esPhishing: false,
      indicadores: ['dominio interno correcto', 'responde a una solicitud tuya', 'te nombra', 'sin enlaces ni urgencia'],
      solucion: 'Es LEGÍTIMO: da seguimiento a un ticket que tú abriste, viene del dominio correcto y no pide información sensible.'
    },
    {
      id: 'legit-banco',
      remitente: 'Mi Banco <avisos@mibanco.com>',
      asunto: 'Tu estado de cuenta de junio está disponible',
      cuerpo: 'Hola Ricardo, ya puedes consultar tu estado de cuenta ingresando directamente desde la app o escribiendo mibanco.com en tu navegador. Nunca te pediremos tu contraseña por correo.',
      esPhishing: false,
      indicadores: ['dominio oficial', 'no incluye enlace de inicio de sesión', 'recuerda que no pide contraseña', 'tono informativo'],
      solucion: 'Es LEGÍTIMO: usa el dominio oficial, te invita a entrar por la app o escribiendo la dirección tú mismo, y aclara que nunca pedirá tu contraseña.'
    },
    {
      id: 'legit-compa',
      remitente: 'Ana López <ana.lopez@miempresa.com>',
      asunto: 'Notas de la clase de topologías',
      cuerpo: 'Hola Ricardo, te comparto mis apuntes de la sesión de topologías en el archivo adjunto que acordamos en clase. Nos vemos mañana.',
      esPhishing: false,
      indicadores: ['compañera conocida del dominio interno', 'adjunto esperado y acordado', 'sin urgencia', 'no pide datos'],
      solucion: 'Es LEGÍTIMO: proviene de una compañera del dominio interno, el adjunto fue acordado previamente y no hay solicitudes sospechosas.'
    },
    {
      id: 'legit-newsletter',
      remitente: 'Boletín de Redes <boletin@asociacionredes.org>',
      asunto: 'Novedades de mayo y próximos webinars',
      cuerpo: 'Gracias por suscribirte. En esta edición: introducción a VLANs y un webinar gratuito. Puedes darte de baja al final del correo cuando quieras.',
      esPhishing: false,
      indicadores: ['suscripción real', 'contenido informativo', 'ofrece opción de baja', 'no pide credenciales'],
      solucion: 'Es LEGÍTIMO: es un boletín al que te suscribiste, comparte contenido informativo y ofrece darte de baja, sin pedir datos sensibles.'
    },
    {
      id: 'legit-factura',
      remitente: 'Facturación <facturas@proveedor-conocido.com>',
      asunto: 'Factura del pedido #1029 adjunta',
      cuerpo: 'Estimado Ricardo, adjuntamos la factura correspondiente a tu pedido reciente, tal como lo solicitaste. Para dudas, contáctanos a este mismo correo.',
      esPhishing: false,
      indicadores: ['proveedor con el que hay relación', 'factura esperada por un pedido real', 'te nombra', 'sin enlaces de pago externos'],
      solucion: 'Es LEGÍTIMO: corresponde a un pedido que realmente hiciste con un proveedor conocido, no incluye enlaces de pago externos ni pide credenciales.'
    }
  ];

  let _sec = null;
  let _banco = [];
  let _seleccion = [];
  // Per-email state: { selected: 'phishing'|'legit'|null, penalized: bool }
  let _estado = {};
  let _mistakes = 0;
  let _done = false;

  function _fmt(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }

  async function _cargarCorreos() {
    try {
      const r = await fetch('memory/emails.txt');
      if (!r.ok) throw new Error();
      return await r.json();
    } catch {
      return EMAILS_FALLBACK;
    }
  }

  function _seleccionar(banco, total = 5, minLeg = 2) {
    const legitimos = banco.filter(c => !c.esPhishing);
    const phishing  = banco.filter(c =>  c.esPhishing);
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    const elegLeg  = shuffle(legitimos).slice(0, minLeg);
    const resto    = shuffle([...phishing, ...legitimos.filter(c => !elegLeg.includes(c))]);
    return shuffle([...elegLeg, ...resto.slice(0, total - minLeg)]);
  }

  function _renderShell() {
    return `
      <div class="ch-header">
        <h2><span class="ch-icon">🎣</span> Anti-phishing</h2>
        <div class="ch-stats">
          <span>⏱ <span class="timer-disp">00:00</span></span>
          <span>✗ Errores: <span class="err-cnt">0</span></span>
        </div>
      </div>
      <p class="ch-desc">Revisa cada correo y clasifícalo. Cuando hayas clasificado los 5, pulsa <strong>Finalizar</strong>.</p>
      <div id="ap-bandeja" class="bandeja"></div>
      <div class="ch-actions">
        <button id="ap-finalizar" class="btn-primary" disabled>Finalizar</button>
      </div>
      <div id="ap-result" class="result-block hidden"></div>
    `;
  }

  function _renderBandeja() {
    const bandeja = _sec.querySelector('#ap-bandeja');
    bandeja.innerHTML = _seleccion.map((c, i) => `
      <div class="email-card" id="ec-${c.id}" data-email-id="${c.id}">
        <div class="email-hdr">
          <span class="email-num">${i + 1}</span>
          <div class="email-meta">
            <div class="email-from">
              <img src="src/correo.svg" class="icon-sm" alt="" onerror="this.style.display='none'">
              <span>${c.remitente}</span>
            </div>
            <div class="email-subject">${c.asunto}</div>
          </div>
        </div>
        <div class="email-body">${c.cuerpo}</div>
        <div class="email-btns">
          <button class="btn-phishing" data-eid="${c.id}">
            <img src="src/anzuelo.svg" class="icon-xs" alt="" onerror="this.style.display='none'">
            🎣 Phishing
          </button>
          <button class="btn-legit" data-eid="${c.id}">
            <img src="src/correo_seguro.svg" class="icon-xs" alt="" onerror="this.style.display='none'">
            ✓ Legítimo
          </button>
        </div>
        <div class="email-feedback hidden" id="ef-${c.id}"></div>
      </div>
    `).join('');

    bandeja.querySelectorAll('.btn-phishing').forEach(b =>
      b.addEventListener('click', () => _clasificar(b.dataset.eid, true)));
    bandeja.querySelectorAll('.btn-legit').forEach(b =>
      b.addEventListener('click', () => _clasificar(b.dataset.eid, false)));
  }

  function _clasificar(emailId, markAsPhishing) {
    if (_done) return;
    const correo = _seleccion.find(c => c.id === emailId);
    const st = _estado[emailId];
    const correct = markAsPhishing === correo.esPhishing;

    // Count mistake only on first wrong selection for this email
    if (!correct && !st.penalized) {
      _mistakes++;
      st.penalized = true;
      _sec.querySelector('.err-cnt').textContent = _mistakes;
    }

    st.selected = markAsPhishing ? 'phishing' : 'legit';

    const card = _sec.querySelector(`#ec-${emailId}`);
    card.classList.remove('ec-correct', 'ec-wrong');
    card.classList.add(correct ? 'ec-correct' : 'ec-wrong');

    card.querySelectorAll('.btn-phishing, .btn-legit').forEach(b => b.classList.remove('btn-sel'));
    card.querySelector(markAsPhishing ? '.btn-phishing' : '.btn-legit').classList.add('btn-sel');

    const fb = card.querySelector(`#ef-${emailId}`);
    fb.classList.remove('hidden');
    fb.innerHTML = correct
      ? `<span class="fb-ok">✓ Respuesta correcta</span>`
      : `<span class="fb-err">✗ Incorrecto — intenta con la otra opción</span>`;

    const allDone = _seleccion.every(c => _estado[c.id].selected !== null);
    _sec.querySelector('#ap-finalizar').disabled = !allDone;
  }

  function _finalizar() {
    _done = true;
    timer.stop();
    const secs = timer.getSeconds();
    const nombre = memory.getNombreActual();
    const score = memory.registrarIntento(nombre, 'anti_phishing', _mistakes, secs);

    const result = _sec.querySelector('#ap-result');
    result.classList.remove('hidden');

    const correctas = _seleccion.filter(c => {
      const resp = _estado[c.id].selected;
      return (resp === 'phishing') === c.esPhishing;
    }).length;

    result.innerHTML = `
      <div class="result-summary">
        <h3>🏁 Resultado</h3>
        <div class="result-stats">
          <span class="stat-box">Puntaje<br><strong>${score}</strong></span>
          <span class="stat-box">Correctas<br><strong>${correctas}/5</strong></span>
          <span class="stat-box">Errores<br><strong>${_mistakes}</strong></span>
          <span class="stat-box">Tiempo<br><strong>${secs}s</strong></span>
        </div>
      </div>
      <h4>Soluciones comentadas</h4>
      ${_seleccion.map(c => {
        const resp = _estado[c.id].selected;
        const acierto = (resp === 'phishing') === c.esPhishing;
        return `
          <div class="sol-item ${acierto ? 'sol-ok' : 'sol-err'}">
            <div class="sol-hdr">
              <img src="${c.esPhishing ? 'src/correo_phishing.svg' : 'src/correo_seguro.svg'}"
                   class="icon-sm" alt="" onerror="this.style.display='none'">
              <span>${acierto ? '✅' : '❌'}</span>
              <strong>${c.asunto}</strong>
              <span class="sol-label ${c.esPhishing ? 'label-phish' : 'label-legit'}">
                ${c.esPhishing ? '🎣 Phishing' : '✓ Legítimo'}
              </span>
            </div>
            <p class="sol-texto">${c.solucion}</p>
            <p class="sol-ind">
              <img src="src/alerta.svg" class="icon-xs" alt="" onerror="this.style.display='none'">
              <strong>Indicadores:</strong> ${c.indicadores.join(' · ')}
            </p>
          </div>
        `;
      }).join('')}
      <div class="result-actions">
        <button class="btn-primary" id="ap-retry">Reintentar</button>
        <button class="btn-secondary" id="ap-inicio">Volver al Inicio</button>
      </div>
    `;

    result.querySelector('#ap-retry').addEventListener('click', reintentar);
    result.querySelector('#ap-inicio').addEventListener('click', () => app.goTo('#sec-inicio'));

    app.refrescarChecks();
    result.scrollIntoView({ behavior: 'smooth' });
  }

  async function init(sec) {
    _sec = sec;
    _mistakes = 0;
    _done = false;
    _estado = {};
    _seleccion = [];

    _sec.innerHTML = _renderShell();

    _banco = await _cargarCorreos();
    _seleccion = _seleccionar(_banco);
    _seleccion.forEach(c => { _estado[c.id] = { selected: null, penalized: false }; });

    _renderBandeja();

    _sec.querySelector('#ap-finalizar').addEventListener('click', _finalizar);

    timer.start(s => {
      const d = _sec.querySelector('.timer-disp');
      if (d) d.textContent = _fmt(s);
    });
  }

  function reset() {
    timer.stop();
    _mistakes = 0;
    _done = false;
    _estado = {};
    _seleccion = [];
  }

  function reintentar() { reset(); init(_sec); }

  return { init, reset, reintentar };
})();
