// Lista de archivos disponibles en /finanzas/data/. Cada Excel = un mes.
// Al agregar un nuevo Excel, añade aquí su entrada { archivo, etiqueta }.
const PERIODOS = [
    { archivo: "data/2021-12.xlsx", etiqueta: "Diciembre 2021" },
    { archivo: "data/2022-2.xlsx",  etiqueta: "Febrero 2022" },
    { archivo: "data/2022-3.xlsx",  etiqueta: "Marzo 2022" },
    { archivo: "data/2022-4.xlsx",  etiqueta: "Abril 2022" },
    { archivo: "data/2022-5.xlsx",  etiqueta: "Mayo 2022" },
    { archivo: "data/2022-6.xlsx",  etiqueta: "Junio 2022" },
    { archivo: "data/2022-7.xlsx",  etiqueta: "Julio 2022" },
    { archivo: "data/2022-8.xlsx",  etiqueta: "Agosto 2022" },
    { archivo: "data/2022-9.xlsx",  etiqueta: "Septiembre 2022" },
    { archivo: "data/2022-10.xlsx", etiqueta: "Octubre 2022" },
    { archivo: "data/2022-11.xlsx", etiqueta: "Noviembre 2022" },
    { archivo: "data/2022-12.xlsx", etiqueta: "Diciembre 2022" },

    { archivo: "data/2023-1.xlsx",  etiqueta: "Enero 2023" },
    { archivo: "data/2023-2.xlsx",  etiqueta: "Febrero 2023" },
    { archivo: "data/2023-3.xlsx",  etiqueta: "Marzo 2023" },
    { archivo: "data/2023-4.xlsx",  etiqueta: "Abril 2023" },
    { archivo: "data/2023-5.xlsx",  etiqueta: "Mayo 2023" },
    { archivo: "data/2023-6.xlsx",  etiqueta: "Junio 2023" },
    { archivo: "data/2023-7.xlsx",  etiqueta: "Julio 2023" },
    { archivo: "data/2023-8.xlsx",  etiqueta: "Agosto 2023" },
    { archivo: "data/2023-9.xlsx",  etiqueta: "Septiembre 2023" },
    { archivo: "data/2023-10.xlsx", etiqueta: "Octubre 2023" },
    { archivo: "data/2023-11.xlsx", etiqueta: "Noviembre 2023" },
    { archivo: "data/2023-12.xlsx", etiqueta: "Diciembre 2023" },

    { archivo: "data/2024-1.xlsx",  etiqueta: "Enero 2024" },
    { archivo: "data/2024-2.xlsx",  etiqueta: "Febrero 2024" },
    { archivo: "data/2024-3.xlsx",  etiqueta: "Marzo 2024" },
    { archivo: "data/2024-4.xlsx",  etiqueta: "Abril 2024" },
    { archivo: "data/2024-5.xlsx",  etiqueta: "Mayo 2024" },
    { archivo: "data/2024-6.xlsx",  etiqueta: "Junio 2024" },
    { archivo: "data/2024-7.xlsx",  etiqueta: "Julio 2024" },
    { archivo: "data/2024-8.xlsx",  etiqueta: "Agosto 2024" },
    { archivo: "data/2024-9.xlsx",  etiqueta: "Septiembre 2024" },
    { archivo: "data/2024-10.xlsx", etiqueta: "Octubre 2024" },
    { archivo: "data/2024-11.xlsx", etiqueta: "Noviembre 2024" },
    { archivo: "data/2024-12.xlsx", etiqueta: "Diciembre 2024" },

    { archivo: "data/2025-1.xlsx",  etiqueta: "Enero 2025" },
    { archivo: "data/2025-2.xlsx",  etiqueta: "Febrero 2025" },
    { archivo: "data/2025-3.xlsx",  etiqueta: "Marzo 2025" },
    { archivo: "data/2025-4.xlsx",  etiqueta: "Abril 2025" },
    { archivo: "data/2025-5.xlsx",  etiqueta: "Mayo 2025" },
    { archivo: "data/2025-6.xlsx",  etiqueta: "Junio 2025" },
    { archivo: "data/2025-7.xlsx",  etiqueta: "Julio 2025" },
    { archivo: "data/2025-8.xlsx",  etiqueta: "Agosto 2025" },
    { archivo: "data/2025-9.xlsx",  etiqueta: "Septiembre 2025" },
    { archivo: "data/2025-10.xlsx", etiqueta: "Octubre 2025" },
    { archivo: "data/2025-11.xlsx", etiqueta: "Noviembre 2025" },
    { archivo: "data/2025-12.xlsx", etiqueta: "Diciembre 2025" },

    { archivo: "data/2026-1.xlsx",  etiqueta: "Enero 2026" },
    { archivo: "data/2026-2.xlsx",  etiqueta: "Febrero 2026" },
    { archivo: "data/2026-3.xlsx",  etiqueta: "Marzo 2026" },
    { archivo: "data/2026-4.xlsx",  etiqueta: "Abril 2026" },
    { archivo: "data/2026-5.xlsx",  etiqueta: "Mayo 2026" },

];

// Descarga y parsea el workbook de un periodo.
async function obtenerWb(periodo) {
    const resp = await fetch(periodo.archivo);
    if (!resp.ok) throw new Error(`No se pudo cargar ${periodo.archivo} (${resp.status})`);
    const buffer = await resp.arrayBuffer();
    return XLSX.read(buffer, { type: "array", cellDates: true });
}

// Busca una hoja cuyo nombre contenga alguno de los términos dados.
function buscarHoja(wb, terminos) {
    const nombre = wb.SheetNames.find(n =>
        terminos.some(t => n.toLowerCase().includes(t)));
    return nombre ? wb.Sheets[nombre] : null;
}

// Convierte una hoja en una matriz de filas, quitando filas totalmente vacías.
// raw: true conserva los valores nativos (números y fechas).
function hojaAMatriz(hoja) {
    return XLSX.utils
        .sheet_to_json(hoja, { header: 1, raw: true, defval: "" })
        .filter(fila => fila.some(c => c !== "" && c != null));
}

// Último valor numérico de la primera fila que contenga la etiqueta buscada.
function valorPorEtiqueta(filas, regex) {
    for (const fila of filas) {
        if (fila.some(c => typeof c === "string" && regex.test(c))) {
            const nums = fila.filter(c => typeof c === "number");
            if (nums.length) return nums[nums.length - 1];
        }
    }
    return 0;
}

// Extrae Total ingresos y Total egresos de la carátula del mes.
function extraerTotales(wb) {
    const hojaRes = buscarHoja(wb, ["caratula", "hoja"]) || wb.Sheets[wb.SheetNames[0]];
    const filas = hojaRes ? hojaAMatriz(hojaRes) : [];
    const ingresos = valorPorEtiqueta(filas, /total\s+ingresos/i);
    const egresos = valorPorEtiqueta(filas, /total\s+egresos/i);
    return { ingresos, egresos, utilidad: ingresos - egresos };
}

let chart = null;
let periodosData = [];   // [{ etiqueta, wb, ingresos, egresos, utilidad }]

// Dibuja la gráfica: barras de Total ingresos / Total egresos + línea de utilidad.
function dibujarGrafico(datos) {
    const ctx = document.getElementById("grafico");
    if (!ctx) return;
    if (chart) chart.destroy();

    // Estilo oscuro (paleta del sitio)
    Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
    Chart.defaults.color = "#7c8aa5";
    Chart.defaults.borderColor = "rgba(124,162,214,.1)";

    const fmtBs = v => "Bs " + Number(v).toLocaleString("es-BO",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Al hacer clic en una barra, muestra el detalle correspondiente abajo.
    // Dataset 0 = ingresos, 1 = egresos.
    const alHacerClic = (evt) => {
        const pts = chart.getElementsAtEventForMode(
            evt, "nearest", { intersect: true }, true);
        if (!pts.length) return;
        const { datasetIndex, index } = pts[0];
        if (datasetIndex === 0) mostrarDetalle(index, "ingreso");
        else if (datasetIndex === 1) mostrarDetalle(index, "egreso");
    };

    chart = new Chart(ctx, {
        data: {
            labels: datos.map(d => d.mes || d.etiqueta),
            datasets: [
                {
                    type: "bar",
                    label: "Total ingresos",
                    data: datos.map(d => d.ingresos),
                    backgroundColor: "rgba(95, 217, 154, 0.7)",
                    borderColor: "#5fd99a",
                    borderWidth: 1,
                    borderRadius: 5,
                    maxBarThickness: 40,
                },
                {
                    type: "bar",
                    label: "Total egresos",
                    data: datos.map(d => d.egresos),
                    backgroundColor: "rgba(244, 123, 155, 0.7)",
                    borderColor: "#f47b9b",
                    borderWidth: 1,
                    borderRadius: 5,
                    maxBarThickness: 40,
                },
                {
                    type: "line",
                    label: "Utilidad",
                    data: datos.map(d => d.utilidad),
                    borderColor: "#4fd8e8",
                    backgroundColor: "#4fd8e8",
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#4fd8e8",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            onClick: alHacerClic,
            onHover: (evt, elementos) => {
                evt.native.target.style.cursor = elementos.length ? "pointer" : "default";
            },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: { label: c => `${c.dataset.label}: ${fmtBs(c.parsed.y)}` },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(124,162,214,.1)" },
                    ticks: {
                        color: "#7c8aa5",
                        callback: v => "Bs " + Number(v).toLocaleString("es-BO"),
                    },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#7c8aa5" },
                },
            },
        },
    });
}

// Da formato legible a un valor (fechas y números).
function fmt(v) {
    if (v instanceof Date) return v.toLocaleDateString("es-BO");
    if (typeof v === "number") {
        return Number.isInteger(v)
            ? v.toLocaleString("es-BO")
            : v.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return v ?? "";
}

// Construye el detalle de una hoja (Ingresos / Egresos): los títulos previos
// al encabezado van como <div> (no ocupan toda una fila de la tabla) y el
// resto como tabla. Devuelve un fragmento listo para insertar.
function tablaDeHoja(hoja) {
    const filas = hojaAMatriz(hoja);
    const nLlenas = fila => fila.filter(c => c !== "" && c != null).length;

    // El encabezado es la primera fila "ancha" (>= 3 columnas con contenido);
    // las anteriores son títulos. Si ninguna llega, usamos la más ancha.
    let idxHeader = filas.findIndex(f => nLlenas(f) >= 3);
    if (idxHeader < 0) {
        let maxCols = 0;
        filas.forEach((f, i) => { if (nLlenas(f) > maxCols) { maxCols = nLlenas(f); idxHeader = i; } });
        if (idxHeader < 0) idxHeader = 0;
    }
    const nCols = filas.reduce((m, f) => Math.max(m, f.length), 0);

    const frag = document.createDocumentFragment();

    // Títulos de la hoja (filas antes del encabezado), como texto.
    for (let i = 0; i < idxHeader; i++) {
        const texto = filas[i].map(fmt).filter(t => t !== "").join(" ");
        if (texto) {
            const div = document.createElement("div");
            div.className = "titulo-hoja";
            div.textContent = texto;
            frag.appendChild(div);
        }
    }

    // Tabla desde el encabezado en adelante.
    const tabla = document.createElement("table");
    for (let i = idxHeader; i < filas.length; i++) {
        const tr = document.createElement("tr");
        const esHeader = i === idxHeader;
        for (let c = 0; c < nCols; c++) {
            const cell = document.createElement(esHeader ? "th" : "td");
            cell.textContent = fmt(filas[i][c]);
            tr.appendChild(cell);
        }
        tabla.appendChild(tr);
    }
    frag.appendChild(tabla);
    return frag;
}

// Extrae de la carátula (hoja 1) el bloque resumen de ingresos o egresos:
// las filas entre el encabezado ("INGRESOS"/"EGRESOS") y su total, inclusive.
function resumenCaratula(wb, tipo) {
    const hojaRes = buscarHoja(wb, ["caratula", "hoja"]) || wb.Sheets[wb.SheetNames[0]];
    if (!hojaRes) return [];
    const filas = hojaAMatriz(hojaRes);
    const encReg = tipo === "ingreso" ? /^\s*ingresos\s*$/i : /^\s*egresos\s*$/i;
    const totReg = tipo === "ingreso" ? /total\s+ingresos/i : /total\s+egresos/i;

    let ini = -1, fin = -1;
    filas.forEach((fila, i) => {
        const tieneTexto = reg => fila.some(c => typeof c === "string" && reg.test(c));
        if (ini < 0) { if (tieneTexto(encReg)) ini = i; }
        else if (fin < 0 && tieneTexto(totReg)) fin = i;
    });
    if (ini < 0 || fin < 0) return [];

    const items = [];
    for (let i = ini + 1; i <= fin; i++) {
        const concepto = filas[i].find(c => typeof c === "string" && c.trim() !== "");
        const nums = filas[i].filter(c => typeof c === "number");
        if (concepto) items.push({ concepto, monto: nums.length ? nums[nums.length - 1] : null });
    }
    return items;
}

// Construye la tabla de resumen (concepto + monto) de la carátula.
function tablaResumen(items) {
    const tabla = document.createElement("table");
    tabla.className = "resumen";
    items.forEach(({ concepto, monto }) => {
        const tr = document.createElement("tr");
        if (/^total/i.test(concepto.trim())) tr.className = "fila-total";
        const tdC = document.createElement("td");
        tdC.textContent = concepto;
        const tdM = document.createElement("td");
        tdM.className = "rmonto";
        tdM.textContent = monto != null ? fmt(monto) : "";
        tr.append(tdC, tdM);
        tabla.appendChild(tr);
    });
    return tabla;
}

// Muestra abajo el detalle de ingresos o egresos del mes seleccionado:
// primero el resumen de la carátula (incluye saldos/préstamos) y luego la hoja.
function mostrarDetalle(mesIndex, tipo) {
    const cont = document.getElementById("detalle");
    if (!cont) return;
    const periodo = periodosData[mesIndex];
    const titulo = tipo === "ingreso" ? "Ingresos" : "Egresos";

    cont.innerHTML = `<h2>${titulo} — ${periodo.etiqueta}</h2>`;

    const resumen = resumenCaratula(periodo.wb, tipo);
    if (resumen.length) {
        cont.insertAdjacentHTML("beforeend", `<h3>Resumen de ${titulo.toLowerCase()}</h3>`);
        cont.appendChild(tablaResumen(resumen));
        cont.insertAdjacentHTML("beforeend", "<h3>Detalle</h3>");
    }

    const hoja = buscarHoja(periodo.wb, [tipo]);
    if (hoja) cont.appendChild(tablaDeHoja(hoja));
    else cont.insertAdjacentHTML("beforeend",
        `<p class="placeholder">No hay hoja de ${titulo.toLowerCase()} en este mes.</p>`);
    cont.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Año (gestión) de un periodo, tomado del nombre del archivo "data/AAAA-M.xlsx".
function anioDe(periodo) {
    const m = periodo.archivo.match(/(\d{4})-\d+/);
    return m ? m[1] : "";
}

// Carga los meses de una gestión (año) y dibuja la gráfica de ese año.
// Los meses cuyo archivo aún no existe se omiten.
async function cargarGestion(anio) {
    const msg = document.getElementById("grafico-msg");
    const det = document.getElementById("detalle");
    if (msg) msg.textContent = "Cargando…";

    const periodos = PERIODOS.filter(p => anioDe(p) === anio);
    const wbs = await Promise.all(periodos.map(p => obtenerWb(p).catch(() => null)));

    periodosData = [];
    periodos.forEach((p, i) => {
        if (!wbs[i]) return;  // mes sin archivo disponible
        periodosData.push({
            etiqueta: p.etiqueta,
            mes: p.etiqueta.replace(/\s*\d{4}$/, ""),
            wb: wbs[i],
            ...extraerTotales(wbs[i]),
        });
    });

    if (det) det.innerHTML =
        `<p class="placeholder">Haz clic en una barra de la gráfica para ver el detalle.</p>`;

    if (!periodosData.length) {
        if (chart) { chart.destroy(); chart = null; }
        if (msg) msg.textContent = `No hay datos disponibles para la gestión ${anio}.`;
        return;
    }
    if (msg) msg.textContent = "";
    dibujarGrafico(periodosData);
}

// Inicializa el selector de gestión y carga la más reciente.
function init() {
    const select = document.getElementById("gestion");
    if (!select) return;

    const anios = [...new Set(PERIODOS.map(anioDe))];
    anios.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        select.appendChild(opt);
    });

    const inicial = anios[anios.length - 1];
    select.value = inicial;
    select.addEventListener("change", () => cargarGestion(select.value));
    cargarGestion(inicial);
}

init();
