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

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(`${dateValue}T12:00:00`);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    }

    function daysUntil(dateValue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(`${dateValue}T12:00:00`);
        if (Number.isNaN(date.getTime())) return 0;
        return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    }

    function clientName(clients, clientId) {
        return clients.find(client => client.id === clientId)?.name || 'Cliente removido';
    }

    function clientValue(clients, clientId) {
        return Number(clients.find(client => client.id === clientId)?.value || 0);
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

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function render(context) {
        const tbody = document.getElementById('contracts-table');
        if (!tbody) return;

        const contracts = Array.isArray(context.contracts) ? context.contracts : [];
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const summary = context.summary || null;
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: contracts.length };
        const active = contracts.filter(contract => contract.status === 'ativo');
        const renewals = contracts.filter(contract => contract.status === 'ativo' && daysUntil(contract.endDate) <= 30 && daysUntil(contract.endDate) >= 0);
        const auto = contracts.filter(contract => contract.autoRenew);
        const mrr = active.reduce((sum, contract) => sum + clientValue(clients, contract.clientId), 0);

        setText('contracts-active', summary?.active ?? active.length);
        setText('contracts-renewal', summary?.expiringSoon ?? renewals.length);
        setText('contracts-auto', summary?.autoRenew ?? auto.length);
        setText('contracts-mrr', formatCurrency(Number(summary?.mrr ?? mrr)));

        if (!contracts.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-vx-muted">Nenhum contrato cadastrado</td></tr>';
            renderPagination('contracts-pagination', pageInfo, 'changeContractsPage');
            return;
        }

        tbody.innerHTML = contracts.map(contract => {
            const days = daysUntil(contract.endDate);
            const alert = days < 0 ? 'Vencido' : days <= 30 ? `${days} dias` : 'Sem alerta';
            const alertClass = days < 0
                ? 'bg-red-500/20 text-red-400'
                : days <= 30
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-vx-border text-vx-muted';
            const statusClass = contract.status === 'ativo'
                ? 'bg-green-500/20 text-green-400'
                : contract.status === 'pausado'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400';

            return `
                <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                    <td class="px-6 py-4 font-medium">${safeText(clientName(clients, contract.clientId))}</td>
                    <td class="px-6 py-4">${safeText(contract.plan)}</td>
                    <td class="px-6 py-4 text-vx-muted">${formatDate(contract.startDate)}</td>
                    <td class="px-6 py-4 text-vx-muted">${formatDate(contract.endDate)}</td>
                    <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs ${statusClass}">${safeText(contract.status)}</span></td>
                    <td class="px-6 py-4">${contract.autoRenew ? 'Automatica' : 'Manual'}</td>
                    <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs ${alertClass}">${safeText(alert)}</span></td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button onclick="openContractModal(decodeURIComponent('${safeId(contract.id)}'))" class="p-2 hover:bg-vx-border rounded-lg transition-colors">Editar</button>
                            <button onclick="deleteContract(decodeURIComponent('${safeId(contract.id)}'))" class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        renderPagination('contracts-pagination', pageInfo, 'changeContractsPage');
    }

    window.VXContractsPage = {
        render
    };
})();
