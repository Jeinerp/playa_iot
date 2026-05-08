/* ========================================
   API.JS — Centralized HTTP Service
   ======================================== */

const API_BASE = '/api';

class ApiService {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.request(endpoint, options);
                }
                window.location.hash = '#/login';
                const err = new Error('Unauthorized');
                err.status = 401;
                throw err;
            }

            if (response.status === 204) return null;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(`HTTP ${response.status}`);
                error.data = errorData;
                error.status = response.status;
                throw error;
            }

            return await response.json();
        } catch (err) {
            if (err.status) throw err;
            console.error('API Error:', err);
            throw err;
        }
    }

    get(endpoint) {
        return this.request(endpoint);
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;

        try {
            const response = await fetch(`${API_BASE}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                return true;
            }
        } catch (e) {
            console.error('Token refresh failed:', e);
        }

        localStorage.clear();
        return false;
    }
}

export const api = new ApiService();
