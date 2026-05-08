/* ========================================
   ROUTER.JS — Hash-based SPA Router
   ======================================== */

import { auth } from './auth.js';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.currentCleanup = null;
        window.addEventListener('hashchange', () => this.resolve());
    }

    register(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        if (window.location.hash === `#${path}`) {
            this.resolve(); // Force resolve if same path
        } else {
            window.location.hash = `#${path}`;
        }
    }

    resolve() {
        const hash = window.location.hash.slice(1) || '/login';

        // Auth guard
        if (hash !== '/login' && !auth.isAuthenticated()) {
            this.navigate('/login');
            return;
        }
        if (hash === '/login' && auth.isAuthenticated()) {
            this.navigate('/dashboard');
            return;
        }

        // Cleanup previous page
        if (this.currentCleanup) {
            this.currentCleanup();
            this.currentCleanup = null;
        }

        const handler = this.routes[hash];
        if (handler) {
            this.currentRoute = hash;
            try {
                this.currentCleanup = handler() || null;
            } catch (e) { 
                console.error(e); 
                const container = document.getElementById('main-content');
                if (container) {
                    container.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Error al cargar los datos. Revisa la conexión con el servidor.</p></div>';
                }
                if (window.lucide) lucide.createIcons();
            }
        } else {
            this.navigate('/dashboard');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

export const router = new Router();
