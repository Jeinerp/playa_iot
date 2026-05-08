/* ========================================
   LECTURAS.JS — Lecturas de Sensores
   ======================================== */

import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { createLineChart } from '../components/charts.js';

let lecturas = [], sensores = [], dispositivos = [], tiposVar = [];
let chart = null;

export function renderLecturas() {
    const content = document.getElementById('main-content');
    if (!content) return;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Lecturas de Sensores</h1><p>Historial de valores capturados por los sensores</p></div>
            <div class="page-header-actions">
                <button class="btn btn-primary" id="btn-add-lectura"><i data-lucide="plus"></i> Nueva Lectura</button>
            </div>
        </div>
        <div class="chart-card" style="margin-bottom:var(--space-lg);">
            <div class="card-header"><h3 class="card-title">Tendencia de Lecturas</h3></div>
            <div style="height:250px;"><canvas id="chart-lecturas-hist"></canvas></div>
        </div>
        <div id="lectura-table">
            <div class="page-loader"><div class="spinner"></div></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    const addBtn = content.querySelector('#btn-add-lectura');
    if (addBtn) addBtn.addEventListener('click', () => openForm());
    loadData();

    return () => { if (chart) { chart.destroy(); chart = null; } };
}

async function loadData() {
    try {
        [lecturas, sensores, dispositivos, tiposVar] = await Promise.all([
            api.get('/lecturas/'), api.get('/sensores/'), api.get('/dispositivos/'), api.get('/tipos-variables/')
        ]);
        lecturas = Array.isArray(lecturas) ? lecturas : lecturas?.results || [];
        sensores = Array.isArray(sensores) ? sensores : sensores?.results || [];
        dispositivos = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
        tiposVar = Array.isArray(tiposVar) ? tiposVar : tiposVar?.results || [];
        renderChart();
        renderTableView();
    } catch (e) { showToast('Error', 'No se pudieron cargar las lecturas', 'error'); }
}

function renderChart() {
    if (chart) chart.destroy();
    const last30 = lecturas.slice(0, 30).reverse();
    const labels = last30.map(l => {
        if (l.fecha_hora) { const d = new Date(l.fecha_hora); return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; }
        return '';
    });
    chart = createLineChart('chart-lecturas-hist', labels, [{
        label: 'Valor',
        data: last30.map(l => parseFloat(l.valor)),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
    }]);
}

function renderTableView() {
    const sMap = {}; sensores.forEach(s => sMap[s.id_sensor] = s.nombre);
    const dMap = {}; dispositivos.forEach(d => dMap[d.id_dispositivo] = d.nombre);
    const tMap = {}; tiposVar.forEach(t => tMap[t.id_tipo_variable] = `${t.nombre} (${t.unidad_medida})`);

    renderTable({
        containerId: 'lectura-table',
        columns: [
            { key: 'id_lectura', label: 'ID' },
            { key: 'id_sensor', label: 'Sensor', render: (v) => sMap[v] || v },
            { key: 'id_dispositivo', label: 'Dispositivo', render: (v) => dMap[v] || v },
            { key: 'id_tipo_variable', label: 'Variable', render: (v) => tMap[v] || v },
            { key: 'valor', label: 'Valor', render: (v) => `<strong style="color:var(--primary);">${v}</strong>` },
            { key: 'fecha_hora', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
        ],
        data: lecturas,
        emptyIcon: 'database',
        emptyText: 'No hay lecturas registradas'
    });
}

function openForm() {
    const sOpts = sensores.map(s => `<option value="${s.id_sensor}">${s.nombre}</option>`).join('');
    const dOpts = dispositivos.map(d => `<option value="${d.id_dispositivo}">${d.nombre}</option>`).join('');
    const tOpts = tiposVar.map(t => `<option value="${t.id_tipo_variable}">${t.nombre}</option>`).join('');
    const body = `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Sensor</label><select class="form-select" id="f-sensor"><option value="">Seleccionar...</option>${sOpts}</select></div>
            <div class="form-group"><label class="form-label">Dispositivo</label><select class="form-select" id="f-disp"><option value="">Seleccionar...</option>${dOpts}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Tipo Variable</label><select class="form-select" id="f-tv"><option value="">Seleccionar...</option>${tOpts}</select></div>
            <div class="form-group"><label class="form-label">Valor</label><input class="form-input" id="f-valor" type="number" step="0.01" placeholder="Ej: 25.5"></div>
        </div>
    `;
    openModal('Nueva Lectura', body, async () => {
        const payload = {
            id_sensor: parseInt(document.getElementById('f-sensor').value),
            id_dispositivo: parseInt(document.getElementById('f-disp').value),
            id_tipo_variable: parseInt(document.getElementById('f-tv').value),
            valor: document.getElementById('f-valor').value,
        };
        await api.post('/lecturas/', payload);
        showToast('Registrada', 'Lectura registrada exitosamente', 'success');
        loadData();
    });
}
