/* =====================================================================
   Solicitudes registradas · Condominio Santa María
   Lee el registro publicado por el Apps Script (doGet) y lo lista
   con filtros por estado, tipo y búsqueda libre.
   El teléfono del solicitante no se publica: no viene en la respuesta.
   ===================================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbykcvy74xJhTsu6CzJ1VhIk4USVLDzqamcmg20KEQ3Gvx4lYmoerXTMemcYpMBLScg1/exec';

  var lista       = document.getElementById('lista');
  var cargando    = document.getElementById('cargando');
  var errorCarga  = document.getElementById('errorCarga');
  var errorTexto  = document.getElementById('errorTexto');
  var vacio       = document.getElementById('vacio');
  var vacioTitulo = document.getElementById('vacioTitulo');
  var vacioTexto  = document.getElementById('vacioTexto');
  var sello       = document.getElementById('sello');
  var buscar      = document.getElementById('buscar');
  var fEstado     = document.getElementById('filtroEstado');
  var fTipo       = document.getElementById('filtroTipo');
  var btnAct      = document.getElementById('btnActualizar');
  var btnReint    = document.getElementById('btnReintentarCarga');

  var datos = [];
  var estadoSel = 'todas';
  var tipoSel = 'todos';
  var textoSel = '';

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function fechaCorta(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || '');
    return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear() + ' · ' +
           ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function esTratada(s) {
    // "pendiente" es el único estado que deja la solicitud sin tratar
    return s.estado !== 'pendiente';
  }

  /* ---------- carga ---------- */
  function cargar() {
    cargando.style.display = 'flex';
    errorCarga.style.display = 'none';
    vacio.style.display = 'none';
    lista.innerHTML = '';
    sello.textContent = 'Cargando…';

    fetch(ENDPOINT, { method: 'GET', redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || res.ok !== true) {
          throw new Error((res && res.error) || 'respuesta inesperada del registro');
        }
        if (!res.solicitudes) {
          throw new Error('la versión publicada del script todavía no entrega el listado: ' +
                          'vuelva a implementarlo (Implementar ▸ Gestionar implementaciones ▸ Versión: Nueva)');
        }

        datos = res.solicitudes;
        cargando.style.display = 'none';
        sello.textContent = 'Actualizado ' + fechaCorta(res.actualizado || new Date().toISOString());
        pintarKpis();
        pintar();
      })
      .catch(function (err) {
        cargando.style.display = 'none';
        sello.textContent = 'Sin conexión con el registro';
        errorTexto.textContent = String(err && err.message ? err.message : err);
        errorCarga.style.display = 'flex';
      });
  }

  /* ---------- KPIs ---------- */
  function pintarKpis() {
    var pendientes = 0, tratadas = 0, reclamos = 0, deptos = {};

    datos.forEach(function (s) {
      if (esTratada(s)) tratadas++; else pendientes++;
      if (s.tipo === 'Reclamo') reclamos++;
      if (s.apto) deptos[s.apto] = true;
    });

    document.getElementById('kTotal').textContent = datos.length;
    document.getElementById('kPendientes').textContent = pendientes;
    document.getElementById('kTratadas').textContent = tratadas;
    document.getElementById('kReclamos').textContent = reclamos;
    document.getElementById('kDeptos').textContent = Object.keys(deptos).length;
  }

  /* ---------- filtrado y pintado ---------- */
  function filtrar() {
    return datos.filter(function (s) {
      if (estadoSel === 'pendiente' && esTratada(s)) return false;
      if (estadoSel === 'tratada' && !esTratada(s)) return false;
      if (tipoSel !== 'todos' && s.tipo !== tipoSel) return false;

      if (textoSel) {
        var heno = (s.folio + ' ' + s.apto + ' ' + s.nombre + ' ' + s.detalle + ' ' + s.tipo).toLowerCase();
        if (heno.indexOf(textoSel) === -1) return false;
      }
      return true;
    });
  }

  function tarjeta(s) {
    var tratada = esTratada(s);
    var tipo = s.tipo === 'Reclamo' ? 'reclamo' : 'consulta';

    var html = '<article class="sol' + (tratada ? ' tratada' : '') + '">';

    html += '<div class="sol-top">' +
              '<span class="sol-apto">Depto. ' + esc(s.apto) + '</span>' +
              '<span class="sol-folio">' + esc(s.folio) + '</span>' +
              '<span class="badge ' + tipo + '">' + esc(s.tipo) + '</span>' +
              '<span class="badge ' + (tratada ? 'tratada' : 'pendiente') + '">' +
                 esc(tratada ? s.estado : 'pendiente') + '</span>' +
              '<span class="sol-fecha">' + esc(fechaCorta(s.fecha)) + '</span>' +
            '</div>';

    html += '<p class="sol-detalle">' + esc(s.detalle) + '</p>';

    if (s.nombre || s.asamblea) {
      html += '<div class="sol-pie">';
      if (s.nombre) {
        html += '<span class="quien">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>' +
                  esc(s.nombre) + '</span>';
      }
      if (s.asamblea) {
        html += '<span class="acta">Asamblea: ' + esc(s.asamblea) + '</span>';
      }
      html += '</div>';
    }

    return html + '</article>';
  }

  function pintar() {
    var res = filtrar();

    if (!datos.length) {
      lista.innerHTML = '';
      vacioTitulo.textContent = 'Todavía no hay solicitudes registradas';
      vacioTexto.textContent = 'Cuando un copropietario registre una consulta o reclamo, aparecerá en esta lista.';
      vacio.style.display = 'block';
      return;
    }

    vacio.style.display = 'none';

    if (!res.length) {
      lista.innerHTML = '<div class="sin-resultados">Ninguna solicitud coincide con los filtros aplicados.</div>';
      return;
    }

    lista.innerHTML = res.map(tarjeta).join('');
  }

  /* ---------- filtros: eventos ---------- */
  function grupo(cont, attr, fn) {
    cont.addEventListener('click', function (e) {
      var b = e.target.closest('.f');
      if (!b) return;
      cont.querySelectorAll('.f').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      fn(b.getAttribute(attr));
      pintar();
    });
  }

  grupo(fEstado, 'data-estado', function (v) { estadoSel = v; });
  grupo(fTipo, 'data-tipo', function (v) { tipoSel = v; });

  var reloj = null;
  buscar.addEventListener('input', function () {
    clearTimeout(reloj);
    reloj = setTimeout(function () {
      textoSel = buscar.value.trim().toLowerCase();
      pintar();
    }, 150);
  });

  btnAct.addEventListener('click', cargar);
  btnReint.addEventListener('click', cargar);

  /* ---------- init ---------- */
  cargar();
})();
