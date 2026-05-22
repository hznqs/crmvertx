(function () {
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

    function safeId(value) {
        return encodeURIComponent(String(value ?? ''));
    }

    function formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(`${dateValue}T12:00:00`);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    }

    function deliveryTypeLabel(type) {
        const labels = {
            'posts-pendentes': 'Posts Pendentes',
            'posts-aprovados': 'Posts Aprovados',
            roteiros: 'Roteiros',
            'landing-pages': 'Landing Pages',
            campanhas: 'Campanhas',
            criativos: 'Criativos'
        };
        return labels[type] || type;
    }

    function clientName(clients, clientId) {
        return clients.find(client => client.id === clientId)?.name || 'Cliente removido';
    }

    function renderPagination(containerId, pageInfo, handlerName, label = 'registro') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const current = Number(pageInfo?.number || 0);
        const totalPages = Math.max(Number(pageInfo?.totalPages || 1), 1);
        const totalElements = Number(pageInfo?.totalElements || 0);
        container.innerHTML = `
            <span>${totalElements} ${label}${totalElements === 1 ? '' : 's'} · pagina ${current + 1} de ${totalPages}</span>
            <div class="pagination-bar__actions">
                <button type="button" ${current <= 0 ? 'disabled' : ''} onclick="${handlerName}(${current - 1})">Anterior</button>
                <button type="button" ${current >= totalPages - 1 ? 'disabled' : ''} onclick="${handlerName}(${current + 1})">Proxima</button>
            </div>
        `;
    }

    function populateClientFilter(clients) {
        const select = document.getElementById('deliveries-client-filter');
        if (!select) return;

        const currentValue = select.value || '';
        select.innerHTML = '<option value="">Todos os clientes</option>' +
            clients.map(client => `<option value="${safeText(client.id)}">${safeText(client.name)}</option>`).join('');
        if ([...select.options].some(option => option.value === currentValue)) {
            select.value = currentValue;
        }
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function render(context) {
        const board = document.getElementById('deliveries-board');
        if (!board) return;

        const deliveries = Array.isArray(context.deliveries) ? context.deliveries : [];
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const summary = context.summary || null;
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: deliveries.length };

        populateClientFilter(clients);

        const selectedClientId = document.getElementById('deliveries-client-filter')?.value || '';
        const visibleDeliveries = selectedClientId
            ? deliveries.filter(delivery => delivery.clientId === selectedClientId)
            : deliveries;

        const today = new Date().toISOString().split('T')[0];
        setText('deliveries-pending', summary?.pending ?? visibleDeliveries.filter(delivery => delivery.status === 'pendente').length);
        setText('deliveries-production', summary?.production ?? visibleDeliveries.filter(delivery => delivery.status === 'producao').length);
        setText('deliveries-approved', summary?.approved ?? visibleDeliveries.filter(delivery => delivery.status === 'aprovado').length);
        setText('deliveries-late', summary?.late ?? visibleDeliveries.filter(delivery => delivery.deadline < today && delivery.status !== 'aprovado').length);

        const columns = [
            { id: 'pendente', title: 'Pendente', color: 'bg-yellow-500' },
            { id: 'producao', title: 'Em Producao', color: 'bg-blue-500' },
            { id: 'revisao', title: 'Em Revisao', color: 'bg-vx-pink' },
            { id: 'aprovado', title: 'Aprovado', color: 'bg-green-500' }
        ];

        board.innerHTML = columns.map(column => {
            const items = visibleDeliveries.filter(delivery => delivery.status === column.id);
            return `
                <div class="delivery-column bg-vx-card rounded-2xl border border-vx-border p-4 min-h-[360px] transition-all" data-status="${column.id}">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full ${column.color}"></div>
                        <h3 class="font-display font-bold">${column.title}</h3>
                        <span class="ml-auto bg-vx-border px-2 py-1 rounded-full text-xs">${items.length}</span>
                    </div>
                    <div class="delivery-dropzone space-y-3 min-h-[260px]">
                        ${items.length === 0 ? '<p class="text-vx-muted text-sm text-center py-4">Arraste uma entrega para ca</p>' : items.map(item => `
                            <div class="delivery-card bg-vx-darker rounded-xl p-4 border border-vx-border hover:border-vx-purple transition-all cursor-grab" draggable="false" data-id="${safeText(item.id)}">
                                <div class="flex items-start justify-between gap-3 mb-2">
                                    <p class="font-medium">${safeText(item.title)}</p>
                                    <span class="text-xs px-2 py-1 rounded-full bg-vx-purple/20 text-vx-pink">${safeText(deliveryTypeLabel(item.type))}</span>
                                </div>
                                <p class="text-sm text-vx-muted">${safeText(clientName(clients, item.clientId))}</p>
                                <div class="flex items-center justify-between mt-3 text-xs">
                                    <span>Resp: ${safeText(item.owner)}</span>
                                    <span class="${item.deadline < today && item.status !== 'aprovado' ? 'text-red-400' : 'text-vx-muted'}">${formatDate(item.deadline)}</span>
                                </div>
                                <div class="flex gap-2 mt-4">
                                    <button onclick="openDeliveryModal(decodeURIComponent('${safeId(item.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                                    <button onclick="deleteDelivery(decodeURIComponent('${safeId(item.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        renderPagination('deliveries-pagination', pageInfo, 'changeDeliveriesPage', 'entrega');
    }

    window.VXDeliveriesPage = {
        render,
        populateClientFilter
    };
})();
