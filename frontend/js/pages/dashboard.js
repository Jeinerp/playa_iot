/* ========================================
   DASHBOARD.JS — Premium Animated Dashboard
   with Circular Gauges & Clear Visualizations
   ======================================== */

import { api } from '../api.js';
import { createLineChart, createBarChart, createDoughnutChart } from '../components/charts.js';

let charts = [];

// Variable type configuration — colors, icons, units, ranges
const VAR_CONFIG = {
    'Temperatura': {
        icon: 'thermometer', unit: '°C', color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.25)', gradient: ['#ef4444', '#f97316'],
        min: 0, max: 50, normalMax: 35, warningMax: 42,
        description: 'Ambiente'
    },
    'Humedad': {
        icon: 'droplets', unit: '%', color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.25)', gradient: ['#3b82f6', '#06b6d4'],
        min: 0, max: 100, normalMax: 70, warningMax: 85,
        description: 'Relativa'
    },
    'Nivel de Agua': {
        icon: 'waves', unit: 'm', color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.25)', gradient: ['#06b6d4', '#0891b2'],
        min: 0, max: 5, normalMax: 2.5, warningMax: 4,
        description: 'Marea'
    },
    'Calidad del Aire': {
        icon: 'wind', unit: 'AQI', color: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.25)', gradient: ['#8b5cf6', '#a78bfa'],
        min: 0, max: 100, normalMax: 50, warningMax: 75,
        description: 'Índice'
    },
};

export function renderDashboard() {
    const content = document.getElementById('main-content');
    if (!content) return;

    content.innerHTML = `
        <!-- Hero Banner -->
        <div class="dash-hero">
            <div class="dash-hero-bg">
                <div class="wave wave1"></div>
                <div class="wave wave2"></div>
                <div class="wave wave3"></div>
            </div>
            <div class="dash-hero-content">
                <div class="dash-hero-icon">
                    <i data-lucide="waves" style="width:28px;height:28px;"></i>
                </div>
                <div>
                    <h1 class="dash-hero-title">Monitoreo Costero en Tiempo Real</h1>
                    <p class="dash-hero-sub">Sistema IoT para vigilancia ambiental de playas y zonas marítimas</p>
                </div>
            </div>
            <div class="dash-hero-stats" id="hero-stats">
                <div class="dash-hero-stat">
                    <span class="dash-hero-stat-value" id="hs-fecha">—</span>
                    <span class="dash-hero-stat-label">Última actualización</span>
                </div>
                <div class="dash-hero-stat">
                    <span class="dash-hero-stat-value" id="hs-estaciones">—</span>
                    <span class="dash-hero-stat-label">Estaciones activas</span>
                </div>
                <div class="dash-hero-stat">
                    <span class="dash-hero-stat-value" id="hs-zonas">—</span>
                    <span class="dash-hero-stat-label">Zonas monitoreadas</span>
                </div>
            </div>
        </div>

        <!-- Animated Gauge Cards — One per variable type -->
        <div class="gauge-grid" id="gauge-grid">
            ${[1,2,3,4].map(() => `
                <div class="gauge-card">
                    <div class="skeleton skeleton-card" style="width:140px;height:140px;border-radius:50%;"></div>
                    <div class="skeleton skeleton-text" style="width:120px;"></div>
                </div>
            `).join('')}
        </div>

        <!-- Trend Charts — Per variable type -->
        <div class="chart-grid" id="trend-charts">
            <div class="page-loader" style="grid-column:1/-1;"><div class="spinner"></div></div>
        </div>

        <!-- Bottom Row: Alerts + Devices Status -->
        <div class="dashboard-grid" style="margin-top:var(--space-lg);">
            <div class="premium-chart-card" style="animation-delay:0.5s;">
                <div class="premium-chart-header">
                    <div class="premium-chart-title">
                        <div class="premium-chart-title-icon" style="background:linear-gradient(135deg,#f59e0b,#f97316);">
                            <i data-lucide="bell"></i>
                        </div>
                        <div>
                            <h3>Alertas Ambientales</h3>
                            <p>Distribución por estado</p>
                        </div>
                    </div>
                </div>
                <div style="height:240px;"><canvas id="chart-alertas"></canvas></div>
            </div>
            <div class="card" style="animation-delay:0.6s;">
                <div class="card-header">
                    <h3 class="card-title">
                        <i data-lucide="alert-triangle" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--danger);"></i>
                        Alertas Recientes
                    </h3>
                </div>
                <div class="recent-alerts-list" id="recent-alerts">
                    <div class="skeleton skeleton-text" style="width:100%;height:50px;"></div>
                    <div class="skeleton skeleton-text" style="width:100%;height:50px;"></div>
                    <div class="skeleton skeleton-text" style="width:100%;height:50px;"></div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    loadDashboardData(content);

    return () => {
        charts.forEach(c => c.destroy());
        charts = [];
    };
}

async function loadDashboardData(content) {
    try {
        const summary = await api.get('/dashboard-summary/');

        const dispArr = summary.dispositivos || [];
        const sensArr = summary.sensores || [];
        const alertArr = summary.alertas || [];
        const lectArr = summary.lecturas || [];
        const zonArr = summary.zonas || [];

        const activos = dispArr.filter(d => d.estado === 'ACTIVO').length;

        // ====================================
        // HERO STATS
        // ====================================
        const fechaEl = content.querySelector('#hs-fecha');
        if (fechaEl) fechaEl.textContent = new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
        const estEl = content.querySelector('#hs-estaciones');
        if (estEl) estEl.textContent = `${activos} / ${dispArr.length}`;
        const zonEl = content.querySelector('#hs-zonas');
        if (zonEl) zonEl.textContent = zonArr.length;

        // ====================================
        // ANIMATED GAUGE CARDS
        // ====================================
        renderGauges(content, lectArr);

        // ====================================
        // TREND CHARTS — One per variable type
        // ====================================
        renderTrendCharts(content, lectArr);

        // ====================================
        // ALERTS BAR CHART
        // ====================================
        renderAlertChart(content, alertArr);

        // ====================================
        // RECENT ALERTS LIST
        // ====================================
        renderRecentAlerts(content, alertArr);

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// ======================================================
// GAUGE RENDERING — Animated circular progress gauges
// ======================================================
function renderGauges(content, lecturas) {
    const gaugeGrid = content.querySelector('#gauge-grid');
    if (!gaugeGrid) return;

    // Group lecturas by variable type name (need to resolve from data)
    const varGroups = {};
    lecturas.forEach(l => {
        // Try to find variable name from nested data or direct field
        const varName = l.id_tipo_variable_detail?.nombre ||
                        l.tipo_variable_nombre ||
                        resolveVarName(l.id_tipo_variable);
        if (!varGroups[varName]) varGroups[varName] = [];
        varGroups[varName].push(l);
    });

    // Build gauge cards HTML
    const gaugeNames = Object.keys(VAR_CONFIG);
    gaugeGrid.innerHTML = gaugeNames.map((name, idx) => {
        const config = VAR_CONFIG[name];
        const readings = varGroups[name] || [];
        const latestVal = readings.length > 0 ? parseFloat(readings[0].valor) : 0;
        const avg = readings.length > 0
            ? (readings.reduce((s, r) => s + parseFloat(r.valor), 0) / readings.length).toFixed(1)
            : '—';

        // Calculate percentage for gauge fill
        const pct = Math.min(Math.max(((latestVal - config.min) / (config.max - config.min)) * 100, 0), 100);
        const circumference = 2 * Math.PI * 60; // r=60
        const offset = circumference - (pct / 100) * circumference;

        // Determine status
        let statusClass = 'normal', statusText = 'Normal';
        if (latestVal > config.warningMax) { statusClass = 'danger'; statusText = 'Crítico'; }
        else if (latestVal > config.normalMax) { statusClass = 'warning'; statusText = 'Precaución'; }

        return `
            <div class="gauge-card" style="--gauge-color:${config.color};--gauge-glow:${config.glow};animation-delay:${idx * 0.1}s;">
                <div class="gauge-ring">
                    <svg viewBox="0 0 128 128">
                        <circle class="gauge-bg" cx="64" cy="64" r="60" />
                        <circle class="gauge-fill" cx="64" cy="64" r="60"
                            style="stroke-dasharray:${circumference};stroke-dashoffset:${circumference};"
                            data-target-offset="${offset}" />
                    </svg>
                    <div class="gauge-center">
                        <span class="gauge-value">${readings.length > 0 ? latestVal.toFixed(1) : '—'}</span>
                        <span class="gauge-unit">${config.unit}</span>
                    </div>
                </div>
                <div class="gauge-label">
                    <i data-lucide="${config.icon}"></i>
                    ${name}
                </div>
                <div class="gauge-sublabel">${config.description} · Prom: ${avg} ${config.unit}</div>
                <div class="gauge-status ${statusClass}">
                    <span class="gauge-status-dot"></span>
                    ${statusText}
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Animate gauge fills after a short delay
    requestAnimationFrame(() => {
        setTimeout(() => {
            gaugeGrid.querySelectorAll('.gauge-fill').forEach(circle => {
                const targetOffset = circle.getAttribute('data-target-offset');
                circle.style.strokeDashoffset = targetOffset;
            });
        }, 200);
    });
}

// Helper: resolve variable name from ID (fallback)
function resolveVarName(id) {
    const map = { 1: 'Temperatura', 2: 'Humedad', 3: 'Nivel de Agua', 4: 'Calidad del Aire' };
    return map[id] || `Variable ${id}`;
}

// ======================================================
// TREND CHARTS — One line chart per variable
// ======================================================
function renderTrendCharts(content, lecturas) {
    const container = content.querySelector('#trend-charts');
    if (!container) return;

    const varGroups = {};
    lecturas.forEach(l => {
        const varName = resolveVarName(l.id_tipo_variable);
        if (!varGroups[varName]) varGroups[varName] = [];
        varGroups[varName].push(l);
    });

    const varNames = Object.keys(VAR_CONFIG);
    const chartsWithData = varNames.filter(n => (varGroups[n] || []).length > 0);

    if (chartsWithData.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="activity"></i><p>Sin datos de sensores aún</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = chartsWithData.map((name, idx) => {
        const config = VAR_CONFIG[name];
        const canvasId = `chart-trend-${name.replace(/\s+/g, '-').toLowerCase()}`;
        return `
            <div class="premium-chart-card" style="animation-delay:${0.2 + idx * 0.1}s;">
                <div class="premium-chart-header">
                    <div class="premium-chart-title">
                        <div class="premium-chart-title-icon" style="background:linear-gradient(135deg,${config.gradient[0]},${config.gradient[1]});">
                            <i data-lucide="${config.icon}"></i>
                        </div>
                        <div>
                            <h3>${name}</h3>
                            <p>Tendencia de las últimas lecturas (${config.unit})</p>
                        </div>
                    </div>
                    <span class="badge badge-info">${(varGroups[name] || []).length} datos</span>
                </div>
                <div style="height:220px;"><canvas id="${canvasId}"></canvas></div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Create each chart
    chartsWithData.forEach(name => {
        const config = VAR_CONFIG[name];
        const canvasId = `chart-trend-${name.replace(/\s+/g, '-').toLowerCase()}`;
        const data = (varGroups[name] || []).slice(0, 20).reverse();

        const labels = data.map(l => {
            if (l.fecha_hora) {
                const d = new Date(l.fecha_hora);
                return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
            }
            return '';
        });

        const chart = createLineChart(canvasId, labels, [{
            label: `${name} (${config.unit})`,
            data: data.map(l => parseFloat(l.valor)),
            borderColor: config.color,
            backgroundColor: config.glow,
        }]);
        if (chart) charts.push(chart);
    });
}

// ======================================================
// ALERT CHART
// ======================================================
function renderAlertChart(content, alertArr) {
    const c3El = content.querySelector('#chart-alertas');
    if (!c3El) return;

    const estadoCount = {};
    alertArr.forEach(a => { estadoCount[a.estado] = (estadoCount[a.estado] || 0) + 1; });
    const estadoLabels = Object.keys(estadoCount).length > 0
        ? Object.keys(estadoCount)
        : ['PENDIENTE', 'VISTA', 'RESUELTA'];
    const estadoValues = estadoLabels.map(k => estadoCount[k] || 0);
    const estadoColors = estadoLabels.map(k =>
        k === 'PENDIENTE' ? '#f59e0b' :
        k === 'VISTA' ? '#3b82f6' :
        k === 'RESUELTA' ? '#10b981' : '#8b5cf6'
    );

    const c3 = createBarChart('chart-alertas', estadoLabels, [{
        label: 'Alertas',
        data: estadoValues,
        backgroundColor: estadoColors,
    }]);
    if (c3) charts.push(c3);
}

// ======================================================
// RECENT ALERTS LIST
// ======================================================
function renderRecentAlerts(content, alertArr) {
    const alertsContainer = content.querySelector('#recent-alerts');
    if (!alertsContainer) return;

    const recentAlerts = alertArr.slice(0, 5);
    if (recentAlerts.length > 0) {
        alertsContainer.innerHTML = recentAlerts.map((a, i) => `
            <div class="alert-item" style="animation: fadeIn 0.3s ease ${i * 0.08}s both;">
                <div class="alert-dot ${a.estado === 'PENDIENTE' ? 'danger' : a.estado === 'VISTA' ? 'warning' : 'success'}"></div>
                <div class="alert-info">
                    <h4>${a.titulo || 'Alerta Costera'}</h4>
                    <p>${a.estado} — ${a.fecha_generacion ? new Date(a.fecha_generacion).toLocaleString('es-CO') : ''}</p>
                </div>
            </div>
        `).join('');
    } else {
        alertsContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="shield-check"></i>
                <p>Sin alertas — Condiciones costeras normales</p>
            </div>`;
    }
    if (window.lucide) lucide.createIcons();
}
