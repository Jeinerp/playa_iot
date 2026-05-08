/* ========================================
   DISPOSITIVOS.JS — CRUD Dispositivos IoT
   ======================================== */

import { api } from '../api.js';
import { renderTable, renderBadge } from '../components/table.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let data = [];
let zonas = [];

export function renderDispositivos() {
    const content = document.getElementById('main-content');
    if (!content) return;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Dispositivos IoT</h1><p>Gestión de estaciones y nodos de monitoreo</p></div>
            <div class="page-header-actions">
                <button class="btn btn-primary" id="btn-add-disp"><i data-lucide="plus"></i> Nuevo Dispositivo</button>
            </div>
        </div>
        <div id="disp-table">
            <div class="page-loader"><div class="spinner"></div></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    const addBtn = content.querySelector('#btn-add-disp');
    if (addBtn) addBtn.addEventListener('click', () => openForm());
    loadData();
}

async function loadData() {
    try {
        [data, zonas] = await Promise.all([api.get('/dispositivos/'), api.get('/zonas/')]);
        data = Array.isArray(data) ? data : data?.results || [];
        zonas = Array.isArray(zonas) ? zonas : zonas?.results || [];
        renderTableView();
    } catch (e) { showToast('Error', 'No se pudieron cargar los dispositivos', 'error'); }
}

function renderTableView() {
    const zonaMap = {};
    zonas.forEach(z => zonaMap[z.id_zona] = z.nombre);

    renderTable({
        containerId: 'disp-table',
        columns: [
            { key: 'id_dispositivo', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'id_zona', label: 'Zona', render: (v) => zonaMap[v] || v },
            { key: 'mac_address', label: 'MAC', render: (v) => `<code style="font-size:0.8rem;color:var(--primary);">${v}</code>` },
            { key: 'modelo', label: 'Modelo' },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, {
                'ACTIVO': { class: 'badge-success', text: 'Activo' },
                'INACTIVO': { class: 'badge-danger', text: 'Inactivo' },
                default: { class: 'badge-neutral' }
            })},
            { key: 'ip_actual', label: 'IP' },
        ],
        data,
        actions: [
            { name: 'edit', label: 'Editar', icon: 'pencil', idKey: 'id_dispositivo', handler: (id) => openForm(data.find(d => d.id_dispositivo == id)) },
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_dispositivo', handler: (id) => handleDelete(id) },
        ],
        emptyIcon: 'cpu',
        emptyText: 'No hay dispositivos registrados'
    });
}

function openForm(item = null) {
    const isEdit = !!item;
    const zonasOpts = zonas.map(z => `<option value="${z.id_zona}" ${item && item.id_zona == z.id_zona ? 'selected' : ''}>${z.nombre}</option>`).join('');
    const body = `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre" value="${item?.nombre || ''}" required></div>
            <div class="form-group"><label class="form-label">Zona</label><select class="form-select" id="f-zona"><option value="">Seleccionar...</option>${zonasOpts}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">MAC Address</label><input class="form-input" id="f-mac" value="${item?.mac_address || ''}" placeholder="AA:BB:CC:DD:EE:FF"></div>
            <div class="form-group"><label class="form-label">Modelo</label><input class="form-input" id="f-modelo" value="${item?.modelo || ''}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Firmware</label><input class="form-input" id="f-firmware" value="${item?.firmware_version || ''}"></div>
            <div class="form-group"><label class="form-label">IP Actual</label><input class="form-input" id="f-ip" value="${item?.ip_actual || ''}" placeholder="192.168.1.1"></div>
        </div>
        <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="ACTIVO" ${item?.estado === 'ACTIVO' ? 'selected' : ''}>Activo</option><option value="INACTIVO" ${item?.estado === 'INACTIVO' ? 'selected' : ''}>Inactivo</option></select></div>
    `;
    openModal(isEdit ? 'Editar Dispositivo' : 'Nuevo Dispositivo', body, async () => {
        const payload = {
            nombre: document.getElementById('f-nombre').value,
            id_zona: parseInt(document.getElementById('f-zona').value),
            mac_address: document.getElementById('f-mac').value,
            modelo: document.getElementById('f-modelo').value,
            firmware_version: document.getElementById('f-firmware').value,
            ip_actual: document.getElementById('f-ip').value,
            estado: document.getElementById('f-estado').value,
        };
        if (isEdit) await api.put(`/dispositivos/${item.id_dispositivo}/`, payload);
        else await api.post('/dispositivos/', payload);
        showToast(isEdit ? 'Actualizado' : 'Creado', `Dispositivo ${payload.nombre} ${isEdit ? 'actualizado' : 'creado'}`, 'success');
        loadData();
    });
}

async function handleDelete(id) {
    confirmModal('Eliminar Dispositivo', '¿Estás seguro? Esta acción no se puede deshacer.', async () => {
        await api.delete(`/dispositivos/${id}/`);
        showToast('Eliminado', 'Dispositivo eliminado correctamente', 'success');
        loadData();
    });
}
