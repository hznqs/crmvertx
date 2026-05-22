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

    function getTeamRoleLabel(role) {
        const labels = {
            marketing: 'Marketing',
            trafego: 'Gestor de trafego',
            sdr: 'SDR',
            closer: 'Closer',
            dev: 'Desenvolvedor'
        };
        return labels[role] || role;
    }

    function memberCommissionStats(memberId, sales) {
        const memberSales = sales.filter(sale => sale.memberId === memberId);
        const totalRevenue = memberSales.reduce((sum, sale) => sum + Number(sale.value || 0), 0);
        const totalCommission = memberSales.reduce((sum, sale) => sum + ((Number(sale.value || 0) * Number(sale.percent || 0)) / 100), 0);
        const goal = memberSales.length ? Number(memberSales[memberSales.length - 1].goal || 0) : 0;
        const goalProgress = goal > 0 ? Math.min((memberSales.length / goal) * 100, 100) : 0;
        return { sales: memberSales, totalRevenue, totalCommission, goal, goalProgress };
    }

    function rankingMemberStats(memberId, ranking) {
        return ranking?.ranking?.find(item => item.memberId === memberId) || null;
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

    function renderCommissions(context) {
        const membersList = document.getElementById('commission-members-list');
        const salesList = document.getElementById('commission-sales-list');
        if (!membersList || !salesList) return;

        const teamMembers = Array.isArray(context.teamMembers) ? context.teamMembers : [];
        const commissionSales = Array.isArray(context.commissionSales) ? context.commissionSales : [];
        const members = teamMembers.filter(member => ['sdr', 'closer'].includes(member.role));
        const metrics = context.metrics || null;
        const ranking = context.ranking || null;
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: commissionSales.length };

        const totalRevenue = metrics
            ? Number(metrics.totalRevenue || 0)
            : commissionSales.reduce((sum, sale) => sum + Number(sale.value || 0), 0);
        const totalCommission = metrics
            ? Number(metrics.totalCommission || 0)
            : commissionSales.reduce((sum, sale) => sum + ((Number(sale.value || 0) * Number(sale.percent || 0)) / 100), 0);

        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        setText('commissions-total-sales', metrics?.totalSales ?? pageInfo.totalElements ?? commissionSales.length);
        setText('commissions-total-revenue', formatCurrency(totalRevenue));
        setText('commissions-total-paid', formatCurrency(totalCommission));

        const averageGoal = ranking?.averageGoalProgress !== undefined
            ? Number(ranking.averageGoalProgress || 0)
            : (members.length ? Math.round(members.reduce((sum, member) => sum + memberCommissionStats(member.id, commissionSales).goalProgress, 0) / members.length) : 0);
        setText('commissions-goal-average', `${averageGoal}%`);

        if (!members.length) {
            membersList.innerHTML = '<p class="text-vx-muted text-sm">Cadastre SDRs ou Closers na aba Equipe.</p>';
        } else {
            membersList.innerHTML = members.map(member => {
                const stats = memberCommissionStats(member.id, commissionSales);
                const apiStats = rankingMemberStats(member.id, ranking);
                const salesCount = apiStats ? Number(apiStats.sales || 0) : stats.sales.length;
                const totalMemberRevenue = apiStats ? Number(apiStats.revenue || 0) : stats.totalRevenue;
                const totalMemberCommission = apiStats ? Number(apiStats.commission || 0) : stats.totalCommission;
                const goalProgress = apiStats ? Number(apiStats.goalProgress || 0) : stats.goalProgress;
                return `
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <p class="font-bold">${safeText(member.name)}</p>
                                <p class="text-vx-muted text-sm">${safeText(getTeamRoleLabel(member.role))}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full bg-vx-purple/20 text-vx-pink text-xs">${salesCount} vendas</span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 mb-3">
                            <div><p class="text-xs text-vx-muted">Volume</p><p class="font-bold">${formatCurrency(totalMemberRevenue)}</p></div>
                            <div><p class="text-xs text-vx-muted">Comissao</p><p class="font-bold text-green-400">${formatCurrency(totalMemberCommission)}</p></div>
                            <div><p class="text-xs text-vx-muted">Meta</p><p class="font-bold">${goalProgress.toFixed(0)}%</p></div>
                        </div>
                        <div class="h-2 bg-vx-border rounded-full overflow-hidden">
                            <div class="h-full progress-bar rounded-full" style="width:${Math.min(goalProgress, 100)}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (!commissionSales.length) {
            salesList.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma venda registrada.</p>';
            renderPagination('commission-sales-pagination', pageInfo, 'changeCommissionSalesPage', 'comissao');
            return;
        }

        salesList.innerHTML = commissionSales.slice().reverse().map(sale => {
            const member = teamMembers.find(item => item.id === sale.memberId);
            const commission = (Number(sale.value || 0) * Number(sale.percent || 0)) / 100;
            return `
                <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="font-bold">${safeText(sale.client || 'Venda fechada')}</p>
                            <p class="text-vx-muted text-sm">${member ? safeText(member.name) : 'Membro removido'} · ${safeText(sale.percent)}%</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold gradient-text">${formatCurrency(commission)}</p>
                            <p class="text-xs text-vx-muted">${formatCurrency(sale.value)}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="openCommissionModal(decodeURIComponent('${safeId(sale.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                        <button onclick="deleteCommissionSale(decodeURIComponent('${safeId(sale.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
        renderPagination('commission-sales-pagination', pageInfo, 'changeCommissionSalesPage', 'comissao');
    }

    function fallbackXp(member, commissionSales) {
        const completed = Number(member.completed || 0);
        const performance = Number(member.performance || 0);
        const salesCount = memberCommissionStats(member.id, commissionSales).sales.length;
        return (completed * 80) + (performance * 20) + (salesCount * 250);
    }

    function levelFromXp(xp) {
        return Math.max(1, Math.floor(Number(xp || 0) / 500) + 1);
    }

    function badgeFromXp(xp) {
        if (xp >= 6000) return 'Lenda VertX';
        if (xp >= 3500) return 'Elite';
        if (xp >= 1800) return 'Performance Pro';
        if (xp >= 800) return 'Em crescimento';
        return 'Iniciante';
    }

    function productivity(member) {
        const tasks = Number(member.tasks || 0);
        if (tasks <= 0) return Number(member.performance || 0);
        return Math.round((Number(member.completed || 0) * 100) / tasks);
    }

    function setTopRole(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '-';
    }

    function renderRanking(context) {
        const grid = document.getElementById('ranking-grid');
        if (!grid) return;

        const teamMembers = Array.isArray(context.teamMembers) ? context.teamMembers : [];
        const commissionSales = Array.isArray(context.commissionSales) ? context.commissionSales : [];
        const ranking = context.ranking || null;

        if (ranking?.ranking?.length) {
            setTopRole('ranking-top-closer', ranking.topCloser);
            setTopRole('ranking-top-sdr', ranking.topSdr);
            setTopRole('ranking-top-gestor', ranking.topTraffic);
            setTopRole('ranking-top-designer', ranking.topMarketing);

            grid.innerHTML = ranking.ranking.map((member, index) => rankingCard({
                index,
                name: member.name,
                role: member.role,
                xp: Number(member.xp || 0),
                level: Number(member.level || 1),
                badge: member.badge,
                goalProgress: Number(member.goalProgress || 0),
                productivity: Number(member.productivity || 0)
            })).join('');
            return;
        }

        const topByRole = (role) => [...teamMembers]
            .filter(member => member.role === role)
            .sort((a, b) => fallbackXp(b, commissionSales) - fallbackXp(a, commissionSales))[0]?.name || '-';

        setTopRole('ranking-top-closer', topByRole('closer'));
        setTopRole('ranking-top-sdr', topByRole('sdr'));
        setTopRole('ranking-top-gestor', topByRole('trafego'));
        setTopRole('ranking-top-designer', topByRole('marketing'));

        const ranked = [...teamMembers].sort((a, b) => fallbackXp(b, commissionSales) - fallbackXp(a, commissionSales));
        if (!ranked.length) {
            grid.innerHTML = '<p class="text-vx-muted text-sm">Nenhum membro cadastrado.</p>';
            return;
        }

        grid.innerHTML = ranked.map((member, index) => {
            const xp = fallbackXp(member, commissionSales);
            const goal = memberCommissionStats(member.id, commissionSales).goal;
            const goalProgress = goal > 0
                ? Math.min((memberCommissionStats(member.id, commissionSales).sales.length / goal) * 100, 100)
                : productivity(member);
            return rankingCard({
                index,
                name: member.name,
                role: member.role,
                xp,
                level: levelFromXp(xp),
                badge: badgeFromXp(xp),
                goalProgress,
                productivity: productivity(member)
            });
        }).join('');
    }

    function rankingCard(member) {
        const productivityWidth = Math.min(Number(member.productivity || 0), 100);
        const goalProgress = Math.min(Number(member.goalProgress || 0), 100);
        return `
            <div class="bg-vx-darker rounded-2xl border border-vx-border p-5 hover:border-vx-purple transition-all">
                <div class="flex items-center justify-between mb-4">
                    <span class="w-10 h-10 rounded-xl bg-vx-purple/20 flex items-center justify-center font-bold gradient-text">#${member.index + 1}</span>
                    <span class="px-3 py-1 rounded-full bg-vx-purple/20 text-vx-pink text-xs">${safeText(member.badge)}</span>
                </div>
                <h3 class="font-display text-xl font-bold">${safeText(member.name)}</h3>
                <p class="text-vx-muted text-sm mb-4">${safeText(getTeamRoleLabel(member.role))}</p>
                <div class="grid grid-cols-3 gap-3 mb-4">
                    <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">XP</p><p class="font-bold">${Number(member.xp || 0)}</p></div>
                    <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">Nivel</p><p class="font-bold gradient-text">${Number(member.level || 1)}</p></div>
                    <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">Meta</p><p class="font-bold">${goalProgress.toFixed(0)}%</p></div>
                </div>
                <div class="h-2 bg-vx-border rounded-full overflow-hidden">
                    <div class="h-full progress-bar rounded-full" style="width:${productivityWidth}%"></div>
                </div>
            </div>
        `;
    }

    window.VXCommissionsPage = {
        renderCommissions,
        renderRanking
    };
})();
