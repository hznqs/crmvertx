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

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function periodParams() {
        return {
            from: document.getElementById('dashboard-from-filter')?.value || '',
            to: document.getElementById('dashboard-to-filter')?.value || ''
        };
    }

    async function loadDashboardData() {
        if (!window.VXApi?.dashboard?.metrics) {
            throw new Error('API de dashboard indisponivel.');
        }

        const params = periodParams();
        const metrics = await window.VXApi.dashboard.metrics(params);
        const [revenueChart, meetingsChart] = await Promise.all([
            window.VXApi.dashboard.revenueChart
                ? window.VXApi.dashboard.revenueChart(params).catch(() => [])
                : Promise.resolve([]),
            window.VXApi.dashboard.meetingsChart
                ? window.VXApi.dashboard.meetingsChart(params).catch(() => [])
                : Promise.resolve([])
        ]);

        return {
            metrics,
            revenueChart: Array.isArray(revenueChart) ? revenueChart : [],
            meetingsChart: Array.isArray(meetingsChart) ? meetingsChart : []
        };
    }

    function renderSummary(context) {
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const metrics = context.metrics || null;
        const currentGoal = context.currentGoal || {};
        const helpers = context.helpers || {};
        const activeClients = clients.filter(client => client.phase === 'fechado');
        const monthlyRevenue = metrics
            ? Number(metrics.monthlyRevenue || 0)
            : activeClients.reduce((sum, client) => sum + (Number(client.value || 0) * Number(client.months || 1)), 0);

        setText('total-clients', metrics?.totalClients ?? clients.length);
        setText('active-clients', metrics?.activeClients ?? activeClients.length);
        setText('pending-followups', metrics?.pendingFollowups ?? clients.filter(client => client.phase === 'followup').length);
        setText('daily-revenue', formatCurrency(metrics?.dailyRevenue ?? (monthlyRevenue / 30)));
        setText('weekly-revenue', formatCurrency(metrics?.weeklyRevenue ?? (monthlyRevenue / 4)));
        setText('monthly-revenue', formatCurrency(monthlyRevenue));

        const target = Number(currentGoal.target || 0);
        const progress = target > 0 ? Math.min((monthlyRevenue / target) * 100, 100) : 0;
        setText('goal-progress-text', `${progress.toFixed(1)}%`);
        setText('current-revenue-goal', formatCurrency(monthlyRevenue));
        setText('goal-target', formatCurrency(target));

        const progressBar = document.getElementById('goal-progress-bar');
        if (progressBar) progressBar.style.width = `${progress}%`;

        renderRecentClients(clients, helpers);
    }

    function renderRecentClients(clients, helpers = {}) {
        const tbody = document.getElementById('recent-clients-table');
        if (!tbody) return;

        const getPhaseLabel = helpers.getPhaseLabel || ((phase) => phase);
        const getPhaseClass = helpers.getPhaseClass || (() => '');
        const recent = clients.slice(-8).reverse();

        if (!recent.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state m-4">
                            <h4>Nenhum cliente cadastrado</h4>
                            <p>Quando o comercial adicionar clientes, os mais recentes aparecem aqui.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = recent.map(client => {
            const id = safeId(client.id);
            return `
                <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-medium">${safeText(client.name)}</p>
                        <p class="text-xs text-vx-muted">${safeText(client.contact)}</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs ${safeText(getPhaseClass(client.phase))}">${safeText(getPhaseLabel(client.phase))}</span>
                    </td>
                    <td class="px-6 py-4 font-medium">${formatCurrency(client.value)}</td>
                    <td class="px-6 py-4 text-vx-muted">${safeText(client.email)}</td>
                    <td class="px-6 py-4">
                        <button onclick="closeRecentClientsModal(); openClientDashboard(decodeURIComponent('${id}'))" class="px-3 py-2 bg-vx-purple/20 text-vx-pink hover:bg-vx-purple/30 rounded-lg transition-colors text-xs font-bold">
                            Ver dashboard
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.VXDashboardPage = {
        periodParams,
        loadDashboardData,
        renderSummary,
        renderRecentClients
    };
})();
