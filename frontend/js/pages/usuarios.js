/* ========================================
   USUARIOS.JS — Usuarios, Roles, Permisos (RBAC)
   ======================================== */

import { api } from '../api.js';
import { renderTable, renderBadge } from '../components/table.js';
import { openModal, confirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let activeTab = 'usuarios';

export function renderUsuarios() {
    const content = document.getElementById('main-content');
    const hash = window.location.hash;
    
    // Set initial tab based on route
    if (hash.includes('/roles')) activeTab = 'roles';
    else activeTab = 'usuarios';

    content.innerHTML = `
        <div class="page-header">
            <div class="page-header-info"><h1>Usuarios y Roles</h1><p>Administración de usuarios, roles y permisos del sistema</p></div>
        </div>
        <div class="tabs" id="user-tabs">
            <button class="tab-btn ${activeTab === 'usuarios' ? 'active' : ''}" data-tab="usuarios">Usuarios</button>
            <button class="tab-btn ${activeTab === 'roles' ? 'active' : ''}" data-tab="roles">Roles</button>
            <button class="tab-btn ${activeTab === 'asignaciones' ? 'active' : ''}" data-tab="asignaciones">Asignar Roles</button>
            <button class="tab-btn ${activeTab === 'recursos' ? 'active' : ''}" data-tab="recursos">Recursos (Menú)</button>
            <button class="tab-btn ${activeTab === 'permisos' ? 'active' : ''}" data-tab="permisos">Permisos</button>
        </div>
        <div id="user-content"></div>
    `;
    document.querySelectorAll('#user-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#user-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            loadTab();
        });
    });
    loadTab();
}

async function loadTab() {
    const container = document.getElementById('user-content');
    container.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
    try {
        if (activeTab === 'usuarios') await loadUsuarios(container);
        else if (activeTab === 'roles') await loadRoles(container);
        else if (activeTab === 'asignaciones') await loadAsignaciones(container);
        else if (activeTab === 'recursos') await loadRecursos(container);
        else if (activeTab === 'permisos') await loadPermisos(container);
    } catch (e) { 
        console.error(e); 
        container.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Error al cargar los datos. Revisa la conexión con el servidor.</p></div>';
        if (window.lucide) lucide.createIcons();
        showToast('Error', 'No se pudo conectar con el backend', 'error'); 
    }
}

async function loadUsuarios(container) {
    let data = await api.get('/usuarios/');
    data = Array.isArray(data) ? data : data?.results || [];

    if (container) container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-user"><i data-lucide="plus"></i> Nuevo Usuario</button></div><div id="users-table"></div>`;
    if (window.lucide) lucide.createIcons();

    const addBtn = container?.querySelector('#btn-add-user');
    if (addBtn) addBtn.addEventListener('click', () => openUserForm(null, data));

    renderTable({
        containerId: 'users-table',
        columns: [
            { key: 'idusuarios', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v, row) => `<strong style="color:var(--text-primary)">${v || ''} ${row.apellido || ''}</strong>` },
            { key: 'username', label: 'Usuario', render: (v) => `<code style="color:var(--primary);">@${v}</code>` },
        ],
        data,
        actions: [
            { name: 'edit', label: 'Editar', icon: 'pencil', idKey: 'idusuarios', handler: (id) => openUserForm(data.find(u => u.idusuarios == id), data) },
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'idusuarios', handler: (id) => { confirmModal('Eliminar Usuario', '¿Eliminar este usuario?', async () => { await api.delete(`/usuarios/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
        emptyIcon: 'users',
        emptyText: 'No hay usuarios registrados'
    });
}

function openUserForm(item, allData) {
    const isEdit = !!item;
    const body = `
        <div class="form-row"><div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre" value="${item?.nombre || ''}"></div><div class="form-group"><label class="form-label">Apellido</label><input class="form-input" id="f-apellido" value="${item?.apellido || ''}"></div></div>
        <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="f-username" value="${item?.username || ''}"></div>
        <div class="form-group"><label class="form-label">Contraseña${isEdit ? ' (dejar vacío para no cambiar)' : ''}</label><input class="form-input" id="f-password" type="password" placeholder="${isEdit ? '••••••••' : 'Contraseña'}"></div>
    `;
    openModal(isEdit ? 'Editar Usuario' : 'Nuevo Usuario', body, async () => {
        const payload = { nombre: document.getElementById('f-nombre').value, apellido: document.getElementById('f-apellido').value, username: document.getElementById('f-username').value };
        const pw = document.getElementById('f-password').value;
        if (pw) payload.password = pw;
        if (isEdit) await api.put(`/usuarios/${item.idusuarios}/`, payload);
        else await api.post('/usuarios/', payload);
        showToast(isEdit ? 'Actualizado' : 'Creado', `Usuario ${payload.username}`, 'success');
        loadTab();
    });
}

async function loadRoles(container) {
    let data = await api.get('/roles/');
    data = Array.isArray(data) ? data : data?.results || [];

    if (container) container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-rol"><i data-lucide="plus"></i> Nuevo Rol</button></div><div id="roles-table"></div>`;
    if (window.lucide) lucide.createIcons();

    const addBtn = container?.querySelector('#btn-add-rol');
    if (addBtn) addBtn.addEventListener('click', () => {
        openModal('Nuevo Rol', `
            <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre"></div>
            <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="1">Activo</option><option value="0">Inactivo</option></select></div>
        `, async () => {
            await api.post('/roles/', { nombre: document.getElementById('f-nombre').value, estado: parseInt(document.getElementById('f-estado').value) });
            showToast('Creado', 'Rol creado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'roles-table',
        columns: [
            { key: 'idrol', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'estado', label: 'Estado', render: (v) => v == 1 ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-neutral">Inactivo</span>' },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'idrol', handler: (id) => { confirmModal('Eliminar Rol', '¿Eliminar?', async () => { await api.delete(`/roles/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadAsignaciones(container) {
    let [data, roles] = await Promise.all([api.get('/usuario-roles/'), api.get('/roles/')]);
    data = Array.isArray(data) ? data : data?.results || [];
    roles = Array.isArray(roles) ? roles : roles?.results || [];
    const rMap = {}; roles.forEach(r => rMap[r.idrol] = r.nombre);

    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-ur"><i data-lucide="plus"></i> Asignar Rol</button></div><div id="ur-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-ur').addEventListener('click', () => {
        const rOpts = roles.map(r => `<option value="${r.idrol}">${r.nombre}</option>`).join('');
        openModal('Asignar Rol a Usuario', `
            <div class="form-group"><label class="form-label">ID Usuario</label><input class="form-input" id="f-uid" type="number"></div>
            <div class="form-group"><label class="form-label">Rol</label><select class="form-select" id="f-rol">${rOpts}</select></div>
        `, async () => {
            await api.post('/usuario-roles/', { usuario_idusuarios: parseInt(document.getElementById('f-uid').value), rol_idrol: parseInt(document.getElementById('f-rol').value) });
            showToast('Asignado', 'Rol asignado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'ur-table',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'usuario_idusuarios', label: 'Usuario ID' },
            { key: 'rol_idrol', label: 'Rol', render: (v) => rMap[v] || v },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id', handler: (id) => { confirmModal('Eliminar', '¿Quitar asignación?', async () => { await api.delete(`/usuario-roles/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadRecursos(container) {
    let data = await api.get('/recursos/');
    data = Array.isArray(data) ? data : data?.results || [];

    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-rec"><i data-lucide="plus"></i> Nuevo Recurso</button></div><div id="rec-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-rec').addEventListener('click', () => {
        openModal('Nuevo Recurso', `
            <div class="form-row"><div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="f-nombre"></div><div class="form-group"><label class="form-label">Path</label><input class="form-input" id="f-path" placeholder="/ruta"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Icono</label><input class="form-input" id="f-icono" placeholder="cpu, map..."></div><div class="form-group"><label class="form-label">Orden</label><input class="form-input" id="f-orden" type="number"></div></div>
            <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="f-estado"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
        `, async () => {
            await api.post('/recursos/', { nombre: document.getElementById('f-nombre').value, path: document.getElementById('f-path').value, icono: document.getElementById('f-icono').value, orden: document.getElementById('f-orden').value, estado: document.getElementById('f-estado').value });
            showToast('Creado', 'Recurso creado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'rec-table',
        columns: [
            { key: 'idRecursos', label: 'ID' },
            { key: 'nombre', label: 'Nombre', render: (v) => `<strong style="color:var(--text-primary)">${v}</strong>` },
            { key: 'path', label: 'Path' },
            { key: 'icono', label: 'Icono' },
            { key: 'orden', label: 'Orden' },
            { key: 'estado', label: 'Estado', render: (v) => renderBadge(v, { 'activo': { class: 'badge-success', text: 'Activo' }, 'inactivo': { class: 'badge-neutral', text: 'Inactivo' }, default: { class: 'badge-neutral' } }) },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'idRecursos', handler: (id) => { confirmModal('Eliminar', '¿Eliminar recurso?', async () => { await api.delete(`/recursos/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}

async function loadPermisos(container) {
    let [data, roles, recursos] = await Promise.all([api.get('/recurso-roles/'), api.get('/roles/'), api.get('/recursos/')]);
    data = Array.isArray(data) ? data : data?.results || [];
    roles = Array.isArray(roles) ? roles : roles?.results || [];
    recursos = Array.isArray(recursos) ? recursos : recursos?.results || [];
    const rMap = {}; roles.forEach(r => rMap[r.idrol] = r.nombre);
    const recMap = {}; recursos.forEach(r => recMap[r.idRecursos] = r.nombre);

    container.innerHTML = `<div class="page-header-actions" style="margin-bottom:var(--space-md);"><button class="btn btn-primary" id="btn-add-perm"><i data-lucide="plus"></i> Asignar Permiso</button></div><div id="perm-table"></div>`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-perm').addEventListener('click', () => {
        const rOpts = roles.map(r => `<option value="${r.idrol}">${r.nombre}</option>`).join('');
        const recOpts = recursos.map(r => `<option value="${r.idRecursos}">${r.nombre}</option>`).join('');
        openModal('Asignar Permiso', `
            <div class="form-group"><label class="form-label">Rol</label><select class="form-select" id="f-rol">${rOpts}</select></div>
            <div class="form-group"><label class="form-label">Recurso</label><select class="form-select" id="f-rec">${recOpts}</select></div>
        `, async () => {
            await api.post('/recurso-roles/', { rol_idrol: parseInt(document.getElementById('f-rol').value), recurso_idrecursos: parseInt(document.getElementById('f-rec').value) });
            showToast('Asignado', 'Permiso asignado', 'success'); loadTab();
        });
    });

    renderTable({
        containerId: 'perm-table',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'rol_idrol', label: 'Rol', render: (v) => rMap[v] || v },
            { key: 'recurso_idrecursos', label: 'Recurso', render: (v) => recMap[v] || v },
        ],
        data,
        actions: [
            { name: 'delete', label: 'Eliminar', icon: 'trash-2', idKey: 'id', handler: (id) => { confirmModal('Eliminar', '¿Quitar permiso?', async () => { await api.delete(`/recurso-roles/${id}/`); showToast('Eliminado', '', 'success'); loadTab(); }); }},
        ],
    });
}
