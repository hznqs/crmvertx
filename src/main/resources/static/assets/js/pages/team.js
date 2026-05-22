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

    function roleLabel(role) {
        const labels = {
            marketing: 'Marketing',
            trafego: 'Gestor de trafego',
            sdr: 'SDR',
            closer: 'Closer',
            dev: 'Desenvolvedor'
        };
        return labels[role] || role;
    }

    function taskTemplates(role) {
        const templates = {
            marketing: [
                { id: 'conteudo_clientes', label: 'Producao de conteudo para clientes' },
                { id: 'conteudo_vertx', label: 'Producao de conteudo para VertX Midia' },
                { id: 'criativos_ads', label: 'Desenvolvimento de criativos para anuncios' }
            ],
            trafego: [
                { id: 'subir_campanha_cliente', label: 'Subir campanha cliente' },
                { id: 'otimizar_campanha_cliente', label: 'Otimizar campanha cliente' },
                { id: 'subir_campanha_vertx', label: 'Subir campanha VertX' },
                { id: 'otimizar_campanha_vertx', label: 'Otimizar campanha VertX' }
            ],
            sdr: [
                { id: 'cold_calls', label: 'Cold calls para fazer' },
                { id: 'mensagens', label: 'Mensagens para enviar' }
            ],
            closer: [
                { id: 'reunioes', label: 'Reunioes para fazer' }
            ],
            dev: [
                { id: 'projetos_realizar_cliente', label: 'Projetos para realizar cliente' },
                { id: 'projetos_finalizar_cliente', label: 'Projetos para finalizar cliente' },
                { id: 'projetos_realizar_vertx', label: 'Projetos para realizar VertX' },
                { id: 'projetos_finalizar_vertx', label: 'Projetos para finalizar VertX' }
            ]
        };
        return templates[role] || templates.marketing;
    }

    function normalizeMemberTasks(member) {
        if (member.taskBreakdown) return member.taskBreakdown;
        const template = taskTemplates(member.role || 'marketing')[0];
        return {
            [template.id]: {
                assigned: Number(member.tasks || 0),
                completed: Number(member.completed || 0)
            }
        };
    }

    function memberTaskStats(member) {
        const breakdown = normalizeMemberTasks(member);
        const totals = Object.values(breakdown).reduce((acc, item) => {
            acc.assigned += Number(item.assigned || 0);
            acc.completed += Number(item.completed || 0);
            return acc;
        }, { assigned: 0, completed: 0 });
        totals.productivity = totals.assigned > 0 ? Math.round((totals.completed / totals.assigned) * 100) : 0;
        return totals;
    }

    function memberTaskSummary(member) {
        const breakdown = normalizeMemberTasks(member);
        return taskTemplates(member.role || 'marketing').map(task => {
            const current = breakdown[task.id] || { assigned: 0, completed: 0 };
            const assigned = Number(current.assigned || 0);
            const completed = Number(current.completed || 0);
            const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
            return `
                <div class="bg-vx-card rounded-xl border border-vx-border p-3">
                    <div class="flex items-start justify-between gap-3">
                        <p class="text-xs text-vx-muted">${safeText(task.label)}</p>
                        <span class="text-xs font-bold text-vx-pink">${pct}%</span>
                    </div>
                    <p class="font-display text-sm font-bold mt-2">${completed}/${assigned} concluidas</p>
                </div>
            `;
        }).join('');
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
        const teamMembers = Array.isArray(context.teamMembers) ? context.teamMembers : [];
        const summary = context.summary || null;
        const pageInfo = context.pageInfo || { number: 0, totalPages: 1, totalElements: teamMembers.length };
        const selectedRole = document.getElementById('team-role-filter')?.value || '';
        const visibleMembers = selectedRole ? teamMembers.filter(member => member.role === selectedRole) : teamMembers;
        const total = teamMembers.length;
        const tasks = teamMembers.reduce((sum, member) => sum + memberTaskStats(member).assigned, 0);
        const completed = teamMembers.reduce((sum, member) => sum + memberTaskStats(member).completed, 0);
        const avgProductivity = tasks > 0 ? Math.round((completed / tasks) * 100) : 0;

        setText('team-total', summary?.total ?? total);
        setText('team-tasks', summary?.tasks ?? tasks);
        setText('team-completed', summary?.completed ?? completed);
        setText('team-productivity', `${summary?.productivity ?? avgProductivity}%`);
        setText('team-role-marketing', summary?.marketing ?? teamMembers.filter(member => member.role === 'marketing').length);
        setText('team-role-trafego', summary?.traffic ?? teamMembers.filter(member => member.role === 'trafego').length);
        setText('team-role-sdr', summary?.sdr ?? teamMembers.filter(member => member.role === 'sdr').length);
        setText('team-role-closer', summary?.closer ?? teamMembers.filter(member => member.role === 'closer').length);
        setText('team-role-dev', summary?.developer ?? teamMembers.filter(member => member.role === 'dev').length);

        const filterLabel = document.getElementById('team-filter-label');
        if (filterLabel) {
            filterLabel.textContent = selectedRole
                ? `Visualizando: ${roleLabel(selectedRole)} (${visibleMembers.length} membro${visibleMembers.length === 1 ? '' : 's'})`
                : `Todos os membros da equipe (${teamMembers.length})`;
        }

        document.querySelectorAll('.team-role-card').forEach(card => {
            card.classList.remove('border-vx-purple', 'bg-vx-purple/10');
            if (selectedRole && card.dataset.role === selectedRole) {
                card.classList.add('border-vx-purple', 'bg-vx-purple/10');
            }
        });

        renderList({ teamMembers, visibleMembers, pageInfo });
    }

    function renderList({ teamMembers, visibleMembers, pageInfo }) {
        const list = document.getElementById('team-list');
        if (!list) return;
        const canManageTeam = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');

        if (!teamMembers.length) {
            list.innerHTML = '<div class="empty-state xl:col-span-2"><h4>Nenhum membro cadastrado</h4><p>Cadastre a equipe para acompanhar tarefas, produtividade e responsabilidades.</p></div>';
            renderPagination('team-pagination', pageInfo, 'changeTeamPage', 'membro');
            return;
        }

        if (!visibleMembers.length) {
            list.innerHTML = '<div class="empty-state xl:col-span-2"><h4>Nenhum membro encontrado</h4><p>Ajuste os filtros para visualizar outra area da equipe.</p></div>';
            renderPagination('team-pagination', pageInfo, 'changeTeamPage', 'membro');
            return;
        }

        list.innerHTML = visibleMembers.map(member => {
            const stats = memberTaskStats(member);
            const performance = Number(member.performance || stats.productivity || 0);
            return `
                <article class="bg-vx-darker rounded-2xl border border-vx-border p-5">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h4 class="font-display text-xl font-bold">${safeText(member.name)}</h4>
                            <p class="text-vx-muted text-sm">${safeText(roleLabel(member.role))}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs bg-vx-purple/20 text-vx-pink">${performance}% performance</span>
                    </div>
                    <div class="grid grid-cols-3 gap-3 mb-4">
                        <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-vx-muted text-xs">Tarefas</p><p class="font-display text-xl font-bold">${stats.assigned}</p></div>
                        <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-vx-muted text-xs">Concluidas</p><p class="font-display text-xl font-bold text-green-400">${stats.completed}</p></div>
                        <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-vx-muted text-xs">Produtividade</p><p class="font-display text-xl font-bold">${stats.productivity}%</p></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">${memberTaskSummary(member)}</div>
                    <div class="h-2 bg-vx-border rounded-full overflow-hidden mb-4"><div class="h-full progress-bar rounded-full" style="width:${Math.min(performance, 100)}%"></div></div>
                    ${member.notes ? `<p class="text-vx-muted text-sm mb-4">${safeText(member.notes)}</p>` : ''}
                    ${canManageTeam ? `<div class="flex gap-2">
                        <button onclick="openTeamMemberModal(decodeURIComponent('${safeId(member.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                        <button onclick="deleteTeamMember(decodeURIComponent('${safeId(member.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                    </div>` : ''}
                </article>
            `;
        }).join('');
        renderPagination('team-pagination', pageInfo, 'changeTeamPage', 'membro');
    }

    window.VXTeamPage = {
        render,
        memberTaskStats,
        normalizeMemberTasks
    };
})();
