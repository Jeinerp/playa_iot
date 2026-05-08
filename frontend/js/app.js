/* ========================================
   APP.JS — Application Entry Point
   ======================================== */

import { router } from './router.js';
import { auth } from './auth.js';
import { renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderHeader, bindHeaderEvents } from './components/header.js';

// Pages
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderDispositivos } from './pages/dispositivos.js';
import { renderZonas } from './pages/zonas.js';
import { renderSensores } from './pages/sensores.js';
import { renderLecturas } from './pages/lecturas.js';
import { renderAlertas } from './pages/alertas.js';
import { renderActuadores } from './pages/actuadores.js';
import { renderUsuarios } from './pages/usuarios.js';
import { renderAuditoria } from './pages/auditoria.js';

const pageTitles = {
    '/dashboard':    ['Dashboard', 'Vista general del sistema'],
    '/dispositivos': ['Dispositivos IoT', 'Gestión de dispositivos registrados'],
    '/zonas':        ['Zonas de Monitoreo', 'Gestión de zonas geográficas'],
    '/sensores':     ['Sensores', 'Gestión de sensores instalados'],
    '/lecturas':     ['Lecturas', 'Historial de lecturas de sensores'],
    '/alertas':      ['Alertas', 'Gestión de alertas y umbrales'],
    '/actuadores':   ['Actuadores', 'Buzzers, comandos y respuestas'],
    '/usuarios':     ['Usuarios y Roles', 'Administración de accesos'],
    '/roles':        ['Usuarios y Roles', 'Administración de accesos'],
    '/auditoria':    ['Auditoría', 'Registro de actividad del sistema'],
};

let layoutMounted = false;

function ensureAppLayout() {
    if (layoutMounted && document.getElementById('main-content')) return;

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="app-layout">
            ${renderSidebar()}
            <div class="main-wrapper">
                <div id="header-slot"></div>
                <main class="content" id="main-content">
                    <div class="page-loader"><div class="spinner"></div></div>
                </main>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    bindSidebarEvents();
    bindHeaderEvents();
    layoutMounted = true;
    
    // Add role-based body class for UI restrictions
    if (auth.getRoleName() !== 'Administrador') {
        document.body.classList.add('role-readonly');
    } else {
        document.body.classList.remove('role-readonly');
    }
}

function updateHeader(route) {
    const [title, subtitle] = pageTitles[route] || ['', ''];
    const headerSlot = document.getElementById('header-slot');
    if (headerSlot) {
        headerSlot.innerHTML = renderHeader(title, subtitle);
        if (window.lucide) lucide.createIcons();
        bindHeaderEvents();
    }
}

function renderAppLayout(pageRenderer, route) {
    ensureAppLayout();
    updateHeader(route);

    // Show spinner instantly while page loads
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
    }

    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-route') === route);
    });

    // Auto-close sidebar on mobile after navigation
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
    }

    return pageRenderer();
}

// Register routes
router.register('/login', () => { layoutMounted = false; renderLogin(); });

router.register('/dashboard', () => renderAppLayout(renderDashboard, '/dashboard'));
router.register('/dispositivos', () => renderAppLayout(renderDispositivos, '/dispositivos'));
router.register('/zonas', () => renderAppLayout(renderZonas, '/zonas'));
router.register('/sensores', () => renderAppLayout(renderSensores, '/sensores'));
router.register('/lecturas', () => renderAppLayout(renderLecturas, '/lecturas'));
router.register('/alertas', () => renderAppLayout(renderAlertas, '/alertas'));
router.register('/actuadores', () => renderAppLayout(renderActuadores, '/actuadores'));
router.register('/usuarios', () => renderAppLayout(renderUsuarios, '/usuarios'));
router.register('/roles', () => renderAppLayout(renderUsuarios, '/roles'));
router.register('/auditoria', () => renderAppLayout(renderAuditoria, '/auditoria'));

// Initial resolve
router.resolve();
