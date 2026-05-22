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

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function isClosedSale(event, helper) {
        if (typeof helper === 'function') return helper(event);
        return (event.status || 'agendada') === 'executada' && (event.sale === true || event.sale === 'sim');
    }

    function getPipelineProbability(phase) {
        const probabilities = {
            prospeccao: 18,
            followup: 35,
            negociacao: 70,
            fechado: 100,
            perdido: 0,
            lead: 10,
            proposta: 25,
            reuniao: 45,
            contrato: 90
        };
        return probabilities[phase] ?? 0;
    }

    function getPhaseLabel(phase, helper) {
        if (typeof helper === 'function') return helper(phase);
        const labels = {
            prospeccao: 'Prospeccao',
            negociacao: 'Negociacao',
            fechado: 'Fechado',
            followup: 'Follow-up',
            perdido: 'Perdido'
        };
        return labels[phase] || phase;
    }

    function getTeamProductivity(teamMembers, getMemberTaskStats) {
        const stats = teamMembers.map(member => {
            if (typeof getMemberTaskStats === 'function') return getMemberTaskStats(member);
            const assigned = Number(member.tasks || 0);
            const completed = Number(member.completed || 0);
            return { assigned, completed };
        });

        const assigned = stats.reduce((sum, item) => sum + Number(item.assigned || 0), 0);
        const completed = stats.reduce((sum, item) => sum + Number(item.completed || 0), 0);
        return assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
    }

    function activeClientValue(client) {
        return Number(client.value || 0);
    }

    function render(context) {
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const events = Array.isArray(context.events) ? context.events : [];
        const contracts = Array.isArray(context.contracts) ? context.contracts : [];
        const financeEntries = Array.isArray(context.financeEntries) ? context.financeEntries : [];
        const clientPerformance = Array.isArray(context.clientPerformance) ? context.clientPerformance : [];
        const teamMembers = Array.isArray(context.teamMembers) ? context.teamMembers : [];
        const currentGoal = context.currentGoal || {};
        const executiveSettings = context.executiveSettings || { profitMargin: 45 };
        const helpers = context.helpers || {};

        const activeClients = clients.filter(client => client.phase === 'fechado');
        const totalRevenue = activeClients.reduce((sum, client) => {
            return sum + (activeClientValue(client) * Number(client.months || 1));
        }, 0);

        const currentMonthRevenue = events
            .filter(event => isClosedSale(event, helpers.isClosedSale))
            .reduce((sum, event) => sum + Number(event.revenue || 0), 0);

        const profitMargin = Number(executiveSettings.profitMargin ?? 45);
        const profit = totalRevenue * (profitMargin / 100);
        const estimatedCost = Math.max(totalRevenue - profit, 0);
        const roi = estimatedCost > 0 ? ((profit / estimatedCost) * 100) : 0;

        const activeContracts = contracts.filter(contract => contract.status === 'ativo');
        const canceledContracts = contracts.filter(contract => contract.status === 'encerrado').length;
        const totalContracts = contracts.length || activeClients.length || 1;
        const retention = Math.round((activeContracts.length / totalContracts) * 100);
        const churn = Math.max(0, Math.round((canceledContracts / totalContracts) * 100));

        const getClientValue = typeof helpers.getClientValue === 'function'
            ? helpers.getClientValue
            : (clientId) => activeClientValue(clients.find(client => client.id === clientId));

        const mrr = activeContracts.length
            ? activeContracts.reduce((sum, contract) => sum + Number(getClientValue(contract.clientId) || 0), 0)
            : activeClients.reduce((sum, client) => sum + activeClientValue(client), 0);

        const paidFinanceRevenue = financeEntries
            .filter(entry => entry.type === 'receita' && entry.status === 'pago')
            .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        const performanceRevenue = clientPerformance.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

        const pipelineFinancial = clients
            .filter(client => client.phase !== 'perdido' && client.phase !== 'fechado')
            .map(client => {
                const probability = getPipelineProbability(client.phase);
                const value = activeClientValue(client);
                return {
                    ...client,
                    probability,
                    predicted: value * (probability / 100)
                };
            })
            .sort((a, b) => Number(b.predicted || 0) - Number(a.predicted || 0));

        const intelligentPipelineForecast = pipelineFinancial.reduce((sum, client) => sum + Number(client.predicted || 0), 0);
        const revenueForecast = Math.max(currentMonthRevenue, paidFinanceRevenue, performanceRevenue, mrr) + intelligentPipelineForecast;

        const profitableClients = activeClients
            .map(client => {
                const records = clientPerformance.filter(item => item.clientId === client.id);
                const perfRevenue = records.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
                const perfInvestment = records.reduce((sum, item) => sum + Number(item.investment || 0), 0);
                const baseRevenue = activeClientValue(client) * Number(client.months || 1);
                const revenue = perfRevenue || baseRevenue;
                return {
                    name: client.name,
                    revenue,
                    profit: (revenue - perfInvestment) * (profitMargin / 100)
                };
            })
            .sort((a, b) => Number(b.profit || 0) - Number(a.profit || 0));

        const projection = currentMonthRevenue > 0 ? currentMonthRevenue * 1.25 : totalRevenue / 3;
        const goalProgress = currentGoal?.target ? Math.round((totalRevenue / Number(currentGoal.target || 1)) * 100) : 0;
        const growth = totalRevenue > 0 ? Math.min(100, Math.round((currentMonthRevenue / totalRevenue) * 100)) : 0;
        const teamProductivity = getTeamProductivity(teamMembers, helpers.getMemberTaskStats);

        setText('exec-total-revenue', formatCurrency(totalRevenue));
        setText('exec-profit', formatCurrency(profit));
        setText('exec-roi', `${roi.toFixed(1)}%`);
        setText('exec-projection', formatCurrency(projection));
        setText('exec-retention', `${retention}%`);
        setText('exec-churn', `${churn}%`);
        setText('exec-team', teamMembers.length);
        setText('exec-growth', `${growth}%`);
        setText('exec-revenue-forecast', formatCurrency(revenueForecast));
        setText('exec-mrr', formatCurrency(mrr));
        setText('exec-most-profitable-client', profitableClients[0]?.name || '-');
        setText('exec-margin-label', `Margem automatica: ${profitMargin}%`);

        const marginInput = document.getElementById('exec-profit-margin-input');
        if (marginInput) marginInput.value = profitMargin;

        renderBars([
            { label: 'Meta de faturamento', value: goalProgress, text: `${goalProgress}% da meta`, color: 'progress-bar' },
            { label: 'Retencao', value: retention, text: `${retention}%`, color: 'bg-green-500' },
            { label: 'Produtividade da equipe', value: teamProductivity, text: `${teamProductivity}%`, color: 'progress-bar' },
            { label: 'Crescimento mensal', value: growth, text: `${growth}%`, color: 'bg-blue-500' }
        ]);

        renderSummary({
            activeClients: activeClients.length,
            goalTarget: Number(currentGoal.target || 0),
            currentMonthRevenue,
            retention
        });

        renderPipeline(pipelineFinancial, intelligentPipelineForecast, helpers.getPhaseLabel);
        renderProfitableClients(profitableClients);
    }

    function renderBars(items) {
        const container = document.getElementById('exec-bars');
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-vx-muted text-sm">${safeText(item.label)}</span>
                    <span class="font-display font-bold">${safeText(item.text)}</span>
                </div>
                <div class="h-3 bg-vx-border rounded-full overflow-hidden">
                    <div class="h-full ${safeText(item.color)} rounded-full" style="width:${Math.min(Number(item.value || 0), 100)}%"></div>
                </div>
            </div>
        `).join('');
    }

    function renderSummary(summary) {
        const container = document.getElementById('exec-summary');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                <p class="text-vx-muted text-sm">Clientes ativos</p>
                <p class="font-display text-2xl font-bold">${summary.activeClients}</p>
            </div>
            <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                <p class="text-vx-muted text-sm">Meta atual</p>
                <p class="font-display text-2xl font-bold">${formatCurrency(summary.goalTarget)}</p>
            </div>
            <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                <p class="text-vx-muted text-sm">Receita via agenda</p>
                <p class="font-display text-2xl font-bold text-yellow-400">${formatCurrency(summary.currentMonthRevenue)}</p>
            </div>
            <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                <p class="text-vx-muted text-sm">Status geral</p>
                <p class="font-display text-lg font-bold ${summary.retention >= 80 ? 'text-green-400' : 'text-yellow-400'}">
                    ${summary.retention >= 80 ? 'Operacao saudavel' : 'Atencao na retencao'}
                </p>
            </div>
        `;
    }

    function renderPipeline(items, total, phaseLabelHelper) {
        setText('pipeline-prediction-total', formatCurrency(total));

        const container = document.getElementById('pipeline-financial-list');
        if (!container) return;

        if (!items.length) {
            container.innerHTML = '<p class="text-vx-muted text-sm">Nenhum cliente no pipeline comercial.</p>';
            return;
        }

        container.innerHTML = items.map(client => `
            <div class="bg-vx-darker rounded-xl border border-vx-border p-5 hover:border-vx-purple transition-all">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="font-bold text-lg">${safeText(client.name)}</p>
                        <p class="text-sm text-vx-muted mt-1">${safeText(getPhaseLabel(client.phase, phaseLabelHelper))} - ${client.probability}% de chance</p>
                    </div>
                    <div class="text-right">
                        <p class="font-display text-lg font-bold text-white">${formatCurrency(client.value)}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-vx-purple to-vx-pink" style="width:${client.probability}%"></div>
                    </div>
                    <div class="flex items-center justify-between mt-3">
                        <span class="text-xs text-vx-muted">Previsao estimada</span>
                        <span class="text-sm font-bold gradient-text">${formatCurrency(client.predicted)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderProfitableClients(clients) {
        const container = document.getElementById('exec-profitable-clients');
        if (!container) return;

        if (!clients.length) {
            container.innerHTML = '<p class="text-vx-muted text-sm">Nenhum cliente fechado ainda.</p>';
            return;
        }

        container.innerHTML = clients.slice(0, 5).map((client, index) => `
            <div class="bg-vx-darker rounded-xl border border-vx-border p-4 flex items-center justify-between gap-3">
                <div>
                    <p class="font-bold">#${index + 1} ${safeText(client.name)}</p>
                    <p class="text-xs text-vx-muted">Receita: ${formatCurrency(client.revenue)}</p>
                </div>
                <p class="font-display font-bold text-green-400">${formatCurrency(client.profit)}</p>
            </div>
        `).join('');
    }

    window.VXExecutivePage = { render };
})();
