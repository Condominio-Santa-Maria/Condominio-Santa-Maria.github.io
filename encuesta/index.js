/* =====================================================================
   Encuesta · Condominio Santa María
   1. El propietario elige su depto y escribe su teléfono.
   2. El Apps Script compara el teléfono con la hoja "Propietarios"
      (los teléfonos nunca se publican en la web).
   3. Si coincide, se habilitan las preguntas y el envío del voto,
      que queda en la hoja "Encuesta" (un voto por depto).
   ===================================================================== */
(function () {
  'use strict';

  /* Mismo Apps Script que Solicitudes (ver solicitudes/apps-script.gs). */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbykcvy74xJhTsu6CzJ1VhIk4USVLDzqamcmg20KEQ3Gvx4lYmoerXTMemcYpMBLScg1/exec';

  /* Ponga true cuando se abra la votación (y también ENCUESTA_ABIERTA
     en el Apps Script). Mientras sea false se puede verificar el
     teléfono, pero no enviar el voto. */
  var VOTACION_ABIERTA = false;

  var PREGUNTAS = ['pj', 'pintura', 'cuota'];
  var MSG_REGULARIZAR = 'El teléfono no coincide con el registrado para este departamento. ' +
    'Comunicate con la administración para regularizar tu número.';

  var form       = document.getElementById('encuesta');
  var sel        = document.getElementById('depto');
  var out        = document.getElementById('propietario');
  var tel        = document.getElementById('telefono');
  var btnVerif   = document.getElementById('btnVerificar');
  var msgVerif   = document.getElementById('msgVerif');
  var pPreguntas = document.getElementById('pPreguntas');
  var pFirma     = document.getElementById('pFirma');
  var declaro    = document.getElementById('declaro');
  var btnEnviar  = document.getElementById('btnEnviar');
  var msgEnvio   = document.getElementById('msgEnvio');

  var verificado = null;   // {apto, telefono} cuando el teléfono coincide
  var enviando = false;

  if (VOTACION_ABIERTA) document.getElementById('banner').hidden = true;

  /* ---------- departamentos y opciones ---------- */
  PROPIETARIOS.forEach(function (x) {
    var o = document.createElement('option');
    o.value = x.d; o.textContent = x.d;
    sel.appendChild(o);
  });
  document.querySelectorAll('.opts').forEach(function (box) {
    var q = box.dataset.q;
    box.innerHTML = ['Apruebo', 'No apruebo', 'Me abstengo'].map(function (t, i) {
      return '<label><input type="radio" name="' + q + '" value="' + ['si', 'no', 'abs'][i] + '"> ' + t + '</label>';
    }).join('');
  });

  /* ---------- estado ---------- */
  function setMsg(el, txt, tipo) {
    el.textContent = txt;
    el.className = el.className.replace(/\b(ok|err)\b/g, '').trim() + (tipo ? ' ' + tipo : '');
  }

  function bloquear() {
    verificado = null;
    pPreguntas.classList.add('locked');
    pFirma.classList.add('locked');
    actualizarEnvio();
  }

  function actualizarEnvio() {
    if (!verificado) {
      btnEnviar.disabled = true;
      setMsg(msgEnvio, 'Primero verificá tu teléfono.');
      return;
    }
    if (!VOTACION_ABIERTA) {
      btnEnviar.disabled = true;
      setMsg(msgEnvio, 'Teléfono verificado. El envío se habilitará cuando se abra la votación.');
      return;
    }
    var completas = PREGUNTAS.every(function (q) { return form.querySelector('input[name="' + q + '"]:checked'); });
    btnEnviar.disabled = enviando || !completas || !declaro.checked;
    if (!completas) setMsg(msgEnvio, 'Respondé las tres preguntas.');
    else if (!declaro.checked) setMsg(msgEnvio, 'Marcá la declaración para firmar.');
    else setMsg(msgEnvio, '');
  }

  sel.addEventListener('change', function () {
    var x = PROPIETARIOS.find(function (p) { return String(p.d) === sel.value; });
    out.textContent = x ? x.nombre : '—';
    out.classList.toggle('set', !!x);
    setMsg(msgVerif, '');
    bloquear();
  });
  tel.addEventListener('input', function () {
    if (verificado) { setMsg(msgVerif, ''); bloquear(); }
  });
  form.addEventListener('change', actualizarEnvio);

  /* ---------- llamada al Apps Script ----------
     JSONP: se carga la URL como <script>, así el navegador no aplica
     CORS a la respuesta (el POST con fetch fallaba al leerla). */
  var ESPERA_MAX = 25000;   // ms; Apps Script puede tardar varios segundos en arrancar
  var nLlamada = 0;

  function llamar(datos) {
    return new Promise(function (resolve, reject) {
      var cb = '__encuesta' + Date.now() + '_' + (nLlamada++);
      var params = Object.keys(datos).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(datos[k]);
      });
      params.push('callback=' + cb);
      var s = document.createElement('script');
      var timer = setTimeout(function () { fin(); var e = new Error('timeout'); e.name = 'AbortError'; reject(e); }, ESPERA_MAX);
      function fin() {
        clearTimeout(timer);
        delete window[cb];
        if (s.parentNode) s.parentNode.removeChild(s);
      }
      window[cb] = function (res) { fin(); resolve(res); };
      s.onerror = function () { fin(); reject(new Error('red')); };
      s.src = ENDPOINT + '?' + params.join('&');
      document.head.appendChild(s);
    });
  }

  function errorDeRed(err) {
    return err && err.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder. Intentá de nuevo en unos segundos.'
      : 'No se pudo conectar. Revisá tu conexión e intentá de nuevo.';
  }

  /* ---------- verificar teléfono ---------- */
  btnVerif.addEventListener('click', function () {
    var apto = sel.value;
    var numero = tel.value.replace(/\D/g, '');
    if (!apto) { setMsg(msgVerif, 'Elegí tu departamento.', 'err'); return; }
    if (numero.length < 7) { setMsg(msgVerif, 'Escribí tu número de teléfono completo.', 'err'); return; }

    btnVerif.disabled = true;
    setMsg(msgVerif, 'Verificando… puede tardar unos segundos.');
    llamar({ accion: 'verificar', apto: apto, telefono: numero })
      .then(function (res) {
        if (res && res.ok) {
          verificado = { apto: apto, telefono: numero };
          pPreguntas.classList.remove('locked');
          pFirma.classList.remove('locked');
          setMsg(msgVerif, res.yaVoto
            ? '✓ Verificado. Este departamento ya votó; si enviás de nuevo se reemplaza el voto anterior.'
            : '✓ Teléfono verificado.', 'ok');
          actualizarEnvio();
        } else if (res && res.error === 'telefono') {
          bloquear();
          setMsg(msgVerif, MSG_REGULARIZAR, 'err');
        } else {
          bloquear();
          setMsg(msgVerif, 'No se pudo verificar: ' + ((res && res.error) || 'respuesta inesperada') + '.', 'err');
        }
      })
      .catch(function (err) {
        bloquear();
        setMsg(msgVerif, errorDeRed(err), 'err');
      })
      .then(function () { btnVerif.disabled = false; });
  });

  /* ---------- enviar voto ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!verificado || !VOTACION_ABIERTA || btnEnviar.disabled) return;

    var votos = {};
    PREGUNTAS.forEach(function (q) { votos[q] = form.querySelector('input[name="' + q + '"]:checked').value; });

    enviando = true;
    actualizarEnvio();
    setMsg(msgEnvio, 'Enviando…');
    llamar({ accion: 'votar', apto: verificado.apto, telefono: verificado.telefono, pj: votos.pj, pintura: votos.pintura, cuota: votos.cuota })
      .then(function (res) {
        if (res && res.ok) {
          setMsg(msgEnvio, '✓ Voto registrado. ¡Gracias por participar!', 'ok');
          btnEnviar.disabled = true;
          pPreguntas.classList.add('locked');
          pFirma.classList.add('locked');
          return;
        }
        enviando = false;
        if (res && res.error === 'telefono') {
          bloquear();
          setMsg(msgVerif, MSG_REGULARIZAR, 'err');
          setMsg(msgEnvio, 'No se registró el voto.', 'err');
        } else {
          actualizarEnvio();
          setMsg(msgEnvio, 'No se registró el voto: ' + ((res && res.error) || 'respuesta inesperada') + '.', 'err');
        }
      })
      .catch(function (err) {
        enviando = false;
        actualizarEnvio();
        setMsg(msgEnvio, errorDeRed(err), 'err');
      });
  });
})();
