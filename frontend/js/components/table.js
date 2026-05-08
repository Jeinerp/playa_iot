/* ========================================
   TABLE.JS — Reusable Data Table
   ======================================== */

export function renderTable({ containerId, columns, data, actions = [], searchable = true, emptyIcon = 'inbox', emptyText = 'No se encontraron registros' }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = [...data];
    let searchTerm = '';

    function render() {
        let displayData = filtered;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            displayData = filtered.filter(row =>
                columns.some(col => {
                    const val = col.render ? '' : String(row[col.key] || '');
                    return val.toLowerCase().includes(term);
                })
            );
        }

        container.innerHTML = `
            <div class="table-container">
                ${searchable ? `
                <div class="table-toolbar">
                    <div class="table-search">
                        <i data-lucide="search"></i>
                        <input type="text" id="${containerId}-search" placeholder="Buscar..." value="${searchTerm}">
                    </div>
                    <div class="text-sm text-muted">${displayData.length} registros</div>
                </div>` : ''}
                ${displayData.length > 0 ? `
                <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.label}</th>`).join('')}
                            ${actions.length > 0 ? '<th style="width:120px;">Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${displayData.map((row, idx) => `
                            <tr style="animation: fadeIn 0.2s ease ${idx * 0.03}s both;">
                                ${columns.map(col => `<td>${col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>`).join('')}
                                ${actions.length > 0 ? `
                                <td>
                                    <div class="table-actions">
                                        ${actions.map(act => `
                                            <button class="btn-icon" title="${act.label}" data-action="${act.name}" data-id="${row[act.idKey || 'id']}">
                                                <i data-lucide="${act.icon}" style="width:15px;height:15px;"></i>
                                            </button>
                                        `).join('')}
                                    </div>
                                </td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>` : `
                <div class="empty-state">
                    <i data-lucide="${emptyIcon}"></i>
                    <p>${emptyText}</p>
                </div>`}
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        // Bind search
        const searchInput = document.getElementById(`${containerId}-search`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                render();
            });
            searchInput.focus();
            searchInput.setSelectionRange(searchTerm.length, searchTerm.length);
        }

        // Bind actions
        actions.forEach(act => {
            container.querySelectorAll(`[data-action="${act.name}"]`).forEach(btn => {
                btn.addEventListener('click', () => act.handler(btn.dataset.id));
            });
        });
    }

    render();
    return { refresh: (newData) => { filtered = [...newData]; render(); } };
}

export function renderBadge(value, map) {
    const config = map[value] || map['default'] || { class: 'badge-neutral', text: value };
    return `<span class="badge ${config.class}">${config.text || value}</span>`;
}
