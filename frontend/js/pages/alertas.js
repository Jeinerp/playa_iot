/* ========================================
   ALERTAS.JS — Alertas, Umbrales y Estados Ambientales
   ======================================== */

import { api } from '../api.js';
import { renderTable, renderBadge } from '../components/table.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let activeTab = 'alertas';

export function renderAlertas() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Alertas y Umbrales</h1><p>Gestión de alertas, umbrales y estados ambientales</p></div>
        </div>
        <div class="tabs" id="alertas-tabs">
            <button class="tab-btn active" data-tab="alertas">Alertas</button>
            <button class="tab-btn" data-tab="umbrales">Umbrales</button>
            <button class="tab-btn" data-tab="estados">Estados Ambientales</button>
            <button class="tab-btn" data-tab="tipos">Tipos de Variables</button>
        </div>
        <div id="alertas-content"></div>
    `;
    document.querySelectorAll('#alertas-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#alertas-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            loadTab();
        });
    });
    loadTab();
}

async function loadTab() {
    const container = document.getElementById('alertas-content');
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
    try {
        if (activeTab === 'alertas') await loadAlertas(container);
        else if (activeTab === 'umbrales') await loadUmbrales(container);
        else if (activeTab === 'estados') await loadEstados(container);
        else if (activeTab === 'tipos') await loadTipos(container);
    } catch (e) { showToast('Error', 'Error al cargar datos', 'error'); }
}

async function loadAlertas(container) {
    let data = await api.get('/alertas/');
    data = Array.isArray(data) ? data : data?.results || [];
    container.innerHTML = '<div id="alertas-table"></div>';
    renderTable({
        containerId: 'alertas-table',
        columns: [
            { key: 'id_alerta', label: 'ID' },
            { key: 'titulo', label: 'Título', render: (v) => `<strong style="color:var(--text-primary)">${v || '—'}</strong>` },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, {
                'PENDIENTE': { class: 'badge-warning', text: 'Pendiente' },
                'VISTA': { class: 'badge-info', text: 'Vista' },
                'RESUELTA': { class: 'badge-success', text: 'Resuelta' },
                default: { class: 'badge-neutral' }
            })},
            { key: 'mensaje', label: 'Mensaje', render: (v) => `<span class="truncate" style="max-width:200px;display:inline-block;">${v || '—'}</span>` },
            { key: 'fecha_generacion', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-CO') : '—' },
        ],
        data,
        actions: [
            { name: 'resolve', label: 'Resolver', icon: 'check-circle', idKey: 'id_alerta', handler: async (id) => {
                await api.patch(`/alertas/${id}/`, { estado: 'RESUELTA' });
                showToast('Resuelta', 'Alerta marcada como resuelta', 'success');
                loadTab();
            }},
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_alerta', handler: (id) => {
                confirmModal('Eliminar Alerta', '¿Eliminar esta alerta?', async () => {
                    await api.delete(`/alertas/${id}/`);
                    showToast('Eliminada', 'Alerta eliminada', 'success');
                    loadTab();
                });
            }},
        ],
        emptyIcon: 'alert-triangle',
        emptyText: 'No hay alertas registradas'
    });
}

async function loadUmbrales(container) {
    let [data, tiposVar, estados] = await Promise.all([api.get('/umbrales/'), api.get('/tipos-variables/'), api.get('/estados-ambientales/')]);
    data = Array.isArray(data) ? data : data?.results || [];
    tiposVar = Array.isArray(tiposVar) ? tiposVar : tiposVar?.results || [];
    estados = Array.isArray(estados) ? estados : estados?.results || [];
    const tvMap = {}; tiposVar.forEach(t => tvMap[t.id_tipo_variable] = t.nombre);
    const eMap = {}; estados.forEach(e => eMap[e.id_estado_ambiental] = e.nombre);

    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-umbral"><i data-lucide="plus"></i> Nuevo Umbral</button></div><div id="umbrales-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-umbral').addEventListener('click', () => {
        const tvOpts = tiposVar.map(t => `<option value="${t.id_tipo_variable}">${t.nombre}</option>`).join('');
        const eOpts = estados.map(e => `<option value="${e.id_estado_ambiental}">${e.nombre}</option>`).join('');
        openModal('Nuevo Umbral', `
            <div class="form-row"><div class="form-group"><label class="form-label">Tipo Variable</label><select class="form-select" id="f-tv">${tvOpts}</select></div><div class="form-group"><label class="form-label">Estado Ambiental</label><select class="form-select" id="f-ea">${eOpts}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Valor Mínimo</label><input class="form-input" id="f-min" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Valor Máximo</label><input class="form-input" id="f-max" type="number" step="0.01"></div></div>
        `, async () => {
            await api.post('/umbrales/', { id_tipo_variable: parseInt(document.getElementById('f-tv').value), id_estado_ambiental: parseInt(document.getElementById('f-ea').value), valor_minimo: document.getElementById('f-min').value, valor_maximo: document.getElementById('f-max').value, activo: true });
            showToast('Creado', 'Umbral creado exitosamente', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'umbrales-table',
        columns: [
            { key: 'id_umbral', label: 'ID' },
            { key: 'id_tipo_variable', label: 'Variable', render: (v) => tvMap[v] || v },
            { key: 'id_estado_ambiental', label: 'Estado', render: (v) => eMap[v] || v },
            { key: 'valor_minimo', label: 'Mín' },
            { key: 'valor_maximo', label: 'Máx' },
            { key: 'activo', label: 'Activo', render: (v) => v ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-neutral">No</span>' },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_umbral', handler: (id) => { confirmModal('Eliminar Umbral', '¿Eliminar?', async () => { await api.delete(`/umbrales/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadEstados(container) {
    let data = await api.get('/estados-ambientales/');
    data = Array.isArray(data) ? data : data?.results || [];
    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-ea"><i data-lucide="plus"></i> Nuevo Estado</button></div><div id="estados-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-ea').addEventListener('click', () => {
        openModal('Nuevo Estado Ambiental', `
            <div class="form-row"><div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre"></div><div class="form-group"><label class="form-label">Nivel</label><input class="form-input" id="f-nivel"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Color</label><input class="form-input" id="f-color" placeholder="verde, rojo..."></div><div class="form-group"><label class="form-label">Prioridad</label><input class="form-input" id="f-prio" type="number"></div></div>
        `, async () => {
            await api.post('/estados-ambientales/', { nombre: document.getElementById('f-nombre').value, nivel: document.getElementById('f-nivel').value, color_referencia: document.getElementById('f-color').value, prioridad: parseInt(document.getElementById('f-prio').value) });
            showToast('Creado', 'Estado ambiental creado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'estados-table',
        columns: [
            { key: 'id_estado_ambiental', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'nivel', label: 'Nivel' },
            { key: 'color_referencia', label: 'Color', render: (v) => `<span class="chip"><span style="width:10px;height:10px;border-radius:50%;background:${v};display:inline-block;"></span> ${v}</span>` },
            { key: 'prioridad', label: 'Prioridad' },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_estado_ambiental', handler: (id) => { confirmModal('Eliminar', '¿Eliminar?', async () => { await api.delete(`/estados-ambientales/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadTipos(container) {
    let data = await api.get('/tipos-variables/');
    data = Array.isArray(data) ? data : data?.results || [];
    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-tv"><i data-lucide="plus"></i> Nuevo Tipo</button></div><div id="tipos-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-tv').addEventListener('click', () => {
        openModal('Nuevo Tipo de Variable', `
            <div class="form-row"><div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre" placeholder="Temperatura"></div><div class="form-group"><label class="form-label">Unidad</label><input class="form-input" id="f-unidad" placeholder="°C"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Símbolo</label><input class="form-input" id="f-simb" placeholder="°C"></div><div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></div></div>
        `, async () => {
            await api.post('/tipos-variables/', { nombre: document.getElementById('f-nombre').value, unidad_medida: document.getElementById('f-unidad').value, simbolo: document.getElementById('f-simb').value, estado: document.getElementById('f-estado').value });
            showToast('Creado', 'Tipo de variable creado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'tipos-table',
        columns: [
            { key: 'id_tipo_variable', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'unidad_medida', label: 'Unidad' },
            { key: 'simbolo', label: 'Símbolo' },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, { 'ACTIVO': { class: 'badge-success', text: 'Activo' }, 'INACTIVO': { class: 'badge-danger', text: 'Inactivo' }, default: { class: 'badge-neutral' } }) },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_tipo_variable', handler: (id) => { confirmModal('Eliminar', '¿Eliminar?', async () => { await api.delete(`/tipos-variables/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}
