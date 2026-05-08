/* ========================================
   LOGIN.JS — Login Page
   ======================================== */

import { auth } from '../auth.js';
import { router } from '../router.js';

export function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login-layout">
            <div class="login-card">
                <div class="login-logo">
                    <div class="login-logo-icon">
                        <i data-lucide="activity"></i>
                    </div>
                    <h1>MonitoreoIoT</h1>
                    <p>Sistema de Monitoreo Ambiental</p>
                </div>
                <div class="login-error" id="login-error">
                    <i data-lucide="alert-circle" style="width:16px;height:16px;flex-shrink:0;"></i>
                    <span id="login-error-msg">Error</span>
                </div>
                <form class="login-form" id="login-form">
                    <div class="form-group">
                        <label class="form-label">Usuario</label>
                        <input type="text" class="form-input" id="login-username" placeholder="Ingresa tu usuario" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contraseña</label>
                        <div class="password-input-wrapper">
                            <input type="password" class="form-input" id="login-password" placeholder="Ingresa tu contraseña" autocomplete="current-password" required>
                            <button type="button" class="password-toggle" id="password-toggle" title="Mostrar/Ocultar contraseña">
                                <i data-lucide="eye"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary login-btn" id="login-submit">
                        <i data-lucide="log-in"></i> Iniciar Sesión
                    </button>
                </form>
                <div class="login-footer">
                    <p>© 2026 MonitoreoIoT — Proyecto Académico</p>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-submit');
        const errorDiv = document.getElementById('login-error');
        const errorMsg = document.getElementById('login-error-msg');

        if (!username || !password) {
            errorDiv.classList.add('show');
            errorMsg.textContent = 'Por favor completa todos los campos';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Ingresando...';
        errorDiv.classList.remove('show');

        try {
            await auth.login(username, password);
            router.navigate('/dashboard');
        } catch (err) {
            errorDiv.classList.add('show');
            errorMsg.textContent = 'Usuario o contraseña incorrectos';
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="log-in"></i> Iniciar Sesión';
            if (window.lucide) lucide.createIcons();
        }
    });

    const passwordInput = document.getElementById('login-password');
    const passwordToggle = document.getElementById('password-toggle');
    
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update icon
        const iconName = type === 'password' ? 'eye' : 'eye-off';
        passwordToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (window.lucide) lucide.createIcons();
    });

    document.getElementById('login-username').focus();
}
