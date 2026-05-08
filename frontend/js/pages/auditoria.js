/* ========================================
   AUDITORIA.JS — Auditoría del Sistema
   ======================================== */

import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { showToast } from '../components/toast.js';

export function renderAuditoria() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info">
                <h1>Auditoría del Sistema</h1>
                <p>Registro de actividad y acciones realizadas en el sistema</p>
            </div>
        </div>
        <div id="audit-table">
            <div class="page-loader"><div class="spinner"></div></div>
        </div>
    `;
    loadData();
}

async function loadData() {
    try {
        let data = await api.get('/auditoria/');
        data = Array.isArray(data) ? data : data?.results || [];

        renderTable({
            containerId: 'audit-table',
            columns: [
                { key: 'id_auditoria', label: 'ID' },
                { key: 'id_usuario', label: 'Usuario ID', render: (v) => v ? `<span class="badge badge-info">#${v}</span>` : '<span class="text-muted">Sistema</span>' },
                { key: 'accion', label: 'Acción', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
                { key: 'tabla_afectada', label: 'Tabla Afectada', render: (v) => `<code style="color:var(--accent);">${v}</code>` },
                { key: 'fecha_hora', label: 'Fecha y Hora', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
            ],
            data,
            emptyIcon: 'file-text',
            emptyText: 'No hay registros de auditoría'
        });
    } catch (e) {
        showToast('Error', 'No se pudieron cargar los registros de auditoría', 'error');
    }
}
