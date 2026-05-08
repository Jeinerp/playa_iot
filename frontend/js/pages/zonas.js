/* ========================================
   ZONAS.JS — CRUD Zonas de Monitoreo
   ======================================== */

import { api } from '../api.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let zonas = [];
let dispositivos = [];

export function renderZonas() {
    const content = document.getElementById('main-content');
    if (!content) return;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Zonas de Monitoreo</h1><p>Ubicaciones geográficas de los dispositivos</p></div>
            <div class="page-header-actions">
                <button class="btn btn-primary" id="btn-add-zona"><i data-lucide="plus"></i> Nueva Zona</button>
            </div>
        </div>
        <div id="zona-grid" class="zona-grid">
            <div class="skeleton skeleton-card" style="height:180px;"></div>
            <div class="skeleton skeleton-card" style="height:180px;"></div>
            <div class="skeleton skeleton-card" style="height:180px;"></div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    const addBtn = content.querySelector('#btn-add-zona');
    if (addBtn) addBtn.addEventListener('click', () => openForm());
    loadData();
}

async function loadData() {
    try {
        [zonas, dispositivos] = await Promise.all([api.get('/zonas/'), api.get('/dispositivos/')]);
        zonas = Array.isArray(zonas) ? zonas : zonas?.results || [];
        dispositivos = Array.isArray(dispositivos) ? dispositivos : dispositivos?.results || [];
        renderCards();
    } catch (e) { showToast('Error', 'No se pudieron cargar las zonas', 'error'); }
}

function renderCards() {
    const grid = document.getElementById('zona-grid');
    if (zonas.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="map"></i><p>No hay zonas registradas</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }
    grid.innerHTML = zonas.map((z, i) => {
        const dispCount = dispositivos.filter(d => d.id_zona === z.id_zona).length;
        return `
        <div class="zona-card" style="animation-delay:${i * 0.05}s;">
            <div class="zona-card-header">
                <h3>${z.nombre}</h3>
                <div class="table-actions">
                    <button class="btn-icon btn-edit-zona" data-id="${z.id_zona}" title="Editar"><i data-lucide="pencil" style="width:15px;height:15px;"></i></button>
                    <button class="btn-icon btn-del-zona" data-id="${z.id_zona}" title="Eliminar"><i data-lucide="trash-2" style="width:15px;height:15px;"></i></button>
                </div>
            </div>
            ${z.descripcion ? `<p class="text-sm text-muted" style="margin-bottom:var(--space-sm);">${z.descripcion}</p>` : ''}
            <div class="zona-coords">
                <span><i data-lucide="navigation" style="width:12px;height:12px;"></i> Lat: ${z.latitud}</span>
                <span><i data-lucide="navigation" style="width:12px;height:12px;"></i> Lon: ${z.longitud}</span>
            </div>
            <div class="zona-stats">
                <div class="zona-stat"><div class="zona-stat-value">${dispCount}</div><div class="zona-stat-label">Dispositivos</div></div>
                <div class="zona-stat"><div class="zona-stat-value" style="color:var(--accent);">${z.fecha_creacion ? new Date(z.fecha_creacion).toLocaleDateString('es-CO') : '—'}</div><div class="zona-stat-label">Creación</div></div>
            </div>
        </div>`;
    }).join('');
    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.btn-edit-zona').forEach(btn => btn.addEventListener('click', () => openForm(zonas.find(z => z.id_zona == btn.dataset.id))));
    document.querySelectorAll('.btn-del-zona').forEach(btn => btn.addEventListener('click', () => handleDelete(btn.dataset.id)));
}

function openForm(item = null) {
    const isEdit = !!item;
    const body = `
        <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre" value="${item?.nombre || ''}"></div>
        <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-textarea" id="f-desc">${item?.descripcion || ''}</textarea></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Latitud</label><input class="form-input" id="f-lat" type="number" step="0.0000001" value="${item?.latitud || ''}"></div>
            <div class="form-group"><label class="form-label">Longitud</label><input class="form-input" id="f-lon" type="number" step="0.0000001" value="${item?.longitud || ''}"></div>
        </div>
    `;
    openModal(isEdit ? 'Editar Zona' : 'Nueva Zona', body, async () => {
        const payload = {
            nombre: document.getElementById('f-nombre').value,
            descripcion: document.getElementById('f-desc').value,
            latitud: document.getElementById('f-lat').value,
            longitud: document.getElementById('f-lon').value,
        };
        if (isEdit) await api.put(`/zonas/${item.id_zona}/`, payload);
        else await api.post('/zonas/', payload);
        showToast(isEdit ? 'Actualizada' : 'Creada', `Zona ${payload.nombre} ${isEdit ? 'actualizada' : 'creada'}`, 'success');
        loadData();
    });
}

async function handleDelete(id) {
    confirmModal('Eliminar Zona', '¿Estás seguro? Se eliminarán los dispositivos asociados.', async () => {
        await api.delete(`/zonas/${id}/`);
        showToast('Eliminada', 'Zona eliminada correctamente', 'success');
        loadData();
    });
}
