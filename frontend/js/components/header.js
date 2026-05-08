/* ========================================
   HEADER.JS — Cabecera con Perfil de Usuario
   ======================================== */

import { auth } from '../auth.js';
import { api } from '../api.js';
import { openModal } from './modal.js';
import { showToast } from './toast.js';

export function renderHeader(title, subtitle) {
    const user = auth.getUser();
    const avatarText = user?.username ? user.username.substring(0, 2).toUpperCase() : 'US';
    
    return `
        <header class="header">
            <div class="header-left">
                <button class="header-icon-btn mobile-only" id="sidebar-toggle" style="margin-right: var(--space-md);">
                    <i data-lucide="menu" style="width:20px;height:20px;"></i>
                </button>
                <div class="header-titles">
                    <h2 class="header-title">${title}</h2>
                    <p class="header-subtitle">${subtitle}</p>
                </div>
            </div>
            <div class="header-actions">
                <button class="header-icon-btn" title="Notificaciones">
                    <i data-lucide="bell" style="width:20px;height:20px;"></i>
                </button>
                <div class="user-profile" id="header-user-profile">
                    <div class="user-avatar">${avatarText}</div>
                    <div class="user-info">
                        <span class="user-name">${user?.username || 'Usuario'}</span>
                        <span class="user-role">${auth.getRoles()[0]?.nombre || 'Usuario'}</span>
                    </div>
                    <i data-lucide="chevron-down" style="width:14px;height:14px;margin-left:4px;opacity:0.5;"></i>
                </div>
            </div>
        </header>
    `;
}

export function bindHeaderEvents() {
    const profileBtn = document.getElementById('header-user-profile');
    if (profileBtn) {
        profileBtn.addEventListener('click', openProfileModal);
    }

    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }
}

async function openProfileModal() {
    const user = auth.getUser();
    if (!user) return;

    const body = `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="p-nombre" value="${user.nombre || ''}"></div>
            <div class="form-group"><label class="form-label">Apellido</label><input class="form-input" id="p-apellido" value="${user.apellido || ''}"></div>
        </div>
        <div class="form-group">
            <label class="form-label">Username</label>
            <input class="form-input" id="p-username" value="${user.username || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Nueva Contraseña (dejar vacío para no cambiar)</label>
            <input class="form-input" id="p-password" type="password" placeholder="••••••••">
        </div>
        <p class="text-muted" style="font-size:0.8rem;margin-top:0.5rem;">ID de Usuario: #${user.idusuarios || user.id}</p>
    `;

    openModal('Mi Perfil', body, async () => {
        const payload = {
            nombre: document.getElementById('p-nombre').value,
            apellido: document.getElementById('p-apellido').value,
            username: document.getElementById('p-username').value
        };
        const pw = document.getElementById('p-password').value;
        if (pw) payload.password = pw;

        try {
            // Usamos el ID del usuario actual. En Django REST Framework suele ser /usuarios/pk/
            const userId = user.idusuarios || user.id;
            const updatedUser = await api.put(`/usuarios/${userId}/`, payload);
            
            // Actualizar el usuario en la sesión local
            const currentUser = auth.getUser();
            const newUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUser));
            
            showToast('Perfil Actualizado', 'Tus datos se han guardado con éxito', 'success');
            
            // Recargar la página para ver los cambios en el header
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error(err);
            showToast('Error', 'No se pudo actualizar el perfil', 'error');
        }
    });
}
