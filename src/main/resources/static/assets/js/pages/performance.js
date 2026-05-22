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

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(`${dateValue}T12:00:00`);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    }

    function populateClientSelect(clients, selectId, selected = '') {
        const select = document.getElementById(selectId);
        if (!select) return '';

        select.innerHTML = '<option value="">Selecione</option>' +
            clients.map(client => `<option value="${safeText(client.id)}">${safeText(client.name)}</option>`).join('');
        if (selected) select.value = selected;
        return select.value || '';
    }

    function totals(records) {
        const ordered = [...records].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const leadsGenerated = ordered.reduce((sum, record) => sum + Number(record.leads || 0), 0);
        const salesGenerated = ordered.reduce((sum, record) => sum + Number(record.sales || 0), 0);
        const revenueGenerated = ordered.reduce((sum, record) => sum + Number(record.revenue || 0), 0);
        const investmentUsed = ordered.reduce((sum, record) => sum + Number(record.investment || 0), 0);
        const conversion = leadsGenerated > 0 ? (salesGenerated / leadsGenerated) * 100 : 0;
        const roi = investmentUsed > 0 ? ((revenueGenerated - investmentUsed) / investmentUsed) * 100 : 0;
        return { leadsGenerated, salesGenerated, revenueGenerated, investmentUsed, conversion, roi, records: ordered };
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function render(context) {
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const records = Array.isArray(context.records) ? context.records : [];
        const currentFilterValue = document.getElementById('performance-client-filter')?.value || '';
        let selectedClientId = populateClientSelect(clients, 'performance-client-filter', currentFilterValue);
        selectedClientId = selectedClientId || clients[0]?.id || '';
        if (selectedClientId) {
            const select = document.getElementById('performance-client-filter');
            if (select) select.value = selectedClientId;
        }

        const selectedRecords = records.filter(record => record.clientId === selectedClientId);
        const summary = totals(selectedRecords);

        setText('perf-leads', summary.leadsGenerated);
        setText('perf-sales', summary.salesGenerated);
        setText('perf-conversion', `${summary.conversion.toFixed(1)}%`);
        setText('perf-roi', `${summary.roi.toFixed(1)}%`);
        setText('perf-revenue', formatCurrency(summary.revenueGenerated));
        setText('perf-investment', formatCurrency(summary.investmentUsed));

        renderHistory({ selectedClientId, totals: summary });
    }

    function renderHistory({ selectedClientId, totals }) {
        const list = document.getElementById('performance-history');
        if (!list) return;

        if (!selectedClientId) {
            list.innerHTML = '<p class="text-vx-muted text-sm">Cadastre ou selecione um cliente.</p>';
            return;
        }

        if (!totals.records.length) {
            list.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma metrica lancada para este cliente.</p>';
            return;
        }

        list.innerHTML = totals.records.map(record => {
            const investment = Number(record.investment || 0);
            const roi = investment > 0 ? (((Number(record.revenue || 0) - investment) / investment) * 100) : 0;
            return `
                <article class="bg-vx-darker rounded-xl border border-vx-border p-4">
                    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div><p class="text-vx-muted text-xs">Data</p><p class="font-bold">${formatDate(record.date)}</p></div>
                        <div><p class="text-vx-muted text-xs">Leads</p><p class="font-bold text-blue-400">${Number(record.leads || 0)}</p></div>
                        <div><p class="text-vx-muted text-xs">Vendas</p><p class="font-bold text-vx-pink">${Number(record.sales || 0)}</p></div>
                        <div><p class="text-vx-muted text-xs">Investimento</p><p class="font-bold text-red-400">${formatCurrency(record.investment || 0)}</p></div>
                        <div><p class="text-vx-muted text-xs">ROI</p><p class="font-bold gradient-text">${roi.toFixed(1)}%</p></div>
                        <div><p class="text-vx-muted text-xs">Faturamento</p><p class="font-bold text-yellow-400">${formatCurrency(record.revenue)}</p></div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button type="button" data-performance-action="edit" data-performance-id="${safeText(record.id)}" class="px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                        <button type="button" data-performance-action="delete" data-performance-id="${safeText(record.id)}" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                    </div>
                </article>
            `;
        }).join('');
    }

    window.VXPerformancePage = {
        populateClientSelect,
        render,
        totals
    };
})();
