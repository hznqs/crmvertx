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
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const goals = Array.isArray(context.goals) ? context.goals : [];
        const contracts = Array.isArray(context.contracts) ? context.contracts : [];
        const events = Array.isArray(context.events) ? context.events : [];
        const agencyGoals = context.agencyGoals || {};
        const currentGoal = context.currentGoal || { target: 0 };
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: goals.length };

        const activeClients = clients.filter(client => client.phase === 'fechado');
        const monthlyRevenue = activeClients.reduce((sum, client) => sum + (Number(client.value || 0) * Number(client.months || 1)), 0);
        const target = Number(currentGoal.target || 0);
        const progress = target > 0 ? Math.min((monthlyRevenue / target) * 100, 100) : 0;
        const remaining = Math.max(target - monthlyRevenue, 0);

        setText('goal-page-progress', `${progress.toFixed(1)}%`);
        const bar = document.getElementById('goal-page-bar');
        if (bar) bar.style.width = `${progress}%`;
        setText('goal-current', formatCurrency(monthlyRevenue));
        setText('goal-target-page', formatCurrency(target));
        setText('goal-remaining', formatCurrency(remaining));

        renderAgencyGoals({ clients, contracts, events, agencyGoals });
        renderHistory({ goals, pageInfo });
    }

    function renderAgencyGoals({ clients, contracts, events, agencyGoals }) {
        const grid = document.getElementById('agency-goals-grid');
        if (!grid) return;

        const activeClients = clients.filter(client => client.phase === 'fechado');
        const monthlyRevenue = activeClients.reduce((sum, client) => sum + (Number(client.value || 0) * Number(client.months || 1)), 0);
        const averageTicket = activeClients.length ? monthlyRevenue / activeClients.length : 0;
        const current = {
            revenue: monthlyRevenue,
            newClients: activeClients.length,
            averageTicket,
            retention: contracts.length ? Math.round((contracts.filter(contract => contract.status === 'ativo').length / contracts.length) * 100) : 0,
            proposals: clients.filter(client => client.phase === 'negociacao').length,
            meetings: events.length
        };

        const items = [
            { label: 'Faturamento', current: current.revenue, target: agencyGoals.revenue, money: true },
            { label: 'Novos Clientes', current: current.newClients, target: agencyGoals.newClients },
            { label: 'Ticket Medio', current: current.averageTicket, target: agencyGoals.averageTicket, money: true },
            { label: 'Retencao', current: current.retention, target: agencyGoals.retention, suffix: '%' },
            { label: 'Propostas Enviadas', current: current.proposals, target: agencyGoals.proposals },
            { label: 'Reunioes Marcadas', current: current.meetings, target: agencyGoals.meetings }
        ];

        grid.innerHTML = items.map(item => {
            const target = Number(item.target || 0);
            const currentValue = Number(item.current || 0);
            const percent = target > 0 ? Math.min((currentValue / target) * 100, 100) : 0;
            const currentText = item.money ? formatCurrency(currentValue) : `${Math.round(currentValue)}${item.suffix || ''}`;
            const targetText = item.money ? formatCurrency(target) : `${target}${item.suffix || ''}`;
            return `
                <div class="bg-vx-darker rounded-xl p-4 border border-vx-border">
                    <div class="flex items-center justify-between mb-3">
                        <p class="font-medium">${safeText(item.label)}</p>
                        <span class="text-xs text-vx-muted">${percent.toFixed(0)}%</span>
                    </div>
                    <div class="h-2 bg-vx-border rounded-full overflow-hidden mb-3">
                        <div class="h-full progress-bar rounded-full" style="width:${percent}%"></div>
                    </div>
                    <p class="text-sm"><span class="font-bold gradient-text">${currentText}</span> <span class="text-vx-muted">/ ${targetText}</span></p>
                </div>
            `;
        }).join('');
    }

    function renderHistory({ goals, pageInfo }) {
        const container = document.getElementById('goals-history');
        if (!container) return;

        const canManageGoals = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');
        if (!goals.length) {
            container.innerHTML = '<div class="empty-state"><h4>Nenhuma meta definida</h4><p>Defina metas mensais para acompanhar progresso comercial e financeiro.</p></div>';
            renderPagination('goals-pagination', pageInfo, 'changeGoalsPage', 'meta');
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div class="flex items-center justify-between py-3 border-b border-vx-border last:border-0">
                <div>
                    <p class="font-medium">${formatCurrency(goal.target)}</p>
                    <p class="text-xs text-vx-muted">${formatDate(goal.date)}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm ${goal.achieved ? 'text-green-500' : 'text-vx-muted'}">${goal.achieved ? 'Alcancada' : 'Nao alcancada'}</p>
                    ${canManageGoals ? `<button onclick="openGoalModal(decodeURIComponent('${safeId(goal.id)}'))" class="text-xs text-vx-muted hover:text-white mt-1">Editar</button>` : ''}
                </div>
            </div>
        `).join('');
        renderPagination('goals-pagination', pageInfo, 'changeGoalsPage', 'meta');
    }

    window.VXGoalsPage = {
        render,
        renderAgencyGoals
    };
})();
