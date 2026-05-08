/* ========================================
   MODAL.JS — Reusable Modal Component
   ======================================== */

export function openModal(title, bodyHTML, onSave = null, saveText = 'Guardar') {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
        <div class="modal-overlay" id="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" id="modal-close-btn">
                        <i data-lucide="x" style="width:18px;height:18px;"></i>
                    </button>
                </div>
                <div class="modal-body">${bodyHTML}</div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
                    ${onSave ? `<button class="btn btn-primary" id="modal-save-btn"><i data-lucide="check"></i> ${saveText}</button>` : ''}
                </div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();

    const close = () => { container.innerHTML = ''; };
    document.getElementById('modal-close-btn').addEventListener('click', close);
    document.getElementById('modal-cancel-btn').addEventListener('click', close);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') close();
    });

    if (onSave) {
        document.getElementById('modal-save-btn').addEventListener('click', async () => {
            const btn = document.getElementById('modal-save-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Guardando...';
            try {
                await onSave();
                close();
            } catch (err) {
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="check"></i> ${saveText}`;
                if (window.lucide) lucide.createIcons();
            }
        });
    }

    return close;
}

export function closeModal() {
    document.getElementById('modal-container').innerHTML = '';
}

export function confirmModal(title, message, onConfirm) {
    const body = `<p style="color:var(--text-secondary);font-size:0.9rem;">${message}</p>`;
    openModal(title, body, onConfirm, 'Confirmar');
}
