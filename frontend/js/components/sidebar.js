/* ========================================
   SIDEBAR.JS — Dynamic Sidebar Navigation
   ======================================== */

import { auth } from '../auth.js';
import { router } from '../router.js';

const sectionMap = {
    '/dashboard': 'principal',
    '/dispositivos': 'iot',
    '/zonas': 'iot',
    '/sensores': 'iot',
    '/lecturas': 'monitoreo',
    '/alertas': 'monitoreo',
    '/actuadores': 'monitoreo',
    '/usuarios': 'admin',
    '/roles': 'admin',
    '/auditoria': 'admin',
};

const sections = {
    principal: 'Principal',
    iot: 'IoT & Dispositivos',
    monitoreo: 'Monitoreo & Alertas',
    admin: 'Administración',
};

export function renderSidebar() {
    const recursos = auth.getRecursos();
    // Add extra routes not in backend menu
    const allRoutes = [
        ...recursos,
        { path: '/actuadores', nombre: 'Actuadores', icono: 'radio', orden: 7 },
        { path: '/usuarios', nombre: 'Usuarios y Roles', icono: 'users', orden: 10 },
        { path: '/auditoria', nombre: 'Auditoría', icono: 'file-text', orden: 11 },
    ];

    // Deduplicate by path and filter out routes without a registered page
    const seen = new Set();
    const unique = allRoutes.filter(r => {
        if (seen.has(r.path)) return false;
        if (!sectionMap[r.path]) return false; // Remove unknown routes
        seen.add(r.path);
        return true;
    }).sort((a, b) => a.orden - b.orden);

    // Group by section
    const grouped = {};
    unique.forEach(r => {
        const section = sectionMap[r.path] || 'principal';
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push(r);
    });

    let navHTML = '';
    Object.entries(sections).forEach(([key, label]) => {
        const items = grouped[key];
        if (!items || items.length === 0) return;
        navHTML += `<div class="sidebar-section-title">${label}</div>`;
        items.forEach(r => {
            navHTML += `
                <a href="#${r.path}" class="sidebar-link" data-route="${r.path}">
                    <i data-lucide="${r.icono || 'circle'}"></i>
                    <span>${r.nombre}</span>
                </a>
            `;
        });
    });

    return `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">
                    <i data-lucide="activity" style="width:20px;height:20px;"></i>
                </div>
                <span class="sidebar-brand-text">MonitoreoIoT</span>
            </div>
            <nav class="sidebar-nav">${navHTML}</nav>
            <div class="sidebar-footer">
                <a href="#" class="sidebar-link" id="sidebar-logout">
                    <i data-lucide="log-out"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </div>
        </aside>
    `;
}

export function bindSidebarEvents() {
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }
    // Set active link
    const current = router.getCurrentRoute();
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-route') === current);
    });
}
