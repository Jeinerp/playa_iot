/* ========================================
   LECTURAS.JS — Lecturas de Sensores
   Con gráficas por tipo de variable y filtros funcionales
   ======================================== */

import { api } from '../api.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { createLineChart } from '../components/charts.js';

let lecturas = [], sensores = [], dispositivos = [], tiposVar = [];
let charts = [];
let activeFilter = 'all';
let searchTerm = '';

// Color scheme per variable type
const varColors = {
    'Temperatura':      { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: 'thermometer', unit: '°C' },
    'Humedad':          { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: 'droplets',    unit: '%' },
    'Nivel de Agua':    { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)',  icon: 'waves',       unit: 'm' },
    'Calidad del Aire': { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', icon: 'wind',        unit: 'AQI' },
};

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

        <!-- Charts Grid: one chart per variable type -->
        <div class="chart-grid" id="charts-container">
            <div class="page-loader" style="grid-column:1/-1;"><div class="spinner"></div></div>
        </div>

        <!-- Filters -->
        <div class="table-container" style="margin-bottom:var(--space-lg);">
            <div class="table-toolbar">
                <div class="table-search">
                    <i data-lucide="search"></i>
                    <input type="text" id="lectura-search" placeholder="Buscar por sensor, dispositivo o variable...">
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-sm);flex-wrap:wrap;">
                    <select class="form-select" id="filter-variable" style="max-width:200px;padding:0.4rem 2rem 0.4rem 0.8rem;font-size:0.85rem;">
                        <option value="all">Todas las variables</option>
                    </select>
                    <span class="text-sm text-muted" id="lectura-count">0 registros</span>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div id="lectura-table">
            <div class="page-loader"><div class="spinner"></div></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    const addBtn = content.querySelector('#btn-add-lectura');
    if (addBtn) addBtn.addEventListener('click', () => openForm());
    loadData();

    return () => { charts.forEach(c => c.destroy()); charts = []; };
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

        populateFilterDropdown();
        renderCharts();
        renderTableView();
        bindFilterEvents();
    } catch (e) {
        console.error('Error loading lecturas:', e);
        showToast('Error', 'No se pudieron cargar las lecturas', 'error');
    }
}

// ==========================================
// CHARTS — One per variable type
// ==========================================
function renderCharts() {
    charts.forEach(c => c.destroy());
    charts = [];

    const container = document.getElementById('charts-container');
    if (!container) return;

    // Build maps
    const sMap = {}; sensores.forEach(s => sMap[s.id_sensor] = s);
    const tMap = {}; tiposVar.forEach(t => tMap[t.id_tipo_variable] = t);

    // Group lecturas by variable type name
    const grouped = {};
    lecturas.forEach(l => {
        const tipo = tMap[l.id_tipo_variable];
        const nombre = tipo ? tipo.nombre : `Variable ${l.id_tipo_variable}`;
        if (!grouped[nombre]) grouped[nombre] = [];
        grouped[nombre].push(l);
    });

    // If no data at all, show empty state
    const varNames = Object.keys(grouped);
    if (varNames.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <i data-lucide="activity"></i>
                <p>No hay lecturas registradas aún</p>
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Create one chart card per variable
    container.innerHTML = varNames.map(name => {
        const colors = varColors[name] || { border: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: 'activity', unit: '' };
        const canvasId = `chart-var-${name.replace(/\s+/g, '-').toLowerCase()}`;
        return `
            <div class="chart-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i data-lucide="${colors.icon}" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:${colors.border};"></i>
                        ${name} <span style="font-weight:400;color:var(--text-muted);font-size:0.8rem;">(${colors.unit})</span>
                    </h3>
                    <span class="badge badge-info">${grouped[name].length} lecturas</span>
                </div>
                <div style="height:220px;"><canvas id="${canvasId}"></canvas></div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Render each chart
    varNames.forEach(name => {
        const canvasId = `chart-var-${name.replace(/\s+/g, '-').toLowerCase()}`;
        const data = grouped[name].slice(0, 30).reverse();
        const colors = varColors[name] || { border: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };

        const labels = data.map(l => {
            if (l.fecha_hora) {
                const d = new Date(l.fecha_hora);
                return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
            }
            return '';
        });

        const chart = createLineChart(canvasId, labels, [{
            label: name,
            data: data.map(l => parseFloat(l.valor)),
            borderColor: colors.border,
            backgroundColor: colors.bg,
        }]);
        if (chart) charts.push(chart);
    });
}

// ==========================================
// FILTERS & SEARCH
// ==========================================
function populateFilterDropdown() {
    const select = document.getElementById('filter-variable');
    if (!select) return;

    const tMap = {}; tiposVar.forEach(t => tMap[t.id_tipo_variable] = t.nombre);
    const uniqueVars = [...new Set(lecturas.map(l => l.id_tipo_variable))];

    select.innerHTML = '<option value="all">Todas las variables</option>' +
        uniqueVars.map(id => `<option value="${id}">${tMap[id] || `Variable ${id}`}</option>`).join('');
}

function bindFilterEvents() {
    const searchInput = document.getElementById('lectura-search');
    const filterSelect = document.getElementById('filter-variable');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderTableView();
        });
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            activeFilter = e.target.value;
            renderTableView();
        });
    }
}

function getFilteredData() {
    const sMap = {}; sensores.forEach(s => sMap[s.id_sensor] = s.nombre);
    const dMap = {}; dispositivos.forEach(d => dMap[d.id_dispositivo] = d.nombre);
    const tMap = {}; tiposVar.forEach(t => tMap[t.id_tipo_variable] = `${t.nombre} (${t.unidad_medida})`);

    let filtered = [...lecturas];

    // Filter by variable type
    if (activeFilter !== 'all') {
        filtered = filtered.filter(l => String(l.id_tipo_variable) === String(activeFilter));
    }

    // Search across all visible text columns
    if (searchTerm) {
        filtered = filtered.filter(l => {
            const sensorName = (sMap[l.id_sensor] || '').toLowerCase();
            const dispName = (dMap[l.id_dispositivo] || '').toLowerCase();
            const varName = (tMap[l.id_tipo_variable] || '').toLowerCase();
            const valor = String(l.valor || '').toLowerCase();
            const fecha = l.fecha_hora ? new Date(l.fecha_hora).toLocaleString('es-CO').toLowerCase() : '';
            return sensorName.includes(searchTerm) ||
                   dispName.includes(searchTerm) ||
                   varName.includes(searchTerm) ||
                   valor.includes(searchTerm) ||
                   fecha.includes(searchTerm);
        });
    }

    return { filtered, sMap, dMap, tMap };
}

// ==========================================
// TABLE
// ==========================================
function renderTableView() {
    const container = document.getElementById('lectura-table');
    if (!container) return;

    const { filtered, sMap, dMap, tMap } = getFilteredData();

    // Update count
    const countEl = document.getElementById('lectura-count');
    if (countEl) countEl.textContent = `${filtered.length} registros`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="table-container">
                <div class="empty-state">
                    <i data-lucide="search-x"></i>
                    <p>No se encontraron lecturas con los filtros actuales</p>
                </div>
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sensor</th>
                            <th>Dispositivo</th>
                            <th>Variable</th>
                            <th>Valor</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map((row, idx) => {
                            const varName = tMap[row.id_tipo_variable] || '';
                            const colorKey = varName.split(' (')[0];
                            const color = varColors[colorKey]?.border || 'var(--primary)';
                            return `
                            <tr style="animation: fadeIn 0.2s ease ${Math.min(idx * 0.02, 0.5)}s both;">
                                <td>${row.id_lectura ?? '—'}</td>
                                <td>${sMap[row.id_sensor] || row.id_sensor}</td>
                                <td>${dMap[row.id_dispositivo] || row.id_dispositivo}</td>
                                <td><span class="badge badge-info">${varName || row.id_tipo_variable}</span></td>
                                <td><strong style="color:${color};">${row.valor}</strong></td>
                                <td>${row.fecha_hora ? new Date(row.fecha_hora).toLocaleString('es-CO') : '—'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

// ==========================================
// FORM — Nueva Lectura
// ==========================================
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
