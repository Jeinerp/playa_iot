/* ========================================
   ACTUADORES.JS — Buzzers, Comandos, Respuestas
   ======================================== */

import { api } from '../api.js';
import { renderTable, renderBadge } from '../components/table.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let activeTab = 'buzzers';

export function renderActuadores() {
    const content = document.getElementById('main-content');
    activeTab = 'buzzers'; // Reset state
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Actuadores y Comandos</h1><p>Gestión de buzzers, comandos remotos y respuestas</p></div>
        </div>
        <div class="tabs" id="act-tabs">
            <button class="tab-btn active" data-tab="buzzers">Buzzers</button>
            <button class="tab-btn" data-tab="estados-buzzer">Estados Buzzer</button>
            <button class="tab-btn" data-tab="comandos">Comandos Remotos</button>
            <button class="tab-btn" data-tab="respuestas">Respuestas</button>
        </div>
        <div id="act-content"></div>
    `;
    document.querySelectorAll('#act-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#act-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            loadTab();
        });
    });
    loadTab();
}

async function loadTab() {
    const container = document.getElementById('act-content');
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
    try {
        if (activeTab === 'buzzers') await loadBuzzers(container);
        else if (activeTab === 'estados-buzzer') await loadEstadosBuzzer(container);
        else if (activeTab === 'comandos') await loadComandos(container);
        else if (activeTab === 'respuestas') await loadRespuestas(container);
    } catch (e) { 
        console.error(e); 
        container.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Error al cargar actuadores.</p></div>';
        if (window.lucide) lucide.createIcons();
        showToast('Error', 'Error al cargar datos', 'error'); 
    }
}

async function loadBuzzers(container) {
    let [data, dispositivos] = await Promise.all([api.get('/buzzers/'), api.get('/dispositivos/')]);
    data = Array.isArray(data) ? data : data?.results || [];
    dispositivos = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
    const dMap = {}; dispositivos.forEach(d => dMap[d.id_dispositivo] = d.nombre);

    if (container) container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-buzzer"><i data-lucide="plus"></i> Nuevo Buzzer</button></div><div id="buzzers-table"></div>`;
    if (window.lucide) lucide.createIcons();

    const addBtn = container?.querySelector('#btn-add-buzzer');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const dOpts = dispositivos.map(d => `<option value="${d.id_dispositivo}">${d.nombre}</option>`).join('');
            openModal('Nuevo Buzzer', `
                <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre"></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Dispositivo</label><select class="form-select" id="f-disp">${dOpts}</select></div><div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="APAGADO">Apagado</option><option value="ENCENDIDO">Encendido</option></select></div></div>
            `, async () => {
                await api.post('/buzzers/', { nombre: document.getElementById('f-nombre').value, id_dispositivo: parseInt(document.getElementById('f-disp').value), estado: document.getElementById('f-estado').value });
                showToast('Creado', 'Buzzer creado', 'success'); loadTab();
            });
        });
    }

    renderTable({
        containerId: 'buzzers-table',
        columns: [
            { key: 'id_buzzer', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'id_dispositivo', label: 'Dispositivo', render: (v) => dMap[v] || v },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, { 'ENCENDIDO': { class: 'badge-success', text: '🔔 Encendido' }, 'APAGADO': { class: 'badge-neutral', text: '🔕 Apagado' }, default: { class: 'badge-neutral' } }) },
        ],
        data,
        actions: [
            { name: 'toggle', label: 'Toggle', icon: 'power', idKey: 'id_buzzer', handler: async (id) => {
                const item = data.find(b => b.id_buzzer == id);
                const newState = item.estado === 'ENCENDIDO' ? 'APAGADO' : 'ENCENDIDO';
                await api.patch(`/buzzers/${id}/`, { estado: newState });
                showToast('Actualizado', `Buzzer ${newState.toLowerCase()}`, 'success'); loadTab();
            }},
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_buzzer', handler: (id) => { confirmModal('Eliminar', '¿Eliminar buzzer?', async () => { await api.delete(`/buzzers/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadEstadosBuzzer(container) {
    let data = await api.get('/estados-buzzer/');
    data = Array.isArray(data) ? data : data?.results || [];
    container.innerHTML = '<div id="ebuzz-table"></div>';
    renderTable({
        containerId: 'ebuzz-table',
        columns: [
            { key: 'id_estado_buzzer', label: 'ID' },
            { key: 'id_buzzer', label: 'Buzzer' },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, { 'ACTIVO': { class: 'badge-success' }, 'INACTIVO': { class: 'badge-neutral' }, default: { class: 'badge-neutral' } }) },
            { key: 'activado_por', label: 'Activado por' },
            { key: 'motivo_variacion', label: 'Motivo', render: (v) => v || '—' },
            { key: 'fecha_hora', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
        ],
        data,
    });
}

async function loadComandos(container) {
    let [data, dispositivos] = await Promise.all([api.get('/comandos/'), api.get('/dispositivos/')]);
    data = Array.isArray(data) ? data : data?.results || [];
    dispositivos = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
    const dMap = {}; dispositivos.forEach(d => dMap[d.id_dispositivo] = d.nombre);

    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-cmd"><i data-lucide="plus"></i> Enviar Comando</button></div><div id="cmd-table"></div>`;
    if (window.lucide) lucide.createIcons();

    const addBtn = container?.querySelector('#btn-add-cmd');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const dOpts = dispositivos.map(d => `<option value="${d.id_dispositivo}">${d.nombre}</option>`).join('');
            openModal('Enviar Comando Remoto', `
                <div class="form-row"><div class="form-group"><label class="form-label">Dispositivo</label><select class="form-select" id="f-disp">${dOpts}</select></div><div class="form-group"><label class="form-label">Tipo Comando</label><input class="form-input" id="f-tipo" placeholder="REINICIAR, CONFIG..."></div></div>
                <div class="form-group"><label class="form-label">Payload (JSON)</label><textarea class="form-textarea" id="f-payload" placeholder='{"key": "value"}'>{}</textarea></div>
            `, async () => {
                let payload;
                try { payload = JSON.parse(document.getElementById('f-payload').value); } catch { payload = {}; }
                await api.post('/comandos/', { id_dispositivo: parseInt(document.getElementById('f-disp').value), id_usuario: 1, tipo_comando: document.getElementById('f-tipo').value, payload });
                showToast('Enviado', 'Comando enviado al dispositivo', 'success'); loadTab();
            });
        });
    }

    renderTable({
        containerId: 'cmd-table',
        columns: [
            { key: 'id_comando', label: 'ID' },
            { key: 'id_dispositivo', label: 'Dispositivo', render: (v) => dMap[v] || v },
            { key: 'tipo_comando', label: 'Tipo', render: (v) => `<span class="badge badge-info">${v}</span>` },
            { key: 'fecha_creacion', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
        ],
        data,
    });
}

async function loadRespuestas(container) {
    let data = await api.get('/respuestas-comandos/');
    data = Array.isArray(data) ? data : data?.results || [];
    container.innerHTML = '<div id="resp-table"></div>';
    renderTable({
        containerId: 'resp-table',
        columns: [
            { key: 'id_respuesta', label: 'ID' },
            { key: 'id_comando', label: 'Comando' },
            { key: 'codigo_respuesta', label: 'Código' },
            { key: 'exitoso', label: 'Éxito', render: (v) => v ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-danger">No</span>' },
            { key: 'mensaje', label: 'Mensaje', render: (v) => `<span class="truncate" style="max-width:200px;display:inline-block;">${v || '—'}</span>` },
            { key: 'fecha_respuesta', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
        ],
        data,
    });
}
