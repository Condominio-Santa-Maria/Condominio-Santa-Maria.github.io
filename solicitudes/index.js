/* =====================================================================
   Consultas y reclamos · Condominio Santa María
   Selector de departamento (10 pisos × 4 deptos), validación,
   confirmación "¿está seguro?" y envío a Google Sheets.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURACIÓN · pegue aquí la URL del Apps Script publicado,
     la que termina en /exec (instrucciones en apps-script.gs).

     Hoja de destino: docs.google.com/spreadsheets/d/13C0QQRZt0zIO6QtWYQvtbPQBPci7Jl3UW8MDv-aAWog
     Mientras esté vacío, el formulario avisa que no está conectado.
     ------------------------------------------------------------------ */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbykcvy74xJhTsu6CzJ1VhIk4USVLDzqamcmg20KEQ3Gvx4lYmoerXTMemcYpMBLScg1/exec';

  var PISOS = 10;
  var POR_PISO = 4;
  var MIN_MENSAJE = 15;
  var MIN_TELEFONO = 7;

  var form      = document.getElementById('formSolicitud');
  var picker    = document.getElementById('aptPicker');
  var aptOut    = document.getElementById('aptOut');
  var nombre    = document.getElementById('nombre');
  var telefono  = document.getElementById('telefono');
  var mensaje   = document.getElementById('mensaje');
  var contador  = document.getElementById('contador');
  var chips     = document.getElementById('tipoChips');

  var mConfirmar = document.getElementById('modalConfirmar');
  var mExito     = document.getElementById('modalExito');
  var resumen    = document.getElementById('resumenConfirmar');
  var folioOut   = document.getElementById('folioExito');
  var btnSi      = document.getElementById('btnSi');
  var btnNo      = document.getElementById('btnNo');
  var btnCerrar  = document.getElementById('btnCerrarExito');

  var mError     = document.getElementById('modalError');
  var errDetalle = document.getElementById('errorDetalle');
  var btnReintentar = document.getElementById('btnReintentar');
  var btnCerrarError = document.getElementById('btnCerrarError');
  var avisoLocal = document.getElementById('avisoLocal');

  var aptoSel = null;
  var ultimoFoco = null;

  /* ---------- 1. selector de departamento: 1001..1004 arriba, 101..104 abajo ---------- */
  function construirPicker() {
    var html = '';
    for (var piso = PISOS; piso >= 1; piso--) {
      html += '<div class="apt-floor"><span class="fl">P' + piso + '</span>';
      for (var i = 1; i <= POR_PISO; i++) {
        var nro = String(piso) + '0' + i;   // 101..104 ... 1001..1004
        html += '<button type="button" class="apt" role="radio" aria-checked="false" ' +
                'data-apto="' + nro + '">' + nro + '</button>';
      }
      html += '</div>';
    }
    picker.innerHTML = html;
  }

  picker.addEventListener('click', function (e) {
    var btn = e.target.closest('.apt');
    if (!btn) return;
    picker.querySelectorAll('.apt').forEach(function (b) {
      b.classList.remove('sel');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('sel');
    btn.setAttribute('aria-checked', 'true');
    aptoSel = btn.dataset.apto;
    aptOut.textContent = aptoSel;
    limpiarError(picker, 'errApto');
  });

  /* ---------- 2. chips de tipo ---------- */
  chips.addEventListener('change', function () {
    chips.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('on', c.querySelector('input').checked);
    });
  });

  function tipoSeleccionado() {
    var r = chips.querySelector('input[name="tipo"]:checked');
    return r ? r.value : 'Consulta';
  }

  /* ---------- 3. contador de caracteres ---------- */
  function actualizarContador() {
    var n = mensaje.value.length;
    contador.textContent = n + ' / 1200';
    contador.classList.toggle('warn', n > 1080);
  }
  mensaje.addEventListener('input', function () {
    actualizarContador();
    if (mensaje.value.trim().length >= MIN_MENSAJE) limpiarError(mensaje, 'errMensaje');
  });

  /* ---------- 4. validación ---------- */
  function marcarError(el, idMsg) {
    el.classList.add('err');
    document.getElementById(idMsg).classList.add('show');
  }
  function limpiarError(el, idMsg) {
    el.classList.remove('err');
    document.getElementById(idMsg).classList.remove('show');
  }
  function soloDigitos(v) { return (v || '').replace(/\D/g, ''); }

  function validar() {
    var ok = true;
    var primero = null;

    if (!aptoSel) { marcarError(picker, 'errApto'); ok = false; primero = primero || picker; }
    else limpiarError(picker, 'errApto');

    if (nombre.value.trim().length < 3) { marcarError(nombre, 'errNombre'); ok = false; primero = primero || nombre; }
    else limpiarError(nombre, 'errNombre');

    if (soloDigitos(telefono.value).length < MIN_TELEFONO) { marcarError(telefono, 'errTelefono'); ok = false; primero = primero || telefono; }
    else limpiarError(telefono, 'errTelefono');

    if (mensaje.value.trim().length < MIN_MENSAJE) { marcarError(mensaje, 'errMensaje'); ok = false; primero = primero || mensaje; }
    else limpiarError(mensaje, 'errMensaje');

    if (primero) {
      primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (primero.focus && primero !== picker) primero.focus({ preventScroll: true });
    }
    return ok;
  }

  nombre.addEventListener('input', function () {
    if (nombre.value.trim().length >= 3) limpiarError(nombre, 'errNombre');
  });
  telefono.addEventListener('input', function () {
    if (soloDigitos(telefono.value).length >= MIN_TELEFONO) limpiarError(telefono, 'errTelefono');
  });

  /* ---------- 5. modales ---------- */
  function abrir(modal) {
    ultimoFoco = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    var b = modal.querySelector('.btn.primary');
    if (b) b.focus();
  }
  function cerrar(modal) {
    modal.classList.remove('open');
    if (!document.querySelector('.modal-bg.open')) document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || enviando) return;
    if (mConfirmar.classList.contains('open')) cerrar(mConfirmar);
    else if (mExito.classList.contains('open')) cerrar(mExito);
    else if (mError.classList.contains('open')) cerrar(mError);
  });
  mConfirmar.addEventListener('click', function (e) {
    if (e.target === mConfirmar && !enviando) cerrar(mConfirmar);
  });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pintarResumen() {
    resumen.innerHTML =
      '<div><span>Departamento</span><b>' + esc(aptoSel) + '</b></div>' +
      '<div><span>Nombre</span><b>' + esc(nombre.value.trim()) + '</b></div>' +
      '<div><span>Teléfono</span><b>' + esc(telefono.value.trim()) + '</b></div>' +
      '<div><span>Tipo</span><b>' + esc(tipoSeleccionado()) + '</b></div>' +
      '<div><span>Detalle</span><b class="msg">' + esc(mensaje.value.trim()) + '</b></div>';
  }

  /* ---------- 6. envío a Google Sheets (Apps Script) ---------- */
  /* Único destino de la solicitud: la hoja de cálculo. No se guarda
     ninguna copia en el navegador.
     Se envía como text/plain para que sea una petición "simple" y el
     navegador no pida preflight CORS, que Apps Script no responde.      */
  function enviarAlSheet(datos) {
    if (!ENDPOINT) {
      return Promise.reject(new Error('el formulario todavía no está conectado a la hoja de solicitudes'));
    }

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos),
      redirect: 'follow'
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) return { folio: res.folio };
        throw new Error((res && res.error) || 'respuesta inesperada del servidor');
      })
      .catch(function (err) {
        // Si el navegador bloqueó la lectura de la respuesta, reintentamos
        // sin poder leerla: el dato llega a la hoja, pero no hay folio de vuelta.
        return fetch(ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(datos)
        }).then(function () {
          return {};
        }).catch(function () {
          throw err;
        });
      });
  }

  /* ---------- 7. flujo de envío ---------- */
  var enviando = false;
  var pendiente = null;   // datos listos para (re)enviar

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validar()) return;
    pintarResumen();
    abrir(mConfirmar);
  });

  btnNo.addEventListener('click', function () { if (!enviando) cerrar(mConfirmar); });

  btnSi.addEventListener('click', function () {
    pendiente = {
      apto: aptoSel,
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      tipo: tipoSeleccionado(),
      mensaje: mensaje.value.trim(),
      fecha: new Date().toISOString()
    };
    procesar();
  });

  btnReintentar.addEventListener('click', function () {
    cerrar(mError);
    if (pendiente) { abrir(mConfirmar); procesar(); }
  });

  function procesar() {
    if (enviando || !pendiente) return;
    enviando = true;
    btnSi.disabled = true;
    btnNo.disabled = true;
    btnSi.innerHTML = '<span class="spin"></span> Enviando…';

    enviarAlSheet(pendiente)
      .then(function (res) {
        restaurarBoton();
        cerrar(mConfirmar);

        if (res.folio) {
          folioOut.textContent = 'Folio ' + res.folio + ' · Estado: pendiente';
          avisoLocal.style.display = 'none';
        } else {
          // Envío realizado pero sin poder leer la respuesta del servidor.
          folioOut.textContent = 'Estado: pendiente';
          avisoLocal.textContent = 'Su solicitud fue enviada. El folio queda asignado en el registro de solicitudes.';
          avisoLocal.style.display = 'block';
        }
        abrir(mExito);

        pendiente = null;
        form.reset();
        reiniciarSeleccion();
      })
      .catch(function (err) {
        restaurarBoton();
        cerrar(mConfirmar);
        errDetalle.textContent = String(err && err.message ? err.message : err);
        abrir(mError);
      });
  }

  function restaurarBoton() {
    enviando = false;
    btnSi.disabled = false;
    btnNo.disabled = false;
    btnSi.textContent = 'Sí, enviar';
  }

  btnCerrar.addEventListener('click', function () {
    cerrar(mExito);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnCerrarError.addEventListener('click', function () { cerrar(mError); });

  /* ---------- 9. reset ---------- */
  function reiniciarSeleccion() {
    aptoSel = null;
    aptOut.textContent = '—';
    picker.querySelectorAll('.apt').forEach(function (b) {
      b.classList.remove('sel');
      b.setAttribute('aria-checked', 'false');
    });
    ['errApto', 'errNombre', 'errTelefono', 'errMensaje'].forEach(function (id) {
      document.getElementById(id).classList.remove('show');
    });
    [picker, nombre, telefono, mensaje].forEach(function (el) { el.classList.remove('err'); });
    chips.querySelectorAll('.chip').forEach(function (c, i) {
      c.classList.toggle('on', i === 0);
    });
    actualizarContador();
  }

  form.addEventListener('reset', function () {
    // el reset nativo limpia los campos después del evento
    setTimeout(reiniciarSeleccion, 0);
  });

  /* ---------- init ---------- */
  construirPicker();
  actualizarContador();
})();
