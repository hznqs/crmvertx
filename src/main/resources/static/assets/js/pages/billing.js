(function () {
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function render(summary) {
        const clients = Array.isArray(summary?.clients) ? summary.clients : [];
        setText('billing-total', formatCurrency(summary?.totalRevenue));
        setText('billing-average', formatCurrency(summary?.averageTicket));
        setText('billing-contracts', summary?.activeContracts ?? clients.length);

        const tbody = document.getElementById('billing-table');
        if (!tbody) return;

        if (!clients.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-vx-muted">Nenhum cliente ativo</td></tr>';
            return;
        }

        tbody.innerHTML = clients.map(client => `
            <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                <td class="px-6 py-4 font-medium">${escapeHTML(client.clientName)}</td>
                <td class="px-6 py-4">${formatCurrency(client.monthlyValue)}/mes</td>
                <td class="px-6 py-4">${escapeHTML(client.months)}</td>
                <td class="px-6 py-4 font-display font-bold gradient-text">${formatCurrency(client.totalValue)}</td>
            </tr>
        `).join('');
    }

    async function refresh() {
        if (!window.VXApi?.billing?.summary) return;
        const summary = await window.VXApi.billing.summary();
        render(summary);
        return summary;
    }

    window.VXBillingPage = {
        refresh,
        render
    };
})();
