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
        const financeEntries = Array.isArray(context.financeEntries) ? context.financeEntries : [];
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: financeEntries.length };
        const summary = context.summary || {};

        const activeClients = clients.filter(client => client.phase === 'fechado');
        const recurringFromClients = activeClients.reduce((sum, client) => sum + Number(client.value || 0), 0);
        const recurringEntries = financeEntries
            .filter(entry => entry.recurring === 'sim' && entry.type === 'receita')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const revenueEntries = financeEntries
            .filter(entry => entry.type === 'receita')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const expenses = financeEntries
            .filter(entry => entry.type === 'despesa')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const commissions = financeEntries
            .filter(entry => entry.type === 'comissao')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const taxes = financeEntries
            .filter(entry => entry.type === 'imposto')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const overdue = financeEntries
            .filter(entry => entry.status === 'vencido')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const autoBilling = financeEntries.filter(entry => entry.auto === 'sim').length;
        const revenue = recurringFromClients + revenueEntries + recurringEntries;
        const forecast = revenue + recurringFromClients;
        const netProfit = revenue - expenses - commissions - taxes;
        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        const summaryRecurring = Number(summary.recurringRevenue ?? (recurringFromClients + recurringEntries));
        const summaryForecast = Number(summary.forecast ?? forecast);
        const summaryNetProfit = Number(summary.netProfit ?? netProfit);
        const summaryMargin = Number(summary.margin ?? margin);
        const summaryOverdue = Number(summary.overdue ?? overdue);
        const summaryAutoBilling = Number(summary.autoBillingCount ?? autoBilling);
        const summaryCommissions = Number(summary.commissions ?? commissions);
        const summaryTaxes = Number(summary.taxes ?? taxes);
        const summaryGrossRevenue = Number(summary.grossRevenue ?? revenue);
        const summaryExpenses = Number(summary.expenses ?? expenses);

        setText('fin-recurring', formatCurrency(summaryRecurring));
        setText('fin-forecast', formatCurrency(summaryForecast));
        setText('fin-net-profit', formatCurrency(summaryNetProfit));
        setText('fin-margin', `${summaryMargin.toFixed(1)}%`);
        setText('fin-overdue', formatCurrency(summaryOverdue));
        setText('fin-auto-billing', summaryAutoBilling);
        setText('fin-commissions', formatCurrency(summaryCommissions));
        setText('fin-taxes', formatCurrency(summaryTaxes));

        renderDre({
            grossRevenue: summaryGrossRevenue,
            expenses: summaryExpenses,
            commissions: summaryCommissions,
            taxes: summaryTaxes,
            netProfit: summaryNetProfit
        });
        renderEntries(financeEntries, pageInfo);
    }

    function renderDre(values) {
        const dre = document.getElementById('dre-list');
        if (!dre) return;

        const rows = [
            ['Receita Bruta', values.grossRevenue],
            ['(-) Despesas', -values.expenses],
            ['(-) Comissoes', -values.commissions],
            ['(-) Impostos', -values.taxes],
            ['Lucro Liquido', values.netProfit]
        ];
        dre.innerHTML = rows.map(([label, value]) => `
            <div class="flex items-center justify-between bg-vx-darker rounded-xl border border-vx-border p-4">
                <span class="text-vx-muted">${label}</span>
                <span class="font-display font-bold ${value < 0 ? 'text-red-400' : label === 'Lucro Liquido' ? 'text-green-400' : 'text-white'}">${formatCurrency(value)}</span>
            </div>
        `).join('');
    }

    function renderEntries(financeEntries, pageInfo) {
        const list = document.getElementById('finance-list');
        if (!list) return;

        if (!financeEntries.length) {
            list.innerHTML = '<p class="text-vx-muted text-sm">Nenhum lancamento financeiro.</p>';
            renderPagination('finance-pagination', pageInfo, 'changeFinancePage', 'lancamento');
            return;
        }

        list.innerHTML = financeEntries.slice(-12).reverse().map(entry => `
            <article class="bg-vx-darker rounded-xl border border-vx-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <p class="font-bold">${safeText(entry.description)}</p>
                    <p class="text-vx-muted text-sm">${safeText(entry.type)} · ${safeText(entry.status)} · ${entry.recurring === 'sim' ? 'recorrente' : 'unico'} · auto: ${safeText(entry.auto)}</p>
                </div>
                <div class="flex items-center gap-3">
                    <p class="font-display text-lg font-bold ${entry.type === 'receita' ? 'text-green-400' : 'text-red-400'}">${formatCurrency(entry.value)}</p>
                    <button type="button" data-finance-action="edit" data-finance-id="${safeText(entry.id)}" class="px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                    <button type="button" data-finance-action="delete" data-finance-id="${safeText(entry.id)}" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                </div>
            </article>
        `).join('');
        renderPagination('finance-pagination', pageInfo, 'changeFinancePage', 'lancamento');
    }

    window.VXFinancePage = {
        render
    };
})();
