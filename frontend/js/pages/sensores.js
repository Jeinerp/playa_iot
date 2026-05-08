/* ========================================
   SENSORES.JS — CRUD Sensores
   ======================================== */

import { api } from '../api.js';
import { renderTable, renderBadge } from '../components/table.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let sensores = [], dispositivos = [], tiposVar = [];

export function renderSensores() {
    const content = document.getElementById('main-content');
    if (!content) return;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Sensores</h1><p>Gestión de sensores instalados en dispositivos</p></div>
            <div class="page-header-actions">
                <button class="btn btn-primary" id="btn-add-sensor"><i data-lucide="plus"></i> Nuevo Sensor</button>
            </div>
        </div>
        <div id="sensor-table">
            <div class="page-loader"><div class="spinner"></div></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    const addBtn = content.querySelector('#btn-add-sensor');
    if (addBtn) addBtn.addEventListener('click', () => openForm());
    loadData();
}

async function loadData() {
    try {
        [sensores, dispositivos, tiposVar] = await Promise.all([api.get('/sensores/'), api.get('/dispositivos/'), api.get('/tipos-variables/')]);
        sensores = Array.isArray(sensores) ? sensores : sensores?.results || [];
        dispositivos = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
        tiposVar = Array.isArray(tiposVar) ? tiposVar : tiposVar?.results || [];
        renderTableView();
    } catch (e) { showToast('Error', 'No se pudieron cargar los sensores', 'error'); }
}

function renderTableView() {
    const dispMap = {}; dispositivos.forEach(d => dispMap[d.id_dispositivo] = d.nombre);
    const tvMap = {}; tiposVar.forEach(t => tvMap[t.id_tipo_variable] = `${t.nombre} (${t.simbolo || t.unidad_medida})`);

    renderTable({
        containerId: 'sensor-table',
        columns: [
            { key: 'id_sensor', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'id_dispositivo', label: 'Dispositivo', render: (v) => dispMap[v] || v },
            { key: 'id_tipo_variable', label: 'Variable', render: (v) => tvMap[v] || v },
            { key: 'modelo', label: 'Modelo' },
            { key: 'pin_conexion', label: 'Pin', render: (v) => `<code style="color:var(--accent);">${v}</code>` },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, {
                'ACTIVO': { class: 'badge-success', text: 'Activo' },
                'INACTIVO': { class: 'badge-danger', text: 'Inactivo' },
                default: { class: 'badge-neutral' }
            })},
        ],
        data: sensores,
        actions: [
            { name: 'edit', label: 'Editar', icon: 'pencil', idKey: 'id_sensor', handler: (id) => openForm(sensores.find(s => s.id_sensor == id)) },
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id_sensor', handler: (id) => handleDelete(id) },
        ],
        emptyIcon: 'thermometer',
        emptyText: 'No hay sensores registrados'
    });
}

function openForm(item = null) {
    const isEdit = !!item;
    const dispOpts = dispositivos.map(d => `<option value="${d.id_dispositivo}" ${item?.id_dispositivo == d.id_dispositivo ? 'selected' : ''}>${d.nombre}</option>`).join('');
    const tvOpts = tiposVar.map(t => `<option value="${t.id_tipo_variable}" ${item?.id_tipo_variable == t.id_tipo_variable ? 'selected' : ''}>${t.nombre}</option>`).join('');

    const body = `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre" value="${item?.nombre || ''}"></div>
            <div class="form-group"><label class="form-label">Modelo</label><input class="form-input" id="f-modelo" value="${item?.modelo || ''}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Dispositivo</label><select class="form-select" id="f-disp"><option value="">Seleccionar...</option>${dispOpts}</select></div>
            <div class="form-group"><label class="form-label">Tipo de Variable</label><select class="form-select" id="f-tv"><option value="">Seleccionar...</option>${tvOpts}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Pin Conexión</label><input class="form-input" id="f-pin" value="${item?.pin_conexion || ''}" placeholder="A0, D1..."></div>
            <div class="form-group"><label class="form-label">Fecha Instalación</label><input class="form-input" id="f-fecha" type="date" value="${item?.fecha_instalacion || ''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="ACTIVO" ${item?.estado === 'ACTIVO' ? 'selected' : ''}>Activo</option><option value="INACTIVO" ${item?.estado === 'INACTIVO' ? 'selected' : ''}>Inactivo</option></select></div>
    `;
    openModal(isEdit ? 'Editar Sensor' : 'Nuevo Sensor', body, async () => {
        const payload = {
            nombre: document.getElementById('f-nombre').value,
            modelo: document.getElementById('f-modelo').value,
            id_dispositivo: parseInt(document.getElementById('f-disp').value),
            id_tipo_variable: parseInt(document.getElementById('f-tv').value),
            pin_conexion: document.getElementById('f-pin').value,
            fecha_instalacion: document.getElementById('f-fecha').value,
            estado: document.getElementById('f-estado').value,
        };
        if (isEdit) await api.put(`/sensores/${item.id_sensor}/`, payload);
        else await api.post('/sensores/', payload);
        showToast(isEdit ? 'Actualizado' : 'Creado', `Sensor ${payload.nombre} ${isEdit ? 'actualizado' : 'creado'}`, 'success');
        loadData();
    });
}

async function handleDelete(id) {
    confirmModal('Eliminar Sensor', '¿Estás seguro? Se eliminarán las lecturas asociadas.', async () => {
        await api.delete(`/sensores/${id}/`);
        showToast('Eliminado', 'Sensor eliminado correctamente', 'success');
        loadData();
    });
}
