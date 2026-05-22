(function () {
    const phases = ['prospeccao', 'negociacao', 'fechado', 'followup', 'perdido'];

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeText(value, fallback = '') {
        const normalized = String(value ?? fallback).trim();
        return escapeHTML(normalized || fallback);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function render(clients) {
        const list = Array.isArray(clients) ? clients : [];

        phases.forEach(phase => {
            const container = document.getElementById(`kanban-${phase}`);
            const count = document.getElementById(`count-${phase}`);
            if (!container) return;

            const phaseClients = list.filter(client => client.phase === phase);
            if (count) count.textContent = phaseClients.length;

            if (!phaseClients.length) {
                container.innerHTML = '<p class="text-vx-muted text-sm text-center py-4">Nenhum cliente</p>';
                return;
            }

            container.innerHTML = phaseClients.map(client => `
                <div class="kanban-card bg-vx-darker rounded-xl p-4 border border-vx-border cursor-grab hover:border-vx-purple transition-all" draggable="false" data-id="${safeText(client.id)}">
                    <p class="font-medium mb-2">${safeText(client.name)}</p>
                    <p class="text-sm text-vx-muted mb-3">${safeText(client.contact)}</p>
                    <div class="flex items-center justify-between">
                        <span class="font-display font-bold gradient-text">${formatCurrency(client.value)}</span>
                        <span class="text-xs text-vx-muted">${safeText(client.months)} meses</span>
                    </div>
                </div>
            `).join('');
        });
    }

    window.VXKanbanPage = {
        phases,
        render
    };
})();
