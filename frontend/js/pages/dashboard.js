/* ========================================
   DASHBOARD.JS — Marine Monitoring Dashboard
   ======================================== */

import { api } from '../api.js';
import { createLineChart, createBarChart, createDoughnutChart } from '../components/charts.js';

let charts = [];

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
            </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-grid" id="kpi-grid">
            ${[1,2,3,4].map(() => '<div class="kpi-card"><div class="skeleton skeleton-card" style="width:100%;height:60px;"></div></div>').join('')}
        </div>

        <!-- Charts Row 1 -->
        <div class="chart-grid">
            <div class="chart-card" style="animation-delay:0.1s;">
                <div class="card-header">
                    <h3 class="card-title"><i data-lucide="activity" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--primary);"></i>Lecturas de Sensores Costeros</h3>
                </div>
                <div style="height:280px;"><canvas id="chart-lecturas"></canvas></div>
            </div>
            <div class="chart-card" style="animation-delay:0.2s;">
                <div class="card-header">
                    <h3 class="card-title"><i data-lucide="radio" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--accent);"></i>Estaciones por Estado</h3>
                </div>
                <div style="height:280px;"><canvas id="chart-dispositivos"></canvas></div>
            </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="dashboard-grid">
            <div class="chart-card" style="animation-delay:0.3s;">
                <div class="card-header">
                    <h3 class="card-title"><i data-lucide="bell" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--warning);"></i>Alertas Ambientales</h3>
                </div>
                <div style="height:260px;"><canvas id="chart-alertas"></canvas></div>
            </div>
            <div class="card" style="animation-delay:0.4s;">
                <div class="card-header">
                    <h3 class="card-title"><i data-lucide="alert-triangle" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--danger);"></i>Alertas Recientes</h3>
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
        const [dispositivos, sensores, alertas, lecturas, zonas] = await Promise.all([
            api.get('/dispositivos/'),
            api.get('/sensores/'),
            api.get('/alertas/?limit=20'),
            api.get('/lecturas/?limit=20'),
            api.get('/zonas/')
        ]);

        const dispArr = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
        const sensArr = Array.isArray(sensores) ? sensores : sensores?.results || [];
        const alertArr = Array.isArray(alertas) ? alertas : alertas?.results || [];
        const lectArr = Array.isArray(lecturas) ? lecturas : lecturas?.results || [];
        const zonArr = Array.isArray(zonas) ? zonas : zonas?.results || [];

        const activos = dispArr.filter(d => d.estado === 'ACTIVO').length;
        const pendientes = alertArr.filter(a => a.estado === 'PENDIENTE').length;

        // Update hero timestamp
        const fechaEl = content?.querySelector('#hs-fecha');
        if (fechaEl) {
            fechaEl.textContent = new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
        }

        // KPI Cards
        const kpiGrid = content?.querySelector('#kpi-grid');
        if (kpiGrid) {
            kpiGrid.innerHTML = `
                <div class="kpi-card" style="animation-delay:0s;">
                    <div class="kpi-icon cyan"><i data-lucide="radio" style="width:24px;height:24px;"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Estaciones Costeras</div>
                        <div class="kpi-value">${dispArr.length}</div>
                        <div class="kpi-change up"><i data-lucide="check-circle" style="width:12px;height:12px;"></i> ${activos} en línea</div>
                    </div>
                </div>
                <div class="kpi-card" style="animation-delay:0.05s;">
                    <div class="kpi-icon violet"><i data-lucide="thermometer" style="width:24px;height:24px;"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Sensores Marinos</div>
                        <div class="kpi-value">${sensArr.length}</div>
                        <div class="kpi-change up"><i data-lucide="waves" style="width:12px;height:12px;"></i> Monitoreando</div>
                    </div>
                </div>
                <div class="kpi-card" style="animation-delay:0.1s;">
                    <div class="kpi-icon amber"><i data-lucide="alert-triangle" style="width:24px;height:24px;"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Alertas Ambientales</div>
                        <div class="kpi-value">${pendientes}</div>
                        <div class="kpi-change ${pendientes > 0 ? 'down' : 'up'}"><i data-lucide="${pendientes > 0 ? 'alert-circle' : 'shield-check'}" style="width:12px;height:12px;"></i> ${pendientes > 0 ? 'Requieren atención' : 'Condiciones normales'}</div>
                    </div>
                </div>
                <div class="kpi-card" style="animation-delay:0.15s;">
                    <div class="kpi-icon green"><i data-lucide="map-pin" style="width:24px;height:24px;"></i></div>
                    <div class="kpi-info">
                        <div class="kpi-label">Zonas Costeras</div>
                        <div class="kpi-value">${zonArr.length}</div>
                        <div class="kpi-change up"><i data-lucide="compass" style="width:12px;height:12px;"></i> Vigiladas</div>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }

        // Line Chart — Lecturas
        const c1El = content?.querySelector('#chart-lecturas');
        if (c1El) {
            const last20 = lectArr.slice(0, 20).reverse();
            const labels = last20.map((l, i) => l.fecha_hora ? `${new Date(l.fecha_hora).getHours()}:${String(new Date(l.fecha_hora).getMinutes()).padStart(2,'0')}` : `#${i+1}`);
            const valores = last20.map(l => parseFloat(l.valor));
            const c1 = createLineChart('chart-lecturas', labels, [{
                label: 'Lectura Ambiental',
                data: valores,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6,182,212,0.15)',
            }]);
            if (c1) charts.push(c1);
        }

        // Doughnut Chart — Dispositivos
        const c2El = content?.querySelector('#chart-dispositivos');
        if (c2El) {
            const inactivos = dispArr.length - activos;
            const c2 = createDoughnutChart('chart-dispositivos', ['En Línea', 'Fuera de Línea'], [activos, inactivos], ['#10b981', '#334155']);
            if (c2) charts.push(c2);
        }

        // Bar Chart — Alertas
        const c3El = content?.querySelector('#chart-alertas');
        if (c3El) {
            const estadoCount = {};
            alertArr.forEach(a => { estadoCount[a.estado] = (estadoCount[a.estado] || 0) + 1; });
            const estadoLabels = Object.keys(estadoCount).length > 0 ? Object.keys(estadoCount) : ['PENDIENTE', 'VISTA', 'RESUELTA'];
            const estadoValues = estadoLabels.map(k => estadoCount[k] || 0);
            const estadoColors = estadoLabels.map(k => k === 'PENDIENTE' ? '#f59e0b' : k === 'VISTA' ? '#3b82f6' : k === 'RESUELTA' ? '#10b981' : '#8b5cf6');
            const c3 = createBarChart('chart-alertas', estadoLabels, [{ label: 'Alertas', data: estadoValues, backgroundColor: estadoColors }]);
            if (c3) charts.push(c3);
        }

        // Recent Alerts
        const alertsContainer = content?.querySelector('#recent-alerts');
        if (alertsContainer) {
            const recentAlerts = alertArr.slice(0, 5);
            if (recentAlerts.length > 0) {
                alertsContainer.innerHTML = recentAlerts.map(a => `
                    <div class="alert-item">
                        <div class="alert-dot ${a.estado === 'PENDIENTE' ? 'danger' : a.estado === 'VISTA' ? 'warning' : 'success'}"></div>
                        <div class="alert-info">
                            <h4>${a.titulo || 'Alerta Costera'}</h4>
                            <p>${a.estado} — ${a.fecha_generacion ? new Date(a.fecha_generacion).toLocaleString('es-CO') : ''}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                alertsContainer.innerHTML = '<div class="empty-state"><i data-lucide="shield-check"></i><p>Sin alertas — Condiciones costeras normales</p></div>';
            }
            if (window.lucide) lucide.createIcons();
        }
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}
