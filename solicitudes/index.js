/* =====================================================================
   Consultas y reclamos · Condominio Santa María
   Selector de departamento (10 pisos × 4 deptos), validación,
   confirmación "¿está seguro?" y registro en estado pendiente.
   ===================================================================== */
(function () {
  'use strict';

  var PISOS = 10;
  var POR_PISO = 4;
  var STORE_KEY = 'sm_solicitudes';       // lo leerá el listado de pendientes
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
    if (e.key !== 'Escape') return;
    if (mConfirmar.classList.contains('open')) cerrar(mConfirmar);
    else if (mExito.classList.contains('open')) cerrar(mExito);
  });
  mConfirmar.addEventListener('click', function (e) {
    if (e.target === mConfirmar) cerrar(mConfirmar);
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

  /* ---------- 6. guardar (queda pendiente) ---------- */
  function leerRegistros() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (err) { return []; }
  }

  function guardar(registro) {
    try {
      var arr = leerRegistros();
      arr.push(registro);
      localStorage.setItem(STORE_KEY, JSON.stringify(arr));
    } catch (err) { /* almacenamiento no disponible: la solicitud igual se confirma */ }
  }

  function nuevoFolio() {
    var ahora = new Date();
    var n = leerRegistros().length + 1;
    return 'SM-' + ahora.getFullYear() + '-' + String(n).padStart(4, '0');
  }

  /* ---------- 7. flujo de envío ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validar()) return;
    pintarResumen();
    abrir(mConfirmar);
  });

  btnNo.addEventListener('click', function () { cerrar(mConfirmar); });

  btnSi.addEventListener('click', function () {
    var folio = nuevoFolio();
    guardar({
      folio: folio,
      apto: aptoSel,
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      tipo: tipoSeleccionado(),
      mensaje: mensaje.value.trim(),
      estado: 'pendiente',
      fecha: new Date().toISOString()
    });

    cerrar(mConfirmar);
    folioOut.textContent = 'Folio ' + folio + ' · Estado: pendiente';
    abrir(mExito);

    form.reset();
    reiniciarSeleccion();
  });

  btnCerrar.addEventListener('click', function () {
    cerrar(mExito);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 8. reset ---------- */
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
