/* ========================================
   AUTH.JS — Authentication Service
   ======================================== */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class AuthService {
    async login(username, password) {
        const response = await fetch(`${API_BASE}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const err = new Error('Credenciales incorrectas');
            err.status = response.status;
            throw err;
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('roles', JSON.stringify(data.roles));
        localStorage.setItem('recursos', JSON.stringify(data.recursos));
        return data;
    }

    logout() {
        localStorage.clear();
        window.location.hash = '#/login';
    }

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }

    getUser() {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    }

    getRoles() {
        try { return JSON.parse(localStorage.getItem('roles') || '[]'); }
        catch { return []; }
    }

    getRecursos() {
        try { return JSON.parse(localStorage.getItem('recursos') || '[]'); }
        catch { return []; }
    }

    getUserInitials() {
        const user = this.getUser();
        const name = user.nombre || user.username || 'U';
        return name.substring(0, 2).toUpperCase();
    }

    getRoleName() {
        const roles = this.getRoles();
        return roles.length > 0 ? roles[0].nombre : 'Usuario';
    }
}

export const auth = new AuthService();
