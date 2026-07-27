/* =====================================================================
   Condominio Santa María · Consultas y reclamos
   Receptor de solicitudes → Google Sheets

   Hoja de destino:
   https://docs.google.com/spreadsheets/d/13C0QQRZt0zIO6QtWYQvtbPQBPci7Jl3UW8MDv-aAWog/edit

   CÓMO INSTALARLO (una sola vez):
   1. Abra la hoja de cálculo de arriba.
   2. Menú  Extensiones ▸ Apps Script.
   3. Borre el contenido de Code.gs y pegue TODO este archivo. Guarde.
   4. Botón  Implementar ▸ Nueva implementación ▸ tipo "Aplicación web":
        - Descripción:            Solicitudes Santa María
        - Ejecutar como:          Yo (su cuenta)
        - Quién tiene acceso:     Cualquier persona
      ▸ Implementar. Autorice el acceso cuando lo pida.
   5. Copie la URL que termina en /exec y péguela en index.js,
      en la constante ENDPOINT.

   IMPORTANTE: cada vez que edite este script debe volver a
   Implementar ▸ Gestionar implementaciones ▸ editar ▸ Versión: Nueva,
   si no, la web seguirá usando la versión anterior.
   ===================================================================== */

var ID_HOJA = '13C0QQRZt0zIO6QtWYQvtbPQBPci7Jl3UW8MDv-aAWog';
var NOMBRE_HOJA = 'Solicitudes';
var CABECERAS = [
  'Folio', 'Fecha y hora', 'Departamento', 'Piso',
  'Nombre', 'Teléfono', 'Tipo', 'Detalle', 'Estado', 'Tratado en asamblea'
];

/* ---------- entrada del formulario web ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);   // evita folios duplicados si llegan dos a la vez
  } catch (err) {
    return respuesta({ ok: false, error: 'servidor ocupado' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuesta({ ok: false, error: 'sin datos' });
    }

    var d = JSON.parse(e.postData.contents);

    var apto     = String(d.apto || '').trim();
    var nombre   = String(d.nombre || '').trim().slice(0, 120);
    var telefono = String(d.telefono || '').trim().slice(0, 40);
    var tipo     = d.tipo === 'Reclamo' ? 'Reclamo' : 'Consulta';
    var detalle  = String(d.mensaje || '').trim().slice(0, 1200);

    if (!/^([1-9]|10)0[1-4]$/.test(apto))  return respuesta({ ok: false, error: 'departamento inválido' });
    if (nombre.length < 3)                 return respuesta({ ok: false, error: 'nombre inválido' });
    if (telefono.replace(/\D/g, '').length < 7) return respuesta({ ok: false, error: 'teléfono inválido' });
    if (detalle.length < 15)               return respuesta({ ok: false, error: 'detalle demasiado corto' });

    var hoja  = obtenerHoja();
    var folio = generarFolio(hoja);
    var piso  = apto.length === 4 ? 10 : Number(apto.charAt(0));

    hoja.appendRow([
      folio,
      new Date(),
      "'" + apto,        // apóstrofo: la hoja lo guarda como texto, no como número
      piso,
      nombre,
      "'" + telefono,
      tipo,
      detalle,
      'pendiente',
      ''
    ]);

    return respuesta({ ok: true, folio: folio });

  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- listado público (lo consume solicitudes/pendientes/) ----------
   PRIVACIDAD: el teléfono NO se publica nunca, queda solo en la hoja.
   Ponga MOSTRAR_NOMBRE en false si quiere publicar las solicitudes
   sin identificar al solicitante.                                         */
var MOSTRAR_NOMBRE = true;

function doGet() {
  try {
    var hoja = obtenerHoja();

    if (hoja.getLastRow() < 2) {
      return respuesta({ ok: true, solicitudes: [] });
    }

    var filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, CABECERAS.length).getValues();
    var lista = [];

    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      var folio = String(f[0]).trim();
      if (!folio) continue;   // fila vacía

      lista.push({
        folio:    folio,
        fecha:    f[1] instanceof Date ? f[1].toISOString() : String(f[1]),
        apto:     String(f[2]).replace(/^'/, '').trim(),
        piso:     Number(f[3]) || null,
        nombre:   MOSTRAR_NOMBRE ? String(f[4]).trim() : '',
        tipo:     String(f[6]).trim() || 'Consulta',
        detalle:  String(f[7]).trim(),
        estado:   String(f[8]).trim().toLowerCase() || 'pendiente',
        asamblea: String(f[9]).trim()
      });
    }

    lista.reverse();   // la más reciente primero

    return respuesta({
      ok: true,
      solicitudes: lista,
      actualizado: new Date().toISOString()
    });

  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  }
}

/* ---------- prueba desde el editor de Apps Script ----------
   Seleccione "probarEscritura" en el menú de funciones y presione
   Ejecutar: debe aparecer una fila de prueba en la hoja.
   Bórrela a mano cuando termine de verificar.                     */
function probarEscritura() {
  var salida = doPost({
    postData: {
      contents: JSON.stringify({
        apto: '704',
        nombre: 'PRUEBA · borrar esta fila',
        telefono: '70012345',
        tipo: 'Consulta',
        mensaje: 'Fila de prueba generada desde el editor de Apps Script.'
      })
    }
  });
  Logger.log(salida.getContent());
}

/* ---------- utilidades ---------- */
function obtenerHoja() {
  // openById: funciona igual si el script está dentro de la hoja o suelto.
  var libro = SpreadsheetApp.openById(ID_HOJA);
  var hoja  = libro.getSheetByName(NOMBRE_HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
  }

  if (hoja.getLastRow() === 0) {
    hoja.appendRow(CABECERAS);
    var cab = hoja.getRange(1, 1, 1, CABECERAS.length);
    cab.setFontWeight('bold').setBackground('#0d1424').setFontColor('#e6ecf5');
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 120);   // folio
    hoja.setColumnWidth(2, 150);   // fecha
    hoja.setColumnWidth(5, 220);   // nombre
    hoja.setColumnWidth(8, 460);   // detalle
    hoja.getRange('H:H').setWrap(true);
  }

  return hoja;
}

function generarFolio(hoja) {
  var anio = new Date().getFullYear();
  var n = 0;

  if (hoja.getLastRow() > 1) {
    var folios = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < folios.length; i++) {
      var m = /^SM-(\d{4})-(\d+)$/.exec(String(folios[i][0]).trim());
      if (m && Number(m[1]) === anio) n = Math.max(n, Number(m[2]));
    }
  }

  return 'SM-' + anio + '-' + ('0000' + (n + 1)).slice(-4);
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
